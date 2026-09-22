import React, { useState, useEffect, useRef } from 'react';
import { Printer, X, Download, Upload, Check, AlertCircle, FileText, ExternalLink } from 'lucide-react';
import jsPDF from 'jspdf';
import { renderElementToCanvas, triggerPdfDownload } from '../utils/pdfExport';
import { UPL_LOGO_BASE64 } from '../assets/logoBase64';

interface SurveyItem {
  name: string;
  qty?: string | number;
  value?: string | number;
  remark?: string;
}

interface SurveyData {
  id: string | number;
  surveyNo?: string | number;
  partyName?: string;
  mobileNo?: string;
  fromCity?: string;
  fromArea?: string;
  toCity?: string;
  toArea?: string;
  surveyDate?: string;
  items?: SurveyItem[];
}

interface SurveyPdfModalProps {
  survey: SurveyData | null;
  onClose: () => void;
  globalSignature?: { text: string; image?: string };
  companyLogo?: string;
  companyProfile?: any;
}

export const SurveyPdfModal: React.FC<SurveyPdfModalProps> = ({ survey, onClose, globalSignature, companyLogo, companyProfile }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isOpeningInTab, setIsOpeningInTab] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  
  // Authorized Signature options: customizable directly on the signature box
  const [authSignMode, setAuthSignMode] = useState<'default' | 'text' | 'image'>('default');
  const [authSignName, setAuthSignName] = useState('VIJAY');
  const [authSignTitle, setAuthSignTitle] = useState('Authorized Signature');
  const [authSignImage, setAuthSignImage] = useState<string | null>(null);
  const [isEditingSign, setIsEditingSign] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!survey) return null;

  const totalItemsCount = survey.items?.reduce(
    (sum, it) => sum + (parseInt(String(it.qty)) || (it.name ? 1 : 0)),
    0
  ) || (survey.items?.length || 0);

  const totalValue = survey.items?.reduce(
    (sum, it) => sum + (parseFloat(String(it.value)) || 0),
    0
  ) || 0;

  const itemsList = survey.items && survey.items.length > 0
    ? survey.items
    : [{ name: '', qty: '', value: '', remark: '' }];

  const handlePrint = () => {
    setIsEditingSign(false);
    window.print();
  };

  /**
   * Robust direct PDF generation and device download.
   * Uses html2canvas + jsPDF with base64 images so canvas is never tainted.
   */
  const createPdfDocument = async () => {
    setIsEditingSign(false);
    const element = document.getElementById('printable-survey-pdf');
    if (!element) {
      throw new Error('Survey printable element not found');
    }

    const filename = `UrbanPro_Survey_${survey.surveyNo || survey.id}_${(survey.partyName || 'Customer').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;

    // Render the survey sheet to a high-resolution canvas
    const canvas = await renderElementToCanvas(element);

    const imgData = canvas.toDataURL('image/jpeg', 0.98);

    // Create A4 PDF in portrait (210mm x 297mm)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const margin = 5; // 5mm margin
    const printableWidth = pdfWidth - margin * 2;
    const imgHeight = (canvas.height * printableWidth) / canvas.width;

    // Add survey canvas image centered with margins
    pdf.addImage(imgData, 'JPEG', margin, margin, printableWidth, Math.min(imgHeight, pdfHeight - margin * 2));

    const blob = pdf.output('blob');
    const url = URL.createObjectURL(blob);
    return { pdf, blob, url, filename };
  };

  const handleDownloadPdf = async () => {
    try {
      setIsDownloading(true);
      setDownloadSuccess(false);

      const result = await createPdfDocument();
      if (!result) return;

      const { pdf, url, filename } = result;
      setPdfBlobUrl(url);

      triggerPdfDownload(pdf, filename);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 7000);
    } catch (err) {
      console.error('PDF generation error, fallback to print:', err);
      window.print();
    } finally {
      setIsDownloading(false);
    }
  };

  const handleOpenInNewTab = async () => {
    if (pdfBlobUrl) {
      window.open(pdfBlobUrl, '_blank');
      return;
    }
    try {
      setIsOpeningInTab(true);
      const result = await createPdfDocument();
      if (result) {
        setPdfBlobUrl(result.url);
        window.open(result.url, '_blank');
      }
    } catch (err) {
      console.error('Open in tab failed:', err);
      window.print();
    } finally {
      setIsOpeningInTab(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAuthSignImage(event.target.result as string);
          setAuthSignMode('image');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-slate-900/70 z-50 flex items-center justify-center p-2 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl max-w-4xl w-full my-auto flex flex-col max-h-[96vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Control Bar (Pure: Survey Info + Download Button + Print + Close) */}
        <div className="p-3.5 border-b border-slate-200 flex flex-wrap justify-between items-center bg-slate-50 print:hidden shrink-0 gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <h2 className="font-bold text-slate-800 text-sm sm:text-base">Survey PDF Preview</h2>
            <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-medium">
              #{survey.surveyNo || survey.id}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Automatic Download to Device Button */}
            <button 
              onClick={handleDownloadPdf}
              disabled={isDownloading || isOpeningInTab}
              className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer ${
                downloadSuccess 
                  ? 'bg-emerald-700 text-white' 
                  : 'bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white'
              }`}
              title="Save PDF file directly to device downloads"
            >
              {downloadSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-200" />
                  <span>Downloaded!</span>
                </>
              ) : isDownloading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" /> 
                  <span>Download PDF</span>
                </>
              )}
            </button>

            {/* Open in New Tab Button */}
            <button 
              onClick={handleOpenInNewTab}
              disabled={isDownloading || isOpeningInTab}
              className="bg-slate-700 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
              title="Open PDF directly in a new browser tab for viewing or printing"
            >
              {isOpeningInTab ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="hidden sm:inline">Opening...</span>
                </>
              ) : (
                <>
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Open in Tab</span>
                </>
              )}
            </button>

            {/* Print Button */}
            <button 
              onClick={handlePrint}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
              title="Print document"
            >
              <Printer className="w-4 h-4" /> <span className="hidden sm:inline">Print</span>
            </button>

            {/* Close */}
            <button 
              onClick={onClose}
              className="text-slate-500 hover:text-slate-800 p-1.5 bg-slate-200 hover:bg-slate-300 rounded-full transition-colors cursor-pointer ml-1"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Post-Download Helper Banner */}
        {downloadSuccess && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2 flex flex-wrap items-center justify-between text-xs text-emerald-800 shrink-0">
            <div className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Survey PDF downloaded to your device! If your browser blocked the download, click here:</span>
            </div>
            {pdfBlobUrl && (
              <a 
                href={pdfBlobUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="font-bold underline text-emerald-900 hover:text-emerald-700 flex items-center gap-1 mt-1 sm:mt-0"
              >
                <span>Open / Save PDF in New Window</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        )}

        {/* Modal Body / Scrollable Area */}
        <div className="flex-1 overflow-y-auto bg-slate-100 flex justify-center p-2 sm:p-6 print:p-0 print:bg-white print:overflow-visible">
          
          {/* PDF Container - Exact Match to Official UrbanPro Format */}
          <div 
            id="printable-survey-pdf"
            className="bg-white w-full max-w-[794px] shadow-lg border-2 border-[#f87171] text-[12px] text-black font-sans box-border relative mx-auto my-auto print:border print:border-[#f87171] print:shadow-none print:w-full print:max-w-none"
          >
            {/* Top PAN Number Bar */}
            <div className="bg-[#ffb3b3] text-center font-bold py-1 border-b border-[#f87171] text-[11px] tracking-wide text-black">
              PAN No.: AKMPV0774C
            </div>

            {/* Company Logo & Address Box */}
            <div className="flex border-b border-[#f87171] min-h-[96px]">
              {/* Logo Container */}
              <div className="w-[28%] border-r border-[#f87171] flex items-center justify-center p-2 bg-white">
                <img 
                  src={companyLogo || companyProfile?.logo || UPL_LOGO_BASE64} 
                  alt="UrbanPro Packers & Logistics Logo" 
                  className="max-h-20 w-auto object-contain" 
                />
              </div>

              {/* Company Details */}
              <div className="w-[72%] p-2 text-center flex flex-col justify-center items-center bg-white">
                <div className="mb-1" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
                  <h1 className="text-[24px] sm:text-[28px] font-black tracking-tight leading-none">
                    <span style={{ color: '#1e3a8a' }}>Urban</span><span style={{ color: '#dc2626' }}>Pro</span>
                  </h1>
                  <h2 className="text-[13px] sm:text-[15px] font-extrabold tracking-wider uppercase mt-0.5" style={{ color: '#1e3a8a' }}>
                    Packers & Logistics
                  </h2>
                </div>
                <p className="text-[11px] sm:text-[11.5px] leading-tight text-black font-medium">
                  <strong>Address:</strong> Plot No 1491, Balintha Canal Road, Near Lenskart, Hanspal, Bhubaneswar, Odisha -752101
                </p>
                <p className="text-[11px] sm:text-[11.5px] leading-tight text-black font-medium mt-0.5">
                  <strong>Mobile No.:</strong> 8093017400
                </p>
                <p className="text-[11px] sm:text-[11.5px] leading-tight text-black font-medium mt-0.5">
                  <strong>Email:</strong> urbanpro403@gmail.com
                </p>
              </div>
            </div>

            {/* Survey List Title Bar */}
            <div className="bg-[#bae6fd] text-center font-bold py-1.5 border-b border-[#f87171] text-[12px] text-slate-900 tracking-wide">
              Survey List
            </div>

            {/* Customer Information (Underlined Format) */}
            <div className="p-3 border-b border-[#f87171] space-y-2.5 bg-white text-[11.5px]">
              {/* Row 1: Name and Survey No. */}
              <div className="flex justify-between items-baseline gap-6">
                <div className="flex-1 flex items-baseline">
                  <span className="font-semibold text-black shrink-0">Name:</span>
                  <span className="flex-1 border-b border-black font-semibold text-black px-2 pb-0.5 ml-1">
                    {survey.partyName || ''}
                  </span>
                </div>
                <div className="w-52 sm:w-64 flex items-baseline shrink-0">
                  <span className="font-semibold text-black shrink-0">Survey No.</span>
                  <span className="flex-1 border-b border-black font-semibold text-black text-center px-2 pb-0.5 ml-1">
                    {survey.surveyNo || survey.id}
                  </span>
                </div>
              </div>

              {/* Row 2: Mobile, Move From, Move To, Survey Date */}
              <div className="flex items-baseline justify-between gap-3 sm:gap-4 flex-wrap sm:flex-nowrap">
                <div className="flex items-baseline flex-1 min-w-[140px]">
                  <span className="font-semibold text-black shrink-0">Mobile:</span>
                  <span className="flex-1 border-b border-black font-semibold text-black px-1 pb-0.5 ml-1">
                    {survey.mobileNo || ''}
                  </span>
                </div>
                <div className="flex items-baseline flex-1 min-w-[140px]">
                  <span className="font-semibold text-black shrink-0 whitespace-nowrap">Move From:</span>
                  <span className="flex-1 border-b border-black font-semibold text-black px-1 pb-0.5 ml-1">
                    {survey.fromCity || survey.fromArea || ''}
                  </span>
                </div>
                <div className="flex items-baseline flex-1 min-w-[140px]">
                  <span className="font-semibold text-black shrink-0 whitespace-nowrap">Move To:</span>
                  <span className="flex-1 border-b border-black font-semibold text-black px-1 pb-0.5 ml-1">
                    {survey.toCity || survey.toArea || ''}
                  </span>
                </div>
                <div className="flex items-baseline flex-1 min-w-[150px]">
                  <span className="font-semibold text-black shrink-0 whitespace-nowrap">Survey Date</span>
                  <span className="flex-1 border-b border-black font-semibold text-black px-1 pb-0.5 ml-1 text-center">
                    {survey.surveyDate || ''}
                  </span>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="w-full bg-white">
              {/* Table Header */}
              <div className="flex bg-[#ffb3b3] font-semibold text-[11px] text-center border-b border-[#f87171] py-1 text-black">
                <div className="w-12 border-r border-[#f87171] flex items-center justify-center shrink-0">Sr.</div>
                <div className="flex-1 border-r border-[#f87171] flex items-center justify-center">Item Name</div>
                <div className="w-24 sm:w-28 border-r border-[#f87171] flex items-center justify-center shrink-0">Quantity</div>
                <div className="w-28 sm:w-32 border-r border-[#f87171] flex items-center justify-center shrink-0">Value (in Rs.)</div>
                <div className="w-36 sm:w-44 flex items-center justify-center shrink-0">Remark</div>
              </div>

              {/* Table Rows */}
              <div className="min-h-[140px] flex flex-col">
                {itemsList.map((item, idx) => (
                  <div 
                    key={idx} 
                    className="flex text-[11.5px] text-center border-b border-[#fca5a5] py-1 font-medium text-black min-h-[26px]"
                  >
                    <div className="w-12 border-r border-[#f87171] flex items-center justify-center shrink-0">
                      {item.name ? idx + 1 : ''}
                    </div>
                    <div className="flex-1 border-r border-[#f87171] text-left px-3 flex items-center">
                      {item.name || ''}
                    </div>
                    <div className="w-24 sm:w-28 border-r border-[#f87171] flex items-center justify-center shrink-0">
                      {item.name ? (item.qty || 1) : ''}
                    </div>
                    <div className="w-28 sm:w-32 border-r border-[#f87171] flex items-center justify-center shrink-0">
                      {item.name ? (item.value || '0') : ''}
                    </div>
                    <div className="w-36 sm:w-44 px-2 text-left flex items-center text-[10.5px] shrink-0">
                      {item.remark || ''}
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary Row (Total & Value in pink blocks matching original) */}
              <div className="flex text-[11.5px] font-bold border-b border-t border-[#f87171] text-center bg-white text-black">
                <div className="w-12 border-r border-[#f87171] py-1 shrink-0"></div>
                <div className="flex-1 border-r border-[#f87171] py-1"></div>
                <div className="w-24 sm:w-28 border-r border-[#f87171] bg-[#ffb3b3] py-1 flex items-center justify-center shrink-0">
                  Total: {totalItemsCount}
                </div>
                <div className="w-28 sm:w-32 border-r border-[#f87171] bg-[#ffb3b3] py-1 flex items-center justify-center shrink-0">
                  Value: {totalValue}
                </div>
                <div className="w-36 sm:w-44 py-1 shrink-0"></div>
              </div>
            </div>

            {/* Signatures Box */}
            <div className="flex border-b border-[#f87171] min-h-[145px] bg-white">
              {/* Left Signature: UrbanPro */}
              <div className="w-1/2 border-r border-[#f87171] p-3 flex flex-col justify-between items-center text-center relative group">
                <div className="font-bold text-[12px] tracking-wide">
                  For <span className="text-[#1e3a8a]">Urban</span><span className="text-[#dc2626]">Pro</span> <span className="text-[#1e3a8a]">Packers & Logistics</span>
                </div>

                {/* Inline Signature Display & Interactive Click-to-Choose */}
                <div 
                  className="flex flex-col items-center justify-center my-auto py-1 min-h-[60px] cursor-pointer relative"
                  onClick={() => setIsEditingSign(!isEditingSign)}
                  title="Click to change signature / upload signature"
                >
                  {globalSignature?.image ? (
                    <img 
                      src={globalSignature.image} 
                      alt="Authorized Signature Stamp" 
                      className="max-h-14 max-w-[140px] object-contain"
                    />
                  ) : authSignMode === 'image' && authSignImage ? (
                    <img 
                      src={authSignImage} 
                      alt="Authorized Signature" 
                      className="max-h-14 max-w-[140px] object-contain"
                    />
                  ) : authSignMode === 'text' ? (
                    <div className="flex flex-col items-center">
                      <span 
                        className="text-[#1d4ed8] text-2xl font-bold tracking-wide italic"
                        style={{ fontFamily: "'Brush Script MT', 'Dancing Script', 'Caveat', cursive, serif" }}
                      >
                        {authSignName || 'Authorized'}
                      </span>
                    </div>
                  ) : (
                    /* Default Authentic Signature Stamp matching the uploaded sample */
                    <div className="flex flex-col items-center justify-center">
                      <svg 
                        className="w-14 h-9 text-[#2563eb]" 
                        viewBox="0 0 100 60" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2.5" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      >
                        <path d="M38 48 C30 35, 24 15, 36 10 C46 6, 52 24, 44 45 C40 54, 34 58, 30 59" />
                        <path d="M46 26 C54 18, 66 14, 62 34 C58 48, 50 54, 46 58" />
                        <path d="M52 38 C60 36, 70 38, 68 50" />
                      </svg>
                      <span className="font-bold text-[11px] text-black tracking-wider mt-0.5">
                        {authSignName || 'VIJAY'}
                      </span>
                    </div>
                  )}

                  {/* Gentle hover hint for editing directly on the signature area (hidden during print) */}
                  <span className="text-[9.5px] text-blue-600 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity mt-1 print:hidden">
                    Click to change signature
                  </span>
                </div>

                {/* Popover / Drawer to change signature right here on the signature block */}
                {isEditingSign && (
                  <div 
                    className="absolute top-10 left-2 right-2 bg-white rounded-lg shadow-xl border border-slate-300 p-3 z-30 text-left print:hidden"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex justify-between items-center pb-2 mb-2 border-b border-slate-100">
                      <span className="font-bold text-slate-800 text-[11px]">Choose Authorized Signature</span>
                      <button 
                        onClick={() => setIsEditingSign(false)}
                        className="text-slate-400 hover:text-slate-700 text-xs p-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Mode Buttons */}
                    <div className="flex gap-1.5 mb-2">
                      <button
                        onClick={() => setAuthSignMode('default')}
                        className={`text-[10px] px-2 py-1 rounded font-medium flex-1 cursor-pointer ${authSignMode === 'default' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'}`}
                      >
                        Stamp (VIJAY)
                      </button>
                      <button
                        onClick={() => setAuthSignMode('text')}
                        className={`text-[10px] px-2 py-1 rounded font-medium flex-1 cursor-pointer ${authSignMode === 'text' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'}`}
                      >
                        Type Name
                      </button>
                      <button
                        onClick={() => {
                          setAuthSignMode('image');
                          fileInputRef.current?.click();
                        }}
                        className={`text-[10px] px-2 py-1 rounded font-medium flex-1 cursor-pointer flex items-center justify-center gap-1 ${authSignMode === 'image' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'}`}
                      >
                        <Upload className="w-3 h-3" /> Upload
                      </button>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                    </div>

                    {authSignMode === 'text' && (
                      <div className="space-y-1.5 mb-2">
                        <div>
                          <label className="text-[10px] text-slate-600 font-semibold block">Signatory Name:</label>
                          <input 
                            type="text" 
                            value={authSignName} 
                            onChange={(e) => setAuthSignName(e.target.value)}
                            placeholder="e.g. VIJAY / Tapaswini"
                            className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-slate-800 font-medium text-[11px] focus:ring-1 focus:ring-blue-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-600 font-semibold block">Designation Label:</label>
                          <input 
                            type="text" 
                            value={authSignTitle} 
                            onChange={(e) => setAuthSignTitle(e.target.value)}
                            placeholder="Authorized Signature"
                            className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-slate-800 font-medium text-[11px] focus:ring-1 focus:ring-blue-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    )}

                    {authSignMode === 'image' && authSignImage && (
                      <div className="flex items-center justify-between py-1 px-2 bg-emerald-50 border border-emerald-200 rounded mb-2 text-[10.5px]">
                        <span className="text-emerald-700 font-semibold flex items-center gap-1">
                          <Check className="w-3 h-3" /> Image uploaded
                        </span>
                        <button 
                          onClick={() => fileInputRef.current?.click()}
                          className="text-blue-600 font-medium hover:underline text-[10px]"
                        >
                          Replace
                        </button>
                      </div>
                    )}

                    <button
                      onClick={() => setIsEditingSign(false)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white text-[10.5px] font-semibold py-1 rounded cursor-pointer"
                    >
                      Done
                    </button>
                  </div>
                )}

                <div className="text-[#3b82f6] font-bold text-[12px] tracking-wide">
                  {authSignTitle || 'Authorized Signature'}
                </div>
              </div>

              {/* Right Signature: Receiver */}
              <div className="w-1/2 p-3 flex flex-col justify-between">
                <div className="text-[11px] text-slate-800 text-left leading-tight">
                  Agree with Terms & Conditions as Overleaf Signature Receiver's
                </div>
                <div className="flex-1 min-h-[60px]"></div>
              </div>
            </div>

            {/* Confirmation Box (Pink Background with Red Text) */}
            <div className="p-2 border-b border-[#f87171] bg-[#ffb3b3] text-[10.5px] text-[#dc2626] text-center font-medium leading-tight">
              We have verified and confirmed all items listed as 01-{Math.max(1, survey.items?.length || 1)}, with a total count of {totalItemsCount || 1}. This represents a true and comprehensive inventory of the presented goods, acknowledging that their condition may vary.
            </div>

            {/* Prohibition & Valuable Items Warning Note */}
            <div className="p-2 border-b border-[#f87171] text-[10.5px] text-[#b91c1c] leading-tight bg-white">
              <strong>Note:</strong> Please keep your Cash/Jewellery and other valuable items in your Custody/Lock. Carrying Liquor, Gas Cylinder, Acid of any type of Liquids (like Ghee Tin, Oil etc.) is totally prohibited.
            </div>

            {/* Bottom Customer Care Support Bar */}
            <div className="bg-[#ffb3b3] text-center font-bold py-1 text-[11.5px] text-[#991b1b] tracking-wide">
              24x7 Customer Care Support <span className="text-red-700 font-extrabold">8093017400</span>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
