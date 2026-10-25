import React, { useEffect, useState } from 'react';
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
  Loader2,
  Receipt,
  Edit
} from 'lucide-react';
import { UPL_LOGO_BASE64 } from '../assets/logoBase64';
import { PRAKASH_SIGNATURE_BASE64 } from '../assets/signatureBase64';
import { downloadPdfFromElement, openElementInPrintWindow } from '../utils/pdfExport';
import { shareDocument } from '../utils/shareUtils';
import { INDIAN_STATES, getStateCodeByName } from '../utils/indianStates';
import { calculateQuotationTotals, parseChargeDetails } from '../utils/quotationCalculations';
import { findCustomerProfileByMobile } from '../utils/customerLookup';
import { RecordLookup } from './RecordLookup';

type BillChargeKey =
  | 'freightAmount'
  | 'packingCharges'
  | 'unpackingCharges'
  | 'loadingCharges'
  | 'unloadingCharges'
  | 'dismantlingCharges'
  | 'octroiCharges'
  | 'carTransportationCharges'
  | 'bikeTransportationCharges'
  | 'statCharges';

type BillChargeStatus = 'standard' | 'included' | 'excluded';

interface BillCustomCharge {
  id: string;
  name: string;
  amount: number;
  status: BillChargeStatus;
}

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
  chargeStatuses?: Partial<Record<BillChargeKey, BillChargeStatus>>;
  customCharges?: BillCustomCharge[];

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
  initialViewMode?: 'form' | 'list';
  onSave: (data: BillData) => void;
  onDelete: (id: string) => void;
  quotations?: any[];
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
  initialViewMode = 'form',
  onSave, 
  onDelete, 
  quotations = [],
  customerProfiles = [], 
  globalSignature,
  companyProfile 
}) => {
  const [viewMode, setViewMode] = useState<'form' | 'list' | 'preview'>(initialViewMode);
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
    toFloor: '',

    packageType: 'As Per List Attached',
    packageDescription: 'Old & Used Household Goods',
    weightType: 'MT',
    totalWeight: '',
    remark: 'Not For Sale',

    freightAmount: 0,
    packingCharges: 0,
    unpackingCharges: 0,
    loadingCharges: 0,
    unloadingCharges: 0,
    dismantlingCharges: 0,
    octroiCharges: 0,
    carTransportationCharges: 0,
    bikeTransportationCharges: 0,
    statCharges: 0,
    chargeStatuses: {},
    customCharges: [],

    serviceChargePercent: 0,
    serviceCharge: 0,
    insurancePercent: 3,
    goodsValue: 0,
    insuranceCharges: 0,
    gstType: 'CGST/SGST',
    gstRate: 18,
    gstCharge: 0,

    totalAmount: 0,
    payableInWords: ''
  };

  const [form, setForm] = useState<BillData>(initialForm);

  useEffect(() => {
    setViewMode(initialViewMode);
    if (initialViewMode === 'form') {
      setForm({ ...initialForm, id: `bill-${Date.now()}`, billNo: `${bills.length + 1}` });
      setSelectedRecord(null);
    }
  }, [initialViewMode]);

  const billChargeItems: { label: string; key: BillChargeKey }[] = [
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
  ];

  // Calculations
  const calcInsuranceAmt = (f: BillData) => {
    const goodsValue = Number(f.goodsValue) || 0;
    const insurancePercent = Number(f.insurancePercent ?? 3);
    return Math.round((goodsValue * insurancePercent) / 100);
  };

  const calcSubTotal = (f: BillData) => {
    const standardTotal = billChargeItems.reduce((total, item) => {
      if (f.chargeStatuses?.[item.key] === 'excluded') return total;
      return total + (Number(f[item.key]) || 0);
    }, 0);
    const customTotal = (f.customCharges || []).reduce((total, charge) => (
      charge.status === 'excluded' ? total : total + (Number(charge.amount) || 0)
    ), 0);
    return standardTotal + customTotal;
  };

  const calcGstAmt = (f: BillData) => {
    const sub = calcSubTotal(f);
    if (f.gstType === 'Exempted' || f.gstRate === 0) return 0;
    return Math.round((sub * (Number(f.gstRate) || 0)) / 100);
  };

  const calcGrandTotal = (f: BillData) => {
    const sub = calcSubTotal(f);
    const ins = calcInsuranceAmt(f);
    const gst = calcGstAmt(f);
    return sub + ins + gst;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const calculated = calcGrandTotal(form);
    const gstCalculated = calcGstAmt(form);
    const finalRecord: BillData = {
      ...form,
      insuranceCharges: calcInsuranceAmt(form),
      gstCharge: gstCalculated,
      totalAmount: calculated,
      payableInWords: numberToWordsIndian(calculated)
    };
    onSave(finalRecord);
    setSelectedRecord(finalRecord);
    setViewMode('preview');
  };

  const handleShareBill = async (bill: BillData) => {
    const totalAmt = calcGrandTotal(bill);
    const words = bill.payableInWords || numberToWordsIndian(totalAmt);
    const shareText = `🧾 *UrbanPro Packers & Logistics*
*TAX INVOICE / GST BILL #${bill.billNo}*
----------------------------------------
👤 *Customer / Consignor:* ${bill.partyName || bill.consignorName || 'Customer'}
📞 *Mobile:* ${bill.mobileNo || bill.consignorPhone || ''}
📍 *From:* ${bill.fromCity || bill.city || 'Origin'}
🏁 *To:* ${bill.toCity || 'Destination'}
📅 *Bill Date:* ${bill.billDate || bill.date || ''}
💰 *Total Bill Amount:* ₹ ${totalAmt.toLocaleString()}
📝 *In Words:* ${words}
${companyProfile?.accountNo ? `🏛 *Bank Account:* ${companyProfile.bankName || ''} | A/C: ${companyProfile.accountNo} | IFSC: ${companyProfile.ifscCode || ''}\n` : ''}----------------------------------------
*Regd. Office:* Ward No. 3, Near Old SBI ATM, Dipka, Korba, CG – 495452
*Main Operational Office:* Plot No 1491, Balintha Canal Road, Hanspal, Bhubaneswar, Odisha – 752101
*Helpline:* 8093017400`;

    await shareDocument({
      title: `Tax Invoice #${bill.billNo} - UrbanPro`,
      text: shareText,
      phone: bill.mobileNo || bill.consignorPhone,
    });
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

  const applyQuotationAutoFill = (quot: any) => {
    const totals = calculateQuotationTotals(quot);
    setForm(prev => ({
      ...prev,
      partyName: quot.partyName || prev.partyName,
      mobileNo: quot.mobileNo || prev.mobileNo,
      consignorName: quot.partyName || prev.consignorName,
      consignorPhone: quot.mobileNo || prev.consignorPhone,
      city: quot.fromCity || prev.city,
      fromCity: quot.fromCity || prev.fromCity,
      fromState: quot.fromState || prev.fromState,
      fromArea: quot.fromArea || prev.fromArea,
      fromPincode: quot.fromPincode || prev.fromPincode,
      fromFloor: quot.fromFloor || prev.fromFloor,
      toCity: quot.toCity || prev.toCity,
      toState: quot.toState || prev.toState,
      toArea: quot.toArea || prev.toArea,
      toPincode: quot.toPincode || prev.toPincode,
      toFloor: quot.toFloor || prev.toFloor,
      goodsDeliveryDate: quot.deliveryDate || prev.goodsDeliveryDate,
      freightAmount: parseChargeDetails(quot.transportCharges).amount,
      packingCharges: parseChargeDetails(quot.packingCharges).amount,
      unpackingCharges: parseChargeDetails(quot.unpackingCharges).amount,
      loadingCharges: parseChargeDetails(quot.loadingCharges).amount,
      unloadingCharges: parseChargeDetails(quot.unloadingCharges).amount,
      dismantlingCharges: parseChargeDetails(quot.dismantlingCharges).amount,
      octroiCharges: parseChargeDetails(quot.octroiCharges).amount,
      carTransportationCharges: parseChargeDetails(quot.carCharges).amount,
      bikeTransportationCharges: parseChargeDetails(quot.bikeCharges).amount,
      statCharges: parseChargeDetails(quot.statCharges).amount,
      chargeStatuses: {
        freightAmount: parseChargeDetails(quot.transportCharges).status,
        packingCharges: parseChargeDetails(quot.packingCharges).status,
        unpackingCharges: parseChargeDetails(quot.unpackingCharges).status,
        loadingCharges: parseChargeDetails(quot.loadingCharges).status,
        unloadingCharges: parseChargeDetails(quot.unloadingCharges).status,
        dismantlingCharges: parseChargeDetails(quot.dismantlingCharges).status,
        octroiCharges: parseChargeDetails(quot.octroiCharges).status,
        carTransportationCharges: parseChargeDetails(quot.carCharges).status,
        bikeTransportationCharges: parseChargeDetails(quot.bikeCharges).status,
        statCharges: parseChargeDetails(quot.statCharges).status,
      },
      customCharges: (quot.customCharges || []).map((charge: { name: string; val: string }, index: number) => {
        const parsed = parseChargeDetails(charge.val);
        return {
          id: `quotation-charge-${index}-${Date.now()}`,
          name: charge.name,
          amount: parsed.amount,
          status: parsed.status,
        };
      }),
      serviceChargePercent: parseFloat(String(quot.serviceChargePercent || '0').replace(/[^0-9.]/g, '')) || 0,
      serviceCharge: totals.serviceChargeNum,
      goodsValue: parseFloat(String(quot.goodsValue || '0').replace(/[^0-9.]/g, '')) || 0,
      insurancePercent: parseFloat(String(quot.insurancePercent || '3').replace(/[^0-9.]/g, '')) || 0,
      insuranceCharges: totals.insuranceNum,
      gstType: quot.gstType || 'CGST/SGST',
      gstRate: parseFloat(String(quot.gstPercent || '18').replace(/[^0-9.]/g, '')) || 0,
      gstCharge: totals.gstNum,
    }));
  };

  const isEditingExistingBill = bills.some(b => b.id === form.id);

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
              viewMode === 'form' && !isEditingExistingBill
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

      {/* Editing Existing Bill Alert Banner */}
      {viewMode === 'form' && isEditingExistingBill && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shrink-0">
              <Pencil className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-amber-950 text-sm">Editing GST Tax Invoice Bill #{form.billNo}</h4>
              <p className="text-xs text-amber-800">Customer: {form.partyName || 'Customer'} • All charges and details are currently editable.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setForm({ ...initialForm, id: `bill-${Date.now()}`, billNo: `${bills.length + 1}` });
            }}
            className="bg-white border border-amber-300 hover:bg-amber-100 text-amber-900 font-bold px-4 py-1.5 rounded-xl text-xs shadow-2xs transition-colors cursor-pointer self-start sm:self-auto"
          >
            Cancel Edit / New Bill
          </button>
        </div>
      )}

      {/* Quotation Auto-fill Selector Banner */}
      {viewMode === 'form' && quotations.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-sky-50 border-2 border-sky-300 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sky-950 text-sm">Auto-Fill from Quotation Record</h4>
              <p className="text-xs text-sky-700">Import customer info, moving route, freight, packing & all charges from a saved quotation with 1 click.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <select
              onChange={(e) => {
                const target = quotations.find(q => String(q.id) === e.target.value || String(q.quotationNo) === e.target.value);
                if (target) applyQuotationAutoFill(target);
              }}
              className="bg-white border-2 border-sky-400 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer shadow-xs max-w-xs"
            >
              <option value="">-- Select Quotation to Import --</option>
              {quotations.map((q) => (
                <option key={q.id} value={q.id}>
                  Quot #{q.quotationNo} — {q.partyName} (₹{q.grandTotal})
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

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
      {viewMode === 'form' && customerProfiles.length > 0 && (
        <RecordLookup profiles={customerProfiles} onSelect={applyCustomerAutoFill} />
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
                  value={form.billDate ?? form.date}
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
                  onChange={e => {
                    const val = e.target.value;
                    setForm(prev => ({
                      ...prev,
                      partyName: val,
                      ...(prev.sameAsBillingConsignor ? { consignorName: val } : {})
                    }));
                  }}
                  className="w-full outline-none font-bold text-slate-900 text-sm"
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-3 bg-white">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Client Phone Number (Bill To Phone) *
                </label>
                <input
                  type="tel"
                  placeholder="Client Phone Number"
                  value={form.mobileNo}
                  onChange={e => {
                    const val = e.target.value;
                    const match = findCustomerProfileByMobile(customerProfiles, val);
                    if (match) applyCustomerAutoFill(match);
                    setForm(prev => ({
                      ...prev,
                      mobileNo: val,
                      ...(prev.sameAsBillingConsignor ? { consignorPhone: val } : {})
                    }));
                  }}
                  className="w-full outline-none font-medium text-slate-800 text-sm"
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-3 bg-white">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Country
                </label>
                <input
                  type="text"
                  value={form.country ?? 'India'}
                  onChange={e => setForm({ ...form, country: e.target.value })}
                  className="w-full outline-none font-medium text-slate-800 text-sm bg-transparent"
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-3 bg-white">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  State
                </label>
                <select
                  value={form.state ?? 'N/A'}
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
                  value={form.modeOfMoving ?? 'By Surface'}
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
                  value={form.typeOfShipment ?? 'Personal Goods'}
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
                    onChange={e => {
                      const consignorPhone = e.target.value;
                      const match = findCustomerProfileByMobile(customerProfiles, consignorPhone);
                      setForm(prev => ({
                        ...prev,
                        consignorPhone,
                        ...(match ? {
                          consignorName: match.partyName || prev.consignorName,
                          consignorAddress: match.fromAddress || prev.consignorAddress,
                          fromCity: match.fromCity || prev.fromCity,
                          fromState: match.fromState || prev.fromState,
                          fromArea: match.fromArea || prev.fromArea,
                          fromPincode: match.fromPinCode || match.fromPincode || prev.fromPincode,
                        } : {}),
                      }));
                    }}
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
                    value={form.fromCountry ?? 'India'}
                    onChange={e => setForm({ ...form, fromCountry: e.target.value })}
                    className="w-full outline-none font-medium text-slate-800 text-sm bg-transparent"
                  />
                </div>

                <div className="border border-slate-300 rounded-xl p-3 bg-white">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">State</label>
                  <select
                    value={form.fromState ?? 'N/A'}
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
                    value={form.fromFloor ?? 'N/A'}
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
                  value={form.toCountry ?? 'India'}
                  onChange={e => setForm({ ...form, toCountry: e.target.value })}
                  className="w-full outline-none font-medium text-slate-800 text-sm bg-transparent"
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-3 bg-white">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  State
                </label>
                <select
                  value={form.toState ?? 'N/A'}
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
                  value={form.toFloor ?? 'N/A'}
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
                  value={form.packageType ?? 'As Per List Attached'}
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
                  value={form.packageDescription ?? 'Old & Used Household Goods'}
                  onChange={e => setForm({ ...form, packageDescription: e.target.value })}
                  className="w-full outline-none font-medium text-slate-800 text-sm"
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-3 bg-white">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Weight Type
                </label>
                <select
                  value={form.weightType ?? 'MT'}
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
                  value={form.remark ?? 'Not For Sale'}
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
              {billChargeItems.map(item => {
                const status = form.chargeStatuses?.[item.key] || 'standard';
                const setChargeStatus = (nextStatus: 'included' | 'excluded') => {
                  setForm({
                    ...form,
                    chargeStatuses: {
                      ...form.chargeStatuses,
                      [item.key]: status === nextStatus ? 'standard' : nextStatus,
                    },
                  });
                };

                return (
                  <div key={item.key} className="border border-slate-300 rounded-xl p-3 bg-white">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <label className="text-xs font-semibold text-slate-600">{item.label}</label>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setChargeStatus('included')}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                            status === 'included'
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'bg-white text-emerald-700 border-emerald-300 hover:bg-emerald-50'
                          }`}
                        >
                          Included
                        </button>
                        <button
                          type="button"
                          onClick={() => setChargeStatus('excluded')}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                            status === 'excluded'
                              ? 'bg-rose-600 text-white border-rose-600'
                              : 'bg-white text-rose-700 border-rose-300 hover:bg-rose-50'
                          }`}
                        >
                          Excluded
                        </button>
                      </div>
                    </div>
                    <input
                      type="number"
                      min="0"
                      value={form[item.key] || ''}
                      onChange={e => setForm({ ...form, [item.key]: parseFloat(e.target.value) || 0 })}
                      placeholder="₹ Enter amount"
                      className="w-full outline-none font-bold text-slate-900 text-sm"
                    />
                  </div>
                );
              })}
            </div>

            <div className="mt-5 pt-4 border-t border-sky-100">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wide text-slate-800">Custom / Additional Charges</h4>
                  <p className="text-[11px] text-slate-500">Add extra charges to the bill; excluded items will not be added to the subtotal.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setForm({
                    ...form,
                    customCharges: [
                      ...(form.customCharges || []),
                      { id: `bill-charge-${Date.now()}`, name: '', amount: 0, status: 'standard' },
                    ],
                  })}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-3 py-2 text-xs font-bold text-white hover:bg-sky-700"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add New Charge
                </button>
              </div>
              {(form.customCharges || []).length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(form.customCharges || []).map(charge => (
                    <div key={charge.id} className="rounded-xl border border-slate-300 bg-white p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <input
                          type="text"
                          value={charge.name}
                          onChange={e => setForm({
                            ...form,
                            customCharges: (form.customCharges || []).map(item => (
                              item.id === charge.id ? { ...item, name: e.target.value } : item
                            )),
                          })}
                          placeholder="Charge name"
                          className="min-w-0 flex-1 rounded border border-slate-200 px-2 py-1 text-xs font-semibold outline-none focus:border-sky-500"
                        />
                        <button
                          type="button"
                          onClick={() => setForm({
                            ...form,
                            customCharges: (form.customCharges || []).filter(item => item.id !== charge.id),
                          })}
                          aria-label={`Remove ${charge.name || 'custom charge'}`}
                          className="rounded p-1 text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <input
                          type="number"
                          min="0"
                          value={charge.amount || ''}
                          onChange={e => setForm({
                            ...form,
                            customCharges: (form.customCharges || []).map(item => (
                              item.id === charge.id ? { ...item, amount: parseFloat(e.target.value) || 0 } : item
                            )),
                          })}
                          placeholder="₹ Enter amount"
                          className="min-w-[120px] flex-1 rounded border border-slate-200 px-2 py-1 text-sm font-bold outline-none focus:border-sky-500"
                        />
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setForm({
                              ...form,
                              customCharges: (form.customCharges || []).map(item => (
                                item.id === charge.id
                                  ? { ...item, status: item.status === 'included' ? 'standard' : 'included' }
                                  : item
                              )),
                            })}
                            className={`rounded border px-2 py-1 text-[10px] font-bold ${
                              charge.status === 'included'
                                ? 'border-emerald-600 bg-emerald-600 text-white'
                                : 'border-emerald-300 text-emerald-700 hover:bg-emerald-50'
                            }`}
                          >
                            Included
                          </button>
                          <button
                            type="button"
                            onClick={() => setForm({
                              ...form,
                              customCharges: (form.customCharges || []).map(item => (
                                item.id === charge.id
                                  ? { ...item, status: item.status === 'excluded' ? 'standard' : 'excluded' }
                                  : item
                              )),
                            })}
                            className={`rounded border px-2 py-1 text-[10px] font-bold ${
                              charge.status === 'excluded'
                                ? 'border-rose-600 bg-rose-600 text-white'
                                : 'border-rose-300 text-rose-700 hover:bg-rose-50'
                            }`}
                          >
                            Excluded
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Section 9: Insurance and GST */}
          <div className="border-2 border-slate-400 rounded-2xl p-6 pt-8 relative bg-white shadow-xs">
            <span className="absolute -top-3.5 left-4 bg-slate-600 text-white px-4 py-1 rounded-md text-xs font-bold shadow-xs">
              Insurance & GST
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-slate-300 rounded-xl p-3 bg-white">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Insurance %
                </label>
                <select
                  value={form.insurancePercent ?? 3}
                  onChange={e => {
                    const pct = parseFloat(e.target.value) || 0;
                    const ins = Math.round(((form.goodsValue || 0) * pct) / 100);
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
                    const ins = Math.round((val * (form.insurancePercent ?? 3)) / 100);
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
                    readOnly
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
                  value={form.gstType ?? 'CGST/SGST'}
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
                  value={form.gstRate ?? 18}
                  onChange={e => setForm({ ...form, gstRate: parseFloat(e.target.value) || 0 })}
                  className="w-full outline-none font-medium text-slate-800 text-sm bg-transparent"
                >
                  <option value={18}>18%</option>
                  <option value={12}>12%</option>
                  <option value={5}>5%</option>
                  <option value={3}>3%</option>
                  <option value={0}>0%</option>
                </select>
              </div>

              <div className="border border-slate-300 rounded-xl p-3 bg-white md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  GST Charge (₹)
                </label>
                <input
                  type="number"
                  value={calcGstAmt(form)}
                  readOnly
                  className="w-full outline-none font-bold text-slate-900 text-sm"
                />
              </div>

              <div className="border-2 border-emerald-400 bg-emerald-50 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 md:col-span-2 shadow-2xs">
                <div className="flex-1">
                  <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs font-semibold text-slate-700 mb-2">
                    <span>Charge Subtotal: ₹{calcSubTotal(form).toLocaleString()}</span>
                    <span>Insurance ({form.insurancePercent || 0}%): ₹{calcInsuranceAmt(form).toLocaleString()}</span>
                    <span>GST ({form.gstRate || 0}% on subtotal): ₹{calcGstAmt(form).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-emerald-950 uppercase tracking-wide">
                      Total Payable Bill Amount (Grand Total ₹) *
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black text-emerald-800">₹</span>
                    <input
                      type="number"
                      value={calcGrandTotal(form)}
                      readOnly
                      className="w-full outline-none font-black text-emerald-950 text-xl bg-white px-3 py-1.5 rounded-lg border border-emerald-300 shadow-2xs"
                      placeholder={String(calcGrandTotal(form))}
                    />
                  </div>
                </div>
                <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Pencil className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Save Button (Sky Blue `#0284c7`) matching screenshot */}
          <div className="flex justify-center items-center gap-3 pt-4">
            <button
              type="submit"
              className="bg-[#0284c7] hover:bg-sky-700 text-white font-bold px-10 py-3 rounded-xl text-sm shadow-md transition-all cursor-pointer flex items-center gap-2 active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>{isEditingExistingBill ? `Update GST Bill #${form.billNo}` : 'Save GST Bill'}</span>
            </button>
            {isEditingExistingBill && (
              <button
                type="button"
                onClick={() => {
                  setForm({ ...initialForm, id: `bill-${Date.now()}`, billNo: `${bills.length + 1}` });
                  setViewMode('list');
                }}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold px-6 py-3 rounded-xl text-sm transition-colors cursor-pointer"
              >
                Cancel
              </button>
            )}
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
                              ₹{calcGrandTotal(rec).toLocaleString()}
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
                        onClick={() => handleShareBill(rec)}
                        className="flex flex-col items-center gap-1 text-emerald-600 hover:text-emerald-700 cursor-pointer"
                        title="Share via WhatsApp / Mobile"
                      >
                        <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                          <Share2 className="w-4 h-4" />
                        </div>
                        <span>Share</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDownloadBillPdf(rec)}
                        disabled={isDownloading}
                        className="flex flex-col items-center gap-1 text-blue-600 hover:text-blue-700 cursor-pointer disabled:opacity-50"
                        title="Download PDF"
                      >
                        <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-xs">
                          <Download className="w-4 h-4" />
                        </div>
                        <span>Download</span>
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
                onClick={() => {
                  setForm(selectedRecord);
                  setViewMode('form');
                }}
                className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5 transition-colors shadow-xs"
                title="Edit this Bill"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Edit Bill</span>
              </button>

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
                onClick={() => handleShareBill(selectedRecord)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                title="Share via WhatsApp / Native Share"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
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

          {/* Quick Notice Banner to Edit Bill */}
          <div className="bg-amber-50 border border-amber-300 text-amber-900 rounded-xl p-3 text-xs flex flex-wrap items-center justify-between gap-2 shadow-xs print:hidden">
            <div className="flex items-center gap-2">
              <Pencil className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                <strong>Need to modify this Bill?</strong> Click <strong>"Edit Bill"</strong> in the top toolbar to change customer details, route, charges, or grand total.
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setForm(selectedRecord);
                setViewMode('form');
              }}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs cursor-pointer shadow-2xs flex items-center gap-1.5"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>Edit Bill</span>
            </button>
          </div>

          {/* Clean Printable A4 Document Sheet */}
          <div 
            id="printable-bill-invoice-pdf"
            className="bg-white border-2 border-[#1e3a8a] shadow-xl p-4 sm:p-6 text-slate-900 font-sans print:border-0 print:shadow-none print:p-0 print:m-0 print:w-full"
          >
            {/* Company Header */}
            <div className="flex border-b border-[#1e3a8a] min-h-[96px]">
              {/* Left Logo Container (28%) */}
              <div className="w-[28%] border-r border-[#1e3a8a] flex items-center justify-center p-2 bg-white">
                <img 
                  src={companyProfile?.logo || UPL_LOGO_BASE64 || '/urbanpro-logo.jpeg'} 
                  alt="UrbanPro Logo" 
                  className="max-h-20 w-auto object-contain" 
                />
              </div>

              {/* Center Company Title & Info (72%) */}
              <div className="w-[72%] p-2 text-center flex flex-col justify-center items-center bg-white">
                <div style={{ fontFamily: "'Times New Roman', Times, serif" }}>
                  <h1 className="text-[24px] sm:text-[28px] font-black tracking-tight leading-none">
                    <span style={{ color: '#1e3a8a' }}>Urban</span><span style={{ color: '#dc2626' }}>Pro</span>
                  </h1>
                  <h2 className="text-[13px] sm:text-[15px] font-extrabold tracking-wider uppercase mt-0.5" style={{ color: '#1e3a8a' }}>
                    Packers & Logistics
                  </h2>
                </div>
                <p className="text-[9.5px] sm:text-[10px] leading-tight text-slate-900 font-semibold mt-0.5">
                  <strong>Regd. Office:</strong> Ward No. 3, Near Old SBI ATM, Dipka, Korba, CG – 495452 | Tel: 8093017400
                </p>
                <p className="text-[9.5px] sm:text-[10px] leading-tight text-slate-900 font-semibold mt-0.5">
                  <strong>Main Operational Office:</strong> Plot No 1491, Balintha Canal Road, Near Lenskart, Hanspal, Bhubaneswar, Odisha – 752101 | Mobile: 8093017400
                </p>
                <p className="text-[9.5px] sm:text-[10px] leading-tight text-slate-800 font-medium mt-0.5">
                  <strong>Email:</strong> {companyProfile?.email || 'urbanpro403@gmail.com'}
                </p>
              </div>
            </div>

            {/* Title Bar */}
            <div className="bg-[#1e3a8a] border-b border-[#1e3a8a] text-center py-1 text-xs font-black tracking-wider uppercase text-white">
              Bill
            </div>

            {/* Main Content 2-Column Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 border-b border-[#1e3a8a] text-[11px]">
              
              {/* Left Column: Meta, Bill To, Relocate Details, Package */}
              <div className="md:col-span-6 border-r border-[#1e3a8a] flex flex-col justify-between">
                
                {/* Meta Fields: Bill No, Dates, Shipment */}
                <div className="grid grid-cols-2 p-2 gap-x-2 gap-y-1 text-[11px]">
                  <div><span className="font-bold">Bill No.</span> {selectedRecord.billNo || '1'}</div>
                  <div><span className="font-bold">Mode Of Moving:</span> {selectedRecord.modeOfMoving ?? 'By Surface'}</div>
                  <div><span className="font-bold">Billing Date:</span> {selectedRecord.billDate || selectedRecord.date}</div>
                  <div><span className="font-bold">Type Of Shipment:</span> {selectedRecord.typeOfShipment ?? 'Personal Goods'}</div>
                  <div><span className="font-bold">Lr No.</span> {selectedRecord.lrBiltyNo || ''}</div>
                  <div><span className="font-bold">From:</span> {selectedRecord.fromCity || ''} <span className="font-bold">To:</span> {selectedRecord.toCity || ''}</div>
                  <div><span className="font-bold">Delivery Date:</span> {selectedRecord.goodsDeliveryDate || ''}</div>
                  <div><span className="font-bold">Truck No:</span> {selectedRecord.vehicleNo || ''}</div>
                </div>

                {/* Bill To Header Bar */}
                <div className="bg-[#1e3a8a] border-y border-[#1e3a8a] text-center font-bold text-[11px] py-0.5 text-white">
                  Bill To
                </div>

                {/* Bill To Info */}
                <div className="p-2 space-y-0.5 text-[11px]">
                  <div><span className="font-bold">Name:</span> {selectedRecord.partyName}</div>
                  <div><span className="font-bold">Phone:</span> {selectedRecord.mobileNo}</div>
                  <div><span className="font-bold">State:</span> {selectedRecord.state ?? 'N/A'}</div>
                  <div><span className="font-bold">Address:</span> {selectedRecord.address}</div>
                  <div>
                    <span className="font-bold">Pin/City/Country:</span> {selectedRecord.pincode || ''}/{selectedRecord.city || ''}/{selectedRecord.country ?? 'India'}
                  </div>
                </div>

                {/* Relocate From / Relocate To Header Bar */}
                <div className="grid grid-cols-2 bg-[#1e3a8a] border-y border-[#1e3a8a] font-bold text-[11px] text-center text-white">
                  <div className="border-r border-[#1e3a8a] py-0.5">Relocate From</div>
                  <div className="py-0.5">Relocate To</div>
                </div>

                {/* Relocate From / Relocate To Info */}
                <div className="grid grid-cols-2 text-[11px]">
                  <div className="p-2 border-r border-[#1e3a8a] space-y-0.5">
                    <div><span className="font-bold">Name:</span> {selectedRecord.consignorName || selectedRecord.partyName}</div>
                    <div><span className="font-bold">Phone:</span> {selectedRecord.consignorPhone || selectedRecord.mobileNo}</div>
                    <div><span className="font-bold">Address:</span> {selectedRecord.consignorAddress || selectedRecord.address}</div>
                    <div><span className="font-bold">Pin/City/Country:</span> {selectedRecord.fromPincode || ''}/{selectedRecord.fromCity || ''}/{selectedRecord.fromCountry ?? 'India'}</div>
                  </div>

                  <div className="p-2 space-y-0.5">
                    <div><span className="font-bold">Name:</span> {selectedRecord.consigneeName || ''}</div>
                    <div><span className="font-bold">Phone:</span> {selectedRecord.consigneePhone || ''}</div>
                    <div><span className="font-bold">Address:</span> {selectedRecord.consigneeAddress || ''}</div>
                    <div><span className="font-bold">Pin/City/Country:</span> {selectedRecord.toPincode || ''}/{selectedRecord.toCity || ''}/{selectedRecord.toCountry ?? 'India'}</div>
                  </div>
                </div>

                {/* Package / Description */}
                <div className="grid grid-cols-2 border-t border-[#1e3a8a] p-2 text-[11px] gap-2">
                  <div>
                    <div className="font-bold underline">Package:</div>
                    <div>{selectedRecord.packageType ?? 'As Per List Attached'}</div>
                  </div>
                  <div>
                    <div className="font-bold underline">Packages and Goods Description:</div>
                    <div>{selectedRecord.packageDescription ?? 'Old & Used Household Goods'}</div>
                  </div>
                </div>

                {/* Total Weight / Remark */}
                <div className="grid grid-cols-2 border-t border-[#1e3a8a] p-2 text-[11px] gap-2">
                  <div>
                    <div className="font-bold underline">Total Weight:</div>
                    <div>{selectedRecord.totalWeight ?? 'MT'}</div>
                  </div>
                  <div>
                    <div className="font-bold underline">Remark:</div>
                    <div>{selectedRecord.remark ?? 'Not For Sale'}</div>
                  </div>
                </div>

                {/* Insurance charge note */}
                <div className="border-t border-[#1e3a8a] p-2 text-[11px]">
                  <span className="font-bold">
                    Insurance: {selectedRecord.insurancePercent || 0}% of declared goods value ₹{Number(selectedRecord.goodsValue || 0).toLocaleString()}
                    {' = '}₹{calcInsuranceAmt(selectedRecord).toLocaleString()}
                  </span>
                </div>

                {/* Total Amount in Words */}
                <div className="border-t border-[#1e3a8a] p-2 text-[11px]">
                  <div className="font-bold underline">Total amount in words:</div>
                  <div className="font-bold capitalize">{numberToWordsIndian(calcGrandTotal(selectedRecord))}</div>
                </div>

              </div>

              {/* Right Column: Particulars & Amounts Table */}
              <div className="md:col-span-6 flex flex-col justify-between">
                <table className="w-full text-left border-collapse text-[10px]">
                  <thead>
                    <tr className="border-b border-[#1e3a8a] bg-slate-50 font-bold">
                      <th className="p-1 border-r border-[#1e3a8a] w-[56%]">Charge Details</th>
                      <th className="p-1 border-r border-[#1e3a8a] text-center w-[22%]">Status</th>
                      <th className="p-1 text-right w-[22%]">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e3a8a]/40">
                    {billChargeItems.map(item => {
                      const status = selectedRecord.chargeStatuses?.[item.key] || 'standard';
                      const amount = Number(selectedRecord[item.key]) || 0;
                      return (
                        <tr key={item.key}>
                          <td className="p-1 border-r border-[#1e3a8a]">{item.label}</td>
                          <td className={`p-1 border-r border-[#1e3a8a] text-center font-semibold ${
                            status === 'included' ? 'text-emerald-700' : status === 'excluded' ? 'text-rose-700' : 'text-slate-500'
                          }`}>
                            {status === 'standard' ? '—' : status === 'included' ? 'Included' : 'Excluded'}
                          </td>
                          <td className="p-1 text-right font-mono">
                            {amount > 0 ? `₹ ${amount.toLocaleString()}` : '—'}
                          </td>
                        </tr>
                      );
                    })}
                    {(selectedRecord.customCharges || []).filter(charge => charge.name.trim()).map(charge => (
                      <tr key={charge.id}>
                        <td className="p-1 border-r border-[#1e3a8a]">{charge.name}</td>
                        <td className={`p-1 border-r border-[#1e3a8a] text-center font-semibold ${
                          charge.status === 'included' ? 'text-emerald-700' : charge.status === 'excluded' ? 'text-rose-700' : 'text-slate-500'
                        }`}>
                          {charge.status === 'standard' ? '—' : charge.status === 'included' ? 'Included' : 'Excluded'}
                        </td>
                        <td className="p-1 text-right font-mono">
                          {charge.amount > 0 ? `₹ ${charge.amount.toLocaleString()}` : '—'}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-[#1e3a8a] border-y border-[#1e3a8a] font-bold text-white">
                      <td colSpan={2} className="p-1 border-r border-[#1e3a8a]">Charge Sub Total</td>
                      <td className="p-1 text-right font-mono">₹ {calcSubTotal(selectedRecord).toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td colSpan={2} className="p-1 border-r border-[#1e3a8a]">
                        Declared Goods Value (Insurance Basis Only)
                      </td>
                      <td className="p-1 text-right font-mono">
                        ₹ {Number(selectedRecord.goodsValue || 0).toLocaleString()}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={2} className="p-1 border-r border-[#1e3a8a]">
                        Insurance ({selectedRecord.insurancePercent || 0}% of goods value)
                      </td>
                      <td className="p-1 text-right font-mono">
                        ₹ {calcInsuranceAmt(selectedRecord).toLocaleString()}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={2} className="p-1 border-r border-[#1e3a8a]">
                        GST on Charge Sub Total ({selectedRecord.gstType === 'Exempted' ? 'Exempted' : `${selectedRecord.gstRate || 0}% ${selectedRecord.gstType || ''}`})
                      </td>
                      <td className="p-1 text-right font-mono">
                        ₹ {calcGstAmt(selectedRecord).toLocaleString()}
                      </td>
                    </tr>
                    <tr className="bg-[#1e3a8a] border-t border-[#1e3a8a] font-bold text-white">
                      <td colSpan={2} className="p-1 border-r border-[#1e3a8a]">Grand Total</td>
                      <td className="p-1 text-right font-mono font-black text-sm">
                        ₹ {calcGrandTotal(selectedRecord).toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

            </div>

            {/* Bank Details & Signatures Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 border-b border-[#1e3a8a] text-[10.5px]">
              {/* Col 1: Bank Details */}
              <div className="p-2 border-r border-b md:border-b-0 border-[#1e3a8a] space-y-0.5">
                <div className="font-bold underline text-slate-900 tracking-wide text-[11px] pb-0.5">Bank Details</div>
                <div><span className="font-bold">Beneficiary:</span> {companyProfile?.accountHolder || ''}</div>
                <div><span className="font-bold">Bank Name:</span> {companyProfile?.bankName || ''}</div>
                <div><span className="font-bold">Bank A/C No.:</span> <span className="font-mono font-bold">{companyProfile?.accountNo || companyProfile?.bankAccNo || ''}</span></div>
                <div><span className="font-bold">Bank IFSC Code:</span> <span className="font-mono font-bold">{companyProfile?.ifscCode || companyProfile?.bankIfsc || ''}</span></div>
                <div><span className="font-bold">Branch:</span> {companyProfile?.bankBranch || ''}</div>
                <div className="text-[9.5px] text-slate-600 underline pt-0.5 font-medium">Other Payment Details</div>
              </div>

              {/* Col 2: Center Signature */}
              <div className="p-2 border-r border-b md:border-b-0 border-[#1e3a8a] flex flex-col justify-between items-center text-center">
                <div className="font-bold text-[10px] leading-tight">
                  For <span className="text-[#1e3a8a]">Urban</span><span className="text-[#dc2626]">Pro</span> <span className="text-[#1e3a8a]">Packers & Logistics</span><br />
                </div>
                <div className="my-1 flex items-center justify-center min-h-[46px]">
                  <img 
                    src={globalSignature?.image || PRAKASH_SIGNATURE_BASE64} 
                    alt="Authorized Signature & Stamp" 
                    className="max-h-12 max-w-[145px] object-contain mx-auto" 
                  />
                </div>
                <div className="font-bold text-[9.5px] text-blue-900 border-t border-slate-300 pt-0.5 w-full uppercase">
                  Authorized Signatory & Stamp
                </div>
              </div>

              {/* Col 3: Receiver Terms */}
              <div className="p-2 flex items-center justify-center text-center font-bold text-[10px] text-slate-700">
                Agree with Terms & Conditions as Overleaf Signature Receiver's
              </div>
            </div>

            {/* Note Footer */}
            <div className="p-2 text-[9px] text-slate-800 leading-tight border-b border-[#1e3a8a]">
              <strong>Note:</strong> Please keep your Cash/Jewellery and anyway in your Custody/Lock" Carring Liquor, Gas Cylinder, Acid of any type of Liquids (like Ghee Tin, Oil etc.) is totally prohibited.
            </div>

            {/* Support Bar */}
            <div className="bg-[#1e3a8a] text-center py-1.5 text-[11px] font-bold text-white">
              24x7 Customer Care Support <span className="text-amber-300 font-extrabold ml-1">8093017400</span>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
