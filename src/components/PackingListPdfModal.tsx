import React, { useState, useEffect } from 'react';
import { Printer, X, Download, Share2, PackageCheck, MapPin, Phone, User, Calendar, ShieldCheck, Box, Hash } from 'lucide-react';
import jsPDF from 'jspdf';
import { renderElementToCanvas, downloadPdfFromElement } from '../utils/pdfExport';
import { UPL_LOGO_BASE64 } from '../assets/logoBase64';

export interface PackingListItem {
  id?: string | number;
  name: string;
  qty: string | number;
  boxNo: string | number;
  value: string | number;
  remark: string;
}

export interface PackingListData {
  id: string | number;
  packingListNo: string | number;
  packingListDate: string;
  partyName: string;
  mobileNo: string;
  quotationRef?: string;
  fromCountry?: string;
  fromState?: string;
  fromCity?: string;
  fromArea?: string;
  fromPincode?: string;
  fromFloor?: string;
  toCountry?: string;
  toState?: string;
  toCity?: string;
  toArea?: string;
  toPincode?: string;
  toFloor?: string;
  items: PackingListItem[];
  totalBoxes?: number;
  totalItems?: number;
  totalValue?: number;
  status?: string;
}

interface PackingListPdfModalProps {
  packingList: PackingListData | null;
  onClose: () => void;
  globalSignature?: { text: string; image?: string };
  companyLogo?: string;
  companyProfile?: any;
}

export const PackingListPdfModal: React.FC<PackingListPdfModalProps> = ({ 
  packingList, 
  onClose, 
  globalSignature,
  companyLogo,
  companyProfile
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [authSignName, setAuthSignName] = useState('VIJAY');
  const [authSignTitle, setAuthSignTitle] = useState('Authorized Supervisor');
  const [isEditingSign, setIsEditingSign] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!packingList) return null;

  const totalQty = (packingList.items || []).reduce(
    (sum, it) => sum + (parseInt(String(it.qty)) || (it.name ? 1 : 0)),
    0
  );

  const totalValueNum = (packingList.items || []).reduce(
    (sum, it) => sum + (parseFloat(String(it.value)) || 0),
    0
  );

  // Extract distinct box numbers
  const distinctBoxes = new Set(
    (packingList.items || [])
      .map(it => String(it.boxNo || '').trim())
      .filter(b => b.length > 0)
  ).size || 1;

  // Ensure at least 5 rows for authentic look
  const rawItems = packingList.items || [];
  const displayItems = [...rawItems];
  while (displayItems.length < 5) {
    displayItems.push({ name: '', qty: '', boxNo: '', value: '', remark: '' });
  }

  const handlePrint = () => {
    setIsEditingSign(false);
    window.print();
  };

  const handleDownloadPdf = async () => {
    setIsEditingSign(false);
    setIsDownloading(true);
    setDownloadSuccess(false);

    try {
      const element = document.getElementById('printable-packing-list-pdf');
      if (!element) throw new Error('Printable element not found');

      const filename = `UrbanPro_PackingList_${packingList.packingListNo || packingList.id}_${(packingList.partyName || 'Customer').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;

      const result = await downloadPdfFromElement(element, filename);
      if (result.success) {
        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 5000);
      }
    } catch (err) {
      console.error('PDF generation error, fallback to print:', err);
      window.print();
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = () => {
    const text = `Packing List #${packingList.packingListNo} - UrbanPro Packer & Logistics for ${packingList.partyName} (${totalQty} Items): ${packingList.fromCity || 'Origin'} to ${packingList.toCity || 'Destination'}. Helpline: 8093017400`;
    if (navigator.share) {
      navigator.share({
        title: `Packing List #${packingList.packingListNo}`,
        text: text,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard?.writeText(text);
      alert('Packing list details copied to clipboard!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex justify-center p-2 sm:p-4 md:p-6 print:p-0 print:bg-white print:fixed print:inset-0">
      <div className="relative bg-slate-100 rounded-2xl shadow-2xl max-w-4xl w-full flex flex-col my-auto max-h-[96vh] overflow-hidden print:max-h-none print:shadow-none print:bg-white print:w-full print:max-w-none print:rounded-none">
        
        {/* Modal Top Bar (Hidden in Print) */}
        <div className="bg-[#0f172a] text-white p-3 sm:p-4 px-6 flex justify-between items-center shrink-0 print:hidden border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#0284c7] flex items-center justify-center text-white">
              <PackageCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
                <span>Packing List #{packingList.packingListNo}</span>
                <span className="text-xs font-normal text-sky-400 bg-sky-950/60 px-2 py-0.5 rounded border border-sky-800/60">
                  {packingList.partyName}
                </span>
              </h2>
              <p className="text-xs text-slate-400">Inventory & Consignment Goods Sheet</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={handlePrint}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700 cursor-pointer"
              title="Print Packing List"
            >
              <Printer className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">Print</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="bg-[#0284c7] hover:bg-sky-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
              title="Download PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isDownloading ? 'Generating...' : downloadSuccess ? 'Downloaded!' : 'Download PDF'}</span>
            </button>

            <button
              onClick={handleShare}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              title="Share via WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Share</span>
            </button>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors ml-1 cursor-pointer"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Area */}
        <div className="flex-1 overflow-y-auto bg-slate-100 flex justify-center p-2 sm:p-6 print:p-0 print:bg-white print:overflow-visible">
          
          {/* Printable A4 Sheet - Exact Match to Official UrbanPro Format */}
          <div 
            id="printable-packing-list-pdf" 
            className="bg-white w-full max-w-[794px] shadow-lg border-2 border-[#f87171] text-[12px] text-black font-sans box-border relative mx-auto my-auto print:border print:border-[#f87171] print:shadow-none print:w-full print:max-w-none"
            style={{ fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
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

            {/* Packing List Title Bar in Maroon */}
            <div className="bg-[#800000] text-center font-bold py-1 border-b border-[#f87171] text-[12px] text-white tracking-wide">
              Packing List
            </div>

            {/* Customer Information (Underlined Format) */}
            <div className="p-3 border-b border-[#f87171] space-y-2.5 bg-white text-[11.5px]">
              {/* Row 1: Name and Packing List No. */}
              <div className="flex justify-between items-baseline gap-6">
                <div className="flex-1 flex items-baseline">
                  <span className="font-semibold text-black shrink-0">Name:</span>
                  <span className="flex-1 border-b border-black font-semibold text-black px-2 pb-0.5 ml-1">
                    {packingList.partyName || ''}
                  </span>
                </div>
                <div className="w-52 sm:w-64 flex items-baseline shrink-0">
                  <span className="font-semibold text-black shrink-0">Packing List No.</span>
                  <span className="flex-1 border-b border-black font-semibold text-black text-center px-2 pb-0.5 ml-1">
                    {packingList.packingListNo || packingList.id}
                  </span>
                </div>
              </div>

              {/* Row 2: Mobile, Move From, Move To, List Date */}
              <div className="flex items-baseline justify-between gap-3 sm:gap-4 flex-wrap sm:flex-nowrap">
                <div className="flex items-baseline flex-1 min-w-[130px]">
                  <span className="font-semibold text-black shrink-0">Mobile:</span>
                  <span className="flex-1 border-b border-black font-semibold text-black px-1 pb-0.5 ml-1">
                    {packingList.mobileNo || ''}
                  </span>
                </div>
                <div className="flex items-baseline flex-1 min-w-[140px]">
                  <span className="font-semibold text-black shrink-0 whitespace-nowrap">Move From:</span>
                  <span className="flex-1 border-b border-black font-semibold text-black px-1 pb-0.5 ml-1">
                    {packingList.fromCity || packingList.fromArea || ''}
                  </span>
                </div>
                <div className="flex items-baseline flex-1 min-w-[140px]">
                  <span className="font-semibold text-black shrink-0 whitespace-nowrap">Move To:</span>
                  <span className="flex-1 border-b border-black font-semibold text-black px-1 pb-0.5 ml-1">
                    {packingList.toCity || packingList.toArea || ''}
                  </span>
                </div>
                <div className="flex items-baseline flex-1 min-w-[140px]">
                  <span className="font-semibold text-black shrink-0 whitespace-nowrap">List Date</span>
                  <span className="flex-1 border-b border-black font-semibold text-black px-1 pb-0.5 ml-1 text-center">
                    {packingList.packingListDate || ''}
                  </span>
                </div>
              </div>
            </div>

            {/* Inventory Items Table */}
            <div className="w-full bg-white">
              {/* Table Header */}
              <div className="flex bg-[#ffb3b3] font-semibold text-[11px] text-center border-b border-[#f87171] py-1 text-black">
                <div className="w-12 border-r border-[#f87171] flex items-center justify-center shrink-0">Sr.</div>
                <div className="flex-1 border-r border-[#f87171] flex items-center justify-center">Item Name</div>
                <div className="w-20 sm:w-24 border-r border-[#f87171] flex items-center justify-center shrink-0">Quantity</div>
                <div className="w-20 sm:w-24 border-r border-[#f87171] flex items-center justify-center shrink-0">Box No.</div>
                <div className="w-24 sm:w-28 border-r border-[#f87171] flex items-center justify-center shrink-0">Value (in Rs.)</div>
                <div className="w-32 sm:w-36 flex items-center justify-center shrink-0">Remark</div>
              </div>

              {/* Table Rows */}
              <div className="min-h-[140px] flex flex-col">
                {displayItems.map((item, idx) => (
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
                    <div className="w-20 sm:w-24 border-r border-[#f87171] flex items-center justify-center shrink-0">
                      {item.name ? (item.qty || 1) : ''}
                    </div>
                    <div className="w-20 sm:w-24 border-r border-[#f87171] flex items-center justify-center shrink-0">
                      {item.name ? (item.boxNo || '') : ''}
                    </div>
                    <div className="w-24 sm:w-28 border-r border-[#f87171] flex items-center justify-center shrink-0">
                      {item.name ? (item.value || '0') : ''}
                    </div>
                    <div className="w-32 sm:w-36 px-2 text-left flex items-center text-[10.5px] shrink-0">
                      {item.remark || ''}
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary Row (Total & Value in pink blocks matching original) */}
              <div className="flex text-[11.5px] font-bold border-b border-t border-[#f87171] text-center bg-white text-black">
                <div className="w-12 border-r border-[#f87171] py-1 shrink-0"></div>
                <div className="flex-1 border-r border-[#f87171] py-1"></div>
                <div className="w-20 sm:w-24 border-r border-[#f87171] bg-[#ffb3b3] py-1 flex items-center justify-center shrink-0">
                  Total: {totalQty}
                </div>
                <div className="w-20 sm:w-24 border-r border-[#f87171] py-1 shrink-0"></div>
                <div className="w-24 sm:w-28 border-r border-[#f87171] bg-[#ffb3b3] py-1 flex items-center justify-center shrink-0">
                  Value: {totalValueNum}
                </div>
                <div className="w-32 sm:w-36 py-1 shrink-0"></div>
              </div>
            </div>

            {/* Signatures Box */}
            <div className="flex border-b border-[#f87171] min-h-[145px] bg-white">
              {/* Left Signature: UrbanPro */}
              <div className="w-1/2 border-r border-[#f87171] p-3 flex flex-col justify-between items-center text-center relative group">
                <div className="font-bold text-[12px] tracking-wide leading-tight">
                  For <span className="text-[#1e3a8a] font-black">Urban</span><span className="text-[#dc2626] font-black">Pro</span><br />
                  <span className="text-[#1e3a8a] font-extrabold uppercase text-[10.5px] tracking-wider">Packers & Logistics</span>
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
                      alt="Authorized Signature" 
                      className="max-h-12 w-auto object-contain" 
                    />
                  ) : (
                    <div className="flex flex-col items-center">
                      <svg className="w-10 h-7 text-[#2563eb]" viewBox="0 0 100 60" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M38 48 C30 35, 24 15, 36 10 C46 6, 52 24, 44 45 C40 54, 34 58, 30 59" />
                        <path d="M46 26 C54 18, 66 14, 62 34 C58 48, 50 54, 46 58" />
                        <path d="M52 38 C60 36, 70 38, 68 50" />
                      </svg>
                      <span className="font-bold text-[10.5px] text-black tracking-wider uppercase">{globalSignature?.text || authSignName || 'VIJAY'}</span>
                    </div>
                  )}
                  <span className="text-[8px] text-blue-600 bg-blue-50 border border-blue-200 px-1 py-0.2 rounded opacity-0 group-hover:opacity-100 transition-opacity print:hidden">
                    Change signature
                  </span>
                </div>

                {/* Popover for quick signature customization */}
                {isEditingSign && (
                  <div 
                    className="absolute z-20 bottom-12 left-1/2 -translate-x-1/2 bg-white border border-slate-300 shadow-xl rounded-lg p-3 w-56 text-left print:hidden"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-xs text-slate-800">Customize Signature</span>
                      <button onClick={() => setIsEditingSign(false)} className="text-slate-400 hover:text-slate-600 text-xs">✕</button>
                    </div>

                    <div className="mb-2">
                      <label className="block text-[10px] text-slate-600 font-semibold mb-0.5">Signer Name</label>
                      <input 
                        type="text"
                        value={authSignName}
                        onChange={(e) => setAuthSignName(e.target.value)}
                        className="w-full text-xs border border-slate-300 rounded px-2 py-1"
                        placeholder="e.g. VIJAY"
                      />
                    </div>

                    <div className="mb-2">
                      <label className="block text-[10px] text-slate-600 font-semibold mb-0.5">Signer Designation</label>
                      <input 
                        type="text"
                        value={authSignTitle}
                        onChange={(e) => setAuthSignTitle(e.target.value)}
                        className="w-full text-xs border border-slate-300 rounded px-2 py-1"
                        placeholder="e.g. Authorized Signature"
                      />
                    </div>

                    <button
                      onClick={() => setIsEditingSign(false)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white text-[10.5px] font-semibold py-1 rounded cursor-pointer"
                    >
                      Done
                    </button>
                  </div>
                )}

                <div className="text-blue-700 font-bold text-[11px] tracking-wide">
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
              We have verified and confirmed all items listed as 01-{Math.max(1, packingList.items?.length || 1)}, with a total count of {totalQty || 1}. This represents a true and comprehensive inventory of the presented goods, acknowledging that their condition may vary.
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
