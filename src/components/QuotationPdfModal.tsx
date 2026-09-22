import React, { useState, useEffect, useRef } from 'react';
import { Printer, X, Download, Upload, Check, ExternalLink } from 'lucide-react';
import jsPDF from 'jspdf';
import { renderElementToCanvas, triggerPdfDownload } from '../utils/pdfExport';
import { UPL_LOGO_BASE64 } from '../assets/logoBase64';

export interface QuotationData {
  id: string | number;
  quotationNo: string | number;
  quotationDate: string;
  partyName: string;
  mobileNo: string;
  email?: string;
  packingDate?: string;
  deliveryDate?: string;
  moveType?: string; // e.g. "Part Load, Domestic Shifting"
  fromCity: string;
  fromState?: string;
  fromCountry?: string;
  fromArea?: string;
  fromPincode?: string;
  fromFloor?: string;
  fromLift?: string;
  toCity: string;
  toState?: string;
  toCountry?: string;
  toArea?: string;
  toPincode?: string;
  toFloor?: string;
  toLift?: string;
  // Charges
  transportCharges?: number | string;
  packingCharges?: string; // "Included" or amount
  unpackingCharges?: string;
  loadingCharges?: string;
  unloadingCharges?: string;
  dismantlingCharges?: string;
  octroiCharges?: string;
  carCharges?: string;
  bikeCharges?: string;
  statCharges?: string;
  serviceCharge?: number | string;
  subTotal?: number | string;
  insurancePercent?: string;
  insuranceCharge?: string;
  gstType?: string;
  gstPercent?: string;
  gstCharge?: string;
  grandTotal: number | string;
  payableInWords?: string;
  advancePaid?: string;
  status?: string;
  easyAccess?: string;
  balconyItems?: string;
  extraInfo?: string;
}

interface QuotationPdfModalProps {
  quotation: QuotationData | null;
  onClose: () => void;
  globalSignature?: { text: string; image?: string };
  companyLogo?: string;
  companyProfile?: any;
}

export function numberToIndianWords(num: number): string {
  if (!num || isNaN(num)) return '';
  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const inWords = (n: number): string => {
    let str = '';
    if (n >= 10000000) {
      str += inWords(Math.floor(n / 10000000)) + ' Crore ';
      n %= 10000000;
    }
    if (n >= 100000) {
      str += inWords(Math.floor(n / 100000)) + ' Lakh ';
      n %= 100000;
    }
    if (n >= 1000) {
      str += inWords(Math.floor(n / 1000)) + ' Thousand ';
      n %= 1000;
    }
    if (n >= 100) {
      str += inWords(Math.floor(n / 100)) + ' Hundred ';
      n %= 100;
    }
    if (n > 0) {
      if (str !== '') str += 'and ';
      if (n < 20) {
        str += a[n] + ' ';
      } else {
        str += b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] + ' ' : ' ');
      }
    }
    return str.trim();
  };

  return inWords(num);
}

export const QuotationPdfModal: React.FC<QuotationPdfModalProps> = ({ 
  quotation, 
  onClose, 
  globalSignature,
  companyLogo,
  companyProfile 
}) => {
  const [activePage, setActivePage] = useState<'both' | 'page1' | 'page2'>('both');
  const [isDownloading, setIsDownloading] = useState(false);
  const [isOpeningInTab, setIsOpeningInTab] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);

  // Authorized Signature state
  const [authSignMode, setAuthSignMode] = useState<'default' | 'text' | 'image'>('default');
  const [authSignName, setAuthSignName] = useState('VIJAY');
  const [authSignTitle, setAuthSignTitle] = useState('Authorized Signature');
  const [authSignImage, setAuthSignImage] = useState<string | null>(null);
  const [isEditingSign, setIsEditingSign] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!quotation) return null;

  const totalNumeric = parseFloat(String(quotation.grandTotal).replace(/[^0-9.]/g, '')) || 38450;
  const wordsAmount = quotation.payableInWords || numberToIndianWords(totalNumeric);

  const handlePrint = () => {
    setIsEditingSign(false);
    window.print();
  };

  /**
   * Generates the PDF document reliably.
   * Handles both single page and 2-page documents, using base64 images so canvas is never tainted.
   */
  const createPdfDocument = async () => {
    setIsEditingSign(false);
    const p1 = document.getElementById('quotation-page-1');
    const p2 = document.getElementById('quotation-page-2');
    if (!p1 && !p2) {
      throw new Error('No printable quotation page found in DOM');
    }

    const filename = `UrbanPro_Quotation_${quotation.quotationNo || quotation.id}_${(quotation.partyName || 'Customer').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const margin = 5;
    const printableWidth = pdfWidth - margin * 2;
    let pagesAdded = 0;

    // Render Page 1 if present
    if (p1) {
      const canvas1 = await renderElementToCanvas(p1);
      const img1 = canvas1.toDataURL('image/jpeg', 0.98);
      const img1Height = (canvas1.height * printableWidth) / canvas1.width;
      pdf.addImage(img1, 'JPEG', margin, margin, printableWidth, Math.min(img1Height, pdfHeight - margin * 2));
      pagesAdded++;
    }

    // Render Page 2 if present
    if (p2) {
      if (pagesAdded > 0) {
        pdf.addPage();
      }
      const canvas2 = await renderElementToCanvas(p2);
      const img2 = canvas2.toDataURL('image/jpeg', 0.98);
      const img2Height = (canvas2.height * printableWidth) / canvas2.width;
      pdf.addImage(img2, 'JPEG', margin, margin, printableWidth, Math.min(img2Height, pdfHeight - margin * 2));
    }

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
      className="fixed inset-0 bg-slate-900/75 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl max-w-4xl w-full my-auto flex flex-col max-h-[96vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Action Bar */}
        <div className="p-3.5 border-b border-slate-200 flex flex-wrap justify-between items-center bg-slate-50 print:hidden shrink-0 gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <h2 className="font-bold text-slate-800 text-sm sm:text-base">Quotation PDF Preview</h2>
            <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-medium">
              #{quotation.quotationNo || quotation.id}
            </span>
          </div>

          {/* Page switchers */}
          <div className="flex items-center bg-slate-200 p-0.5 rounded-lg text-xs font-semibold text-slate-600">
            <button
              onClick={() => setActivePage('both')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${activePage === 'both' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'}`}
            >
              All (2 Pages)
            </button>
            <button
              onClick={() => setActivePage('page1')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${activePage === 'page1' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'}`}
            >
              Page 1
            </button>
            <button
              onClick={() => setActivePage('page2')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${activePage === 'page2' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'}`}
            >
              Page 2 (Terms)
            </button>
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
              title="Download PDF file directly to your device"
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
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
              title="Print document"
            >
              <Printer className="w-4 h-4" /> <span className="hidden sm:inline">Print</span>
            </button>

            {/* Close Button */}
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
              <span>PDF downloaded to your device! If your browser blocked the download, click here:</span>
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

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto bg-slate-200/80 p-2 sm:p-6 space-y-6 print:p-0 print:space-y-0 print:bg-white">
          
          {/* ================= PAGE 1 ================= */}
          {(activePage === 'both' || activePage === 'page1') && (
            <div 
              id="quotation-page-1"
              className="bg-white w-full max-w-[794px] shadow-lg border-2 border-[#f87171] text-[11px] text-black font-sans box-border relative mx-auto print:border print:border-[#f87171] print:shadow-none print:w-full print:max-w-none print:break-after-page"
            >
              {/* Top PAN Number Bar */}
              <div className="bg-[#ffb3b3] text-center font-bold py-1 border-b border-[#f87171] text-[11px] tracking-wide text-black">
                PAN No.: AKMPV0774C
              </div>

              {/* Company Header */}
              <div className="flex border-b border-[#f87171] min-h-[96px]">
                <div className="w-[28%] border-r border-[#f87171] flex items-center justify-center p-2 bg-white">
                  <img 
                    src={companyLogo || companyProfile?.logo || UPL_LOGO_BASE64} 
                    alt="UrbanPro Packers & Logistics Logo" 
                    className="max-h-20 w-auto object-contain" 
                  />
                </div>
                <div className="w-[72%] p-2 text-center flex flex-col justify-center items-center bg-white">
                  <div className="mb-1" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
                    <h1 className="text-[24px] sm:text-[28px] font-black tracking-tight leading-none">
                      <span style={{ color: '#1e3a8a' }}>Urban</span><span style={{ color: '#dc2626' }}>Pro</span>
                    </h1>
                    <h2 className="text-[13px] sm:text-[15px] font-extrabold tracking-wider uppercase mt-0.5" style={{ color: '#1e3a8a' }}>
                      Packers & Logistics
                    </h2>
                  </div>
                  <p className="text-[11px] leading-tight text-black font-medium">
                    <strong>Address:</strong> Plot No 1491, Balintha Canal Road, Near Lenskart, Hanspal, Bhubaneswar, Odisha -752101
                  </p>
                  <p className="text-[11px] leading-tight text-black font-medium mt-0.5">
                    <strong>Mobile No.:</strong> 8093017400
                  </p>
                  <p className="text-[11px] leading-tight text-black font-medium mt-0.5">
                    <strong>Email:</strong> urbanpro403@gmail.com
                  </p>
                </div>
              </div>

              {/* Saffron Quotation Bar with 5 Blocks */}
              <div className="grid grid-cols-5 border-b border-[#f87171] bg-[#ff9933] text-center text-[11px] font-bold text-black py-1.5 shadow-xs">
                <div className="border-r border-[#f87171] px-1 flex items-center justify-center font-black tracking-wide text-black text-[12px]">
                  Quotation
                </div>
                <div className="border-r border-[#f87171] px-1 flex flex-col items-center justify-center">
                  <span className="font-semibold text-[10.5px]">Quotation No:</span>
                  <span className="font-black text-black">{quotation.quotationNo || quotation.id}</span>
                </div>
                <div className="border-r border-[#f87171] px-1 flex flex-col items-center justify-center">
                  <span className="font-semibold text-[10.5px]">Quotation Date:</span>
                  <span className="font-black text-black">{quotation.quotationDate || ''}</span>
                </div>
                <div className="border-r border-[#f87171] px-1 flex items-center justify-center text-[10.5px]">
                  Packing Date: {quotation.packingDate || ''}
                </div>
                <div className="px-1 flex items-center justify-center text-[10.5px]">
                  Delivery Date: {quotation.deliveryDate || ''}
                </div>
              </div>

              {/* Greeting Note */}
              <div className="p-2 border-b border-[#f87171] text-[10.5px] text-black font-medium leading-tight bg-white">
                We thank you for your valuable enquiry for packing and shifting of your moving items from{' '}
                <span className="font-bold underline">{quotation.fromCity || 'Origin'}</span> to{' '}
                <span className="font-bold underline">{quotation.toCity || 'Destination'}</span> we are pleased to quote the rate for the same as under:
              </div>

              {/* Main 3-Column Comparison Table */}
              <div className="w-full border-b border-[#f87171]">
                {/* Header */}
                <div className="grid grid-cols-12 bg-[#ffb3b3] text-center font-bold text-[11px] border-b border-[#f87171] py-1 text-black">
                  <div className="col-span-4 border-r border-[#f87171]">Relocate From</div>
                  <div className="col-span-4 border-r border-[#f87171]">Relocate To</div>
                  <div className="col-span-3 border-r border-[#f87171]">Particulars</div>
                  <div className="col-span-1">Amount</div>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-12">
                  {/* Column 1 & 2 combined with Left details */}
                  <div className="col-span-8 border-r border-[#f87171] flex flex-col justify-between">
                    
                    {/* Upper Route Details (Relocate From & To) */}
                    <div className="grid grid-cols-2 border-b border-[#f87171] text-[10.5px] p-2 leading-relaxed">
                      {/* From */}
                      <div className="border-r border-slate-200 pr-2 space-y-0.5">
                        <p><strong>City:</strong> {quotation.fromCity || ''}</p>
                        <p><strong>Country:</strong> {quotation.fromCountry || 'India'}</p>
                        <p><strong>State:</strong> {quotation.fromState || 'Odisha'}</p>
                        <p><strong>Area:</strong> {quotation.fromArea || ''}</p>
                        <p><strong>Pin Code:</strong> {quotation.fromPincode || ''}</p>
                        <p><strong>Floor:</strong> {quotation.fromFloor || 'Ground'}</p>
                        <p><strong>Lift Available:</strong> {quotation.fromLift || 'Not Required'}</p>
                      </div>
                      {/* To */}
                      <div className="pl-2 space-y-0.5">
                        <p><strong>City:</strong> {quotation.toCity || ''}</p>
                        <p><strong>Country:</strong> {quotation.toCountry || 'India'}</p>
                        <p><strong>State:</strong> {quotation.toState || 'Maharashtra'}</p>
                        <p><strong>Area:</strong> {quotation.toArea || ''}</p>
                        <p><strong>Pin Code:</strong> {quotation.toPincode || ''}</p>
                        <p><strong>Floor:</strong> {quotation.toFloor || 'Ground'}</p>
                        <p><strong>Lift Available:</strong> {quotation.toLift || 'Not Required'}</p>
                      </div>
                    </div>

                    {/* Lower Customer / Job Details */}
                    <div className="p-2 space-y-1 text-[10.5px] bg-white">
                      <p><strong>Name:</strong> {quotation.partyName || ''}</p>
                      <p><strong>Mobile:</strong> {quotation.mobileNo || ''}</p>
                      <p><strong>Email:</strong> {quotation.email || ''}</p>
                      <p><strong>Required Services:</strong> {quotation.moveType || 'Part Load, Domestic Shifting,'}</p>
                      <p className="text-[10px] text-slate-700">
                        Is there easy access for loading & unloading at Location Move From & Move To: {quotation.easyAccess || ''}
                      </p>
                      <p className="text-[10px] text-slate-700">
                        Should any items be got down through balcony etc. : {quotation.balconyItems || ''}
                      </p>
                      <p className="text-[10px] text-slate-700">
                        Service Charges : {quotation.serviceCharge ? 'Service Charge %' : 'N/A'}
                      </p>
                      <p className="text-[10px] text-slate-700">
                        Insurance charge @3% on declaration value of goods ₹ {quotation.insuranceCharge || ''}
                      </p>
                      <p className="text-[10px] text-slate-700">
                        CGST/SGST Charges 18% on billing amount
                      </p>
                    </div>

                    {/* Payable in words & advance box */}
                    <div className="border-t border-[#f87171] p-2 bg-slate-50/50 flex justify-between items-start text-[10px]">
                      <div className="w-[60%]">
                        <span className="font-semibold underline block">Payable amount in words:</span>
                        <span className="font-bold text-black capitalize">{wordsAmount || 'Thirty Eight Thousand Four Hundred and Fifty'}</span>
                      </div>
                      <div className="w-[38%] border-l border-slate-300 pl-2">
                        <span className="font-semibold underline block">Advance Paid:</span>
                        <span className="font-bold text-black">{quotation.advancePaid || '0.00'}</span>
                      </div>
                    </div>

                  </div>

                  {/* Column 3: Particulars & Amount Table */}
                  <div className="col-span-4 text-[10px]">
                    {[
                      { name: 'Transportation Charges', val: quotation.transportCharges || '38000' },
                      { name: 'Packing Charges', val: quotation.packingCharges || 'Included' },
                      { name: 'Unpacking Charges', val: quotation.unpackingCharges || 'Included' },
                      { name: 'Loading Charges', val: quotation.loadingCharges || 'Included' },
                      { name: 'Unloadig Charges', val: quotation.unloadingCharges || 'Included' },
                      { name: 'Dismantling/Assembling Charges', val: quotation.dismantlingCharges || 'N/A' },
                      { name: 'Octroi/Entry Charges', val: quotation.octroiCharges || 'N/A' },
                      { name: 'Car Transportation Charges', val: quotation.carCharges || 'N/A' },
                      { name: 'Bike Transportation Charges', val: quotation.bikeCharges || 'N/A' },
                      { name: 'Statistical/Document Charges', val: quotation.statCharges || 'N/A' },
                      { name: 'Service Charge', val: quotation.serviceCharge || '450' },
                    ].map((row, idx) => (
                      <div key={idx} className="flex border-b border-[#fca5a5] py-0.5 px-1.5">
                        <div className="flex-1 text-left">{row.name}</div>
                        <div className="w-16 text-right font-medium">{row.val}</div>
                      </div>
                    ))}

                    {/* Sub Total */}
                    <div className="flex border-b border-[#f87171] bg-[#ffb3b3] font-bold py-0.5 px-1.5 text-black">
                      <div className="flex-1 text-left">Sub Total</div>
                      <div className="w-16 text-right">₹ {quotation.subTotal || '38450'}</div>
                    </div>

                    {/* Insurance Charge */}
                    <div className="flex border-b border-[#fca5a5] py-0.5 px-1.5">
                      <div className="flex-1 text-left">Insurance Charge</div>
                      <div className="w-16 text-right">{quotation.insuranceCharge || ''}</div>
                    </div>

                    {/* CGST/SGST */}
                    <div className="flex border-b border-[#fca5a5] py-0.5 px-1.5">
                      <div className="flex-1 text-left">{quotation.gstType || 'CGST/SGST'}</div>
                      <div className="w-16 text-right font-medium">{quotation.gstCharge || 'Extra'}</div>
                    </div>

                    {/* Grand Total */}
                    <div className="flex bg-[#ffb3b3] font-black py-1 px-1.5 text-black text-[11px]">
                      <div className="flex-1 text-left">Grand Total</div>
                      <div className="w-20 text-right">₹ {quotation.grandTotal || '38450'}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Signatures & Bank Details Row (3 Columns matching exact quotation template) */}
              <div className="grid grid-cols-12 border-b border-[#f87171] min-h-[145px] bg-white">
                
                {/* Left (Col 1): Authorized Signature */}
                <div className="col-span-4 border-r border-[#f87171] p-2.5 flex flex-col justify-between items-center text-center relative group">
                  <div className="font-bold text-[11px] leading-tight">
                    For <span className="text-[#1e3a8a] font-black">Urban</span><span className="text-[#dc2626] font-black">Pro</span><br />
                    <span className="text-[#1e3a8a] font-extrabold uppercase text-[10px] tracking-wider">Packers & Logistics</span>
                  </div>

                  {/* Signature Click-to-edit */}
                  <div 
                    className="flex flex-col items-center justify-center my-auto py-1 min-h-[50px] cursor-pointer relative"
                    onClick={() => setIsEditingSign(!isEditingSign)}
                    title="Click to customize authorized signature"
                  >
                    {globalSignature?.image ? (
                      <img src={globalSignature.image} alt="Authorized Signature" className="max-h-12 max-w-[130px] object-contain" />
                    ) : authSignMode === 'image' && authSignImage ? (
                      <img src={authSignImage} alt="Authorized Signature" className="max-h-12 max-w-[120px] object-contain" />
                    ) : authSignMode === 'text' ? (
                      <span className="text-[#1d4ed8] text-lg font-bold tracking-wide italic" style={{ fontFamily: "'Brush Script MT', cursive" }}>
                        {globalSignature?.text || authSignName || 'VIJAY'}
                      </span>
                    ) : (
                      <div className="flex flex-col items-center justify-center">
                        <svg className="w-10 h-7 text-[#2563eb]" viewBox="0 0 100 60" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M38 48 C30 35, 24 15, 36 10 C46 6, 52 24, 44 45 C40 54, 34 58, 30 59" />
                          <path d="M46 26 C54 18, 66 14, 62 34 C58 48, 50 54, 46 58" />
                          <path d="M52 38 C60 36, 70 38, 68 50" />
                        </svg>
                        <span className="font-bold text-[10px] text-black tracking-wider uppercase">{globalSignature?.text || authSignName || 'VIJAY'}</span>
                      </div>
                    )}
                    <span className="text-[8px] text-blue-600 bg-blue-50 border border-blue-200 px-1 py-0.2 rounded opacity-0 group-hover:opacity-100 transition-opacity print:hidden">
                      Change signature
                    </span>
                  </div>

                  {/* Popover to customize */}
                  {isEditingSign && (
                    <div 
                      className="absolute top-8 left-1 right-1 bg-white rounded-lg shadow-xl border border-slate-300 p-2.5 z-30 text-left print:hidden"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex justify-between items-center pb-1 mb-1.5 border-b border-slate-100">
                        <span className="font-bold text-slate-800 text-[10px]">Select Signature</span>
                        <button onClick={() => setIsEditingSign(false)} className="text-slate-400 hover:text-slate-700 text-xs">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="flex gap-1 mb-2">
                        <button onClick={() => setAuthSignMode('default')} className={`text-[9px] px-1.5 py-0.5 rounded font-medium flex-1 ${authSignMode === 'default' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
                          Stamp
                        </button>
                        <button onClick={() => setAuthSignMode('text')} className={`text-[9px] px-1.5 py-0.5 rounded font-medium flex-1 ${authSignMode === 'text' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
                          Name
                        </button>
                        <button onClick={() => { setAuthSignMode('image'); fileInputRef.current?.click(); }} className={`text-[9px] px-1.5 py-0.5 rounded font-medium flex-1 flex items-center justify-center gap-0.5 ${authSignMode === 'image' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
                          <Upload className="w-2.5 h-2.5" /> Upload
                        </button>
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                      </div>
                      {authSignMode === 'text' && (
                        <div className="space-y-1 mb-1.5">
                          <input type="text" value={authSignName} onChange={(e) => setAuthSignName(e.target.value)} placeholder="Signatory Name" className="w-full bg-slate-50 border border-slate-300 rounded px-1.5 py-0.5 text-[10px]" />
                          <input type="text" value={authSignTitle} onChange={(e) => setAuthSignTitle(e.target.value)} placeholder="Designation" className="w-full bg-slate-50 border border-slate-300 rounded px-1.5 py-0.5 text-[10px]" />
                        </div>
                      )}
                      <button onClick={() => setIsEditingSign(false)} className="w-full bg-blue-600 text-white text-[10px] font-semibold py-0.5 rounded">
                        Done
                      </button>
                    </div>
                  )}

                  <div className="text-blue-700 font-bold text-[10.5px]">
                    {authSignTitle || 'Authorized Signature'}
                  </div>
                </div>

                {/* Middle (Col 2): Receiver Agreement & Signature */}
                <div className="col-span-4 border-r border-[#f87171] p-2.5 flex flex-col justify-between text-left">
                  <div className="text-[10px] sm:text-[10.5px] text-slate-900 leading-snug font-medium">
                    Agree with Terms & Conditions as Overleaf Signature Receiver's
                  </div>
                  <div className="mt-auto pt-6 border-t border-dashed border-slate-300 text-[9px] text-slate-500 text-center">
                    Receiver's Signature
                  </div>
                </div>

                {/* Right (Col 3): Bank Details (blank labels as in original quotation template) */}
                <div className="col-span-4 p-2.5 flex flex-col justify-start text-left text-[10px] sm:text-[10.5px] text-slate-900 space-y-0.5 bg-white">
                  <div className="font-bold underline text-slate-900 tracking-wide text-[11px] pb-0.5">
                    Bank Details
                  </div>
                  <p className="leading-tight">Beneficiary Name:</p>
                  <p className="leading-tight">Bank Name:</p>
                  <p className="leading-tight">Bank A/C No.:</p>
                  <p className="leading-tight">Bank IFSC Code:</p>
                  <div className="pt-1 font-bold underline text-slate-900 text-[10px]">
                    Other Payment Details
                  </div>
                </div>

              </div>

              {/* Bottom Prohibited Warning Note */}
              <div className="p-2 text-[10px] text-[#b91c1c] leading-tight bg-[#ffb3b3] font-medium border-t border-[#f87171]">
                <strong>Note:</strong> Please keep your Cash/Jewellery and anyway in your Custody/Lock" Carring Liquor, Gas Cylinder, Acid of any type of Liquids (like Ghee Tin, Oil etc.) is totally prohibited.
              </div>

              {/* Bottom Customer Care Support Bar */}
              <div className="bg-[#ffb3b3] text-center font-bold py-1.5 text-[12px] text-[#991b1b] tracking-wide border-t border-[#f87171]">
                24x7 Customer Care Support <span className="text-red-700 font-extrabold">8093017400</span>
              </div>
            </div>
          )}

          {/* ================= PAGE 2 (TERMS & CONDITIONS) ================= */}
          {(activePage === 'both' || activePage === 'page2') && (
            <div 
              id="quotation-page-2"
              className="bg-white w-full max-w-[794px] shadow-lg border-2 border-[#f87171] text-[11.5px] text-black font-sans box-border relative mx-auto p-4 flex flex-col justify-between min-h-[900px] print:border print:border-[#f87171] print:shadow-none print:w-full print:max-w-none print:min-h-0"
            >
              <div>
                {/* Top Customer Care Support Bar */}
                <div className="bg-[#ffb3b3] text-center font-bold py-1.5 text-[12px] text-[#991b1b] tracking-wide border border-[#f87171] mb-6">
                  24x7 Customer Care Support <span className="text-red-700 font-extrabold">8093017400</span>
                </div>

                {/* Terms and Conditions List */}
                <div className="space-y-4 px-3 text-slate-900 leading-relaxed text-[11.5px]">
                  <p className="font-bold text-base text-black flex items-center gap-1.5">
                    <span className="text-black">●</span> Terms & Conditions:
                  </p>

                  <p className="flex items-start gap-2">
                    <span className="text-black shrink-0">●</span>
                    <span>Please do advise the Charge which quoted are based on the present prevailing rates and will be charged on actual at the time of transportation. Octrai Charges, in applicable will be charged extra as per actual in advance.</span>
                  </p>

                  <p className="flex items-start gap-2">
                    <span className="text-black shrink-0">●</span>
                    <span>The carrier of their agent shall be exempted from any loss or damage through accident, fire, rain, collision any other road or river hazard.</span>
                  </p>

                  <p className="flex items-start gap-2">
                    <span className="text-black shrink-0">●</span>
                    <span>We therefore recommend that goods be insured under carriers risk while carrier’s risk no individual Policy/receipt from Insurance co. will be given.</span>
                  </p>

                  <p className="flex items-start gap-2">
                    <span className="text-black shrink-0">●</span>
                    <span>Full 100% payment at loading point.</span>
                  </p>

                  <p className="flex items-start gap-2">
                    <span className="text-black shrink-0">●</span>
                    <span>We would request you to please pay us 15% of all the charges in advance along with you order and the balance charges on completion of the packing & Loading Work. For Insurance the full amount of the premium value to be paid before departure of the consignment.</span>
                  </p>

                  <p className="flex items-start gap-2">
                    <span className="text-black shrink-0">●</span>
                    <span>We would be grateful if could please give us one week’s advance notice as to when we may commence the above job.</span>
                  </p>

                  <div className="pt-4 flex flex-col items-end text-right space-y-2">
                    <p className="font-bold text-slate-900 leading-tight">
                      For <span className="text-[#1e3a8a] font-black">Urban</span><span className="text-[#dc2626] font-black">Pro</span><br />
                      <span className="text-[#1e3a8a] font-extrabold uppercase text-[11px] tracking-wider">Packers & Logistics</span>
                    </p>
                    {(globalSignature?.image || authSignImage) ? (
                      <div className="flex flex-col items-end">
                        <img src={globalSignature?.image || authSignImage || ''} alt="Authorized Signature" className="max-h-16 object-contain mb-1" />
                        <span className="text-[11px] font-bold text-slate-800 uppercase border-t border-slate-300 pt-0.5 px-4">{globalSignature?.text || authSignName || 'Authorized Signatory'}</span>
                      </div>
                    ) : (
                      <div className="pt-6 border-t border-slate-300 inline-block px-8 font-bold text-slate-800">
                        {globalSignature?.text || authSignName || 'Authorized Signatory'}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Customer Care Support Bar */}
              <div className="bg-[#ffb3b3] text-center font-bold py-1.5 text-[12px] text-[#991b1b] tracking-wide border border-[#f87171] mt-12">
                24x7 Customer Care Support <span className="text-red-700 font-extrabold">8093017400</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
