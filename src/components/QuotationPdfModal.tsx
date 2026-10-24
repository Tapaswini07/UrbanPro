import React, { useState, useEffect, useRef } from 'react';
import { 
  Printer, 
  X, 
  Download, 
  Upload, 
  Check, 
  ExternalLink, 
  Share2, 
  Edit, 
  Pencil, 
  Sliders, 
  Save, 
  RotateCcw, 
  Plus, 
  Trash2, 
  Receipt,
  Sparkles,
  ZoomIn,
  ZoomOut,
  Maximize2,
  FileText
} from 'lucide-react';
import jsPDF from 'jspdf';
import { addCanvasToA4Pdf, renderElementToCanvas } from '../utils/pdfExport';
import { shareDocument } from '../utils/shareUtils';
import { calculateQuotationTotals, parseChargeNumber, parseChargeDetails, formatChargeValue } from '../utils/quotationCalculations';
import { UPL_LOGO_BASE64 } from '../assets/logoBase64';
import { PRAKASH_SIGNATURE_BASE64 } from '../assets/signatureBase64';

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
  serviceChargePercent?: string;
  serviceCharge?: number | string;
  customCharges?: Array<{ name: string; val: string }>;
  subTotal?: number | string;
  insurancePercent?: string;
  insuranceStatus?: string;
  goodsValue?: string;
  insuranceCharge?: string;
  gstType?: string;
  gstPercent?: string;
  gstStatus?: string;
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
  onEdit?: (quotation: QuotationData) => void;
  onSave?: (updatedQuotation: QuotationData) => void;
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
  quotation: initialQuotation, 
  onClose, 
  onEdit,
  onSave,
  globalSignature,
  companyLogo,
  companyProfile 
}) => {
  const [quotation, setQuotation] = useState<QuotationData | null>(initialQuotation);
  const [showQuickEdit, setShowQuickEdit] = useState(false);
  const [isQuickSaving, setIsQuickSaving] = useState(false);
  const [quickSaveToast, setQuickSaveToast] = useState<string | null>(null);

  useEffect(() => {
    setQuotation(initialQuotation);
  }, [initialQuotation]);

  const [activePage, setActivePage] = useState<'both' | 'page1' | 'page2'>('both');
  const [isDownloading, setIsDownloading] = useState(false);
  const [isOpeningInTab, setIsOpeningInTab] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (pdfBlobUrl) {
        window.setTimeout(() => URL.revokeObjectURL(pdfBlobUrl), 60000);
      }
    };
  }, [pdfBlobUrl]);

  // Zoom / Responsive Fit State
  const [zoomScale, setZoomScale] = useState<number | 'auto'>('auto');
  const [containerWidth, setContainerWidth] = useState<number>(850);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const updateWidth = () => {
      if (scrollContainerRef.current) {
        setContainerWidth(scrollContainerRef.current.clientWidth);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const autoScale = Math.min(1, Math.max(0.35, (containerWidth - 36) / 810));
  const effectiveScale = zoomScale === 'auto' ? autoScale : zoomScale;

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

  // Accurately cross-verify and calculate all quotation totals (Base Charges, Service %, Sub Total, Insurance, GST, Grand Total)
  const totals = calculateQuotationTotals(quotation);
  const finalGrandTotalNum = totals.grandTotal;
  const wordsAmount = (finalGrandTotalNum > 0) 
    ? `${numberToIndianWords(finalGrandTotalNum)} Rupees Only` 
    : (quotation.payableInWords || '');

  const handlePrint = () => {
    setIsEditingSign(false);
    window.print();
  };

  /**
   * Generates the PDF document reliably with crisp text and exact A4 dimensions.
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
      compress: true,
    });

    const margin = 4; // 4mm margin for maximum printable area
    let pagesAdded = 0;

    const shouldRenderP1 = p1 && (activePage === 'both' || activePage === 'page1');
    const shouldRenderP2 = p2 && (activePage === 'both' || activePage === 'page2');

    // Render Page 1 if requested
    if (shouldRenderP1 && p1) {
      const canvas1 = await renderElementToCanvas(p1);
      pagesAdded += addCanvasToA4Pdf(pdf, canvas1, margin);
    }

    // Render Page 2 (Terms & Conditions) if requested
    if (shouldRenderP2 && p2) {
      if (pagesAdded > 0) {
        pdf.addPage();
      }
      const canvas2 = await renderElementToCanvas(p2);
      addCanvasToA4Pdf(pdf, canvas2, margin);
    }

    const url = URL.createObjectURL(pdf.output('blob'));
    return { url, filename };
  };

  const handleDownloadPdf = async () => {
    try {
      setIsDownloading(true);
      setDownloadSuccess(false);
      setDownloadError(null);

      const result = await createPdfDocument();
      if (!result) return;

      const { url, filename } = result;
      setPdfBlobUrl(url);

      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 8000);
    } catch (err) {
      console.error('PDF generation error:', err);
      setDownloadError(err instanceof Error ? err.message : 'Unable to generate the quotation PDF.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    const shareText = `📦 *UrbanPro Packers & Logistics*
*QUOTATION #${quotation.quotationNo || quotation.id}*
----------------------------------------
👤 *Customer:* ${quotation.partyName}
📞 *Mobile:* ${quotation.mobileNo}
📍 *From:* ${quotation.fromCity}
🏁 *To:* ${quotation.toCity}
💰 *Grand Total:* ₹ ${finalGrandTotalNum > 0 ? Math.round(finalGrandTotalNum).toLocaleString() : quotation.grandTotal || '0'}
📝 *In Words:* ${wordsAmount}
----------------------------------------
*Regd. Office:* Ward No. 3, Near Old SBI ATM, Dipka, Korba, CG – 495452
*Main Operational Office:* Plot No 1491, Balintha Canal Road, Hanspal, Bhubaneswar, Odisha – 752101
*Helpline:* 8093017400`;

    await shareDocument({
      title: `Quotation #${quotation.quotationNo || quotation.id} - UrbanPro`,
      text: shareText,
      phone: quotation.mobileNo,
    });
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

  const handleSaveQuickEdit = () => {
    if (!quotation) return;
    setIsQuickSaving(true);
    const updatedTotals = calculateQuotationTotals(quotation);
    const words = updatedTotals.grandTotal > 0 ? `${numberToIndianWords(updatedTotals.grandTotal)} Rupees Only` : quotation.payableInWords;
    const finalQuot: QuotationData = {
      ...quotation,
      subTotal: updatedTotals.subTotal > 0 ? String(updatedTotals.subTotal) : (quotation.subTotal || ''),
      grandTotal: updatedTotals.grandTotal > 0 ? String(updatedTotals.grandTotal) : (quotation.grandTotal || ''),
      payableInWords: words || quotation.payableInWords || ''
    };
    setQuotation(finalQuot);
    if (onSave) {
      onSave(finalQuot);
    }
    setQuickSaveToast('Quotation updated & saved successfully!');
    setIsQuickSaving(false);
    setTimeout(() => setQuickSaveToast(null), 3000);
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
              onClick={() => {
                setActivePage('both');
                document.getElementById('quotation-page-1')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${activePage === 'both' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'}`}
            >
              All (2 Pages)
            </button>
            <button
              onClick={() => {
                setActivePage('page1');
                document.getElementById('quotation-page-1')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${activePage === 'page1' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'}`}
            >
              Page 1
            </button>
            <button
              onClick={() => {
                setActivePage('page2');
                document.getElementById('quotation-page-2')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${activePage === 'page2' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'}`}
            >
              Page 2 (Terms)
            </button>
          </div>

          {/* Zoom & Fit Controls for genuine PDF document viewing */}
          <div className="flex items-center bg-slate-200 p-0.5 rounded-lg text-xs font-semibold text-slate-700">
            <button
              type="button"
              onClick={() => setZoomScale(s => Math.max(0.4, (typeof s === 'number' ? s : effectiveScale) - 0.1))}
              className="p-1 hover:bg-white rounded transition-colors text-slate-700 hover:text-slate-900 cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoomScale(1)}
              className="px-2 py-0.5 hover:bg-white rounded transition-colors text-[11px] font-mono cursor-pointer"
              title="Click for 100% Zoom"
            >
              {Math.round(effectiveScale * 100)}%
            </button>
            <button
              type="button"
              onClick={() => setZoomScale(s => Math.min(1.4, (typeof s === 'number' ? s : effectiveScale) + 0.1))}
              className="p-1 hover:bg-white rounded transition-colors text-slate-700 hover:text-slate-900 cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoomScale('auto')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                zoomScale === 'auto' ? 'bg-white text-blue-900 shadow-2xs font-bold' : 'hover:bg-white text-slate-600'
              }`}
              title="Fit to Screen Width"
            >
              Fit
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Edit Quotation Button (Opens Full Form Editor) */}
            {onEdit && (
              <button 
                type="button"
                onClick={() => onEdit(quotation)}
                className="bg-amber-600 hover:bg-amber-700 active:scale-95 text-white px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                title="Open quotation in full editor to change any field"
              >
                <Edit className="w-4 h-4" />
                <span>Edit Full Form</span>
              </button>
            )}

            {/* Quick Edit in Modal Toggle */}
            <button 
              type="button"
              onClick={() => setShowQuickEdit(!showQuickEdit)}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer ${
                showQuickEdit 
                  ? 'bg-sky-800 text-white' 
                  : 'bg-sky-600 hover:bg-sky-700 active:scale-95 text-white'
              }`}
              title="Edit charges & details directly inside this modal"
            >
              <Sliders className="w-4 h-4" />
              <span>{showQuickEdit ? 'Hide Quick Edit' : 'Quick Edit Charges'}</span>
            </button>

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

            {/* Direct Download Link for Laptop/Desktop */}
            {pdfBlobUrl && (
              <a 
                href={pdfBlobUrl}
                download={`UrbanPro_Quotation_${quotation.quotationNo || quotation.id}.pdf`}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-md animate-pulse cursor-pointer border border-emerald-400"
                title="Click here to save PDF directly to laptop or desktop"
              >
                <Download className="w-4 h-4" />
                <span>📥 Save PDF To Laptop</span>
              </a>
            )}

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

            {/* Share Button */}
            <button 
              onClick={handleShare}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
              title="Share via WhatsApp / Native Share"
            >
              <Share2 className="w-4 h-4" /> <span className="hidden sm:inline">Share</span>
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

        {downloadError && (
          <div role="alert" className="bg-red-50 border-b border-red-200 px-4 py-2.5 text-xs text-red-800">
            <strong>Quotation PDF could not be generated.</strong> {downloadError}
          </div>
        )}

        {/* Quick Edit Interactive Drawer (Collapsible) */}
        {showQuickEdit && (
          <div className="bg-sky-50 border-b-2 border-sky-300 p-4 max-h-[50vh] overflow-y-auto space-y-4 print:hidden animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-sky-200">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-sky-600 text-white rounded-lg">
                  <Pencil className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Quick Edit Quotation #{quotation.quotationNo || quotation.id}</h3>
                  <p className="text-[11px] text-slate-500">Edit any charge, service %, GST, or details. PDF preview updates live.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveQuickEdit}
                  disabled={isQuickSaving}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save & Apply Changes</span>
                </button>
                {onEdit && (
                  <button
                    type="button"
                    onClick={() => onEdit(quotation)}
                    className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Full Editor</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowQuickEdit(false)}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>

            {quickSaveToast && (
              <div className="bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs px-3 py-1.5 rounded-lg font-bold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>{quickSaveToast}</span>
              </div>
            )}

            {/* Grid of editable fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              {/* Customer & Route */}
              <div className="bg-white p-3 rounded-xl border border-sky-200 space-y-2">
                <h4 className="font-bold text-sky-950 uppercase tracking-wider text-[11px] flex items-center gap-1">
                  <span>1. Party & Moving Details</span>
                </h4>
                <div>
                  <label className="block text-[10px] text-slate-500 font-medium mb-0.5">Party Name</label>
                  <input
                    type="text"
                    value={quotation.partyName || ''}
                    onChange={(e) => setQuotation({ ...quotation, partyName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-slate-800 font-semibold outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 font-medium mb-0.5">Mobile No.</label>
                  <input
                    type="text"
                    value={quotation.mobileNo || ''}
                    onChange={(e) => setQuotation({ ...quotation, mobileNo: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-slate-800 font-semibold outline-none focus:border-sky-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-500 font-medium mb-0.5">From City</label>
                    <input
                      type="text"
                      value={quotation.fromCity || ''}
                      onChange={(e) => setQuotation({ ...quotation, fromCity: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-slate-800 font-semibold outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-medium mb-0.5">To City</label>
                    <input
                      type="text"
                      value={quotation.toCity || ''}
                      onChange={(e) => setQuotation({ ...quotation, toCity: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-slate-800 font-semibold outline-none focus:border-sky-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-500 font-medium mb-0.5">Quotation Date</label>
                    <input
                      type="date"
                      value={quotation.quotationDate || ''}
                      onChange={(e) => setQuotation({ ...quotation, quotationDate: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-slate-800 outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-medium mb-0.5">Packing Date</label>
                    <input
                      type="date"
                      value={quotation.packingDate || ''}
                      onChange={(e) => setQuotation({ ...quotation, packingDate: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-slate-800 outline-none focus:border-sky-500"
                    />
                  </div>
                </div>
              </div>

              {/* Base Moving Charges */}
              <div className="bg-white p-3 rounded-xl border border-sky-200 space-y-2">
                <h4 className="font-bold text-sky-950 uppercase tracking-wider text-[11px] flex items-center justify-between">
                  <span>2. Base Moving Charges</span>
                  <span className="text-[10px] text-slate-500 font-normal">Base: ₹{totals.baseTotal.toLocaleString()}</span>
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { key: 'transportCharges', label: 'Freight / Transport' },
                    { key: 'packingCharges', label: 'Packing Charges' },
                    { key: 'unpackingCharges', label: 'Unpacking Charges' },
                    { key: 'loadingCharges', label: 'Loading Charges' },
                    { key: 'unloadingCharges', label: 'Unloading Charges' },
                    { key: 'dismantlingCharges', label: 'Dismantling/Assembly' },
                    { key: 'octroiCharges', label: 'Octroi/Entry Tax' },
                    { key: 'statCharges', label: 'Statistical / Doc' },
                  ].map((item) => {
                    const currentVal = (quotation as any)[item.key];
                    const parsed = parseChargeDetails(currentVal);
                    const isInc = parsed.status === 'included';
                    const isExc = parsed.status === 'excluded';

                    const toggleStatus = (target: 'included' | 'excluded') => {
                      const newStatus = parsed.status === target ? 'standard' : target;
                      const newVal = formatChargeValue(parsed.displayAmount, newStatus);
                      setQuotation({ ...quotation, [item.key]: newVal });
                    };

                    const handleAmtChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                      const inputVal = e.target.value;
                      const newVal = formatChargeValue(inputVal, parsed.status);
                      setQuotation({ ...quotation, [item.key]: newVal });
                    };

                    return (
                      <div key={item.key}>
                        <div className="flex items-center justify-between mb-0.5">
                          <label className="block text-[10px] text-slate-500 font-medium truncate">{item.label}</label>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => toggleStatus('included')}
                              className={`px-1 py-0.2 rounded text-[9px] font-bold transition-all cursor-pointer border flex items-center gap-0.5 ${
                                isInc
                                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                                  : 'bg-white text-emerald-700 border-emerald-300 hover:bg-emerald-50'
                              }`}
                              title={isInc ? 'Select Included to clear' : 'Select Included'}
                            >
                              Included
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleStatus('excluded')}
                              className={`px-1 py-0.2 rounded text-[9px] font-bold transition-all cursor-pointer border flex items-center gap-0.5 ${
                                isExc
                                  ? 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                                  : 'bg-white text-rose-700 border-rose-300 hover:bg-rose-50'
                              }`}
                              title={isExc ? 'Select Excluded to clear' : 'Select Excluded'}
                            >
                              Excluded
                            </button>
                          </div>
                        </div>
                        <div className="relative flex items-center">
                          <input
                            type="text"
                            placeholder="0"
                            value={parsed.displayAmount}
                            onChange={handleAmtChange}
                            className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 font-bold outline-none focus:border-sky-500 text-xs text-slate-800"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Service Charge, Insurance, GST & Totals */}
              <div className="bg-white p-3 rounded-xl border border-sky-200 space-y-2">
                <h4 className="font-bold text-sky-950 uppercase tracking-wider text-[11px]">
                  <span>3. Service, Insurance & GST</span>
                </h4>
                
                {/* Service Charge */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-500 font-medium mb-0.5">Service Charge %</label>
                    <select
                      value={quotation.serviceChargePercent || '0%'}
                      onChange={(e) => {
                        const newPct = e.target.value;
                        const pctNum = parseFloat(newPct.replace(/[^0-9.]/g, '')) || 0;
                        const sc = pctNum > 0 ? String(Math.round((totals.baseTotal * pctNum) / 100)) : '';
                        setQuotation({ ...quotation, serviceChargePercent: newPct, serviceCharge: sc });
                      }}
                      className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-slate-800 font-semibold outline-none focus:border-sky-500"
                    >
                      <option value="0%">0% (None)</option>
                      <option value="5%">5%</option>
                      <option value="10%">10%</option>
                      <option value="12%">12%</option>
                      <option value="15%">15%</option>
                      <option value="18%">18%</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-medium mb-0.5">Service Amount (₹)</label>
                    <input
                      type="text"
                      placeholder="0"
                      value={quotation.serviceCharge ?? ''}
                      onChange={(e) => setQuotation({ ...quotation, serviceCharge: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-slate-800 font-bold outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                {/* Insurance */}
                <div className="pt-1 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[10px] font-bold text-emerald-900 uppercase">Insurance</label>
                    <div className="flex items-center gap-1">
                      {['Extra', 'Exempted'].map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => {
                            setQuotation({ 
                              ...quotation, 
                              insuranceStatus: status, 
                              insuranceCharge: status === 'Exempted' ? 'Exempted' : '',
                            });
                          }}
                          className={`px-1.5 py-0.5 text-[9px] font-bold rounded cursor-pointer ${
                            totals.insStatus === status ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-slate-500 font-medium mb-0.5">Goods Val (Rs.)</label>
                      <input
                        type="text"
                        placeholder="Declared Value"
                        value={quotation.goodsValue ?? ''}
                        onChange={(e) => {
                          const gv = e.target.value;
                          const gvNum = parseFloat(gv.replace(/[^0-9.]/g, '')) || 0;
                          const pct = parseFloat(String(quotation.insurancePercent || '3').replace(/[^0-9.]/g, '')) || 3;
                          const ins = gvNum > 0 ? String(Math.round((gvNum * pct) / 100)) : '';
                          setQuotation({ ...quotation, goodsValue: gv, insuranceStatus: 'Extra', insuranceCharge: ins });
                        }}
                        className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-slate-800 outline-none focus:border-sky-500 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 font-medium mb-0.5">Ins Charge (₹)</label>
                      <input
                        type="text"
                        placeholder="0"
                        value={totals.insuranceNum > 0 ? String(totals.insuranceNum) : ''}
                        readOnly
                        className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-slate-800 font-bold outline-none text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* GST */}
                <div className="pt-1 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[10px] font-bold text-purple-900 uppercase">GST Tax</label>
                    <div className="flex items-center gap-1">
                      {['Extra', 'Exempted'].map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => {
                            setQuotation({ 
                              ...quotation, 
                              gstStatus: status, 
                              gstCharge: status === 'Exempted' ? 'Exempted' : '',
                            });
                          }}
                          className={`px-1.5 py-0.5 text-[9px] font-bold rounded cursor-pointer ${
                            totals.gstStatus === status ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-slate-500 font-medium mb-0.5">GST % Rate</label>
                      <select
                        value={quotation.gstPercent || '18%'}
                        onChange={(e) => {
                          const newPct = e.target.value;
                          const pctNum = parseFloat(newPct.replace(/[^0-9.]/g, '')) || 0;
                          const gstVal = pctNum > 0 ? String(Math.round((totals.subTotal * pctNum) / 100)) : '';
                          setQuotation({ ...quotation, gstPercent: newPct, gstStatus: 'Extra', gstCharge: gstVal });
                        }}
                        className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-slate-800 outline-none focus:border-sky-500 text-xs font-semibold"
                      >
                        <option value="18%">18% Standard</option>
                        <option value="12%">12%</option>
                        <option value="5%">5% GTA</option>
                        <option value="0%">0% Nil</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 font-medium mb-0.5">GST Amount (₹)</label>
                      <input
                        type="text"
                        placeholder="0"
                        value={totals.gstNum > 0 ? String(totals.gstNum) : ''}
                        readOnly
                        className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-slate-800 font-bold outline-none text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Advance Paid */}
                <div className="pt-1 border-t border-slate-100">
                  <label className="block text-[10px] text-slate-500 font-medium mb-0.5">Advance Paid (₹)</label>
                  <input
                    type="text"
                    placeholder="Advance deposit"
                    value={quotation.advancePaid ?? ''}
                    onChange={(e) => setQuotation({ ...quotation, advancePaid: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-slate-800 font-bold outline-none focus:border-sky-500 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Live Calculation Bar inside Quick Edit */}
            <div className="p-2.5 bg-sky-100/80 rounded-xl border border-sky-300 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-3 font-semibold text-slate-800">
                <span>Base: <strong className="font-mono">₹{totals.baseTotal.toLocaleString()}</strong></span>
                {totals.serviceChargeNum > 0 && (
                  <span>+ Service: <strong className="font-mono text-blue-800">₹{totals.serviceChargeNum.toLocaleString()}</strong></span>
                )}
                <span className="bg-white px-2 py-0.5 rounded border border-sky-300">
                  Sub Total: <strong className="font-mono text-blue-900">₹{totals.subTotal.toLocaleString()}</strong>
                </span>
                {totals.insStatus === 'Extra' && totals.insuranceNum > 0 && (
                  <span>+ Ins: <strong className="font-mono text-emerald-800">₹{totals.insuranceNum.toLocaleString()}</strong></span>
                )}
                {totals.gstNum > 0 && (
                  <span>+ GST: <strong className="font-mono text-purple-800">₹{totals.gstNum.toLocaleString()}</strong></span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="font-extrabold text-blue-950 uppercase text-[11px]">Grand Total:</span>
                <span className="text-sm font-black font-mono bg-white px-2.5 py-0.5 rounded-lg border border-blue-400 text-blue-900 shadow-2xs">
                  ₹ {totals.grandTotal.toLocaleString()}
                </span>
                <button
                  type="button"
                  onClick={handleSaveQuickEdit}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1 rounded-lg text-xs shadow-xs cursor-pointer flex items-center gap-1 active:scale-95"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Apply & Save</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Post-Download Helper Banner */}
        {downloadSuccess && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2.5 flex flex-wrap items-center justify-between text-xs text-emerald-800 shrink-0 gap-2">
            <div className="flex items-center gap-1.5 font-medium">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Quotation PDF generated successfully!</span>
            </div>
            {pdfBlobUrl && (
              <div className="flex items-center gap-3">
                <a 
                  href={pdfBlobUrl} 
                  download={`UrbanPro_Quotation_${quotation.quotationNo || quotation.id}.pdf`}
                  className="font-bold underline text-emerald-900 hover:text-emerald-700 flex items-center gap-1 bg-emerald-100/80 px-2.5 py-1 rounded"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download File Again</span>
                </a>
                <a 
                  href={pdfBlobUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="font-bold underline text-emerald-900 hover:text-emerald-700 flex items-center gap-1"
                >
                  <span>Open PDF in Tab</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div 
          ref={scrollContainerRef}
          className="flex-1 overflow-x-auto overflow-y-auto bg-slate-200/80 p-2 sm:p-6 print:p-0 print:space-y-0 print:bg-white print:overflow-visible"
        >
          {/* Quick Edit Banner inside Modal */}
          <div className="w-[794px] max-w-full mx-auto bg-amber-50 border border-amber-300 text-amber-900 rounded-xl p-3 text-xs flex flex-wrap items-center justify-between gap-2 shadow-xs print:hidden mb-4">
            <div className="flex items-center gap-2">
              <Pencil className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                <strong>Need to edit this quotation?</strong> Use <strong>"Edit Full Form"</strong> or <strong>"Quick Edit Charges"</strong> to update party details, goods value, moving charges, or grand total.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowQuickEdit(prev => !prev)}
                className="bg-sky-600 hover:bg-sky-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs cursor-pointer shadow-2xs flex items-center gap-1"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>{showQuickEdit ? 'Close Quick Edit' : 'Quick Edit Charges'}</span>
              </button>
              {onEdit && (
                <button
                  type="button"
                  onClick={() => onEdit(quotation)}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs cursor-pointer shadow-2xs flex items-center gap-1"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Full Editor</span>
                </button>
              )}
            </div>
          </div>

          {/* Scaling wrapper so A4 PDF fits gracefully on any mobile, tablet or desktop screen */}
          <div 
            className="flex flex-col items-center gap-6 w-full mx-auto print:!transform-none print:!m-0 print:!mb-0 print:!gap-0"
            style={{
              transform: effectiveScale !== 1 ? `scale(${effectiveScale})` : 'none',
              transformOrigin: 'top center',
              marginBottom: effectiveScale < 1 ? `-${Math.round((1 - effectiveScale) * (activePage === 'both' ? 2250 : 1130))}px` : 0,
            }}
          >
            {/* ================= PAGE 1 ================= */}
            {(activePage === 'both' || activePage === 'page1') && (
              <div 
                id="quotation-page-1"
                className="bg-white w-[794px] max-w-[794px] min-h-[1123px] shadow-2xl border-2 border-[#1e3a8a] text-[11px] text-black font-sans box-border relative mx-auto flex flex-col justify-between print:border print:border-[#1e3a8a] print:shadow-none print:w-[794px] print:max-w-[794px] print:break-after-page print:min-h-[1120px]"
              >
                {/* Company Header */}
                <div className="flex border-b border-[#1e3a8a] min-h-[86px]">
                  <div className="w-[28%] border-r border-[#1e3a8a] flex items-center justify-center p-2 bg-white">
                    <img 
                      src={companyLogo || companyProfile?.logo || UPL_LOGO_BASE64} 
                      alt="UrbanPro Packers & Logistics Logo" 
                      className="max-h-16 w-auto object-contain" 
                    />
                  </div>
                  <div className="w-[72%] p-2 text-center flex flex-col justify-center items-center bg-white">
                    <div className="mb-0.5" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
                      <h1 className="text-[22px] sm:text-[24px] font-black tracking-tight leading-none">
                        <span style={{ color: '#1e3a8a' }}>Urban</span><span style={{ color: '#dc2626' }}>Pro</span>
                      </h1>
                      <h2 className="text-[12px] sm:text-[13px] font-extrabold tracking-wider uppercase mt-0.5" style={{ color: '#1e3a8a' }}>
                        Packers & Logistics
                      </h2>
                    </div>
                    <p className="text-[9px] sm:text-[9.5px] leading-tight text-black font-semibold mt-0.5">
                      <strong>Regd. Office:</strong> Ward No. 3, Near Old SBI ATM, Dipka, Korba, CG – 495452 | Tel: 8093017400
                    </p>
                    <p className="text-[9px] sm:text-[9.5px] leading-tight text-black font-semibold mt-0.5">
                      <strong>Main Operational Office:</strong> Plot No 1491, Balintha Canal Road, Near Lenskart, Hanspal, Bhubaneswar, Odisha – 752101 | Mobile: 8093017400
                    </p>
                    <p className="text-[9px] sm:text-[9.5px] leading-tight text-black font-medium mt-0.5">
                      <strong>Helpline:</strong> 8093017400 &nbsp;|&nbsp; <strong>Email:</strong> urbanpro403@gmail.com
                    </p>
                  </div>
                </div>

                {/* Saffron Quotation Bar with 5 Blocks */}
                <div className="grid grid-cols-5 border-b border-[#1e3a8a] bg-[#ff9933] text-center text-[11px] font-bold text-black py-1.5 shadow-xs">
                  <div className="border-r border-[#1e3a8a] px-1 flex items-center justify-center font-black tracking-wide text-black text-[12px]">
                    Quotation
                  </div>
                  <div className="border-r border-[#1e3a8a] px-1 flex flex-col items-center justify-center">
                    <span className="font-semibold text-[10.5px]">Quotation No:</span>
                    <span className="font-black text-black">{quotation.quotationNo || quotation.id}</span>
                  </div>
                  <div className="border-r border-[#1e3a8a] px-1 flex flex-col items-center justify-center">
                    <span className="font-semibold text-[10.5px]">Quotation Date:</span>
                    <span className="font-black text-black">{quotation.quotationDate || ''}</span>
                  </div>
                  <div className="border-r border-[#1e3a8a] px-1 flex flex-col items-center justify-center">
                    <span className="font-semibold text-[10.5px]">Packing Date:</span>
                    <span className="font-black text-black">{quotation.packingDate || ''}</span>
                  </div>
                  <div className="px-1 flex flex-col items-center justify-center">
                    <span className="font-semibold text-[10.5px]">Delivery Date:</span>
                    <span className="font-black text-black">{quotation.deliveryDate || ''}</span>
                  </div>
                </div>

                {/* Greeting Note */}
                <div className="p-2 border-b border-[#1e3a8a] text-[10.5px] text-black font-medium leading-tight bg-white">
                  We thank you for your valuable enquiry for packing and shifting of your moving items from{' '}
                  <span className="font-bold underline">{quotation.fromCity || 'Origin'}</span> to{' '}
                  <span className="font-bold underline">{quotation.toCity || 'Destination'}</span> we are pleased to quote the rate for the same as under:
                </div>

                {/* Relocate From / Relocate To Header Bar */}
                <div className="grid grid-cols-2 bg-[#1e3a8a] border-b border-[#1e3a8a] font-bold text-[11px] text-center text-white">
                  <div className="border-r border-white/30 py-1 flex items-center justify-center gap-1.5">
                    <span>📍 Relocate From (Origin)</span>
                  </div>
                  <div className="py-1 flex items-center justify-center gap-1.5">
                    <span>🏁 Relocate To (Destination)</span>
                  </div>
                </div>

                {/* Relocate From / Relocate To Details */}
                <div className="grid grid-cols-2 border-b border-[#1e3a8a] text-[10.5px]">
                  {/* From Box */}
                  <div className="p-2 border-r border-[#1e3a8a] space-y-0.5 bg-white">
                    <p><strong className="text-slate-700">Client / Party:</strong> <span className="font-bold text-black">{quotation.partyName || ''}</span></p>
                    <p><strong className="text-slate-700">Mobile No.:</strong> <span className="font-semibold text-black">{quotation.mobileNo || ''}</span></p>
                    {quotation.email && <p><strong className="text-slate-700">Email:</strong> {quotation.email}</p>}
                    <p><strong className="text-slate-700">From City:</strong> {quotation.fromCity || ''} {quotation.fromState ? `(${quotation.fromState})` : ''}</p>
                    <p><strong className="text-slate-700">Area / Address:</strong> {quotation.fromArea || '—'}</p>
                    <p><strong className="text-slate-700">Pin Code:</strong> {quotation.fromPincode || '—'} &nbsp;|&nbsp; <strong className="text-slate-700">Country:</strong> {quotation.fromCountry || 'India'}</p>
                    <p><strong className="text-slate-700">Floor:</strong> {quotation.fromFloor || 'Ground'} &nbsp;|&nbsp; <strong className="text-slate-700">Lift:</strong> {quotation.fromLift || 'Not Required'}</p>
                  </div>

                  {/* To Box */}
                  <div className="p-2 space-y-0.5 bg-white">
                    <p><strong className="text-slate-700">Receiver / Party:</strong> <span className="font-bold text-black">{quotation.partyName || ''}</span></p>
                    <p><strong className="text-slate-700">Mobile No.:</strong> <span className="font-semibold text-black">{quotation.mobileNo || ''}</span></p>
                    {quotation.email && <p><strong className="text-slate-700">Email:</strong> {quotation.email}</p>}
                    <p><strong className="text-slate-700">To City:</strong> {quotation.toCity || ''} {quotation.toState ? `(${quotation.toState})` : ''}</p>
                    <p><strong className="text-slate-700">Area / Address:</strong> {quotation.toArea || '—'}</p>
                    <p><strong className="text-slate-700">Pin Code:</strong> {quotation.toPincode || '—'} &nbsp;|&nbsp; <strong className="text-slate-700">Country:</strong> {quotation.toCountry || 'India'}</p>
                    <p><strong className="text-slate-700">Floor:</strong> {quotation.toFloor || 'Ground'} &nbsp;|&nbsp; <strong className="text-slate-700">Lift:</strong> {quotation.toLift || 'Not Required'}</p>
                  </div>
                </div>

                {/* Moving Requirements & Conditions Bar */}
                <div className="bg-[#f0f9ff] border-b border-[#1e3a8a] p-1.5 text-[10px] grid grid-cols-3 gap-2">
                  <div>
                    <span className="font-bold text-slate-700">Service Type:</span> <span className="font-semibold text-black">{quotation.moveType || 'Part Load, Domestic Shifting'}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-700">Loading Access:</span> <span className="font-medium text-black">{quotation.easyAccess || 'Normal'}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-700">Balcony Handling:</span> <span className="font-medium text-black">{quotation.balconyItems || 'None'}</span>
                  </div>
                </div>

                {quotation.extraInfo && (
                  <div className="border-b border-[#1e3a8a] bg-white px-2 py-1.5 text-[10px]">
                    <span className="font-bold text-slate-700">Additional Information:</span>{' '}
                    <span className="font-medium text-black">{quotation.extraInfo}</span>
                  </div>
                )}

                {/* Main Full Width Moving Charges Table */}
                <div className="w-full border-b border-[#1e3a8a]">
                  <div className="bg-cyan-50 text-cyan-950 font-black uppercase tracking-wide text-[11px] px-2 py-1 border-b border-cyan-200">
                    Charge Details
                  </div>
                  {/* Table Header */}
                  <div className="flex bg-[#1e3a8a] text-center font-bold text-[11px] border-b border-[#1e3a8a] text-white">
                    <div className="w-12 border-r border-white/30 py-1">Sr.</div>
                    <div className="flex-1 border-r border-white/30 py-1 text-left px-2">Particulars / Description of Moving Services</div>
                    <div className="w-36 border-r border-white/30 py-1">Inclusions / Rate</div>
                    <div className="w-36 py-1 text-right pr-2">Amount (₹)</div>
                  </div>

                  {/* Charge Rows */}
                  {[
                    { sr: '1', name: 'Freight / Transportation Charges', val: quotation.transportCharges },
                    { sr: '2', name: 'Packing Material & Packing Charges', val: quotation.packingCharges },
                    { sr: '3', name: 'Unpacking & Placement Charges', val: quotation.unpackingCharges },
                    { sr: '4', name: 'Loading Charges at Origin', val: quotation.loadingCharges },
                    { sr: '5', name: 'Unloading Charges at Destination', val: quotation.unloadingCharges },
                    { sr: '6', name: 'Dismantling & Assembling Charges', val: quotation.dismantlingCharges },
                    { sr: '7', name: 'Car Transportation Charges', val: quotation.carCharges },
                    { sr: '8', name: 'Bike Transportation Charges', val: quotation.bikeCharges },
                    { sr: '9', name: 'Statistical & Documentation Charges', val: quotation.statCharges },
                    { sr: '10', name: 'Octroi / Entry Tax / Toll Charges', val: quotation.octroiCharges },
                    ...(quotation.customCharges || []).filter(c => c && c.name?.trim()).map((c, idx) => ({
                    sr: String(11 + idx),
                      name: c.name,
                      val: c.val,
                    })),
                  ].map((row, idx) => {
                    const parsed = parseChargeDetails(row.val);
                    const isIncluded = parsed.status === 'included';
                    const isExcluded = parsed.status === 'excluded';

                    let displayStatus = '—';
                    let displayAmt = '—';

                    if (isIncluded) {
                      displayStatus = 'Included';
                      displayAmt = parsed.amount > 0 ? `₹ ${parsed.amount.toLocaleString()}` : '—';
                    } else if (isExcluded) {
                      displayStatus = 'Excluded';
                      displayAmt = parsed.amount > 0 ? `₹ ${parsed.amount.toLocaleString()}` : '—';
                    } else if (parsed.amount > 0) {
                      displayStatus = '—';
                      displayAmt = `₹ ${parsed.amount.toLocaleString()}`;
                    } else if (parsed.rawText) {
                      displayStatus = '—';
                      displayAmt = parsed.rawText;
                    }

                    return (
                      <div key={idx} className="flex border-b border-blue-100 py-1 text-[10.5px] items-center bg-white hover:bg-slate-50/50">
                        <div className="w-12 text-center text-slate-500 font-semibold border-r border-blue-100">{row.sr}</div>
                        <div className="flex-1 text-left px-2 font-medium text-black border-r border-blue-100">{row.name}</div>
                        <div className={`w-36 text-center border-r border-blue-100 text-[10px] font-semibold ${
                          isIncluded ? 'text-emerald-700' : isExcluded ? 'text-rose-700' : 'text-slate-600'
                        }`}>
                          {displayStatus}
                        </div>
                        <div className={`w-36 text-right pr-2 font-semibold ${
                          isIncluded ? 'text-emerald-700' : isExcluded ? 'text-rose-700' : 'text-black'
                        }`}>
                          {displayAmt}
                        </div>
                      </div>
                    );
                  })}

                  {/* Sub Total */}
                  <div className="flex border-b border-[#1e3a8a] bg-[#1e3a8a]/10 font-bold py-1 text-[11px] items-center">
                    <div className="w-12 text-center border-r border-blue-200">•</div>
                    <div className="flex-1 text-left px-2 uppercase tracking-wide text-slate-900 font-black border-r border-blue-200">Sub Total (Charge Details)</div>
                    <div className="w-36 text-center text-slate-600 text-[10px] border-r border-blue-200">Charge Details</div>
                    <div className="w-36 text-right pr-2 font-black text-slate-900">₹ {totals.subTotal.toLocaleString()}</div>
                  </div>

                  {/* Declared Goods Value Row */}
                  <div className="flex border-b border-blue-100 py-1 text-[10.5px] items-center bg-amber-50/40">
                    <div className="w-12 text-center text-slate-500 border-r border-blue-100">i</div>
                    <div className="flex-1 text-left px-2 font-medium text-black border-r border-blue-100">
                      Goods Value Declared (Insurance Basis Only)
                    </div>
                    <div className="w-36 text-center border-r border-blue-100 text-[10px] font-semibold text-slate-600">
                      Not charged
                    </div>
                    <div className="w-36 text-right pr-2 font-semibold text-amber-800">
                      {totals.goodsVal > 0 ? `₹ ${totals.goodsVal.toLocaleString()}` : 'Nil'}
                    </div>
                  </div>

                  {/* Insurance Row */}
                  <div className="flex border-b border-blue-100 py-1 text-[10.5px] items-center bg-white">
                    <div className="w-12 text-center text-slate-500 border-r border-blue-100">+</div>
                    <div className="flex-1 text-left px-2 font-medium text-black border-r border-blue-100">
                      Insurance Charges ({totals.insPercent})
                      {parseChargeNumber(quotation.goodsValue) > 0 && (
                        <span className="text-[10px] text-slate-500 ml-1.5 font-normal">(on declared goods value of ₹ {parseChargeNumber(quotation.goodsValue).toLocaleString()})</span>
                      )}
                    </div>
                    <div className="w-36 text-center border-r border-blue-100 text-[10px] font-semibold text-slate-600">
                      {totals.insStatus === 'Exempted' ? 'Excluded' : `@ ${totals.insPercent} on Goods`}
                    </div>
                    <div className="w-36 text-right pr-2 font-semibold text-black">
                      {totals.insuranceNum > 0 ? `₹ ${totals.insuranceNum.toLocaleString()}` : '—'}
                    </div>
                  </div>

                  {/* Grand Total Row */}
                  <div className="flex bg-[#1e3a8a] font-black py-1.5 text-white text-[12px] items-center">
                    <div className="w-12 text-center border-r border-white/30">★</div>
                    <div className="flex-1 text-left px-2 uppercase tracking-wider font-black border-r border-white/30">Grand Total (Net Payable)</div>
                    <div className="w-36 text-center text-[10.5px] text-amber-200 border-r border-white/30 font-bold">All Inclusive Total</div>
                    <div className="w-36 text-right pr-2 font-black text-amber-300 text-[13px]">₹ {Math.round(totals.grandTotal).toLocaleString()}</div>
                  </div>
                </div>

                {/* Amount in words & Advance / Balance box */}
                <div className="border-b border-[#1e3a8a] p-2 bg-[#f8fafc] flex justify-between items-center text-[10.5px]">
                  <div className="w-[58%]">
                    <span className="font-semibold text-slate-600 block text-[9.5px] uppercase tracking-wider">Payable Amount in Words:</span>
                    <span className="font-black text-black capitalize text-[11px]">{wordsAmount || ''}</span>
                  </div>
                  <div className="w-[40%] border-l border-slate-300 pl-3">
                    <span className="font-semibold text-slate-600 block text-[9.5px] uppercase tracking-wider">Advance & Balance:</span>
                    <div className="text-black font-bold">
                      <span>Advance Paid: ₹ {totals.advanceNum.toLocaleString()}</span>
                      <span className="text-rose-800 ml-2">| Balance Due: ₹ {totals.balanceDue.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Signatures Row (Clean 2 Columns matching quotation template without bank details) */}
                <div className="grid grid-cols-12 border-b border-[#1e3a8a] min-h-[145px] bg-white mt-auto">
                  
                  {/* Left (Col 1): Authorized Signature & Stamp (6 Columns) */}
                  <div className="col-span-6 border-r border-[#1e3a8a] p-3 flex flex-col justify-between items-center text-center relative group">
                    <div className="font-bold text-[11px] leading-tight">
                      For <span className="text-[#1e3a8a] font-black">Urban</span><span className="text-[#dc2626] font-black">Pro</span><br />
                      <span className="text-[#1e3a8a] font-extrabold uppercase text-[10px] tracking-wider">Packers & Logistics</span><br />
                    </div>

                    {/* Signature Click-to-edit */}
                    <div 
                      className="flex flex-col items-center justify-center my-auto py-1 min-h-[55px] cursor-pointer relative"
                      onClick={() => setIsEditingSign(!isEditingSign)}
                      title="Click to customize authorized signature"
                    >
                      <img 
                        src={globalSignature?.image || authSignImage || PRAKASH_SIGNATURE_BASE64} 
                        alt="Authorized Signature & Stamp" 
                        className="max-h-14 max-w-[160px] object-contain" 
                      />
                      <span className="text-[8px] text-blue-600 bg-blue-50 border border-blue-200 px-1 py-0.2 rounded opacity-0 group-hover:opacity-100 transition-opacity print:hidden">
                        Change signature
                      </span>
                    </div>

                    {/* Popover to customize */}
                    {isEditingSign && (
                      <div 
                        className="absolute top-8 left-4 right-4 bg-white rounded-lg shadow-xl border border-slate-300 p-2.5 z-30 text-left print:hidden"
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

                    <div className="text-blue-700 font-bold text-[10.5px] uppercase">
                      {authSignTitle || 'Authorized Signature'}
                    </div>
                  </div>

                  {/* Right (Col 2): Receiver Agreement & Signature (6 Columns) */}
                  <div className="col-span-6 p-4 flex flex-col justify-between text-left">
                    <div className="text-[11px] sm:text-[11.5px] text-slate-900 leading-snug font-medium">
                      Agree with Terms & Conditions as Overleaf Signature Receiver's
                    </div>
                    <div className="mt-auto pt-8 border-t border-dashed border-slate-400 text-[10px] text-slate-600 text-center font-bold">
                      Receiver's Signature
                    </div>
                  </div>

                </div>

                {/* Bottom Prohibited Warning Note */}
                <div className="p-2 text-[10px] text-[#1e3a8a] leading-tight bg-blue-50 font-medium border-t border-[#1e3a8a]">
                  <strong>Note:</strong> Please keep your Cash/Jewellery and anyway in your Custody/Lock" Carring Liquor, Gas Cylinder, Acid of any type of Liquids (like Ghee Tin, Oil etc.) is totally prohibited.
                </div>

                {/* Bottom Customer Care Support Bar */}
                <div className="bg-[#1e3a8a] text-center font-bold py-1.5 text-[12px] text-white tracking-wide border-t border-[#1e3a8a]">
                  24x7 Customer Care Support <span className="text-amber-300 font-extrabold ml-1">8093017400</span>
                </div>
              </div>
            )}

            {/* ================= PAGE 2 (TERMS & CONDITIONS) ================= */}
            {(activePage === 'both' || activePage === 'page2') && (
              <div 
                id="quotation-page-2"
                className="bg-white w-[794px] max-w-[794px] shadow-2xl border-2 border-[#1e3a8a] text-[11.5px] text-black font-sans box-border relative mx-auto p-4 flex flex-col justify-between min-h-[1123px] print:border print:border-[#1e3a8a] print:shadow-none print:w-[794px] print:max-w-[794px] print:min-h-[1120px]"
              >
                <div>
                  {/* Terms and Conditions List */}
                  <div className="space-y-4 px-3 pt-2 text-black font-medium leading-relaxed text-[11.5px]">
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
                      <p className="font-bold text-black leading-tight">
                        For <span className="text-[#1e3a8a] font-black">Urban</span><span className="text-[#dc2626] font-black">Pro</span><br />
                        <span className="text-[#1e3a8a] font-extrabold uppercase text-[11px] tracking-wider">Packers & Logistics</span><br />
                      </p>
                      <div className="flex flex-col items-end">
                        <img 
                          src={globalSignature?.image || authSignImage || PRAKASH_SIGNATURE_BASE64} 
                          alt="Authorized Signature & Stamp" 
                          className="max-h-16 max-w-[160px] object-contain mb-1" 
                        />
                        <span className="text-[11px] font-bold text-black uppercase border-t border-slate-300 pt-0.5 px-4">
                          Authorized Signatory & Stamp
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Customer Care Support Bar */}
                <div className="bg-[#1e3a8a] text-center font-bold py-1.5 text-[12px] text-white tracking-wide border border-[#1e3a8a] mt-12">
                  24x7 Customer Care Support <span className="text-amber-300 font-extrabold ml-1">8093017400</span>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
