import React, { useState } from 'react';
import { Printer, Save, Plus, FileText, Sparkles, Building2, Download, Check, ExternalLink, Loader2, Share2 } from 'lucide-react';
import { UPL_LOGO_BASE64 } from '../assets/logoBase64';
import { PRAKASH_SIGNATURE_BASE64 } from '../assets/signatureBase64';
import { downloadPdfFromElement, openElementInPrintWindow } from '../utils/pdfExport';
import { shareDocument } from '../utils/shareUtils';

export interface MoneyReceiptData {
  id: string;
  receiptNo: string;
  date: string;
  
  // Receipt Details
  receiptAgainst: 'Quotation' | 'Bill';
  quotationBillNo: string;
  quotationBillDate: string;

  // Client / Relocation Details
  partyName: string;
  mobileNo: string;
  relocateFrom: string;
  relocateTo: string;
  branchCity: string;
  panNo?: string;

  // Payment Details
  paymentType: 'Advance' | 'Part' | 'Full' | 'Token Money';
  amount: number;
  amountInWords: string;
  paymentMode: 'Cash' | 'Cheque' | 'UPI' | 'Net Banking' | 'Digital Wallet' | 'Draft';
  paymentRefNo: string;
  additionalInfo?: string;

  // Compatibility
  receivedFrom?: string;
  paidAgainst?: string;
}

interface Props {
  moneyReceipts: MoneyReceiptData[];
  onSave: (data: MoneyReceiptData) => void;
  onDelete: (id: string) => void;
  customerProfiles?: any[];
  globalSignature?: { text: string; image?: string };
  companyProfile?: any;
}

function numberToWordsRupees(num: number): string {
  if (!num || isNaN(num) || num <= 0) return 'Zero Rupees Only';
  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function inWords(n: number): string {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? ' ' + a[n % 10] : '');
    if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + inWords(n % 100) : '');
    if (n < 100000) return inWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + inWords(n % 1000) : '');
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + inWords(n % 100000) : '');
    return inWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + inWords(n % 10000000) : '');
  }

  return inWords(Math.floor(num)) + ' Rupees Only';
}

export const MoneyReceiptView: React.FC<Props> = ({ 
  moneyReceipts, 
  onSave, 
  onDelete, 
  customerProfiles = [], 
  globalSignature,
  companyProfile
}) => {
  const [viewMode, setViewMode] = useState<'form' | 'list' | 'preview'>('form');
  const [selectedRecord, setSelectedRecord] = useState<MoneyReceiptData | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleDownloadReceiptPdf = async (recData?: MoneyReceiptData) => {
    const rec = recData || selectedRecord;
    if (!rec) return;

    try {
      setIsDownloading(true);
      setDownloadSuccess(false);

      const printableElement = document.getElementById('printable-money-receipt-pdf');
      if (!printableElement) {
        window.print();
        return;
      }

      const filename = `UrbanPro_MoneyReceipt_${rec.receiptNo || '1'}_${(rec.partyName || rec.receivedFrom || 'Customer').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      const result = await downloadPdfFromElement(printableElement, filename);

      if (result.success) {
        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 5000);
      }
    } catch (err) {
      console.error('Error downloading Receipt PDF:', err);
      window.print();
    } finally {
      setIsDownloading(false);
    }
  };

  const handleOpenInNewTab = (rec?: MoneyReceiptData) => {
    const printableElement = document.getElementById('printable-money-receipt-pdf');
    if (printableElement) {
      const rNo = (rec || selectedRecord)?.receiptNo || '1';
      openElementInPrintWindow(printableElement, `UrbanPro Money Receipt #${rNo}`);
    } else {
      window.print();
    }
  };

  const initialForm: MoneyReceiptData = {
    id: `mr-${Date.now()}`,
    receiptNo: `${moneyReceipts.length + 1}`,
    date: new Date().toISOString().split('T')[0],
    receiptAgainst: 'Quotation',
    quotationBillNo: 'Q-1001',
    quotationBillDate: new Date().toISOString().split('T')[0],
    partyName: '',
    mobileNo: '',
    relocateFrom: '',
    relocateTo: '',
    branchCity: 'Bhubaneswar',
    panNo: 'AKMPV0774C',
    paymentType: 'Token Money',
    amount: 5000,
    amountInWords: 'Five Thousand Rupees Only',
    paymentMode: 'Cash',
    paymentRefNo: '',
    additionalInfo: ''
  };

  const [form, setForm] = useState<MoneyReceiptData>(initialForm);

  const handleAmountChange = (val: number) => {
    setForm(prev => ({
      ...prev,
      amount: val,
      amountInWords: numberToWordsRupees(val)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalForm: MoneyReceiptData = {
      ...form,
      receivedFrom: form.partyName,
      paidAgainst: `${form.paymentType} Payment towards ${form.receiptAgainst} No. ${form.quotationBillNo}`
    };
    onSave(finalForm);
    setSelectedRecord(finalForm);
    setViewMode('preview');
  };

  const handleShareReceipt = async (receipt: MoneyReceiptData) => {
    const shareText = `💳 *UrbanPro Packers & Logistics*
*MONEY RECEIPT #${receipt.receiptNo}*
----------------------------------------
👤 *Received From:* ${receipt.partyName || receipt.receivedFrom}
📞 *Mobile:* ${receipt.mobileNo || ''}
📅 *Receipt Date:* ${receipt.date}
📍 *Route:* ${receipt.relocateFrom || 'Origin'} ➔ ${receipt.relocateTo || 'Destination'}
📄 *Against:* ${receipt.paymentType || 'Payment'} towards ${receipt.receiptAgainst || 'Quotation'} #${receipt.quotationBillNo || 'N/A'}
💰 *Amount Received:* ₹ ${Number(receipt.amount).toLocaleString()}
💵 *Payment Mode:* ${receipt.paymentMode} ${receipt.paymentRefNo ? `(Ref: ${receipt.paymentRefNo})` : ''}
📝 *In Words:* ${receipt.amountInWords}
----------------------------------------
*Regd. Office:* Ward No. 3, Near Old SBI ATM, Dipka, Korba, CG – 495452
*Main Operational Office:* Plot No 1491, Balintha Canal Road, Hanspal, Bhubaneswar, Odisha – 752101
*Helpline:* 8093017400 / 8093017402`;

    await shareDocument({
      title: `Money Receipt #${receipt.receiptNo} - UrbanPro`,
      text: shareText,
      phone: receipt.mobileNo,
    });
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-400" /> Money Receipt
          </h1>
          <p className="text-xs text-blue-200 mt-0.5">Payment acknowledgment & advance receipt generator</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => { setForm({ ...initialForm, id: `mr-${Date.now()}`, receiptNo: `${moneyReceipts.length + 1}` }); setViewMode('form'); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${viewMode === 'form' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-800 text-slate-300 hover:text-white'}`}
          >
            <Plus className="w-3.5 h-3.5 inline mr-1" /> Add Money Receipt
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${viewMode === 'list' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-800 text-slate-300 hover:text-white'}`}
          >
            <FileText className="w-3.5 h-3.5 inline mr-1" /> All Money Receipts ({moneyReceipts.length})
          </button>
        </div>
      </div>

      {viewMode === 'form' && (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
          
          {/* Section 1: Receipt Details */}
          <div className="border border-emerald-300 border-l-4 border-l-emerald-500 rounded-2xl p-6 pt-7 relative bg-white shadow-sm space-y-4">
            <span className="absolute -top-3.5 left-6 bg-emerald-500 text-white px-4 py-1 rounded-md text-xs font-bold shadow-sm">
              Receipt Details
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className="border border-slate-300 rounded-xl p-2.5 px-3 bg-white focus-within:ring-2 focus-within:ring-emerald-500">
                <label className="block text-[11px] text-slate-500 font-bold mb-0.5">Receipt No. *</label>
                <input 
                  type="text" 
                  required 
                  value={form.receiptNo} 
                  onChange={e => setForm({ ...form, receiptNo: e.target.value })} 
                  className="w-full outline-none text-slate-800 text-sm font-bold bg-transparent" 
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-2.5 px-3 bg-white focus-within:ring-2 focus-within:ring-emerald-500">
                <label className="block text-[11px] text-slate-500 font-bold mb-0.5">Receipt Date *</label>
                <input 
                  type="date" 
                  required 
                  value={form.date} 
                  onChange={e => setForm({ ...form, date: e.target.value })} 
                  className="w-full outline-none text-slate-800 text-sm font-medium bg-transparent" 
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-2.5 px-3 bg-white focus-within:ring-2 focus-within:ring-emerald-500">
                <label className="block text-[11px] text-slate-500 font-bold mb-0.5">Receipt Against *</label>
                <select 
                  value={form.receiptAgainst} 
                  onChange={e => setForm({ ...form, receiptAgainst: e.target.value as 'Quotation' | 'Bill' })} 
                  className="w-full outline-none text-slate-800 text-sm font-semibold bg-transparent cursor-pointer"
                >
                  <option value="Quotation">Quotation</option>
                  <option value="Bill">Bill</option>
                </select>
              </div>

              <div className="border border-slate-300 rounded-xl p-2.5 px-3 bg-white focus-within:ring-2 focus-within:ring-emerald-500">
                <label className="block text-[11px] text-slate-500 font-bold mb-0.5">Quotation/Bill No.</label>
                <input 
                  type="text" 
                  placeholder="e.g. Q-1001 or BILL-204"
                  value={form.quotationBillNo} 
                  onChange={e => setForm({ ...form, quotationBillNo: e.target.value })} 
                  className="w-full outline-none text-slate-800 text-sm font-medium bg-transparent" 
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-2.5 px-3 bg-white focus-within:ring-2 focus-within:ring-emerald-500 md:col-span-2">
                <label className="block text-[11px] text-slate-500 font-bold mb-0.5">Quotation/Bill Date</label>
                <input 
                  type="date" 
                  value={form.quotationBillDate} 
                  onChange={e => setForm({ ...form, quotationBillDate: e.target.value })} 
                  className="w-full outline-none text-slate-800 text-sm font-medium bg-transparent" 
                />
              </div>
            </div>
          </div>

          {/* Section 2: Client / Relocation Details */}
          <div className="border border-sky-300 border-l-4 border-l-sky-500 rounded-2xl p-6 pt-7 relative bg-white shadow-sm space-y-4">
            <span className="absolute -top-3.5 left-6 bg-sky-500 text-white px-4 py-1 rounded-md text-xs font-bold shadow-sm">
              Client/Relocation Details
            </span>

            {customerProfiles.length > 0 && (
              <div className="pt-1 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                  <span>Auto-fill Customer Profile:</span>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                  {customerProfiles.slice(0, 6).map((cp, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setForm(prev => ({ 
                        ...prev, 
                        partyName: cp.partyName || cp.name || '', 
                        mobileNo: cp.mobileNo || cp.phone || '',
                        relocateFrom: cp.relocateFrom || cp.fromCity || prev.relocateFrom,
                        relocateTo: cp.relocateTo || cp.toCity || prev.relocateTo
                      }))}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-sky-800 border rounded-lg text-xs font-medium cursor-pointer"
                    >
                      {cp.partyName || cp.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className="border border-slate-300 rounded-xl p-2.5 px-3 bg-white focus-within:ring-2 focus-within:ring-sky-500">
                <label className="block text-[11px] text-slate-500 font-bold mb-0.5">Party Name *</label>
                <input 
                  type="text" 
                  required 
                  placeholder="Client Full Name"
                  value={form.partyName} 
                  onChange={e => setForm({ ...form, partyName: e.target.value })} 
                  className="w-full outline-none text-slate-800 text-sm font-semibold bg-transparent" 
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-2.5 px-3 bg-white focus-within:ring-2 focus-within:ring-sky-500">
                <label className="block text-[11px] text-slate-500 font-bold mb-0.5">Client Mobile No.</label>
                <input 
                  type="tel" 
                  placeholder="Mobile / Contact No."
                  value={form.mobileNo} 
                  onChange={e => setForm({ ...form, mobileNo: e.target.value })} 
                  className="w-full outline-none text-slate-800 text-sm font-medium bg-transparent" 
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-2.5 px-3 bg-white focus-within:ring-2 focus-within:ring-sky-500">
                <label className="block text-[11px] text-slate-500 font-bold mb-0.5">Relocate From</label>
                <input 
                  type="text" 
                  placeholder="Origin Address / City"
                  value={form.relocateFrom} 
                  onChange={e => setForm({ ...form, relocateFrom: e.target.value })} 
                  className="w-full outline-none text-slate-800 text-sm font-medium bg-transparent" 
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-2.5 px-3 bg-white focus-within:ring-2 focus-within:ring-sky-500">
                <label className="block text-[11px] text-slate-500 font-bold mb-0.5">Relocate To</label>
                <input 
                  type="text" 
                  placeholder="Destination Address / City"
                  value={form.relocateTo} 
                  onChange={e => setForm({ ...form, relocateTo: e.target.value })} 
                  className="w-full outline-none text-slate-800 text-sm font-medium bg-transparent" 
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-2.5 px-3 bg-white focus-within:ring-2 focus-within:ring-sky-500 md:col-span-2">
                <label className="block text-[11px] text-slate-500 font-bold mb-0.5">Branch City</label>
                <input 
                  type="text" 
                  placeholder="e.g. Bhubaneswar"
                  value={form.branchCity} 
                  onChange={e => setForm({ ...form, branchCity: e.target.value })} 
                  className="w-full outline-none text-slate-800 text-sm font-medium bg-transparent" 
                />
              </div>
            </div>
          </div>

          {/* Section 3: Payment Details */}
          <div className="border border-slate-800 border-l-4 border-l-slate-900 rounded-2xl p-6 pt-7 relative bg-white shadow-sm space-y-4">
            <span className="absolute -top-3.5 left-6 bg-slate-900 text-white px-4 py-1 rounded-md text-xs font-bold shadow-sm">
              Payment Details
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className="border border-slate-300 rounded-xl p-2.5 px-3 bg-white focus-within:ring-2 focus-within:ring-slate-800">
                <label className="block text-[11px] text-slate-500 font-bold mb-0.5">Payment Type *</label>
                <select 
                  value={form.paymentType} 
                  onChange={e => setForm({ ...form, paymentType: e.target.value as any })} 
                  className="w-full outline-none text-slate-800 text-sm font-bold bg-transparent cursor-pointer"
                >
                  <option value="Token Money">Token Money</option>
                  <option value="Advance">Advance</option>
                  <option value="Part">Part</option>
                  <option value="Full">Full</option>
                </select>
              </div>

              <div className="border border-slate-300 rounded-xl p-2.5 px-3 bg-white focus-within:ring-2 focus-within:ring-slate-800">
                <label className="block text-[11px] text-slate-500 font-bold mb-0.5">Receipt Amount (₹) *</label>
                <input 
                  type="number" 
                  required 
                  value={form.amount} 
                  onChange={e => handleAmountChange(parseFloat(e.target.value) || 0)} 
                  className="w-full outline-none text-slate-800 text-sm font-bold bg-transparent" 
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-2.5 px-3 bg-white focus-within:ring-2 focus-within:ring-slate-800">
                <label className="block text-[11px] text-slate-500 font-bold mb-0.5">Payment Mode *</label>
                <select 
                  value={form.paymentMode} 
                  onChange={e => setForm({ ...form, paymentMode: e.target.value as any })} 
                  className="w-full outline-none text-slate-800 text-sm font-semibold bg-transparent cursor-pointer"
                >
                  <option value="Cash">Cash</option>
                  <option value="Cheque">Cheque</option>
                  <option value="UPI">UPI</option>
                  <option value="Net Banking">Net Banking</option>
                  <option value="Digital Wallet">Digital Wallet</option>
                  <option value="Draft">Draft</option>
                </select>
              </div>

              <div className="border border-slate-300 rounded-xl p-2.5 px-3 bg-white focus-within:ring-2 focus-within:ring-slate-800">
                <label className="block text-[11px] text-slate-500 font-bold mb-0.5">Reference/Transaction No.</label>
                <input 
                  type="text" 
                  placeholder="e.g. UPI-9028109281 / Chq #00129"
                  value={form.paymentRefNo} 
                  onChange={e => setForm({ ...form, paymentRefNo: e.target.value })} 
                  className="w-full outline-none text-slate-800 text-sm font-medium bg-transparent" 
                />
              </div>

              <div className="md:col-span-2 border border-slate-300 rounded-xl p-2.5 px-3 bg-white focus-within:ring-2 focus-within:ring-slate-800">
                <label className="block text-[11px] text-slate-500 font-bold mb-0.5">Amount in Words</label>
                <input 
                  type="text" 
                  value={form.amountInWords} 
                  onChange={e => setForm({ ...form, amountInWords: e.target.value })} 
                  className="w-full outline-none text-slate-800 text-sm font-medium bg-transparent" 
                />
              </div>

              <div className="md:col-span-2 border border-slate-300 rounded-xl p-2.5 px-3 bg-white focus-within:ring-2 focus-within:ring-slate-800">
                <label className="block text-[11px] text-slate-500 font-bold mb-0.5">Additional Info.</label>
                <textarea 
                  rows={2} 
                  placeholder="Any additional remarks or note..."
                  value={form.additionalInfo || ''} 
                  onChange={e => setForm({ ...form, additionalInfo: e.target.value })} 
                  className="w-full outline-none text-slate-800 text-xs font-medium bg-transparent resize-none" 
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-xl text-sm shadow-md transition-all cursor-pointer flex items-center gap-2 active:scale-95"
            >
              <Save className="w-4 h-4" /> Save & View Money Receipt
            </button>
          </div>
        </form>
      )}

      {viewMode === 'list' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <h2 className="text-lg font-bold text-slate-800">Saved Money Receipts</h2>
          {moneyReceipts.length === 0 ? <p className="text-slate-500 text-xs text-center py-8">No money receipts found.</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-bold border-b">
                    <th className="p-3">Receipt No</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Party Name</th>
                    <th className="p-3">Against</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Mode</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {moneyReceipts.map(rec => (
                    <tr key={rec.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold text-blue-800">{rec.receiptNo}</td>
                      <td className="p-3">{rec.date}</td>
                      <td className="p-3 font-semibold">{rec.partyName || rec.receivedFrom}</td>
                      <td className="p-3">{rec.receiptAgainst || 'Quotation'} ({rec.quotationBillNo || 'N/A'})</td>
                      <td className="p-3 font-medium text-emerald-800">{rec.paymentType || 'Token Money'}</td>
                      <td className="p-3">{rec.paymentMode}</td>
                      <td className="p-3 font-bold text-slate-900">₹{rec.amount.toLocaleString()}</td>
                      <td className="p-3 text-right space-x-1">
                        <button onClick={() => handleShareReceipt(rec)} className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg font-semibold cursor-pointer hover:bg-emerald-100" title="Share via WhatsApp">
                          <Share2 className="w-3.5 h-3.5 inline mr-0.5" /> Share
                        </button>
                        <button onClick={() => { setSelectedRecord(rec); setViewMode('preview'); }} className="px-2.5 py-1 bg-blue-50 text-blue-800 border border-blue-200 rounded-lg font-semibold cursor-pointer hover:bg-blue-100">View / Print</button>
                        <button onClick={() => onDelete(rec.id)} className="px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 rounded-lg font-semibold cursor-pointer hover:bg-red-100">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {viewMode === 'preview' && selectedRecord && (
        <div className="space-y-4 max-w-3xl mx-auto">
          {/* Top Control Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 text-white p-4 rounded-2xl print:hidden shadow-lg">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-sm block">Official Money Receipt</span>
                <span className="text-[11px] text-slate-400">Receipt #{selectedRecord.receiptNo} • {selectedRecord.partyName || selectedRecord.receivedFrom}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors"
              >
                Back to List
              </button>

              <button
                type="button"
                onClick={() => handleOpenInNewTab(selectedRecord)}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">New Tab</span>
              </button>

              <button
                type="button"
                onClick={() => handleShareReceipt(selectedRecord)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                title="Share via WhatsApp / Native Share"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>

              <button
                type="button"
                onClick={() => handleDownloadReceiptPdf(selectedRecord)}
                disabled={isDownloading}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-60 transition-all active:scale-95"
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generating PDF...</span>
                  </>
                ) : downloadSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>PDF Downloaded!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Download PDF</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
              >
                <Printer className="w-4 h-4" />
                <span>Print</span>
              </button>
            </div>
          </div>

          {downloadSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs animate-fadeIn print:hidden">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Money Receipt PDF successfully downloaded to your device downloads folder!</span>
            </div>
          )}

          {/* PDF Container - Matches PDF Template Screenshot Exactly */}
          <div 
            id="printable-money-receipt-pdf"
            className="bg-white rounded-2xl border-2 border-[#f87171] shadow-lg p-6 sm:p-8 space-y-4 max-w-3xl mx-auto print:max-w-none print:shadow-none print:border-2 print:border-[#f87171]"
          >
            {/* Top PAN Strip */}
            <div className="bg-[#ffb3b3] text-center font-bold py-1 border-b border-[#f87171] text-[11px] tracking-wide text-black uppercase">
              PAN No.: {companyProfile?.panNo || selectedRecord.panNo || 'AKMPV0774C'}
            </div>

            {/* Header Section */}
            <div className="flex border-b border-[#f87171] min-h-[96px]">
              {/* Left Logo Container */}
              <div className="w-[28%] border-r border-[#f87171] flex items-center justify-center p-2 bg-white">
                <img 
                  src={companyProfile?.logo || UPL_LOGO_BASE64 || '/urbanpro-logo.jpeg'} 
                  alt="UrbanPro Logo" 
                  className="max-h-20 w-auto object-contain" 
                />
              </div>

              {/* Center Title & Details */}
              <div className="w-[72%] p-2 text-center flex flex-col justify-center items-center bg-white">
                <div style={{ fontFamily: "'Times New Roman', Times, serif" }}>
                  <h1 className="text-[24px] sm:text-[28px] font-black tracking-tight leading-none">
                    <span style={{ color: '#1e3a8a' }}>Urban</span><span style={{ color: '#dc2626' }}>Pro</span>
                  </h1>
                  <h2 className="text-[13px] sm:text-[15px] font-extrabold tracking-wider uppercase mt-0.5" style={{ color: '#1e3a8a' }}>
                    Packers & Logistics
                  </h2>
                  <h3 className="text-[10.5px] font-bold text-red-700 tracking-wide uppercase mt-0.5">
                    (A Unit of M/s Prakash & Company India)
                  </h3>
                </div>
                <p className="text-[9.5px] sm:text-[10px] leading-tight text-slate-900 font-semibold mt-0.5">
                  <strong>Regd. Office:</strong> Ward No. 3, Near Old SBI ATM, Dipka, Korba, CG – 495452 | Tel: 8093017402
                </p>
                <p className="text-[9.5px] sm:text-[10px] leading-tight text-slate-900 font-semibold mt-0.5">
                  <strong>Main Operational Office:</strong> Plot No 1491, Balintha Canal Road, Near Lenskart, Hanspal, Bhubaneswar, Odisha – 752101 | Mobile: 8093017400
                </p>
                <p className="text-[9.5px] sm:text-[10px] leading-tight text-slate-800 font-medium mt-0.5">
                  <strong>GST No.:</strong> {companyProfile?.gstin || '22CCQPS8419D1ZC'} &nbsp;|&nbsp; <strong>Email:</strong> {companyProfile?.email || 'urbanpro403@gmail.com'}
                </p>
              </div>
            </div>

            {/* Olive Color Money Receipt Banner Line with WHITE text */}
            <div className="bg-[#6b8e23] text-white py-1.5 text-center font-bold text-sm tracking-widest uppercase shadow-xs" style={{ backgroundColor: '#6b8e23' }}>
              <span style={{ color: '#ffffff', fontWeight: 'bold' }}>M.R. (Money Receipt)</span>
            </div>

            {/* Underlined Printable Receipt Details Lines */}
            <div className="space-y-3.5 text-xs sm:text-sm pt-2 leading-relaxed text-slate-900 font-sans">
              
              {/* Line 1: Receipt No & Date */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-400 pb-1">
                <div>
                  <span className="font-bold text-slate-800">Receipt No.</span>{' '}
                  <span className="font-mono font-bold text-slate-900 border-b border-slate-800 px-2 min-w-[60px] inline-block">
                    {selectedRecord.receiptNo}
                  </span>
                </div>
                <div>
                  <span className="font-bold text-slate-800">Date.</span>{' '}
                  <span className="font-mono font-bold text-slate-900 border-b border-slate-800 px-2 min-w-[100px] inline-block">
                    {selectedRecord.date}
                  </span>
                </div>
              </div>

              {/* Line 2: Received with thanks from M/s & Phone No. */}
              <div className="flex flex-wrap items-center gap-2 border-b border-slate-400 pb-1">
                <span className="font-bold text-slate-800 shrink-0">Received with thanks from M/s.</span>
                <span className="font-bold text-slate-900 flex-1 border-b border-slate-800 px-2 min-w-[180px] inline-block">
                  {selectedRecord.partyName || selectedRecord.receivedFrom || ''}
                </span>
                <span className="font-bold text-slate-800 shrink-0">Phone No.</span>
                <span className="font-bold text-slate-900 border-b border-slate-800 px-2 min-w-[120px] inline-block">
                  {selectedRecord.mobileNo || ''}
                </span>
              </div>

              {/* Line 3: Towards Payment of Quotation / Bill No & Dated */}
              <div className="flex flex-wrap items-center gap-2 border-b border-slate-400 pb-1">
                <span className="font-bold text-slate-800 shrink-0">Towards</span>
                <span className="font-bold text-slate-900 border-b border-slate-800 px-2 min-w-[130px] inline-block">
                  {selectedRecord.paymentType ? `${selectedRecord.paymentType} Payment` : 'Token Money Payment'}
                </span>
                <span className="font-bold text-slate-800 shrink-0">of {selectedRecord.receiptAgainst || 'Quotation'} No.</span>
                <span className="font-bold text-slate-900 border-b border-slate-800 px-2 min-w-[90px] inline-block">
                  {selectedRecord.quotationBillNo || ''}
                </span>
                <span className="font-bold text-slate-800 shrink-0">Dated</span>
                <span className="font-bold text-slate-900 border-b border-slate-800 px-2 min-w-[90px] inline-block">
                  {selectedRecord.quotationBillDate || ''}
                </span>
              </div>

              {/* Line 4: From & To */}
              <div className="flex flex-wrap items-center gap-2 border-b border-slate-400 pb-1">
                <span className="font-bold text-slate-800 shrink-0">From</span>
                <span className="font-bold text-slate-900 flex-1 border-b border-slate-800 px-2 min-w-[120px] inline-block">
                  {selectedRecord.relocateFrom || ''}
                </span>
                <span className="font-bold text-slate-800 shrink-0">To</span>
                <span className="font-bold text-slate-900 flex-1 border-b border-slate-800 px-2 min-w-[120px] inline-block">
                  {selectedRecord.relocateTo || ''}
                </span>
              </div>

              {/* Line 5: Payment Mode & Ref No */}
              <div className="flex flex-wrap items-center gap-2 border-b border-slate-400 pb-1">
                <span className="font-bold text-slate-800 shrink-0">Payment Mode</span>
                <span className="font-bold text-slate-900 border-b border-slate-800 px-2 min-w-[100px] inline-block">
                  {selectedRecord.paymentMode || 'Cash'}
                </span>
                <span className="font-bold text-slate-800 shrink-0">No.</span>
                <span className="font-bold text-slate-900 flex-1 border-b border-slate-800 px-2 min-w-[140px] inline-block">
                  {selectedRecord.paymentRefNo || ''}
                </span>
              </div>

              {/* Line 6: Amount in Words */}
              <div className="flex items-center gap-2 border-b border-slate-400 pb-1">
                <span className="font-bold text-slate-800 shrink-0">Rs.</span>
                <span className="font-bold text-slate-900 flex-1 border-b border-slate-800 px-2 inline-block">
                  {selectedRecord.amountInWords || numberToWordsRupees(selectedRecord.amount)}
                </span>
              </div>

              {/* Bottom Row: Box Amount & Authorized Signature */}
              <div className="pt-4 flex items-end justify-between">
                {/* Left Box Amount */}
                <div className="border-2 border-slate-900 rounded-lg px-5 py-2 bg-slate-50 inline-block font-mono font-black text-base sm:text-lg">
                  Rs. {selectedRecord.amount.toLocaleString()} /-
                </div>

                {/* Right Signature */}
                <div className="text-center space-y-1">
                  <div className="font-bold text-[10px] leading-tight">
                    For <span className="text-[#1e3a8a]">Urban</span><span className="text-[#dc2626]">Pro</span> <span className="text-[#1e3a8a]">Packers & Logistics</span><br />
                    <span className="text-[8.5px] text-slate-700 font-semibold">(A Unit of M/s Prakash & Company India)</span>
                  </div>
                  <div className="my-1 flex items-center justify-center min-h-[46px]">
                    <img 
                      src={globalSignature?.image || PRAKASH_SIGNATURE_BASE64} 
                      alt="Authorized Signature & Stamp" 
                      className="max-h-12 max-w-[145px] object-contain mx-auto" 
                    />
                  </div>
                  <div className="font-bold text-[9.5px] text-blue-900 border-t border-slate-400 pt-0.5 min-w-[130px] uppercase">
                    Authorized Signatory & Stamp
                  </div>
                </div>
              </div>

              {/* Bottom 24x7 Customer Care Support Bar */}
              <div className="mt-5 pt-2 border-t border-slate-300 text-center text-[10.5px] font-bold text-slate-800">
                24x7 Customer Care Support <span className="text-red-600 font-black">8093017400</span>
              </div>
            </div>

            {/* Print Buttons Bar */}
            <div className="flex justify-end gap-3 print:hidden pt-4 border-t border-slate-200">
              <button 
                onClick={() => setViewMode('form')} 
                className="px-4 py-2 border rounded-xl text-xs font-semibold cursor-pointer hover:bg-slate-50"
              >
                Back to Form
              </button>
              <button 
                onClick={() => window.print()} 
                className="bg-blue-600 text-white font-bold px-5 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-xs hover:bg-blue-700"
              >
                <Printer className="w-4 h-4" /> Print Money Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
