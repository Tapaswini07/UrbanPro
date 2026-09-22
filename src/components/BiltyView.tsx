import React, { useState, useEffect } from 'react';
import { Truck, FileText, Printer, Save, Plus, Sparkles, Calendar, Search, User, MapPin, Phone, Clock, Share2, Trash2, IndianRupee, Pencil, Download, Check, ExternalLink, Loader2 } from 'lucide-react';
import { UPL_LOGO_BASE64 } from '../assets/logoBase64';
import { numberToIndianWords } from './QuotationPdfModal';
import { downloadPdfFromElement, openElementInPrintWindow } from '../utils/pdfExport';
import { INDIAN_STATES, getStateCodeByName } from '../utils/indianStates';

export interface BiltyData {
  id: string;
  biltyNo: string;
  biltyDate: string;
  goodsDeliveryDate: string;
  vehicleNo: string;
  driverName?: string;
  driverMobile?: string;
  riskType: string;
  gstPaidBy: string;

  // Relocate From
  consignorName: string;
  consignorPhone: string;
  consignorGstin: string;
  consignorCountry: string;
  consignorState: string;
  consignorStateCode: string;
  consignorCity: string;
  consignorArea: string;
  consignorPincode: string;
  consignorAddress: string;

  // Relocate To
  consigneeName: string;
  consigneePhone: string;
  consigneeGstin: string;
  consigneeCountry: string;
  consigneeState: string;
  consigneeStateCode: string;
  consigneeCity: string;
  consigneeArea: string;
  consigneePincode: string;
  consigneeAddress: string;

  // Package Details
  packages: string;
  packagesDescription: string;
  goodsDescription?: string;
  weightType: string;
  totalWeight: string;
  goodsCondition: string;
  remark: string;
  totalAmtInWords?: string;

  // Payment Details
  freightToBeBilled: number;
  freightPaid: number;
  freightToPay: number;

  // Material Insurance
  insuranceStatus: string;
  insuranceCompany: string;
  policyNumber: string;
  insuranceDate: string;
  insuredAmount: string;
  insuredRisk: string;

  // Demurrage Details
  demurrageType: string;
  demurrageCharge: string;
  demurrageApplicableAfter: string;

  // Bank Details (Optional, NOT added automatically)
  showBankDetails?: boolean;
  bankBeneficiaryName?: string;
  bankName?: string;
  bankAccNo?: string;
  bankIfsc?: string;
  bankBranch?: string;
}

interface Props {
  bilties: BiltyData[];
  onSave: (data: BiltyData) => void;
  onDelete: (id: string) => void;
  customerProfiles?: any[];
  globalSignature?: { text: string; image?: string };
  companyProfile?: any;
  initialViewMode?: 'form' | 'list';
}

export const BiltyView: React.FC<Props> = ({ 
  bilties, 
  onSave, 
  onDelete, 
  customerProfiles = [],
  globalSignature,
  companyProfile,
  initialViewMode = 'list'
}) => {
  const [viewMode, setViewMode] = useState<'form' | 'list' | 'preview'>(initialViewMode);
  const [selectedRecord, setSelectedRecord] = useState<BiltyData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  useEffect(() => {
    if (initialViewMode) {
      setViewMode(initialViewMode);
    }
  }, [initialViewMode]);

  const handleDownloadBiltyPdf = async (biltyRecord?: BiltyData) => {
    const rec = biltyRecord || selectedRecord;
    if (!rec) return;

    try {
      setIsDownloading(true);
      setDownloadSuccess(false);

      const printableElement = document.getElementById('printable-bilty-pdf');
      if (!printableElement) {
        window.print();
        return;
      }

      const filename = `UrbanPro_Bilty_LR${rec.biltyNo || '1'}_${(rec.consignorName || 'Customer').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      const result = await downloadPdfFromElement(printableElement, filename);

      if (result.success) {
        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 5000);
      }
    } catch (err) {
      console.error('Error downloading Bilty PDF:', err);
      window.print();
    } finally {
      setIsDownloading(false);
    }
  };

  const handleOpenInNewTab = (rec?: BiltyData) => {
    const printableElement = document.getElementById('printable-bilty-pdf');
    if (printableElement) {
      const bNo = (rec || selectedRecord)?.biltyNo || '1';
      openElementInPrintWindow(printableElement, `UrbanPro Bilty LR #${bNo}`);
    } else {
      window.print();
    }
  };

  const initialForm: BiltyData = {
    id: `bilty-${Date.now()}`,
    biltyNo: `${bilties.length + 2}`,
    biltyDate: new Date().toISOString().split('T')[0],
    goodsDeliveryDate: '',
    vehicleNo: '',
    driverName: '',
    driverMobile: '',
    riskType: 'At Carriers Risk',
    gstPaidBy: 'Consignor',

    // Relocate From
    consignorName: '',
    consignorPhone: '',
    consignorGstin: '',
    consignorCountry: 'India',
    consignorState: 'Odisha',
    consignorStateCode: '21',
    consignorCity: 'Bhubaneswar',
    consignorArea: 'Hanspal',
    consignorPincode: '752101',
    consignorAddress: '',

    // Relocate To
    consigneeName: '',
    consigneePhone: '',
    consigneeGstin: '',
    consigneeCountry: 'India',
    consigneeState: 'Odisha',
    consigneeStateCode: '21',
    consigneeCity: '',
    consigneeArea: '',
    consigneePincode: '',
    consigneeAddress: '',

    // Package Details
    packages: 'As Per List Attached',
    packagesDescription: 'Old & Used Goods',
    goodsDescription: 'Old & Used Goods',
    weightType: 'MT',
    totalWeight: 'Fixed',
    goodsCondition: 'Goods Received in Good Condition',
    remark: 'Not For Sale',
    totalAmtInWords: 'Zero Rupees Only',

    // Payment Details
    freightToBeBilled: 0,
    freightPaid: 0,
    freightToPay: 0,

    // Material Insurance
    insuranceStatus: 'Insured',
    insuranceCompany: '',
    policyNumber: '',
    insuranceDate: '',
    insuredAmount: '',
    insuredRisk: '',

    // Demurrage Details
    demurrageType: 'Per Day',
    demurrageCharge: '',
    demurrageApplicableAfter: 'Not Applicable',

    // Bank Details (Optional, NOT added automatically)
    showBankDetails: false,
    bankBeneficiaryName: companyProfile?.beneficiaryName || companyProfile?.companyName || 'UrbanPro Packers & Logistics',
    bankName: companyProfile?.bankName || 'State Bank of India',
    bankAccNo: companyProfile?.bankAccNo || companyProfile?.accountNo || '40912384729',
    bankIfsc: companyProfile?.bankIfsc || companyProfile?.ifscCode || 'SBIN0001234',
    bankBranch: companyProfile?.bankBranch || 'Hanspal, Bhubaneswar'
  };

  const [form, setForm] = useState<BiltyData>(initialForm);

  const handleAutoFillCustomer = (cp: any) => {
    const total = Number(cp.netTotal || cp.grandTotal || cp.total || 0);
    const paid = Number(cp.advancePaid || 0);
    const toPay = Math.max(0, total - paid);
    const words = total > 0 ? `${numberToIndianWords(total)} Rupees Only` : 'Zero Rupees Only';

    setForm(prev => ({
      ...prev,
      consignorName: cp.partyName || prev.consignorName,
      consignorPhone: cp.mobileNo || prev.consignorPhone,
      consignorCity: cp.fromCity || prev.consignorCity,
      consignorState: cp.fromState || prev.consignorState,
      consignorArea: cp.fromArea || prev.consignorArea,
      consignorPincode: cp.fromPincode || prev.consignorPincode,
      consignorAddress: cp.fromAddress || prev.consignorAddress,
      consigneeName: cp.partyName || prev.consigneeName,
      consigneePhone: cp.mobileNo || prev.consigneePhone,
      consigneeCity: cp.toCity || prev.consigneeCity,
      consigneeState: cp.toState || prev.consigneeState,
      consigneeArea: cp.toArea || prev.consigneeArea,
      consigneePincode: cp.toPincode || prev.consigneePincode,
      consigneeAddress: cp.toAddress || prev.consigneeAddress,
      freightToBeBilled: total || prev.freightToBeBilled,
      freightPaid: paid || prev.freightPaid,
      freightToPay: total ? toPay : prev.freightToPay,
      totalAmtInWords: words || prev.totalAmtInWords
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
    setSelectedRecord(form);
    setViewMode('preview');
  };

  const filteredBilties = bilties.filter(rec => {
    const term = searchTerm.toLowerCase();
    const name = (rec.consignorName || (rec as any).consignor || '').toLowerCase();
    const no = String(rec.biltyNo || rec.id || '').toLowerCase();
    const cName = (rec.consigneeName || '').toLowerCase();
    const phone = String(rec.consignorPhone || (rec as any).consignorMobile || (rec as any).mobile || '');
    const city = ((rec.consignorCity || (rec as any).fromCity || '') + ' ' + (rec.consigneeCity || (rec as any).toCity || '')).toLowerCase();
    return name.includes(term) || no.includes(term) || cName.includes(term) || phone.includes(term) || city.includes(term);
  });

  return (
    <div className="space-y-6 pb-16">
      {viewMode === 'form' && (
        <>
          {/* Top Banner for Form */}
          <div className="bg-white rounded-xl p-4 sm:p-5 shadow-2xs border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Add Bilty</h1>
              <p className="text-xs text-slate-500 mt-0.5">UrbanPro Packer & Logistics • Consignment Note & Lorry Receipt</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className="bg-[#0f172a] hover:bg-slate-800 text-white font-bold px-5 py-2 rounded-full text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" /> All Bilties ({bilties.length})
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
          {/* Details from Quotation bar */}
          <div className="bg-sky-100/70 border border-sky-200 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-sky-900">
            <span className="text-xs font-bold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-sky-600" />
              Details from Quotation / Survey Auto-fill
            </span>
            {customerProfiles.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {customerProfiles.slice(0, 5).map((cp, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAutoFillCustomer(cp)}
                    className="px-2.5 py-1 bg-white hover:bg-sky-50 text-sky-900 border border-sky-300 rounded-lg text-xs font-semibold cursor-pointer shadow-2xs"
                  >
                    Auto-fill: {cp.partyName}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* BILTY DETAILS */}
          <div className="border border-slate-200 rounded-2xl p-5 pt-7 relative bg-white shadow-2xs">
            <span className="absolute -top-3 left-4 bg-emerald-500 text-white px-3 py-0.5 rounded-md text-xs font-bold shadow-2xs">
              Bilty Details
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="border border-slate-300 rounded-xl p-2.5 bg-white">
                <label className="block text-slate-500 font-medium text-[11px] mb-1">Bilty (Lorry Receipt) No. *</label>
                <input
                  type="text"
                  required
                  value={form.biltyNo}
                  onChange={e => setForm({ ...form, biltyNo: e.target.value })}
                  className="w-full outline-none font-bold text-slate-800 text-sm"
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-2.5 bg-white">
                <label className="block text-slate-500 font-medium text-[11px] mb-1">Bilty (Lorry Receipt) Date *</label>
                <input
                  type="date"
                  required
                  value={form.biltyDate}
                  onChange={e => setForm({ ...form, biltyDate: e.target.value })}
                  className="w-full outline-none font-medium text-slate-800"
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-2.5 bg-white">
                <label className="block text-slate-500 font-medium text-[11px] mb-1">Goods Delivery Date</label>
                <input
                  type="date"
                  value={form.goodsDeliveryDate}
                  onChange={e => setForm({ ...form, goodsDeliveryDate: e.target.value })}
                  className="w-full outline-none font-medium text-slate-800"
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-2.5 bg-white">
                <label className="block text-slate-500 font-medium text-[11px] mb-1">Vehicle No.</label>
                <input
                  type="text"
                  placeholder="e.g. OD-02-BR-8899"
                  value={form.vehicleNo}
                  onChange={e => setForm({ ...form, vehicleNo: e.target.value })}
                  className="w-full outline-none font-medium text-slate-800 uppercase"
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-2.5 bg-white">
                <label className="block text-slate-500 font-medium text-[11px] mb-1">Driver Name & Mobile</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Driver Name"
                    value={form.driverName || ''}
                    onChange={e => setForm({ ...form, driverName: e.target.value })}
                    className="w-full outline-none font-medium text-slate-800"
                  />
                  <input
                    type="tel"
                    placeholder="Driver Mobile"
                    value={form.driverMobile || ''}
                    onChange={e => setForm({ ...form, driverMobile: e.target.value })}
                    className="w-full outline-none font-medium text-slate-800"
                  />
                </div>
              </div>

              <div className="border border-slate-300 rounded-xl p-2.5 bg-white">
                <label className="block text-slate-500 font-medium text-[11px] mb-1">Risk Type</label>
                <select
                  value={form.riskType}
                  onChange={e => setForm({ ...form, riskType: e.target.value })}
                  className="w-full outline-none font-medium text-slate-800 bg-transparent"
                >
                  <option value="At Carriers Risk">At Carriers Risk</option>
                  <option value="At Owners Risk">At Owners Risk</option>
                </select>
              </div>

              <div className="border border-slate-300 rounded-xl p-2.5 bg-white">
                <label className="block text-slate-500 font-medium text-[11px] mb-1">GST Through (Paid By)</label>
                <select
                  value={form.gstPaidBy}
                  onChange={e => setForm({ ...form, gstPaidBy: e.target.value })}
                  className="w-full outline-none font-medium text-slate-800 bg-transparent"
                >
                  <option value="Consignor">Consignor</option>
                  <option value="Consignee">Consignee</option>
                  <option value="Exempted">Exempted</option>
                  <option value="Transporter">Transporter</option>
                </select>
              </div>
            </div>
          </div>

          {/* RELOCATE FROM */}
          <div className="border border-slate-200 rounded-2xl p-5 pt-7 relative bg-white shadow-2xs">
            <span className="absolute -top-3 left-4 bg-sky-500 text-white px-3 py-0.5 rounded-md text-xs font-bold shadow-2xs">
              Relocate From
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="border border-slate-300 rounded-xl p-2.5 bg-white">
                <label className="block text-slate-500 font-medium text-[11px] mb-1">Consignor Name *</label>
                <input
                  type="text"
                  required
                  value={form.consignorName}
                  onChange={e => setForm({ ...form, consignorName: e.target.value })}
                  className="w-full outline-none font-medium text-slate-800"
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-2.5 bg-white">
                <label className="block text-slate-500 font-medium text-[11px] mb-1">Consignor Phone</label>
                <input
                  type="tel"
                  value={form.consignorPhone}
                  onChange={e => setForm({ ...form, consignorPhone: e.target.value })}
                  className="w-full outline-none font-medium text-slate-800"
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-2.5 bg-white">
                <label className="block text-slate-500 font-medium text-[11px] mb-1">GSTIN</label>
                <input
                  type="text"
                  value={form.consignorGstin}
                  onChange={e => setForm({ ...form, consignorGstin: e.target.value })}
                  className="w-full outline-none font-medium text-slate-800 uppercase"
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-2.5 bg-slate-50">
                <label className="block text-slate-500 font-medium text-[11px] mb-1">Country</label>
                <input
                  type="text"
                  readOnly
                  value={form.consignorCountry}
                  className="w-full outline-none font-bold text-slate-800 bg-transparent"
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-2.5 bg-white">
                <label className="block text-slate-500 font-medium text-[11px] mb-1">State</label>
                <select
                  value={form.consignorState}
                  onChange={e => {
                    const st = e.target.value;
                    const autoCode = getStateCodeByName(st);
                    setForm({ 
                      ...form, 
                      consignorState: st,
                      consignorStateCode: autoCode || form.consignorStateCode 
                    });
                  }}
                  className="w-full outline-none font-medium text-slate-800 bg-transparent"
                >
                  {INDIAN_STATES.map((st, idx) => (
                    <option key={`c-st-${idx}`} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <div className="border border-slate-300 rounded-xl p-2.5 bg-white">
                <label className="block text-slate-500 font-medium text-[11px] mb-1">State Code</label>
                <input
                  type="text"
                  placeholder="e.g. 21"
                  value={form.consignorStateCode}
                  onChange={e => setForm({ ...form, consignorStateCode: e.target.value })}
                  className="w-full outline-none font-medium text-slate-800"
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-2.5 bg-white">
                <label className="block text-slate-500 font-medium text-[11px] mb-1">City</label>
                <input
                  type="text"
                  value={form.consignorCity}
                  onChange={e => setForm({ ...form, consignorCity: e.target.value })}
                  className="w-full outline-none font-medium text-slate-800"
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-2.5 bg-white">
                <label className="block text-slate-500 font-medium text-[11px] mb-1">Area</label>
                <input
                  type="text"
                  value={form.consignorArea}
                  onChange={e => setForm({ ...form, consignorArea: e.target.value })}
                  className="w-full outline-none font-medium text-slate-800"
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-2.5 bg-white">
                <label className="block text-slate-500 font-medium text-[11px] mb-1">Pin Code</label>
                <input
                  type="text"
                  value={form.consignorPincode}
                  onChange={e => setForm({ ...form, consignorPincode: e.target.value })}
                  className="w-full outline-none font-medium text-slate-800"
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-2.5 bg-white">
                <label className="block text-slate-500 font-medium text-[11px] mb-1">Address</label>
                <input
                  type="text"
                  value={form.consignorAddress}
                  onChange={e => setForm({ ...form, consignorAddress: e.target.value })}
                  className="w-full outline-none font-medium text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* RELOCATE TO */}
          <div className="border border-slate-200 rounded-2xl p-5 pt-7 relative bg-white shadow-2xs">
            <span className="absolute -top-3 left-4 bg-slate-600 text-white px-3 py-0.5 rounded-md text-xs font-bold shadow-2xs">
              Relocate To
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="border border-slate-300 rounded-xl p-2.5 bg-white">
                <label className="block text-slate-500 font-medium text-[11px] mb-1">Consignee Name</label>
                <input
                  type="text"
                  value={form.consigneeName}
                  onChange={e => setForm({ ...form, consigneeName: e.target.value })}
                  className="w-full outline-none font-medium text-slate-800"
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-2.5 bg-white">
                <label className="block text-slate-500 font-medium text-[11px] mb-1">Consignee Phone</label>
                <input
                  type="tel"
                  value={form.consigneePhone}
                  onChange={e => setForm({ ...form, consigneePhone: e.target.value })}
                  className="w-full outline-none font-medium text-slate-800"
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-2.5 bg-white">
                <label className="block text-slate-500 font-medium text-[11px] mb-1">GSTIN</label>
                <input
                  type="text"
                  value={form.consigneeGstin}
                  onChange={e => setForm({ ...form, consigneeGstin: e.target.value })}
                  className="w-full outline-none font-medium text-slate-800 uppercase"
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-2.5 bg-slate-50">
                <label className="block text-slate-500 font-medium text-[11px] mb-1">Country</label>
                <input
                  type="text"
                  readOnly
                  value={form.consigneeCountry}
                  className="w-full outline-none font-bold text-slate-800 bg-transparent"
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-2.5 bg-white">
                <label className="block text-slate-500 font-medium text-[11px] mb-1">State</label>
                <select
                  value={form.consigneeState}
                  onChange={e => {
                    const st = e.target.value;
                    const autoCode = getStateCodeByName(st);
                    setForm({ 
                      ...form, 
                      consigneeState: st,
                      consigneeStateCode: autoCode || form.consigneeStateCode
                    });
                  }}
                  className="w-full outline-none font-medium text-slate-800 bg-transparent"
                >
                  {INDIAN_STATES.map((st, idx) => (
                    <option key={`ce-st-${idx}`} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <div className="border border-slate-300 rounded-xl p-2.5 bg-white">
                <label className="block text-slate-500 font-medium text-[11px] mb-1">State Code</label>
                <input
                  type="text"
                  placeholder="e.g. 21"
                  value={form.consigneeStateCode}
                  onChange={e => setForm({ ...form, consigneeStateCode: e.target.value })}
                  className="w-full outline-none font-medium text-slate-800"
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-2.5 bg-white">
                <label className="block text-slate-500 font-medium text-[11px] mb-1">City</label>
                <input
                  type="text"
                  value={form.consigneeCity}
                  onChange={e => setForm({ ...form, consigneeCity: e.target.value })}
                  className="w-full outline-none font-medium text-slate-800"
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-2.5 bg-white">
                <label className="block text-slate-500 font-medium text-[11px] mb-1">Area</label>
                <input
                  type="text"
                  value={form.consigneeArea}
                  onChange={e => setForm({ ...form, consigneeArea: e.target.value })}
                  className="w-full outline-none font-medium text-slate-800"
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-2.5 bg-white">
                <label className="block text-slate-500 font-medium text-[11px] mb-1">Pin Code</label>
                <input
                  type="text"
                  value={form.consigneePincode}
                  onChange={e => setForm({ ...form, consigneePincode: e.target.value })}
                  className="w-full outline-none font-medium text-slate-800"
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-2.5 bg-white">
                <label className="block text-slate-500 font-medium text-[11px] mb-1">Address</label>
                <input
                  type="text"
                  value={form.consigneeAddress}
                  onChange={e => setForm({ ...form, consigneeAddress: e.target.value })}
                  className="w-full outline-none font-medium text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* PACKAGE DETAILS */}
          <div className="border border-slate-200 rounded-2xl p-5 pt-7 relative bg-white shadow-2xs">
            <span className="absolute -top-3 left-4 bg-amber-500 text-white px-3 py-0.5 rounded-md text-xs font-bold shadow-2xs">
              Package Details
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="border border-slate-300 rounded-xl p-2.5 bg-white">
                <label className="block text-slate-500 font-medium text-[11px] mb-1">Package (e.g. As Per List Attached)</label>
                <input
                  type="text"
                  value={form.packages}
                  onChange={e => setForm({ ...form, packages: e.target.value })}
                  className="w-full outline-none font-medium text-slate-800"
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-2.5 bg-white">
                <label className="block text-slate-500 font-medium text-[11px] mb-1">Packages & Goods Description</label>
                <input
                  type="text"
                  value={form.goodsDescription || form.packagesDescription}
                  onChange={e => setForm({ ...form, goodsDescription: e.target.value, packagesDescription: e.target.value })}
                  className="w-full outline-none font-medium text-slate-800"
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-2.5 bg-white">
                <label className="block text-slate-500 font-medium text-[11px] mb-1">Weight Type</label>
                <select
                  value={form.weightType}
                  onChange={e => setForm({ ...form, weightType: e.target.value })}
                  className="w-full outline-none font-medium text-slate-800 bg-transparent"
                >
                  <option value="MT">MT</option>
                  <option value="KG">KG</option>
                  <option value="Fixed">Fixed</option>
                </select>
              </div>

              <div className="border border-slate-300 rounded-xl p-2.5 bg-white">
                <label className="block text-slate-500 font-medium text-[11px] mb-1">Total Weight</label>
                <input
                  type="text"
                  value={form.totalWeight}
                  onChange={e => setForm({ ...form, totalWeight: e.target.value })}
                  className="w-full outline-none font-medium text-slate-800"
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-2.5 bg-white">
                <label className="block text-slate-500 font-medium text-[11px] mb-1">Goods Received Condition</label>
                <input
                  type="text"
                  value={form.goodsCondition}
                  onChange={e => setForm({ ...form, goodsCondition: e.target.value })}
                  className="w-full outline-none font-medium text-slate-800"
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-2.5 bg-white">
                <label className="block text-slate-500 font-medium text-[11px] mb-1">Remark</label>
                <input
                  type="text"
                  value={form.remark}
                  onChange={e => setForm({ ...form, remark: e.target.value })}
                  className="w-full outline-none font-medium text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* PAYMENT DETAILS */}
          <div className="border border-slate-200 rounded-2xl p-5 pt-7 relative bg-white shadow-2xs">
            <span className="absolute -top-3 left-4 bg-teal-500 text-white px-3 py-0.5 rounded-md text-xs font-bold shadow-2xs">
              Payment Details
            </span>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="border border-slate-300 rounded-xl p-2.5 bg-white">
                <label className="block text-slate-500 font-medium text-[11px] mb-1">Freight to be Billed (₹)</label>
                <input
                  type="number"
                  value={form.freightToBeBilled}
                  onChange={e => {
                    const val = parseFloat(e.target.value) || 0;
                    const words = val > 0 ? `${numberToIndianWords(val)} Rupees Only` : 'Zero Rupees Only';
                    setForm({ 
                      ...form, 
                      freightToBeBilled: val, 
                      freightToPay: Math.max(0, val - form.freightPaid),
                      totalAmtInWords: words
                    });
                  }}
                  className="w-full outline-none font-bold text-slate-900 text-sm"
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-2.5 bg-white">
                <label className="block text-slate-500 font-medium text-[11px] mb-1">Freight Paid (₹)</label>
                <input
                  type="number"
                  value={form.freightPaid}
                  onChange={e => {
                    const val = parseFloat(e.target.value) || 0;
                    setForm({ ...form, freightPaid: val, freightToPay: Math.max(0, form.freightToBeBilled - val) });
                  }}
                  className="w-full outline-none font-medium text-slate-800 text-sm"
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-2.5 bg-white">
                <label className="block text-slate-500 font-medium text-[11px] mb-1">Freight to Pay (₹)</label>
                <input
                  type="number"
                  readOnly
                  value={form.freightToPay}
                  className="w-full outline-none font-bold text-emerald-700 text-sm bg-transparent"
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-2.5 bg-white md:col-span-3">
                <label className="block text-slate-500 font-medium text-[11px] mb-1">Total Amount in Words</label>
                <input
                  type="text"
                  value={form.totalAmtInWords || ''}
                  onChange={e => setForm({ ...form, totalAmtInWords: e.target.value })}
                  placeholder="e.g. Five Thousand Rupees Only"
                  className="w-full outline-none font-medium text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* MATERIAL INSURANCE */}
          <div className="border border-slate-200 rounded-2xl p-5 pt-7 relative bg-white shadow-2xs">
            <span className="absolute -top-3 left-4 bg-slate-800 text-white px-3 py-0.5 rounded-md text-xs font-bold shadow-2xs">
              Material Insurance
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="border border-slate-300 rounded-xl p-2.5 bg-white">
                <label className="block text-slate-500 font-medium text-[11px] mb-1">Insured or Not Insured</label>
                <select
                  value={form.insuranceStatus}
                  onChange={e => setForm({ ...form, insuranceStatus: e.target.value })}
                  className="w-full outline-none font-medium text-slate-800 bg-transparent"
                >
                  <option value="Insured">Insured</option>
                  <option value="Uninsured">Uninsured / Owner Risk</option>
                </select>
              </div>

              <div className="border border-slate-300 rounded-xl p-2.5 bg-white">
                <label className="block text-slate-500 font-medium text-[11px] mb-1">Insurance Company</label>
                <input
                  type="text"
                  placeholder="e.g. ICICI Lombard / HDFC ERGO"
                  value={form.insuranceCompany}
                  onChange={e => setForm({ ...form, insuranceCompany: e.target.value })}
                  className="w-full outline-none font-medium text-slate-800"
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-2.5 bg-white">
                <label className="block text-slate-500 font-medium text-[11px] mb-1">Policy Number</label>
                <input
                  type="text"
                  value={form.policyNumber}
                  onChange={e => setForm({ ...form, policyNumber: e.target.value })}
                  className="w-full outline-none font-medium text-slate-800"
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-2.5 bg-white">
                <label className="block text-slate-500 font-medium text-[11px] mb-1">Insurance Date</label>
                <input
                  type="date"
                  value={form.insuranceDate}
                  onChange={e => setForm({ ...form, insuranceDate: e.target.value })}
                  className="w-full outline-none font-medium text-slate-800"
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-2.5 bg-white">
                <label className="block text-slate-500 font-medium text-[11px] mb-1">Insured Amount (₹)</label>
                <input
                  type="text"
                  placeholder="Declared Value"
                  value={form.insuredAmount}
                  onChange={e => setForm({ ...form, insuredAmount: e.target.value })}
                  className="w-full outline-none font-medium text-slate-800"
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-2.5 bg-white">
                <label className="block text-slate-500 font-medium text-[11px] mb-1">Insured Risk</label>
                <input
                  type="text"
                  placeholder="Transit / Fire & Road Risk"
                  value={form.insuredRisk}
                  onChange={e => setForm({ ...form, insuredRisk: e.target.value })}
                  className="w-full outline-none font-medium text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* DEMURRAGE DETAILS */}
          <div className="border border-slate-200 rounded-2xl p-5 pt-7 relative bg-white shadow-2xs">
            <span className="absolute -top-3 left-4 bg-emerald-600 text-white px-3 py-0.5 rounded-md text-xs font-bold shadow-2xs">
              Demurrage Details
            </span>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="border border-slate-300 rounded-xl p-2.5 bg-white">
                <label className="block text-slate-500 font-medium text-[11px] mb-1">Demurrage Charge Type</label>
                <select
                  value={form.demurrageType}
                  onChange={e => setForm({ ...form, demurrageType: e.target.value })}
                  className="w-full outline-none font-medium text-slate-800 bg-transparent"
                >
                  <option value="Per Day">Per Day</option>
                  <option value="Per Hour">Per Hour</option>
                  <option value="Flat">Flat</option>
                </select>
              </div>

              <div className="border border-slate-300 rounded-xl p-2.5 bg-white">
                <label className="block text-slate-500 font-medium text-[11px] mb-1">Demurrage Charge (₹)</label>
                <input
                  type="text"
                  placeholder="e.g. 1500"
                  value={form.demurrageCharge}
                  onChange={e => setForm({ ...form, demurrageCharge: e.target.value })}
                  className="w-full outline-none font-medium text-slate-800"
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-2.5 bg-white">
                <label className="block text-slate-500 font-medium text-[11px] mb-1">Charge Applicable After</label>
                <select
                  value={form.demurrageApplicableAfter}
                  onChange={e => setForm({ ...form, demurrageApplicableAfter: e.target.value })}
                  className="w-full outline-none font-medium text-slate-800 bg-transparent"
                >
                  <option value="Not Applicable">Not Applicable</option>
                  <option value="24 Hours">24 Hours</option>
                  <option value="48 Hours">48 Hours</option>
                  <option value="Arrival">Arrival</option>
                </select>
              </div>
            </div>
          </div>

          {/* BANK DETAILS (Optional, NOT added automatically) */}
          <div className="border border-slate-200 rounded-2xl p-5 pt-7 relative bg-white shadow-2xs">
            <span className="absolute -top-3 left-4 bg-indigo-600 text-white px-3 py-0.5 rounded-md text-xs font-bold shadow-2xs">
              Bank Details (Optional)
            </span>

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 border border-slate-200 p-3.5 rounded-xl">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={!!form.showBankDetails}
                    onChange={e => {
                      const isChecked = e.target.checked;
                      setForm({
                        ...form,
                        showBankDetails: isChecked,
                        bankBeneficiaryName: form.bankBeneficiaryName || companyProfile?.beneficiaryName || companyProfile?.companyName || 'UrbanPro Packers & Logistics',
                        bankName: form.bankName || companyProfile?.bankName || 'State Bank of India',
                        bankAccNo: form.bankAccNo || companyProfile?.bankAccNo || companyProfile?.accountNo || '40912384729',
                        bankIfsc: form.bankIfsc || companyProfile?.bankIfsc || companyProfile?.ifscCode || 'SBIN0001234',
                        bankBranch: form.bankBranch || companyProfile?.bankBranch || 'Hanspal, Bhubaneswar'
                      });
                    }}
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800">Include Bank Details on this Bilty</span>
                    <p className="text-[11px] text-slate-500">Not added automatically. Check this box only if you want bank details printed on this Bilty PDF.</p>
                  </div>
                </label>

                {form.showBankDetails && (
                  <button
                    type="button"
                    onClick={() => {
                      setForm(prev => ({
                        ...prev,
                        bankBeneficiaryName: companyProfile?.beneficiaryName || companyProfile?.companyName || 'UrbanPro Packers & Logistics',
                        bankName: companyProfile?.bankName || 'State Bank of India',
                        bankAccNo: companyProfile?.bankAccNo || companyProfile?.accountNo || '40912384729',
                        bankIfsc: companyProfile?.bankIfsc || companyProfile?.ifscCode || 'SBIN0001234',
                        bankBranch: companyProfile?.bankBranch || 'Hanspal, Bhubaneswar'
                      }));
                    }}
                    className="text-xs text-indigo-700 bg-white hover:bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-lg font-semibold cursor-pointer shadow-2xs self-start sm:self-auto"
                  >
                    Load Default Bank Info
                  </button>
                )}
              </div>

              {form.showBankDetails && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
                  <div className="border border-slate-300 rounded-xl p-2.5 bg-white">
                    <label className="block text-slate-500 font-medium text-[11px] mb-1">Beneficiary Name</label>
                    <input
                      type="text"
                      value={form.bankBeneficiaryName || ''}
                      onChange={e => setForm({ ...form, bankBeneficiaryName: e.target.value })}
                      className="w-full outline-none font-medium text-slate-800"
                    />
                  </div>

                  <div className="border border-slate-300 rounded-xl p-2.5 bg-white">
                    <label className="block text-slate-500 font-medium text-[11px] mb-1">Bank Name</label>
                    <input
                      type="text"
                      value={form.bankName || ''}
                      onChange={e => setForm({ ...form, bankName: e.target.value })}
                      className="w-full outline-none font-medium text-slate-800"
                    />
                  </div>

                  <div className="border border-slate-300 rounded-xl p-2.5 bg-white">
                    <label className="block text-slate-500 font-medium text-[11px] mb-1">Account Number</label>
                    <input
                      type="text"
                      value={form.bankAccNo || ''}
                      onChange={e => setForm({ ...form, bankAccNo: e.target.value })}
                      className="w-full outline-none font-mono font-medium text-slate-800"
                    />
                  </div>

                  <div className="border border-slate-300 rounded-xl p-2.5 bg-white">
                    <label className="block text-slate-500 font-medium text-[11px] mb-1">IFSC Code</label>
                    <input
                      type="text"
                      value={form.bankIfsc || ''}
                      onChange={e => setForm({ ...form, bankIfsc: e.target.value })}
                      className="w-full outline-none font-mono uppercase font-medium text-slate-800"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="pt-3">
            <button
              type="submit"
              className="bg-sky-600 hover:bg-sky-700 text-white font-bold px-8 py-3 rounded-xl text-sm cursor-pointer shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" /> Save
            </button>
          </div>
        </form>
        </>
      )}

      {viewMode === 'list' && (
        <div className="space-y-4">
          {/* Header Bar */}
          <div className="bg-white rounded-xl p-4 sm:p-5 shadow-2xs border border-slate-200/80 flex items-center justify-between">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800">All Bilties</h1>
            <span className="bg-[#0084ff] text-white text-xs font-bold px-3.5 py-1.5 rounded-md shadow-2xs">
              Total: {filteredBilties.length}
            </span>
          </div>

          {/* Controls: Add Bilty, All, Search Input & Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setForm({
                    ...initialForm,
                    id: `bilty-${Date.now()}`,
                    biltyNo: `${bilties.length + 1}`
                  });
                  setViewMode('form');
                }}
                className="bg-[#0f172a] hover:bg-slate-800 text-white font-bold px-6 py-2 rounded-full text-xs shadow-xs transition-colors cursor-pointer"
              >
                Add Bilty
              </button>

              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="bg-white hover:bg-slate-50 text-slate-700 font-semibold px-6 py-2 rounded-full text-xs transition-colors cursor-pointer border border-slate-300 shadow-2xs"
              >
                All
              </button>
            </div>

            <div className="flex items-center w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search Here.."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 px-3.5 py-2 border border-slate-300 rounded-l-md text-xs outline-none focus:border-sky-500 bg-white"
              />
              <button
                type="button"
                className="bg-[#0084ff] hover:bg-blue-600 text-white font-semibold px-5 py-2 rounded-r-md text-xs shadow-xs cursor-pointer transition-colors"
              >
                Search
              </button>
            </div>
          </div>

          {/* Pagination box */}
          <div className="pt-0.5">
            <span className="inline-flex items-center justify-center w-7 h-7 border border-slate-300 bg-white rounded text-xs font-semibold text-slate-700 shadow-2xs">
              1
            </span>
          </div>

          {/* Cards Grid */}
          {filteredBilties.length === 0 ? (
            <div className="text-center py-12 bg-white border border-slate-200 rounded-2xl">
              <Truck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500 text-xs font-medium">No Bilty (Lorry Receipt) records found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredBilties.map((rec, idx) => {
                const consignorName = rec.consignorName || (rec as any).consignor || 'Client';
                const consignorPhone = rec.consignorPhone || (rec as any).consignorMobile || (rec as any).mobile || '';
                const fromPlace = rec.consignorCity || (rec as any).fromCity || 'Bhubaneswar';
                const toPlace = rec.consigneeAddress ? `${rec.consigneeAddress}, ${rec.consigneeCity || (rec as any).toCity || ''}` : (rec.consigneeCity || (rec as any).toCity || (rec as any).consigneeAddress || 'Baripada');
                const freightVal = rec.freightToPay || rec.freightToBeBilled || (rec as any).freightCharges || (rec as any).toPayAmount;
                const deliveryDate = rec.goodsDeliveryDate || rec.biltyDate || '2026-09-12';
                const bDate = rec.biltyDate || '2026-09-11';
                const bNo = rec.biltyNo || `${idx + 1}`;

                return (
                  <div key={rec.id} className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
                    {/* Top Bar: Date badge on left, BILTY - #No on right */}
                    <div className="flex items-center justify-between">
                      <span className="bg-[#f59e0b] text-white font-bold text-xs px-3 py-1 rounded-md shadow-2xs">
                        {bDate}
                      </span>

                      <span className="bg-[#2563eb] text-white font-bold text-xs px-3 py-1 rounded-md shadow-2xs">
                        BILTY - #{bNo}
                      </span>
                    </div>

                    {/* Content 2-Columns */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
                      {/* Left Column: Client & Route */}
                      <div className="space-y-3.5">
                        {/* Client with Blue Circle User icon */}
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-[#2563eb] text-white flex items-center justify-center shrink-0">
                            <User className="w-3.5 h-3.5" />
                          </div>
                          <span className="font-semibold text-[#2563eb] text-sm truncate">
                            {consignorName}
                          </span>
                        </div>

                        {/* Connected Vertical Route */}
                        <div className="relative pl-8 space-y-4 py-1">
                          {/* From Pin */}
                          <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-[#2563eb] text-white flex items-center justify-center shrink-0">
                            <MapPin className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="block text-[11px] text-slate-400 font-normal">From</span>
                            <span className="font-semibold text-slate-800 text-xs sm:text-sm">{fromPlace}</span>
                          </div>

                          {/* Vertical Solid Blue Connecting Line */}
                          <div className="absolute left-[11px] top-7 bottom-7 w-0.5 bg-[#2563eb]" />

                          {/* To Pin */}
                          <div className="absolute left-0 bottom-1 w-6 h-6 rounded-full bg-[#2563eb] text-white flex items-center justify-center shrink-0">
                            <MapPin className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="block text-[11px] text-slate-400 font-normal">To</span>
                            <span className="font-semibold text-slate-800 text-xs sm:text-sm">{toPlace}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right Column: Freight, Phone, Goods Delivery */}
                      <div className="space-y-3.5">
                        {/* Freight Charge */}
                        <div className="flex items-start gap-2.5">
                          <div className="w-6 h-6 rounded-full bg-[#2563eb] text-white flex items-center justify-center shrink-0 mt-0.5">
                            <IndianRupee className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="block text-[11px] text-slate-400 font-normal">Freight Charge</span>
                            {freightVal ? (
                              <span className="font-semibold text-slate-800 text-xs sm:text-sm">
                                ₹{Number(freightVal).toLocaleString()}
                              </span>
                            ) : (
                              <span className="font-normal text-slate-400 text-xs">-</span>
                            )}
                          </div>
                        </div>

                        {/* Click to Call */}
                        <div className="flex items-start gap-2.5">
                          <div className="w-6 h-6 rounded-full bg-[#2563eb] text-white flex items-center justify-center shrink-0 mt-0.5">
                            <Phone className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="block text-[11px] text-slate-400 font-normal">Click to call</span>
                            <a
                              href={consignorPhone ? `tel:${consignorPhone}` : '#'}
                              className="font-semibold text-[#2563eb] text-xs sm:text-sm hover:underline"
                            >
                              {consignorPhone || 'N/A'}
                            </a>
                          </div>
                        </div>

                        {/* Goods Delivery */}
                        <div className="flex items-start gap-2.5">
                          <div className="w-6 h-6 rounded-full bg-[#2563eb] text-white flex items-center justify-center shrink-0 mt-0.5">
                            <Clock className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="block text-[11px] text-slate-400 font-normal">Goods Delivery</span>
                            <span className="font-semibold text-slate-800 text-xs sm:text-sm">
                              {deliveryDate}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom 4 Circular Actions (View, Share, Edit, Delete) */}
                    <div className="border-t border-slate-100 pt-3.5 flex items-center justify-center gap-6 sm:gap-8 text-center">
                      {/* View */}
                      <button
                        type="button"
                        onClick={() => { setSelectedRecord(rec); setViewMode('preview'); }}
                        className="flex flex-col items-center gap-1 group cursor-pointer"
                      >
                        <div className="w-9 h-9 rounded-full bg-[#0084ff] text-white flex items-center justify-center shadow-xs group-hover:bg-blue-600 transition-colors">
                          <FileText className="w-4 h-4" />
                        </div>
                        <span className="text-[11px] text-[#0084ff] font-medium">View</span>
                      </button>

                      {/* Share */}
                      <button
                        type="button"
                        onClick={() => {
                          if (navigator.share) {
                            navigator.share({ title: `Bilty #${bNo}`, text: `Lorry Receipt for ${consignorName}` });
                          } else {
                            navigator.clipboard?.writeText(`Bilty #${bNo} - ${consignorName} (${fromPlace} to ${toPlace}). Helpline: 8093017400`);
                            alert('Bilty details copied to clipboard!');
                          }
                        }}
                        className="flex flex-col items-center gap-1 group cursor-pointer"
                      >
                        <div className="w-9 h-9 rounded-full border border-[#22c55e] text-[#22c55e] bg-white flex items-center justify-center shadow-xs group-hover:bg-emerald-50 transition-colors">
                          <FileText className="w-4 h-4" />
                        </div>
                        <span className="text-[11px] text-[#22c55e] font-medium">Share</span>
                      </button>

                      {/* Edit */}
                      <button
                        type="button"
                        onClick={() => { setForm(rec); setViewMode('form'); }}
                        className="flex flex-col items-center gap-1 group cursor-pointer"
                      >
                        <div className="w-9 h-9 rounded-full border border-[#06b6d4] text-[#06b6d4] bg-white flex items-center justify-center shadow-xs group-hover:bg-cyan-50 transition-colors">
                          <Pencil className="w-4 h-4" />
                        </div>
                        <span className="text-[11px] text-[#06b6d4] font-medium">Edit</span>
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete Bilty #${bNo}?`)) {
                            onDelete(rec.id);
                          }
                        }}
                        className="flex flex-col items-center gap-1 group cursor-pointer"
                      >
                        <div className="w-9 h-9 rounded-full border border-[#f87171] text-[#f87171] bg-white flex items-center justify-center shadow-xs group-hover:bg-rose-50 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </div>
                        <span className="text-[11px] text-[#f87171] font-medium">Delete</span>
                      </button>
                    </div>
                  </div>
                );
              })}
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
                <span className="font-bold text-sm block">Official Bilty A4 Printable Document</span>
                <span className="text-[11px] text-slate-400">LR #{selectedRecord.biltyNo || '1'} • {selectedRecord.consignorName || 'Customer'}</span>
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
                onClick={() => handleDownloadBiltyPdf(selectedRecord)}
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
              <span>Bilty PDF successfully downloaded to your device downloads folder!</span>
            </div>
          )}

          {/* Official Printable Sheet */}
          <div 
            id="printable-bilty-pdf"
            className="bg-white w-full max-w-[794px] border-2 border-[#f87171] text-[11px] text-black font-sans box-border relative mx-auto my-auto print:border print:border-[#f87171] print:shadow-none print:w-full print:max-w-none shadow-xl"
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
                  src={companyProfile?.logo || UPL_LOGO_BASE64 || '/urbanpro-logo.jpeg'} 
                  alt="UrbanPro Packers & Logistics Logo" 
                  className="max-h-20 w-auto object-contain" 
                />
              </div>

              {/* Company Details */}
              <div className="w-[72%] p-2 text-center flex flex-col justify-center items-center bg-white">
                <div className="mb-0.5" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
                  <h1 className="text-[26px] sm:text-[30px] font-black tracking-tight leading-none">
                    <span style={{ color: '#1e3a8a' }}>Urban</span><span style={{ color: '#dc2626' }}>Pro</span>
                  </h1>
                  <h2 className="text-[13px] sm:text-[15px] font-extrabold tracking-wider uppercase mt-0.5" style={{ color: '#1e3a8a' }}>
                    Packers & Logistics
                  </h2>
                </div>
                <p className="text-[11px] sm:text-[11.5px] leading-tight text-black font-medium mt-0.5">
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

            {/* Bilty Title Bar in Yellow */}
            <div className="bg-[#fef08a] text-center font-bold py-1 border-b border-[#f87171] text-[12px] text-black tracking-wide">
              Bilty (Lorry Receipt)
            </div>

            {/* Notice Box */}
            <div className="p-2 border-b border-[#f87171] bg-white text-[9.5px] leading-snug text-black">
              <span className="font-bold text-black block mb-0.5">Notice</span>
              The consignment by the lorry receipt shall be stored at the destination under the control of the transport operator and shall be delivered to the order of the consignee whose name is mentioned in the lorry receipt. It will under no circumstance be delivered to anyone without written authority from the consignee on its order.
            </div>

            {/* Main Content Grid (Left 68%, Right 32%) */}
            <div className="grid grid-cols-12 border-b border-[#f87171]">
              {/* Left Side (8 of 12) */}
              <div className="col-span-8 border-r border-[#f87171]">
                {/* At Carriers Risk */}
                <div className="bg-[#ffb3b3] text-center font-bold py-0.5 border-b border-[#f87171] text-[10.5px] text-black">
                  {selectedRecord.riskType || 'At Carriers Risk'}
                </div>
                <div className="p-2 space-y-0.5 text-[10px] leading-tight border-b border-[#f87171]">
                  <p><strong>Lr. No.:</strong> {selectedRecord.biltyNo || '1'}</p>
                  <p><strong>Lr. Date:</strong> {selectedRecord.biltyDate || ''}</p>
                  <p><strong>Move From:</strong> {selectedRecord.consignorCity || 'Bhubaneswar'}</p>
                  <p><strong>Move To:</strong> {selectedRecord.consigneeAddress ? `${selectedRecord.consigneeAddress}, ${selectedRecord.consigneeCity || ''}` : (selectedRecord.consigneeCity || '')}</p>
                  <p><strong>Vehicle No.:</strong> {selectedRecord.vehicleNo || ''}</p>
                  {selectedRecord.driverName && (
                    <p><strong>Driver:</strong> {selectedRecord.driverName} {selectedRecord.driverMobile ? `(${selectedRecord.driverMobile})` : ''}</p>
                  )}
                </div>

                {/* Relocate From & Relocate To */}
                <div className="grid grid-cols-2 border-b border-[#f87171]">
                  {/* Relocate From */}
                  <div className="border-r border-[#f87171]">
                    <div className="bg-[#ffb3b3] text-center font-bold py-0.5 border-b border-[#f87171] text-[10.5px] text-black">
                      Relocate From
                    </div>
                    <div className="p-2 space-y-0.5 text-[9.5px] leading-tight">
                      <p><strong>Name:</strong> {selectedRecord.consignorName || ''}</p>
                      <p><strong>Phone:</strong> {selectedRecord.consignorPhone || ''}</p>
                      <p><strong>GST No:</strong> {selectedRecord.consignorGstin || ''}</p>
                      <p><strong>Address:</strong> {selectedRecord.consignorAddress || ''}</p>
                      <p><strong>Pin/City/Country:</strong> {[selectedRecord.consignorPincode, selectedRecord.consignorCity, selectedRecord.consignorCountry].filter(Boolean).join('/')}</p>
                    </div>
                  </div>

                  {/* Relocate To */}
                  <div>
                    <div className="bg-[#ffb3b3] text-center font-bold py-0.5 border-b border-[#f87171] text-[10.5px] text-black">
                      Relocate To
                    </div>
                    <div className="p-2 space-y-0.5 text-[9.5px] leading-tight">
                      <p><strong>Name:</strong> {selectedRecord.consigneeName || ''}</p>
                      <p><strong>Phone:</strong> {selectedRecord.consigneePhone || ''}</p>
                      <p><strong>GST No:</strong> {selectedRecord.consigneeGstin || ''}</p>
                      <p><strong>Address:</strong> {selectedRecord.consigneeAddress || ''}</p>
                      <p><strong>Pin/City/Country:</strong> {[selectedRecord.consigneePincode, selectedRecord.consigneeCity, selectedRecord.consigneeCountry].filter(Boolean).join('/')}</p>
                    </div>
                  </div>
                </div>

                {/* Package & Goods Details */}
                <div className="p-2 space-y-1 text-[9.5px] leading-tight">
                  <div>
                    <strong className="underline text-black">Package:</strong>
                    <p className="mt-0.5">{selectedRecord.packages || selectedRecord.packagesDescription || 'As Per List Attached'}</p>
                  </div>
                  <div>
                    <strong className="underline text-black">Packages and Goods Description:</strong>
                    <p className="mt-0.5">{selectedRecord.goodsDescription || selectedRecord.packagesDescription || 'Old & Used Goods'}</p>
                  </div>
                  <div>
                    <strong className="underline text-black">Remark:</strong>
                    <p className="mt-0.5">{selectedRecord.remark || 'Not For Sale'}</p>
                  </div>
                  <div>
                    <strong className="underline text-black">Total Weight:</strong>
                    <p className="mt-0.5">{selectedRecord.totalWeight ? `${selectedRecord.totalWeight} ${selectedRecord.weightType || 'MT'}` : 'Fixed MT'}</p>
                  </div>
                  <div>
                    <strong className="underline text-black">Total amt in words:</strong>
                    <p className="mt-0.5">{selectedRecord.totalAmtInWords || (selectedRecord.freightToBeBilled ? `${numberToIndianWords(Number(selectedRecord.freightToBeBilled))} Rupees Only` : 'Zero Rupees Only')}</p>
                  </div>
                </div>
              </div>

              {/* Right Side (4 of 12) */}
              <div className="col-span-4 flex flex-col justify-between">
                {/* Material Insured Top Box */}
                <div>
                  <div className="bg-[#ffb3b3] text-center font-bold py-0.5 border-b border-[#f87171] text-[10.5px] text-black">
                    Material Insured
                  </div>
                  <div className="p-2 space-y-0.5 text-[9.5px] leading-tight border-b border-[#f87171]">
                    <p><strong>Insurance Company:</strong> {selectedRecord.insuranceCompany || ''}</p>
                    <p><strong>Policy Number:</strong> {selectedRecord.policyNumber || ''}</p>
                    <p><strong>Insurance Date:</strong> {selectedRecord.insuranceDate || ''}</p>
                    <p><strong>Insured Amount:</strong> {selectedRecord.insuredAmount || ''}</p>
                    <p><strong>Insurance Risk:</strong> {selectedRecord.insuredRisk || selectedRecord.insuranceStatus || ''}</p>
                  </div>

                  {/* Financial Billed / Paid / To Pay Rows */}
                  <div className="border-b border-[#f87171]">
                    <div className="bg-[#ffb3b3] px-2 py-0.5 text-[10px] font-bold text-black border-b border-[#f87171]">
                      Freight to Be Billed:
                    </div>
                    <div className="px-2 py-1 text-[10px] font-bold text-black border-b border-[#f87171]">
                      ₹ {selectedRecord.freightToBeBilled ? Number(selectedRecord.freightToBeBilled).toLocaleString() : '0'}
                    </div>

                    <div className="bg-[#ffb3b3] px-2 py-0.5 text-[10px] font-bold text-black border-b border-[#f87171]">
                      Freight Paid:
                    </div>
                    <div className="px-2 py-1 text-[10px] font-bold text-black border-b border-[#f87171]">
                      ₹ {selectedRecord.freightPaid ? Number(selectedRecord.freightPaid).toLocaleString() : '0'}
                    </div>

                    <div className="bg-[#ffb3b3] px-2 py-0.5 text-[10px] font-bold text-black border-b border-[#f87171]">
                      Freight To Pay:
                    </div>
                    <div className="px-2 py-1 text-[10px] font-bold text-black border-b border-[#f87171]">
                      ₹ {selectedRecord.freightToPay ? Number(selectedRecord.freightToPay).toLocaleString() : '0'}
                    </div>
                  </div>

                  {/* Demurrage Box */}
                  <div>
                    <div className="bg-[#ffb3b3] text-center font-bold py-0.5 border-b border-[#f87171] text-[10.5px] text-black">
                      Demurrage Charges
                    </div>
                    <div className="p-2 text-[9px] leading-tight text-black">
                      <p className="font-bold">Demurrage charge after {selectedRecord.demurrageApplicableAfter || 'Not Applicable'}</p>
                      <p className="mt-1">{selectedRecord.demurrageCharge ? `@ ₹${selectedRecord.demurrageCharge} ${selectedRecord.demurrageType || 'Per Day'}` : '@ Rupees Per Day'} + handling charges & local transportation charges.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Signature & Bank Details Row (Bank is optional and NOT added automatically) */}
            {selectedRecord.showBankDetails ? (
              <div className="grid grid-cols-12 border-b border-[#f87171] min-h-[110px]">
                {/* Left: Receiver's signature */}
                <div className="col-span-4 p-2.5 flex flex-col justify-between border-r border-[#f87171] text-[9.5px]">
                  <div className="leading-tight">
                    <p className="font-medium text-black">Agree with Terms & Conditions as Overleaf Signature</p>
                    <p className="font-bold text-black mt-1">Receiver's Signature / Stamp</p>
                  </div>
                  <div className="h-8"></div>
                </div>

                {/* Middle: Company Authorized Signature */}
                <div className="col-span-4 p-2 text-center flex flex-col justify-between items-center border-r border-[#f87171] text-[9.5px]">
                  <p className="font-bold text-[10px]">
                    For <span className="text-[#1e3a8a]">Urban</span><span className="text-[#dc2626]">Pro</span> <span className="text-[#1e3a8a]">Packers & Logistics</span>
                  </p>
                  <div className="my-1 flex items-center justify-center min-h-[44px]">
                    {globalSignature?.image ? (
                      <img 
                        src={globalSignature.image} 
                        alt="Authorized Signature" 
                        className="max-h-11 max-w-[140px] object-contain mx-auto" 
                      />
                    ) : (
                      <span className="text-indigo-900 text-lg font-bold tracking-widest italic" style={{ fontFamily: "Brush Script MT, cursive" }}>
                        {globalSignature?.text || 'VIJAY'}
                      </span>
                    )}
                  </div>
                  <p className="text-blue-700 font-semibold text-[9px]">Authorized Signature</p>
                </div>

                {/* Right: Bank Details */}
                <div className="col-span-4 p-2 text-[9.5px] leading-tight bg-white">
                  <strong className="underline text-black block mb-0.5">Bank Details</strong>
                  <p><strong>Beneficiary Name:</strong> {selectedRecord.bankBeneficiaryName || companyProfile?.beneficiaryName || companyProfile?.companyName || 'UrbanPro Packers & Logistics'}</p>
                  <p><strong>Bank Name:</strong> {selectedRecord.bankName || companyProfile?.bankName || 'State Bank of India'}</p>
                  <p><strong>Bank A/C No.:</strong> {selectedRecord.bankAccNo || companyProfile?.bankAccNo || companyProfile?.accountNo || ''}</p>
                  <p><strong>Bank IFSC Code:</strong> {selectedRecord.bankIfsc || companyProfile?.bankIfsc || companyProfile?.ifscCode || ''}</p>
                  <p className="underline text-black mt-0.5">Other Payment Details</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 border-b border-[#f87171] min-h-[110px]">
                {/* Left: Receiver's signature */}
                <div className="p-3 flex flex-col justify-between border-r border-[#f87171] text-[9.5px]">
                  <div className="leading-tight">
                    <p className="font-medium text-black">Agree with Terms & Conditions as Overleaf Signature</p>
                    <p className="font-bold text-black mt-1">Receiver's Signature / Stamp</p>
                  </div>
                  <div className="h-10"></div>
                </div>

                {/* Right: Company Authorized Signature */}
                <div className="p-3 text-center flex flex-col justify-between items-center text-[9.5px]">
                  <p className="font-bold text-[10.5px]">
                    For <span className="text-[#1e3a8a]">Urban</span><span className="text-[#dc2626]">Pro</span> <span className="text-[#1e3a8a]">Packers & Logistics</span>
                  </p>
                  <div className="my-1.5 flex items-center justify-center min-h-[46px]">
                    {globalSignature?.image ? (
                      <img 
                        src={globalSignature.image} 
                        alt="Authorized Signature" 
                        className="max-h-12 max-w-[170px] object-contain mx-auto" 
                      />
                    ) : (
                      <span className="text-indigo-900 text-xl font-bold tracking-widest italic" style={{ fontFamily: "Brush Script MT, cursive" }}>
                        {globalSignature?.text || 'VIJAY'}
                      </span>
                    )}
                  </div>
                  <p className="text-blue-700 font-semibold text-[9px]">Authorized Signature</p>
                </div>
              </div>
            )}

            {/* 24x7 Customer Care Support Bar */}
            <div className="bg-[#ffb3b3] text-center font-bold py-1 border-b border-[#f87171] text-[11px] tracking-wide text-black">
              24x7 Customer Care Support 8093017400
            </div>

            {/* Bottom Warning Note */}
            <div className="p-2 bg-white text-[9px] text-[#b91c1c] leading-tight">
              <strong>Note:</strong> Please keep your Cash/Jewellery and other valuable items in your Custody/Lock. Carrying Liquor, Gas Cylinder, Acid of any type of Liquids (like Ghee Tin, Oil etc.) is totally prohibited.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
