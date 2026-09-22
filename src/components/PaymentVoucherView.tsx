import React, { useState } from 'react';
import { Printer, Save, Plus, FileText, Search, Trash2, Pencil, Share2, Phone, Download, Check, ExternalLink, Loader2 } from 'lucide-react';
import { UPL_LOGO_BASE64 } from '../assets/logoBase64';
import { downloadPdfFromElement, openElementInPrintWindow } from '../utils/pdfExport';

export interface PaymentVoucherData {
  id: string;
  voucherNo: string;
  date: string;
  receiverName: string;
  receiverMobile: string;
  amount: number;
  paymentType: string; // e.g. 'Advanced', 'Balance', 'Full'
  paymentMode: string; // e.g. 'Cash', 'UPI', 'Bank Transfer', 'Cheque'
  transactionNo: string;
  payFor: string;
  remark: string;
  approvedBy: string;
}

interface Props {
  vouchers: PaymentVoucherData[];
  onSave: (data: PaymentVoucherData) => void;
  onDelete: (id: string) => void;
  globalSignature?: { text: string; image: string };
  companyProfile?: any;
}

// Number to words converter
function numberToWords(num: number): string {
  if (isNaN(num) || num === 0) return 'Zero';
  
  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function inWords(n: number): string {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
    if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' and ' + inWords(n % 100) : '');
    if (n < 100000) return inWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 !== 0 ? ' ' + inWords(n % 1000) : '');
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 !== 0 ? ' ' + inWords(n % 100000) : '');
    return inWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 !== 0 ? ' ' + inWords(n % 10000000) : '');
  }

  return inWords(Math.round(num)) + ' Only';
}

export const PaymentVoucherView: React.FC<Props> = ({ vouchers, onSave, onDelete, globalSignature, companyProfile }) => {
  const [viewMode, setViewMode] = useState<'form' | 'list' | 'preview'>('form');
  const [selectedRecord, setSelectedRecord] = useState<PaymentVoucherData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleDownloadVoucherPdf = async (voucherRecord?: PaymentVoucherData) => {
    const rec = voucherRecord || selectedRecord;
    if (!rec) return;

    try {
      setIsDownloading(true);
      setDownloadSuccess(false);

      const printableElement = document.getElementById('printable-payment-voucher-pdf');
      if (!printableElement) {
        window.print();
        return;
      }

      const filename = `UrbanPro_PaymentVoucher_${rec.voucherNo || '1'}_${(rec.receiverName || 'Voucher').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      const result = await downloadPdfFromElement(printableElement, filename);

      if (result.success) {
        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 5000);
      }
    } catch (err) {
      console.error('Error downloading Voucher PDF:', err);
      window.print();
    } finally {
      setIsDownloading(false);
    }
  };

  const handleOpenInNewTab = (rec?: PaymentVoucherData) => {
    const printableElement = document.getElementById('printable-payment-voucher-pdf');
    if (printableElement) {
      const vNo = (rec || selectedRecord)?.voucherNo || '1';
      openElementInPrintWindow(printableElement, `UrbanPro Payment Voucher #${vNo}`);
    } else {
      window.print();
    }
  };

  const initialForm: PaymentVoucherData = {
    id: `pv-${Date.now()}`,
    voucherNo: `${vouchers.length + 1}`,
    date: new Date().toISOString().split('T')[0],
    receiverName: '',
    receiverMobile: '',
    amount: 5222,
    paymentType: 'Advanced',
    paymentMode: 'Cash',
    transactionNo: '',
    payFor: 'Advanced Payment for Household Relocation',
    remark: '',
    approvedBy: globalSignature?.text || 'UrbanPro Authorized Manager'
  };

  const [form, setForm] = useState<PaymentVoucherData>(initialForm);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dataToSave = {
      ...form,
      approvedBy: form.approvedBy || globalSignature?.text || 'UrbanPro Authorized Manager'
    };
    onSave(dataToSave);
    setSelectedRecord(dataToSave);
    setViewMode('preview');
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">
            {viewMode === 'form' ? 'Add Payment Voucher' : viewMode === 'list' ? 'All Payment Vouchers' : 'Payment Voucher Preview'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">UrbanPro Packer & Logistics • Expense & Cash Debit Voucher</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setForm({
                id: `pv-${Date.now()}`,
                voucherNo: `${vouchers.length + 1}`,
                date: new Date().toISOString().split('T')[0],
                receiverName: '',
                receiverMobile: '',
                amount: 0,
                paymentType: 'Advanced',
                paymentMode: 'Cash',
                transactionNo: '',
                payFor: '',
                remark: '',
                approvedBy: globalSignature?.text || 'UrbanPro Authorized Manager'
              });
              setViewMode('form');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${viewMode === 'form' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'}`}
          >
            <Plus className="w-3.5 h-3.5 inline mr-1" /> Add Payment Voucher
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${viewMode === 'list' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'}`}
          >
            <FileText className="w-3.5 h-3.5 inline mr-1" /> All Vouchers ({vouchers.length})
          </button>
        </div>
      </div>

      {viewMode === 'form' && (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
          {/* Voucher Details Section */}
          <div className="border border-slate-300 rounded-2xl p-6 relative bg-white shadow-xs">
            <div className="absolute -top-3.5 left-4 bg-emerald-600 text-white px-4 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider">
              Voucher Details
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="border border-slate-300 rounded-xl p-2.5 px-3 bg-white">
                <label className="block text-[11px] text-slate-500 font-medium mb-0.5">Voucher No. *</label>
                <input
                  type="text"
                  required
                  value={form.voucherNo}
                  onChange={e => setForm({ ...form, voucherNo: e.target.value })}
                  className="w-full outline-none text-slate-800 text-sm font-bold bg-transparent"
                  placeholder="e.g. 1"
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-2.5 px-3 bg-white">
                <label className="block text-[11px] text-slate-500 font-medium mb-0.5">Voucher Date *</label>
                <input
                  type="date"
                  required
                  value={form.date}
                  onChange={e => setForm({ ...form, date: e.target.value })}
                  className="w-full outline-none text-slate-800 text-sm font-medium bg-transparent"
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-2.5 px-3 bg-white">
                <label className="block text-[11px] text-slate-500 font-medium mb-0.5">Voucher Amount *</label>
                <input
                  type="number"
                  required
                  value={form.amount}
                  onChange={e => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full outline-none text-slate-800 text-sm font-bold bg-transparent"
                  placeholder="0.00"
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-2.5 px-3 bg-white">
                <label className="block text-[11px] text-slate-500 font-medium mb-0.5">Receiver Name *</label>
                <input
                  type="text"
                  required
                  value={form.receiverName}
                  onChange={e => setForm({ ...form, receiverName: e.target.value })}
                  className="w-full outline-none text-slate-800 text-sm font-medium bg-transparent"
                  placeholder="Receiver Name"
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-2.5 px-3 bg-white sm:col-span-2">
                <label className="block text-[11px] text-slate-500 font-medium mb-0.5">Receiver Mobile No.</label>
                <input
                  type="text"
                  value={form.receiverMobile}
                  onChange={e => setForm({ ...form, receiverMobile: e.target.value })}
                  className="w-full outline-none text-slate-800 text-sm font-medium bg-transparent"
                  placeholder="Mobile Number"
                />
              </div>
            </div>
          </div>

          {/* Payment Details Section */}
          <div className="border border-slate-300 rounded-2xl p-6 relative bg-white shadow-xs">
            <div className="absolute -top-3.5 left-4 bg-blue-600 text-white px-4 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider">
              Payment Details
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="border border-slate-300 rounded-xl p-2.5 px-3 bg-white">
                <label className="block text-[11px] text-slate-500 font-medium mb-0.5">Payment Type (पेमेंट का प्रकार)</label>
                <input
                  type="text"
                  value={form.paymentType}
                  onChange={e => setForm({ ...form, paymentType: e.target.value })}
                  className="w-full outline-none text-slate-800 text-sm font-medium bg-transparent"
                  placeholder="Advanced / Balance / Full"
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-2.5 px-3 bg-white">
                <label className="block text-[11px] text-slate-500 font-medium mb-0.5">Payment Mode</label>
                <select
                  value={form.paymentMode}
                  onChange={e => setForm({ ...form, paymentMode: e.target.value })}
                  className="w-full outline-none text-slate-800 text-sm font-medium bg-transparent"
                >
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>

              <div className="border border-slate-300 rounded-xl p-2.5 px-3 bg-white">
                <label className="block text-[11px] text-slate-500 font-medium mb-0.5">Transaction No. / Txn/Upi/Ref No.</label>
                <input
                  type="text"
                  value={form.transactionNo}
                  onChange={e => setForm({ ...form, transactionNo: e.target.value })}
                  className="w-full outline-none text-slate-800 text-sm font-medium bg-transparent"
                  placeholder="Ref No / Txn ID"
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-2.5 px-3 bg-white">
                <label className="block text-[11px] text-slate-500 font-medium mb-0.5">Pay For (Towards ...)</label>
                <input
                  type="text"
                  value={form.payFor}
                  onChange={e => setForm({ ...form, payFor: e.target.value })}
                  className="w-full outline-none text-slate-800 text-sm font-medium bg-transparent"
                  placeholder="e.g. Advanced Payment for Relocation"
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-2.5 px-3 bg-white sm:col-span-2">
                <label className="block text-[11px] text-slate-500 font-medium mb-0.5">Remark</label>
                <textarea
                  rows={2}
                  value={form.remark}
                  onChange={e => setForm({ ...form, remark: e.target.value })}
                  className="w-full outline-none text-slate-800 text-xs bg-transparent resize-none"
                  placeholder="Additional remarks..."
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-xl text-sm shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" /> Save Voucher
            </button>
          </div>
        </form>
      )}

      {viewMode === 'list' && (
        <div className="space-y-4">
          {/* Search Header */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                placeholder="Search by Voucher No, Receiver Name..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs outline-none focus:border-blue-500 bg-white"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>

            <button
              type="button"
              onClick={() => {
                setForm({
                  id: `pv-${Date.now()}`,
                  voucherNo: `${vouchers.length + 1}`,
                  date: new Date().toISOString().split('T')[0],
                  receiverName: '',
                  receiverMobile: '',
                  amount: 0,
                  paymentType: 'Advanced',
                  paymentMode: 'Cash',
                  transactionNo: '',
                  payFor: '',
                  remark: '',
                  approvedBy: globalSignature?.text || 'UrbanPro Authorized Manager'
                });
                setViewMode('form');
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" /> Add Payment Voucher
            </button>
          </div>

          {/* Cards / Table List */}
          {vouchers.length === 0 ? (
            <div className="text-center py-12 bg-white border border-slate-200 rounded-2xl">
              <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500 text-xs font-medium">No payment vouchers found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vouchers
                .filter(rec =>
                  (rec.receiverName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                  (rec.voucherNo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                  (rec.receiverMobile || '').includes(searchTerm)
                )
                .map((rec, idx) => (
                  <div key={rec.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 relative">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="border border-slate-300 bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs font-mono font-bold">
                          #{idx + 1}
                        </span>
                        <span className="bg-amber-100 text-amber-800 font-bold text-xs px-2.5 py-0.5 rounded-md">
                          {rec.date}
                        </span>
                      </div>
                      <span className="bg-blue-600 text-white font-bold text-xs px-3 py-1 rounded-full shadow-2xs">
                        VOUCHER NO. - #{rec.voucherNo}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs pt-1">
                      <div className="space-y-2">
                        <div>
                          <span className="block text-[10px] text-slate-400 font-semibold uppercase">Receiver Name</span>
                          <span className="font-bold text-slate-900 text-sm">{rec.receiverName || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] text-slate-400 font-semibold uppercase">Mobile No.</span>
                          <span className="font-medium text-slate-700">{rec.receiverMobile || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] text-slate-400 font-semibold uppercase">Payment Type</span>
                          <span className="font-semibold text-blue-800">{rec.paymentType || 'Advanced'}</span>
                        </div>
                      </div>

                      <div className="space-y-2 text-right">
                        <div>
                          <span className="block text-[10px] text-slate-400 font-semibold uppercase">Amount Paid</span>
                          <span className="text-emerald-700 font-black text-base">₹{(rec.amount || 0).toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] text-slate-400 font-semibold uppercase">Payment Mode</span>
                          <span className="font-bold text-slate-800">{rec.paymentMode}</span>
                        </div>
                        {rec.payFor && (
                          <div>
                            <span className="block text-[10px] text-slate-400 font-semibold uppercase">Pay For</span>
                            <span className="text-slate-600 truncate block">{rec.payFor}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="border-t border-slate-100 pt-3 flex items-center justify-around gap-2 text-center text-[11px] font-semibold">
                      <button
                        type="button"
                        onClick={() => { setSelectedRecord(rec); setViewMode('preview'); }}
                        className="flex flex-col items-center gap-1 text-sky-600 hover:text-sky-700 cursor-pointer"
                      >
                        <div className="w-8 h-8 rounded-full bg-sky-500 text-white flex items-center justify-center shadow-xs">
                          <FileText className="w-4 h-4" />
                        </div>
                        <span>View</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (navigator.share) {
                            navigator.share({ title: `Payment Voucher #${rec.voucherNo}`, text: `Voucher for ${rec.receiverName} - Rs.${rec.amount}` });
                          }
                        }}
                        className="flex flex-col items-center gap-1 text-emerald-600 hover:text-emerald-700 cursor-pointer"
                      >
                        <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                          <Share2 className="w-4 h-4" />
                        </div>
                        <span>Share</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => { setForm(rec); setViewMode('form'); }}
                        className="flex flex-col items-center gap-1 text-cyan-600 hover:text-cyan-700 cursor-pointer"
                      >
                        <div className="w-8 h-8 rounded-full bg-cyan-400 text-white flex items-center justify-center shadow-xs">
                          <Pencil className="w-4 h-4" />
                        </div>
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onDelete(rec.id)}
                        className="flex flex-col items-center gap-1 text-red-500 hover:text-red-600 cursor-pointer"
                      >
                        <div className="w-8 h-8 rounded-full bg-red-100 text-red-500 flex items-center justify-center shadow-xs">
                          <Trash2 className="w-4 h-4" />
                        </div>
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {viewMode === 'preview' && selectedRecord && (
        <div className="space-y-4 max-w-4xl mx-auto">
          {/* Top Control Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 text-white p-4 rounded-2xl print:hidden shadow-lg">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-sm block">Official Payment Voucher Printable Document</span>
                <span className="text-[11px] text-slate-400">Voucher #{selectedRecord.voucherNo || '1'} • {selectedRecord.receiverName || 'Voucher'}</span>
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
                title="Open in a dedicated window for unrestricted browser printing & saving"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">New Tab</span>
              </button>

              <button
                type="button"
                onClick={() => handleDownloadVoucherPdf(selectedRecord)}
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
              <span>Payment Voucher PDF successfully downloaded to your device downloads folder!</span>
            </div>
          )}

          {/* Official Printable Sheet (Matching exact screenshot) */}
          <div 
            id="printable-payment-voucher-pdf"
            className="bg-white rounded-xl border-2 border-[#f87171] shadow-xl p-8 sm:p-12 text-slate-900 space-y-5 print:border-2 print:border-[#f87171] print:p-8"
          >
            {/* Top PAN Strip (Pink background matching uploaded PDF) */}
            <div className="text-center bg-[#fca5a5] py-1 text-[11px] font-bold text-slate-900 uppercase tracking-wider">
              PAN No.: AKMPV0774C
            </div>

            {/* Header */}
            <div className="border-b border-[#f87171] pb-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-20 h-16 shrink-0 flex items-center justify-center p-1 bg-white border border-slate-200 rounded">
                  <img 
                    src={companyProfile?.logo || UPL_LOGO_BASE64 || '/urbanpro-logo.jpeg'} 
                    alt="UrbanPro Logo" 
                    className="max-h-14 w-auto object-contain" 
                  />
                </div>
                <div>
                  <div className="leading-none" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
                    <h1 className="text-[22px] sm:text-[25px] font-black tracking-tight">
                      <span style={{ color: '#1e3a8a' }}>Urban</span><span style={{ color: '#dc2626' }}>Pro</span>
                    </h1>
                    <h2 className="text-xs sm:text-sm font-extrabold tracking-wider uppercase mt-0.5" style={{ color: '#1e3a8a' }}>
                      Packers & Logistics
                    </h2>
                  </div>
                  <p className="text-[11px] leading-tight text-black font-medium mt-1">
                    <strong>Address:</strong> Plot No 1491, Balintha Canal Road, Near Lenskart, Hanspal, Bhubaneswar, Odisha -752101
                  </p>
                  <p className="text-[11px] leading-tight text-black font-medium mt-0.5">
                    <strong>Mobile No.:</strong> 8093017400 • <strong>Email:</strong> urbanpro403@gmail.com
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Voucher Title Banner Line (Light Grey / White) */}
            <div className="bg-slate-100 text-slate-900 border border-slate-300 text-center font-bold text-sm py-1.5 uppercase tracking-wide">
              Payment Voucher
            </div>

            {/* Voucher Row 1 */}
            <div className="flex items-center justify-between text-xs font-medium border-b border-slate-300 pb-2">
              <div>
                <span className="font-bold text-slate-800">Voucher No.</span> <span className="font-mono font-bold ml-1">{selectedRecord.voucherNo}</span>
              </div>
              <div>
                <span className="font-bold text-slate-800">Date.</span> <span className="font-mono font-bold ml-1">{selectedRecord.date}</span>
              </div>
            </div>

            {/* Receiver Name & Phone */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-medium border-b border-slate-300 pb-2">
              <div>
                <span className="font-bold text-slate-800">Receiver Name</span> <span className="font-bold ml-1 underline">{selectedRecord.receiverName || 'N/A'}</span>
              </div>
              <div>
                <span className="font-bold text-slate-800">Phone No.</span> <span className="font-mono font-bold ml-1">{selectedRecord.receiverMobile || 'N/A'}</span>
              </div>
            </div>

            {/* Towards Payment For */}
            <div className="text-xs font-medium border-b border-slate-300 pb-2">
              <span className="text-slate-500 italic">Towards {selectedRecord.paymentType || 'Advanced'} Payment for</span> <span className="font-semibold text-slate-800 ml-1">{selectedRecord.payFor || 'Household Relocation Services'}</span>
            </div>

            {/* Payment Mode & Txn No */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-medium border-b border-slate-300 pb-2">
              <div>
                <span className="font-bold text-slate-800">Payment Mode</span> <span className="font-bold ml-1 text-blue-900">{selectedRecord.paymentMode}</span>
              </div>
              <div>
                <span className="font-bold text-slate-800">Txn/Upi/Ref No.</span> <span className="font-mono font-bold ml-1">{selectedRecord.transactionNo || 'N/A'}</span>
              </div>
            </div>

            {/* Amount in words & Box */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pt-2 pb-6 border-b border-slate-300">
              <div className="space-y-1 text-xs">
                <span className="font-bold text-slate-800 block">Amount in words:</span>
                <p className="text-sm font-bold text-slate-900 underline capitalize">
                  {numberToWords(selectedRecord.amount)}
                </p>
                {selectedRecord.remark && (
                  <p className="text-[11px] text-slate-600 mt-1 italic">Remark: {selectedRecord.remark}</p>
                )}
              </div>

              <div className="border-2 border-slate-900 rounded-lg p-3 text-center bg-white min-w-[150px] shadow-sm">
                <span className="text-base sm:text-lg font-black text-slate-900 font-mono">
                  Rs. {(selectedRecord.amount || 0).toLocaleString()}/-
                </span>
              </div>
            </div>

            {/* Signature & Footer */}
            <div className="flex justify-between items-end pt-4">
              <div className="text-[11px] text-slate-500">
                24x7 Customer Care Support <strong className="text-red-600 font-extrabold">8093017400</strong>
              </div>

              <div className="text-right space-y-1">
                <div className="h-14 flex items-end justify-end">
                  {globalSignature?.image ? (
                    <img src={globalSignature.image} alt="Signature" className="h-12 object-contain" />
                  ) : (
                    <span className="text-xs font-serif italic text-blue-900 font-bold">Authorized Signatory</span>
                  )}
                </div>
                <p className="font-bold text-[11px] border-t border-slate-300 pt-1">
                  For <span className="text-[#1e3a8a]">Urban</span><span className="text-[#dc2626]">Pro</span> <span className="text-[#1e3a8a]">Packers & Logistics</span>
                </p>
                <p className="text-[10px] text-slate-500 font-medium">Authorized Signature</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
