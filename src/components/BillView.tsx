import React, { useState } from 'react';
import { 
  FileText, 
  Printer, 
  Save, 
  Plus, 
  Sparkles, 
  Search, 
  User, 
  MapPin, 
  Phone, 
  Clock, 
  Share2, 
  Trash2, 
  IndianRupee, 
  Pencil, 
  Check, 
  Building2, 
  Calendar, 
  Truck, 
  Box, 
  ShieldCheck,
  CheckCircle2,
  Download,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { UPL_LOGO_BASE64 } from '../assets/logoBase64';
import { downloadPdfFromElement, openElementInPrintWindow } from '../utils/pdfExport';
import { INDIAN_STATES, getStateCodeByName } from '../utils/indianStates';

export interface BillData {
  id: string;
  billNo: string;
  date: string;
  billDate?: string;
  lrBiltyNo?: string;
  goodsDeliveryDate?: string;
  vehicleNo?: string;

  // Billing Details
  partyName: string;
  mobileNo: string;
  gstin: string;
  panNo?: string;
  country?: string;
  state?: string;
  stateCode?: string;
  city?: string;
  area?: string;
  pincode?: string;
  address?: string;
  modeOfMoving?: string;
  typeOfShipment?: string;

  // Consignor
  sameAsBillingConsignor?: boolean;
  consignorName?: string;
  consignorPhone?: string;
  consignorGstin?: string;
  consignorAddress?: string;

  // Consignee
  consigneeName?: string;
  consigneePhone?: string;
  consigneeGstin?: string;
  consigneeAddress?: string;

  // Relocate From
  sameAsBillingRelocateFrom?: boolean;
  fromCountry?: string;
  fromState?: string;
  fromCity?: string;
  fromArea?: string;
  fromPincode?: string;
  fromFloor?: string;

  // Relocate To
  toCountry?: string;
  toState?: string;
  toCity?: string;
  toArea?: string;
  toPincode?: string;
  toFloor?: string;

  // Package Details
  packageType?: string;
  packageDescription?: string;
  weightType?: string;
  totalWeight?: string;
  remark?: string;

  // Charges
  freightAmount: number; // Transportation Charges
  packingCharges: number;
  unpackingCharges: number;
  loadingCharges: number;
  unloadingCharges: number;
  dismantlingCharges: number;
  octroiCharges: number;
  carTransportationCharges: number;
  bikeTransportationCharges: number;
  statCharges: number;

  // Service/Insurance/GST
  serviceChargePercent: number;
  serviceCharge: number;
  insurancePercent: number;
  goodsValue: number;
  insuranceCharges: number;
  gstType: string;
  gstRate: number;
  gstCharge: number;

  totalAmount: number;
  payableInWords?: string;
}

interface Props {
  bills: BillData[];
  onSave: (data: BillData) => void;
  onDelete: (id: string) => void;
  customerProfiles?: any[];
  globalSignature?: { text: string; image?: string };
  companyProfile?: any;
}

function numberToWordsIndian(num: number): string {
  if (isNaN(num) || num === 0) return 'Zero Rupees Only';
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function inWords(n: number): string {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
    if (n < 1000) return a[Math.floor(n / 100)] + 'Hundred ' + (n % 100 !== 0 ? 'and ' + inWords(n % 100) : '');
    if (n < 100000) return inWords(Math.floor(n / 1000)) + 'Thousand ' + (n % 1000 !== 0 ? inWords(n % 1000) : '');
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + 'Lakh ' + (n % 100000 !== 0 ? inWords(n % 100000) : '');
    return inWords(Math.floor(n / 10000000)) + 'Crore ' + (n % 10000000 !== 0 ? inWords(n % 10000000) : '');
  }

  const rounded = Math.round(num);
  return 'Rupees ' + inWords(rounded).trim() + ' Only';
}

export const BillView: React.FC<Props> = ({ 
  bills, 
  onSave, 
  onDelete, 
  customerProfiles = [], 
  globalSignature,
  companyProfile 
}) => {
  const [viewMode, setViewMode] = useState<'form' | 'list' | 'preview'>('form');
  const [selectedRecord, setSelectedRecord] = useState<BillData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleDownloadBillPdf = async (billRecord?: BillData) => {
    const rec = billRecord || selectedRecord;
    if (!rec) return;

    try {
      setIsDownloading(true);
      setDownloadSuccess(false);

      const printableElement = document.getElementById('printable-bill-invoice-pdf');
      if (!printableElement) {
        window.print();
        return;
      }

      const filename = `UrbanPro_Invoice_Bill${rec.billNo || '1'}_${(rec.partyName || 'Customer').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      const result = await downloadPdfFromElement(printableElement, filename);

      if (result.success) {
        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 5000);
      }
    } catch (err) {
      console.error('Error downloading Bill PDF:', err);
      window.print();
    } finally {
      setIsDownloading(false);
    }
  };

  const handleOpenInNewTab = (rec?: BillData) => {
    const printableElement = document.getElementById('printable-bill-invoice-pdf');
    if (printableElement) {
      const bNo = (rec || selectedRecord)?.billNo || '1';
      openElementInPrintWindow(printableElement, `UrbanPro Invoice Bill #${bNo}`);
    } else {
      window.print();
    }
  };

  const initialForm: BillData = {
    id: `bill-${Date.now()}`,
    billNo: `${bills.length + 1}`,
    date: new Date().toISOString().split('T')[0],
    billDate: new Date().toISOString().split('T')[0],
    lrBiltyNo: '',
    goodsDeliveryDate: '',
    vehicleNo: '',

    partyName: '',
    mobileNo: '',
    gstin: '',
    panNo: '',
    country: 'India',
    state: 'N/A',
    stateCode: '',
    city: '',
    area: '',
    pincode: '',
    address: '',
    modeOfMoving: 'By Surface',
    typeOfShipment: 'Personal Goods',

    sameAsBillingConsignor: true,
    consignorName: '',
    consignorPhone: '',
    consignorGstin: '',
    consignorAddress: '',

    consigneeName: '',
    consigneePhone: '',
    consigneeGstin: '',
    consigneeAddress: '',

    sameAsBillingRelocateFrom: true,
    fromCountry: 'India',
    fromState: 'N/A',
    fromCity: '',
    fromArea: '',
    fromPincode: '',
    fromFloor: 'N/A',

    toCountry: 'India',
    toState: 'N/A',
    toCity: '',
    toArea: '',
    toPincode: '',
    toFloor: 'N/A',

    packageType: 'As Per List Attached',
    packageDescription: 'Old & Used Household Goods',
    weightType: 'MT',
    totalWeight: '',
    remark: 'Not For Sale',

    freightAmount: 25000,
    packingCharges: 3500,
    unpackingCharges: 1500,
    loadingCharges: 1500,
    unloadingCharges: 1500,
    dismantlingCharges: 0,
    octroiCharges: 0,
    carTransportationCharges: 0,
    bikeTransportationCharges: 0,
    statCharges: 0,

    serviceChargePercent: 0,
    serviceCharge: 0,
    insurancePercent: 3,
    goodsValue: 100000,
    insuranceCharges: 3000,
    gstType: 'CGST/SGST',
    gstRate: 18,
    gstCharge: 6480,

    totalAmount: 42480,
    payableInWords: ''
  };

  const [form, setForm] = useState<BillData>(initialForm);

  // Calculations
  const calcSubTotal = (f: BillData) => {
    return (
      (Number(f.freightAmount) || 0) +
      (Number(f.packingCharges) || 0) +
      (Number(f.unpackingCharges) || 0) +
      (Number(f.loadingCharges) || 0) +
      (Number(f.unloadingCharges) || 0) +
      (Number(f.dismantlingCharges) || 0) +
      (Number(f.octroiCharges) || 0) +
      (Number(f.carTransportationCharges) || 0) +
      (Number(f.bikeTransportationCharges) || 0) +
      (Number(f.statCharges) || 0) +
      (Number(f.serviceCharge) || 0) +
      (Number(f.insuranceCharges) || 0)
    );
  };

  const calcGstAmt = (f: BillData) => {
    const sub = calcSubTotal(f);
    if (f.gstType === 'Exempted' || f.gstRate === 0) return 0;
    return (sub * (Number(f.gstRate) || 0)) / 100;
  };

  const calcGrandTotal = (f: BillData) => {
    const sub = calcSubTotal(f);
    const gst = calcGstAmt(f);
    return sub + gst;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const grand = calcGrandTotal(form);
    const gstCalculated = calcGstAmt(form);
    const finalRecord: BillData = {
      ...form,
      gstCharge: gstCalculated,
      totalAmount: grand,
      payableInWords: numberToWordsIndian(grand)
    };
    onSave(finalRecord);
    setSelectedRecord(finalRecord);
    setViewMode('preview');
  };

  const applyCustomerAutoFill = (cp: any) => {
    setForm(prev => ({
      ...prev,
      partyName: cp.partyName || prev.partyName,
      mobileNo: cp.mobileNo || prev.mobileNo,
      city: cp.fromCity || prev.city,
      area: cp.fromArea || prev.area,
      pincode: cp.fromPinCode || cp.fromPincode || prev.pincode,
      consignorName: cp.partyName || prev.consignorName,
      consignorPhone: cp.mobileNo || prev.consignorPhone,
      fromCity: cp.fromCity || prev.fromCity,
      fromArea: cp.fromArea || prev.fromArea,
      fromPincode: cp.fromPinCode || cp.fromPincode || prev.fromPincode,
      toCity: cp.toCity || prev.toCity,
      toArea: cp.toArea || prev.toArea,
      toPincode: cp.toPinCode || cp.toPincode || prev.toPincode,
    }));
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header Pill Bar matching screenshot */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setForm({
                ...initialForm,
                id: `bill-${Date.now()}`,
                billNo: `${bills.length + 1}`
              });
              setViewMode('form');
            }}
            className={`font-bold px-4 py-1.5 rounded-full text-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'form' 
                ? 'bg-black text-white shadow-xs' 
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Bill</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`font-bold px-4 py-1.5 rounded-full text-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'list' 
                ? 'bg-black text-white shadow-xs' 
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>All Bills ({bills.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <input
              type="text"
              placeholder="Search Here.."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-3 pr-8 py-1.5 border border-slate-300 rounded-lg text-xs outline-none focus:border-sky-500 bg-white"
            />
          </div>
          <button
            type="button"
            className="bg-sky-600 hover:bg-sky-700 text-white font-bold px-4 py-1.5 rounded-lg text-xs shadow-xs cursor-pointer flex items-center gap-1"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search</span>
          </button>
        </div>
      </div>

      {/* Auto-fill Helper Banner */}
      {viewMode === 'form' && customerProfiles.length > 0 && (
        <div className="bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-200 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2 text-xs text-sky-900 font-semibold">
            <Sparkles className="w-4 h-4 text-sky-600 shrink-0" />
            <span>Quick Auto-fill Customer Details:</span>
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-16 overflow-y-auto">
            {customerProfiles.slice(0, 5).map((cp, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyCustomerAutoFill(cp)}
                className="bg-white hover:bg-sky-600 hover:text-white text-slate-700 border border-sky-300 rounded-full px-3 py-0.5 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
              >
                {cp.partyName}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* FORM VIEW matching app.epackers.in/add-bill.aspx exact screenshots */}
      {viewMode === 'form' && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Bill Details (Blue Pill Badge) */}
          <div className="border-2 border-[#0284c7] rounded-2xl p-6 pt-8 relative bg-white shadow-xs">
            <span className="absolute -top-3.5 left-4 bg-[#0284c7] text-white px-4 py-1 rounded-md text-xs font-bold shadow-xs">
              Bill Details
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-slate-300 rounded-xl p-3 bg-white">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bill (Invoice) No. *
                </label>
                <input
                  type="text"
                  required
                  value={form.billNo}
                  onChange={e => setForm({ ...form, billNo: e.target.value })}
                  className="w-full outline-none font-bold text-slate-900 text-sm"
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-3 bg-white">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bill (Invoice) Date *
                </label>
                <input
                  type="date"
                  required
                  value={form.billDate || form.date}
                  onChange={e => setForm({ ...form, billDate: e.target.value, date: e.target.value })}
                  className="w-full outline-none font-medium text-slate-800 text-sm"
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-3 bg-white">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  LR (Bilty) No.
                </label>
                <input
                  type="text"
                  placeholder="LR / Bilty Number"
                  value={form.lrBiltyNo}
                  onChange={e => setForm({ ...form, lrBiltyNo: e.target.value })}
                  className="w-full outline-none font-medium text-slate-800 text-sm"
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-3 bg-white">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Goods Delivery Date
                </label>
                <input
                  type="date"
                  value={form.goodsDeliveryDate}
                  onChange={e => setForm({ ...form, goodsDeliveryDate: e.target.value })}
                  className="w-full outline-none font-medium text-slate-800 text-sm"
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-3 bg-white md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Vehicle No.
                </label>
                <input
                  type="text"
                  placeholder="e.g. OD-02-AX-4821"
                  value={form.vehicleNo}
                  onChange={e => setForm({ ...form, vehicleNo: e.target.value })}
                  className="w-full outline-none font-mono font-bold text-slate-800 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Billing Details (Blue Pill Badge) */}
          <div className="border-2 border-[#0284c7] rounded-2xl p-6 pt-8 relative bg-white shadow-xs">
            <span className="absolute -top-3.5 left-4 bg-[#0284c7] text-white px-4 py-1 rounded-md text-xs font-bold shadow-xs">
              Billing Details
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-slate-300 rounded-xl p-3 bg-white">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bill to Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Client Name"
                  value={form.partyName}
                  onChange={e => setForm({ ...form, partyName: e.target.value })}
                  className="w-full outline-none font-bold text-slate-900 text-sm"
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-3 bg-white">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bill to Phone
                </label>
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={form.mobileNo}
                  onChange={e => setForm({ ...form, mobileNo: e.target.value })}
                  className="w-full outline-none font-medium text-slate-800 text-sm"
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-3 bg-white">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  GSTIN
                </label>
                <input
                  type="text"
                  placeholder="GSTIN Number"
                  value={form.gstin}
                  onChange={e => setForm({ ...form, gstin: e.target.value.toUpperCase() })}
                  className="w-full outline-none font-mono uppercase font-semibold text-slate-800 text-sm"
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-3 bg-white">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  PAN No. (Client Permanent Account No.)
                </label>
                <input
                  type="text"
                  placeholder="e.g. ABCDE1234F"
                  value={form.panNo || ''}
                  onChange={e => setForm({ ...form, panNo: e.target.value.toUpperCase() })}
                  className="w-full outline-none font-mono uppercase font-semibold text-slate-800 text-sm"
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-3 bg-white">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Country
                </label>
                <input
                  type="text"
                  readOnly
                  value={form.country || 'India'}
                  className="w-full outline-none font-medium text-slate-800 text-sm bg-transparent"
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-3 bg-white">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  State
                </label>
                <select
                  value={form.state || 'N/A'}
                  onChange={e => {
                    const st = e.target.value;
                    const autoCode = getStateCodeByName(st);
                    setForm({ 
                      ...form, 
                      state: st,
                      stateCode: autoCode || form.stateCode
                    });
                  }}
                  className="w-full outline-none font-medium text-slate-800 text-sm bg-transparent"
                >
                  {INDIAN_STATES.map((s, idx) => (
                    <option key={idx} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="border border-slate-300 rounded-xl p-3 bg-white">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  State Code
                </label>
                <input
                  type="text"
                  placeholder="State Code e.g. 21"
                  value={form.stateCode}
                  onChange={e => setForm({ ...form, stateCode: e.target.value })}
                  className="w-full outline-none font-medium text-slate-800 text-sm"
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-3 bg-white">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  placeholder="City Name"
                  value={form.city}
                  onChange={e => setForm({ ...form, city: e.target.value })}
                  className="w-full outline-none font-medium text-slate-800 text-sm"
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-3 bg-white">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Area
                </label>
                <input
                  type="text"
                  placeholder="Area / Locality"
                  value={form.area}
                  onChange={e => setForm({ ...form, area: e.target.value })}
                  className="w-full outline-none font-medium text-slate-800 text-sm"
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-3 bg-white">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pin Code
                </label>
                <input
                  type="text"
                  placeholder="Pincode"
                  value={form.pincode}
                  onChange={e => setForm({ ...form, pincode: e.target.value })}
                  className="w-full outline-none font-medium text-slate-800 text-sm"
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-3 bg-white">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  placeholder="Full Address"
                  value={form.address}
                  onChange={e => setForm({ ...form, address: e.target.value })}
                  className="w-full outline-none font-medium text-slate-800 text-sm"
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-3 bg-white">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mode of Moving
                </label>
                <select
                  value={form.modeOfMoving || 'By Surface'}
                  onChange={e => setForm({ ...form, modeOfMoving: e.target.value })}
                  className="w-full outline-none font-medium text-slate-800 text-sm bg-transparent"
                >
                  <option value="By Surface">By Surface</option>
                  <option value="By Air">By Air</option>
                  <option value="By Train">By Train</option>
                  <option value="By Express Vehicle">By Express Vehicle</option>
                </select>
              </div>

              <div className="border border-slate-300 rounded-xl p-3 bg-white">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Type of Shipment
                </label>
                <input
                  type="text"
                  value={form.typeOfShipment || 'Personal Goods'}
                  onChange={e => setForm({ ...form, typeOfShipment: e.target.value })}
                  className="w-full outline-none font-medium text-slate-800 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Consignor Details (Slate Pill Badge) */}
          <div className="border-2 border-slate-400 rounded-2xl p-6 pt-8 relative bg-white shadow-xs">
            <span className="absolute -top-3.5 left-4 bg-slate-600 text-white px-4 py-1 rounded-md text-xs font-bold shadow-xs">
              Consignor Details
            </span>

            <div className="mb-4">
              <button
                type="button"
                onClick={() => {
                  setForm(prev => ({
                    ...prev,
                    sameAsBillingConsignor: !prev.sameAsBillingConsignor,
                    consignorName: prev.partyName,
                    consignorPhone: prev.mobileNo,
                    consignorGstin: prev.gstin,
                    consignorAddress: `${prev.address || ''} ${prev.city || ''}`
                  }));
                }}
                className={`flex items-center gap-2 font-bold text-xs px-4 py-2 rounded-lg cursor-pointer transition-colors ${
                  form.sameAsBillingConsignor 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                    : 'bg-slate-100 text-slate-700 border border-slate-300'
                }`}
              >
                <Check className={`w-4 h-4 ${form.sameAsBillingConsignor ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>SAME AS BILLING DETAILS</span>
              </button>
            </div>

            {!form.sameAsBillingConsignor && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-slate-300 rounded-xl p-3 bg-white">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Consignor Name</label>
                  <input
                    type="text"
                    value={form.consignorName}
                    onChange={e => setForm({ ...form, consignorName: e.target.value })}
                    className="w-full outline-none font-medium text-slate-800 text-sm"
                  />
                </div>

                <div className="border border-slate-300 rounded-xl p-3 bg-white">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Consignor Phone</label>
                  <input
                    type="text"
                    value={form.consignorPhone}
                    onChange={e => setForm({ ...form, consignorPhone: e.target.value })}
                    className="w-full outline-none font-medium text-slate-800 text-sm"
                  />
                </div>

                <div className="border border-slate-300 rounded-xl p-3 bg-white">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Consignor GSTIN</label>
                  <input
                    type="text"
                    value={form.consignorGstin}
                    onChange={e => setForm({ ...form, consignorGstin: e.target.value })}
                    className="w-full outline-none font-medium text-slate-800 text-sm"
                  />
                </div>

                <div className="border border-slate-300 rounded-xl p-3 bg-white">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Consignor Address</label>
                  <input
                    type="text"
                    value={form.consignorAddress}
                    onChange={e => setForm({ ...form, consignorAddress: e.target.value })}
                    className="w-full outline-none font-medium text-slate-800 text-sm"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Consignee Details (Amber Pill Badge) */}
          <div className="border-2 border-[#f59e0b] rounded-2xl p-6 pt-8 relative bg-white shadow-xs">
            <span className="absolute -top-3.5 left-4 bg-[#f59e0b] text-white px-4 py-1 rounded-md text-xs font-bold shadow-xs">
              Consignee Details
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-slate-300 rounded-xl p-3 bg-white">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Consignee Name
                </label>
                <input
                  type="text"
                  placeholder="Consignee Receiver Name"
                  value={form.consigneeName}
                  onChange={e => setForm({ ...form, consigneeName: e.target.value })}
                  className="w-full outline-none font-medium text-slate-800 text-sm"
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-3 bg-white">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Consignee Phone
                </label>
                <input
                  type="tel"
                  placeholder="Consignee Phone"
                  value={form.consigneePhone}
                  onChange={e => setForm({ ...form, consigneePhone: e.target.value })}
                  className="w-full outline-none font-medium text-slate-800 text-sm"
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-3 bg-white">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  GSTIN
                </label>
                <input
                  type="text"
                  placeholder="Consignee GSTIN"
                  value={form.consigneeGstin}
                  onChange={e => setForm({ ...form, consigneeGstin: e.target.value })}
                  className="w-full outline-none font-medium text-slate-800 text-sm"
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-3 bg-white">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  placeholder="Destination Full Address"
                  value={form.consigneeAddress}
                  onChange={e => setForm({ ...form, consigneeAddress: e.target.value })}
                  className="w-full outline-none font-medium text-slate-800 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Relocate From (Sky Pill Badge) */}
          <div className="border-2 border-[#0284c7] rounded-2xl p-6 pt-8 relative bg-white shadow-xs">
            <span className="absolute -top-3.5 left-4 bg-[#0284c7] text-white px-4 py-1 rounded-md text-xs font-bold shadow-xs">
              Relocate From
            </span>

            <div className="mb-4">
              <button
                type="button"
                onClick={() => {
                  setForm(prev => ({
                    ...prev,
                    sameAsBillingRelocateFrom: !prev.sameAsBillingRelocateFrom,
                    fromCountry: prev.country || 'India',
                    fromState: prev.state || 'N/A',
                    fromCity: prev.city,
                    fromArea: prev.area,
                    fromPincode: prev.pincode
                  }));
                }}
                className={`flex items-center gap-2 font-bold text-xs px-4 py-2 rounded-lg cursor-pointer transition-colors ${
                  form.sameAsBillingRelocateFrom 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                    : 'bg-slate-100 text-slate-700 border border-slate-300'
                }`}
              >
                <Check className={`w-4 h-4 ${form.sameAsBillingRelocateFrom ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>SAME AS BILLING DETAILS</span>
              </button>
            </div>

            {!form.sameAsBillingRelocateFrom && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-slate-300 rounded-xl p-3 bg-white">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Country</label>
                  <input
                    type="text"
                    value={form.fromCountry || 'India'}
                    readOnly
                    className="w-full outline-none font-medium text-slate-800 text-sm bg-transparent"
                  />
                </div>

                <div className="border border-slate-300 rounded-xl p-3 bg-white">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">State</label>
                  <select
                    value={form.fromState || 'N/A'}
                    onChange={e => setForm({ ...form, fromState: e.target.value })}
                    className="w-full outline-none font-medium text-slate-800 text-sm bg-transparent"
                  >
                    {INDIAN_STATES.map((s, idx) => (
                      <option key={idx} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="border border-slate-300 rounded-xl p-3 bg-white">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={form.fromCity}
                    onChange={e => setForm({ ...form, fromCity: e.target.value })}
                    className="w-full outline-none font-medium text-slate-800 text-sm"
                  />
                </div>

                <div className="border border-slate-300 rounded-xl p-3 bg-white">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Area</label>
                  <input
                    type="text"
                    value={form.fromArea}
                    onChange={e => setForm({ ...form, fromArea: e.target.value })}
                    className="w-full outline-none font-medium text-slate-800 text-sm"
                  />
                </div>

                <div className="border border-slate-300 rounded-xl p-3 bg-white">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Pin Code</label>
                  <input
                    type="text"
                    value={form.fromPincode}
                    onChange={e => setForm({ ...form, fromPincode: e.target.value })}
                    className="w-full outline-none font-medium text-slate-800 text-sm"
                  />
                </div>

                <div className="border border-slate-300 rounded-xl p-3 bg-white">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">From Floor</label>
                  <input
                    type="text"
                    value={form.fromFloor || 'N/A'}
                    onChange={e => setForm({ ...form, fromFloor: e.target.value })}
                    className="w-full outline-none font-medium text-slate-800 text-sm"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section 6: Relocate To (Teal/Emerald Pill Badge) */}
          <div className="border-2 border-[#10b981] rounded-2xl p-6 pt-8 relative bg-white shadow-xs">
            <span className="absolute -top-3.5 left-4 bg-[#10b981] text-white px-4 py-1 rounded-md text-xs font-bold shadow-xs">
              Relocate To
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-slate-300 rounded-xl p-3 bg-white">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Country
                </label>
                <input
                  type="text"
                  readOnly
                  value={form.toCountry || 'India'}
                  className="w-full outline-none font-medium text-slate-800 text-sm bg-transparent"
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-3 bg-white">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  State
                </label>
                <select
                  value={form.toState || 'N/A'}
                  onChange={e => setForm({ ...form, toState: e.target.value })}
                  className="w-full outline-none font-medium text-slate-800 text-sm bg-transparent"
                >
                  {INDIAN_STATES.map((s, idx) => (
                    <option key={idx} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="border border-slate-300 rounded-xl p-3 bg-white">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  placeholder="Destination City"
                  value={form.toCity}
                  onChange={e => setForm({ ...form, toCity: e.target.value })}
                  className="w-full outline-none font-medium text-slate-800 text-sm"
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-3 bg-white">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Area
                </label>
                <input
                  type="text"
                  placeholder="Destination Area"
                  value={form.toArea}
                  onChange={e => setForm({ ...form, toArea: e.target.value })}
                  className="w-full outline-none font-medium text-slate-800 text-sm"
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-3 bg-white">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pin Code
                </label>
                <input
                  type="text"
                  placeholder="Destination Pincode"
                  value={form.toPincode}
                  onChange={e => setForm({ ...form, toPincode: e.target.value })}
                  className="w-full outline-none font-medium text-slate-800 text-sm"
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-3 bg-white">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  From Floor
                </label>
                <select
                  value={form.toFloor || 'N/A'}
                  onChange={e => setForm({ ...form, toFloor: e.target.value })}
                  className="w-full outline-none font-medium text-slate-800 text-sm bg-transparent"
                >
                  <option value="N/A">N/A</option>
                  <option value="Ground">Ground Floor</option>
                  <option value="1st Floor">1st Floor</option>
                  <option value="2nd Floor">2nd Floor</option>
                  <option value="3rd Floor">3rd Floor</option>
                  <option value="4th Floor">4th Floor</option>
                  <option value="Above 4th Floor">Above 4th Floor</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 7: Package Details (Emerald Pill Badge) */}
          <div className="border-2 border-[#10b981] rounded-2xl p-6 pt-8 relative bg-white shadow-xs">
            <span className="absolute -top-3.5 left-4 bg-[#10b981] text-white px-4 py-1 rounded-md text-xs font-bold shadow-xs">
              Package Details
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-slate-300 rounded-xl p-3 bg-white">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Package
                </label>
                <input
                  type="text"
                  value={form.packageType || 'As Per List Attached'}
                  onChange={e => setForm({ ...form, packageType: e.target.value })}
                  className="w-full outline-none font-medium text-slate-800 text-sm"
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-3 bg-white">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Package Description
                </label>
                <input
                  type="text"
                  value={form.packageDescription || 'Old & Used Household Goods'}
                  onChange={e => setForm({ ...form, packageDescription: e.target.value })}
                  className="w-full outline-none font-medium text-slate-800 text-sm"
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-3 bg-white">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Weight Type
                </label>
                <select
                  value={form.weightType || 'MT'}
                  onChange={e => setForm({ ...form, weightType: e.target.value })}
                  className="w-full outline-none font-medium text-slate-800 text-sm bg-transparent"
                >
                  <option value="MT">MT</option>
                  <option value="Kg">Kg</option>
                  <option value="CFT">CFT</option>
                  <option value="Ton">Ton</option>
                </select>
              </div>

              <div className="border border-slate-300 rounded-xl p-3 bg-white">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Total Weight
                </label>
                <input
                  type="text"
                  placeholder="Total Weight e.g. 1.5"
                  value={form.totalWeight}
                  onChange={e => setForm({ ...form, totalWeight: e.target.value })}
                  className="w-full outline-none font-medium text-slate-800 text-sm"
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-3 bg-white md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Remark
                </label>
                <input
                  type="text"
                  value={form.remark || 'Not For Sale'}
                  onChange={e => setForm({ ...form, remark: e.target.value })}
                  className="w-full outline-none font-medium text-slate-800 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Section 8: Charges Detail (Blue Pill Badge) with Pencil Edit Icons */}
          <div className="border-2 border-[#0284c7] rounded-2xl p-6 pt-8 relative bg-white shadow-xs">
            <span className="absolute -top-3.5 left-4 bg-[#0284c7] text-white px-4 py-1 rounded-md text-xs font-bold shadow-xs">
              Charges Detail
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'Transportation Charges', key: 'freightAmount' },
                { label: 'Packing Charges', key: 'packingCharges' },
                { label: 'Unpacking Charges', key: 'unpackingCharges' },
                { label: 'Loading Charges', key: 'loadingCharges' },
                { label: 'Unloading Charges', key: 'unloadingCharges' },
                { label: 'Dismantling/Assembling Charges', key: 'dismantlingCharges' },
                { label: 'Octroi/Entry Charges', key: 'octroiCharges' },
                { label: 'Car Transportation Charges', key: 'carTransportationCharges' },
                { label: 'Bike Transportation Charges', key: 'bikeTransportationCharges' },
                { label: 'Statistical/Document Charges', key: 'statCharges' },
              ].map((item, idx) => (
                <div key={idx} className="border border-slate-300 rounded-xl p-3 bg-white flex items-center justify-between gap-2">
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      {item.label}
                    </label>
                    <input
                      type="number"
                      value={(form as any)[item.key]}
                      onChange={e => setForm({ ...form, [item.key]: parseFloat(e.target.value) || 0 })}
                      className="w-full outline-none font-bold text-slate-900 text-sm"
                    />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-sky-50 text-sky-600 border border-sky-200 flex items-center justify-center shrink-0">
                    <Pencil className="w-3.5 h-3.5" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 9: Service/Insurance/GST (Slate Pill Badge) */}
          <div className="border-2 border-slate-400 rounded-2xl p-6 pt-8 relative bg-white shadow-xs">
            <span className="absolute -top-3.5 left-4 bg-slate-600 text-white px-4 py-1 rounded-md text-xs font-bold shadow-xs">
              Service/Insurance/GST
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-slate-300 rounded-xl p-3 bg-white">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Service Charge % (Percent)
                </label>
                <select
                  value={form.serviceChargePercent || 0}
                  onChange={e => {
                    const pct = parseFloat(e.target.value) || 0;
                    const subWithoutService = calcSubTotal({ ...form, serviceCharge: 0 });
                    const sc = (subWithoutService * pct) / 100;
                    setForm({ ...form, serviceChargePercent: pct, serviceCharge: sc });
                  }}
                  className="w-full outline-none font-medium text-slate-800 text-sm bg-transparent"
                >
                  <option value={0}>0%</option>
                  <option value={5}>5%</option>
                  <option value={10}>10%</option>
                  <option value={12}>12%</option>
                  <option value={15}>15%</option>
                </select>
              </div>

              <div className="border border-slate-300 rounded-xl p-3 bg-white flex items-center justify-between">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Service Charge (₹)
                  </label>
                  <input
                    type="number"
                    value={form.serviceCharge}
                    onChange={e => setForm({ ...form, serviceCharge: parseFloat(e.target.value) || 0 })}
                    className="w-full outline-none font-bold text-slate-900 text-sm"
                  />
                </div>
                <div className="w-8 h-8 rounded-full bg-sky-50 text-sky-600 border border-sky-200 flex items-center justify-center shrink-0">
                  <Pencil className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="border border-slate-300 rounded-xl p-3 bg-white">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Insurance %
                </label>
                <select
                  value={form.insurancePercent || 3}
                  onChange={e => {
                    const pct = parseFloat(e.target.value) || 0;
                    const ins = ((form.goodsValue || 0) * pct) / 100;
                    setForm({ ...form, insurancePercent: pct, insuranceCharges: ins });
                  }}
                  className="w-full outline-none font-medium text-slate-800 text-sm bg-transparent"
                >
                  <option value={3}>3%</option>
                  <option value={2}>2%</option>
                  <option value={1.5}>1.5%</option>
                  <option value={0}>0%</option>
                </select>
              </div>

              <div className="border border-slate-300 rounded-xl p-3 bg-white">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Goods Total Value in (Rs.)
                </label>
                <input
                  type="number"
                  placeholder="Declared Total Value"
                  value={form.goodsValue}
                  onChange={e => {
                    const val = parseFloat(e.target.value) || 0;
                    const ins = (val * (form.insurancePercent || 3)) / 100;
                    setForm({ ...form, goodsValue: val, insuranceCharges: ins });
                  }}
                  className="w-full outline-none font-bold text-slate-900 text-sm"
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-3 bg-white flex items-center justify-between md:col-span-2">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Insurance Charge (₹)
                  </label>
                  <input
                    type="number"
                    value={form.insuranceCharges}
                    onChange={e => setForm({ ...form, insuranceCharges: parseFloat(e.target.value) || 0 })}
                    className="w-full outline-none font-bold text-slate-900 text-sm"
                  />
                </div>
                <div className="w-8 h-8 rounded-full bg-sky-50 text-sky-600 border border-sky-200 flex items-center justify-center shrink-0">
                  <Pencil className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="border border-slate-300 rounded-xl p-3 bg-white">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  GST Type
                </label>
                <select
                  value={form.gstType || 'CGST/SGST'}
                  onChange={e => setForm({ ...form, gstType: e.target.value })}
                  className="w-full outline-none font-medium text-slate-800 text-sm bg-transparent"
                >
                  <option value="CGST/SGST">CGST/SGST (In-State)</option>
                  <option value="IGST">IGST (Inter-State)</option>
                  <option value="Exempted">Exempted / Reverse Charge</option>
                </select>
              </div>

              <div className="border border-slate-300 rounded-xl p-3 bg-white">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  GST % (Percent)
                </label>
                <select
                  value={form.gstRate || 18}
                  onChange={e => setForm({ ...form, gstRate: parseFloat(e.target.value) || 0 })}
                  className="w-full outline-none font-medium text-slate-800 text-sm bg-transparent"
                >
                  <option value={18}>18%</option>
                  <option value={12}>12%</option>
                  <option value={5}>5%</option>
                  <option value={0}>0%</option>
                </select>
              </div>

              <div className="border border-emerald-300 bg-emerald-50 rounded-xl p-3 flex items-center justify-between md:col-span-2">
                <div>
                  <label className="block text-xs font-bold text-emerald-800 mb-0.5">
                    Calculated Total Payable Bill Amount
                  </label>
                  <span className="text-xl font-black text-emerald-950">
                    ₹{calcGrandTotal(form).toLocaleString()}
                  </span>
                </div>
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <Pencil className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Save Button (Sky Blue `#0284c7`) matching screenshot */}
          <div className="flex justify-center pt-4">
            <button
              type="submit"
              className="bg-[#0284c7] hover:bg-sky-700 text-white font-bold px-10 py-3 rounded-xl text-sm shadow-md transition-all cursor-pointer flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save</span>
            </button>
          </div>
        </form>
      )}

      {/* LIST VIEW */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          {bills.length === 0 ? (
            <div className="text-center py-12 bg-white border border-slate-200 rounded-2xl">
              <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500 text-xs font-medium">No Tax Invoice / Bill records found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bills
                .filter(rec => 
                  (rec.partyName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                  (rec.billNo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                  (rec.mobileNo || '').includes(searchTerm)
                )
                .map((rec, idx) => (
                  <div key={rec.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 relative">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="border border-slate-300 bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs font-mono font-bold">
                          {idx + 1}
                        </span>
                        <span className="bg-amber-100 text-amber-800 font-bold text-xs px-2.5 py-0.5 rounded-md">
                          {rec.billDate || rec.date}
                        </span>
                      </div>

                      <span className="bg-sky-700 text-white font-bold text-xs px-3 py-1 rounded-full shadow-2xs">
                        BILL - #{rec.billNo}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs pt-1">
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5 font-bold text-indigo-950 text-sm">
                          <User className="w-4 h-4 text-indigo-600" />
                          <span>{rec.partyName || 'Client Name'}</span>
                        </div>

                        <div className="flex items-center gap-1.5 text-slate-600 text-xs">
                          <Phone className="w-3.5 h-3.5 text-sky-600" />
                          <a href={`tel:${rec.mobileNo}`} className="text-sky-600 font-bold hover:underline">
                            {rec.mobileNo || 'N/A'}
                          </a>
                        </div>

                        <div className="flex items-start gap-1.5 text-slate-600 text-xs">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <span>{rec.city || rec.fromCity || 'N/A'} → {rec.toCity || 'N/A'}</span>
                        </div>
                      </div>

                      <div className="space-y-2 text-slate-700">
                        <div className="flex items-center gap-1.5 font-bold text-slate-800">
                          <IndianRupee className="w-4 h-4 text-emerald-600" />
                          <div>
                            <span className="block text-[10px] text-slate-400 font-normal">Total Bill Amount</span>
                            <span className="text-emerald-700 font-bold text-sm">
                              ₹{(rec.totalAmount || calcGrandTotal(rec)).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {rec.vehicleNo && (
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <Truck className="w-3.5 h-3.5 text-slate-400" />
                            <span className="font-mono text-xs">{rec.vehicleNo}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Action Circles */}
                    <div className="border-t border-slate-100 pt-3 flex items-center justify-around gap-2 text-center text-[11px] font-semibold">
                      <button
                        type="button"
                        onClick={() => { setSelectedRecord(rec); setViewMode('preview'); }}
                        className="flex flex-col items-center gap-1 text-sky-600 hover:text-sky-700 cursor-pointer"
                      >
                        <div className="w-8 h-8 rounded-full bg-sky-500 text-white flex items-center justify-center shadow-xs">
                          <FileText className="w-4 h-4" />
                        </div>
                        <span>View (PDF)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (navigator.share) {
                            navigator.share({ title: `Tax Invoice #${rec.billNo}`, text: `GST Bill for ${rec.partyName}` });
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

      {/* OFFICIAL PRINTABLE PDF INVOICE VIEW */}
      {viewMode === 'preview' && selectedRecord && (
        <div className="space-y-4 max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 text-white p-4 rounded-2xl print:hidden shadow-lg">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-sm block">A4 Printable Invoice Bill Document</span>
                <span className="text-[11px] text-slate-400">Bill #{selectedRecord.billNo || '1'} • {selectedRecord.partyName || 'Customer'}</span>
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
                onClick={() => handleDownloadBillPdf(selectedRecord)}
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
                className="bg-sky-600 hover:bg-sky-500 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
              >
                <Printer className="w-4 h-4" />
                <span>Print</span>
              </button>
            </div>
          </div>

          {downloadSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs animate-fadeIn print:hidden">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Bill Invoice PDF successfully downloaded to your device downloads folder!</span>
            </div>
          )}

          {/* Clean Printable A4 Document Sheet */}
          <div 
            id="printable-bill-invoice-pdf"
            className="bg-white border-2 border-[#f87171] shadow-xl p-4 sm:p-6 text-slate-900 font-sans print:border-0 print:shadow-none print:p-0 print:m-0 print:w-full"
          >
            {/* PAN No Top Banner */}
            <div className="text-right text-[10px] font-bold text-slate-900 pb-1 mb-1 border-b border-[#f87171]">
              PAN No.: AKMPV0774C
            </div>

            {/* Company Header */}
            <div className="flex items-center justify-between border-b border-[#f87171] pb-2">
              {/* Left Logo */}
              <div className="w-28 shrink-0 flex items-center justify-center p-1 bg-white">
                <img 
                  src={companyProfile?.logo || UPL_LOGO_BASE64 || '/urbanpro-logo.jpeg'} 
                  alt="UrbanPro Logo" 
                  className="max-h-16 w-auto object-contain" 
                />
              </div>

              {/* Center Company Title & Info */}
              <div className="flex-1 text-center px-2">
                <div style={{ fontFamily: "Georgia, serif" }}>
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-none">
                    <span style={{ color: '#1e3a8a' }}>Urban</span><span style={{ color: '#dc2626' }}>Pro</span>
                  </h1>
                  <h2 className="text-xs sm:text-sm font-extrabold tracking-wider uppercase mt-0.5" style={{ color: '#1e3a8a' }}>
                    Packers & Logistics
                  </h2>
                </div>
                <p className="text-[10px] leading-tight text-slate-800 font-medium mt-1">
                  <strong>Address:</strong> Plot No 1491, Balintha Canal Road, Near Lenskart, Hanspal, Bhubaneswar, Odisha -752101
                </p>
                <p className="text-[10px] leading-tight text-slate-800 font-medium mt-0.5">
                  <strong>Mobile No.:</strong> 8093017400
                </p>
                <p className="text-[10px] leading-tight text-slate-800 font-medium mt-0.5">
                  <strong>Email:</strong> urbanpro403@gmail.com
                </p>
              </div>
            </div>

            {/* Title Bar */}
            <div className="bg-[#ffb3b3] border-b border-[#f87171] text-center py-1 text-xs font-black tracking-wider uppercase text-slate-900">
              Bill (Tax Invoice)
            </div>

            {/* Main Content 2-Column Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 border-b border-[#f87171] text-[11px]">
              
              {/* Left Column: Meta, Bill To, Relocate Details, Package */}
              <div className="md:col-span-7 border-r border-[#f87171] flex flex-col justify-between">
                
                {/* Meta Fields: Bill No, Dates, Shipment */}
                <div className="grid grid-cols-2 p-2 gap-x-2 gap-y-1 text-[11px]">
                  <div><span className="font-bold">Bill No.</span> {selectedRecord.billNo || '1'}</div>
                  <div><span className="font-bold">Mode Of Moving:</span> {selectedRecord.modeOfMoving || 'By Surface'}</div>
                  <div><span className="font-bold">Billing Date:</span> {selectedRecord.billDate || selectedRecord.date}</div>
                  <div><span className="font-bold">Type Of Shipment:</span> {selectedRecord.typeOfShipment || 'Personal Goods'}</div>
                  <div><span className="font-bold">Lr No.</span> {selectedRecord.lrBiltyNo || ''}</div>
                  <div><span className="font-bold">From:</span> {selectedRecord.fromCity || ''} <span className="font-bold">To:</span> {selectedRecord.toCity || ''}</div>
                  <div><span className="font-bold">Delivery Date:</span> {selectedRecord.goodsDeliveryDate || ''}</div>
                  <div><span className="font-bold">Truck No:</span> {selectedRecord.vehicleNo || ''}</div>
                </div>

                {/* Bill To Header Bar */}
                <div className="bg-[#ffb3b3] border-y border-[#f87171] text-center font-bold text-[11px] py-0.5">
                  Bill To
                </div>

                {/* Bill To Info */}
                <div className="p-2 space-y-0.5 text-[11px]">
                  <div><span className="font-bold">Name:</span> {selectedRecord.partyName}</div>
                  <div><span className="font-bold">Phone:</span> {selectedRecord.mobileNo}</div>
                  <div>
                    <span className="font-bold">GST No:</span> {selectedRecord.gstin || ''} &nbsp;&nbsp;
                    <span className="font-bold">State:</span> {selectedRecord.state || 'N/A'}
                  </div>
                  <div><span className="font-bold">Address:</span> {selectedRecord.address}</div>
                  <div>
                    <span className="font-bold">Pin/City/Country:</span> {selectedRecord.pincode || ''}/{selectedRecord.city || ''}/{selectedRecord.country || 'India'}
                  </div>
                </div>

                {/* Relocate From / Relocate To Header Bar */}
                <div className="grid grid-cols-2 bg-[#ffb3b3] border-y border-[#f87171] font-bold text-[11px] text-center">
                  <div className="border-r border-[#f87171] py-0.5">Relocate From</div>
                  <div className="py-0.5">Relocate To</div>
                </div>

                {/* Relocate From / Relocate To Info */}
                <div className="grid grid-cols-2 text-[11px]">
                  <div className="p-2 border-r border-[#f87171] space-y-0.5">
                    <div><span className="font-bold">Name:</span> {selectedRecord.consignorName || selectedRecord.partyName}</div>
                    <div><span className="font-bold">Phone:</span> {selectedRecord.consignorPhone || selectedRecord.mobileNo}</div>
                    <div><span className="font-bold">GST No:</span> {selectedRecord.consignorGstin || ''}</div>
                    <div><span className="font-bold">Address:</span> {selectedRecord.consignorAddress || selectedRecord.address}</div>
                    <div><span className="font-bold">Pin/City/Country:</span> {selectedRecord.fromPincode || ''}/{selectedRecord.fromCity || ''}/{selectedRecord.fromCountry || 'India'}</div>
                  </div>

                  <div className="p-2 space-y-0.5">
                    <div><span className="font-bold">Name:</span> {selectedRecord.consigneeName || ''}</div>
                    <div><span className="font-bold">Phone:</span> {selectedRecord.consigneePhone || ''}</div>
                    <div><span className="font-bold">GST No:</span> {selectedRecord.consigneeGstin || ''}</div>
                    <div><span className="font-bold">Address:</span> {selectedRecord.consigneeAddress || ''}</div>
                    <div><span className="font-bold">Pin/City/Country:</span> {selectedRecord.toPincode || ''}/{selectedRecord.toCity || ''}/{selectedRecord.toCountry || 'India'}</div>
                  </div>
                </div>

                {/* Package / Description */}
                <div className="grid grid-cols-2 border-t border-[#f87171] p-2 text-[11px] gap-2">
                  <div>
                    <div className="font-bold underline">Package:</div>
                    <div>{selectedRecord.packageType || 'As Per List Attached'}</div>
                  </div>
                  <div>
                    <div className="font-bold underline">Packages and Goods Description:</div>
                    <div>{selectedRecord.packageDescription || 'Old & Used Household Goods'}</div>
                  </div>
                </div>

                {/* Total Weight / Remark */}
                <div className="grid grid-cols-2 border-t border-[#f87171] p-2 text-[11px] gap-2">
                  <div>
                    <div className="font-bold underline">Total Weight:</div>
                    <div>{selectedRecord.totalWeight || 'MT'}</div>
                  </div>
                  <div>
                    <div className="font-bold underline">Remark:</div>
                    <div>{selectedRecord.remark || 'Not For Sale'}</div>
                  </div>
                </div>

                {/* Insurance charge note */}
                <div className="border-t border-[#f87171] p-2 text-[11px]">
                  <span className="font-bold">Insurance charge @3% on declaration value of goods ₹</span> {selectedRecord.insuranceCharges ? selectedRecord.insuranceCharges.toLocaleString() : ''}
                </div>

                {/* Total Amount in Words */}
                <div className="border-t border-[#f87171] p-2 text-[11px]">
                  <div className="font-bold underline">Total amount in words:</div>
                  <div className="font-bold capitalize">{selectedRecord.payableInWords || numberToWordsIndian(selectedRecord.totalAmount || calcGrandTotal(selectedRecord))}</div>
                </div>

              </div>

              {/* Right Column: Particulars & Amounts Table */}
              <div className="md:col-span-5 flex flex-col justify-between">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="border-b border-[#f87171] bg-slate-50 font-bold">
                      <th className="p-1.5 border-r border-[#f87171]">Particulars</th>
                      <th className="p-1.5 text-right w-24">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f87171]/40">
                    <tr>
                      <td className="p-1 border-r border-[#f87171]">Transportation Charges</td>
                      <td className="p-1 text-right font-mono">{selectedRecord.freightAmount ? `₹ ${selectedRecord.freightAmount.toLocaleString()}` : ''}</td>
                    </tr>
                    <tr>
                      <td className="p-1 border-r border-[#f87171]">Packing Charges</td>
                      <td className="p-1 text-right font-mono">{selectedRecord.packingCharges ? `₹ ${selectedRecord.packingCharges.toLocaleString()}` : ''}</td>
                    </tr>
                    <tr>
                      <td className="p-1 border-r border-[#f87171]">Unpacking Charges</td>
                      <td className="p-1 text-right font-mono">{selectedRecord.unpackingCharges ? `₹ ${selectedRecord.unpackingCharges.toLocaleString()}` : ''}</td>
                    </tr>
                    <tr>
                      <td className="p-1 border-r border-[#f87171]">Loading Charges</td>
                      <td className="p-1 text-right font-mono">{selectedRecord.loadingCharges ? `₹ ${selectedRecord.loadingCharges.toLocaleString()}` : ''}</td>
                    </tr>
                    <tr>
                      <td className="p-1 border-r border-[#f87171]">Unloadig Charges</td>
                      <td className="p-1 text-right font-mono">{selectedRecord.unloadingCharges ? `₹ ${selectedRecord.unloadingCharges.toLocaleString()}` : ''}</td>
                    </tr>
                    <tr>
                      <td className="p-1 border-r border-[#f87171]">Dismantling/Assembling Charges</td>
                      <td className="p-1 text-right font-mono">{selectedRecord.dismantlingCharges ? `₹ ${selectedRecord.dismantlingCharges.toLocaleString()}` : ''}</td>
                    </tr>
                    <tr>
                      <td className="p-1 border-r border-[#f87171]">Octroi/Entry Charges</td>
                      <td className="p-1 text-right font-mono">{selectedRecord.octroiCharges ? `₹ ${selectedRecord.octroiCharges.toLocaleString()}` : ''}</td>
                    </tr>
                    <tr>
                      <td className="p-1 border-r border-[#f87171]">Car Transportation Charges</td>
                      <td className="p-1 text-right font-mono">{selectedRecord.carTransportationCharges ? `₹ ${selectedRecord.carTransportationCharges.toLocaleString()}` : ''}</td>
                    </tr>
                    <tr>
                      <td className="p-1 border-r border-[#f87171]">Bike Transportation Charges</td>
                      <td className="p-1 text-right font-mono">{selectedRecord.bikeTransportationCharges ? `₹ ${selectedRecord.bikeTransportationCharges.toLocaleString()}` : ''}</td>
                    </tr>
                    <tr>
                      <td className="p-1 border-r border-[#f87171]">Statistical/Document Charges</td>
                      <td className="p-1 text-right font-mono">{selectedRecord.statCharges ? `₹ ${selectedRecord.statCharges.toLocaleString()}` : ''}</td>
                    </tr>
                    <tr>
                      <td className="p-1 border-r border-[#f87171]">Service Charge</td>
                      <td className="p-1 text-right font-mono">{selectedRecord.serviceCharge ? `₹ ${selectedRecord.serviceCharge.toLocaleString()}` : ''}</td>
                    </tr>
                    <tr className="bg-[#ffb3b3] border-y border-[#f87171] font-bold">
                      <td className="p-1 border-r border-[#f87171]">Sub Total</td>
                      <td className="p-1 text-right font-mono">₹ {calcSubTotal(selectedRecord).toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td className="p-1 border-r border-[#f87171]">Insurance Charge</td>
                      <td className="p-1 text-right font-mono">{selectedRecord.insuranceCharges ? `₹ ${selectedRecord.insuranceCharges.toLocaleString()}` : ''}</td>
                    </tr>
                    <tr>
                      <td className="p-1 border-r border-[#f87171]">CGST/SGST</td>
                      <td className="p-1 text-right font-mono">{calcGstAmt(selectedRecord) ? `₹ ${calcGstAmt(selectedRecord).toLocaleString()}` : ''}</td>
                    </tr>
                    <tr className="bg-[#ffb3b3] border-t border-[#f87171] font-bold">
                      <td className="p-1 border-r border-[#f87171]">Grand Total</td>
                      <td className="p-1 text-right font-mono font-black text-sm">₹ {(selectedRecord.totalAmount || calcGrandTotal(selectedRecord)).toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

            </div>

            {/* Bank Details & Signatures Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 border-b border-[#f87171] text-[11px]">
              {/* Col 1: Bank Details */}
              <div className="p-2 border-r border-b md:border-b-0 border-[#f87171] space-y-1">
                <div className="font-bold underline text-slate-900">Bank Details</div>
                <div><span className="font-bold">Beneficiary Name:</span> {companyProfile?.accountHolder || selectedRecord.partyName || ''}</div>
                <div><span className="font-bold">Bank Name:</span> {companyProfile?.bankName || ''}</div>
                <div><span className="font-bold">Bank A/C No.:</span> {companyProfile?.accountNo || companyProfile?.bankAccNo || ''}</div>
                <div><span className="font-bold">Bank IFSC Code:</span> {companyProfile?.ifscCode || companyProfile?.bankIfsc || ''}</div>
                <div><span className="font-bold">Other Payment Details</span></div>
              </div>

              {/* Col 2: Center Signature */}
              <div className="p-2 border-r border-b md:border-b-0 border-[#f87171] flex flex-col justify-between items-center text-center">
                <div className="font-bold text-[10px]">
                  For <span className="text-[#1e3a8a]">Urban</span><span className="text-[#dc2626]">Pro</span> <span className="text-[#1e3a8a]">Packers & Logistics</span>
                </div>
                <div className="my-2">
                  {globalSignature?.image ? (
                    <img src={globalSignature.image} alt="Signature" className="max-h-12 object-contain mx-auto" />
                  ) : (
                    <div className="font-bold text-slate-800 my-2">VIJAY</div>
                  )}
                </div>
                <div className="font-bold text-[10px] text-slate-800 border-t border-slate-300 pt-0.5 w-full">
                  Authorized Signature
                </div>
              </div>

              {/* Col 3: Receiver Terms */}
              <div className="p-2 flex items-center justify-center text-center font-bold text-[10px] text-slate-700">
                Agree with Terms & Conditions as Overleaf Signature Receiver's
              </div>
            </div>

            {/* Note Footer */}
            <div className="p-2 text-[9px] text-slate-800 leading-tight border-b border-[#f87171]">
              <strong>Note:</strong> Please keep your Cash/Jewellery and anyway in your Custody/Lock" Carring Liquor, Gas Cylinder, Acid of any type of Liquids (like Ghee Tin, Oil etc.) is totally prohibited.
            </div>

            {/* Support Bar */}
            <div className="bg-[#ffb3b3] text-center py-1 text-[11px] font-bold text-slate-900">
              24x7 Customer Care Support <span className="text-slate-900 font-black">8093017400</span>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
