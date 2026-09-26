import React, { useState, useEffect, useRef } from 'react';
import { 
  Building2, Save, Phone, Mail, MapPin, CheckCircle2, Globe, Shield, 
  CreditCard, Sparkles, UserCheck, Upload, Trash2, Image as ImageIcon,
  PenTool, Eraser, Check, RotateCcw
} from 'lucide-react';
import { UPL_LOGO_BASE64 } from '../assets/logoBase64';
import { PRAKASH_SIGNATURE_BASE64 } from '../assets/signatureBase64';

export interface CompanyProfileData {
  companyName: string;
  brandName: string;
  tagline: string;
  gstin: string;
  panNo?: string;
  regAddress: string;
  branchAddress: string;
  phone1: string;
  phone2: string;
  email: string;
  website: string;
  accountHolder?: string;
  bankName: string;
  bankAccNo: string;
  bankIfsc: string;
  bankBranch: string;
  upiId: string;
  termsAndConditions: string;
  logo?: string;
}

export interface SignatureData {
  text: string;
  image?: string;
}

interface Props {
  activeTab: string;
  profile: CompanyProfileData;
  signature?: SignatureData;
  globalSignature?: SignatureData;
  onSaveProfile: (profile: CompanyProfileData) => void;
  onSaveSignature?: (sig: SignatureData) => void;
}

export const SetupView: React.FC<Props> = ({ 
  activeTab, 
  profile, 
  signature, 
  globalSignature, 
  onSaveProfile, 
  onSaveSignature 
}) => {
  const [form, setForm] = useState<CompanyProfileData>(profile);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Unified signature state
  const initialSig = globalSignature || signature || { text: 'M/s Prakash & Company India', image: PRAKASH_SIGNATURE_BASE64 };
  const [signatureState, setSignatureState] = useState<SignatureData>(initialSig);

  // Drawing Pad Canvas state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState('#1e3a8a'); // Deep navy blue ink by default
  const [activeSignMode, setActiveSignMode] = useState<'upload' | 'draw'>('upload');

  // Keep signatureState synchronized when prop changes
  useEffect(() => {
    if (globalSignature) {
      setSignatureState(globalSignature);
    } else if (signature) {
      setSignatureState(signature);
    }
  }, [globalSignature, signature]);

  // Keep company profile state synchronized
  useEffect(() => {
    setForm(profile);
  }, [profile]);

  // Handle image upload with auto-scaling & compression
  const handleSignatureImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Scale down image to max width 450px and max height 180px
        const maxW = 450;
        const maxH = 180;
        let width = img.width;
        let height = img.height;

        if (width > maxW) {
          height = (height * maxW) / width;
          width = maxW;
        }
        if (height > maxH) {
          width = (width * maxH) / height;
          height = maxH;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/png');
          const updated = { ...signatureState, image: compressedDataUrl };
          setSignatureState(updated);
          if (onSaveSignature) onSaveSignature(updated);
          setSavedSuccess(true);
          setTimeout(() => setSavedSuccess(false), 3000);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // reset input
  };

  // Canvas Drawing Handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.clientY : e.clientY;

    ctx.strokeStyle = penColor;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearDrawingCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const saveDrawnSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const updated = { ...signatureState, image: dataUrl };
    setSignatureState(updated);
    if (onSaveSignature) onSaveSignature(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const maxW = 600;
        const maxH = 300;
        let width = img.width;
        let height = img.height;

        if (width > maxW) {
          height = (height * maxW) / width;
          width = maxW;
        }
        if (height > maxH) {
          width = (width * maxH) / height;
          height = maxH;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/png');
          const updated = { ...form, logo: dataUrl };
          setForm(updated);
          onSaveProfile(updated);
          setSavedSuccess(true);
          setTimeout(() => setSavedSuccess(false), 3000);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleResetLogo = () => {
    const updated = { ...form, logo: UPL_LOGO_BASE64 };
    setForm(updated);
    onSaveProfile(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleSaveProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(form);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleSaveSignatureSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSaveSignature) {
      onSaveSignature(signatureState);
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const isCompanyTab = activeTab === 'setup-company-profile' || activeTab === 'company-profile';
  const isSignatureTab = activeTab === 'setup-signature' || activeTab === 'signature';

  const activeLogo = form.logo || UPL_LOGO_BASE64;

  return (
    <div className="space-y-6 pb-16 max-w-4xl mx-auto">
      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-xs animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Configuration saved successfully! Updated across all PDF templates.</span>
        </div>
      )}

      {isCompanyTab && (
        <form onSubmit={handleSaveProfileSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center gap-3 border-b pb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Company Profile & Branding</h2>
              <p className="text-xs text-slate-500">Official company header, addresses, phone numbers, GST & bank details</p>
            </div>
          </div>

          {/* Official Company Logo Section */}
          <div className="border border-blue-200 bg-blue-50/50 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-blue-600" /> Official Company Logo
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  This logo automatically appears on all Bills, Biltys, Quotations, Survey, and Condition Reports.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <label className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5 transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Logo</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleLogoUpload} 
                    className="hidden" 
                  />
                </label>
                <button
                  type="button"
                  onClick={handleResetLogo}
                  className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer flex items-center gap-1 transition-colors"
                  title="Reset to official UrbanPro logo"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                  <span>Default Logo</span>
                </button>
              </div>
            </div>

            {/* Logo Preview Box */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-36 h-20 bg-slate-50 border border-slate-200 rounded-lg p-2 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                  <img 
                    src={activeLogo} 
                    alt="Active Company Logo" 
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">Active Brand Identity</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Format: JPEG/PNG • High DPI Resolution</div>
                  <div className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    <Check className="w-3 h-3 text-emerald-600" /> Linked to all 7 Printable PDF Formats
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Company Registered Name *</label>
              <input type="text" required value={form.companyName} onChange={e => setForm({ ...form, companyName: e.target.value })} className="w-full border border-slate-300 rounded-xl p-2.5 outline-none font-medium text-slate-800 focus:border-blue-500" />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Brand Name / Display Title *</label>
              <input type="text" required value={form.brandName} onChange={e => setForm({ ...form, brandName: e.target.value })} className="w-full border border-slate-300 rounded-xl p-2.5 outline-none font-medium text-slate-800 focus:border-blue-500" />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tagline / Slogan</label>
              <input type="text" value={form.tagline} onChange={e => setForm({ ...form, tagline: e.target.value })} className="w-full border border-slate-300 rounded-xl p-2.5 outline-none font-medium text-slate-800 focus:border-blue-500" />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">GSTIN Number</label>
              <input type="text" value={form.gstin} onChange={e => setForm({ ...form, gstin: e.target.value })} className="w-full border border-slate-300 rounded-xl p-2.5 outline-none font-medium text-slate-800 uppercase focus:border-blue-500" />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">PAN Card Number</label>
              <input type="text" placeholder="e.g. AKMPV0774C" value={form.panNo || ''} onChange={e => setForm({ ...form, panNo: e.target.value })} className="w-full border border-slate-300 rounded-xl p-2.5 outline-none font-medium text-slate-800 uppercase focus:border-blue-500" />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Primary Phone / Helpline *</label>
              <input type="text" required value={form.phone1} onChange={e => setForm({ ...form, phone1: e.target.value })} className="w-full border border-slate-300 rounded-xl p-2.5 outline-none font-medium text-slate-800 focus:border-blue-500" />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Secondary Phone / WhatsApp</label>
              <input type="text" value={form.phone2} onChange={e => setForm({ ...form, phone2: e.target.value })} className="w-full border border-slate-300 rounded-xl p-2.5 outline-none font-medium text-slate-800 focus:border-blue-500" />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full border border-slate-300 rounded-xl p-2.5 outline-none font-medium text-slate-800 focus:border-blue-500" />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Website URL</label>
              <input type="text" value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} className="w-full border border-slate-300 rounded-xl p-2.5 outline-none font-medium text-slate-800 focus:border-blue-500" />
            </div>

            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Registered Office Address</label>
              <input 
                type="text" 
                value={form.regAddress} 
                onChange={e => setForm({ ...form, regAddress: e.target.value })} 
                placeholder="e.g. Ward No. 3, Near Old SBI ATM, Dipka, Korba, CG – 495452 | Tel: 8093017402"
                className="w-full border border-slate-300 rounded-xl p-2.5 outline-none font-medium text-slate-800 focus:border-blue-500" 
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Main Operational Office / Branch Address</label>
              <input 
                type="text" 
                value={form.branchAddress} 
                onChange={e => setForm({ ...form, branchAddress: e.target.value })} 
                placeholder="e.g. Plot No 1491, Balintha Canal Road, Near Lenskart, Hanspal, Bhubaneswar, Odisha – 752101 | Mobile: 8093017400"
                className="w-full border border-slate-300 rounded-xl p-2.5 outline-none font-medium text-slate-800 focus:border-blue-500" 
              />
            </div>
          </div>

          {/* Bank Details */}
          <div className="border-t pt-4 space-y-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-blue-600" /> Owner Bank Account Details (Printed on Invoices & Quotations)
            </h3>
            <p className="text-[11px] text-slate-500">
              These official bank and UPI payment details will be printed on all Quotations, Bills, Bilty, and Condition receipts.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Beneficiary / Account Holder Name</label>
                <input 
                  type="text" 
                  value={form.accountHolder || form.brandName || ''} 
                  onChange={e => setForm({ ...form, accountHolder: e.target.value })} 
                  placeholder="e.g. M/s Prakash & Company India"
                  className="w-full border border-slate-300 rounded-xl p-2.5 outline-none font-medium text-slate-800 focus:border-blue-500" 
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Bank Name</label>
                <input 
                  type="text" 
                  value={form.bankName} 
                  onChange={e => setForm({ ...form, bankName: e.target.value })} 
                  placeholder="e.g. State Bank of India"
                  className="w-full border border-slate-300 rounded-xl p-2.5 outline-none font-medium text-slate-800 focus:border-blue-500" 
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Account Number</label>
                <input 
                  type="text" 
                  value={form.bankAccNo} 
                  onChange={e => setForm({ ...form, bankAccNo: e.target.value })} 
                  placeholder="e.g. 30789330266"
                  className="w-full border border-slate-300 rounded-xl p-2.5 font-mono outline-none font-bold text-slate-800 focus:border-blue-500" 
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">IFSC Code</label>
                <input 
                  type="text" 
                  value={form.bankIfsc} 
                  onChange={e => setForm({ ...form, bankIfsc: e.target.value })} 
                  placeholder="e.g. SBIN0009343"
                  className="w-full border border-slate-300 rounded-xl p-2.5 font-mono uppercase outline-none font-bold text-slate-800 focus:border-blue-500" 
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Bank Branch</label>
                <input 
                  type="text" 
                  value={form.bankBranch} 
                  onChange={e => setForm({ ...form, bankBranch: e.target.value })} 
                  placeholder="e.g. Dipka, Korba"
                  className="w-full border border-slate-300 rounded-xl p-2.5 outline-none font-medium text-slate-800 focus:border-blue-500" 
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">UPI ID</label>
                <input 
                  type="text" 
                  value={form.upiId} 
                  onChange={e => setForm({ ...form, upiId: e.target.value })} 
                  placeholder="e.g. 8093017400@sbi"
                  className="w-full border border-slate-300 rounded-xl p-2.5 outline-none font-medium text-slate-800 focus:border-blue-500" 
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs cursor-pointer shadow-xs flex items-center gap-2">
              <Save className="w-4 h-4" /> Save Company Profile
            </button>
          </div>
        </form>
      )}

      {isSignatureTab && (
        <form onSubmit={handleSaveSignatureSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">Digital Stamp & Signature Manager</h2>
                <p className="text-xs text-slate-500">Upload an image, draw on screen, or edit text signature for all generated PDF documents</p>
              </div>
            </div>

            {signatureState.image && (
              <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" /> Signature Image Active
              </span>
            )}
          </div>

          {/* Live Signature PDF Preview Stamp Box */}
          <div className="border-2 border-dashed border-blue-200 rounded-2xl p-6 text-center bg-blue-50/40 relative">
            <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block mb-2">Live PDF Signature Stamp Preview</span>
            
            <div className="max-w-md mx-auto p-5 bg-white border border-slate-300 rounded-xl shadow-xs text-slate-800 space-y-2">
              {signatureState.image ? (
                <div className="relative inline-block">
                  <img 
                    src={signatureState.image} 
                    alt="Uploaded Signature Stamp" 
                    className="max-h-24 max-w-full object-contain mx-auto border-b border-slate-200 pb-1"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const updated = { ...signatureState, image: '' };
                      setSignatureState(updated);
                      if (onSaveSignature) onSaveSignature(updated);
                    }}
                    className="absolute -top-3 -right-3 bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-full shadow-md transition-colors cursor-pointer"
                    title="Remove Signature Image"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="font-serif italic text-xl font-bold text-blue-900 py-2 border-b border-slate-300">
                  {signatureState.text || 'Authorized Signatory & Stamp'}
                </div>
              )}
              <div className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                For URBANPRO PACKER & LOGISTICS
              </div>
              <p className="text-[10px] text-slate-500 font-medium">Official Seal & Authorized Signatory</p>
            </div>
          </div>

          {/* Mode Selector Tabs: Upload Image File vs Draw Signature */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <button
                type="button"
                onClick={() => setActiveSignMode('upload')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeSignMode === 'upload' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Upload className="w-3.5 h-3.5" /> Option 1: Upload Signature Image
              </button>
              <button
                type="button"
                onClick={() => setActiveSignMode('draw')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeSignMode === 'draw' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <PenTool className="w-3.5 h-3.5" /> Option 2: Draw Digital Signature
              </button>
            </div>

            {activeSignMode === 'upload' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Authorized Title / Text Designation</label>
                  <input 
                    type="text" 
                    value={signatureState.text} 
                    onChange={e => setSignatureState({ ...signatureState, text: e.target.value })} 
                    placeholder="e.g. Authorized Signatory & Stamp"
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 font-medium outline-none focus:border-blue-500 bg-white" 
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Text shown on PDFs when no image is uploaded.</p>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Upload Signature / Official Stamp File</label>
                  <label className="w-full border-2 border-dashed border-blue-300 hover:border-blue-600 bg-white hover:bg-blue-50/50 rounded-xl p-3 text-xs text-slate-700 font-semibold cursor-pointer flex flex-col items-center justify-center gap-1 transition-colors">
                    <Upload className="w-5 h-5 text-blue-600" />
                    <span>{signatureState.image ? 'Replace Uploaded Image' : 'Select PNG / JPG Signature File'}</span>
                    <span className="text-[10px] text-slate-400 font-normal">Auto-optimized for crisp PDF printing</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleSignatureImageUpload} 
                      className="hidden" 
                    />
                  </label>
                </div>
              </div>
            )}

            {activeSignMode === 'draw' && (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <PenTool className="w-4 h-4 text-blue-600" /> Draw Signature on Screen
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-slate-600">Ink Color:</span>
                    <button
                      type="button"
                      onClick={() => setPenColor('#1e3a8a')}
                      className={`w-5 h-5 rounded-full bg-[#1e3a8a] border ${penColor === '#1e3a8a' ? 'ring-2 ring-blue-600' : ''}`}
                      title="Navy Ink"
                    />
                    <button
                      type="button"
                      onClick={() => setPenColor('#000000')}
                      className={`w-5 h-5 rounded-full bg-black border ${penColor === '#000000' ? 'ring-2 ring-blue-600' : ''}`}
                      title="Black Ink"
                    />
                  </div>
                </div>

                <div className="border-2 border-slate-300 bg-white rounded-xl overflow-hidden touch-none relative">
                  <canvas
                    ref={canvasRef}
                    width={450}
                    height={150}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full h-[150px] cursor-crosshair block"
                  />
                  <div className="absolute bottom-2 right-2 text-[10px] text-slate-400 font-medium pointer-events-none">
                    Sign inside box
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={clearDrawingCanvas}
                    className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Clear Drawing
                  </button>

                  <button
                    type="button"
                    onClick={saveDrawnSignature}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5" /> Apply Drawn Signature
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-100">
            <button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-2.5 rounded-xl text-xs cursor-pointer shadow-xs flex items-center gap-2 transition-all active:scale-95"
            >
              <Save className="w-4 h-4" /> Save Signature (Applies to All PDFs)
            </button>
          </div>
        </form>
      )}

      {activeTab === 'settings' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <h2 className="text-lg font-bold text-slate-800">System & Admin Settings</h2>
          <p className="text-xs text-slate-500">Manage data persistence, auto-backup, and login security</p>
          <div className="p-4 bg-slate-50 rounded-xl border text-xs text-slate-700 space-y-2">
            <p><strong>Database Status:</strong> Local Browser Storage (Persistent) Active</p>
            <p><strong>Admin Credentials:</strong> Password Protected (`owner123` / `admin` login)</p>
          </div>
        </div>
      )}

      {activeTab === 'contact-us' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Phone className="w-5 h-5 text-blue-600" /> UrbanPro Logistics Support
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
              <span className="font-bold text-blue-900 block text-sm">Direct Phone Support</span>
              <p className="text-slate-700 mt-1">📞 +91 8093017400</p>
              <p className="text-slate-700">📞 +91 8093017402</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
              <span className="font-bold text-blue-900 block text-sm">Head Office Location</span>
              <p className="text-slate-700 mt-1">📍 Hanspal, Balianta Canal Road, Bhubaneswar, Odisha</p>
              <p className="text-slate-700">📍 Reg: Dipka, Korba, Chhattisgarh</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
