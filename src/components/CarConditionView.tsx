import React, { useState } from 'react';
import { Car, CheckCircle2, FileText, Printer, Save, Plus, Trash2, ArrowLeft, Sparkles, User, ShieldCheck, Search, Share2, Phone, Clock, MapPin, IndianRupee, Download, Check, ExternalLink, Loader2 } from 'lucide-react';
import { UPL_LOGO_BASE64 } from '../assets/logoBase64';
import { PRAKASH_SIGNATURE_BASE64 } from '../assets/signatureBase64';
import { downloadPdfFromElement, openElementInPrintWindow } from '../utils/pdfExport';
import { shareDocument } from '../utils/shareUtils';
import { INDIAN_STATES } from '../utils/indianStates';

export interface CarConditionData {
  id: string;
  conditionNo: string;
  conditionDate: string;
  biltyNo: string;
  partyName: string;
  mobileNo: string;
  email: string;

  fromCountry: string;
  fromState: string;
  fromCity: string;
  fromArea: string;
  fromPincode: string;

  toCountry: string;
  toState: string;
  toCity: string;
  toArea: string;
  toPincode: string;

  brandName: string;
  modelName: string;
  modelYear: string;
  fuelType: string;
  carRegNo: string;
  carColour: string;
  kmReading: string;
  chassisNo: string;
  engineNo: string;
  vehicleValue: string;
  insuranceCompany: string;
  insurancePolicyNo: string;
  batteryNo: string;
  tyreNo: string;

  dents: string;
  scratches: string;

  accessories: Record<string, boolean>;
  otherAccessories: string;
  anyRemark: string;

  beneficiaryName: string;
  bankName: string;
  bankAcNo: string;
  bankIfsc: string;
  upiId: string;
}

export const CAR_ACCESSORIES_LIST = [
  "Stepney",
  "Wheel Caps",
  "Side Rear View Mirror",
  "Car Radio/Player",
  "Air Condition",
  "Lighter",
  "Digital Watch",
  "Speakers",
  "Tool Kit",
  "Jack",
  "Wiper Arms & Blades",
  "Mud Flap",
  "Floor Rubber Carpet",
  "Fuel (Petrol/Ltr)",
  "Car Cover"
];

export const VEHICLE_POPULAR_COLORS = [
  { label: "Narangi (Orange)", value: "Narangi / Orange", bg: "bg-orange-500", text: "text-white" },
  { label: "Bringle (Purple)", value: "Bringle / Brinjal Purple", bg: "bg-purple-700", text: "text-white" },
  { label: "White", value: "White", bg: "bg-slate-100 border border-slate-300", text: "text-slate-800" },
  { label: "Black", value: "Black", bg: "bg-slate-900", text: "text-white" },
  { label: "Silver", value: "Silver", bg: "bg-slate-300", text: "text-slate-800" },
  { label: "Grey", value: "Grey", bg: "bg-slate-500", text: "text-white" },
  { label: "Red", value: "Red", bg: "bg-red-600", text: "text-white" },
  { label: "Blue", value: "Blue", bg: "bg-blue-600", text: "text-white" },
  { label: "Golden / Beige", value: "Golden / Beige", bg: "bg-amber-400", text: "text-slate-900" },
  { label: "Brown", value: "Brown", bg: "bg-amber-900", text: "text-white" }
];

interface Props {
  carConditions: CarConditionData[];
  onSave: (data: CarConditionData) => void;
  onDelete: (id: string) => void;
  customerProfiles?: any[];
  globalSignature?: { text: string; image?: string };
  initialViewMode?: 'form' | 'list' | 'preview';
  companyProfile?: any;
}

export const CarConditionView: React.FC<Props> = ({ carConditions, onSave, onDelete, customerProfiles = [], globalSignature, initialViewMode = 'form', companyProfile }) => {
  const [viewMode, setViewMode] = useState<'form' | 'list' | 'preview'>(initialViewMode);
  const [selectedRecord, setSelectedRecord] = useState<CarConditionData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  React.useEffect(() => {
    if (initialViewMode) {
      setViewMode(initialViewMode);
    }
  }, [initialViewMode]);

  const handleDownloadCarPdf = async (carRecord?: CarConditionData) => {
    const rec = carRecord || selectedRecord;
    if (!rec) return;

    try {
      setIsDownloading(true);
      setDownloadSuccess(false);

      const printableElement = document.getElementById('printable-car-condition-pdf');
      if (!printableElement) {
        window.print();
        return;
      }

      const filename = `UrbanPro_CarCondition_${rec.conditionNo || '1'}_${(rec.partyName || 'Customer').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      const result = await downloadPdfFromElement(printableElement, filename);

      if (result.success) {
        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 5000);
      }
    } catch (err) {
      console.error('Error downloading Car Condition PDF:', err);
      window.print();
    } finally {
      setIsDownloading(false);
    }
  };

  const handleOpenInNewTab = (rec?: CarConditionData) => {
    const printableElement = document.getElementById('printable-car-condition-pdf');
    if (printableElement) {
      const cNo = (rec || selectedRecord)?.conditionNo || '1';
      openElementInPrintWindow(printableElement, `UrbanPro Car Condition Report #${cNo}`);
    } else {
      window.print();
    }
  };

  const initialForm: CarConditionData = {
    id: `cc-${Date.now()}`,
    conditionNo: `${carConditions.length + 1}`,
    conditionDate: new Date().toISOString().split('T')[0],
    biltyNo: '',
    partyName: '',
    mobileNo: '',
    email: '',

    fromCountry: 'India',
    fromState: 'N/A',
    fromCity: '',
    fromArea: '',
    fromPincode: '',

    toCountry: 'India',
    toState: 'N/A',
    toCity: '',
    toArea: '',
    toPincode: '',

    brandName: 'N/A',
    modelName: '',
    modelYear: '',
    fuelType: 'Petrol',
    carRegNo: '',
    carColour: '',
    kmReading: '',
    chassisNo: '',
    engineNo: '',
    vehicleValue: '',
    insuranceCompany: '',
    insurancePolicyNo: '',
    batteryNo: '',
    tyreNo: '',

    dents: '',
    scratches: '',

    accessories: CAR_ACCESSORIES_LIST.reduce((acc, curr) => ({ ...acc, [curr]: true }), {}),
    otherAccessories: '',
    anyRemark: '',

    beneficiaryName: '',
    bankName: '',
    bankAcNo: '',
    bankIfsc: '',
    upiId: ''
  };

  const [form, setForm] = useState<CarConditionData>(initialForm);

  const handleToggleAccessory = (acc: string) => {
    setForm(prev => ({
      ...prev,
      accessories: {
        ...prev.accessories,
        [acc]: !prev.accessories[acc]
      }
    }));
  };

  const handleAutoFillCustomer = (cp: any) => {
    setForm(prev => ({
      ...prev,
      partyName: cp.partyName || prev.partyName,
      mobileNo: cp.mobileNo || prev.mobileNo,
      email: cp.email || prev.email,
      fromCity: cp.fromCity || prev.fromCity,
      fromState: cp.fromState || prev.fromState,
      toCity: cp.toCity || prev.toCity,
      toState: cp.toState || prev.toState,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
    setSelectedRecord(form);
    setViewMode('list');
  };

  const filteredReports = carConditions.filter(r => 
    (r.partyName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.conditionNo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.carRegNo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.mobileNo || '').includes(searchTerm)
  );

  const handleShareCarCondition = async (report: CarConditionData) => {
    const shareText = `🚗 *UrbanPro Packers & Logistics*
*CAR CONDITION REPORT #${report.conditionNo}*
----------------------------------------
👤 *Customer:* ${report.partyName}
📞 *Mobile:* ${report.mobileNo}
📅 *Date:* ${report.conditionDate}
📍 *From:* ${report.fromCity || ''} ➔ *To:* ${report.toCity || ''}
🚘 *Vehicle:* ${report.brandName || ''} ${report.modelName || ''}
🔢 *Reg No:* ${report.carRegNo || ''}
🎨 *Color:* ${report.carColour || ''} | ⏱ *KM:* ${report.kmReading || '0'}
💵 *Declared Value:* ₹ ${report.vehicleValue || 'N/A'}
----------------------------------------
*Regd. Office:* Ward No. 3, Near Old SBI ATM, Dipka, Korba, CG – 495452
*Main Operational Office:* Plot No 1491, Balintha Canal Road, Hanspal, Bhubaneswar, Odisha – 752101
*Helpline:* 8093017400 / 8093017402`;

    await shareDocument({
      title: `Car Condition Report #${report.conditionNo} - UrbanPro`,
      text: shareText,
      phone: report.mobileNo,
    });
  };

  return (
    <div className="space-y-6 pb-16 text-slate-800">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
            <Car className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Add Car Condition</h1>
            <p className="text-xs text-slate-500">Vehicle loading condition report & accessories inspection checklist</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setForm({
                ...initialForm,
                id: `cc-${Date.now()}`,
                conditionNo: `${carConditions.length + 1}`
              });
              setViewMode('form');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${viewMode === 'form' ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
          >
            + Add Car Condition
          </button>

          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${viewMode === 'list' ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
          >
            All Car Conditions ({carConditions.length})
          </button>
        </div>
      </div>

      {viewMode === 'form' && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Details from Quotation Banner */}
          <div className="bg-sky-100/70 border border-sky-200 rounded-2xl p-3.5 text-xs text-sky-900 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-medium">
              <Sparkles className="w-4 h-4 text-sky-600" />
              <span><strong>Details from Quotation:</strong> Auto-fill client and vehicle details from saved customer profiles</span>
            </div>
            {customerProfiles.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {customerProfiles.slice(0, 5).map((cp, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAutoFillCustomer(cp)}
                    className="px-2.5 py-1 bg-white hover:bg-sky-600 hover:text-white border border-sky-300 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
                  >
                    {cp.partyName}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Section 1: Client Details */}
          <div className="border border-emerald-300 rounded-2xl p-5 pt-7 relative bg-white shadow-2xs">
            <span className="absolute -top-3 left-4 bg-emerald-500 text-white px-3 py-0.5 rounded-md text-xs font-bold shadow-2xs">
              Client Details
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="border border-slate-300 rounded-xl p-2.5 bg-white">
                <label className="block text-slate-500 font-medium text-[11px] mb-1">Car Condition No. *</label>
                <input
                  type="text"
                  required
                  value={form.conditionNo}
                  onChange={e => setForm({ ...form, conditionNo: e.target.value })}
                  className="w-full outline-none font-bold text-slate-900"
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-2.5 bg-white">
                <label className="block text-slate-500 font-medium text-[11px] mb-1">Bilty/LR. Number</label>
                <input
                  type="text"
                  placeholder="Bilty/LR. Number"
                  value={form.biltyNo}
                  onChange={e => setForm({ ...form, biltyNo: e.target.value })}
                  className="w-full outline-none font-medium text-slate-800"
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-2.5 bg-white">
                <label className="block text-slate-500 font-medium text-[11px] mb-1">Car Condition Date *</label>
                <input
                  type="date"
                  required
                  value={form.conditionDate}
                  onChange={e => setForm({ ...form, conditionDate: e.target.value })}
                  className="w-full outline-none font-medium text-slate-800"
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-2.5 bg-white">
                <label className="block text-slate-500 font-medium text-[11px] mb-1">Party Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Party Name *"
                  value={form.partyName}
                  onChange={e => setForm({ ...form, partyName: e.target.value })}
                  className="w-full outline-none font-medium text-slate-800"
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-2.5 bg-white">
                <label className="block text-slate-500 font-medium text-[11px] mb-1">Mobile No.</label>
                <input
                  type="tel"
                  placeholder="Mobile No."
                  value={form.mobileNo}
                  onChange={e => setForm({ ...form, mobileNo: e.target.value })}
                  className="w-full outline-none font-medium text-slate-800"
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-2.5 bg-white">
                <label className="block text-slate-500 font-medium text-[11px] mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="Email Address"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full outline-none font-medium text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Relocate From */}
          <div className="border border-sky-300 rounded-2xl p-5 pt-7 relative bg-white shadow-2xs">
            <span className="absolute -top-3 left-4 bg-sky-500 text-white px-3 py-0.5 rounded-md text-xs font-bold shadow-2xs">
              Relocate From
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="border border-slate-300 rounded-xl p-2.5 bg-slate-50">
                <label className="block text-slate-500 font-medium text-[11px] mb-1">Country</label>
                <input
                  type="text"
                  readOnly
                  value={form.fromCountry}
                  className="w-full outline-none font-bold text-slate-800 bg-transparent"
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-2.5 bg-white">
                <label className="block text-slate-500 font-medium text-[11px] mb-1">State</label>
                <select
                  value={form.fromState}
                  onChange={e => setForm({ ...form, fromState: e.target.value })}
                  className="w-full outline-none font-medium text-slate-800 bg-transparent"
                >
                  {INDIAN_STATES.map((st, idx) => (
                    <option key={`car-fst-${idx}`} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <div className="border border-slate-300 rounded-xl p-2.5 bg-white">
                <label className="block text-slate-500 font-medium text-[11px] mb-1">City</label>
                <input
                  type="text"
                  placeholder="City"
                  value={form.fromCity}
                  onChange={e => setForm({ ...form, fromCity: e.target.value })}
                  className="w-full outline-none font-medium text-slate-800"
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-2.5 bg-white">
                <label className="block text-slate-500 font-medium text-[11px] mb-1">Area</label>
                <input
                  type="text"
                  placeholder="Area"
                  value={form.fromArea}
                  onChange={e => setForm({ ...form, fromArea: e.target.value })}
                  className="w-full outline-none font-medium text-slate-800"
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-2.5 bg-white md:col-span-2">
                <label className="block text-slate-500 font-medium text-[11px] mb-1">Pin Code</label>
                <input
                  type="text"
                  placeholder="Pin Code"
                  value={form.fromPincode}
                  onChange={e => setForm({ ...form, fromPincode: e.target.value })}
                  className="w-full outline-none font-medium text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Relocate To */}
          <div className="border border-slate-300 rounded-2xl p-5 pt-7 relative bg-white shadow-2xs">
            <span className="absolute -top-3 left-4 bg-slate-600 text-white px-3 py-0.5 rounded-md text-xs font-bold shadow-2xs">
              Relocate To
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="border border-slate-300 rounded-xl p-2.5 bg-slate-50">
                <label className="block text-slate-500 font-medium text-[11px] mb-1">Country</label>
                <input
                  type="text"
                  readOnly
                  value={form.toCountry}
                  className="w-full outline-none font-bold text-slate-800 bg-transparent"
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-2.5 bg-white">
                <label className="block text-slate-500 font-medium text-[11px] mb-1">State</label>
                <select
                  value={form.toState}
                  onChange={e => setForm({ ...form, toState: e.target.value })}
                  className="w-full outline-none font-medium text-slate-800 bg-transparent"
                >
                  {INDIAN_STATES.map((st, idx) => (
                    <option key={`car-tst-${idx}`} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <div className="border border-slate-300 rounded-xl p-2.5 bg-white">
                <label className="block text-slate-500 font-medium text-[11px] mb-1">City</label>
                <input
                  type="text"
                  placeholder="City"
                  value={form.toCity}
                  onChange={e => setForm({ ...form, toCity: e.target.value })}
                  className="w-full outline-none font-medium text-slate-800"
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-2.5 bg-white">
                <label className="block text-slate-500 font-medium text-[11px] mb-1">Area</label>
                <input
                  type="text"
                  placeholder="Area"
                  value={form.toArea}
                  onChange={e => setForm({ ...form, toArea: e.target.value })}
                  className="w-full outline-none font-medium text-slate-800"
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-2.5 bg-white md:col-span-2">
                <label className="block text-slate-500 font-medium text-[11px] mb-1">Pin Code</label>
                <input
                  type="text"
                  placeholder="Pin Code"
                  value={form.toPincode}
                  onChange={e => setForm({ ...form, toPincode: e.target.value })}
                  className="w-full outline-none font-medium text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Vehicle/Insurance Details */}
          <div className="border border-amber-300 rounded-2xl p-5 pt-7 relative bg-white shadow-2xs">
            <span className="absolute -top-3 left-4 bg-amber-500 text-white px-3 py-0.5 rounded-md text-xs font-bold shadow-2xs">
              Vehicle/Insurance Details
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="border border-slate-300 rounded-xl p-2.5 bg-white">
                <label className="block text-slate-500 font-medium text-[11px] mb-1">Brand Name</label>
                <select
                  value={form.brandName}
                  onChange={e => setForm({ ...form, brandName: e.target.value })}
                  className="w-full outline-none font-medium text-slate-800 bg-transparent"
                >
                  <option value="N/A">N/A</option>
                  <option value="Hyundai">Hyundai</option>
                  <option value="Maruti Suzuki">Maruti Suzuki</option>
                  <option value="Tata Motors">Tata Motors</option>
                  <option value="Mahindra">Mahindra</option>
                  <option value="Honda">Honda</option>
                  <option value="Toyota">Toyota</option>
                  <option value="Kia">Kia</option>
                  <option value="MG">MG Motors</option>
                  <option value="Skoda">Skoda</option>
                  <option value="Volkswagen">Volkswagen</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="border border-slate-300 rounded-xl p-2.5 bg-white">
                <label className="block text-slate-500 font-medium text-[11px] mb-1">Model Name</label>
                <input
                  type="text"
                  placeholder="Model Name"
                  value={form.modelName}
                  onChange={e => setForm({ ...form, modelName: e.target.value })}
                  className="w-full outline-none font-medium text-slate-800"
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-2.5 bg-white">
                <label className="block text-slate-500 font-medium text-[11px] mb-1">Model Year</label>
                <input
                  type="text"
                  placeholder="Model Year"
                  value={form.modelYear}
                  onChange={e => setForm({ ...form, modelYear: e.target.value })}
                  className="w-full outline-none font-medium text-slate-800"
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-2.5 bg-white">
                <label className="block text-slate-500 font-medium text-[11px] mb-1">Fuel Type</label>
                <select
                  value={form.fuelType}
                  onChange={e => setForm({ ...form, fuelType: e.target.value })}
                  className="w-full outline-none font-medium text-slate-800 bg-transparent"
                >
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                  <option value="CNG">CNG</option>
                  <option value="Electric">Electric</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>

              <div className="border border-slate-300 rounded-xl p-2.5 bg-white">
                <label className="block text-slate-500 font-medium text-[11px] mb-1">Car Regd. No.</label>
                <input
                  type="text"
                  placeholder="Car Regd. No."
                  value={form.carRegNo}
                  onChange={e => setForm({ ...form, carRegNo: e.target.value })}
                  className="w-full outline-none font-medium text-slate-800 uppercase"
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-2.5 bg-white md:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-500 font-medium text-[11px]">Car Colour</label>
                  <span className="text-[10px] text-slate-400">Quick select or type custom</span>
                </div>
                <input
                  type="text"
                  placeholder="e.g. Narangi (Orange), Bringle (Purple), White, Silver..."
                  value={form.carColour}
                  list="car-condition-colors-datalist"
                  onChange={e => setForm({ ...form, carColour: e.target.value })}
                  className="w-full outline-none font-medium text-slate-800"
                />
                <datalist id="car-condition-colors-datalist">
                  {VEHICLE_POPULAR_COLORS.map((c, i) => (
                    <option key={`cc-color-${i}`} value={c.value} />
                  ))}
                  <option value="Narangi" />
                  <option value="Bringle" />
                  <option value="Brinjal Purple" />
                  <option value="Pearl White" />
                  <option value="Midnight Black" />
                  <option value="Cherry Red" />
                </datalist>
                
                {/* Color Buttons */}
                <div className="flex flex-wrap gap-1.5 mt-2 pt-1.5 border-t border-slate-100">
                  {VEHICLE_POPULAR_COLORS.map((col, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setForm({ ...form, carColour: col.value })}
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg cursor-pointer transition-all flex items-center gap-1.5 shadow-2xs hover:opacity-90 active:scale-95 ${col.bg} ${col.text} ${form.carColour === col.value ? 'ring-2 ring-blue-500 ring-offset-1 font-bold' : ''}`}
                    >
                      <span className="w-2 h-2 rounded-full bg-current opacity-80"></span>
                      <span>{col.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="border border-slate-300 rounded-xl p-2.5 bg-white">
                <label className="block text-slate-500 font-medium text-[11px] mb-1">Kilometers in Meter</label>
                <input
                  type="text"
                  placeholder="Kilometers in Meter"
                  value={form.kmReading}
                  onChange={e => setForm({ ...form, kmReading: e.target.value })}
                  className="w-full outline-none font-medium text-slate-800"
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-2.5 bg-white">
                <label className="block text-slate-500 font-medium text-[11px] mb-1">Chassis No.</label>
                <input
                  type="text"
                  placeholder="Chassis No."
                  value={form.chassisNo}
                  onChange={e => setForm({ ...form, chassisNo: e.target.value })}
                  className="w-full outline-none font-medium text-slate-800 uppercase"
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-2.5 bg-white">
                <label className="block text-slate-500 font-medium text-[11px] mb-1">Engine No.</label>
                <input
                  type="text"
                  placeholder="Engine No."
                  value={form.engineNo}
                  onChange={e => setForm({ ...form, engineNo: e.target.value })}
                  className="w-full outline-none font-medium text-slate-800 uppercase"
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-2.5 bg-white">
                <label className="block text-slate-500 font-medium text-[11px] mb-1">Vehicle Value (in Amt.)</label>
                <input
                  type="text"
                  placeholder="Vehicle Value (in Amt.)"
                  value={form.vehicleValue}
                  onChange={e => setForm({ ...form, vehicleValue: e.target.value })}
                  className="w-full outline-none font-medium text-slate-800"
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-2.5 bg-white">
                <label className="block text-slate-500 font-medium text-[11px] mb-1">Insurance Policy Company</label>
                <input
                  type="text"
                  placeholder="Insurance Policy Company"
                  value={form.insuranceCompany}
                  onChange={e => setForm({ ...form, insuranceCompany: e.target.value })}
                  className="w-full outline-none font-medium text-slate-800"
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-2.5 bg-white">
                <label className="block text-slate-500 font-medium text-[11px] mb-1">Insurance Policy No.</label>
                <input
                  type="text"
                  placeholder="Insurance Policy No."
                  value={form.insurancePolicyNo}
                  onChange={e => setForm({ ...form, insurancePolicyNo: e.target.value })}
                  className="w-full outline-none font-medium text-slate-800"
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-2.5 bg-white">
                <label className="block text-slate-500 font-medium text-[11px] mb-1">Battery No.</label>
                <input
                  type="text"
                  placeholder="Battery No."
                  value={form.batteryNo}
                  onChange={e => setForm({ ...form, batteryNo: e.target.value })}
                  className="w-full outline-none font-medium text-slate-800"
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-2.5 bg-white">
                <label className="block text-slate-500 font-medium text-[11px] mb-1">Tyre No.</label>
                <input
                  type="text"
                  placeholder="Tyre No."
                  value={form.tyreNo}
                  onChange={e => setForm({ ...form, tyreNo: e.target.value })}
                  className="w-full outline-none font-medium text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Dents/Scratches */}
          <div className="border border-cyan-300 rounded-2xl p-5 pt-7 relative bg-white shadow-2xs">
            <span className="absolute -top-3 left-4 bg-cyan-500 text-white px-3 py-0.5 rounded-md text-xs font-bold shadow-2xs">
              Dents/Scratches
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="border border-slate-300 rounded-xl p-2.5 bg-white">
                <label className="block text-slate-500 font-medium text-[11px] mb-1">Dents</label>
                <textarea
                  rows={3}
                  placeholder="Dents description or location..."
                  value={form.dents}
                  onChange={e => setForm({ ...form, dents: e.target.value })}
                  className="w-full outline-none font-medium text-slate-800 resize-y"
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-2.5 bg-white">
                <label className="block text-slate-500 font-medium text-[11px] mb-1">Scratches</label>
                <textarea
                  rows={3}
                  placeholder="Scratches description or location..."
                  value={form.scratches}
                  onChange={e => setForm({ ...form, scratches: e.target.value })}
                  className="w-full outline-none font-medium text-slate-800 resize-y"
                />
              </div>
            </div>
          </div>

          {/* Section 6: Accessories Details */}
          <div className="border border-slate-800 rounded-2xl p-5 pt-7 relative bg-white shadow-2xs">
            <span className="absolute -top-3 left-4 bg-slate-900 text-white px-3 py-0.5 rounded-md text-xs font-bold shadow-2xs">
              Accessories Details
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              {CAR_ACCESSORIES_LIST.map((item, idx) => {
                const isChecked = !!form.accessories[item];
                return (
                  <label
                    key={idx}
                    onClick={() => handleToggleAccessory(item)}
                    className="flex items-center gap-3 p-1.5 cursor-pointer select-none group"
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${isChecked ? 'border-sky-500 bg-sky-50 text-sky-600' : 'border-sky-300 bg-white'}`}>
                      {isChecked && <div className="w-2.5 h-2.5 rounded-full bg-sky-500" />}
                    </div>
                    <span className="text-xs font-medium text-slate-700 group-hover:text-slate-900">{item}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Section 7: Other Details */}
          <div className="border border-cyan-300 rounded-2xl p-5 pt-7 relative bg-white shadow-2xs">
            <span className="absolute -top-3 left-4 bg-cyan-500 text-white px-3 py-0.5 rounded-md text-xs font-bold shadow-2xs">
              Other Details
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="border border-slate-300 rounded-xl p-2.5 bg-white">
                <label className="block text-slate-500 font-medium text-[11px] mb-1">Any Other Accessories</label>
                <textarea
                  rows={4}
                  placeholder="Any Other Accessories"
                  value={form.otherAccessories}
                  onChange={e => setForm({ ...form, otherAccessories: e.target.value })}
                  className="w-full outline-none font-medium text-slate-800 resize-y"
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-2.5 bg-white">
                <label className="block text-slate-500 font-medium text-[11px] mb-1">Any Remark</label>
                <textarea
                  rows={4}
                  placeholder="Any Remark"
                  value={form.anyRemark}
                  onChange={e => setForm({ ...form, anyRemark: e.target.value })}
                  className="w-full outline-none font-medium text-slate-800 resize-y"
                />
              </div>
            </div>
          </div>

          {/* Section 8: Bank Details (Optional) */}
          <div className="border border-indigo-300 rounded-2xl p-5 pt-7 relative bg-white shadow-2xs">
            <span className="absolute -top-3 left-4 bg-indigo-600 text-white px-3 py-0.5 rounded-md text-xs font-bold shadow-2xs">
              Bank Details (Optional)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              <div className="border border-slate-300 rounded-xl p-2.5 bg-white">
                <label className="block text-slate-500 font-medium text-[11px] mb-1">Beneficiary Name</label>
                <input
                  type="text"
                  placeholder="Beneficiary Name"
                  value={form.beneficiaryName}
                  onChange={e => setForm({ ...form, beneficiaryName: e.target.value })}
                  className="w-full outline-none font-medium text-slate-800"
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-2.5 bg-white">
                <label className="block text-slate-500 font-medium text-[11px] mb-1">Bank Name</label>
                <input
                  type="text"
                  placeholder="Bank Name"
                  value={form.bankName}
                  onChange={e => setForm({ ...form, bankName: e.target.value })}
                  className="w-full outline-none font-medium text-slate-800"
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-2.5 bg-white">
                <label className="block text-slate-500 font-medium text-[11px] mb-1">Bank A/C No.</label>
                <input
                  type="text"
                  placeholder="Bank A/C No."
                  value={form.bankAcNo}
                  onChange={e => setForm({ ...form, bankAcNo: e.target.value })}
                  className="w-full outline-none font-medium text-slate-800 font-mono"
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-2.5 bg-white">
                <label className="block text-slate-500 font-medium text-[11px] mb-1">Bank IFSC Code</label>
                <input
                  type="text"
                  placeholder="Bank IFSC Code"
                  value={form.bankIfsc}
                  onChange={e => setForm({ ...form, bankIfsc: e.target.value })}
                  className="w-full outline-none font-medium text-slate-800 uppercase font-mono"
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-2.5 bg-white sm:col-span-2">
                <label className="block text-slate-500 font-medium text-[11px] mb-1">UPI ID / GPay / PhonePe</label>
                <input
                  type="text"
                  placeholder="e.g. 8093017400@upi"
                  value={form.upiId}
                  onChange={e => setForm({ ...form, upiId: e.target.value })}
                  className="w-full outline-none font-medium text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              className="bg-sky-600 hover:bg-sky-700 text-white font-bold px-8 py-2.5 rounded-xl text-sm shadow-md transition-all cursor-pointer inline-flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save</span>
            </button>
          </div>
        </form>
      )}

      {viewMode === 'list' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search Car Condition reports..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-xl text-xs outline-none focus:border-slate-800"
              />
            </div>
            <span className="text-xs text-slate-500 font-medium">Showing {filteredReports.length} records</span>
          </div>

          {filteredReports.length === 0 ? (
            <div className="text-center py-12 bg-white border border-slate-200 rounded-2xl">
              <Car className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500 text-xs font-medium">No car condition records found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredReports.map((rec, idx) => (
                <div key={rec.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 relative">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="border border-slate-300 bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs font-mono font-bold">
                        {idx + 1}
                      </span>
                      <span className="bg-amber-100 text-amber-800 font-bold text-xs px-2.5 py-0.5 rounded-md">
                        {rec.conditionDate}
                      </span>
                    </div>

                    <span className="bg-indigo-600 text-white font-bold text-xs px-3 py-1 rounded-full shadow-2xs">
                      CAR CONDITION - #{rec.conditionNo}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs pt-1">
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 font-bold text-indigo-950 text-sm">
                        <User className="w-4 h-4 text-indigo-600" />
                        <span>{rec.partyName || 'Client'}</span>
                      </div>

                      <div className="flex items-start gap-1.5 text-slate-600 text-xs">
                        <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="block text-[10px] text-slate-400 font-semibold uppercase">From</span>
                          <span className="font-semibold text-slate-800">{rec.fromCity || 'N/A'}</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-1.5 text-slate-600 text-xs pl-5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="block text-[10px] text-slate-400 font-semibold uppercase">To</span>
                          <span className="font-semibold text-slate-800">{rec.toCity || 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <Car className="w-4 h-4 text-amber-600" />
                        <span className="font-bold text-slate-900">{rec.brandName !== 'N/A' ? `${rec.brandName} ${rec.modelName}` : rec.modelName || 'Vehicle'}</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-slate-700">
                        <Phone className="w-3.5 h-3.5 text-sky-600" />
                        <a href={`tel:${rec.mobileNo}`} className="text-sky-600 font-bold hover:underline">{rec.mobileNo || 'N/A'}</a>
                      </div>

                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>Reg: <strong className="font-mono text-slate-800">{rec.carRegNo || 'N/A'}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
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
                      onClick={() => handleShareCarCondition(rec)}
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
                      onClick={() => { setForm(rec); setViewMode('form'); }}
                      className="flex flex-col items-center gap-1 text-cyan-600 hover:text-cyan-700 cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-full bg-cyan-400 text-white flex items-center justify-center shadow-xs">
                        <Plus className="w-4 h-4" />
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
          {/* Top Bar for Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 text-white p-4 rounded-2xl print:hidden shadow-lg">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to All Reports
            </button>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => { setForm(selectedRecord); setViewMode('form'); }}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors"
              >
                Edit Report
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
                onClick={() => handleShareCarCondition(selectedRecord)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                title="Share via WhatsApp / Mobile"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>

              <button
                type="button"
                onClick={() => handleDownloadCarPdf(selectedRecord)}
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
              <span>Car Condition Report PDF successfully downloaded to your device downloads folder!</span>
            </div>
          )}

          {/* PDF View Container */}
          <div 
            id="printable-car-condition-pdf"
            className="bg-white border-2 border-[#f87171] shadow-xl p-4 sm:p-6 text-slate-900 font-sans print:border-0 print:shadow-none print:p-0 print:m-0 print:w-full"
          >
            
            {/* PAN No Top Banner */}
            <div className="bg-[#ffb3b3] text-center text-[11px] font-bold text-black py-1 border-b border-[#f87171] uppercase tracking-wide">
              PAN No.: {companyProfile?.panNo || 'AKMPV0774C'}
            </div>

            {/* Company Header */}
            <div className="flex border-b border-[#f87171] min-h-[96px]">
              {/* Left Logo Container */}
              <div className="w-[28%] border-r border-[#f87171] flex items-center justify-center p-2 bg-white">
                <img 
                  src={companyProfile?.logo || UPL_LOGO_BASE64 || '/urbanpro-logo.jpeg'} 
                  alt="UrbanPro Packers & Logistics Logo" 
                  className="max-h-20 w-auto object-contain" 
                />
              </div>

              {/* Center Company Title & Info */}
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

            {/* Title Narangi Bar - ONLY THIS LINE IS NARANGI */}
            <div className="bg-[#ea580c] text-white border-b-2 border-[#c2410c] py-1.5 text-center font-black text-sm tracking-widest uppercase shadow-xs">
              Car Condition Inspection Report
            </div>

            {/* Intro Text */}
            <div className="p-2 border-b border-[#f87171] text-[10px] leading-tight text-slate-800 font-medium bg-white">
              We thank you for your valuable enquiry regarding the transportation of your car from{' '}
              <strong className="underline text-slate-900">{selectedRecord.fromCity || '________'}</strong> to{' '}
              <strong className="underline text-slate-900">{selectedRecord.toCity || '________'}</strong>. We are pleased to provide the details of your car's condition status and paperwork as follows:
            </div>

            {/* Main Grid: Left Details + Right Accessories */}
            <div className="grid grid-cols-12 border-b border-[#f87171] bg-white">
              
              {/* Left Column (7/12 width) */}
              <div className="col-span-7 border-r border-[#f87171] flex flex-col justify-between">
                
                {/* Vehicle & Condition Info */}
                <div className="grid grid-cols-2 border-b border-[#f87171] text-[10px] p-2 gap-1 leading-tight text-slate-900">
                  <div className="space-y-0.5">
                    <p><strong>Car Condition No.:</strong> {selectedRecord.conditionNo || '1'}</p>
                    <p><strong>Car Condition Date:</strong> {selectedRecord.conditionDate}</p>
                    <p><strong>Regd. No.:</strong> {selectedRecord.carRegNo || 'N/A'}</p>
                    <p><strong>Brand/Model:</strong> {selectedRecord.brandName !== 'N/A' ? `${selectedRecord.brandName} ${selectedRecord.modelName}` : selectedRecord.modelName || 'N/A'}</p>
                    <p><strong>Model Year/Colour:</strong> {selectedRecord.modelYear || 'N/A'} {selectedRecord.carColour ? `/ ${selectedRecord.carColour}` : ''}</p>
                  </div>
                  <div className="space-y-0.5">
                    <p><strong>Chassis No.:</strong> {selectedRecord.chassisNo || 'N/A'}</p>
                    <p><strong>Engine No.:</strong> {selectedRecord.engineNo || 'N/A'}</p>
                    <p><strong>Fuel Type:</strong> {selectedRecord.fuelType || 'N/A'}</p>
                    <p><strong>Battery No.:</strong> {selectedRecord.batteryNo || 'N/A'}</p>
                    <p><strong>Tyre No.:</strong> {selectedRecord.tyreNo || 'N/A'}</p>
                  </div>
                </div>

                {/* Client & Insurance Details */}
                <div className="grid grid-cols-2 border-b border-[#f87171] text-[10px] p-2 gap-1 leading-tight text-slate-900">
                  <div className="space-y-0.5">
                    <p><strong>Name:</strong> {selectedRecord.partyName || 'N/A'}</p>
                    <p><strong>Mobile:</strong> {selectedRecord.mobileNo || 'N/A'}</p>
                    <p><strong>Email:</strong> {selectedRecord.email || 'N/A'}</p>
                  </div>
                  <div className="space-y-0.5">
                    <p><strong>Insurance Company:</strong> {selectedRecord.insuranceCompany || 'N/A'}</p>
                    <p><strong>Policy No.:</strong> {selectedRecord.insurancePolicyNo || 'N/A'}</p>
                    <p><strong>Vehicle Value:</strong> {selectedRecord.vehicleValue ? `₹${selectedRecord.vehicleValue}` : 'N/A'}</p>
                  </div>
                </div>

                {/* Move From / Move To */}
                <div className="border-b border-[#f87171]">
                  <div className="grid grid-cols-2 bg-[#ffb3b3] border-b border-[#f87171] text-[10px] font-bold text-center text-slate-900 py-0.5">
                    <div className="border-r border-[#f87171]">Move From</div>
                    <div>Move To</div>
                  </div>
                  <div className="grid grid-cols-2 text-[10px] p-2 leading-tight text-slate-900">
                    <div className="border-r border-[#f87171] pr-2 space-y-0.5">
                      <p><strong>City:</strong> {selectedRecord.fromCity || 'N/A'}</p>
                      <p><strong>Country:</strong> {selectedRecord.fromCountry || 'India'}</p>
                      <p><strong>State:</strong> {selectedRecord.fromState || 'N/A'}</p>
                      <p><strong>Area:</strong> {selectedRecord.fromArea || 'N/A'}</p>
                      <p><strong>Pin Code:</strong> {selectedRecord.fromPincode || 'N/A'}</p>
                    </div>
                    <div className="pl-2 space-y-0.5">
                      <p><strong>City:</strong> {selectedRecord.toCity || 'N/A'}</p>
                      <p><strong>Country:</strong> {selectedRecord.toCountry || 'India'}</p>
                      <p><strong>State:</strong> {selectedRecord.toState || 'N/A'}</p>
                      <p><strong>Area:</strong> {selectedRecord.toArea || 'N/A'}</p>
                      <p><strong>Pin Code:</strong> {selectedRecord.toPincode || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Dents / Scratches */}
                <div className="border-b border-[#f87171]">
                  <div className="grid grid-cols-2 bg-[#ffb3b3] border-b border-[#f87171] text-[10px] font-bold text-center text-slate-900 py-0.5">
                    <div className="border-r border-[#f87171]">Dents</div>
                    <div>Scratches</div>
                  </div>
                  <div className="grid grid-cols-2 text-[10px] p-2 min-h-[55px] leading-tight text-slate-900">
                    <div className="border-r border-[#f87171] pr-2 whitespace-pre-wrap">{selectedRecord.dents || 'Nil'}</div>
                    <div className="pl-2 whitespace-pre-wrap">{selectedRecord.scratches || 'Nil'}</div>
                  </div>
                </div>

                {/* Remarks / Other Accessories */}
                <div>
                  <div className="grid grid-cols-2 bg-[#ffb3b3] border-b border-[#f87171] text-[10px] font-bold text-center text-slate-900 py-0.5">
                    <div className="border-r border-[#f87171]">Any Remarks/Observation</div>
                    <div>Any Other Accessories</div>
                  </div>
                  <div className="grid grid-cols-2 text-[10px] p-2 min-h-[55px] leading-tight text-slate-900">
                    <div className="border-r border-[#f87171] pr-2 whitespace-pre-wrap">{selectedRecord.anyRemark || 'Nil'}</div>
                    <div className="pl-2 whitespace-pre-wrap">{selectedRecord.otherAccessories || 'Nil'}</div>
                  </div>
                </div>

              </div>

              {/* Right Column (5/12 width): ACCESSORIES */}
              <div className="col-span-5 flex flex-col justify-between">
                <div className="bg-[#ffb3b3] border-b border-[#f87171] text-[10px] font-bold text-center text-slate-900 py-0.5 uppercase tracking-wider">
                  ACCESSORIES
                </div>
                <div className="divide-y divide-[#f87171] text-[10px] text-slate-900 flex-1">
                  {CAR_ACCESSORIES_LIST.map((item, idx) => {
                    const isChecked = !!selectedRecord.accessories[item];
                    return (
                      <div key={idx} className="flex items-center justify-between px-2.5 py-1 leading-snug">
                        <span>{item}</span>
                        <span className={`text-[10px] font-bold ${isChecked ? 'text-blue-700 font-extrabold' : 'text-slate-300'}`}>
                          {isChecked ? '✓ YES' : '—'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Bottom Footer Section: Bank Details + Signatures */}
            <div className="grid grid-cols-12 border-b border-[#f87171] min-h-[120px] bg-white text-[10px]">
              
              {/* Bank Details */}
              {(() => {
                const beneficiary = companyProfile?.accountHolder || 'M/s Prakash & Company India';
                const bankName = companyProfile?.bankName || 'State Bank of India';
                const bankAcNo = companyProfile?.accountNo || companyProfile?.bankAccNo || '30789330266';
                const bankIfsc = companyProfile?.ifscCode || companyProfile?.bankIfsc || 'SBIN0009343';
                const upiId = companyProfile?.upiId || '8093017400@sbi';

                return (
                  <div className="col-span-4 border-r border-[#f87171] p-2 leading-tight text-slate-900 bg-white">
                    <div className="font-bold underline mb-1 text-[10.5px]">Bank Details</div>
                    <p><strong>Beneficiary:</strong> {beneficiary}</p>
                    <p><strong>Bank Name:</strong> {bankName}</p>
                    <p><strong>Bank A/C No.:</strong> <span className="font-mono font-bold">{bankAcNo}</span></p>
                    <p><strong>Bank IFSC Code:</strong> <span className="font-mono font-bold">{bankIfsc}</span></p>
                    <div className="font-bold underline mt-1 mb-0.5 text-[9.5px]">Other Payment Details</div>
                    <p><strong>UPI ID:</strong> {upiId}</p>
                  </div>
                );
              })()}

              {/* Authorized Signature */}
              <div className="col-span-4 border-r border-[#f87171] p-2 flex flex-col justify-between items-center text-center">
                <div className="font-bold text-[10px] leading-tight">
                  For <span className="text-[#1e3a8a]">Urban</span><span className="text-[#dc2626]">Pro</span> <span className="text-[#1e3a8a]">Packers & Logistics</span><br />
                  <span className="text-[8.5px] text-slate-700 font-semibold">(A Unit of M/s Prakash & Company India)</span>
                </div>
                <div className="my-auto py-1">
                  <img 
                    src={globalSignature?.image || PRAKASH_SIGNATURE_BASE64} 
                    alt="Authorized Signature & Stamp" 
                    className="max-h-12 max-w-[145px] object-contain mx-auto" 
                  />
                </div>
                <div className="text-blue-900 font-bold text-[9.5px] uppercase">
                  Authorized Signatory & Stamp
                </div>
              </div>

              {/* Receiver Agreement */}
              <div className="col-span-4 p-2 flex flex-col justify-between">
                <div className="text-[10px] text-slate-800 text-left leading-tight">
                  Agree with Terms & Conditions as Overleaf Signature Receiver's
                </div>
                <div className="mt-8 border-t border-dashed border-slate-400 pt-1 flex justify-between items-center text-[9px] text-slate-500">
                  <span>Receiver's Signature / Stamp</span>
                  <span>Date: ____________</span>
                </div>
              </div>

            </div>

            {/* Note Warning Box */}
            <div className="p-2 text-[10px] text-[#b91c1c] leading-tight bg-[#ffb3b3] font-medium border-b border-[#f87171]">
              <strong>Note:</strong> Please keep your Cash/Jewellery and anyway in your Custody/Lock" Carring Liquor, Gas Cylinder, Acid of any type of Liquids (like Ghee Tin, Oil etc.) is totally prohibited.
            </div>

            {/* Bottom Support Footer */}
            <div className="py-1 text-center text-[10px] font-bold text-slate-900 bg-white">
              24x7 Customer Care Support <span className="text-red-600 font-black">8093017400</span>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
