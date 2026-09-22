import React, { useState } from 'react';
import { CheckCircle2, FileText, Printer, Save, Plus, Trash2, ArrowLeft, Sparkles, User, ShieldCheck, Search, Share2, Phone, Clock, MapPin, Download, Check, ExternalLink, Loader2 } from 'lucide-react';
import { UPL_LOGO_BASE64 } from '../assets/logoBase64';
import { downloadPdfFromElement, openElementInPrintWindow } from '../utils/pdfExport';
import { INDIAN_STATES } from '../utils/indianStates';

export interface BikeConditionData {
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
  engineType: string;
  bikeRegNo: string;
  bikeColour: string;
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

export const BIKE_ACCESSORIES_LIST = [
  "Helmet",
  "Fog Light",
  "U Lock",
  "chain Lock",
  "Cable Lock",
  "Bike Air Pump",
  "Saddle Bags",
  "Phone Mount",
  "Racks and Panniers",
  "Mudguards",
  "Left Side Mirror",
  "Right Side Mirror",
  "Bike Cover",
  "Tool Kit",
  "First Aid Box"
];

export const BIKE_POPULAR_COLORS = [
  { label: "Narangi (Orange)", value: "Narangi / Orange", bg: "bg-orange-500", text: "text-white" },
  { label: "Bringle (Purple)", value: "Bringle / Brinjal Purple", bg: "bg-purple-700", text: "text-white" },
  { label: "Black", value: "Black", bg: "bg-slate-900", text: "text-white" },
  { label: "Red", value: "Red", bg: "bg-red-600", text: "text-white" },
  { label: "Blue", value: "Blue", bg: "bg-blue-600", text: "text-white" },
  { label: "White", value: "White", bg: "bg-slate-100 border border-slate-300", text: "text-slate-800" },
  { label: "Silver", value: "Silver", bg: "bg-slate-300", text: "text-slate-800" },
  { label: "Grey", value: "Grey", bg: "bg-slate-500", text: "text-white" },
  { label: "Yellow", value: "Yellow", bg: "bg-amber-400", text: "text-slate-900" },
  { label: "Green", value: "Green", bg: "bg-emerald-600", text: "text-white" }
];

interface Props {
  bikeConditions: BikeConditionData[];
  onSave: (data: BikeConditionData) => void;
  onDelete: (id: string) => void;
  customerProfiles?: any[];
  globalSignature?: { text: string; image?: string };
  initialViewMode?: 'form' | 'list' | 'preview';
  companyProfile?: any;
}

export const BikeConditionView: React.FC<Props> = ({ 
  bikeConditions, 
  onSave, 
  onDelete, 
  customerProfiles = [], 
  globalSignature, 
  initialViewMode = 'form',
  companyProfile 
}) => {
  const [viewMode, setViewMode] = useState<'form' | 'list' | 'preview'>(initialViewMode);
  const [selectedRecord, setSelectedRecord] = useState<BikeConditionData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  React.useEffect(() => {
    if (initialViewMode) {
      setViewMode(initialViewMode);
    }
  }, [initialViewMode]);

  const handleDownloadBikePdf = async (bikeRecord?: BikeConditionData) => {
    const rec = bikeRecord || selectedRecord;
    if (!rec) return;

    try {
      setIsDownloading(true);
      setDownloadSuccess(false);

      const printableElement = document.getElementById('printable-bike-condition-pdf');
      if (!printableElement) {
        window.print();
        return;
      }

      const filename = `UrbanPro_BikeCondition_${rec.conditionNo || '1'}_${(rec.partyName || 'Customer').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      const result = await downloadPdfFromElement(printableElement, filename);

      if (result.success) {
        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 5000);
      }
    } catch (err) {
      console.error('Error downloading Bike Condition PDF:', err);
      window.print();
    } finally {
      setIsDownloading(false);
    }
  };

  const handleOpenInNewTab = (rec?: BikeConditionData) => {
    const printableElement = document.getElementById('printable-bike-condition-pdf');
    if (printableElement) {
      const bNo = (rec || selectedRecord)?.conditionNo || '1';
      openElementInPrintWindow(printableElement, `UrbanPro Bike Condition Report #${bNo}`);
    } else {
      window.print();
    }
  };

  const initialForm: BikeConditionData = {
    id: `bc-${Date.now()}`,
    conditionNo: `${bikeConditions.length + 1}`,
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
    engineType: '4-Stroke Petrol',
    bikeRegNo: '',
    bikeColour: '',
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

    accessories: BIKE_ACCESSORIES_LIST.reduce((acc, curr) => ({ ...acc, [curr]: true }), {}),
    otherAccessories: '',
    anyRemark: '',

    beneficiaryName: '',
    bankName: '',
    bankAcNo: '',
    bankIfsc: '',
    upiId: ''
  };

  const [form, setForm] = useState<BikeConditionData>(initialForm);

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
    setViewMode('preview');
  };

  const filteredReports = bikeConditions.filter(r => 
    (r.partyName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.conditionNo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.bikeRegNo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.mobileNo || '').includes(searchTerm)
  );

  return (
    <div className="space-y-6 pb-16 text-slate-800">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Add Bike Condition</h1>
          <p className="text-xs text-slate-500">Two-wheeler inspection report & accessories checklist</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setForm({
                ...initialForm,
                id: `bc-${Date.now()}`,
                conditionNo: `${bikeConditions.length + 1}`
              });
              setViewMode('form');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${viewMode === 'form' ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
          >
            + Add Bike Condition
          </button>

          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${viewMode === 'list' ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
          >
            All Bike Conditions ({bikeConditions.length})
          </button>
        </div>
      </div>

      {viewMode === 'form' && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Details from Quotation Banner */}
          <div className="bg-sky-100/70 border border-sky-200 rounded-2xl p-3.5 text-xs text-sky-900 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-medium">
              <Sparkles className="w-4 h-4 text-sky-600" />
              <span><strong>Details from Quotation:</strong> Auto-fill client & two-wheeler details from saved profiles</span>
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
                <label className="block text-slate-500 font-medium text-[11px] mb-1">Bike Condition No. *</label>
                <input
                  type="text"
                  required
                  value={form.conditionNo}
                  onChange={e => setForm({ ...form, conditionNo: e.target.value })}
                  className="w-full outline-none font-bold text-slate-900"
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-2.5 bg-white">
                <label className="block text-slate-500 font-medium text-[11px] mb-1">Bike Condition Date *</label>
                <input
                  type="date"
                  required
                  value={form.conditionDate}
                  onChange={e => setForm({ ...form, conditionDate: e.target.value })}
                  className="w-full outline-none font-medium text-slate-800"
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
                    <option key={`bike-fst-${idx}`} value={st}>{st}</option>
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
                    <option key={`bike-tst-${idx}`} value={st}>{st}</option>
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
                  <option value="Hero">Hero MotoCorp</option>
                  <option value="Honda">Honda Two Wheelers</option>
                  <option value="Bajaj">Bajaj Auto</option>
                  <option value="TVS">TVS Motor</option>
                  <option value="Royal Enfield">Royal Enfield</option>
                  <option value="Yamaha">Yamaha</option>
                  <option value="Suzuki">Suzuki</option>
                  <option value="KTM">KTM</option>
                  <option value="Ather">Ather Energy</option>
                  <option value="Ola Electric">Ola Electric</option>
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
                <label className="block text-slate-500 font-medium text-[11px] mb-1">Engine Type</label>
                <input
                  type="text"
                  placeholder="Engine Type"
                  value={form.engineType}
                  onChange={e => setForm({ ...form, engineType: e.target.value })}
                  className="w-full outline-none font-medium text-slate-800"
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-2.5 bg-white">
                <label className="block text-slate-500 font-medium text-[11px] mb-1">Bike Regd. No.</label>
                <input
                  type="text"
                  placeholder="Bike Regd. No."
                  value={form.bikeRegNo}
                  onChange={e => setForm({ ...form, bikeRegNo: e.target.value })}
                  className="w-full outline-none font-medium text-slate-800 uppercase"
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-2.5 bg-white md:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-500 font-medium text-[11px]">Bike Colour</label>
                  <span className="text-[10px] text-slate-400">Quick select or type custom</span>
                </div>
                <input
                  type="text"
                  placeholder="e.g. Narangi (Orange), Bringle (Purple), Black, Red..."
                  value={form.bikeColour}
                  list="bike-condition-colors-datalist"
                  onChange={e => setForm({ ...form, bikeColour: e.target.value })}
                  className="w-full outline-none font-medium text-slate-800"
                />
                <datalist id="bike-condition-colors-datalist">
                  {BIKE_POPULAR_COLORS.map((c, i) => (
                    <option key={`bc-color-${i}`} value={c.value} />
                  ))}
                  <option value="Narangi" />
                  <option value="Bringle" />
                  <option value="Brinjal Purple" />
                  <option value="Matte Black" />
                  <option value="Racing Red" />
                </datalist>

                {/* Color Buttons */}
                <div className="flex flex-wrap gap-1.5 mt-2 pt-1.5 border-t border-slate-100">
                  {BIKE_POPULAR_COLORS.map((col, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setForm({ ...form, bikeColour: col.value })}
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg cursor-pointer transition-all flex items-center gap-1.5 shadow-2xs hover:opacity-90 active:scale-95 ${col.bg} ${col.text} ${form.bikeColour === col.value ? 'ring-2 ring-blue-500 ring-offset-1 font-bold' : ''}`}
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
                  placeholder="Dents"
                  value={form.dents}
                  onChange={e => setForm({ ...form, dents: e.target.value })}
                  className="w-full outline-none font-medium text-slate-800 resize-y"
                />
              </div>

              <div className="border border-slate-300 rounded-xl p-2.5 bg-white">
                <label className="block text-slate-500 font-medium text-[11px] mb-1">Scratches</label>
                <textarea
                  rows={3}
                  placeholder="Scratches"
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
              {BIKE_ACCESSORIES_LIST.map((item, idx) => {
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
                placeholder="Search Bike Condition reports..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-xl text-xs outline-none focus:border-slate-800"
              />
            </div>
            <span className="text-xs text-slate-500 font-medium">Showing {filteredReports.length} records</span>
          </div>

          {filteredReports.length === 0 ? (
            <div className="text-center py-12 bg-white border border-slate-200 rounded-2xl">
              <p className="text-slate-500 text-xs font-medium">No bike condition records found.</p>
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
                      BIKE CONDITION - #{rec.conditionNo}
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
                        <span className="font-bold text-slate-900">{rec.brandName !== 'N/A' ? `${rec.brandName} ${rec.modelName}` : rec.modelName || 'Two-Wheeler'}</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-slate-700">
                        <Phone className="w-3.5 h-3.5 text-sky-600" />
                        <a href={`tel:${rec.mobileNo}`} className="text-sky-600 font-bold hover:underline">{rec.mobileNo || 'N/A'}</a>
                      </div>

                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>Reg: <strong className="font-mono text-slate-800">{rec.bikeRegNo || 'N/A'}</strong></span>
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
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({ title: `Bike Report #${rec.conditionNo}`, text: `Bike Condition for ${rec.partyName}` });
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
                onClick={() => handleDownloadBikePdf(selectedRecord)}
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
              <span>Bike Condition Report PDF successfully downloaded to your device downloads folder!</span>
            </div>
          )}

          {/* PDF View Container */}
          <div 
            id="printable-bike-condition-pdf"
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
                  alt="UrbanPro Packers & Logistics Logo" 
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
                  <strong>Mobile No.:</strong> 8093017400 • <strong>Email:</strong> urbanpro403@gmail.com
                </p>
              </div>

              {/* Right QR / Spacer */}
              <div className="w-24 shrink-0 text-center">
                <div className="border border-slate-300 rounded p-1 bg-slate-50 text-[9px] font-bold text-slate-700">
                  ISO 9001:2015 CERTIFIED
                </div>
              </div>
            </div>

            {/* Title Bar - ONLY THIS LINE IS BRINJAL PURPLE */}
            <div className="bg-[#6b21a8] text-white border-b-2 border-[#581c87] text-center py-1.5 text-xs font-black tracking-widest uppercase shadow-xs">
              Bike Condition Inspection Report
            </div>

            {/* Sub-intro text */}
            <div className="text-[11px] text-slate-700 italic py-1 border-b border-[#f87171]">
              We thank you for your valuable enquiry regarding the transportation of your bike from <strong>{selectedRecord.fromCity || '...'}</strong> to <strong>{selectedRecord.toCity || '...'}</strong>. We are pleased to provide the details of your bike's condition status and paperwork as follows:
            </div>

            {/* Grid 1: Bike Condition No / Date & Client Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 border-b border-[#f87171] text-[11px]">
              <div className="p-2 border-r border-[#f87171] space-y-1">
                <div><span className="font-bold">Bike Condition No.:</span> {selectedRecord.conditionNo}</div>
                <div><span className="font-bold">Bike Condition Date:</span> {selectedRecord.conditionDate}</div>
                <div><span className="font-bold">Regd. No.:</span> {selectedRecord.bikeRegNo || 'N/A'}</div>
                <div><span className="font-bold">Brand/Model:</span> {selectedRecord.brandName} {selectedRecord.modelName}</div>
                <div><span className="font-bold">Model Year/Colour:</span> {selectedRecord.modelYear || 'N/A'} / {selectedRecord.bikeColour || 'N/A'}</div>
              </div>
              <div className="p-2 space-y-1">
                <div><span className="font-bold">Chassis No.:</span> {selectedRecord.chassisNo || 'N/A'}</div>
                <div><span className="font-bold">Engine No.:</span> {selectedRecord.engineNo || 'N/A'}</div>
                <div><span className="font-bold">Fuel Type:</span> {selectedRecord.engineType || 'N/A'}</div>
                <div><span className="font-bold">Battery No.:</span> {selectedRecord.batteryNo || 'N/A'}</div>
                <div><span className="font-bold">Tyre No.:</span> {selectedRecord.tyreNo || 'N/A'}</div>
              </div>
            </div>

            {/* Client Personal & Insurance */}
            <div className="grid grid-cols-1 sm:grid-cols-2 border-b border-[#f87171] text-[11px] bg-slate-50/50">
              <div className="p-2 border-r border-[#f87171] space-y-1">
                <div><span className="font-bold">Name:</span> {selectedRecord.partyName}</div>
                <div><span className="font-bold">Mobile:</span> {selectedRecord.mobileNo || 'N/A'}</div>
                <div><span className="font-bold">Email:</span> {selectedRecord.email || 'N/A'}</div>
              </div>
              <div className="p-2 space-y-1">
                <div><span className="font-bold">Insurance Company:</span> {selectedRecord.insuranceCompany || 'N/A'}</div>
                <div><span className="font-bold">Policy No.:</span> {selectedRecord.insurancePolicyNo || 'N/A'}</div>
                <div><span className="font-bold">Vehicle Value:</span> {selectedRecord.vehicleValue ? `₹ ${selectedRecord.vehicleValue}` : 'N/A'}</div>
              </div>
            </div>

            {/* Move From / Move To & Accessories layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 border-b border-[#f87171] text-[11px]">
              {/* Move From */}
              <div className="p-2 border-r border-b md:border-b-0 border-[#f87171]">
                <div className="font-bold bg-[#ffb3b3] text-slate-900 text-center py-0.5 mb-1 border border-[#f87171]">Move From</div>
                <div><span className="font-bold">City:</span> {selectedRecord.fromCity || 'N/A'}</div>
                <div><span className="font-bold">Country:</span> {selectedRecord.fromCountry}</div>
                <div><span className="font-bold">State:</span> {selectedRecord.fromState}</div>
                <div><span className="font-bold">Area:</span> {selectedRecord.fromArea || 'N/A'}</div>
                <div><span className="font-bold">Pin Code:</span> {selectedRecord.fromPincode || 'N/A'}</div>
              </div>

              {/* Move To */}
              <div className="p-2 border-r border-b md:border-b-0 border-[#f87171]">
                <div className="font-bold bg-[#ffb3b3] text-slate-900 text-center py-0.5 mb-1 border border-[#f87171]">Move To</div>
                <div><span className="font-bold">City:</span> {selectedRecord.toCity || 'N/A'}</div>
                <div><span className="font-bold">Country:</span> {selectedRecord.toCountry}</div>
                <div><span className="font-bold">State:</span> {selectedRecord.toState}</div>
                <div><span className="font-bold">Area:</span> {selectedRecord.toArea || 'N/A'}</div>
                <div><span className="font-bold">Pin Code:</span> {selectedRecord.toPincode || 'N/A'}</div>
              </div>

              {/* Accessories Column */}
              <div className="p-2">
                <div className="font-bold bg-[#ffb3b3] text-slate-900 text-center py-0.5 mb-1 border border-[#f87171]">ACCESSORIES</div>
                <div className="space-y-0.5">
                  {BIKE_ACCESSORIES_LIST.map((acc, i) => {
                    const isChecked = selectedRecord.accessories[acc];
                    return (
                      <div key={i} className="flex items-center justify-between text-[10px] border-b border-slate-100 py-0.5">
                        <span>{acc}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${isChecked ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-400'}`}>
                          {isChecked ? '✓ Yes' : '—'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Dents / Scratches */}
            <div className="grid grid-cols-2 border-b border-[#f87171] text-[11px]">
              <div className="p-2 border-r border-[#f87171] min-h-[60px]">
                <div className="font-bold underline text-slate-900 mb-1">Dents:</div>
                <div className="text-slate-700">{selectedRecord.dents || 'None reported'}</div>
              </div>
              <div className="p-2 min-h-[60px]">
                <div className="font-bold underline text-slate-900 mb-1">Scratches:</div>
                <div className="text-slate-700">{selectedRecord.scratches || 'None reported'}</div>
              </div>
            </div>

            {/* Remarks / Other accessories */}
            <div className="grid grid-cols-2 border-b border-[#f87171] text-[11px]">
              <div className="p-2 border-r border-[#f87171] min-h-[50px]">
                <div className="font-bold underline text-slate-900 mb-1">Any Remarks / Observation:</div>
                <div className="text-slate-700">{selectedRecord.anyRemark || 'None'}</div>
              </div>
              <div className="p-2 min-h-[50px]">
                <div className="font-bold underline text-slate-900 mb-1">Any Other Accessories:</div>
                <div className="text-slate-700">{selectedRecord.otherAccessories || 'None'}</div>
              </div>
            </div>

            {/* Bank Details & Signature Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 border-b border-[#f87171] text-[11px]">
              <div className="p-2 border-r border-b sm:border-b-0 border-[#f87171] space-y-1">
                {(() => {
                  const beneficiary = companyProfile?.accountHolder || companyProfile?.companyName || selectedRecord.beneficiaryName || '';
                  const bankName = companyProfile?.bankName || selectedRecord.bankName || '';
                  const bankAcNo = companyProfile?.accountNo || companyProfile?.bankAccNo || selectedRecord.bankAcNo || '';
                  const bankIfsc = companyProfile?.ifscCode || companyProfile?.bankIfsc || selectedRecord.bankIfsc || '';
                  const upiId = companyProfile?.upiId || selectedRecord.upiId || '';

                  return (
                    <>
                      <div className="font-bold text-slate-900 underline">Bank Details</div>
                      <div><span className="font-bold">Beneficiary Name:</span> {beneficiary || '____________________'}</div>
                      <div><span className="font-bold">Bank Name:</span> {bankName || '____________________'}</div>
                      <div><span className="font-bold">Bank A/C No.:</span> {bankAcNo || '____________________'}</div>
                      <div><span className="font-bold">Bank IFSC Code:</span> {bankIfsc || '____________________'}</div>
                      <div><span className="font-bold">UPI / GPay:</span> {upiId || '____________________'}</div>
                    </>
                  );
                })()}
              </div>

              <div className="p-2 flex flex-col justify-between items-end text-right">
                <div className="text-[10px] text-slate-600 font-semibold mb-2">
                  Agree with Terms & Conditions as Overleaf Signature Receiver's
                </div>
                <div className="mt-4">
                  {globalSignature?.image ? (
                    <div className="flex flex-col items-end">
                      <img src={globalSignature.image} alt="Signature Stamp" className="max-h-14 object-contain mb-1" />
                      <span className="font-bold text-slate-900 text-[11px] border-t border-slate-300 pt-0.5">{globalSignature.text || 'VIJAY'}</span>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="font-bold text-slate-900">VIJAY</div>
                      <div className="h-10 border-b border-slate-400 w-36 ml-auto"></div>
                    </div>
                  )}
                  <div className="font-bold text-slate-800 text-[11px] mt-1">Authorized Signature</div>
                  <div className="font-bold text-[10px]">
                    For <span className="text-[#1e3a8a]">Urban</span><span className="text-[#dc2626]">Pro</span> <span className="text-[#1e3a8a]">Packers & Logistics</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Note */}
            <div className="p-2 text-[9px] text-slate-600 leading-tight">
              <strong>Note:</strong> Please keep your Cash/Jewellery and anyway in your Custody/Lock" Carring Liquor, Gas Cylinder, Acid of any type of Liquids (like Ghee Tin, Oil etc.) is totally prohibited.
            </div>

            {/* Helpline bar */}
            <div className="bg-[#ffb3b3] border-t border-[#f87171] text-center py-1 text-[11px] font-bold text-slate-900">
              24x7 Customer Care Support <span className="text-red-600 font-black">8093017400</span>
            </div>

          </div>

          <div className="flex items-center justify-end gap-3 print:hidden pt-4">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              Back to List
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="bg-slate-900 hover:bg-black text-white font-bold px-5 py-2 rounded-xl text-xs shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Download PDF</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
