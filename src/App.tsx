/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  Home, 
  Building2, 
  Truck, 
  Package, 
  Car, 
  Bike, 
  Globe, 
  Phone, 
  PhoneCall,
  Mail, 
  MapPin, 
  CheckCircle2,
  Clock,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Menu,
  Bell,
  MessageSquare,
  Link2,
  Plus,
  Lock,
  LogOut,
  Users,
  LayoutDashboard,
  ClipboardList,
  FileText,
  PackageCheck,
  PlusCircle,
  List,
  Trash2,
  User,
  Box,
  Share2,
  Edit,
  Eye, Printer, X,
  Search,
  Download,
  Store,
  HardHat,
  Layers,
  Shield,
  Headphones,
  Sparkles,
  Check,
  AlertCircle
} from 'lucide-react';

const WhatsAppIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.99c-.002 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c-.001 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662a11.87 11.87 0 005.709 1.458h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);
import { SurveyPdfModal } from './components/SurveyPdfModal';
import { QuotationPdfModal, numberToIndianWords } from './components/QuotationPdfModal';
import { PackingListPdfModal, PackingListData, PackingListItem } from './components/PackingListPdfModal';
import { CarConditionView } from './components/CarConditionView';
import { BikeConditionView } from './components/BikeConditionView';
import { BiltyView } from './components/BiltyView';
import { BillView } from './components/BillView';
import { MoneyReceiptView } from './components/MoneyReceiptView';
import { PaymentVoucherView } from './components/PaymentVoucherView';
import { SetupView } from './components/SetupView';
import { UPL_LOGO_BASE64 } from './assets/logoBase64';
import { PRAKASH_SIGNATURE_BASE64 } from './assets/signatureBase64';
import { INDIAN_STATES, getStateCodeByName } from './utils/indianStates';
export { INDIAN_STATES, getStateCodeByName };

export const FLOOR_OPTIONS = [
  "Ground",
  "Basement",
  "1st Floor",
  "2nd Floor",
  "3rd Floor",
  "4th Floor",
  "Above 4th Floor"
];

export default function App() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    date: '',
    item: '',
    otherItem: '',
    movingFrom: '',
    movingTo: '',
    message: '',
  });

  const [expandedService, setExpandedService] = useState<number | null>(null);
  const [isAboutExpanded, setIsAboutExpanded] = useState(false);
  const [showAllServicesModal, setShowAllServicesModal] = useState(false);

  const [isAdminView, setIsAdminView] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(true);
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [adminTab, setAdminTab] = useState('add-survey');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [surveyMenuOpen, setSurveyMenuOpen] = useState(true);
  const ADMIN_PASSWORD = "owner123";

  // Survey State & Helper Functions
  const generateNextSurveyNo = (existingSurveys: any[]): string => {
    let maxNum = 1000;
    existingSurveys.forEach(s => {
      const val = String(s.surveyNo || '').replace(/\D/g, '');
      if (val) {
        const num = parseInt(val, 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    });
    return String(maxNum + 1);
  };

  const initialSurveyForm = {
    id: Date.now(),
    surveyNo: '1042',
    surveyDate: new Date().toISOString().split('T')[0],
    partyName: '',
    mobileNo: '',
    email: '',
    packingDate: '',
    dateOfDelivery: '',
    fromCountry: 'India',
    fromState: 'Odisha',
    fromCity: 'Bhubaneswar',
    fromArea: '',
    fromPinCode: '',
    fromFloor: 'Ground',
    fromLift: 'Not Required',
    toCountry: 'India',
    toState: 'Odisha',
    toCity: 'Cuttack',
    toArea: '',
    toPinCode: '',
    toFloor: 'Ground',
    toLift: 'Not Required',
    items: [
      { name: 'ws', qty: '1', value: '0', remark: '' },
      { name: 'tv', qty: '1', value: '0', remark: '' }
    ] as {name: string, qty: string, value: string, remark: string}[],
    advancePay: '',
    easyAccess: '',
    balconyItems: '',
    extraInfo: ''
  };

  const [surveyForm, setSurveyForm] = useState(initialSurveyForm);
  const [surveys, setSurveys] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('upl_surveys');
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(s => s.partyName !== 'Tapaswini Sahoo' && s.surveyNo !== '1001');
        }
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  });
  
  useEffect(() => {
    try {
      localStorage.setItem('upl_surveys', JSON.stringify(surveys));
    } catch (e) {
      console.error(e);
    }
  }, [surveys]);
  
  const [currentItem, setCurrentItem] = useState({name: '', qty: '1', value: '', remark: ''});
  const [editingSurveyId, setEditingSurveyId] = useState<number | null>(null);
  const [viewingSurvey, setViewingSurvey] = useState<any | null>(null);
  const [surveyToDelete, setSurveyToDelete] = useState<any | null>(null);
  const [surveyNoWarning, setSurveyNoWarning] = useState<string | null>(null);
  const [selectedSurveyForQuotationAutoFill, setSelectedSurveyForQuotationAutoFill] = useState('');
  const [selectedSurveyForPackingAutoFill, setSelectedSurveyForPackingAutoFill] = useState('');
  const [carConditionViewMode, setCarConditionViewMode] = useState<'form' | 'list'>('form');
  const [bikeConditionViewMode, setBikeConditionViewMode] = useState<'form' | 'list'>('form');

  // Global Signature State (Persistent across sessions & all PDF components)
  const [globalSignature, setGlobalSignature] = useState<{ text: string; image?: string }>(() => {
    try {
      const saved = localStorage.getItem('upl_global_signature');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed.image || parsed.image === '') {
          parsed.image = PRAKASH_SIGNATURE_BASE64;
        }
        if (!parsed.text || parsed.text === 'Authorized Signatory & Stamp' || parsed.text === 'VIJAY') {
          parsed.text = 'M/s Prakash & Company India';
        }
        return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return { text: 'M/s Prakash & Company India', image: PRAKASH_SIGNATURE_BASE64 };
  });

  useEffect(() => {
    try {
      localStorage.setItem('upl_global_signature', JSON.stringify(globalSignature));
    } catch (e) {
      console.error(e);
    }
  }, [globalSignature]);

  const addItemToSurvey = () => {
    if (currentItem.name.trim()) {
      setSurveyForm({ ...surveyForm, items: [currentItem, ...surveyForm.items] });
      setCurrentItem({name: '', qty: '1', value: '', remark: ''});
    }
  };

  const removeItemFromSurvey = (index: number) => {
    setSurveyForm({ ...surveyForm, items: surveyForm.items.filter((_, i) => i !== index) });
  };
  
  const handleSaveSurvey = () => {
    if (!surveyForm.partyName.trim()) {
      setShareToast('Please enter Party Name');
      setTimeout(() => setShareToast(null), 3000);
      return;
    }

    const currentSurveyNo = String(surveyForm.surveyNo || '').trim();
    if (!currentSurveyNo) {
      const nextGen = generateNextSurveyNo(surveys);
      surveyForm.surveyNo = nextGen;
    }

    // Uniqueness validation check across all other records
    const duplicate = surveys.find(
      s => String(s.id) !== String(editingSurveyId) && 
           String(s.surveyNo || '').trim().toLowerCase() === String(surveyForm.surveyNo).trim().toLowerCase()
    );

    if (duplicate) {
      setSurveyNoWarning(`Survey No. "${surveyForm.surveyNo}" already exists for ${duplicate.partyName || 'another customer'}. Every survey number must be unique.`);
      setShareToast(`⚠️ Survey No. "${surveyForm.surveyNo}" is already in use! Please choose a unique number.`);
      setTimeout(() => setShareToast(null), 4000);
      return;
    }

    setSurveyNoWarning(null);
    let updatedSurveys: any[];
    if (editingSurveyId) {
      updatedSurveys = surveys.map(s => s.id === editingSurveyId ? surveyForm : s);
      setSurveys(updatedSurveys);
      setShareToast(`Survey #${surveyForm.surveyNo} updated successfully!`);
    } else {
      const newSurvey = { ...surveyForm, id: Date.now() };
      updatedSurveys = [newSurvey, ...surveys];
      setSurveys(updatedSurveys);
      setShareToast(`Survey #${newSurvey.surveyNo} created successfully!`);
    }
    setTimeout(() => setShareToast(null), 3000);

    const nextFreeNo = generateNextSurveyNo(updatedSurveys);
    setSurveyForm({ ...initialSurveyForm, id: Date.now(), surveyNo: nextFreeNo });
    setEditingSurveyId(null);
    setAdminTab('list-survey');
  };

  const handleEditSurvey = (survey: any) => {
    setSurveyForm(survey);
    setEditingSurveyId(survey.id);
    setSurveyNoWarning(null);
    setAdminTab('add-survey');
  };

  const handleDeleteSurvey = (survey: any) => {
    setSurveyToDelete(survey);
  };

  const confirmDeleteSurvey = () => {
    if (!surveyToDelete) return;
    const targetId = surveyToDelete.id;
    const surveyNo = surveyToDelete.surveyNo || targetId;
    setSurveys(prev => {
      const next = prev.filter(s => String(s.id) !== String(targetId));
      try {
        localStorage.setItem('upl_surveys', JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
    if (viewingSurvey && String(viewingSurvey.id) === String(targetId)) {
      setViewingSurvey(null);
    }
    if (editingSurveyId && String(editingSurveyId) === String(targetId)) {
      setEditingSurveyId(null);
    }
    setSurveyToDelete(null);
    setShareToast(`Survey #${surveyNo} deleted successfully`);
    setTimeout(() => setShareToast(null), 3000);
  };
  
  const handleShareSurvey = (survey: any) => {
    if (navigator.share) {
      navigator.share({
        title: `Survey ${survey.surveyNo}`,
        text: `Survey Details for ${survey.partyName}`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      alert("Sharing is not supported on this browser.");
    }
  };

  // ----------------------------------------------------
  // Survey Auto-Fill to Quotation & Packing List Handlers
  // ----------------------------------------------------
  const applySurveyToQuotation = (surveyNoOrId: string) => {
    if (!surveyNoOrId || !surveyNoOrId.trim()) return;
    const query = surveyNoOrId.trim().toLowerCase();
    const match = surveys.find(
      s => String(s.surveyNo || '').trim().toLowerCase() === query || 
           String(s.id) === query ||
           String(s.partyName || '').trim().toLowerCase().includes(query)
    );

    if (!match) {
      setShareToast(`No survey found matching "${surveyNoOrId}"`);
      setTimeout(() => setShareToast(null), 3000);
      return;
    }

    setQuotationForm(prev => ({
      ...prev,
      partyName: match.partyName || prev.partyName,
      mobileNo: match.mobileNo || prev.mobileNo,
      email: match.email || prev.email,
      packingDate: match.packingDate || match.surveyDate || prev.packingDate,
      deliveryDate: match.dateOfDelivery || prev.deliveryDate,
      moveType: match.moveType || prev.moveType || 'Household Goods, Domestic Shifting',
      fromCountry: match.fromCountry || prev.fromCountry || 'India',
      fromState: match.fromState || prev.fromState || 'Odisha',
      fromCity: match.fromCity || prev.fromCity,
      fromArea: match.fromArea || prev.fromArea,
      fromPincode: match.fromPinCode || match.fromPincode || prev.fromPincode,
      fromFloor: match.fromFloor || prev.fromFloor || 'Ground',
      fromLift: match.fromLift || prev.fromLift || 'Not Required',
      toCountry: match.toCountry || prev.toCountry || 'India',
      toState: match.toState || prev.toState || 'Odisha',
      toCity: match.toCity || prev.toCity,
      toArea: match.toArea || prev.toArea,
      toPincode: match.toPinCode || match.toPincode || prev.toPincode,
      toFloor: match.toFloor || prev.toFloor || 'Ground',
      toLift: match.toLift || prev.toLift || 'Not Required',
      easyAccess: match.easyAccess || prev.easyAccess || 'Yes',
      balconyItems: match.balconyItems || prev.balconyItems || 'No',
      extraInfo: match.extraInfo || prev.extraInfo || '',
    }));

    setSelectedSurveyForQuotationAutoFill(String(match.surveyNo));
    setShareToast(`✓ Auto-filled details from Survey #${match.surveyNo} for ${match.partyName}`);
    setTimeout(() => setShareToast(null), 3500);
  };

  const applySurveyToPackingList = (surveyNoOrId: string, importItems = true) => {
    if (!surveyNoOrId || !surveyNoOrId.trim()) return;
    const query = surveyNoOrId.trim().toLowerCase();
    const match = surveys.find(
      s => String(s.surveyNo || '').trim().toLowerCase() === query || 
           String(s.id) === query ||
           String(s.partyName || '').trim().toLowerCase().includes(query)
    );

    if (!match) {
      setShareToast(`No survey found matching "${surveyNoOrId}"`);
      setTimeout(() => setShareToast(null), 3000);
      return;
    }

    let convertedItems = packingListForm.items;
    if (importItems && match.items && match.items.length > 0) {
      convertedItems = match.items.map((item: any, idx: number) => ({
        id: `pli-${Date.now()}-${idx}`,
        name: item.name || 'Item',
        qty: item.qty || '1',
        boxNo: String(idx + 1),
        value: item.value || '0',
        remark: item.remark || 'Standard Packing'
      }));
    }

    setPackingListForm(prev => ({
      ...prev,
      partyName: match.partyName || prev.partyName,
      mobileNo: match.mobileNo || prev.mobileNo,
      fromCountry: match.fromCountry || prev.fromCountry || 'India',
      fromState: match.fromState || prev.fromState || 'Odisha',
      fromCity: match.fromCity || prev.fromCity,
      fromArea: match.fromArea || prev.fromArea,
      fromPincode: match.fromPinCode || match.fromPincode || prev.fromPincode,
      fromFloor: match.fromFloor || prev.fromFloor || 'Ground',
      toCountry: match.toCountry || prev.toCountry || 'India',
      toState: match.toState || prev.toState || 'Odisha',
      toCity: match.toCity || prev.toCity,
      toArea: match.toArea || prev.toArea,
      toPincode: match.toPinCode || match.toPincode || prev.toPincode,
      toFloor: match.toFloor || prev.toFloor || 'Ground',
      packingListDate: match.packingDate || match.surveyDate || prev.packingListDate,
      items: convertedItems,
    }));

    setSelectedSurveyForPackingAutoFill(String(match.surveyNo));
    setShareToast(`✓ Auto-filled details and ${match.items?.length || 0} items from Survey #${match.surveyNo} for ${match.partyName}`);
    setTimeout(() => setShareToast(null), 3500);
  };

  const handleCreateQuotationFromSurvey = (survey: any) => {
    setEditingQuotationId(null);
    setQuotationForm({
      ...initialQuotationForm,
      quotationNo: String(quotations.length + 1),
      quotationDate: new Date().toISOString().split('T')[0],
      partyName: survey.partyName || '',
      mobileNo: survey.mobileNo || '',
      email: survey.email || '',
      packingDate: survey.packingDate || survey.surveyDate || '',
      deliveryDate: survey.dateOfDelivery || '',
      moveType: survey.moveType || 'Household Goods, Domestic Shifting',
      fromCountry: survey.fromCountry || 'India',
      fromState: survey.fromState || 'Odisha',
      fromCity: survey.fromCity || '',
      fromArea: survey.fromArea || '',
      fromPincode: survey.fromPinCode || survey.fromPincode || '',
      fromFloor: survey.fromFloor || 'Ground',
      fromLift: survey.fromLift || 'Not Required',
      toCountry: survey.toCountry || 'India',
      toState: survey.toState || 'Odisha',
      toCity: survey.toCity || '',
      toArea: survey.toArea || '',
      toPincode: survey.toPinCode || survey.toPincode || '',
      toFloor: survey.toFloor || 'Ground',
      toLift: survey.toLift || 'Not Required',
      easyAccess: survey.easyAccess || 'Yes',
      balconyItems: survey.balconyItems || 'No',
      extraInfo: survey.extraInfo || '',
    });
    setSelectedSurveyForQuotationAutoFill(String(survey.surveyNo));
    setAdminTab('add-quotation');
    setShareToast(`✓ Pre-loaded all customer & route info from Survey #${survey.surveyNo}`);
    setTimeout(() => setShareToast(null), 3500);
  };

  const handleCreatePackingListFromSurvey = (survey: any) => {
    setEditingPackingListId(null);
    const convertedItems = (survey.items && survey.items.length > 0)
      ? survey.items.map((item: any, idx: number) => ({
          id: `pli-${Date.now()}-${idx}`,
          name: item.name || 'Item',
          qty: item.qty || '1',
          boxNo: String(idx + 1),
          value: item.value || '0',
          remark: item.remark || 'Standard Packing'
        }))
      : [];

    setPackingListForm({
      ...initialPackingListForm,
      id: `pl-${Date.now()}`,
      packingListNo: String(packingLists.length + 1),
      packingListDate: survey.packingDate || survey.surveyDate || new Date().toISOString().split('T')[0],
      partyName: survey.partyName || '',
      mobileNo: survey.mobileNo || '',
      fromCountry: survey.fromCountry || 'India',
      fromState: survey.fromState || 'Odisha',
      fromCity: survey.fromCity || '',
      fromArea: survey.fromArea || '',
      fromPincode: survey.fromPinCode || survey.fromPincode || '',
      fromFloor: survey.fromFloor || 'Ground',
      toCountry: survey.toCountry || 'India',
      toState: survey.toState || 'Odisha',
      toCity: survey.toCity || '',
      toArea: survey.toArea || '',
      toPincode: survey.toPinCode || survey.toPincode || '',
      toFloor: survey.toFloor || 'Ground',
      items: convertedItems,
    });
    setSelectedSurveyForPackingAutoFill(String(survey.surveyNo));
    setAdminTab('add-packing');
    setShareToast(`✓ Pre-loaded info & ${convertedItems.length} items from Survey #${survey.surveyNo}`);
    setTimeout(() => setShareToast(null), 3500);
  };

  // Service Charge % options from 0% to 20% in steps of 0.5%
  const SERVICE_CHARGE_PERCENT_OPTIONS = Array.from({ length: 41 }, (_, i) => `${i * 0.5}%`);

  // Quotation Management State
  const initialQuotationForm = {
    quotationNo: '1',
    quotationDate: new Date().toISOString().split('T')[0],
    partyName: '',
    mobileNo: '',
    email: '',
    packingDate: '',
    deliveryDate: '',
    moveType: '',
    fromCountry: 'India',
    fromState: '',
    fromCity: '',
    fromArea: '',
    fromPincode: '',
    fromFloor: '',
    fromLift: 'Not Required',
    toCountry: 'India',
    toState: '',
    toCity: '',
    toArea: '',
    toPincode: '',
    toFloor: '',
    toLift: 'Not Required',
    transportCharges: '',
    packingCharges: '',
    unpackingCharges: '',
    loadingCharges: '',
    unloadingCharges: '',
    dismantlingCharges: '',
    octroiCharges: '',
    carCharges: '',
    bikeCharges: '',
    statCharges: '',
    serviceChargePercent: '0%',
    serviceCharge: '',
    customCharges: [] as Array<{ name: string; val: string }>,
    subTotal: '',
    insuranceStatus: 'Extra',
    insurancePercent: '3%',
    goodsValue: '',
    insuranceCharge: '',
    gstStatus: 'Extra',
    gstPercent: '18%',
    gstType: 'CGST/SGST',
    gstCharge: '',
    grandTotal: '',
    payableInWords: '',
    advancePaid: '',
    easyAccess: '',
    balconyItems: '',
    extraInfo: '',
    status: 'Pending'
  };

  const [quotationForm, setQuotationForm] = useState(initialQuotationForm);
  const [quotations, setQuotations] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('upl_quotations');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Exclude any hardcoded screenshot demo items
          const cleaned = parsed.filter(
            q => q.id !== '3' && q.id !== '2' && q.id !== '1' && 
                 q.partyName !== 'Devender Raolloth' && 
                 q.partyName !== 'Ramesh Sharma' && 
                 q.partyName !== 'Anita Mohapatra'
          );
          return cleaned;
        }
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('upl_quotations', JSON.stringify(quotations));
    } catch (e) {
      console.error(e);
    }
  }, [quotations]);

  const [editingQuotationId, setEditingQuotationId] = useState<string | number | null>(null);
  const [viewingQuotation, setViewingQuotation] = useState<any | null>(null);
  const [quotationToDelete, setQuotationToDelete] = useState<any | null>(null);
  const [quotationSearchQuery, setQuotationSearchQuery] = useState('');
  const [shareToast, setShareToast] = useState<string | null>(null);

  const handleSaveQuotation = () => {
    if (!quotationForm.partyName.trim()) {
      setShareToast('Please enter Party Name');
      setTimeout(() => setShareToast(null), 3000);
      return;
    }

    const allChargeValues = [
      quotationForm.transportCharges,
      quotationForm.packingCharges,
      quotationForm.unpackingCharges,
      quotationForm.loadingCharges,
      quotationForm.unloadingCharges,
      quotationForm.dismantlingCharges,
      quotationForm.octroiCharges,
      quotationForm.carCharges,
      quotationForm.bikeCharges,
      quotationForm.statCharges,
      quotationForm.serviceCharge,
      ...(quotationForm.customCharges || []).map((c: any) => c.val)
    ];

    let computedSub = 0;
    for (const val of allChargeValues) {
      const parsed = parseFloat(String(val).replace(/[^0-9.]/g, ''));
      if (!isNaN(parsed) && parsed > 0) {
        computedSub += parsed;
      }
    }

    const sub = computedSub > 0 ? computedSub : (parseFloat(String(quotationForm.subTotal).replace(/[^0-9.]/g, '')) || 0);
    let grand = sub;

    // Add Insurance Charge if Extra
    let finalInsCharge = quotationForm.insuranceCharge;
    if (quotationForm.insuranceStatus !== 'Included' && quotationForm.insuranceStatus !== 'Exempted') {
      const insNum = parseFloat(String(quotationForm.insuranceCharge).replace(/[^0-9.]/g, ''));
      if (!isNaN(insNum) && insNum > 0) {
        grand += insNum;
      } else if (quotationForm.goodsValue) {
        const gVal = parseFloat(String(quotationForm.goodsValue).replace(/[^0-9.]/g, '')) || 0;
        const insPct = parseFloat(String(quotationForm.insurancePercent || '3').replace(/[^0-9.]/g, '')) || 3;
        const autoIns = Math.round((gVal * insPct) / 100);
        if (autoIns > 0) {
          grand += autoIns;
          finalInsCharge = String(autoIns);
        }
      }
    }

    // Add GST Charge if Extra
    let finalGstCharge = quotationForm.gstCharge;
    if (quotationForm.gstStatus !== 'Included' && quotationForm.gstStatus !== 'Exempted' && quotationForm.gstType !== 'Exempted') {
      const gstNum = parseFloat(String(quotationForm.gstCharge).replace(/[^0-9.]/g, ''));
      if (!isNaN(gstNum) && gstNum > 0) {
        grand += gstNum;
      } else {
        const gstPct = parseFloat(String(quotationForm.gstPercent || '18').replace(/[^0-9.]/g, '')) || 18;
        const autoGst = Math.round((sub * gstPct) / 100);
        if (autoGst > 0) {
          grand += autoGst;
          finalGstCharge = String(autoGst);
        }
      }
    }

    const words = grand > 0 ? numberToIndianWords(grand) : '';

    const updated = {
      ...quotationForm,
      insuranceCharge: finalInsCharge || quotationForm.insuranceCharge,
      gstCharge: finalGstCharge || quotationForm.gstCharge,
      subTotal: sub > 0 ? String(sub) : (quotationForm.subTotal || ''),
      grandTotal: grand > 0 ? String(grand) : (quotationForm.grandTotal || ''),
      payableInWords: words || quotationForm.payableInWords || ''
    };

    if (editingQuotationId) {
      setQuotations(quotations.map(q => (q.id === editingQuotationId ? { ...updated, id: editingQuotationId } : q)));
      setShareToast('Quotation updated successfully!');
    } else {
      const newQuot = { ...updated, id: Date.now().toString() };
      setQuotations([newQuot, ...quotations]);
      setShareToast('Quotation created successfully!');
    }
    setTimeout(() => setShareToast(null), 3000);
    setQuotationForm({ ...initialQuotationForm, quotationNo: String(quotations.length + 2) });
    setEditingQuotationId(null);
    setAdminTab('list-quotation');
  };

  const handleEditQuotation = (quotation: any) => {
    setQuotationForm({
      ...initialQuotationForm,
      ...quotation,
      serviceChargePercent: quotation.serviceChargePercent || '0%',
      insuranceStatus: quotation.insuranceStatus || (String(quotation.insuranceCharge).toLowerCase().includes('included') ? 'Included' : (quotation.insuranceCharge ? 'Extra' : 'Extra')),
      insurancePercent: quotation.insurancePercent || '3%',
      gstStatus: quotation.gstStatus || (String(quotation.gstCharge).toLowerCase().includes('included') ? 'Included' : (quotation.gstCharge ? 'Extra' : 'Extra')),
      gstPercent: quotation.gstPercent || '18%',
      gstType: quotation.gstType || 'CGST/SGST',
    });
    setEditingQuotationId(quotation.id);
    setAdminTab('add-quotation');
  };

  const handleDeleteQuotation = (quotation: any) => {
    // Open in-app confirmation modal (never window.confirm which gets blocked in iframes)
    setQuotationToDelete(quotation);
  };

  const confirmDeleteQuotation = () => {
    if (!quotationToDelete) return;
    const targetId = quotationToDelete.id;
    const quotNum = quotationToDelete.quotationNo || targetId;
    setQuotations(prev => {
      const next = prev.filter(q => String(q.id) !== String(targetId));
      try {
        localStorage.setItem('upl_quotations', JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
    if (viewingQuotation && String(viewingQuotation.id) === String(targetId)) {
      setViewingQuotation(null);
    }
    if (editingQuotationId && String(editingQuotationId) === String(targetId)) {
      setEditingQuotationId(null);
    }
    setQuotationToDelete(null);
    setShareToast(`Quotation #${quotNum} deleted successfully`);
    setTimeout(() => setShareToast(null), 3000);
  };

  const handleShareQuotation = (quotation: any) => {
    const text = `Quotation #${quotation.quotationNo} from UrbanPro Packer & Logistics for ${quotation.partyName} (₹${quotation.grandTotal}): ${quotation.fromCity} to ${quotation.toCity}. Customer Care: 8093017400`;
    if (navigator.share) {
      navigator.share({
        title: `Quotation #${quotation.quotationNo} - UrbanPro Logistics`,
        text: text,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard?.writeText(text);
      setShareToast('Quotation details copied to clipboard!');
      setTimeout(() => setShareToast(null), 3000);
    }
  };

  // ----------------------------------------------------
  // Packing List Management State & Handlers
  // ----------------------------------------------------
  const initialPackingListForm: PackingListData = {
    id: 'pl-init-2',
    packingListNo: '2',
    packingListDate: new Date().toISOString().split('T')[0],
    partyName: '',
    mobileNo: '',
    quotationRef: '',
    fromCountry: 'India',
    fromState: 'N/A',
    fromCity: '',
    fromArea: '',
    fromPincode: '',
    fromFloor: 'Ground',
    toCountry: 'India',
    toState: 'N/A',
    toCity: '',
    toArea: '',
    toPincode: '',
    toFloor: 'Ground',
    items: [],
    status: 'Packed',
  };

  const [packingLists, setPackingLists] = useState<PackingListData[]>(() => {
    try {
      const saved = localStorage.getItem('upl_packing_lists');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(p => p.id !== 'pl-sample-1' && p.partyName !== 'Rajesh Kumar Mishra');
        }
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  const [packingListForm, setPackingListForm] = useState<PackingListData>({
    ...initialPackingListForm,
    packingListNo: '1',
  });
  const [currentPackingItem, setCurrentPackingItem] = useState<PackingListItem>({
    name: '',
    qty: '1',
    boxNo: '1',
    value: '',
    remark: '',
  });
  const [editingPackingListId, setEditingPackingListId] = useState<string | number | null>(null);
  const [viewingPackingList, setViewingPackingList] = useState<PackingListData | null>(null);
  const [packingListToDelete, setPackingListToDelete] = useState<PackingListData | null>(null);
  const [packingListSearchQuery, setPackingListSearchQuery] = useState('');
  const [showQuotationPickerForPacking, setShowQuotationPickerForPacking] = useState(false);

  // Sync Packing Lists to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('upl_packing_lists', JSON.stringify(packingLists));
    } catch (e) {
      console.error(e);
    }
  }, [packingLists]);

  const handleAddItemToPackingList = () => {
    if (!currentPackingItem.name.trim()) {
      alert('Please enter Item Name (सामान का नाम)');
      return;
    }
    const newItem: PackingListItem = {
      ...currentPackingItem,
      id: Date.now().toString(),
      qty: currentPackingItem.qty || '1',
      boxNo: currentPackingItem.boxNo || '1',
    };

    setPackingListForm(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));

    // Next Box number heuristic
    const currentBoxNum = parseInt(String(currentPackingItem.boxNo)) || 1;
    setCurrentPackingItem({
      name: '',
      qty: '1',
      boxNo: String(currentBoxNum),
      value: '',
      remark: '',
    });
  };

  const handleQuickAddPackingItem = (itemName: string) => {
    setCurrentPackingItem(prev => ({
      ...prev,
      name: itemName,
    }));
  };

  const handleRemoveItemFromPackingList = (indexToRemove: number) => {
    setPackingListForm(prev => ({
      ...prev,
      items: prev.items.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const handleImportQuotationToPacking = (quot: any) => {
    setPackingListForm(prev => ({
      ...prev,
      partyName: quot.partyName || prev.partyName,
      mobileNo: quot.mobileNo || prev.mobileNo,
      quotationRef: String(quot.quotationNo || quot.id),
      fromCountry: quot.fromCountry || 'India',
      fromState: quot.fromState || prev.fromState,
      fromCity: quot.fromCity || prev.fromCity,
      fromArea: quot.fromArea || prev.fromArea,
      fromPincode: quot.fromPincode || prev.fromPincode,
      fromFloor: quot.fromFloor || prev.fromFloor,
      toCountry: quot.toCountry || 'India',
      toState: quot.toState || prev.toState,
      toCity: quot.toCity || prev.toCity,
      toArea: quot.toArea || prev.toArea,
      toPincode: quot.toPincode || prev.toPincode,
      toFloor: quot.toFloor || prev.toFloor,
    }));
    setShowQuotationPickerForPacking(false);
    setShareToast(`Imported details from Quotation #${quot.quotationNo || quot.id}!`);
    setTimeout(() => setShareToast(null), 3000);
  };

  const handleImportSurveyToPacking = (surv: any) => {
    const surveyItemsMapped: PackingListItem[] = (surv.items || []).map((it: any, index: number) => ({
      id: String(Date.now() + index),
      name: it.name || '',
      qty: String(it.qty || '1'),
      boxNo: String(index + 1),
      value: String(it.value || ''),
      remark: it.remark || 'From survey list',
    })).filter((it: PackingListItem) => it.name.trim().length > 0);

    setPackingListForm(prev => ({
      ...prev,
      partyName: surv.partyName || prev.partyName,
      mobileNo: surv.mobileNo || prev.mobileNo,
      fromCity: surv.fromCity || prev.fromCity,
      fromArea: surv.fromArea || prev.fromArea,
      toCity: surv.toCity || prev.toCity,
      toArea: surv.toArea || prev.toArea,
      items: surveyItemsMapped.length > 0 ? surveyItemsMapped : prev.items,
    }));
    setShowQuotationPickerForPacking(false);
    setShareToast(`Imported items & details from Survey #${surv.surveyNo || surv.id}!`);
    setTimeout(() => setShareToast(null), 3000);
  };

  const handleSavePackingList = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!packingListForm.partyName.trim()) {
      alert('Please fill Party Name *');
      return;
    }

    const nextListNo = String(packingLists.length + 2);
    const updated: PackingListData = {
      ...packingListForm,
      id: editingPackingListId ? editingPackingListId : Date.now().toString(),
      packingListNo: packingListForm.packingListNo || nextListNo,
      totalItems: packingListForm.items.reduce((s, it) => s + (parseInt(String(it.qty)) || 1), 0),
      totalBoxes: new Set(packingListForm.items.map(it => String(it.boxNo || '').trim()).filter(Boolean)).size || 1,
      totalValue: packingListForm.items.reduce((s, it) => s + (parseFloat(String(it.value)) || 0), 0),
    };

    if (editingPackingListId) {
      setPackingLists(packingLists.map(pl => (String(pl.id) === String(editingPackingListId) ? updated : pl)));
      setShareToast(`Packing List #${updated.packingListNo} updated successfully!`);
    } else {
      setPackingLists([updated, ...packingLists]);
      setShareToast(`Packing List #${updated.packingListNo} saved successfully!`);
    }

    setTimeout(() => setShareToast(null), 3000);
    setPackingListForm({
      ...initialPackingListForm,
      packingListNo: String(packingLists.length + 2),
      items: [],
    });
    setEditingPackingListId(null);
    setAdminTab('list-packing');
  };

  const handleEditPackingList = (pl: PackingListData) => {
    setPackingListForm(pl);
    setEditingPackingListId(pl.id);
    setAdminTab('add-packing');
  };

  const handleDeletePackingList = (pl: PackingListData) => {
    setPackingListToDelete(pl);
  };

  const confirmDeletePackingList = () => {
    if (!packingListToDelete) return;
    const targetId = packingListToDelete.id;
    const plNum = packingListToDelete.packingListNo || targetId;
    setPackingLists(prev => prev.filter(pl => String(pl.id) !== String(targetId)));
    if (viewingPackingList && String(viewingPackingList.id) === String(targetId)) {
      setViewingPackingList(null);
    }
    if (editingPackingListId && String(editingPackingListId) === String(targetId)) {
      setEditingPackingListId(null);
    }
    setPackingListToDelete(null);
    setShareToast(`Packing List #${plNum} deleted successfully`);
    setTimeout(() => setShareToast(null), 3000);
  };

  // ----------------------------------------------------
  // Additional Logistics Modules State (Bilty, Car/Bike Condition, Invoicing, Vouchers)
  // ----------------------------------------------------
  const [bilties, setBilties] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('upl_bilties');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(b => b.id !== 'lr-1' && b.consignorName !== 'Jagamaya sarangi');
        }
      }
    } catch (e) { console.error(e); }
    return [];
  });

  useEffect(() => {
    try { localStorage.setItem('upl_bilties', JSON.stringify(bilties)); } catch (e) { console.error(e); }
  }, [bilties]);

  const [biltyForm, setBiltyForm] = useState({
    biltyNo: 'LR-101',
    biltyDate: new Date().toISOString().split('T')[0],
    consignorName: '',
    consignorMobile: '',
    consignorAddress: '',
    consigneeName: '',
    consigneeMobile: '',
    consigneeAddress: '',
    fromCity: '',
    toCity: '',
    truckNo: '',
    driverName: '',
    driverMobile: '',
    goodsDescription: '',
    declaredValue: '',
    freightCharges: '',
    advancePaid: '0',
    toPayAmount: '',
    gstPaidBy: 'Consignor'
  });

  const [editingBiltyId, setEditingBiltyId] = useState<string | null>(null);
  const [viewingBilty, setViewingBilty] = useState<any | null>(null);

  const handleSaveBilty = () => {
    if (!biltyForm.consignorName) {
      setShareToast('Please enter Consignor Name');
      setTimeout(() => setShareToast(null), 3000);
      return;
    }
    if (editingBiltyId) {
      setBilties(bilties.map(b => b.id === editingBiltyId ? { ...biltyForm, id: editingBiltyId } : b));
      setShareToast(`Bilty #${biltyForm.biltyNo} updated!`);
    } else {
      const newBilty = { ...biltyForm, id: `lr-${Date.now()}` };
      setBilties([newBilty, ...bilties]);
      setShareToast(`Bilty #${biltyForm.biltyNo} created!`);
    }
    setTimeout(() => setShareToast(null), 3000);
    setBiltyForm({
      biltyNo: `LR-${101 + bilties.length + 1}`,
      biltyDate: new Date().toISOString().split('T')[0],
      consignorName: '', consignorMobile: '', consignorAddress: '',
      consigneeName: '', consigneeMobile: '', consigneeAddress: '',
      fromCity: '', toCity: '', truckNo: '', driverName: '', driverMobile: '',
      goodsDescription: '', declaredValue: '',
      freightCharges: '', advancePaid: '0', toPayAmount: '', gstPaidBy: 'Consignor'
    });
    setEditingBiltyId(null);
    setAdminTab('list-bilty');
  };

  // Car Condition State
  const [carConditions, setCarConditions] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('upl_car_conditions');
      if (saved) return JSON.parse(saved);
    } catch (e) { console.error(e); }
    return [];
  });

  useEffect(() => {
    try { localStorage.setItem('upl_car_conditions', JSON.stringify(carConditions)); } catch (e) { console.error(e); }
  }, [carConditions]);

  const [carForm, setCarForm] = useState({
    reportNo: 'CAR-101',
    date: new Date().toISOString().split('T')[0],
    ownerName: '',
    mobileNo: '',
    carMakeModel: '',
    regNo: '',
    color: '',
    odometerKm: '',
    fromCity: '',
    toCity: '',
    toolKit: true,
    jack: true,
    wiperArms: true,
    mudFlap: true,
    floorRubberCarpet: true,
    fuelPetrolLtr: '',
    carCover: false,
    spareWheel: true,
    stereoMusicPlayer: false,
    batteryBrand: '',
    keyType: '',
    otherAccessories: '',
    remarks: ''
  });

  const [viewingCarCondition, setViewingCarCondition] = useState<any | null>(null);

  const handleSaveCarCondition = () => {
    if (!carForm.ownerName) {
      setShareToast('Please enter Owner/Client Name');
      setTimeout(() => setShareToast(null), 3000);
      return;
    }
    const record = { ...carForm, id: `car-${Date.now()}` };
    setCarConditions([record, ...carConditions]);
    setShareToast(`Car Condition Report #${carForm.reportNo} saved!`);
    setTimeout(() => setShareToast(null), 3000);
    setViewingCarCondition(record);
  };

  // Bike Condition State
  const [bikeConditions, setBikeConditions] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('upl_bike_conditions');
      if (saved) return JSON.parse(saved);
    } catch (e) { console.error(e); }
    return [];
  });

  useEffect(() => {
    try { localStorage.setItem('upl_bike_conditions', JSON.stringify(bikeConditions)); } catch (e) { console.error(e); }
  }, [bikeConditions]);

  const [bikeForm, setBikeForm] = useState({
    reportNo: 'BIKE-101',
    date: new Date().toISOString().split('T')[0],
    ownerName: '',
    mobileNo: '',
    bikeMakeModel: '',
    regNo: '',
    chassisNo: '',
    engineNo: '',
    color: '',
    fuelLevel: '',
    helmet: false,
    bothMirrors: true,
    toolKit: false,
    scratchesOrDents: '',
    remarks: ''
  });

  const [viewingBikeCondition, setViewingBikeCondition] = useState<any | null>(null);

  const handleSaveBikeCondition = () => {
    if (!bikeForm.ownerName) {
      setShareToast('Please enter Owner/Client Name');
      setTimeout(() => setShareToast(null), 3000);
      return;
    }
    const record = { ...bikeForm, id: `bike-${Date.now()}` };
    setBikeConditions([record, ...bikeConditions]);
    setShareToast(`Bike Condition Report #${bikeForm.reportNo} saved!`);
    setTimeout(() => setShareToast(null), 3000);
    setViewingBikeCondition(record);
  };

  // Tax Invoice / Bill State
  const [bills, setBills] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('upl_bills');
      if (saved) return JSON.parse(saved);
    } catch (e) { console.error(e); }
    return [];
  });

  const [billForm, setBillForm] = useState({
    billNo: 'INV-2026-01',
    billDate: new Date().toISOString().split('T')[0],
    partyName: '',
    mobileNo: '',
    gstin: '',
    fromCity: '',
    toCity: '',
    particulars: '',
    amount: '',
    gstPercent: '18',
    totalAmount: ''
  });

  const [viewingBill, setViewingBill] = useState<any | null>(null);

  const handleSaveBill = () => {
    if (!billForm.partyName) {
      setShareToast('Please enter Party Name for Invoice');
      setTimeout(() => setShareToast(null), 3000);
      return;
    }
    const amt = parseFloat(billForm.amount) || 0;
    const gstRate = parseFloat(billForm.gstPercent) || 0;
    const total = amt + (amt * gstRate / 100);
    const newBill = { ...billForm, totalAmount: String(total), id: `bill-${Date.now()}` };
    setBills([newBill, ...bills]);
    try { localStorage.setItem('upl_bills', JSON.stringify([newBill, ...bills])); } catch (e) { console.error(e); }
    setShareToast(`Tax Invoice #${billForm.billNo} generated!`);
    setTimeout(() => setShareToast(null), 3000);
    setViewingBill(newBill);
  };

  // Money Receipt State
  const [moneyReceipts, setMoneyReceipts] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('upl_money_receipts');
      if (saved) return JSON.parse(saved);
    } catch (e) { console.error(e); }
    return [];
  });

  const [receiptForm, setReceiptForm] = useState({
    receiptNo: 'MR-501',
    receiptDate: new Date().toISOString().split('T')[0],
    receivedFrom: '',
    mobileNo: '',
    amount: '',
    amountInWords: '',
    paymentMode: 'UPI / GPay / PhonePe',
    againstDocNo: '',
    remarks: ''
  });

  const [viewingReceipt, setViewingReceipt] = useState<any | null>(null);

  const handleSaveReceipt = () => {
    if (!receiptForm.receivedFrom) {
      setShareToast('Please enter Received From (Client Name)');
      setTimeout(() => setShareToast(null), 3000);
      return;
    }
    const newRec = { ...receiptForm, id: `mr-${Date.now()}` };
    setMoneyReceipts([newRec, ...moneyReceipts]);
    try { localStorage.setItem('upl_money_receipts', JSON.stringify([newRec, ...moneyReceipts])); } catch (e) { console.error(e); }
    setShareToast(`Money Receipt #${receiptForm.receiptNo} created!`);
    setTimeout(() => setShareToast(null), 3000);
    setViewingReceipt(newRec);
  };

  // Payment Voucher State
  const [vouchers, setVouchers] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('upl_vouchers');
      if (saved) return JSON.parse(saved);
    } catch (e) { console.error(e); }
    return [];
  });

  const [voucherForm, setVoucherForm] = useState({
    voucherNo: 'PV-101',
    voucherDate: new Date().toISOString().split('T')[0],
    paidTo: '',
    amount: '',
    debitHead: 'Labour & Loading Expense / Fuel',
    paymentMode: 'Cash',
    narration: ''
  });

  const [viewingVoucher, setViewingVoucher] = useState<any | null>(null);

  const handleSaveVoucher = () => {
    if (!voucherForm.paidTo) {
      setShareToast('Please enter Paid To');
      setTimeout(() => setShareToast(null), 3000);
      return;
    }
    const newV = { ...voucherForm, id: `pv-${Date.now()}` };
    setVouchers([newV, ...vouchers]);
    try { localStorage.setItem('upl_vouchers', JSON.stringify([newV, ...vouchers])); } catch (e) { console.error(e); }
    setShareToast(`Payment Voucher #${voucherForm.voucherNo} created!`);
    setTimeout(() => setShareToast(null), 3000);
    setViewingVoucher(newV);
  };

  const handleSharePackingList = (pl: any) => {
    const text = `📦 UrbanPro Logistics - Packing List #${pl.packingListNo}\nParty: ${pl.partyName}\nMobile: ${pl.mobileNo}\nFrom: ${pl.fromCity} -> To: ${pl.toCity}\nTotal Items: ${pl.items?.length || 0}`;
    if (navigator.share) {
      navigator.share({ title: `Packing List #${pl.packingListNo}`, text }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setShareToast('Packing List summary copied to clipboard!');
      setTimeout(() => setShareToast(null), 3000);
    }
  };

  // Company Profile Setup State
  const [companyProfile, setCompanyProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('upl_company_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed.logo || parsed.logo.includes('upl%20logistics') || parsed.logo.length < 30000) {
          parsed.logo = UPL_LOGO_BASE64;
        }
        if (!parsed.groupName || parsed.groupName.trim() === '') {
          parsed.groupName = 'M/s Prakash & Company India';
        }
        if (!parsed.bankName || parsed.bankName.trim() === '') {
          parsed.bankName = 'State Bank of India';
          parsed.accountNo = '30789330266';
          parsed.ifscCode = 'SBIN0009343';
          parsed.accountHolder = 'M/s Prakash & Company India';
          parsed.bankBranch = 'Dipka, Korba';
        }
        if (!parsed.addressLine1 || !parsed.addressLine1.includes('Dipka')) {
          parsed.addressLine1 = 'Regd. Office: M/s Prakash & Company India, Ward No. 3, Near Old SBI ATM, Dipka, Korba, CG – 495452';
        }
        if (!parsed.addressLine2 || !parsed.addressLine2.includes('Hanspal')) {
          parsed.addressLine2 = 'Main Operational Office: Plot No. 1491, Hanspal, Balianta Canal Road, Near Lenskart, Bhubaneswar, Odisha – 752101';
        }
        return parsed;
      }
    } catch (e) { console.error(e); }
    return {
      companyName: 'UrbanPro Packer & Logistics',
      groupName: 'M/s Prakash & Company India',
      gstin: '22CCQPS8419D1ZC',
      panNo: 'AKMPV0774C',
      regAddress: 'Ward No. 3, Near Old SBI ATM, Dipka, Korba, CG – 495452',
      addressLine1: 'Regd. Office: M/s Prakash & Company India, Ward No. 3, Near Old SBI ATM, Dipka, Korba, CG – 495452',
      addressLine2: 'Main Operational Office: Plot No. 1491, Hanspal, Balianta Canal Road, Near Lenskart, Bhubaneswar, Odisha – 752101',
      mobilePrimary: '8093017400',
      mobileSecondary: '8093017402',
      email: 'urbanpro403@gmail.com',
      bankName: 'State Bank of India',
      accountNo: '30789330266',
      ifscCode: 'SBIN0009343',
      accountHolder: 'M/s Prakash & Company India',
      bankBranch: 'Dipka, Korba',
      upiId: '8093017400@sbi',
      logo: UPL_LOGO_BASE64
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem('upl_company_profile', JSON.stringify(companyProfile));
    } catch (e) {
      console.error(e);
    }
  }, [companyProfile]);

  const activeAppLogo = companyProfile?.logo || UPL_LOGO_BASE64;

  const [signatureUrl, setSignatureUrl] = useState(() => {
    return localStorage.getItem('upl_company_signature') || '';
  });

  // ----------------------------------------------------
  // Unified Customer Directory & Cross-Form Smart Auto-Fill
  // ----------------------------------------------------
  const customerProfiles = useMemo(() => {
    const map = new Map<string, any>();
    
    // 1. From Surveys (highest priority)
    surveys.forEach(s => {
      const pName = (s.partyName || '').trim();
      const pPhone = (s.mobileNo || '').trim();
      if (pName || pPhone) {
        const key = (pName || pPhone).toLowerCase();
        if (!map.has(key)) {
          map.set(key, {
            partyName: s.partyName || '',
            mobileNo: s.mobileNo || '',
            email: s.email || '',
            fromCountry: s.fromCountry || 'India',
            fromState: s.fromState || 'Odisha',
            fromCity: s.fromCity || '',
            fromArea: s.fromArea || '',
            fromPinCode: s.fromPinCode || s.fromPincode || '',
            fromFloor: s.fromFloor || 'Ground',
            fromLift: s.fromLift || 'Not Required',
            toCountry: s.toCountry || 'India',
            toState: s.toState || 'Odisha',
            toCity: s.toCity || '',
            toArea: s.toArea || '',
            toPinCode: s.toPinCode || s.toPincode || '',
            toFloor: s.toFloor || 'Ground',
            toLift: s.toLift || 'Not Required',
            moveType: s.moveType || 'Household Goods',
            packingDate: s.packingDate || s.surveyDate || '',
            deliveryDate: s.dateOfDelivery || '',
            surveyNo: s.surveyNo,
            items: s.items || [],
            source: `Survey #${s.surveyNo}`
          });
        }
      }
    });

    // 2. From Quotations
    quotations.forEach(q => {
      const pName = (q.partyName || '').trim();
      const pPhone = (q.mobileNo || '').trim();
      if (pName || pPhone) {
        const key = (pName || pPhone).toLowerCase();
        if (!map.has(key)) {
          map.set(key, {
            partyName: q.partyName || '',
            mobileNo: q.mobileNo || '',
            email: q.email || '',
            fromCountry: q.fromCountry || 'India',
            fromState: q.fromState || 'Odisha',
            fromCity: q.fromCity || '',
            fromArea: q.fromArea || '',
            fromPinCode: q.fromPincode || '',
            fromFloor: q.fromFloor || 'Ground',
            fromLift: q.fromLift || 'Not Required',
            toCountry: q.toCountry || 'India',
            toState: q.toState || 'Odisha',
            toCity: q.toCity || '',
            toArea: q.toArea || '',
            toPinCode: q.toPincode || '',
            toFloor: q.toFloor || 'Ground',
            toLift: q.toLift || 'Not Required',
            moveType: q.moveType || 'Household Goods',
            packingDate: q.packingDate || '',
            deliveryDate: q.deliveryDate || '',
            quotationNo: q.quotationNo,
            items: [],
            source: `Quotation #${q.quotationNo}`
          });
        }
      }
    });

    // 3. From Packing Lists
    packingLists.forEach(pl => {
      const pName = (pl.partyName || '').trim();
      const pPhone = (pl.mobileNo || '').trim();
      if (pName || pPhone) {
        const key = (pName || pPhone).toLowerCase();
        if (!map.has(key)) {
          map.set(key, {
            partyName: pl.partyName || '',
            mobileNo: pl.mobileNo || '',
            email: '',
            fromCountry: pl.fromCountry || 'India',
            fromState: pl.fromState || 'Odisha',
            fromCity: pl.fromCity || '',
            fromArea: pl.fromArea || '',
            fromPinCode: pl.fromPincode || '',
            fromFloor: pl.fromFloor || 'Ground',
            fromLift: 'Not Required',
            toCountry: pl.toCountry || 'India',
            toState: pl.toState || 'Odisha',
            toCity: pl.toCity || '',
            toArea: pl.toArea || '',
            toPinCode: pl.toPincode || '',
            toFloor: pl.toFloor || 'Ground',
            toLift: 'Not Required',
            moveType: 'Household Goods',
            packingDate: pl.packingListDate || '',
            deliveryDate: '',
            packingListNo: pl.packingListNo,
            items: pl.items || [],
            source: `Packing List #${pl.packingListNo}`
          });
        }
      }
    });

    return Array.from(map.values());
  }, [surveys, quotations, packingLists]);

  const findCustomerProfile = (query: string) => {
    if (!query || !query.trim()) return null;
    const cleanStr = query.trim().toLowerCase();
    const cleanDigits = query.replace(/\D/g, '');

    return customerProfiles.find(c => {
      if (c.partyName && c.partyName.trim().toLowerCase() === cleanStr) return true;
      if (cleanDigits.length >= 8 && c.mobileNo && c.mobileNo.replace(/\D/g, '').includes(cleanDigits)) return true;
      return false;
    });
  };

  // Smart Survey form changes
  const handleSurveyNoInputChange = (val: string) => {
    const trimmed = (val || '').trim().toLowerCase();
    
    // Search for existing survey with this survey number
    const match = surveys.find(s => String(s.surveyNo || '').trim().toLowerCase() === trimmed);
    
    if (match && String(match.id) !== String(editingSurveyId)) {
      setSurveyForm({
        ...match,
        surveyNo: val,
      });
      setEditingSurveyId(match.id);
      setSurveyNoWarning(null);
      setShareToast(`✓ Existing Survey #${match.surveyNo} found! Auto-loaded details for "${match.partyName}"`);
      setTimeout(() => setShareToast(null), 3500);
    } else {
      setSurveyForm(prev => ({ ...prev, surveyNo: val }));
      if (surveyNoWarning) setSurveyNoWarning(null);
    }
  };

  const handleSurveyPartyNameChange = (val: string) => {
    setSurveyForm(prev => {
      const match = findCustomerProfile(val);
      if (match) {
        setShareToast(`✓ Auto-filled customer details for ${match.partyName}`);
        setTimeout(() => setShareToast(null), 3000);
        return {
          ...prev,
          partyName: val,
          mobileNo: match.mobileNo || prev.mobileNo,
          email: match.email || prev.email,
          fromCity: match.fromCity || prev.fromCity,
          fromArea: match.fromArea || prev.fromArea,
          fromPinCode: match.fromPinCode || prev.fromPinCode,
          fromFloor: match.fromFloor || prev.fromFloor,
          fromLift: match.fromLift || prev.fromLift,
          toCity: match.toCity || prev.toCity,
          toArea: match.toArea || prev.toArea,
          toPinCode: match.toPinCode || prev.toPinCode,
          toFloor: match.toFloor || prev.toFloor,
          toLift: match.toLift || prev.toLift,
          moveType: match.moveType || prev.moveType,
        };
      }
      return { ...prev, partyName: val };
    });
  };

  const handleSurveyMobileChange = (val: string) => {
    setSurveyForm(prev => {
      const cleanDigits = val.replace(/\D/g, '');
      if (cleanDigits.length >= 10) {
        const match = findCustomerProfile(val);
        if (match) {
          setShareToast(`✓ Auto-filled customer info for ${match.partyName}`);
          setTimeout(() => setShareToast(null), 3000);
          return {
            ...prev,
            mobileNo: val,
            partyName: match.partyName || prev.partyName,
            email: match.email || prev.email,
            fromCity: match.fromCity || prev.fromCity,
            fromArea: match.fromArea || prev.fromArea,
            fromPinCode: match.fromPinCode || prev.fromPinCode,
            toCity: match.toCity || prev.toCity,
            toArea: match.toArea || prev.toArea,
            toPinCode: match.toPinCode || prev.toPinCode,
            moveType: match.moveType || prev.moveType,
          };
        }
      }
      return { ...prev, mobileNo: val };
    });
  };

  // Smart Quotation form changes
  const handleQuotationPartyNameChange = (val: string) => {
    setQuotationForm(prev => {
      const match = findCustomerProfile(val);
      if (match) {
        setShareToast(`✓ Auto-filled quotation details for ${match.partyName}`);
        setTimeout(() => setShareToast(null), 3000);
        return {
          ...prev,
          partyName: val,
          mobileNo: match.mobileNo || prev.mobileNo,
          email: match.email || prev.email,
          packingDate: match.packingDate || prev.packingDate,
          deliveryDate: match.deliveryDate || prev.deliveryDate,
          moveType: match.moveType || prev.moveType,
          fromCountry: match.fromCountry || prev.fromCountry,
          fromState: match.fromState || prev.fromState,
          fromCity: match.fromCity || prev.fromCity,
          fromArea: match.fromArea || prev.fromArea,
          fromPincode: match.fromPinCode || match.fromPincode || prev.fromPincode,
          fromFloor: match.fromFloor || prev.fromFloor,
          fromLift: match.fromLift || prev.fromLift,
          toCountry: match.toCountry || prev.toCountry,
          toState: match.toState || prev.toState,
          toCity: match.toCity || prev.toCity,
          toArea: match.toArea || prev.toArea,
          toPincode: match.toPinCode || match.toPincode || prev.toPincode,
          toFloor: match.toFloor || prev.toFloor,
          toLift: match.toLift || prev.toLift,
        };
      }
      return { ...prev, partyName: val };
    });
  };

  const handleQuotationMobileChange = (val: string) => {
    setQuotationForm(prev => {
      const cleanDigits = val.replace(/\D/g, '');
      if (cleanDigits.length >= 10) {
        const match = findCustomerProfile(val);
        if (match) {
          setShareToast(`✓ Auto-filled party & route for ${match.partyName}`);
          setTimeout(() => setShareToast(null), 3000);
          return {
            ...prev,
            mobileNo: val,
            partyName: match.partyName || prev.partyName,
            email: match.email || prev.email,
            packingDate: match.packingDate || prev.packingDate,
            deliveryDate: match.deliveryDate || prev.deliveryDate,
            moveType: match.moveType || prev.moveType,
            fromCity: match.fromCity || prev.fromCity,
            fromArea: match.fromArea || prev.fromArea,
            fromPincode: match.fromPinCode || match.fromPincode || prev.fromPincode,
            toCity: match.toCity || prev.toCity,
            toArea: match.toArea || prev.toArea,
            toPincode: match.toPinCode || match.toPincode || prev.toPincode,
          };
        }
      }
      return { ...prev, mobileNo: val };
    });
  };

  // Smart Packing List form changes
  const handlePackingListPartyNameChange = (val: string) => {
    setPackingListForm(prev => {
      const match = findCustomerProfile(val);
      if (match) {
        let itemsToSet = prev.items;
        if ((!itemsToSet || itemsToSet.length === 0) && match.items && match.items.length > 0) {
          itemsToSet = match.items.map((it: any, idx: number) => ({
            id: `pli-${Date.now()}-${idx}`,
            name: it.name || 'Item',
            qty: it.qty || '1',
            boxNo: String(idx + 1),
            value: it.value || '0',
            remark: it.remark || 'Standard Packing'
          }));
        }
        setShareToast(`✓ Auto-filled packing list for ${match.partyName}`);
        setTimeout(() => setShareToast(null), 3000);
        return {
          ...prev,
          partyName: val,
          mobileNo: match.mobileNo || prev.mobileNo,
          fromCountry: match.fromCountry || prev.fromCountry,
          fromState: match.fromState || prev.fromState,
          fromCity: match.fromCity || prev.fromCity,
          fromArea: match.fromArea || prev.fromArea,
          fromPincode: match.fromPinCode || match.fromPincode || prev.fromPincode,
          fromFloor: match.fromFloor || prev.fromFloor,
          toCountry: match.toCountry || prev.toCountry,
          toState: match.toState || prev.toState,
          toCity: match.toCity || prev.toCity,
          toArea: match.toArea || prev.toArea,
          toPincode: match.toPinCode || match.toPincode || prev.toPincode,
          toFloor: match.toFloor || prev.toFloor,
          items: itemsToSet
        };
      }
      return { ...prev, partyName: val };
    });
  };

  const handlePackingListMobileChange = (val: string) => {
    setPackingListForm(prev => {
      const cleanDigits = val.replace(/\D/g, '');
      if (cleanDigits.length >= 10) {
        const match = findCustomerProfile(val);
        if (match) {
          setShareToast(`✓ Auto-filled name & route for ${match.partyName}`);
          setTimeout(() => setShareToast(null), 3000);
          return {
            ...prev,
            mobileNo: val,
            partyName: match.partyName || prev.partyName,
            fromCity: match.fromCity || prev.fromCity,
            fromArea: match.fromArea || prev.fromArea,
            fromPincode: match.fromPinCode || match.fromPincode || prev.fromPincode,
            toCity: match.toCity || prev.toCity,
            toArea: match.toArea || prev.toArea,
            toPincode: match.toPinCode || match.toPincode || prev.toPincode,
          };
        }
      }
      return { ...prev, mobileNo: val };
    });
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === ADMIN_PASSWORD) {
      setIsAdminAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Incorrect password');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Format the message for WhatsApp
    const finalItem = formData.item === 'Other' ? (formData.otherItem || 'Custom requirement') : formData.item;
    const emailText = formData.email ? `%0A*Email:* ${encodeURIComponent(formData.email)}` : '';
    const noteText = formData.message ? `%0A*Message:* ${encodeURIComponent(formData.message)}` : '';
    const message = `*New Quote Request from Website*%0A%0A*Name:* ${encodeURIComponent(formData.name)}%0A*Phone:* ${encodeURIComponent(formData.phone)}${emailText}%0A*Moving Date:* ${encodeURIComponent(formData.date)}%0A*Service Type:* ${encodeURIComponent(finalItem)}%0A*Moving From:* ${encodeURIComponent(formData.movingFrom)}%0A*Moving To:* ${encodeURIComponent(formData.movingTo)}${noteText}`;
    
    // Primary contact number without spaces or symbols
    const whatsappNumber = "918093017400";
    
    // Create the WhatsApp API URL
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;
    
    // Open WhatsApp in a new tab
    window.open(whatsappUrl, '_blank');
    
    // Clear the form
    setFormData({ name: '', phone: '', email: '', date: '', item: '', otherItem: '', movingFrom: '', movingTo: '', message: '' });
  };

  const toggleService = (index: number) => {
    if (expandedService === index) {
      setExpandedService(null);
    } else {
      setExpandedService(index);
    }
  };

  const itemCategories = [
    "Household Shifting",
    "Office & Corporate Relocation",
    "Commercial Shifting",
    "Vehicle Shifting (Car / Bike)",
    "Transportation (Truck / Trailer / 22 Feet)",
    "Packing Material Supply",
    "Labour Supply",
    "Other"
  ];

  const services = [
    { 
      category: 'Shifting Services',
      icon: Home, 
      title: 'Household Shifting', 
      desc: 'Safe and organized packing & moving solutions for Household Relocation.',
      details: [
        { 
          title: 'Complete Residential Shifting', 
          text: 'Comprehensive household relocation with multi-layer packing for furniture, appliances, kitchenware, and fragile items ensuring zero damage during transit.' 
        },
        { 
          title: 'Safe Packing & Unpacking', 
          text: 'Doorstep packing with high quality bubble wraps and boxes, followed by organized unloading and unpacking at your new home.' 
        }
      ]
    },
    { 
      category: 'Shifting Services',
      icon: Building2, 
      title: 'Office & Corporate Relocation', 
      desc: 'Professional relocation support for offices, companies and commercial establishments.',
      details: [
        { 
          title: 'Corporate Moving', 
          text: 'Systematic packing and moving of office desks, workstations, IT equipment, servers, filing cabinets, and conference room setups with minimum downtime.' 
        },
        { 
          title: 'Organized Execution', 
          text: 'Weekend and after-hours relocation options available to keep your business operations running without interruption.' 
        }
      ]
    },
    { 
      category: 'Shifting Services',
      icon: Store, 
      title: 'Commercial Shifting', 
      desc: 'Complete shifting solutions for shops, businesses and commercial establishments.',
      details: [
        { 
          title: 'Shop & Retail Relocation', 
          text: 'Fast, secure shifting of retail inventory, showcase fixtures, display units, machinery, and commercial stock.' 
        },
        { 
          title: 'Custom Logistics Plans', 
          text: 'Tailored transportation solutions for warehouses, local businesses, and commercial spaces of all sizes.' 
        }
      ]
    },
    { 
      category: 'Transportation Services',
      icon: Car, 
      title: 'Vehicle Shifting', 
      desc: 'Transportation support for moving vehicles (Cars, Bikes, Scooters) from one location to another.',
      details: [
        { 
          title: 'Car & Bike Relocation', 
          text: 'Safe and scratch-free vehicle shifting for two-wheelers, four-wheelers, and luxury cars with dedicated wheel stoppers and tie-down clamps.' 
        },
        { 
          title: 'All-India Transit Carriers', 
          text: 'Covered car carrier trailers and specialized open carriers with real-time transit tracking across all Indian states.' 
        }
      ]
    },
    { 
      category: 'Transportation Services',
      icon: Truck, 
      title: 'Transportation & Fleet Logistics', 
      desc: 'All types of commercial vehicles including Truck, Trailer, 22 Feet Container and Heavy Fleet for shifting.',
      details: [
        { 
          title: 'All Types of Vehicles Available', 
          text: 'Complete fleet range available: Closed Container Trucks, Open Body Trucks, 22 Feet Vehicles, 14ft/17ft/32ft Multi-Axle, and Heavy Trailers.' 
        },
        { 
          title: 'Domestic & Intercity Transit', 
          text: 'Full Truck Load (FTL) and Part Load (LTL) services connecting all major industrial hubs and residential sectors across India.' 
        }
      ]
    },
    { 
      category: 'Packing Material & Labour Supply',
      icon: Package, 
      title: 'Packing Material Supply', 
      desc: 'Premium packing materials available for household, office and commercial packing requirements.',
      details: [
        { 
          title: 'Materials Available', 
          text: 'Corrugated boxes & cartons, heavy-duty bubble wrap, stretch film, packing tape, thermocol, foam sheets, cushioning materials, and waterproof wrapping.' 
        },
        { 
          title: 'Bulk & Custom Orders', 
          text: 'Supplied directly to your doorstep for DIY packing or shifting projects as per your exact count requirement.' 
        }
      ]
    },
    { 
      category: 'Packing Material & Labour Supply',
      icon: HardHat, 
      title: 'Labour Supply', 
      desc: 'Skilled and Experienced Labour available for Packing, Loading, Unloading, Shifting & Related work.',
      details: [
        { 
          title: 'Trained Manpower', 
          text: 'Skilled and verified labourers for packing, heavy lifting, truck loading, unloading, shifting, and furniture assembling.' 
        },
        { 
          title: 'Flexible Support', 
          text: 'Whether you require only labour, only packing material, or both, we arrange tailored support according to your exact needs.' 
        }
      ]
    }
  ];

  const renderSharedModalsAndToasts = () => (
    <>
      {/* In-App Delete Survey Confirmation Modal */}
      {surveyToDelete && (
        <div 
          className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSurveyToDelete(null)}
        >
          <div 
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSurveyToDelete(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 text-center mb-1">
              Delete Survey #{surveyToDelete.surveyNo || surveyToDelete.id}
            </h3>
            <p className="text-sm text-slate-600 text-center mb-6">
              Are you sure you want to delete the survey record for <span className="font-semibold text-slate-800">{surveyToDelete.partyName || 'Customer'}</span>? This action cannot be undone.
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSurveyToDelete(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteSurvey}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm shadow-md transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" /> Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-App Delete Quotation Confirmation Modal */}
      {quotationToDelete && (
        <div 
          className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setQuotationToDelete(null)}
        >
          <div 
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setQuotationToDelete(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 text-center mb-1">
              Delete Quotation #{quotationToDelete.quotationNo || quotationToDelete.id}
            </h3>
            <p className="text-sm text-slate-600 text-center mb-6">
              Are you sure you want to delete quotation for <span className="font-semibold text-slate-800">{quotationToDelete.partyName || 'Customer'}</span>? This action cannot be undone.
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQuotationToDelete(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteQuotation}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm shadow-md transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" /> Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Survey PDF Preview Modal */}
      <SurveyPdfModal 
        survey={viewingSurvey} 
        onClose={() => setViewingSurvey(null)} 
        globalSignature={globalSignature}
        companyLogo={activeAppLogo}
        companyProfile={companyProfile}
      />

      {/* Quotation PDF Preview Modal */}
      <QuotationPdfModal 
        quotation={viewingQuotation} 
        onClose={() => setViewingQuotation(null)} 
        globalSignature={globalSignature}
        companyLogo={activeAppLogo}
        companyProfile={companyProfile}
      />

      {/* Packing List PDF Preview Modal */}
      <PackingListPdfModal
        packingList={viewingPackingList}
        onClose={() => setViewingPackingList(null)}
        globalSignature={globalSignature}
        companyLogo={activeAppLogo}
        companyProfile={companyProfile}
      />

      {/* In-App Delete Packing List Confirmation Modal */}
      {packingListToDelete && (
        <div 
          className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setPackingListToDelete(null)}
        >
          <div 
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPackingListToDelete(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 text-center mb-1">
              Delete Packing List #{packingListToDelete.packingListNo || packingListToDelete.id}
            </h3>
            <p className="text-sm text-slate-600 text-center mb-6">
              Are you sure you want to delete packing list for <span className="font-semibold text-slate-800">{packingListToDelete.partyName || 'Customer'}</span>? This action cannot be undone.
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setPackingListToDelete(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeletePackingList}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm shadow-md transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" /> Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import from Quotation / Survey Modal for Packing List */}
      {showQuotationPickerForPacking && (
        <div 
          className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setShowQuotationPickerForPacking(false)}
        >
          <div 
            className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 relative max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-slate-200 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-sky-100 text-[#0284c7] flex items-center justify-center">
                  <ClipboardList className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Import Details to Packing List</h3>
                  <p className="text-xs text-slate-500">Select a Quotation or Survey to auto-fill customer and relocation details</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowQuotationPickerForPacking(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-4 pr-1">
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>From Quotations</span>
                  <span className="text-[11px] font-normal text-slate-400">{quotations.length} available</span>
                </h4>
                {quotations.length === 0 ? (
                  <p className="text-xs text-slate-400 italic p-3 bg-slate-50 rounded-lg">No quotations saved yet.</p>
                ) : (
                  <div className="space-y-2">
                    {quotations.map((q) => (
                      <div 
                        key={q.id}
                        onClick={() => handleImportQuotationToPacking(q)}
                        className="p-3 border border-slate-200 hover:border-sky-500 hover:bg-sky-50/50 rounded-xl cursor-pointer transition-all flex items-center justify-between group"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-900 group-hover:text-[#0284c7]">
                              {q.partyName}
                            </span>
                            <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                              Quot #{q.quotationNo || q.id}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            {q.fromCity || 'Origin'} &rarr; {q.toCity || 'Destination'} • {q.mobileNo || 'No phone'}
                          </div>
                        </div>
                        <button 
                          type="button"
                          className="text-xs font-semibold text-white bg-[#0284c7] group-hover:bg-sky-700 px-3 py-1.5 rounded-lg shadow-xs"
                        >
                          Select
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-2">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>From Surveys (With Items)</span>
                  <span className="text-[11px] font-normal text-slate-400">{surveys.length} available</span>
                </h4>
                {surveys.length === 0 ? (
                  <p className="text-xs text-slate-400 italic p-3 bg-slate-50 rounded-lg">No surveys saved yet.</p>
                ) : (
                  <div className="space-y-2">
                    {surveys.map((s) => (
                      <div 
                        key={s.id}
                        onClick={() => handleImportSurveyToPacking(s)}
                        className="p-3 border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 rounded-xl cursor-pointer transition-all flex items-center justify-between group"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-900 group-hover:text-emerald-700">
                              {s.partyName}
                            </span>
                            <span className="text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-mono">
                              Survey #{s.surveyNo || s.id}
                            </span>
                            <span className="text-[11px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                              {s.items?.length || 0} items
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            {s.fromCity || 'Origin'} &rarr; {s.toCity || 'Destination'} • {s.mobileNo || 'No phone'}
                          </div>
                        </div>
                        <button 
                          type="button"
                          className="text-xs font-semibold text-white bg-emerald-600 group-hover:bg-emerald-700 px-3 py-1.5 rounded-lg shadow-xs"
                        >
                          Import All
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Toast Notification */}
      {shareToast && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-4 py-2.5 rounded-xl text-sm shadow-2xl z-[110] flex items-center gap-2.5 border border-slate-700 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium">{shareToast}</span>
        </div>
      )}
    </>
  );

  if (isAdminView) {
    if (!isAdminAuthenticated) {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
          <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full border border-slate-100">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-blue-900" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Admin Login</h2>
              <p className="text-slate-500 mt-2">Enter the owner password to access the dashboard.</p>
            </div>
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded border border-slate-300 focus:ring-2 focus:ring-blue-900 outline-none transition-all"
                  placeholder="Enter password"
                />
                {loginError && <p className="text-red-500 text-sm mt-1">{loginError}</p>}
              </div>
              <button type="submit" className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold py-3 rounded transition-colors">
                Login to Dashboard
              </button>
            </form>
            <div className="mt-6 text-center">
              <button onClick={() => setIsAdminView(false)} className="text-slate-500 hover:text-slate-700 text-sm">
                &larr; Back to Website
              </button>
            </div>
          </div>
        </div>
      );
    }

    const handleTabSelect = (tab: string) => {
      setAdminTab(tab);
      if (typeof window !== 'undefined' && window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    };

    return (
      <div className="h-screen bg-[#f4f7fb] flex flex-col overflow-hidden text-slate-800">
        {/* Top Header - UrbanPro Logistics Admin */}
        <header className="bg-[#1e293b] text-white px-3 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between z-20 shrink-0 shadow-md">
          <div className="flex items-center gap-2 sm:gap-3">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-slate-300 hover:text-white p-1.5 sm:p-2 rounded-lg hover:bg-slate-700/60 transition-colors cursor-pointer"
              title="Toggle Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-white px-2 sm:px-3 py-1 rounded-lg flex items-center gap-2 shadow-sm border border-slate-700/50">
                <img 
                  src={activeAppLogo || '/urbanpro%20logo.jpeg'} 
                  alt="UrbanPro Logistics" 
                  className="h-7 sm:h-8 w-auto object-contain rounded" 
                />
                <div className="flex flex-col">
                  <span className="font-bold text-xs sm:text-base tracking-tight leading-tight">
                    <span className="text-[#1e3a8a] font-black">Urban</span><span className="text-[#dc2626] font-black">Pro</span> <span className="text-[#1e3a8a] font-extrabold hidden xs:inline">Packers & Logistics</span>
                  </span>
                  <span className="text-[9px] sm:text-[10px] text-slate-500 font-semibold leading-none">Admin Portal</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button 
              onClick={() => setIsAdminView(false)}
              className="text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 sm:px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 border border-slate-700 shadow-xs cursor-pointer"
              title="View Public Website"
            >
              <Globe className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">View Website</span>
            </button>

            <button 
              onClick={() => {
                setIsAdminAuthenticated(false);
                setIsAdminView(false);
                setAdminPassword('');
                setAdminTab('dashboard');
              }}
              className="text-xs text-red-200 hover:text-white bg-red-950/40 hover:bg-red-900/60 border border-red-800/50 px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Mobile Backdrop Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-40 md:hidden animate-fadeIn" 
            onClick={() => setSidebarOpen(false)} 
          />
        )}

        <div className="flex flex-1 overflow-hidden relative">
          {/* Sidebar Drawer - UrbanPro Logistics Navigation */}
          <aside className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-[#0f172a] text-slate-300 flex flex-col justify-between h-full overflow-y-auto border-r border-slate-800 shadow-2xl transition-transform duration-300 ease-in-out md:static md:translate-x-0 md:w-64 md:shadow-none ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div>
              {/* Admin Portal Label & Mobile Close Button */}
              <div className="p-3 pb-2 border-b border-slate-800/80 flex items-center justify-between">
                <div className="bg-white px-3 py-2 rounded-xl flex items-center gap-2.5 shadow-sm flex-1 mr-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-xs shrink-0">
                    UP
                  </div>
                  <div>
                    <h2 className="font-bold text-sm leading-tight">
                      <span className="text-[#1e3a8a] font-black">Urban</span><span className="text-[#dc2626] font-black">Pro</span>
                    </h2>
                    <p className="text-[10px] text-[#1e3a8a] font-bold">Packers & Logistics</p>
                  </div>
                </div>

                <button 
                  onClick={() => setSidebarOpen(false)}
                  className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Close Menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Groups */}
              <div className="px-3 py-3 space-y-4">
                <div>
                  <div className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">HOME</div>
                  <button 
                    onClick={() => setAdminTab('dashboard')}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm transition-colors cursor-pointer ${adminTab === 'dashboard' ? 'bg-blue-600 text-white font-semibold shadow-sm' : 'text-slate-300 hover:bg-slate-800 hover:text-white font-medium'}`}
                  >
                    <LayoutDashboard className="w-4 h-4 text-sky-400" />
                    <span>Dashboard</span>
                  </button>
                </div>

                <div>
                  <div className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>SURVEYS</span>
                    <span className="bg-slate-800 text-slate-400 text-[10px] px-1.5 py-0.5 rounded-full">{surveys.length}</span>
                  </div>
                  
                  <div className="space-y-1">
                    <button 
                      onClick={() => {
                        setAdminTab('add-survey');
                        setEditingSurveyId(null);
                        setSurveyForm(initialSurveyForm);
                      }}
                      className={`w-full flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-sm transition-colors cursor-pointer ${adminTab === 'add-survey' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
                    >
                      <PlusCircle className="w-4 h-4 text-emerald-400" />
                      <span>Add Survey List</span>
                    </button>

                    <button 
                      onClick={() => setAdminTab('list-survey')}
                      className={`w-full flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-sm transition-colors cursor-pointer ${adminTab === 'list-survey' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
                    >
                      <ClipboardList className="w-4 h-4 text-sky-400" />
                      <span>All Survey List</span>
                    </button>
                  </div>
                </div>

                <div>
                  <div className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">QUOTATIONS</div>
                  <div className="space-y-1">
                    <button 
                      onClick={() => setAdminTab('add-quotation')}
                      className={`w-full flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-sm transition-colors cursor-pointer ${adminTab === 'add-quotation' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
                    >
                      <PlusCircle className="w-4 h-4 text-amber-400" />
                      <span>Add Quotation</span>
                    </button>

                    <button 
                      onClick={() => setAdminTab('list-quotation')}
                      className={`w-full flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-sm transition-colors cursor-pointer ${adminTab === 'list-quotation' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
                    >
                      <FileText className="w-4 h-4 text-amber-400" />
                      <span>All Quotations</span>
                    </button>
                  </div>
                </div>

                <div>
                  <div className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">PACKING LISTS</div>
                  <div className="space-y-1">
                    <button 
                      onClick={() => setAdminTab('add-packing')}
                      className={`w-full flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-sm transition-colors cursor-pointer ${adminTab === 'add-packing' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
                    >
                      <PlusCircle className="w-4 h-4 text-purple-400" />
                      <span>Add Packing List</span>
                    </button>

                    <button 
                      onClick={() => setAdminTab('list-packing')}
                      className={`w-full flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-sm transition-colors cursor-pointer ${adminTab === 'list-packing' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
                    >
                      <PackageCheck className="w-4 h-4 text-purple-400" />
                      <span>All Packing Lists</span>
                    </button>
                  </div>
                </div>

                {/* Bilty L.R. */}
                <div>
                  <div className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>BILTY (L.R.)</span>
                    <span className="bg-slate-800 text-emerald-400 text-[10px] px-1.5 py-0.5 rounded-full">{bilties.length}</span>
                  </div>
                  <div className="space-y-1">
                    <button 
                      onClick={() => { setAdminTab('add-bilty'); setEditingBiltyId(null); }}
                      className={`w-full flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-sm transition-colors cursor-pointer ${adminTab === 'add-bilty' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
                    >
                      <PlusCircle className="w-4 h-4 text-emerald-400" />
                      <span>Add Bilty (L.R.)</span>
                    </button>
                    <button 
                      onClick={() => setAdminTab('list-bilty')}
                      className={`w-full flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-sm transition-colors cursor-pointer ${adminTab === 'list-bilty' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
                    >
                      <Truck className="w-4 h-4 text-emerald-400" />
                      <span>All Bilties (L.R.)</span>
                    </button>
                  </div>
                </div>

                {/* Car Condition */}
                <div>
                  <div className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>CAR CONDITION</span>
                    <span className="bg-slate-800 text-sky-400 text-[10px] px-1.5 py-0.5 rounded-full">{carConditions.length}</span>
                  </div>
                  <div className="space-y-1">
                    <button 
                      onClick={() => { setAdminTab('car-condition'); setCarConditionViewMode('form'); }}
                      className={`w-full flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-sm transition-colors cursor-pointer ${adminTab === 'car-condition' && carConditionViewMode === 'form' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
                    >
                      <PlusCircle className="w-4 h-4 text-sky-400" />
                      <span>Add Car Condition</span>
                    </button>
                    <button 
                      onClick={() => { setAdminTab('car-condition'); setCarConditionViewMode('list'); }}
                      className={`w-full flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-sm transition-colors cursor-pointer ${adminTab === 'car-condition' && carConditionViewMode === 'list' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
                    >
                      <Car className="w-4 h-4 text-sky-400" />
                      <span>All Car Conditions</span>
                    </button>
                  </div>
                </div>

                {/* Bike Condition */}
                <div>
                  <div className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>BIKE CONDITION</span>
                    <span className="bg-slate-800 text-indigo-400 text-[10px] px-1.5 py-0.5 rounded-full">{bikeConditions.length}</span>
                  </div>
                  <div className="space-y-1">
                    <button 
                      onClick={() => { setAdminTab('bike-condition'); setBikeConditionViewMode('form'); }}
                      className={`w-full flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-sm transition-colors cursor-pointer ${adminTab === 'bike-condition' && bikeConditionViewMode === 'form' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
                    >
                      <PlusCircle className="w-4 h-4 text-indigo-400" />
                      <span>Add Bike Condition</span>
                    </button>
                    <button 
                      onClick={() => { setAdminTab('bike-condition'); setBikeConditionViewMode('list'); }}
                      className={`w-full flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-sm transition-colors cursor-pointer ${adminTab === 'bike-condition' && bikeConditionViewMode === 'list' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
                    >
                      <Bike className="w-4 h-4 text-indigo-400" />
                      <span>All Bike Conditions</span>
                    </button>
                  </div>
                </div>

                {/* Billing & Receipts */}
                <div>
                  <div className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">BILLING & RECEIPTS</div>
                  <div className="space-y-1">
                    <button 
                      onClick={() => setAdminTab('bill')}
                      className={`w-full flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-sm transition-colors cursor-pointer ${adminTab === 'bill' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
                    >
                      <FileText className="w-4 h-4 text-amber-400" />
                      <span>Bill / Tax Invoice</span>
                    </button>
                    <button 
                      onClick={() => setAdminTab('money-receipt')}
                      className={`w-full flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-sm transition-colors cursor-pointer ${adminTab === 'money-receipt' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
                    >
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Money Receipt</span>
                    </button>
                    <button 
                      onClick={() => setAdminTab('payment-voucher')}
                      className={`w-full flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-sm transition-colors cursor-pointer ${adminTab === 'payment-voucher' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
                    >
                      <Clock className="w-4 h-4 text-purple-400" />
                      <span>Payment Voucher</span>
                    </button>
                  </div>
                </div>

                {/* Setup Section */}
                <div>
                  <div className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">SETUP</div>
                  <div className="space-y-1">
                    <button 
                      onClick={() => setAdminTab('signature')}
                      className={`w-full flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-sm transition-colors cursor-pointer ${adminTab === 'signature' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
                    >
                      <CheckCircle2 className="w-4 h-4 text-teal-400" />
                      <span>Signature</span>
                    </button>
                    <button 
                      onClick={() => setAdminTab('company-profile')}
                      className={`w-full flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-sm transition-colors cursor-pointer ${adminTab === 'company-profile' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
                    >
                      <Building2 className="w-4 h-4 text-amber-400" />
                      <span>Company Profile</span>
                    </button>
                  </div>
                </div>

                {/* Settings Section */}
                <div>
                  <div className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">SETTINGS</div>
                  <div className="space-y-1">
                    <button 
                      onClick={() => setAdminTab('settings')}
                      className={`w-full flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-sm transition-colors cursor-pointer ${adminTab === 'settings' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
                    >
                      <Home className="w-4 h-4 text-slate-400" />
                      <span>Settings</span>
                    </button>
                    <button 
                      onClick={() => setAdminTab('contact-us')}
                      className={`w-full flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-sm transition-colors cursor-pointer ${adminTab === 'contact-us' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
                    >
                      <Phone className="w-4 h-4 text-emerald-400" />
                      <span>Contact Us</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Bottom */}
            <div className="p-4 border-t border-slate-800 bg-[#0b1120]">
              <div className="text-xs text-slate-400">
                <div className="font-semibold text-slate-200">UrbanPro Logistics</div>
                <div className="text-[11px]">Bhubaneswar, Odisha</div>
                <div className="text-[11px] text-slate-500 mt-1">Contact: 8093017400</div>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 bg-[#f4f7fb] overflow-y-auto p-3 sm:p-6 lg:p-8 pb-24 md:pb-8 relative">
            {/* HTML Datalists for Universal Autocomplete Across Forms */}
            <datalist id="upl-customer-parties-datalist">
              {customerProfiles.map((c, i) => (
                <option key={`dl-p-${i}`} value={c.partyName}>
                  {c.mobileNo ? `${c.mobileNo} • ${c.source}` : c.source}
                </option>
              ))}
            </datalist>

            <datalist id="upl-customer-mobiles-datalist">
              {customerProfiles.filter(c => c.mobileNo).map((c, i) => (
                <option key={`dl-m-${i}`} value={c.mobileNo}>
                  {c.partyName} ({c.source})
                </option>
              ))}
            </datalist>

            <datalist id="upl-all-surveys-datalist">
              {surveys.map((s, i) => (
                <option key={`dl-s-${i}`} value={s.surveyNo}>
                  Survey #{s.surveyNo} — {s.partyName} ({s.fromCity || 'Origin'} → {s.toCity || 'Dest'})
                </option>
              ))}
            </datalist>

            <datalist id="upl-indian-states-datalist">
              {INDIAN_STATES.filter(st => st !== 'N/A' && st !== 'Other').map((st, i) => (
                <option key={`dl-state-${i}`} value={st} />
              ))}
            </datalist>

            <div className="max-w-4xl mx-auto">
              {adminTab === 'dashboard' && (
                <div className="space-y-6">
                  {/* Top Welcome Banner */}
                  <div className="bg-gradient-to-r from-blue-900 via-blue-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg border border-blue-800">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-yellow-400 text-blue-950 rounded-2xl flex items-center justify-center font-black text-xl shadow-md shrink-0">
                          UP
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-yellow-400 uppercase tracking-widest bg-yellow-400/10 px-2.5 py-0.5 rounded-full border border-yellow-400/30">
                              M/s Prakash & Company India Group
                            </span>
                          </div>
                          <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1">
                            <span className="text-sky-300 font-black">Urban</span><span className="text-red-400 font-black">Pro</span> <span className="text-sky-200 font-bold">Packers & Logistics</span> Portal
                          </h1>
                          <p className="text-blue-200 text-xs sm:text-sm mt-1">
                            Pack Smart & Move Safe • Admin Management & Documentation Suite
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button 
                          onClick={() => { setAdminTab('add-survey'); setEditingSurveyId(null); setSurveyForm(initialSurveyForm); }}
                          className="flex-1 sm:flex-initial bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <PlusCircle className="w-4 h-4" />
                          <span>New Survey</span>
                        </button>
                        <button 
                          onClick={() => { setAdminTab('add-quotation'); setEditingQuotationId(null); setQuotationForm(initialQuotationForm); }}
                          className="flex-1 sm:flex-initial bg-yellow-400 hover:bg-yellow-500 text-blue-950 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <PlusCircle className="w-4 h-4" />
                          <span>New Quotation</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 3 Metric Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    {/* Surveys Card */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">SURVEYS</span>
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                          <ClipboardList className="w-5 h-5" />
                        </div>
                      </div>
                      <div className="text-3xl font-black text-slate-800">{surveys.length}</div>
                      <p className="text-xs text-slate-500 mt-1 mb-4">Total recorded surveys & inventory lists</p>
                      <div className="flex gap-2 pt-3 border-t border-slate-100">
                        <button 
                          onClick={() => { setAdminTab('add-survey'); setEditingSurveyId(null); setSurveyForm(initialSurveyForm); }}
                          className="flex-1 text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 py-1.5 rounded-lg transition-colors cursor-pointer text-center"
                        >
                          + Add Survey
                        </button>
                        <button 
                          onClick={() => setAdminTab('list-survey')}
                          className="flex-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 py-1.5 rounded-lg transition-colors cursor-pointer text-center"
                        >
                          View All ({surveys.length})
                        </button>
                      </div>
                    </div>

                    {/* Quotations Card */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">QUOTATIONS</span>
                        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                          <FileText className="w-5 h-5" />
                        </div>
                      </div>
                      <div className="text-3xl font-black text-slate-800">{quotations.length}</div>
                      <p className="text-xs text-slate-500 mt-1 mb-4">Official estimates & client proposals</p>
                      <div className="flex gap-2 pt-3 border-t border-slate-100">
                        <button 
                          onClick={() => { setAdminTab('add-quotation'); setEditingQuotationId(null); setQuotationForm(initialQuotationForm); }}
                          className="flex-1 text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-700 py-1.5 rounded-lg transition-colors cursor-pointer text-center"
                        >
                          + Add Quote
                        </button>
                        <button 
                          onClick={() => setAdminTab('list-quotation')}
                          className="flex-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 py-1.5 rounded-lg transition-colors cursor-pointer text-center"
                        >
                          View All ({quotations.length})
                        </button>
                      </div>
                    </div>

                    {/* Packing Lists Card */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">PACKING LISTS</span>
                        <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                          <PackageCheck className="w-5 h-5" />
                        </div>
                      </div>
                      <div className="text-3xl font-black text-slate-800">{packingLists.length}</div>
                      <p className="text-xs text-slate-500 mt-1 mb-4">Carton itemization & transit manifests</p>
                      <div className="flex gap-2 pt-3 border-t border-slate-100">
                        <button 
                          onClick={() => { setAdminTab('add-packing'); setEditingPackingListId(null); setPackingListForm(initialPackingListForm); }}
                          className="flex-1 text-xs font-semibold bg-purple-50 hover:bg-purple-100 text-purple-700 py-1.5 rounded-lg transition-colors cursor-pointer text-center"
                        >
                          + Add List
                        </button>
                        <button 
                          onClick={() => setAdminTab('list-packing')}
                          className="flex-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 py-1.5 rounded-lg transition-colors cursor-pointer text-center"
                        >
                          View All ({packingLists.length})
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Recent Surveys & Quotations Overview */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Surveys */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                          <ClipboardList className="w-4 h-4 text-emerald-600" />
                          <span>Recent Surveys</span>
                        </h3>
                        <button 
                          onClick={() => setAdminTab('list-survey')}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
                        >
                          View All &rarr;
                        </button>
                      </div>

                      {surveys.length === 0 ? (
                        <div className="text-center py-8 text-slate-400 text-xs">
                          No surveys recorded yet. Click below to add one.
                          <div className="mt-3">
                            <button 
                              onClick={() => { setAdminTab('add-survey'); setEditingSurveyId(null); setSurveyForm(initialSurveyForm); }}
                              className="text-xs font-semibold text-emerald-600 hover:underline cursor-pointer"
                            >
                              + Create first survey
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="divide-y divide-slate-100">
                          {surveys.slice(0, 4).map((s) => (
                            <div key={s.id} className="py-3 flex items-center justify-between gap-3">
                              <div>
                                <div className="font-semibold text-slate-800 text-xs sm:text-sm">
                                  {s.partyName || 'Unnamed Customer'}
                                </div>
                                <div className="text-[11px] text-slate-500">
                                  {s.fromCity || 'Origin'} &rarr; {s.toCity || 'Destination'} • {s.mobileNo || 'No phone'}
                                </div>
                              </div>
                              <button 
                                onClick={() => setViewingSurvey(s)}
                                className="text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>PDF</span>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Recent Quotations */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-amber-600" />
                          <span>Recent Quotations</span>
                        </h3>
                        <button 
                          onClick={() => setAdminTab('list-quotation')}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
                        >
                          View All &rarr;
                        </button>
                      </div>

                      {quotations.length === 0 ? (
                        <div className="text-center py-8 text-slate-400 text-xs">
                          No quotations recorded yet. Click below to add one.
                          <div className="mt-3">
                            <button 
                              onClick={() => { setAdminTab('add-quotation'); setEditingQuotationId(null); setQuotationForm(initialQuotationForm); }}
                              className="text-xs font-semibold text-amber-600 hover:underline cursor-pointer"
                            >
                              + Create first quotation
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="divide-y divide-slate-100">
                          {quotations.slice(0, 4).map((q) => (
                            <div key={q.id} className="py-3 flex items-center justify-between gap-3">
                              <div>
                                <div className="font-semibold text-slate-800 text-xs sm:text-sm">
                                  {q.partyName || 'Unnamed Customer'}
                                </div>
                                <div className="text-[11px] text-slate-500">
                                  {q.fromCity || 'Origin'} &rarr; {q.toCity || 'Destination'} • ₹{q.grandTotal || '0'}
                                </div>
                              </div>
                              <button 
                                onClick={() => setViewingQuotation(q)}
                                className="text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-700 px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>PDF</span>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Company Quick Details Reference Card */}
                  <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                      <div>
                        <h4 className="font-bold text-white text-sm">UrbanPro Packer & Logistics</h4>
                        <p className="text-xs text-slate-400">Official Company Profile & Banking Details for Client Billing</p>
                      </div>
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-3 py-1 rounded-full">
                        GSTIN: 22CCQPS8419D1ZC
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs text-slate-300">
                      <div>
                        <span className="font-semibold text-yellow-400 block mb-1">MAIN OPERATIONAL OFFICE</span>
                        Plot No. 1481, Hanspal, Balianta Canal Road, Bhubaneswar, Odisha – 752101<br />
                        <span className="text-slate-400">Office: 8093017401</span>
                      </div>
                      <div>
                        <span className="font-semibold text-yellow-400 block mb-1">REGISTERED OFFICE</span>
                        M/s Prakash & Company India, Ward No. 3, Near Old SBI ATM, Dipka, Korba, CG – 495452<br />
                        <span className="text-slate-400">Mobile: 8093017402</span>
                      </div>
                      <div>
                        <span className="font-semibold text-yellow-400 block mb-1">BANK ACCOUNT (SBI)</span>
                        A/C: 30789330266<br />
                        IFSC: SBIN0009343<br />
                        Bank: State Bank of India
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {adminTab === 'add-survey' && (
                <div className="pb-16">
                  <div className="space-y-6">
                    {/* Unique Survey No Warning Banner if duplicate */}
                    {surveyNoWarning && (
                      <div className="bg-red-50 border-2 border-red-300 text-red-800 px-4 py-3 rounded-2xl text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                          <span className="font-semibold">{surveyNoWarning}</span>
                        </div>
                        <button 
                          type="button"
                          onClick={() => {
                            const next = generateNextSurveyNo(surveys);
                            setSurveyForm({ ...surveyForm, surveyNo: next });
                            setSurveyNoWarning(null);
                          }}
                          className="bg-red-600 hover:bg-red-700 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs shadow-xs cursor-pointer shrink-0 transition-colors"
                        >
                          Use Unique #{generateNextSurveyNo(surveys)}
                        </button>
                      </div>
                    )}

                    {/* Survey Details Section */}
                    <div className="border border-slate-200 border-l-4 border-l-[#22c55e] rounded-2xl p-6 pt-8 relative bg-white shadow-xs">
                      <span className="absolute -top-3.5 left-4 bg-[#22c55e] text-white px-4 py-1 rounded-md text-xs font-semibold shadow-xs">
                        Survey Details
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border border-slate-300 rounded-xl p-2 px-3 focus-within:border-emerald-500 transition-all bg-white">
                          <div className="flex items-center justify-between mb-0.5">
                            <label className="block text-[11px] text-slate-500 font-medium">Survey No. (Unique)</label>
                            {(() => {
                              const trimmed = String(surveyForm.surveyNo || '').trim().toLowerCase();
                              if (!trimmed) return null;
                              const isDup = surveys.some(
                                s => String(s.id) !== String(editingSurveyId) && 
                                     String(s.surveyNo || '').trim().toLowerCase() === trimmed
                              );
                              if (isDup) {
                                return (
                                  <span className="text-[10px] font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                                    ⚠️ Already Taken
                                  </span>
                                );
                              }
                              return (
                                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                                  ✓ Unique Number
                                </span>
                              );
                            })()}
                          </div>
                          <div className="flex items-center gap-2">
                            <input 
                              type="text" 
                              list="upl-all-surveys-datalist"
                              className="w-full outline-none text-slate-800 text-sm bg-transparent font-medium" 
                              value={surveyForm.surveyNo} 
                              onChange={e => handleSurveyNoInputChange(e.target.value)} 
                              placeholder="e.g. 1042"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const next = generateNextSurveyNo(surveys);
                                setSurveyForm({ ...surveyForm, surveyNo: next });
                                if (surveyNoWarning) setSurveyNoWarning(null);
                              }}
                              className="text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-lg shrink-0 cursor-pointer transition-colors"
                              title="Auto-generate next unique number"
                            >
                              Auto Next
                            </button>
                          </div>
                        </div>
                        <div className="border border-slate-300 rounded-xl p-2 px-3 focus-within:border-emerald-500 transition-all bg-white relative">
                          <label className="block text-[11px] text-slate-500 font-medium mb-0.5">Survey Date</label>
                          <input 
                            type="date" 
                            className="w-full outline-none text-slate-800 text-sm bg-transparent appearance-none font-medium" 
                            value={surveyForm.surveyDate} 
                            onChange={e => setSurveyForm({...surveyForm, surveyDate: e.target.value})} 
                          />
                        </div>
                        <div className="border border-slate-300 rounded-xl p-2 px-3 focus-within:border-emerald-500 transition-all bg-white relative">
                          <div className="flex items-center justify-between mb-0.5">
                            <label className="block text-[11px] text-slate-500 font-medium">Party Name * (Auto-Completes)</label>
                            {customerProfiles.some(c => c.partyName && c.partyName.toLowerCase() === (surveyForm.partyName || '').trim().toLowerCase()) && (
                              <span className="text-[10px] font-bold text-teal-600 bg-teal-50 border border-teal-200 px-1.5 py-0.2 rounded-full">
                                ✓ Synced Profile
                              </span>
                            )}
                          </div>
                          <input 
                            type="text" 
                            list="upl-customer-parties-datalist"
                            placeholder="e.g. Rahul Sharma"
                            className="w-full outline-none text-slate-800 text-sm bg-transparent font-medium" 
                            value={surveyForm.partyName} 
                            onChange={e => handleSurveyPartyNameChange(e.target.value)} 
                          />
                        </div>
                        <div className="border border-slate-300 rounded-xl p-2 px-3 focus-within:border-emerald-500 transition-all bg-white relative">
                          <div className="flex items-center justify-between mb-0.5">
                            <label className="block text-[11px] text-slate-500 font-medium">Client Mobile No. (Auto-Completes)</label>
                            {customerProfiles.some(c => c.mobileNo && c.mobileNo.replace(/\D/g, '') === (surveyForm.mobileNo || '').replace(/\D/g, '') && c.mobileNo.length >= 8) && (
                              <span className="text-[10px] font-bold text-teal-600 bg-teal-50 border border-teal-200 px-1.5 py-0.2 rounded-full">
                                ✓ Recognized Contact
                              </span>
                            )}
                          </div>
                          <input 
                            type="tel" 
                            list="upl-customer-mobiles-datalist"
                            placeholder="e.g. 8093017400"
                            className="w-full outline-none text-slate-800 text-sm bg-transparent font-medium" 
                            value={surveyForm.mobileNo} 
                            onChange={e => handleSurveyMobileChange(e.target.value)} 
                          />
                        </div>
                      </div>

                      {/* Quick-Pick Existing Clients Carousel */}
                      {customerProfiles.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-slate-100">
                          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 mb-2">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                            <span>Quick Pick Customer Profile (Auto-fills phone, email & route):</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                            {customerProfiles.slice(0, 8).map((cp, idx) => (
                              <button
                                key={`chip-${idx}`}
                                type="button"
                                onClick={() => handleSurveyPartyNameChange(cp.partyName)}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 border border-slate-200 text-slate-700 text-xs rounded-lg transition-colors cursor-pointer font-medium"
                              >
                                <span>{cp.partyName}</span>
                                {cp.mobileNo && <span className="text-[10px] text-slate-500 font-mono">({cp.mobileNo})</span>}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Relocate From Section */}
                    <div className="border border-slate-200 border-l-4 border-l-slate-500 rounded-2xl p-6 pt-8 relative bg-white shadow-xs">
                      <span className="absolute -top-3.5 left-4 bg-slate-500 text-white px-4 py-1 rounded-md text-xs font-semibold shadow-xs">
                        Relocate From
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border border-slate-300 rounded-xl p-2 px-3 focus-within:border-slate-600 transition-all bg-white">
                          <label className="block text-[11px] text-slate-500 font-medium mb-0.5">Country</label>
                          <input 
                            type="text" 
                            className="w-full outline-none text-slate-800 text-sm bg-transparent font-medium" 
                            value={surveyForm.fromCountry} 
                            onChange={e => setSurveyForm({...surveyForm, fromCountry: e.target.value})} 
                          />
                        </div>
                        <div className="border border-slate-300 rounded-xl p-2 px-3 focus-within:border-slate-600 transition-all bg-white relative">
                          <label className="block text-[11px] text-slate-500 font-medium mb-0.5">State</label>
                          <select 
                            className="w-full outline-none text-slate-800 text-sm bg-transparent appearance-none cursor-pointer font-medium" 
                            value={surveyForm.fromState} 
                            onChange={e => setSurveyForm({...surveyForm, fromState: e.target.value})}
                          >
                            <option value="">Select State</option>
                            {INDIAN_STATES.map((st, idx) => (
                              <option key={`surv-fst-${idx}`} value={st}>{st}</option>
                            ))}
                          </select>
                        </div>
                        <div className="border border-slate-300 rounded-xl p-2 px-3 focus-within:border-slate-600 transition-all bg-white">
                          <label className="block text-[11px] text-slate-500 font-medium mb-0.5">City</label>
                          <input 
                            type="text" 
                            className="w-full outline-none text-slate-800 text-sm bg-transparent font-medium" 
                            value={surveyForm.fromCity} 
                            onChange={e => setSurveyForm({...surveyForm, fromCity: e.target.value})} 
                          />
                        </div>
                        <div className="border border-slate-300 rounded-xl p-2 px-3 focus-within:border-slate-600 transition-all bg-white">
                          <label className="block text-[11px] text-slate-500 font-medium mb-0.5">Area</label>
                          <input 
                            type="text" 
                            className="w-full outline-none text-slate-800 text-sm bg-transparent font-medium" 
                            value={surveyForm.fromArea} 
                            onChange={e => setSurveyForm({...surveyForm, fromArea: e.target.value})} 
                          />
                        </div>
                        <div className="border border-slate-300 rounded-xl p-2 px-3 focus-within:border-slate-600 transition-all bg-white">
                          <label className="block text-[11px] text-slate-500 font-medium mb-0.5">Pin Code</label>
                          <input 
                            type="text" 
                            className="w-full outline-none text-slate-800 text-sm bg-transparent font-medium" 
                            value={surveyForm.fromPinCode} 
                            onChange={e => setSurveyForm({...surveyForm, fromPinCode: e.target.value})} 
                          />
                        </div>
                        <div className="border border-slate-300 rounded-xl p-2 px-3 focus-within:border-slate-600 transition-all bg-white relative">
                          <label className="block text-[11px] text-slate-500 font-medium mb-0.5">From Floor</label>
                          <select 
                            className="w-full outline-none text-slate-800 text-sm bg-transparent appearance-none cursor-pointer font-medium" 
                            value={surveyForm.fromFloor} 
                            onChange={e => setSurveyForm({...surveyForm, fromFloor: e.target.value})}
                          >
                            <option>Ground</option>
                            <option>Basement</option>
                            <option>1st Floor</option>
                            <option>2nd Floor</option>
                            <option>3rd Floor</option>
                            <option>4th Floor</option>
                            <option>5th Floor</option>
                            <option>Above 5th Floor</option>
                          </select>
                        </div>
                        <div className="border border-slate-300 rounded-xl p-2 px-3 focus-within:border-slate-600 transition-all bg-white relative">
                          <label className="block text-[11px] text-slate-500 font-medium mb-0.5">Lift Available</label>
                          <select 
                            className="w-full outline-none text-slate-800 text-sm bg-transparent appearance-none cursor-pointer font-medium" 
                            value={surveyForm.fromLift} 
                            onChange={e => setSurveyForm({...surveyForm, fromLift: e.target.value})}
                          >
                            <option>Not Required</option>
                            <option>Yes</option>
                            <option>No</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Relocate To Section */}
                    <div className="border border-slate-200 border-l-4 border-l-amber-400 rounded-2xl p-6 pt-8 relative bg-white shadow-xs">
                      <span className="absolute -top-3.5 left-4 bg-amber-400 text-white px-4 py-1 rounded-md text-xs font-semibold shadow-xs">
                        Relocate To
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border border-slate-300 rounded-xl p-2 px-3 focus-within:border-amber-500 transition-all bg-white">
                          <label className="block text-[11px] text-slate-500 font-medium mb-0.5">Country</label>
                          <input 
                            type="text" 
                            className="w-full outline-none text-slate-800 text-sm bg-transparent font-medium" 
                            value={surveyForm.toCountry} 
                            onChange={e => setSurveyForm({...surveyForm, toCountry: e.target.value})} 
                          />
                        </div>
                        <div className="border border-slate-300 rounded-xl p-2 px-3 focus-within:border-amber-500 transition-all bg-white relative">
                          <label className="block text-[11px] text-slate-500 font-medium mb-0.5">State</label>
                          <select 
                            className="w-full outline-none text-slate-800 text-sm bg-transparent appearance-none cursor-pointer font-medium" 
                            value={surveyForm.toState} 
                            onChange={e => setSurveyForm({...surveyForm, toState: e.target.value})}
                          >
                            <option value="">Select State</option>
                            {INDIAN_STATES.map((st, idx) => (
                              <option key={`surv-tst-${idx}`} value={st}>{st}</option>
                            ))}
                          </select>
                        </div>
                        <div className="border border-slate-300 rounded-xl p-2 px-3 focus-within:border-amber-500 transition-all bg-white">
                          <label className="block text-[11px] text-slate-500 font-medium mb-0.5">City</label>
                          <input 
                            type="text" 
                            className="w-full outline-none text-slate-800 text-sm bg-transparent font-medium" 
                            value={surveyForm.toCity} 
                            onChange={e => setSurveyForm({...surveyForm, toCity: e.target.value})} 
                          />
                        </div>
                        <div className="border border-slate-300 rounded-xl p-2 px-3 focus-within:border-amber-500 transition-all bg-white">
                          <label className="block text-[11px] text-slate-500 font-medium mb-0.5">Area</label>
                          <input 
                            type="text" 
                            className="w-full outline-none text-slate-800 text-sm bg-transparent font-medium" 
                            value={surveyForm.toArea} 
                            onChange={e => setSurveyForm({...surveyForm, toArea: e.target.value})} 
                          />
                        </div>
                        <div className="border border-slate-300 rounded-xl p-2 px-3 focus-within:border-amber-500 transition-all bg-white">
                          <label className="block text-[11px] text-slate-500 font-medium mb-0.5">Pin Code</label>
                          <input 
                            type="text" 
                            className="w-full outline-none text-slate-800 text-sm bg-transparent font-medium" 
                            value={surveyForm.toPinCode} 
                            onChange={e => setSurveyForm({...surveyForm, toPinCode: e.target.value})} 
                          />
                        </div>
                        <div className="border border-slate-300 rounded-xl p-2 px-3 focus-within:border-amber-500 transition-all bg-white relative">
                          <label className="block text-[11px] text-slate-500 font-medium mb-0.5">To Floor</label>
                          <select 
                            className="w-full outline-none text-slate-800 text-sm bg-transparent appearance-none cursor-pointer font-medium" 
                            value={surveyForm.toFloor} 
                            onChange={e => setSurveyForm({...surveyForm, toFloor: e.target.value})}
                          >
                            <option>Ground</option>
                            <option>Basement</option>
                            <option>1st Floor</option>
                            <option>2nd Floor</option>
                            <option>3rd Floor</option>
                            <option>4th Floor</option>
                            <option>5th Floor</option>
                            <option>Above 5th Floor</option>
                          </select>
                        </div>
                        <div className="border border-slate-300 rounded-xl p-2 px-3 focus-within:border-amber-500 transition-all bg-white relative">
                          <label className="block text-[11px] text-slate-500 font-medium mb-0.5">Lift Available</label>
                          <select 
                            className="w-full outline-none text-slate-800 text-sm bg-transparent appearance-none cursor-pointer font-medium" 
                            value={surveyForm.toLift} 
                            onChange={e => setSurveyForm({...surveyForm, toLift: e.target.value})}
                          >
                            <option>Not Required</option>
                            <option>Yes</option>
                            <option>No</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Item Details Card - Matching image.png */}
                    <div className="border border-slate-200 border-l-4 border-l-[#0088cc] rounded-2xl p-6 pt-8 relative bg-white shadow-xs">
                      <span className="absolute -top-3.5 left-4 bg-[#0088cc] text-white px-4 py-1 rounded-md text-xs font-semibold shadow-xs">
                        Item Details
                      </span>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border border-slate-300 rounded-xl p-3 focus-within:border-sky-500 transition-all bg-white">
                          <input 
                            type="text" 
                            placeholder="Item Name (सामान का नाम)" 
                            className="w-full outline-none text-slate-800 text-sm bg-transparent placeholder-slate-400 font-medium" 
                            value={currentItem.name} 
                            onChange={e => setCurrentItem({...currentItem, name: e.target.value})} 
                            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addItemToSurvey(); } }}
                          />
                        </div>

                        <div className="border border-slate-300 rounded-xl p-2 px-3 focus-within:border-sky-500 transition-all bg-white">
                          <label className="block text-[11px] text-slate-500 font-medium leading-none mb-1">Quantity (संख्या)</label>
                          <input 
                            type="number" 
                            min="1" 
                            placeholder="Quantity (संख्या)" 
                            className="w-full outline-none text-slate-800 text-sm bg-transparent font-medium" 
                            value={currentItem.qty} 
                            onChange={e => setCurrentItem({...currentItem, qty: e.target.value})} 
                          />
                        </div>

                        <div className="border border-slate-300 rounded-xl p-3 focus-within:border-sky-500 transition-all bg-white">
                          <input 
                            type="text" 
                            placeholder="Value (कीमत)" 
                            className="w-full outline-none text-slate-800 text-sm bg-transparent placeholder-slate-400 font-medium" 
                            value={currentItem.value} 
                            onChange={e => setCurrentItem({...currentItem, value: e.target.value})} 
                          />
                        </div>

                        <div className="border border-slate-300 rounded-xl p-3 focus-within:border-sky-500 transition-all bg-white">
                          <input 
                            type="text" 
                            placeholder="Remark" 
                            className="w-full outline-none text-slate-800 text-sm bg-transparent placeholder-slate-400 font-medium" 
                            value={currentItem.remark} 
                            onChange={e => setCurrentItem({...currentItem, remark: e.target.value})} 
                          />
                        </div>
                      </div>

                      <div className="mt-5 flex justify-center">
                        <button 
                          type="button" 
                          onClick={addItemToSurvey}
                          className="border border-[#0088cc] text-[#0088cc] hover:bg-sky-50 px-6 py-2 rounded-full font-medium text-sm flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                        >
                          <Plus className="w-4 h-4" /> Add
                        </button>
                      </div>
                    </div>

                    {/* Added Items Cards matching image.png */}
                    {surveyForm.items.length > 0 && (
                      <div className="space-y-3 mt-6">
                        {surveyForm.items.map((item, idx) => {
                          const itemNumber = surveyForm.items.length - idx;
                          return (
                            <div key={idx} className="bg-white rounded-xl border border-slate-200 p-4 px-5 flex items-center justify-between shadow-xs hover:border-slate-300 transition-colors">
                              <div className="space-y-0.5 text-left">
                                <div className="text-slate-900 font-bold text-sm">
                                  {itemNumber}) Item Name: <span className="font-bold text-slate-900">{item.name}</span>
                                </div>
                                <div className="text-xs text-slate-700">
                                  Quantity: <span className="font-semibold text-slate-900">{item.qty || '1'}</span>, Value: <span className="font-semibold text-slate-900">{item.value || '0'}</span>
                                </div>
                                <div className="text-xs text-slate-500">
                                  Remark: {item.remark || ''}
                                </div>
                              </div>
                              <button 
                                type="button"
                                onClick={() => removeItemFromSurvey(idx)} 
                                className="bg-[#f87171] hover:bg-red-500 text-white rounded-xl p-2.5 transition-colors shadow-xs shrink-0 cursor-pointer"
                                title="Delete item"
                              >
                                <Trash2 className="w-5 h-5 text-white" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}

                  </div>

                  {/* Save Button */}
                  <div className="mt-8 text-center">
                    <button 
                      type="button"
                      onClick={handleSaveSurvey} 
                      className="bg-[#0088cc] hover:bg-sky-600 text-white px-10 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm cursor-pointer"
                    >
                      {editingSurveyId ? 'Update' : 'Save'}
                    </button>
                  </div>
                </div>
              )}

              {/* All Survey List Tab */}
              {adminTab === 'list-survey' && (
                <div className="pb-16">
                  <div className="flex justify-between items-center mb-6 bg-white p-4 px-6 rounded-2xl shadow-xs border border-slate-200">
                    <div>
                      <h1 className="text-xl font-bold text-slate-800">All Survey Lists</h1>
                      <p className="text-xs text-slate-500 mt-0.5">Manage and view created survey quotations and printable lists.</p>
                    </div>
                    <button 
                      onClick={() => { setAdminTab('add-survey'); setEditingSurveyId(null); setSurveyForm(initialSurveyForm); }} 
                      className="bg-[#0088cc] hover:bg-sky-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-xs flex items-center gap-1.5"
                    >
                      <PlusCircle className="w-4 h-4" /> Add Survey List
                    </button>
                  </div>

                  {surveys.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-12 text-center">
                      <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <h3 className="text-lg font-bold text-slate-700">No Surveys Created Yet</h3>
                      <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">Click "Add Survey List" to create your first survey and generate the official PDF.</p>
                      <button 
                        onClick={() => { setAdminTab('add-survey'); setEditingSurveyId(null); setSurveyForm(initialSurveyForm); }} 
                        className="mt-4 bg-[#0088cc] hover:bg-sky-600 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        Create New Survey
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6 flex justify-center flex-col items-center">
                      {surveys.map((survey) => (
                        <div key={survey.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden w-full max-w-3xl">
                          {/* Card Header (Tags) */}
                          <div className="flex justify-between items-start">
                            <div className="bg-[#ff9933] text-white px-4 py-1.5 rounded-br-lg text-xs sm:text-sm font-semibold shadow-xs">
                              {survey.surveyDate || 'N/A'}
                            </div>
                            <div className="bg-[#1e293b] text-white px-4 py-1.5 rounded-bl-lg text-xs sm:text-sm font-semibold shadow-xs">
                              SURVEY No. - #{survey.surveyNo || survey.id}
                            </div>
                          </div>

                          {/* Card Body */}
                          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Left Column */}
                            <div className="space-y-6">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-[#1e293b] flex items-center justify-center text-white shrink-0 shadow-xs">
                                  <User className="w-4 h-4" />
                                </div>
                                <span className="text-blue-600 font-semibold text-base">{survey.partyName || 'Unnamed Party'}</span>
                              </div>

                              <div className="relative pl-4 space-y-6 before:absolute before:left-3.5 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-300">
                                <div className="relative flex items-start gap-3">
                                  <div className="absolute -left-[27px] top-0 w-6 h-6 rounded-full bg-[#1e293b] flex items-center justify-center text-white ring-4 ring-white z-10 shadow-xs">
                                    <MapPin className="w-3.5 h-3.5" />
                                  </div>
                                  <div className="pl-2">
                                    <p className="text-[11px] text-slate-500 uppercase font-semibold mb-0.5">From</p>
                                    <p className="font-medium text-slate-800 text-sm">{survey.fromCity || survey.fromArea || 'N/A'}</p>
                                  </div>
                                </div>
                                
                                <div className="relative flex items-start gap-3">
                                  <div className="absolute -left-[27px] top-0 w-6 h-6 rounded-full bg-[#1e293b] flex items-center justify-center text-white ring-4 ring-white z-10 shadow-xs">
                                    <MapPin className="w-3.5 h-3.5" />
                                  </div>
                                  <div className="pl-2">
                                    <p className="text-[11px] text-slate-500 uppercase font-semibold mb-0.5">To</p>
                                    <p className="font-medium text-slate-800 text-sm min-h-[20px]">{survey.toCity || survey.toArea || 'N/A'}</p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-6 pt-1">
                              <div className="flex items-start gap-3">
                                <div className="w-9 h-9 rounded-full bg-[#1e293b] flex items-center justify-center text-white shrink-0 shadow-xs">
                                  <Box className="w-4 h-4" />
                                </div>
                                <div>
                                  <p className="text-[11px] text-slate-500 uppercase font-semibold mb-0.5">Total Items</p>
                                  <p className="font-bold text-slate-800 text-sm">{survey.items?.length || 0} Item(s)</p>
                                </div>
                              </div>

                              <div className="flex items-start gap-3">
                                <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-xs">
                                  <Phone className="w-4 h-4" />
                                </div>
                                <div>
                                  <p className="text-[11px] text-slate-500 uppercase font-semibold mb-0.5">Click to call</p>
                                  <a href={`tel:${survey.mobileNo}`} className="font-semibold text-blue-600 text-sm hover:underline">
                                    {survey.mobileNo || 'No Mobile'}
                                  </a>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Card Footer Actions */}
                          <div className="border-t border-slate-100 p-4 flex flex-wrap justify-center items-center gap-4 sm:gap-6 bg-slate-50/70">
                            {/* Make Quotation */}
                            <button 
                              onClick={() => handleCreateQuotationFromSurvey(survey)} 
                              className="flex flex-col items-center gap-1.5 group cursor-pointer"
                              title="Generate Quotation with this survey details"
                            >
                              <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white shadow-xs group-hover:bg-emerald-700 transition-colors">
                                <FileText className="w-4 h-4" />
                              </div>
                              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide">+ Quotation</span>
                            </button>

                            {/* Make Packing List */}
                            <button 
                              onClick={() => handleCreatePackingListFromSurvey(survey)} 
                              className="flex flex-col items-center gap-1.5 group cursor-pointer"
                              title="Generate Packing List with surveyed items"
                            >
                              <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center text-white shadow-xs group-hover:bg-teal-700 transition-colors">
                                <PackageCheck className="w-4 h-4" />
                              </div>
                              <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wide">+ Packing List</span>
                            </button>

                            <button 
                              onClick={() => setViewingSurvey(survey)} 
                              className="flex flex-col items-center gap-1.5 group cursor-pointer"
                              title="View & Download Survey PDF"
                            >
                              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-xs group-hover:bg-blue-700 transition-colors">
                                <Download className="w-4 h-4" />
                              </div>
                              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wide">PDF / Download</span>
                            </button>
                            
                            <button 
                              onClick={() => handleShareSurvey(survey)} 
                              className="flex flex-col items-center gap-1.5 group cursor-pointer"
                              title="Share Survey"
                            >
                              <div className="w-10 h-10 rounded-full border-2 border-emerald-400 bg-white flex items-center justify-center text-emerald-500 shadow-xs group-hover:bg-emerald-50 transition-colors">
                                <Share2 className="w-4 h-4" />
                              </div>
                              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide">Share</span>
                            </button>
                            
                            <button 
                              onClick={() => handleEditSurvey(survey)} 
                              className="flex flex-col items-center gap-1.5 group cursor-pointer"
                              title="Edit Survey"
                            >
                              <div className="w-10 h-10 rounded-full border-2 border-cyan-400 bg-white flex items-center justify-center text-cyan-500 shadow-xs group-hover:bg-cyan-50 transition-colors">
                                <Edit className="w-4 h-4" />
                              </div>
                              <span className="text-[10px] font-bold text-cyan-600 uppercase tracking-wide">Edit</span>
                            </button>
                            
                            <button 
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteSurvey(survey);
                              }} 
                              className="flex flex-col items-center gap-1.5 group cursor-pointer"
                              title="Delete Survey"
                            >
                              <div className="w-10 h-10 rounded-full border-2 border-red-300 bg-white flex items-center justify-center text-red-500 shadow-xs group-hover:bg-red-50 transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </div>
                              <span className="text-[10px] font-bold text-red-500 uppercase tracking-wide">Delete</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

{adminTab === 'add-quotation' && (
                <div className="max-w-5xl mx-auto pb-12">
                  <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                    <div>
                      <h1 className="text-xl font-bold text-slate-800">
                        {editingQuotationId ? `Edit Quotation #${quotationForm.quotationNo}` : 'Add Quotation'}
                      </h1>
                      <p className="text-xs text-slate-500 mt-0.5">Generate customized moving quotation with itemized freight & tax breakdown</p>
                    </div>
                    <button onClick={() => setAdminTab('list-quotation')} className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm cursor-pointer">
                      All Quotations
                    </button>
                  </div>

                  <div className="space-y-8">
                    {/* Auto-Fill from Survey Banner & Selector */}
                    <div className="bg-linear-to-r from-emerald-50 via-teal-50 to-blue-50 border-2 border-emerald-300 rounded-2xl p-5 shadow-xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-emerald-200/70">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                              Auto-Fill from Survey Record
                              <span className="text-[10px] bg-emerald-600 text-white px-2.5 py-0.5 rounded-full uppercase tracking-wider font-semibold">
                                Instant Sync
                              </span>
                            </h4>
                            <p className="text-xs text-slate-600 mt-0.5">
                              Select or type any Survey No. to auto-fill Party Name, Phone, Email, Origin & Destination address details automatically.
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="pt-3 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                        <div className="sm:col-span-7">
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">Choose Existing Survey:</label>
                          <select 
                            className="w-full bg-white border border-emerald-300 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-xs"
                            value={selectedSurveyForQuotationAutoFill}
                            onChange={(e) => {
                              const val = e.target.value;
                              setSelectedSurveyForQuotationAutoFill(val);
                              if (val) applySurveyToQuotation(val);
                            }}
                          >
                            <option value="">-- Select Survey to Load Client & Route --</option>
                            {surveys.map((s) => (
                              <option key={s.id} value={s.surveyNo || s.id}>
                                Survey #{s.surveyNo} — {s.partyName} ({s.fromCity || 'From'} → {s.toCity || 'To'})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="sm:col-span-5 flex gap-2 items-end">
                          <div className="grow">
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Or Enter Survey No:</label>
                            <input 
                              type="text" 
                              placeholder="e.g. 1001 or 1042"
                              className="w-full bg-white border border-emerald-300 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                              value={selectedSurveyForQuotationAutoFill}
                              onChange={(e) => setSelectedSurveyForQuotationAutoFill(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  applySurveyToQuotation(selectedSurveyForQuotationAutoFill);
                                }
                              }}
                            />
                          </div>
                          <button 
                            type="button"
                            onClick={() => applySurveyToQuotation(selectedSurveyForQuotationAutoFill)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm px-4 py-2 rounded-xl transition-colors cursor-pointer shrink-0 shadow-xs flex items-center gap-1.5 h-[38px]"
                          >
                            <Check className="w-4 h-4" />
                            <span>Auto-Fill</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Quotation Details Section */}
                    <div className="border-2 border-green-400 rounded-xl p-6 pt-8 relative bg-white shadow-sm">
                      <span className="absolute -top-3.5 left-4 bg-green-400 text-white px-4 py-1 rounded-md text-sm font-medium shadow-sm">Quot. Details</span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border border-slate-300 rounded-lg p-2 focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500 transition-all bg-white">
                          <label className="block text-[11px] text-slate-500 font-medium mb-0.5">Quot No. *</label>
                          <input 
                            type="text" 
                            value={quotationForm.quotationNo}
                            onChange={(e) => setQuotationForm({ ...quotationForm, quotationNo: e.target.value })}
                            className="w-full outline-none text-slate-800 text-sm bg-transparent" 
                          />
                        </div>
                        <div className="border border-slate-300 rounded-lg p-2 focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500 transition-all bg-white relative">
                          <label className="block text-[11px] text-slate-500 font-medium mb-0.5">Quotation Date *</label>
                          <input 
                            type="date" 
                            value={quotationForm.quotationDate}
                            onChange={(e) => setQuotationForm({ ...quotationForm, quotationDate: e.target.value })}
                            className="w-full outline-none text-slate-800 text-sm bg-transparent appearance-none" 
                          />
                        </div>
                        <div className="border border-slate-300 rounded-lg p-2 focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500 transition-all bg-white relative">
                          <div className="flex items-center justify-between mb-0.5">
                            <label className="block text-[11px] text-slate-500 font-medium">Party Name * (Auto-Completes)</label>
                            {customerProfiles.some(c => c.partyName && c.partyName.toLowerCase() === (quotationForm.partyName || '').trim().toLowerCase()) && (
                              <span className="text-[10px] font-bold text-teal-600 bg-teal-50 border border-teal-200 px-1.5 py-0.2 rounded-full">
                                ✓ Synced Profile
                              </span>
                            )}
                          </div>
                          <input 
                            type="text" 
                            list="upl-customer-parties-datalist"
                            value={quotationForm.partyName}
                            onChange={(e) => handleQuotationPartyNameChange(e.target.value)}
                            placeholder="Enter Customer Name"
                            className="w-full outline-none text-slate-800 text-sm bg-transparent" 
                          />
                        </div>
                        <div className="border border-slate-300 rounded-lg p-2 focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500 transition-all bg-white relative">
                          <div className="flex items-center justify-between mb-0.5">
                            <label className="block text-[11px] text-slate-500 font-medium">Mobile No. (Auto-Completes)</label>
                            {customerProfiles.some(c => c.mobileNo && c.mobileNo.replace(/\D/g, '') === (quotationForm.mobileNo || '').replace(/\D/g, '') && c.mobileNo.length >= 8) && (
                              <span className="text-[10px] font-bold text-teal-600 bg-teal-50 border border-teal-200 px-1.5 py-0.2 rounded-full">
                                ✓ Recognized Contact
                              </span>
                            )}
                          </div>
                          <input 
                            type="tel" 
                            list="upl-customer-mobiles-datalist"
                            value={quotationForm.mobileNo}
                            onChange={(e) => handleQuotationMobileChange(e.target.value)}
                            placeholder="Enter 10-digit mobile number"
                            className="w-full outline-none text-slate-800 text-sm bg-transparent" 
                          />
                        </div>
                        <div className="border border-slate-300 rounded-lg p-2 focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500 transition-all bg-white">
                          <label className="block text-[11px] text-slate-500 font-medium mb-0.5">Email Address</label>
                          <input 
                            type="email" 
                            value={quotationForm.email}
                            onChange={(e) => setQuotationForm({ ...quotationForm, email: e.target.value })}
                            placeholder="Enter email address"
                            className="w-full outline-none text-slate-800 text-sm bg-transparent" 
                          />
                        </div>
                        <div className="border border-slate-300 rounded-lg p-2 focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500 transition-all bg-white relative">
                          <label className="block text-[11px] text-slate-500 font-medium mb-0.5">Packing Date</label>
                          <input 
                            type="date" 
                            value={quotationForm.packingDate}
                            onChange={(e) => setQuotationForm({ ...quotationForm, packingDate: e.target.value })}
                            className="w-full outline-none text-slate-800 text-sm bg-transparent appearance-none" 
                          />
                        </div>
                        <div className="border border-slate-300 rounded-lg p-2 focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500 transition-all bg-white relative">
                          <label className="block text-[11px] text-slate-500 font-medium mb-0.5">Date of Delivery</label>
                          <input 
                            type="date" 
                            value={quotationForm.deliveryDate}
                            onChange={(e) => setQuotationForm({ ...quotationForm, deliveryDate: e.target.value })}
                            className="w-full outline-none text-slate-800 text-sm bg-transparent appearance-none" 
                          />
                        </div>
                      </div>

                      {/* Quick-Pick Existing Clients Carousel for Quotation */}
                      {customerProfiles.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-slate-100">
                          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 mb-2">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                            <span>Quick Pick Customer Profile (Auto-fills phone, email & route into Quotation):</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                            {customerProfiles.slice(0, 8).map((cp, idx) => (
                              <button
                                key={`chip-q-${idx}`}
                                type="button"
                                onClick={() => handleQuotationPartyNameChange(cp.partyName)}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 border border-slate-200 text-slate-700 text-xs rounded-lg transition-colors cursor-pointer font-medium"
                              >
                                <span>{cp.partyName}</span>
                                {cp.mobileNo && <span className="text-[10px] text-slate-500 font-mono">({cp.mobileNo})</span>}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Packing Details Section */}
                    <div className="border-2 border-blue-500 rounded-xl p-6 pt-8 relative bg-white shadow-sm">
                      <span className="absolute -top-3.5 left-4 bg-blue-500 text-white px-4 py-1 rounded-md text-sm font-medium shadow-sm">Packing Details</span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                        {[
                          "Full Load", "International Shifting", "Part Load", "Vehicle Shifting",
                          "Local Shifting", "Household Goods Shifting", "Domestic Shifting", "Commercial Goods Shifting"
                        ].map((mType) => {
                          const isSelected = quotationForm.moveType.includes(mType);
                          return (
                            <label 
                              key={mType} 
                              onClick={() => {
                                const current = quotationForm.moveType;
                                if (isSelected) {
                                  setQuotationForm({ ...quotationForm, moveType: current.replace(`${mType}, `, '').replace(mType, '') });
                                } else {
                                  setQuotationForm({ ...quotationForm, moveType: current ? `${current} ${mType},` : `${mType},` });
                                }
                              }}
                              className="flex items-center gap-3 cursor-pointer group"
                            >
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'border-sky-500 bg-sky-500 text-white' : 'border-sky-300 group-hover:border-sky-500'}`}>
                                {isSelected && <div className="w-2 h-2 rounded-full bg-white"></div>}
                              </div>
                              <span className={`text-sm ${isSelected ? 'text-sky-900 font-semibold' : 'text-slate-800'}`}>{mType}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {/* Relocate From */}
                    <div className="border-2 border-slate-400 rounded-xl p-6 pt-8 relative bg-white shadow-sm">
                      <span className="absolute -top-3.5 left-4 bg-slate-400 text-white px-4 py-1 rounded-md text-sm font-medium shadow-sm">Relocate From</span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border border-slate-300 rounded-lg p-2 focus-within:border-slate-500 transition-all bg-white">
                          <label className="block text-[11px] text-slate-500 font-medium mb-0.5">Country</label>
                          <input 
                            type="text" 
                            value={quotationForm.fromCountry}
                            onChange={(e) => setQuotationForm({ ...quotationForm, fromCountry: e.target.value })}
                            className="w-full outline-none text-slate-800 text-sm bg-transparent" 
                          />
                        </div>
                        <div className="border border-slate-300 rounded-lg p-2 focus-within:border-slate-500 transition-all bg-white relative">
                          <label className="block text-[11px] text-slate-500 font-medium mb-0.5">State</label>
                          <input 
                            type="text" 
                            list="upl-indian-states-datalist"
                            value={quotationForm.fromState}
                            onChange={(e) => setQuotationForm({ ...quotationForm, fromState: e.target.value })}
                            placeholder="Select or type State"
                            className="w-full outline-none text-slate-800 text-sm bg-transparent" 
                          />
                        </div>
                        <div className="border border-slate-300 rounded-lg p-2 focus-within:border-slate-500 transition-all bg-white">
                          <label className="block text-[11px] text-slate-500 font-medium mb-0.5">City</label>
                          <input 
                            type="text" 
                            value={quotationForm.fromCity}
                            onChange={(e) => setQuotationForm({ ...quotationForm, fromCity: e.target.value })}
                            placeholder="e.g. Vizianagaram"
                            className="w-full outline-none text-slate-800 text-sm bg-transparent" 
                          />
                        </div>
                        <div className="border border-slate-300 rounded-lg p-2 focus-within:border-slate-500 transition-all bg-white">
                          <label className="block text-[11px] text-slate-500 font-medium mb-0.5">Area</label>
                          <input 
                            type="text" 
                            value={quotationForm.fromArea}
                            onChange={(e) => setQuotationForm({ ...quotationForm, fromArea: e.target.value })}
                            placeholder="Area / Locality"
                            className="w-full outline-none text-slate-800 text-sm bg-transparent" 
                          />
                        </div>
                        <div className="border border-slate-300 rounded-lg p-2 focus-within:border-slate-500 transition-all bg-white">
                          <label className="block text-[11px] text-slate-500 font-medium mb-0.5">Pin Code</label>
                          <input 
                            type="text" 
                            value={quotationForm.fromPincode}
                            onChange={(e) => setQuotationForm({ ...quotationForm, fromPincode: e.target.value })}
                            placeholder="e.g. 535002"
                            className="w-full outline-none text-slate-800 text-sm bg-transparent" 
                          />
                        </div>
                        <div className="border border-slate-300 rounded-lg p-2 focus-within:border-slate-500 transition-all bg-white relative">
                          <label className="block text-[11px] text-slate-500 font-medium mb-0.5">From Floor</label>
                          <select 
                            value={quotationForm.fromFloor}
                            onChange={(e) => setQuotationForm({ ...quotationForm, fromFloor: e.target.value })}
                            className="w-full outline-none text-slate-800 text-sm bg-transparent appearance-none cursor-pointer"
                          >
                            <option>Ground</option>
                            <option>Basement</option>
                            <option>1st Floor</option>
                            <option>2nd Floor</option>
                            <option>3rd Floor</option>
                            <option>4th Floor</option>
                            <option>Above 4th Floor</option>
                          </select>
                        </div>
                        <div className="border border-slate-300 rounded-lg p-2 focus-within:border-slate-500 transition-all bg-white relative">
                          <label className="block text-[11px] text-slate-500 font-medium mb-0.5">Lift Available</label>
                          <select 
                            value={quotationForm.fromLift}
                            onChange={(e) => setQuotationForm({ ...quotationForm, fromLift: e.target.value })}
                            className="w-full outline-none text-slate-800 text-sm bg-transparent appearance-none cursor-pointer"
                          >
                            <option>Not Required</option>
                            <option>Yes</option>
                            <option>No</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Relocate To */}
                    <div className="border-2 border-orange-300 rounded-xl p-6 pt-8 relative bg-white shadow-sm">
                      <span className="absolute -top-3.5 left-4 bg-orange-300 text-white px-4 py-1 rounded-md text-sm font-medium shadow-sm">Relocate To</span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border border-slate-300 rounded-lg p-2 focus-within:border-orange-400 transition-all bg-white">
                          <label className="block text-[11px] text-slate-500 font-medium mb-0.5">Country</label>
                          <input 
                            type="text" 
                            value={quotationForm.toCountry}
                            onChange={(e) => setQuotationForm({ ...quotationForm, toCountry: e.target.value })}
                            className="w-full outline-none text-slate-800 text-sm bg-transparent" 
                          />
                        </div>
                        <div className="border border-slate-300 rounded-lg p-2 focus-within:border-orange-400 transition-all bg-white relative">
                          <label className="block text-[11px] text-slate-500 font-medium mb-0.5">State</label>
                          <input 
                            type="text" 
                            list="upl-indian-states-datalist"
                            value={quotationForm.toState}
                            onChange={(e) => setQuotationForm({ ...quotationForm, toState: e.target.value })}
                            placeholder="Select or type State"
                            className="w-full outline-none text-slate-800 text-sm bg-transparent" 
                          />
                        </div>
                        <div className="border border-slate-300 rounded-lg p-2 focus-within:border-orange-400 transition-all bg-white">
                          <label className="block text-[11px] text-slate-500 font-medium mb-0.5">City</label>
                          <input 
                            type="text" 
                            value={quotationForm.toCity}
                            onChange={(e) => setQuotationForm({ ...quotationForm, toCity: e.target.value })}
                            placeholder="e.g. Nagpur"
                            className="w-full outline-none text-slate-800 text-sm bg-transparent" 
                          />
                        </div>
                        <div className="border border-slate-300 rounded-lg p-2 focus-within:border-orange-400 transition-all bg-white">
                          <label className="block text-[11px] text-slate-500 font-medium mb-0.5">Area</label>
                          <input 
                            type="text" 
                            value={quotationForm.toArea}
                            onChange={(e) => setQuotationForm({ ...quotationForm, toArea: e.target.value })}
                            placeholder="Area / Locality"
                            className="w-full outline-none text-slate-800 text-sm bg-transparent" 
                          />
                        </div>
                        <div className="border border-slate-300 rounded-lg p-2 focus-within:border-orange-400 transition-all bg-white">
                          <label className="block text-[11px] text-slate-500 font-medium mb-0.5">Pin Code</label>
                          <input 
                            type="text" 
                            value={quotationForm.toPincode}
                            onChange={(e) => setQuotationForm({ ...quotationForm, toPincode: e.target.value })}
                            placeholder="e.g. 440001"
                            className="w-full outline-none text-slate-800 text-sm bg-transparent" 
                          />
                        </div>
                        <div className="border border-slate-300 rounded-lg p-2 focus-within:border-orange-400 transition-all bg-white relative">
                          <label className="block text-[11px] text-slate-500 font-medium mb-0.5">To Floor</label>
                          <select 
                            value={quotationForm.toFloor}
                            onChange={(e) => setQuotationForm({ ...quotationForm, toFloor: e.target.value })}
                            className="w-full outline-none text-slate-800 text-sm bg-transparent appearance-none cursor-pointer"
                          >
                            <option>Ground</option>
                            <option>Basement</option>
                            <option>1st Floor</option>
                            <option>2nd Floor</option>
                            <option>3rd Floor</option>
                            <option>4th Floor</option>
                            <option>Above 4th Floor</option>
                          </select>
                        </div>
                        <div className="border border-slate-300 rounded-lg p-2 focus-within:border-orange-400 transition-all bg-white relative">
                          <label className="block text-[11px] text-slate-500 font-medium mb-0.5">Lift Available</label>
                          <select 
                            value={quotationForm.toLift}
                            onChange={(e) => setQuotationForm({ ...quotationForm, toLift: e.target.value })}
                            className="w-full outline-none text-slate-800 text-sm bg-transparent appearance-none cursor-pointer"
                          >
                            <option>Not Required</option>
                            <option>Yes</option>
                            <option>No</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Charges Details */}
                    <div className="border-2 border-cyan-400 rounded-xl p-6 pt-8 relative bg-white shadow-sm">
                      <span className="absolute -top-3.5 left-4 bg-cyan-400 text-white px-4 py-1 rounded-md text-sm font-medium shadow-sm">Charges Details</span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border border-slate-300 rounded-lg p-3 focus-within:border-cyan-500 transition-all bg-white group shadow-2xs">
                          <label className="block text-xs font-bold text-cyan-950 uppercase tracking-wider mb-1 flex items-center justify-between">
                            <span>Transportation Charges</span>
                            <span className="text-[10px] text-slate-400 font-medium lowercase">enter amount</span>
                          </label>
                          <div className="flex items-center justify-between">
                            <input 
                              type="text" 
                              placeholder="Enter amount" 
                              value={quotationForm.transportCharges}
                              onChange={(e) => setQuotationForm({ ...quotationForm, transportCharges: e.target.value })}
                              className="w-full outline-none text-slate-800 text-sm font-semibold bg-transparent placeholder-slate-400" 
                            />
                            <div className="w-6 h-6 rounded-full bg-sky-50 flex items-center justify-center border border-sky-200 text-sky-500 group-hover:bg-sky-100 transition-colors flex-shrink-0 ml-1">
                              <Edit className="w-3 h-3" />
                            </div>
                          </div>
                        </div>

                        <div className="border border-slate-300 rounded-lg p-3 focus-within:border-cyan-500 transition-all bg-white group shadow-2xs">
                          <label className="block text-xs font-bold text-cyan-950 uppercase tracking-wider mb-1 flex items-center justify-between">
                            <span>Packing Charges</span>
                            <span className="text-[10px] text-slate-400 font-medium lowercase">enter amount</span>
                          </label>
                          <div className="flex items-center justify-between">
                            <input 
                              type="text" 
                              placeholder="Enter amount" 
                              value={quotationForm.packingCharges}
                              onChange={(e) => setQuotationForm({ ...quotationForm, packingCharges: e.target.value })}
                              className="w-full outline-none text-slate-800 text-sm font-semibold bg-transparent placeholder-slate-400" 
                            />
                            <div className="w-6 h-6 rounded-full bg-sky-50 flex items-center justify-center border border-sky-200 text-sky-500 group-hover:bg-sky-100 transition-colors flex-shrink-0 ml-1">
                              <Edit className="w-3 h-3" />
                            </div>
                          </div>
                        </div>

                        <div className="border border-slate-300 rounded-lg p-3 focus-within:border-cyan-500 transition-all bg-white group shadow-2xs">
                          <label className="block text-xs font-bold text-cyan-950 uppercase tracking-wider mb-1 flex items-center justify-between">
                            <span>Unpacking Charges</span>
                            <span className="text-[10px] text-slate-400 font-medium lowercase">enter amount</span>
                          </label>
                          <div className="flex items-center justify-between">
                            <input 
                              type="text" 
                              placeholder="Enter amount" 
                              value={quotationForm.unpackingCharges}
                              onChange={(e) => setQuotationForm({ ...quotationForm, unpackingCharges: e.target.value })}
                              className="w-full outline-none text-slate-800 text-sm font-semibold bg-transparent placeholder-slate-400" 
                            />
                            <div className="w-6 h-6 rounded-full bg-sky-50 flex items-center justify-center border border-sky-200 text-sky-500 group-hover:bg-sky-100 transition-colors flex-shrink-0 ml-1">
                              <Edit className="w-3 h-3" />
                            </div>
                          </div>
                        </div>

                        <div className="border border-slate-300 rounded-lg p-3 focus-within:border-cyan-500 transition-all bg-white group shadow-2xs">
                          <label className="block text-xs font-bold text-cyan-950 uppercase tracking-wider mb-1 flex items-center justify-between">
                            <span>Loading Charges</span>
                            <span className="text-[10px] text-slate-400 font-medium lowercase">enter amount</span>
                          </label>
                          <div className="flex items-center justify-between">
                            <input 
                              type="text" 
                              placeholder="Enter amount" 
                              value={quotationForm.loadingCharges}
                              onChange={(e) => setQuotationForm({ ...quotationForm, loadingCharges: e.target.value })}
                              className="w-full outline-none text-slate-800 text-sm font-semibold bg-transparent placeholder-slate-400" 
                            />
                            <div className="w-6 h-6 rounded-full bg-sky-50 flex items-center justify-center border border-sky-200 text-sky-500 group-hover:bg-sky-100 transition-colors flex-shrink-0 ml-1">
                              <Edit className="w-3 h-3" />
                            </div>
                          </div>
                        </div>

                        <div className="border border-slate-300 rounded-lg p-3 focus-within:border-cyan-500 transition-all bg-white group shadow-2xs">
                          <label className="block text-xs font-bold text-cyan-950 uppercase tracking-wider mb-1 flex items-center justify-between">
                            <span>Unloading Charges</span>
                            <span className="text-[10px] text-slate-400 font-medium lowercase">enter amount</span>
                          </label>
                          <div className="flex items-center justify-between">
                            <input 
                              type="text" 
                              placeholder="Enter amount" 
                              value={quotationForm.unloadingCharges}
                              onChange={(e) => setQuotationForm({ ...quotationForm, unloadingCharges: e.target.value })}
                              className="w-full outline-none text-slate-800 text-sm font-semibold bg-transparent placeholder-slate-400" 
                            />
                            <div className="w-6 h-6 rounded-full bg-sky-50 flex items-center justify-center border border-sky-200 text-sky-500 group-hover:bg-sky-100 transition-colors flex-shrink-0 ml-1">
                              <Edit className="w-3 h-3" />
                            </div>
                          </div>
                        </div>

                        <div className="border border-slate-300 rounded-lg p-3 focus-within:border-cyan-500 transition-all bg-white group shadow-2xs">
                          <label className="block text-xs font-bold text-cyan-950 uppercase tracking-wider mb-1 flex items-center justify-between">
                            <span>Dismantling/Assembling Charges</span>
                            <span className="text-[10px] text-slate-400 font-medium lowercase">enter amount</span>
                          </label>
                          <div className="flex items-center justify-between">
                            <input 
                              type="text" 
                              placeholder="Enter amount" 
                              value={quotationForm.dismantlingCharges}
                              onChange={(e) => setQuotationForm({ ...quotationForm, dismantlingCharges: e.target.value })}
                              className="w-full outline-none text-slate-800 text-sm font-semibold bg-transparent placeholder-slate-400" 
                            />
                            <div className="w-6 h-6 rounded-full bg-sky-50 flex items-center justify-center border border-sky-200 text-sky-500 group-hover:bg-sky-100 transition-colors flex-shrink-0 ml-1">
                              <Edit className="w-3 h-3" />
                            </div>
                          </div>
                        </div>

                        <div className="border border-slate-300 rounded-lg p-3 focus-within:border-cyan-500 transition-all bg-white group shadow-2xs">
                          <label className="block text-xs font-bold text-cyan-950 uppercase tracking-wider mb-1 flex items-center justify-between">
                            <span>Octroi/Entry Charges</span>
                            <span className="text-[10px] text-slate-400 font-medium lowercase">enter amount</span>
                          </label>
                          <div className="flex items-center justify-between">
                            <input 
                              type="text" 
                              placeholder="Enter amount" 
                              value={quotationForm.octroiCharges}
                              onChange={(e) => setQuotationForm({ ...quotationForm, octroiCharges: e.target.value })}
                              className="w-full outline-none text-slate-800 text-sm font-semibold bg-transparent placeholder-slate-400" 
                            />
                            <div className="w-6 h-6 rounded-full bg-sky-50 flex items-center justify-center border border-sky-200 text-sky-500 group-hover:bg-sky-100 transition-colors flex-shrink-0 ml-1">
                              <Edit className="w-3 h-3" />
                            </div>
                          </div>
                        </div>

                        <div className="border border-slate-300 rounded-lg p-3 focus-within:border-cyan-500 transition-all bg-white group shadow-2xs">
                          <label className="block text-xs font-bold text-cyan-950 uppercase tracking-wider mb-1 flex items-center justify-between">
                            <span>Car Transportation Charges</span>
                            <span className="text-[10px] text-slate-400 font-medium lowercase">enter amount</span>
                          </label>
                          <div className="flex items-center justify-between">
                            <input 
                              type="text" 
                              placeholder="Enter amount" 
                              value={quotationForm.carCharges}
                              onChange={(e) => setQuotationForm({ ...quotationForm, carCharges: e.target.value })}
                              className="w-full outline-none text-slate-800 text-sm font-semibold bg-transparent placeholder-slate-400" 
                            />
                            <div className="w-6 h-6 rounded-full bg-sky-50 flex items-center justify-center border border-sky-200 text-sky-500 group-hover:bg-sky-100 transition-colors flex-shrink-0 ml-1">
                              <Edit className="w-3 h-3" />
                            </div>
                          </div>
                        </div>

                        <div className="border border-slate-300 rounded-lg p-3 focus-within:border-cyan-500 transition-all bg-white group shadow-2xs">
                          <label className="block text-xs font-bold text-cyan-950 uppercase tracking-wider mb-1 flex items-center justify-between">
                            <span>Bike Transportation Charges</span>
                            <span className="text-[10px] text-slate-400 font-medium lowercase">enter amount</span>
                          </label>
                          <div className="flex items-center justify-between">
                            <input 
                              type="text" 
                              placeholder="Enter amount" 
                              value={quotationForm.bikeCharges}
                              onChange={(e) => setQuotationForm({ ...quotationForm, bikeCharges: e.target.value })}
                              className="w-full outline-none text-slate-800 text-sm font-semibold bg-transparent placeholder-slate-400" 
                            />
                            <div className="w-6 h-6 rounded-full bg-sky-50 flex items-center justify-center border border-sky-200 text-sky-500 group-hover:bg-sky-100 transition-colors flex-shrink-0 ml-1">
                              <Edit className="w-3 h-3" />
                            </div>
                          </div>
                        </div>

                        <div className="border border-slate-300 rounded-lg p-3 focus-within:border-cyan-500 transition-all bg-white group shadow-2xs">
                          <label className="block text-xs font-bold text-cyan-950 uppercase tracking-wider mb-1 flex items-center justify-between">
                            <span>Statistical/Document Charges</span>
                            <span className="text-[10px] text-slate-400 font-medium lowercase">enter amount</span>
                          </label>
                          <div className="flex items-center justify-between">
                            <input 
                              type="text" 
                              placeholder="Enter amount" 
                              value={quotationForm.statCharges}
                              onChange={(e) => setQuotationForm({ ...quotationForm, statCharges: e.target.value })}
                              className="w-full outline-none text-slate-800 text-sm font-semibold bg-transparent placeholder-slate-400" 
                            />
                            <div className="w-6 h-6 rounded-full bg-sky-50 flex items-center justify-center border border-sky-200 text-sky-500 group-hover:bg-sky-100 transition-colors flex-shrink-0 ml-1">
                              <Edit className="w-3 h-3" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Additional / Custom Charges (New Entries) */}
                      <div className="mt-6 pt-5 border-t border-cyan-200">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <span className="text-xs font-bold text-cyan-950 uppercase tracking-wider flex items-center gap-1.5">
                              <Plus className="w-3.5 h-3.5 text-cyan-600" />
                              Custom / Additional Charges (New Entries)
                            </span>
                            <p className="text-[11px] text-slate-500 mt-0.5">Add any new charge item by entering its name and applied amount</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const existing = quotationForm.customCharges || [];
                              setQuotationForm({
                                ...quotationForm,
                                customCharges: [...existing, { name: '', val: '' }]
                              });
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" /> + Add New Charge
                          </button>
                        </div>

                        {(!quotationForm.customCharges || quotationForm.customCharges.length === 0) ? (
                          <div className="bg-slate-50 border border-dashed border-slate-300 rounded-lg p-3 text-center">
                            <p className="text-xs text-slate-500">Need to add another charge? Click <strong className="text-cyan-700">+ Add New Charge</strong> to add any new service or fee.</p>
                          </div>
                        ) : (
                          <div className="space-y-2.5">
                            {quotationForm.customCharges.map((cc: any, idx: number) => (
                              <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center bg-cyan-50/60 p-2.5 rounded-lg border border-cyan-200">
                                <div className="sm:col-span-6">
                                  <label className="block text-[10px] font-bold text-cyan-900 uppercase tracking-wider mb-0.5">Charge Name (Visible on Quotation)</label>
                                  <input
                                    type="text"
                                    placeholder="Enter charge name"
                                    value={cc.name}
                                    onChange={(e) => {
                                      const updated = [...(quotationForm.customCharges || [])];
                                      updated[idx] = { ...updated[idx], name: e.target.value };
                                      setQuotationForm({ ...quotationForm, customCharges: updated });
                                    }}
                                    className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-xs text-slate-800 font-medium outline-none focus:border-cyan-500"
                                  />
                                </div>
                                <div className="sm:col-span-5">
                                  <label className="block text-[10px] font-bold text-cyan-900 uppercase tracking-wider mb-0.5">Applied Amount</label>
                                  <input
                                    type="text"
                                    placeholder="Enter amount"
                                    value={cc.val}
                                    onChange={(e) => {
                                      const updated = [...(quotationForm.customCharges || [])];
                                      updated[idx] = { ...updated[idx], val: e.target.value };
                                      setQuotationForm({ ...quotationForm, customCharges: updated });
                                    }}
                                    className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-xs text-slate-800 font-bold outline-none focus:border-cyan-500"
                                  />
                                </div>
                                <div className="sm:col-span-1 flex justify-end sm:pt-4">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = (quotationForm.customCharges || []).filter((_: any, i: number) => i !== idx);
                                      setQuotationForm({ ...quotationForm, customCharges: updated });
                                    }}
                                    className="text-red-500 hover:text-red-700 p-1.5 rounded-md hover:bg-red-50 transition-colors cursor-pointer"
                                    title="Remove Charge"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Service/GST/Insurance */}
                    <div className="border-2 border-slate-900 rounded-xl p-6 pt-8 relative bg-white shadow-sm">
                      <span className="absolute -top-3.5 left-4 bg-slate-900 text-white px-4 py-1 rounded-md text-sm font-medium shadow-sm">Service/GST/Insurance</span>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* 1. Service Charge % */}
                        <div className="border border-slate-300 rounded-lg p-3 focus-within:border-slate-800 transition-all bg-white relative shadow-2xs">
                          <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1 flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                              Service Charge %
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium lowercase">dropdown (0% - 20%)</span>
                          </label>
                          <select 
                            value={quotationForm.serviceChargePercent || '0%'}
                            onChange={(e) => setQuotationForm({ ...quotationForm, serviceChargePercent: e.target.value })}
                            className="w-full outline-none text-slate-800 text-sm font-semibold bg-transparent appearance-none cursor-pointer py-1"
                          >
                            {SERVICE_CHARGE_PERCENT_OPTIONS.map((pct) => (
                              <option key={pct} value={pct}>{pct}</option>
                            ))}
                          </select>
                        </div>

                        {/* 2. Service Charge Amount Value Input */}
                        <div className="border border-slate-300 rounded-lg p-3 focus-within:border-slate-800 transition-all bg-white group shadow-2xs">
                          <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1 flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                              Service Charge
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium lowercase">enter value</span>
                          </label>
                          <div className="flex items-center justify-between">
                            <input 
                              type="text" 
                              placeholder="Enter service charge value" 
                              value={quotationForm.serviceCharge}
                              onChange={(e) => setQuotationForm({ ...quotationForm, serviceCharge: e.target.value })}
                              className="w-full outline-none text-slate-800 text-sm font-semibold bg-transparent placeholder-slate-400" 
                            />
                            <div className="w-6 h-6 rounded-full bg-sky-50 flex items-center justify-center border border-sky-200 text-sky-500 group-hover:bg-sky-100 transition-colors flex-shrink-0 ml-1">
                              <Edit className="w-3 h-3" />
                            </div>
                          </div>
                        </div>

                        {/* 3. Insurance % & Status */}
                        <div className="border border-slate-300 rounded-lg p-3 focus-within:border-emerald-600 transition-all bg-white relative shadow-2xs">
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                              Insurance %
                            </label>
                            {/* Toggle Pills: Extra / Included / Exempted */}
                            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded">
                              <button
                                type="button"
                                onClick={() => {
                                  setQuotationForm({ 
                                    ...quotationForm, 
                                    insuranceStatus: 'Extra', 
                                    insuranceCharge: quotationForm.insuranceCharge === 'Included' || quotationForm.insuranceCharge === 'Exempted' ? '' : quotationForm.insuranceCharge 
                                  });
                                }}
                                className={`px-1.5 py-0.5 text-[10px] font-bold rounded cursor-pointer transition-colors ${
                                  (quotationForm.insuranceStatus || 'Extra') === 'Extra'
                                    ? 'bg-amber-600 text-white shadow-2xs'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                              >
                                Extra
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setQuotationForm({ ...quotationForm, insuranceStatus: 'Included', insuranceCharge: 'Included' });
                                }}
                                className={`px-1.5 py-0.5 text-[10px] font-bold rounded cursor-pointer transition-colors ${
                                  quotationForm.insuranceStatus === 'Included'
                                    ? 'bg-emerald-600 text-white shadow-2xs'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                              >
                                Included
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setQuotationForm({ ...quotationForm, insuranceStatus: 'Exempted', insuranceCharge: 'Exempted' });
                                }}
                                className={`px-1.5 py-0.5 text-[10px] font-bold rounded cursor-pointer transition-colors ${
                                  quotationForm.insuranceStatus === 'Exempted'
                                    ? 'bg-slate-700 text-white shadow-2xs'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                              >
                                Exempted
                              </button>
                            </div>
                          </div>
                          <select 
                            value={quotationForm.insurancePercent || '3%'}
                            onChange={(e) => {
                              const newPct = e.target.value;
                              let newInsCharge = quotationForm.insuranceCharge;
                              if (quotationForm.insuranceStatus !== 'Included' && quotationForm.insuranceStatus !== 'Exempted' && quotationForm.goodsValue) {
                                const gv = parseFloat(String(quotationForm.goodsValue).replace(/[^0-9.]/g, '')) || 0;
                                const pctNum = parseFloat(newPct.replace(/[^0-9.]/g, '')) || 0;
                                const auto = Math.round((gv * pctNum) / 100);
                                if (auto > 0) newInsCharge = String(auto);
                              }
                              setQuotationForm({ ...quotationForm, insurancePercent: newPct, insuranceCharge: newInsCharge });
                            }}
                            className="w-full outline-none text-slate-800 text-sm font-semibold bg-transparent appearance-none cursor-pointer py-1"
                          >
                            <option value="3%">3% (Standard Relocation)</option>
                            <option value="2.5%">2.5%</option>
                            <option value="2%">2%</option>
                            <option value="1.5%">1.5%</option>
                            <option value="1%">1%</option>
                            <option value="0.5%">0.5%</option>
                            <option value="0%">0% (Nil)</option>
                            <option value="3.5%">3.5%</option>
                            <option value="4%">4%</option>
                            <option value="5%">5%</option>
                          </select>
                        </div>

                        {/* 4. Insurance Charge */}
                        <div className="border border-slate-300 rounded-lg p-3 focus-within:border-emerald-600 transition-all bg-white group shadow-2xs">
                          <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1 flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                              Insurance Charge
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium lowercase">
                              {quotationForm.insuranceStatus === 'Included' ? 'charge included' : quotationForm.insuranceStatus === 'Exempted' ? 'exempted' : 'enter value / auto-calc'}
                            </span>
                          </label>
                          <div className="flex items-center justify-between">
                            <input 
                              type="text" 
                              placeholder={quotationForm.insuranceStatus === 'Included' ? 'Included' : quotationForm.insuranceStatus === 'Exempted' ? 'Exempted' : 'Enter amount or value'} 
                              value={quotationForm.insuranceCharge || ''}
                              onChange={(e) => setQuotationForm({ ...quotationForm, insuranceCharge: e.target.value })}
                              className="w-full outline-none text-slate-800 text-sm font-semibold bg-transparent placeholder-slate-400" 
                            />
                            {quotationForm.goodsValue && quotationForm.insuranceStatus !== 'Included' && quotationForm.insuranceStatus !== 'Exempted' && (
                              <button
                                type="button"
                                onClick={() => {
                                  const gv = parseFloat(String(quotationForm.goodsValue).replace(/[^0-9.]/g, '')) || 0;
                                  const pct = parseFloat(String(quotationForm.insurancePercent || '3').replace(/[^0-9.]/g, '')) || 3;
                                  const calc = Math.round((gv * pct) / 100);
                                  if (calc > 0) {
                                    setQuotationForm({ ...quotationForm, insuranceCharge: String(calc) });
                                  }
                                }}
                                title="Auto-calculate Insurance from Goods Value"
                                className="text-[11px] text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded ml-1 cursor-pointer shrink-0 font-bold"
                              >
                                Calc
                              </button>
                            )}
                            <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-200 text-emerald-600 group-hover:bg-emerald-100 transition-colors flex-shrink-0 ml-1">
                              <Edit className="w-3 h-3" />
                            </div>
                          </div>
                        </div>

                        {/* 5. GST Charge % & Status */}
                        <div className="border border-slate-300 rounded-lg p-3 focus-within:border-purple-600 transition-all bg-white relative shadow-2xs">
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                              GST Charge %
                            </label>
                            {/* Toggle Pills: Extra / Included / Exempted */}
                            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded">
                              <button
                                type="button"
                                onClick={() => {
                                  setQuotationForm({ 
                                    ...quotationForm, 
                                    gstStatus: 'Extra', 
                                    gstCharge: quotationForm.gstCharge === 'Included' || quotationForm.gstCharge === 'Exempted' ? '' : quotationForm.gstCharge 
                                  });
                                }}
                                className={`px-1.5 py-0.5 text-[10px] font-bold rounded cursor-pointer transition-colors ${
                                  (quotationForm.gstStatus || 'Extra') === 'Extra'
                                    ? 'bg-amber-600 text-white shadow-2xs'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                              >
                                Extra
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setQuotationForm({ ...quotationForm, gstStatus: 'Included', gstCharge: 'Included' });
                                }}
                                className={`px-1.5 py-0.5 text-[10px] font-bold rounded cursor-pointer transition-colors ${
                                  quotationForm.gstStatus === 'Included'
                                    ? 'bg-emerald-600 text-white shadow-2xs'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                              >
                                Included
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setQuotationForm({ ...quotationForm, gstStatus: 'Exempted', gstCharge: 'Exempted' });
                                }}
                                className={`px-1.5 py-0.5 text-[10px] font-bold rounded cursor-pointer transition-colors ${
                                  quotationForm.gstStatus === 'Exempted'
                                    ? 'bg-slate-700 text-white shadow-2xs'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                              >
                                Exempted
                              </button>
                            </div>
                          </div>
                          <select 
                            value={quotationForm.gstPercent || '18%'}
                            onChange={(e) => setQuotationForm({ ...quotationForm, gstPercent: e.target.value })}
                            className="w-full outline-none text-slate-800 text-sm font-semibold bg-transparent appearance-none cursor-pointer py-1"
                          >
                            <option value="18%">18% (Standard Logistics & Packers)</option>
                            <option value="12%">12% (Standard Goods Moving)</option>
                            <option value="5%">5% (Goods Transport Agency / GTA)</option>
                            <option value="28%">28% (Luxury / Special Move)</option>
                            <option value="0%">0% (Nil / Exempted Tax)</option>
                          </select>
                        </div>

                        {/* 6. GST Charge */}
                        <div className="border border-slate-300 rounded-lg p-3 focus-within:border-purple-600 transition-all bg-white group shadow-2xs">
                          <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1 flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                              GST Charge
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium lowercase">
                              {quotationForm.gstStatus === 'Included' ? 'charge included' : quotationForm.gstStatus === 'Exempted' ? 'exempted' : 'enter value / auto-calc'}
                            </span>
                          </label>
                          <div className="flex items-center justify-between">
                            <input 
                              type="text" 
                              placeholder={quotationForm.gstStatus === 'Included' ? 'Included' : quotationForm.gstStatus === 'Exempted' ? 'Exempted' : 'Enter amount or value'} 
                              value={quotationForm.gstCharge || ''}
                              onChange={(e) => setQuotationForm({ ...quotationForm, gstCharge: e.target.value })}
                              className="w-full outline-none text-slate-800 text-sm font-semibold bg-transparent placeholder-slate-400" 
                            />
                            {quotationForm.gstStatus !== 'Included' && quotationForm.gstStatus !== 'Exempted' && (
                              <button
                                type="button"
                                onClick={() => {
                                  const allCharges = [
                                    quotationForm.transportCharges,
                                    quotationForm.packingCharges,
                                    quotationForm.unpackingCharges,
                                    quotationForm.loadingCharges,
                                    quotationForm.unloadingCharges,
                                    quotationForm.dismantlingCharges,
                                    quotationForm.octroiCharges,
                                    quotationForm.carCharges,
                                    quotationForm.bikeCharges,
                                    quotationForm.statCharges,
                                    quotationForm.serviceCharge,
                                    ...(quotationForm.customCharges || []).map((c: any) => c.val)
                                  ];
                                  let sub = 0;
                                  for (const val of allCharges) {
                                    const p = parseFloat(String(val).replace(/[^0-9.]/g, ''));
                                    if (!isNaN(p) && p > 0) sub += p;
                                  }
                                  if (sub === 0 && quotationForm.subTotal) {
                                    sub = parseFloat(String(quotationForm.subTotal).replace(/[^0-9.]/g, '')) || 0;
                                  }
                                  const pct = parseFloat(String(quotationForm.gstPercent || '18').replace(/[^0-9.]/g, '')) || 18;
                                  const calc = Math.round((sub * pct) / 100);
                                  if (calc > 0) {
                                    setQuotationForm({ ...quotationForm, gstCharge: String(calc) });
                                  }
                                }}
                                title="Auto-calculate GST from Sub Total"
                                className="text-[11px] text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-300 px-2 py-0.5 rounded ml-1 cursor-pointer shrink-0 font-bold"
                              >
                                Calc ({quotationForm.gstPercent || '18%'})
                              </button>
                            )}
                            <div className="w-6 h-6 rounded-full bg-purple-50 flex items-center justify-center border border-purple-200 text-purple-600 group-hover:bg-purple-100 transition-colors flex-shrink-0 ml-1">
                              <Edit className="w-3 h-3" />
                            </div>
                          </div>
                        </div>

                        {/* 7. Goods Total Value */}
                        <div className="border border-slate-300 rounded-lg p-3 focus-within:border-slate-800 transition-all bg-white group shadow-2xs">
                          <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1 flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-slate-600"></span>
                              Goods Total Value (Rs.)
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium lowercase">declared value</span>
                          </label>
                          <div className="flex items-center justify-between">
                            <input 
                              type="text" 
                              placeholder="Declared Goods Value" 
                              value={quotationForm.goodsValue || ''}
                              onChange={(e) => {
                                const newGoodsVal = e.target.value;
                                let newIns = quotationForm.insuranceCharge;
                                if (quotationForm.insuranceStatus !== 'Included' && quotationForm.insuranceStatus !== 'Exempted') {
                                  const gvNum = parseFloat(newGoodsVal.replace(/[^0-9.]/g, '')) || 0;
                                  const pctNum = parseFloat(String(quotationForm.insurancePercent || '3').replace(/[^0-9.]/g, '')) || 3;
                                  if (gvNum > 0) {
                                    newIns = String(Math.round((gvNum * pctNum) / 100));
                                  } else if (newGoodsVal.trim() === '') {
                                    newIns = '';
                                  }
                                }
                                setQuotationForm({ ...quotationForm, goodsValue: newGoodsVal, insuranceCharge: newIns });
                              }}
                              className="w-full outline-none text-slate-800 text-sm font-semibold bg-transparent placeholder-slate-400" 
                            />
                            <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center border border-slate-200 text-slate-600 group-hover:bg-slate-100 transition-colors flex-shrink-0 ml-1">
                              <Edit className="w-3 h-3" />
                            </div>
                          </div>
                        </div>

                        {/* 8. GST Type */}
                        <div className="border border-slate-300 rounded-lg p-3 focus-within:border-slate-800 transition-all bg-white relative shadow-2xs">
                          <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1 flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-slate-600"></span>
                              GST Type
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium lowercase">tax category</span>
                          </label>
                          <select 
                            value={quotationForm.gstType || 'CGST/SGST'}
                            onChange={(e) => setQuotationForm({ ...quotationForm, gstType: e.target.value })}
                            className="w-full outline-none text-slate-800 text-sm font-semibold bg-transparent appearance-none cursor-pointer py-1"
                          >
                            <option value="CGST/SGST">CGST/SGST (In-State Moving)</option>
                            <option value="IGST">IGST (Inter-State Moving)</option>
                            <option value="Exempted">Exempted / Nil Tax</option>
                          </select>
                        </div>
                      </div>

                      {/* Live Calculation Breakdown Banner */}
                      {(() => {
                        const allCharges = [
                          quotationForm.transportCharges,
                          quotationForm.packingCharges,
                          quotationForm.unpackingCharges,
                          quotationForm.loadingCharges,
                          quotationForm.unloadingCharges,
                          quotationForm.dismantlingCharges,
                          quotationForm.octroiCharges,
                          quotationForm.carCharges,
                          quotationForm.bikeCharges,
                          quotationForm.statCharges,
                          quotationForm.serviceCharge,
                          ...(quotationForm.customCharges || []).map((c: any) => c.val)
                        ];
                        let liveSub = 0;
                        for (const val of allCharges) {
                          const p = parseFloat(String(val).replace(/[^0-9.]/g, ''));
                          if (!isNaN(p) && p > 0) liveSub += p;
                        }
                        if (liveSub === 0 && quotationForm.subTotal) {
                          liveSub = parseFloat(String(quotationForm.subTotal).replace(/[^0-9.]/g, '')) || 0;
                        }

                        // Insurance calculation
                        let liveIns = 0;
                        if (quotationForm.insuranceStatus !== 'Included' && quotationForm.insuranceStatus !== 'Exempted') {
                          const insP = parseFloat(String(quotationForm.insuranceCharge).replace(/[^0-9.]/g, ''));
                          if (!isNaN(insP) && insP > 0) {
                            liveIns = insP;
                          } else if (quotationForm.goodsValue) {
                            const gVal = parseFloat(String(quotationForm.goodsValue).replace(/[^0-9.]/g, '')) || 0;
                            const pct = parseFloat(String(quotationForm.insurancePercent || '3').replace(/[^0-9.]/g, '')) || 3;
                            liveIns = Math.round((gVal * pct) / 100);
                          }
                        }

                        // GST calculation
                        let liveGst = 0;
                        if (quotationForm.gstStatus !== 'Included' && quotationForm.gstStatus !== 'Exempted' && quotationForm.gstType !== 'Exempted') {
                          const gstP = parseFloat(String(quotationForm.gstCharge).replace(/[^0-9.]/g, ''));
                          if (!isNaN(gstP) && gstP > 0) {
                            liveGst = gstP;
                          } else {
                            const pct = parseFloat(String(quotationForm.gstPercent || '18').replace(/[^0-9.]/g, '')) || 18;
                            liveGst = Math.round((liveSub * pct) / 100);
                          }
                        }

                        const liveGrand = liveSub + liveIns + liveGst;

                        return (
                          <div className="mt-4 p-3.5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl flex flex-wrap items-center justify-between gap-3">
                            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-700">
                              <div>
                                <span className="text-slate-500">Sub Total:</span>{' '}
                                <strong className="text-slate-900 font-mono">₹ {liveSub.toLocaleString()}</strong>
                              </div>
                              {liveIns > 0 && (
                                <div className="text-emerald-700">
                                  <span>+ Ins ({quotationForm.insurancePercent || '3%'} Extra):</span>{' '}
                                  <strong className="font-mono">₹ {liveIns.toLocaleString()}</strong>
                                </div>
                              )}
                              {liveGst > 0 && (
                                <div className="text-purple-700">
                                  <span>+ GST ({quotationForm.gstPercent || '18%'} Extra):</span>{' '}
                                  <strong className="font-mono">₹ {liveGst.toLocaleString()}</strong>
                                </div>
                              )}
                              {quotationForm.gstStatus === 'Included' && (
                                <span className="text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded font-bold text-[11px]">
                                  GST Included
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs uppercase font-extrabold text-blue-900 tracking-wider">Grand Total:</span>
                              <span className="text-lg font-black text-blue-950 font-mono bg-white px-3 py-1 rounded-lg border border-blue-300 shadow-2xs">
                                ₹ {liveGrand.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Other Details */}
                    <div className="border-2 border-green-400 rounded-xl p-6 pt-8 relative bg-white shadow-sm">
                      <span className="absolute -top-3.5 left-4 bg-green-400 text-white px-4 py-1 rounded-md text-sm font-medium shadow-sm">Other Details</span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border border-slate-300 rounded-lg p-3 focus-within:border-green-500 transition-all bg-white">
                          <input 
                            type="text" 
                            placeholder="Advance Pay" 
                            value={quotationForm.advancePaid}
                            onChange={(e) => setQuotationForm({ ...quotationForm, advancePaid: e.target.value })}
                            className="w-full outline-none text-slate-700 text-sm bg-transparent placeholder-slate-500" 
                          />
                        </div>
                        <div className="border border-slate-300 rounded-lg p-3 focus-within:border-green-500 transition-all bg-white">
                          <input 
                            type="text" 
                            placeholder="Easy Access" 
                            value={quotationForm.easyAccess}
                            onChange={(e) => setQuotationForm({ ...quotationForm, easyAccess: e.target.value })}
                            className="w-full outline-none text-slate-700 text-sm bg-transparent placeholder-slate-500" 
                          />
                        </div>
                        <div className="border border-slate-300 rounded-lg p-3 focus-within:border-green-500 transition-all bg-white md:col-span-2">
                          <input 
                            type="text" 
                            placeholder="Balcony Items" 
                            value={quotationForm.balconyItems}
                            onChange={(e) => setQuotationForm({ ...quotationForm, balconyItems: e.target.value })}
                            className="w-full outline-none text-slate-700 text-sm bg-transparent placeholder-slate-500" 
                          />
                        </div>
                        <div className="border border-slate-300 rounded-lg p-3 focus-within:border-green-500 transition-all bg-white md:col-span-2">
                          <input 
                            type="text" 
                            placeholder="Extra Info." 
                            value={quotationForm.extraInfo}
                            onChange={(e) => setQuotationForm({ ...quotationForm, extraInfo: e.target.value })}
                            className="w-full outline-none text-slate-700 text-sm bg-transparent placeholder-slate-500" 
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 text-center">
                    <button 
                      type="button"
                      onClick={handleSaveQuotation}
                      className="bg-[#0088cc] hover:bg-blue-600 text-white px-10 py-2.5 rounded text-sm font-semibold transition-colors shadow-sm cursor-pointer"
                    >
                      Save Quotation
                    </button>
                  </div>
                </div>
              )}

              {adminTab === 'list-quotation' && (
                <div className="pb-16">
                  {/* Breadcrumb Header matching Screenshot */}
                  <div className="flex justify-between items-center mb-6 bg-white p-4 sm:p-5 px-6 rounded-2xl shadow-xs border border-slate-200">
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">All Quotations</h1>
                    <div className="bg-[#0284c7] text-white px-3.5 py-1 rounded-full text-xs font-bold shadow-xs">
                      Total: {quotations.length}
                    </div>
                  </div>

                  {/* Filter and Search Bar matching Screenshot */}
                  <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mb-6">
                    <div className="flex items-center gap-2.5">
                      <button 
                        onClick={() => {
                          setAdminTab('add-quotation');
                          setEditingQuotationId(null);
                          setQuotationForm({ ...initialQuotationForm, quotationNo: String(quotations.length + 1) });
                        }}
                        className="bg-[#0f172a] hover:bg-slate-800 text-white px-7 py-2 rounded-full font-bold text-sm shadow-xs transition-all cursor-pointer active:scale-95"
                      >
                        Add
                      </button>
                      <button 
                        onClick={() => setQuotationSearchQuery('')}
                        className="bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 px-6 py-2 rounded-full font-semibold text-sm shadow-xs transition-colors cursor-pointer"
                      >
                        All
                      </button>
                    </div>

                    <div className="flex items-center">
                      <input 
                        type="text" 
                        placeholder="Search Here.." 
                        value={quotationSearchQuery}
                        onChange={(e) => setQuotationSearchQuery(e.target.value)}
                        className="bg-white border border-slate-300 text-slate-800 text-sm px-4 py-2 rounded-l-md outline-none focus:border-[#0088cc] w-full sm:w-64"
                      />
                      <button 
                        onClick={() => {}}
                        className="bg-[#0088cc] hover:bg-[#0077b5] text-white px-5 py-2 rounded-r-md text-sm font-semibold transition-colors shrink-0 cursor-pointer shadow-xs"
                      >
                        Search
                      </button>
                    </div>
                  </div>

                  {/* Quotation Cards matching exact layout from image.png */}
                  <div className="space-y-6">
                    {(() => {
                      const filteredQuotations = quotations.filter(q => {
                        if (!quotationSearchQuery.trim()) return true;
                        const query = quotationSearchQuery.toLowerCase();
                        return (
                          (q.partyName && q.partyName.toLowerCase().includes(query)) ||
                          (q.mobileNo && q.mobileNo.includes(query)) ||
                          (q.quotationNo && String(q.quotationNo).includes(query)) ||
                          (q.fromCity && q.fromCity.toLowerCase().includes(query)) ||
                          (q.toCity && q.toCity.toLowerCase().includes(query))
                        );
                      });

                      if (filteredQuotations.length === 0) {
                        return (
                          <div className="bg-white rounded-2xl border border-slate-200 p-10 sm:p-14 text-center shadow-xs">
                            <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
                              <FileText className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 mb-1">No Quotations Found</h3>
                            <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">
                              {quotations.length === 0 
                                ? "You have not added any quotations yet. Click below to create your first quotation." 
                                : "No quotations matched your search keywords. Try a different term or clear the filter."}
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                setAdminTab('add-quotation');
                                setEditingQuotationId(null);
                                setQuotationForm({ ...initialQuotationForm, quotationNo: String(quotations.length + 1) });
                              }}
                              className="bg-[#0284c7] hover:bg-sky-700 text-white px-6 py-2.5 rounded-full font-bold text-sm shadow-xs transition-colors cursor-pointer inline-flex items-center gap-2"
                            >
                              <Plus className="w-4 h-4" /> Create Quotation
                            </button>
                          </div>
                        );
                      }

                      return filteredQuotations.map((quotation, idx) => (
                        <div 
                          key={quotation.id || idx}
                          className="bg-white rounded-2xl border border-slate-200 shadow-xs relative pt-6 pb-4 px-6 sm:px-8 overflow-visible"
                        >
                          {/* Centered Number Tab on Top Border */}
                          <div className="absolute -top-3.5 left-12 sm:left-16 bg-white border border-slate-300 px-3.5 py-0.5 rounded text-xs font-bold text-slate-700 shadow-xs z-10">
                            {idx + 1}
                          </div>

                          {/* Status Indicator */}
                          <div className="text-center mb-3">
                            <span className="text-xs text-slate-500 font-medium">Status: </span>
                            <span className="text-xs font-semibold text-[#0284c7] bg-[#e0f2fe] border border-[#38bdf8] px-3.5 py-0.5 rounded-full">
                              {quotation.status || 'Pending'}
                            </span>
                          </div>

                          {/* Date (Left Orange) and Quotation # (Right Dark Blue) Banner */}
                          <div className="flex justify-between items-center mb-5">
                            <div className="bg-[#fb923c] text-white font-bold text-xs sm:text-sm px-4 py-1.5 rounded-md shadow-xs">
                              {quotation.quotationDate}
                            </div>
                            <div className="bg-[#1e3a8a] text-white font-bold text-xs sm:text-sm px-4 py-1.5 rounded-md shadow-xs uppercase tracking-wide">
                              QUOTATION - #{quotation.quotationNo}
                            </div>
                          </div>

                          {/* Details 2-Column Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                            {/* Left Column: Customer & Route */}
                            <div>
                              {/* Customer Row */}
                              <div className="flex items-center gap-3 mb-5">
                                <div className="w-8 h-8 rounded-full bg-[#0284c7] text-white flex items-center justify-center shrink-0 shadow-xs">
                                  <User className="w-4 h-4" />
                                </div>
                                <span className="font-bold text-slate-800 text-sm sm:text-base">
                                  {quotation.partyName}
                                </span>
                              </div>

                              {/* Route with Connected Vertical Line */}
                              <div className="relative pl-7 space-y-4">
                                <div className="absolute left-3 top-2.5 bottom-2.5 w-[2px] bg-[#0284c7]"></div>
                                
                                <div className="relative">
                                  <div className="absolute -left-7 top-0 w-6 h-6 rounded-full bg-[#0284c7] text-white flex items-center justify-center shadow-xs">
                                    <MapPin className="w-3.5 h-3.5" />
                                  </div>
                                  <div className="text-[11px] text-slate-400 font-medium leading-none mb-0.5">From</div>
                                  <div className="text-sm font-bold text-slate-800 leading-tight">
                                    {quotation.fromCity}{quotation.fromState ? `, ${quotation.fromState}` : ''}
                                  </div>
                                </div>

                                <div className="relative">
                                  <div className="absolute -left-7 top-0 w-6 h-6 rounded-full bg-[#0284c7] text-white flex items-center justify-center shadow-xs">
                                    <MapPin className="w-3.5 h-3.5" />
                                  </div>
                                  <div className="text-[11px] text-slate-400 font-medium leading-none mb-0.5">To</div>
                                  <div className="text-sm font-bold text-slate-800 leading-tight">
                                    {quotation.toCity}{quotation.toState ? `, ${quotation.toState}` : ''}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Right Column: Amount, Phone, Packing Date */}
                            <div className="space-y-4 md:pl-6">
                              {/* Amount */}
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-full bg-[#0284c7] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                                  ₹
                                </div>
                                <div className="text-xl sm:text-2xl font-black text-[#0f172a] tracking-tight">
                                  {quotation.grandTotal}
                                </div>
                              </div>

                              {/* Phone */}
                              <div className="flex items-center gap-3">
                                <div className="w-7 h-7 rounded-full bg-[#0284c7] text-white flex items-center justify-center text-xs shrink-0 shadow-xs">
                                  <Phone className="w-3.5 h-3.5" />
                                </div>
                                <div>
                                  <div className="text-[11px] text-slate-400 font-medium leading-none mb-0.5">Click to call</div>
                                  <a href={`tel:${quotation.mobileNo}`} className="text-sm font-bold text-[#0284c7] hover:underline">
                                    {quotation.mobileNo}
                                  </a>
                                </div>
                              </div>

                              {/* Packing Date */}
                              <div className="flex items-center gap-3">
                                <div className="w-7 h-7 rounded-full bg-[#0284c7] text-white flex items-center justify-center text-xs shrink-0 shadow-xs">
                                  <Clock className="w-3.5 h-3.5" />
                                </div>
                                <div>
                                  <div className="text-[11px] text-slate-400 font-medium leading-none mb-0.5">Packing Date</div>
                                  <div className="text-xs font-semibold text-slate-700">
                                    {quotation.packingDate || 'Packing Date'}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Bottom 5 Circular Action Buttons matching Screenshot */}
                          <div className="flex items-center justify-center gap-5 sm:gap-7 pt-4 border-t border-slate-100 mt-5">
                            {/* Open -> Opens Quotation PDF Modal */}
                            <button 
                              onClick={() => setViewingQuotation(quotation)}
                              className="flex flex-col items-center gap-1 group cursor-pointer"
                              title="Open Quotation PDF"
                            >
                              <div className="w-9 h-9 rounded-full bg-[#0284c7] text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                                <FileText className="w-4 h-4" />
                              </div>
                              <span className="text-[11px] font-bold text-[#0284c7]">Open</span>
                            </button>

                            {/* Share */}
                            <button 
                              onClick={() => handleShareQuotation(quotation)}
                              className="flex flex-col items-center gap-1 group cursor-pointer"
                              title="Share Quotation"
                            >
                              <div className="w-9 h-9 rounded-full bg-[#10b981] text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                                <Share2 className="w-4 h-4" />
                              </div>
                              <span className="text-[11px] font-bold text-[#10b981]">Share</span>
                            </button>

                            {/* Edit */}
                            <button 
                              onClick={() => handleEditQuotation(quotation)}
                              className="flex flex-col items-center gap-1 group cursor-pointer"
                              title="Edit Quotation"
                            >
                              <div className="w-9 h-9 rounded-full bg-[#06b6d4] text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                                <Edit className="w-4 h-4" />
                              </div>
                              <span className="text-[11px] font-bold text-[#06b6d4]">Edit</span>
                            </button>

                            {/* Delete */}
                            <button 
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteQuotation(quotation);
                              }}
                              className="flex flex-col items-center gap-1 group cursor-pointer"
                              title="Delete Quotation"
                            >
                              <div className="w-9 h-9 rounded-full bg-[#f87171] text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                                <Trash2 className="w-4 h-4" />
                              </div>
                              <span className="text-[11px] font-bold text-[#f87171]">Delete</span>
                            </button>

                            {/* Download PDF */}
                            <button 
                              onClick={() => setViewingQuotation(quotation)}
                              className="flex flex-col items-center gap-1 group cursor-pointer"
                              title="View & Download Quotation PDF"
                            >
                              <div className="w-9 h-9 rounded-full bg-[#0f172a] text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                                <Download className="w-4 h-4" />
                              </div>
                              <span className="text-[11px] font-bold text-[#0f172a]">Download</span>
                            </button>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              )}

              {adminTab === 'add-packing' && (
                <div className="pb-16 space-y-6">
                  {/* Top Bar Header with "All Packing Lists" button matching Screenshot 1 */}
                  <div className="flex justify-between items-center bg-white p-4 sm:p-5 px-6 rounded-2xl shadow-xs border border-slate-200">
                    <div>
                      <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                        {editingPackingListId ? `Edit Packing List #${packingListForm.packingListNo}` : 'Add Packing List'}
                      </h1>
                      <p className="text-xs text-slate-500 mt-0.5">Inventory and consignment tracking list for relocation</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAdminTab('list-packing')}
                      className="bg-[#0f172a] hover:bg-slate-800 text-white px-4 sm:px-5 py-2 rounded-full font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <List className="w-3.5 h-3.5 text-sky-400" />
                      <span>All Packing Lists</span>
                    </button>
                  </div>

                  {/* Details from Quotation Bar matching Screenshot 1 */}
                  <div 
                    onClick={() => setShowQuotationPickerForPacking(true)}
                    className="bg-[#e0f2fe] hover:bg-sky-200/80 border border-sky-300/80 rounded-xl p-3.5 px-5 flex items-center justify-between cursor-pointer transition-all shadow-2xs group"
                    title="Auto-fill details from an existing Quotation or Survey"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-[#0284c7] text-white flex items-center justify-center shadow-xs">
                        <ClipboardList className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-sm text-[#0369a1] group-hover:text-[#075985]">
                        Details from Quotation Record
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-[#0284c7] bg-white px-3 py-1 rounded-full shadow-2xs group-hover:bg-[#0284c7] group-hover:text-white transition-colors">
                      Click to Auto-fill &rarr;
                    </span>
                  </div>

                  {/* Auto-Fill from Survey Card */}
                  <div className="bg-linear-to-r from-teal-50 via-emerald-50 to-sky-50 border-2 border-emerald-300 rounded-2xl p-5 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-emerald-200/70">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
                          <PackageCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                            Auto-Fill from Survey & Import Inventory
                            <span className="text-[10px] bg-teal-600 text-white px-2.5 py-0.5 rounded-full uppercase tracking-wider font-semibold">
                              1-Click Import
                            </span>
                          </h4>
                          <p className="text-xs text-slate-600 mt-0.5">
                            Auto-load client details, addresses, and convert all surveyed items directly into numbered packing boxes.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-3 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                      <div className="sm:col-span-7">
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">Select Survey:</label>
                        <select 
                          className="w-full bg-white border border-teal-300 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer shadow-xs"
                          value={selectedSurveyForPackingAutoFill}
                          onChange={(e) => {
                            const val = e.target.value;
                            setSelectedSurveyForPackingAutoFill(val);
                            if (val) applySurveyToPackingList(val, true);
                          }}
                        >
                          <option value="">-- Select Survey to Import Client & Items --</option>
                          {surveys.map((s) => (
                            <option key={s.id} value={s.surveyNo || s.id}>
                              Survey #{s.surveyNo} — {s.partyName} ({s.items?.length || 0} items)
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="sm:col-span-5 flex gap-2 items-end">
                        <div className="grow">
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">Or Type Survey No:</label>
                          <input 
                            type="text" 
                            placeholder="e.g. 1001 or 1042"
                            className="w-full bg-white border border-teal-300 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-teal-500 shadow-xs"
                            value={selectedSurveyForPackingAutoFill}
                            onChange={(e) => setSelectedSurveyForPackingAutoFill(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                applySurveyToPackingList(selectedSurveyForPackingAutoFill, true);
                              }
                            }}
                          />
                        </div>
                        <button 
                          type="button"
                          onClick={() => applySurveyToPackingList(selectedSurveyForPackingAutoFill, true)}
                          className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm px-4 py-2 rounded-xl transition-colors cursor-pointer shrink-0 shadow-xs flex items-center gap-1.5 h-[38px]"
                        >
                          <Check className="w-4 h-4" />
                          <span>Import</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleSavePackingList} className="space-y-6">
                    {/* Section 1: Packing List Details (Green) */}
                    <div className="border border-slate-200 border-l-4 border-l-[#22c55e] rounded-2xl p-6 pt-8 relative bg-white shadow-xs">
                      <span className="absolute -top-3.5 left-4 bg-[#22c55e] text-white px-4 py-1 rounded-md text-xs font-semibold shadow-xs flex items-center gap-1.5">
                        <PackageCheck className="w-3.5 h-3.5" />
                        Packing List Details
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border border-slate-300 rounded-xl p-2 px-3 focus-within:border-emerald-500 transition-all bg-white">
                          <label className="block text-[11px] text-slate-500 font-medium mb-0.5">Packing List No. *</label>
                          <input 
                            type="text" 
                            required
                            placeholder="2"
                            className="w-full outline-none text-slate-800 text-sm bg-transparent font-medium" 
                            value={packingListForm.packingListNo} 
                            onChange={e => setPackingListForm({...packingListForm, packingListNo: e.target.value})} 
                          />
                        </div>
                        <div className="border border-slate-300 rounded-xl p-2 px-3 focus-within:border-emerald-500 transition-all bg-white">
                          <label className="block text-[11px] text-slate-500 font-medium mb-0.5">Packing List Date *</label>
                          <input 
                            type="date" 
                            required
                            className="w-full outline-none text-slate-800 text-sm bg-transparent appearance-none font-medium" 
                            value={packingListForm.packingListDate} 
                            onChange={e => setPackingListForm({...packingListForm, packingListDate: e.target.value})} 
                          />
                        </div>
                        <div className="border border-slate-300 rounded-xl p-2 px-3 focus-within:border-emerald-500 transition-all bg-white relative">
                          <div className="flex items-center justify-between mb-0.5">
                            <label className="block text-[11px] text-slate-500 font-medium">Party Name * (Auto-Completes)</label>
                            {customerProfiles.some(c => c.partyName && c.partyName.toLowerCase() === (packingListForm.partyName || '').trim().toLowerCase()) && (
                              <span className="text-[10px] font-bold text-teal-600 bg-teal-50 border border-teal-200 px-1.5 py-0.2 rounded-full">
                                ✓ Synced Profile
                              </span>
                            )}
                          </div>
                          <input 
                            type="text" 
                            required
                            list="upl-customer-parties-datalist"
                            placeholder="Party Name *" 
                            className="w-full outline-none text-slate-800 text-sm bg-transparent font-medium" 
                            value={packingListForm.partyName} 
                            onChange={e => handlePackingListPartyNameChange(e.target.value)} 
                          />
                        </div>
                        <div className="border border-slate-300 rounded-xl p-2 px-3 focus-within:border-emerald-500 transition-all bg-white relative">
                          <div className="flex items-center justify-between mb-0.5">
                            <label className="block text-[11px] text-slate-500 font-medium">Client Mobile No. (Auto-Completes)</label>
                            {customerProfiles.some(c => c.mobileNo && c.mobileNo.replace(/\D/g, '') === (packingListForm.mobileNo || '').replace(/\D/g, '') && c.mobileNo.length >= 8) && (
                              <span className="text-[10px] font-bold text-teal-600 bg-teal-50 border border-teal-200 px-1.5 py-0.2 rounded-full">
                                ✓ Recognized Contact
                              </span>
                            )}
                          </div>
                          <input 
                            type="tel" 
                            list="upl-customer-mobiles-datalist"
                            placeholder="Client Mobile No." 
                            className="w-full outline-none text-slate-800 text-sm bg-transparent font-medium" 
                            value={packingListForm.mobileNo} 
                            onChange={e => handlePackingListMobileChange(e.target.value)} 
                          />
                        </div>
                      </div>

                      {/* Quick-Pick Existing Clients Carousel for Packing List */}
                      {customerProfiles.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-slate-100">
                          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 mb-2">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                            <span>Quick Pick Customer Profile (Auto-fills party, phone, route & items into Packing List):</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                            {customerProfiles.slice(0, 8).map((cp, idx) => (
                              <button
                                key={`chip-pl-${idx}`}
                                type="button"
                                onClick={() => handlePackingListPartyNameChange(cp.partyName)}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 border border-slate-200 text-slate-700 text-xs rounded-lg transition-colors cursor-pointer font-medium"
                              >
                                <span>{cp.partyName}</span>
                                {cp.mobileNo && <span className="text-[10px] text-slate-500 font-mono">({cp.mobileNo})</span>}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Section 2: Relocate From (Slate/Grey) */}
                    <div className="border border-slate-200 border-l-4 border-l-[#64748b] rounded-2xl p-6 pt-8 relative bg-white shadow-xs">
                      <span className="absolute -top-3.5 left-4 bg-[#64748b] text-white px-4 py-1 rounded-md text-xs font-semibold shadow-xs flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        Relocate From
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border border-slate-300 rounded-xl p-2 px-3 focus-within:border-slate-500 transition-all bg-white">
                          <label className="block text-[11px] text-slate-500 font-medium mb-0.5">Country</label>
                          <input 
                            type="text" 
                            placeholder="India" 
                            className="w-full outline-none text-slate-800 text-sm bg-transparent font-medium" 
                            value={packingListForm.fromCountry || 'India'} 
                            onChange={e => setPackingListForm({...packingListForm, fromCountry: e.target.value})} 
                          />
                        </div>
                        <div className="border border-slate-300 rounded-xl p-2 px-3 focus-within:border-slate-500 transition-all bg-white relative">
                          <label className="block text-[11px] text-slate-500 font-medium mb-0.5">State</label>
                          <select 
                            className="w-full outline-none text-slate-800 text-sm bg-transparent appearance-none font-medium pr-6" 
                            value={packingListForm.fromState || 'N/A'} 
                            onChange={e => setPackingListForm({...packingListForm, fromState: e.target.value})}
                          >
                            {INDIAN_STATES.map((st, i) => (
                              <option key={i} value={st}>{st}</option>
                            ))}
                          </select>
                          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 bottom-2.5 pointer-events-none" />
                        </div>
                        <div className="border border-slate-300 rounded-xl p-2 px-3 focus-within:border-slate-500 transition-all bg-white">
                          <label className="block text-[11px] text-slate-500 font-medium mb-0.5">City</label>
                          <input 
                            type="text" 
                            placeholder="City" 
                            className="w-full outline-none text-slate-800 text-sm bg-transparent font-medium" 
                            value={packingListForm.fromCity} 
                            onChange={e => setPackingListForm({...packingListForm, fromCity: e.target.value})} 
                          />
                        </div>
                        <div className="border border-slate-300 rounded-xl p-2 px-3 focus-within:border-slate-500 transition-all bg-white">
                          <label className="block text-[11px] text-slate-500 font-medium mb-0.5">Area</label>
                          <input 
                            type="text" 
                            placeholder="Area" 
                            className="w-full outline-none text-slate-800 text-sm bg-transparent font-medium" 
                            value={packingListForm.fromArea} 
                            onChange={e => setPackingListForm({...packingListForm, fromArea: e.target.value})} 
                          />
                        </div>
                        <div className="border border-slate-300 rounded-xl p-2 px-3 focus-within:border-slate-500 transition-all bg-white">
                          <label className="block text-[11px] text-slate-500 font-medium mb-0.5">Pin Code</label>
                          <input 
                            type="text" 
                            placeholder="Pin Code" 
                            className="w-full outline-none text-slate-800 text-sm bg-transparent font-medium" 
                            value={packingListForm.fromPincode} 
                            onChange={e => setPackingListForm({...packingListForm, fromPincode: e.target.value})} 
                          />
                        </div>
                        <div className="border border-slate-300 rounded-xl p-2 px-3 focus-within:border-slate-500 transition-all bg-white relative">
                          <label className="block text-[11px] text-slate-500 font-medium mb-0.5">From Floor</label>
                          <select 
                            className="w-full outline-none text-slate-800 text-sm bg-transparent appearance-none font-medium pr-6" 
                            value={packingListForm.fromFloor || 'Ground'} 
                            onChange={e => setPackingListForm({...packingListForm, fromFloor: e.target.value})}
                          >
                            {FLOOR_OPTIONS.map((fl, i) => (
                              <option key={i} value={fl}>{fl}</option>
                            ))}
                          </select>
                          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 bottom-2.5 pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    {/* Section 3: Relocate To (Orange) */}
                    <div className="border border-slate-200 border-l-4 border-l-[#f97316] rounded-2xl p-6 pt-8 relative bg-white shadow-xs">
                      <span className="absolute -top-3.5 left-4 bg-[#f97316] text-white px-4 py-1 rounded-md text-xs font-semibold shadow-xs flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        Relocate To
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border border-slate-300 rounded-xl p-2 px-3 focus-within:border-orange-500 transition-all bg-white">
                          <label className="block text-[11px] text-slate-500 font-medium mb-0.5">Country</label>
                          <input 
                            type="text" 
                            placeholder="India" 
                            className="w-full outline-none text-slate-800 text-sm bg-transparent font-medium" 
                            value={packingListForm.toCountry || 'India'} 
                            onChange={e => setPackingListForm({...packingListForm, toCountry: e.target.value})} 
                          />
                        </div>
                        <div className="border border-slate-300 rounded-xl p-2 px-3 focus-within:border-orange-500 transition-all bg-white relative">
                          <label className="block text-[11px] text-slate-500 font-medium mb-0.5">State</label>
                          <select 
                            className="w-full outline-none text-slate-800 text-sm bg-transparent appearance-none font-medium pr-6" 
                            value={packingListForm.toState || 'N/A'} 
                            onChange={e => setPackingListForm({...packingListForm, toState: e.target.value})}
                          >
                            {INDIAN_STATES.map((st, i) => (
                              <option key={i} value={st}>{st}</option>
                            ))}
                          </select>
                          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 bottom-2.5 pointer-events-none" />
                        </div>
                        <div className="border border-slate-300 rounded-xl p-2 px-3 focus-within:border-orange-500 transition-all bg-white">
                          <label className="block text-[11px] text-slate-500 font-medium mb-0.5">City</label>
                          <input 
                            type="text" 
                            placeholder="City" 
                            className="w-full outline-none text-slate-800 text-sm bg-transparent font-medium" 
                            value={packingListForm.toCity} 
                            onChange={e => setPackingListForm({...packingListForm, toCity: e.target.value})} 
                          />
                        </div>
                        <div className="border border-slate-300 rounded-xl p-2 px-3 focus-within:border-orange-500 transition-all bg-white">
                          <label className="block text-[11px] text-slate-500 font-medium mb-0.5">Area</label>
                          <input 
                            type="text" 
                            placeholder="Area" 
                            className="w-full outline-none text-slate-800 text-sm bg-transparent font-medium" 
                            value={packingListForm.toArea} 
                            onChange={e => setPackingListForm({...packingListForm, toArea: e.target.value})} 
                          />
                        </div>
                        <div className="border border-slate-300 rounded-xl p-2 px-3 focus-within:border-orange-500 transition-all bg-white">
                          <label className="block text-[11px] text-slate-500 font-medium mb-0.5">Pin Code</label>
                          <input 
                            type="text" 
                            placeholder="Pin Code" 
                            className="w-full outline-none text-slate-800 text-sm bg-transparent font-medium" 
                            value={packingListForm.toPincode} 
                            onChange={e => setPackingListForm({...packingListForm, toPincode: e.target.value})} 
                          />
                        </div>
                        <div className="border border-slate-300 rounded-xl p-2 px-3 focus-within:border-orange-500 transition-all bg-white relative">
                          <label className="block text-[11px] text-slate-500 font-medium mb-0.5">From Floor / To Floor</label>
                          <select 
                            className="w-full outline-none text-slate-800 text-sm bg-transparent appearance-none font-medium pr-6" 
                            value={packingListForm.toFloor || 'Ground'} 
                            onChange={e => setPackingListForm({...packingListForm, toFloor: e.target.value})}
                          >
                            {FLOOR_OPTIONS.map((fl, i) => (
                              <option key={i} value={fl}>{fl}</option>
                            ))}
                          </select>
                          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 bottom-2.5 pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    {/* Section 4: Item Details (Cyan/Blue) matching Screenshots 2 & 3 */}
                    <div className="border border-slate-200 border-l-4 border-l-[#0284c7] rounded-2xl p-6 pt-8 relative bg-white shadow-xs">
                      <span className="absolute -top-3.5 left-4 bg-[#0284c7] text-white px-4 py-1 rounded-md text-xs font-semibold shadow-xs flex items-center gap-1.5">
                        <Box className="w-3.5 h-3.5" />
                        Item Details
                      </span>

                      {/* Inputs Row */}
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-3">
                          <div className="md:col-span-4 border border-slate-300 rounded-xl p-2 px-3 focus-within:border-sky-500 transition-all bg-white">
                            <label className="block text-[11px] text-slate-500 font-medium mb-0.5">Item Name (सामान का नाम)</label>
                            <input 
                              type="text" 
                              placeholder="e.g. Sofa 3 Seater / Refrigerator" 
                              className="w-full outline-none text-slate-800 text-sm bg-transparent font-medium" 
                              value={currentPackingItem.name} 
                              onChange={e => setCurrentPackingItem({...currentPackingItem, name: e.target.value})} 
                              onKeyDown={e => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddItemToPackingList();
                                }
                              }}
                            />
                          </div>

                          <div className="md:col-span-2 border border-slate-300 rounded-xl p-2 px-3 focus-within:border-sky-500 transition-all bg-white">
                            <label className="block text-[11px] text-slate-500 font-medium mb-0.5">Quantity (संख्या)</label>
                            <input 
                              type="number" 
                              min="1"
                              placeholder="1" 
                              className="w-full outline-none text-slate-800 text-sm bg-transparent font-medium" 
                              value={currentPackingItem.qty} 
                              onChange={e => setCurrentPackingItem({...currentPackingItem, qty: e.target.value})} 
                            />
                          </div>

                          <div className="md:col-span-2 border border-slate-300 rounded-xl p-2 px-3 focus-within:border-sky-500 transition-all bg-white">
                            <label className="block text-[11px] text-slate-500 font-medium mb-0.5">Box No.</label>
                            <input 
                              type="text" 
                              placeholder="1" 
                              className="w-full outline-none text-slate-800 text-sm bg-transparent font-medium" 
                              value={currentPackingItem.boxNo} 
                              onChange={e => setCurrentPackingItem({...currentPackingItem, boxNo: e.target.value})} 
                            />
                          </div>

                          <div className="md:col-span-2 border border-slate-300 rounded-xl p-2 px-3 focus-within:border-sky-500 transition-all bg-white">
                            <label className="block text-[11px] text-slate-500 font-medium mb-0.5">Value (कीमत)</label>
                            <input 
                              type="text" 
                              placeholder="₹" 
                              className="w-full outline-none text-slate-800 text-sm bg-transparent font-medium" 
                              value={currentPackingItem.value} 
                              onChange={e => setCurrentPackingItem({...currentPackingItem, value: e.target.value})} 
                            />
                          </div>

                          <div className="md:col-span-2 border border-slate-300 rounded-xl p-2 px-3 focus-within:border-sky-500 transition-all bg-white">
                            <label className="block text-[11px] text-slate-500 font-medium mb-0.5">Remark</label>
                            <input 
                              type="text" 
                              placeholder="Good cond." 
                              className="w-full outline-none text-slate-800 text-sm bg-transparent font-medium" 
                              value={currentPackingItem.remark} 
                              onChange={e => setCurrentPackingItem({...currentPackingItem, remark: e.target.value})} 
                            />
                          </div>
                        </div>

                        {/* + Add Button matching Screenshot 2 */}
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={handleAddItemToPackingList}
                            className="border-2 border-[#0284c7] text-[#0284c7] hover:bg-[#0284c7] hover:text-white px-6 py-2 rounded-full font-bold text-xs flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95"
                          >
                            <Plus className="w-4 h-4" />
                            <span>+ Add</span>
                          </button>
                        </div>

                        {/* Quick Item Suggestion Chips */}
                        <div className="pt-2 border-t border-slate-100">
                          <div className="text-[11px] text-slate-400 font-medium mb-2">Quick Add Popular Items:</div>
                          <div className="flex flex-wrap gap-1.5">
                            {[
                              'Double Bed & Mattress',
                              'Sofa 3+1+1',
                              'Refrigerator 2 Door',
                              'Smart LED TV 55"',
                              'Front Load Washing Machine',
                              'Dining Table + 4 Chairs',
                              'Kitchen Crockery Box',
                              'Wardrobe Clothes Box',
                              'Split AC 1.5T',
                              'Geyser 25L',
                              'Almirah / Wardrobe',
                              'Computer Table & Chair',
                              'Shoe Rack',
                              'Luggage Bags'
                            ].map((sugg, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => handleQuickAddPackingItem(sugg)}
                                className="text-xs bg-slate-100 hover:bg-sky-100 hover:text-[#0284c7] text-slate-700 px-2.5 py-1 rounded-full transition-colors cursor-pointer"
                              >
                                + {sugg}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Items Added Table matching Screenshot 3 */}
                        {packingListForm.items.length > 0 ? (
                          <div className="mt-4 border border-slate-200 rounded-xl overflow-hidden">
                            <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex justify-between items-center text-xs font-bold text-slate-700">
                              <span>Added Items ({packingListForm.items.length})</span>
                              <span className="text-[#0284c7]">
                                Total Qty: {packingListForm.items.reduce((sum, it) => sum + (parseInt(String(it.qty)) || 1), 0)}
                              </span>
                            </div>
                            <div className="overflow-x-auto">
                              <table className="w-full text-xs text-left">
                                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                                  <tr>
                                    <th className="p-2.5 px-3 w-10 text-center">#</th>
                                    <th className="p-2.5 px-3 w-20 text-center">Box No.</th>
                                    <th className="p-2.5 px-3">Item Name (सामान का नाम)</th>
                                    <th className="p-2.5 px-3 w-16 text-center">Qty</th>
                                    <th className="p-2.5 px-3 w-24 text-right">Value (₹)</th>
                                    <th className="p-2.5 px-3">Remark</th>
                                    <th className="p-2.5 px-3 w-12 text-center">Action</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {packingListForm.items.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                                      <td className="p-2.5 px-3 text-center text-slate-400">{idx + 1}</td>
                                      <td className="p-2.5 px-3 text-center font-bold text-[#0284c7]">
                                        {item.boxNo || '1'}
                                      </td>
                                      <td className="p-2.5 px-3 font-medium text-slate-800">{item.name}</td>
                                      <td className="p-2.5 px-3 text-center font-semibold">{item.qty || '1'}</td>
                                      <td className="p-2.5 px-3 text-right text-slate-700">
                                        {item.value ? `₹${item.value}` : '-'}
                                      </td>
                                      <td className="p-2.5 px-3 text-slate-500">{item.remark || '-'}</td>
                                      <td className="p-2.5 px-3 text-center">
                                        <button
                                          type="button"
                                          onClick={() => handleRemoveItemFromPackingList(idx)}
                                          className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded transition-colors cursor-pointer"
                                          title="Remove item"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        ) : (
                          <div className="p-6 border border-dashed border-slate-200 rounded-xl text-center text-slate-400 text-xs">
                            No items added yet. Enter item name above and click <span className="font-semibold text-[#0284c7]">+ Add</span> or choose from suggestions.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Centered Save Button matching Screenshot 3 */}
                    <div className="mt-8 text-center flex flex-col sm:flex-row justify-center items-center gap-4">
                      <button 
                        type="submit"
                        className="w-full sm:w-auto bg-[#0284c7] hover:bg-sky-700 text-white px-12 py-3 rounded-xl font-bold text-sm shadow-md transition-all cursor-pointer active:scale-95"
                      >
                        {editingPackingListId ? 'Update Packing List' : 'Save'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPackingListForm({ ...initialPackingListForm, packingListNo: String(packingLists.length + 2), items: [] });
                          setEditingPackingListId(null);
                        }}
                        className="text-xs text-slate-500 hover:text-slate-700 underline cursor-pointer"
                      >
                        Clear Form
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {adminTab === 'list-packing' && (
                <div className="pb-16">
                  {/* Breadcrumb Header */}
                  <div className="flex justify-between items-center mb-6 bg-white p-4 sm:p-5 px-6 rounded-2xl shadow-xs border border-slate-200">
                    <div>
                      <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">All Packing Lists</h1>
                      <p className="text-xs text-slate-500 mt-0.5">Manage, print and share your moving inventory sheets</p>
                    </div>
                    <div className="bg-[#0284c7] text-white px-3.5 py-1 rounded-full text-xs font-bold shadow-xs">
                      Total: {packingLists.length}
                    </div>
                  </div>

                  {/* Filter and Search Bar */}
                  <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mb-6">
                    <div className="flex items-center gap-2.5">
                      <button 
                        onClick={() => {
                          setAdminTab('add-packing');
                          setEditingPackingListId(null);
                          setPackingListForm({ ...initialPackingListForm, packingListNo: String(packingLists.length + 1), items: [] });
                        }}
                        className="bg-[#0f172a] hover:bg-slate-800 text-white px-7 py-2 rounded-full font-bold text-sm shadow-xs transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
                      >
                        <Plus className="w-4 h-4 text-sky-400" />
                        <span>Add</span>
                      </button>
                      <button 
                        onClick={() => setPackingListSearchQuery('')}
                        className="bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 px-6 py-2 rounded-full font-semibold text-sm shadow-xs transition-colors cursor-pointer"
                      >
                        All
                      </button>
                    </div>

                    <div className="relative w-full sm:w-72">
                      <input 
                        type="text" 
                        placeholder="Search by party, phone, city..." 
                        value={packingListSearchQuery}
                        onChange={(e) => setPackingListSearchQuery(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-full pl-9 pr-4 py-2 text-xs focus:ring-2 focus:ring-[#0284c7] focus:border-[#0284c7] outline-none shadow-2xs font-medium"
                      />
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                      {packingListSearchQuery && (
                        <button 
                          onClick={() => setPackingListSearchQuery('')}
                          className="absolute right-3 top-2 text-xs text-slate-400 hover:text-slate-600"
                        >
                          &times;
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Packing Lists Grid / Cards */}
                  <div className="space-y-4">
                    {(() => {
                      const filtered = packingLists.filter(pl => {
                        if (!packingListSearchQuery) return true;
                        const q = packingListSearchQuery.toLowerCase();
                        return (
                          (pl.partyName && pl.partyName.toLowerCase().includes(q)) ||
                          (pl.mobileNo && pl.mobileNo.includes(q)) ||
                          (pl.fromCity && pl.fromCity.toLowerCase().includes(q)) ||
                          (pl.toCity && pl.toCity.toLowerCase().includes(q)) ||
                          (pl.packingListNo && String(pl.packingListNo).includes(q))
                        );
                      });

                      if (filtered.length === 0) {
                        return (
                          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-12 text-center">
                            <PackageCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <h3 className="text-base font-bold text-slate-700">No Packing Lists Found</h3>
                            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                              {packingListSearchQuery ? 'No results matched your search query.' : 'Click "Add" above to create your first packing list.'}
                            </p>
                            <button
                              onClick={() => {
                                setAdminTab('add-packing');
                                setEditingPackingListId(null);
                                setPackingListForm({ ...initialPackingListForm, packingListNo: String(packingLists.length + 1), items: [] });
                              }}
                              className="mt-4 bg-[#0284c7] hover:bg-sky-700 text-white px-5 py-2 rounded-xl text-xs font-semibold shadow-xs"
                            >
                              Create New Packing List
                            </button>
                          </div>
                        );
                      }

                      return filtered.map((pl, idx) => {
                        const totalItemCount = pl.items?.reduce((s, it) => s + (parseInt(String(it.qty)) || 1), 0) || (pl.items?.length || 0);
                        const distinctBoxes = new Set((pl.items || []).map(it => String(it.boxNo || '').trim()).filter(Boolean)).size || 1;
                        const totalVal = pl.items?.reduce((s, it) => s + (parseFloat(String(it.value)) || 0), 0) || 0;

                        return (
                          <div 
                            key={pl.id} 
                            className="bg-white rounded-2xl shadow-xs border border-slate-200 p-5 sm:p-6 hover:shadow-md transition-shadow relative"
                          >
                            {/* Card Top Row */}
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-[#0284c7] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                                  {idx + 1}
                                </div>
                                <div>
                                  <span className="text-base font-bold text-[#0f172a] block leading-tight">
                                    {pl.partyName}
                                  </span>
                                  <span className="text-xs text-slate-500">
                                    Packing List #{pl.packingListNo} • {pl.packingListDate}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                  {pl.status || 'Packed'}
                                </span>
                              </div>
                            </div>

                            {/* Middle Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-2">
                              {/* Route From/To */}
                              <div className="space-y-3">
                                <div className="flex items-start gap-2.5">
                                  <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 mt-0.5">
                                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                                  </div>
                                  <div>
                                    <div className="text-[11px] text-slate-400 font-medium">From</div>
                                    <div className="text-xs font-bold text-slate-800">
                                      {pl.fromCity || 'Bhubaneswar'}{pl.fromArea ? `, ${pl.fromArea}` : ''}{pl.fromState && pl.fromState !== 'N/A' ? `, ${pl.fromState}` : ''}
                                      {pl.fromFloor ? ` (${pl.fromFloor})` : ''}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-start gap-2.5">
                                  <div className="w-6 h-6 rounded-full bg-[#0284c7] text-white flex items-center justify-center shrink-0 mt-0.5">
                                    <MapPin className="w-3.5 h-3.5" />
                                  </div>
                                  <div>
                                    <div className="text-[11px] text-slate-400 font-medium">To</div>
                                    <div className="text-xs font-bold text-slate-800">
                                      {pl.toCity || 'Destination'}{pl.toArea ? `, ${pl.toArea}` : ''}{pl.toState && pl.toState !== 'N/A' ? `, ${pl.toState}` : ''}
                                      {pl.toFloor ? ` (${pl.toFloor})` : ''}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Metrics & Mobile */}
                              <div className="space-y-2 md:pl-6 border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0">
                                <div className="flex items-center gap-3">
                                  <div className="w-6 h-6 rounded-full bg-sky-100 text-[#0284c7] flex items-center justify-center shrink-0">
                                    <Phone className="w-3 h-3" />
                                  </div>
                                  <div>
                                    <div className="text-[11px] text-slate-400 font-medium">Phone</div>
                                    <a href={`tel:${pl.mobileNo}`} className="text-xs font-bold text-[#0284c7] hover:underline">
                                      {pl.mobileNo || 'N/A'}
                                    </a>
                                  </div>
                                </div>

                                <div className="flex items-center gap-4 pt-1">
                                  <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 flex-1">
                                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Items</div>
                                    <div className="text-sm font-black text-slate-900">{totalItemCount} Items</div>
                                  </div>
                                  <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 flex-1">
                                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Boxes</div>
                                    <div className="text-sm font-black text-[#0284c7]">{distinctBoxes} Boxes</div>
                                  </div>
                                  {totalVal > 0 && (
                                    <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 flex-1">
                                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Value</div>
                                      <div className="text-sm font-black text-emerald-700">₹{totalVal.toLocaleString('en-IN')}</div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Bottom 5 Circular Action Buttons */}
                            <div className="flex items-center justify-center gap-5 sm:gap-7 pt-4 border-t border-slate-100 mt-4">
                              {/* Open -> Opens Packing List PDF Modal */}
                              <button 
                                onClick={() => setViewingPackingList(pl)}
                                className="flex flex-col items-center gap-1 group cursor-pointer"
                                title="Open Packing List PDF"
                              >
                                <div className="w-9 h-9 rounded-full bg-[#0284c7] text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                                  <FileText className="w-4 h-4" />
                                </div>
                                <span className="text-[11px] font-bold text-[#0284c7]">Open</span>
                              </button>

                              {/* Share */}
                              <button 
                                onClick={() => handleSharePackingList(pl)}
                                className="flex flex-col items-center gap-1 group cursor-pointer"
                                title="Share Packing List"
                              >
                                <div className="w-9 h-9 rounded-full bg-[#10b981] text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                                  <Share2 className="w-4 h-4" />
                                </div>
                                <span className="text-[11px] font-bold text-[#10b981]">Share</span>
                              </button>

                              {/* Edit */}
                              <button 
                                onClick={() => handleEditPackingList(pl)}
                                className="flex flex-col items-center gap-1 group cursor-pointer"
                                title="Edit Packing List"
                              >
                                <div className="w-9 h-9 rounded-full bg-[#06b6d4] text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                                  <Edit className="w-4 h-4" />
                                </div>
                                <span className="text-[11px] font-bold text-[#06b6d4]">Edit</span>
                              </button>

                              {/* Delete */}
                              <button 
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeletePackingList(pl);
                                }}
                                className="flex flex-col items-center gap-1 group cursor-pointer"
                                title="Delete Packing List"
                              >
                                <div className="w-9 h-9 rounded-full bg-[#f87171] text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                                  <Trash2 className="w-4 h-4" />
                                </div>
                                <span className="text-[11px] font-bold text-[#f87171]">Delete</span>
                              </button>

                              {/* Download PDF */}
                              <button 
                                onClick={() => setViewingPackingList(pl)}
                                className="flex flex-col items-center gap-1 group cursor-pointer"
                                title="View & Download Packing List PDF"
                              >
                                <div className="w-9 h-9 rounded-full bg-[#0f172a] text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                                  <Download className="w-4 h-4" />
                                </div>
                                <span className="text-[11px] font-bold text-[#0f172a]">Download</span>
                              </button>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              )}

              {/* CAR CONDITION INSPECTION VIEW */}
              {adminTab === 'car-condition' && (
                <div className="space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl shadow-xs border border-slate-200">
                    <div>
                      <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Car className="w-5 h-5 text-sky-500" />
                        Car Condition Inspection Report
                      </h2>
                      <p className="text-xs text-slate-500">Record vehicle checklist, fuel level, accessories, and scratch details prior to transit</p>
                    </div>
                    {viewingCarCondition && (
                      <button 
                        type="button" 
                        onClick={() => window.print()} 
                        className="bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <Printer className="w-4 h-4" />
                        <span>Print Report</span>
                      </button>
                    )}
                  </div>

                  <form onSubmit={(e) => { e.preventDefault(); handleSaveCarCondition(); }} className="space-y-6">
                    {/* Basic Info */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Owner / Client Name *</label>
                        <input 
                          type="text" 
                          list="upl-customer-parties-datalist"
                          value={carForm.ownerName}
                          onChange={(e) => {
                            const val = e.target.value;
                            const match = customerProfiles.find(c => c.partyName.toLowerCase() === val.toLowerCase());
                            if (match) {
                              setCarForm(prev => ({
                                ...prev,
                                ownerName: val,
                                mobileNo: match.mobileNo || prev.mobileNo,
                                fromCity: match.fromCity || prev.fromCity,
                                toCity: match.toCity || prev.toCity
                              }));
                            } else {
                              setCarForm(prev => ({ ...prev, ownerName: val }));
                            }
                          }}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm outline-none focus:border-sky-500"
                          placeholder="Client Name"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile No.</label>
                        <input 
                          type="text" 
                          value={carForm.mobileNo}
                          onChange={(e) => setCarForm({ ...carForm, mobileNo: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm outline-none focus:border-sky-500"
                          placeholder="Phone Number"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Report / Ticket No.</label>
                        <input 
                          type="text" 
                          value={carForm.reportNo}
                          onChange={(e) => setCarForm({ ...carForm, reportNo: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm outline-none focus:border-sky-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Car Make & Model</label>
                        <input 
                          type="text" 
                          value={carForm.carMakeModel}
                          onChange={(e) => setCarForm({ ...carForm, carMakeModel: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm outline-none focus:border-sky-500"
                          placeholder="e.g. Hyundai Creta"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Registration No.</label>
                        <input 
                          type="text" 
                          value={carForm.regNo}
                          onChange={(e) => setCarForm({ ...carForm, regNo: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm outline-none focus:border-sky-500"
                          placeholder="e.g. OD-02-AX-1234"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Odometer Reading (KM)</label>
                        <input 
                          type="text" 
                          value={carForm.odometerKm}
                          onChange={(e) => setCarForm({ ...carForm, odometerKm: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm outline-none focus:border-sky-500"
                          placeholder="e.g. 24500"
                        />
                      </div>
                    </div>

                    {/* Accessories Checklist matching screenshot */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                      <h3 className="text-sm font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                        <span>Car Accessories Checklist</span>
                        <span className="text-xs text-slate-400 font-normal">Check all present items</span>
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 text-sm font-medium text-slate-800">
                        {[
                          { key: 'toolKit', label: 'Tool Kit' },
                          { key: 'jack', label: 'Jack' },
                          { key: 'wiperArms', label: 'Wiper Arms & Blades' },
                          { key: 'mudFlap', label: 'Mud Flap' },
                          { key: 'floorRubberCarpet', label: 'Floor Rubber Carpet' },
                          { key: 'carCover', label: 'Car Cover' },
                          { key: 'spareWheel', label: 'Spare Wheel' },
                          { key: 'stereoMusicPlayer', label: 'Stereo / Music Player' },
                        ].map((item) => (
                          <label key={item.key} className="flex items-center gap-2.5 cursor-pointer bg-slate-50 p-2.5 rounded-xl border border-slate-200 hover:bg-sky-50 transition-colors">
                            <input 
                              type="checkbox" 
                              checked={(carForm as any)[item.key]} 
                              onChange={(e) => setCarForm({ ...carForm, [item.key]: e.target.checked })}
                              className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500"
                            />
                            <span>{item.label}</span>
                          </label>
                        ))}
                      </div>

                      <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Fuel (Petrol/Diesel/Ltr)</label>
                          <input 
                            type="text" 
                            value={carForm.fuelPetrolLtr}
                            onChange={(e) => setCarForm({ ...carForm, fuelPetrolLtr: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm outline-none focus:border-sky-500"
                            placeholder="e.g. Half Tank / 15 Liters"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Battery & Keys Detail</label>
                          <input 
                            type="text" 
                            value={carForm.batteryBrand}
                            onChange={(e) => setCarForm({ ...carForm, batteryBrand: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm outline-none focus:border-sky-500"
                            placeholder="e.g. Exide 12V + 2 Keys"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Other Details matching screenshot image.png (Cyan Header Badge & Border) */}
                    <div className="border-2 border-[#38bdf8] rounded-2xl p-6 pt-8 relative bg-white shadow-xs">
                      <span className="absolute -top-3.5 left-4 bg-[#38bdf8] text-white px-4 py-1 rounded-md text-xs font-bold shadow-xs">
                        Other Details
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Any Other Accessories</label>
                          <textarea 
                            rows={5}
                            value={carForm.otherAccessories}
                            onChange={(e) => setCarForm({ ...carForm, otherAccessories: e.target.value })}
                            placeholder="List additional accessories like dashcam, seat covers, perfume..."
                            className="w-full border border-slate-300 rounded-xl p-3 text-sm text-slate-800 outline-none focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8] resize-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Any Remark</label>
                          <textarea 
                            rows={5}
                            value={carForm.remarks}
                            onChange={(e) => setCarForm({ ...carForm, remarks: e.target.value })}
                            placeholder="Scratch notes, body condition, or special transport instructions..."
                            className="w-full border border-slate-300 rounded-xl p-3 text-sm text-slate-800 outline-none focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8] resize-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <button 
                        type="submit" 
                        className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm px-8 py-3 rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-2"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                        <span>Save Car Condition Report</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* VEHICLE CONDITION REPORTS */}
              {adminTab === 'car-condition' && (
                <CarConditionView
                  carConditions={carConditions}
                  onSave={(rec) => {
                    const exists = carConditions.some(c => c.id === rec.id);
                    if (exists) {
                      setCarConditions(carConditions.map(c => c.id === rec.id ? rec : c));
                    } else {
                      setCarConditions([rec, ...carConditions]);
                    }
                    setShareToast(`Car Condition Report #${rec.reportNo} saved!`);
                    setTimeout(() => setShareToast(null), 3000);
                  }}
                  onDelete={(id) => {
                    setCarConditions(prev => prev.filter(c => c.id !== id));
                    setShareToast('Car Condition Report deleted.');
                    setTimeout(() => setShareToast(null), 3000);
                  }}
                  customerProfiles={customerProfiles}
                  globalSignature={globalSignature}
                  initialViewMode={carConditionViewMode}
                  companyProfile={companyProfile}
                />
              )}

              {adminTab === 'bike-condition' && (
                <BikeConditionView
                  bikeConditions={bikeConditions}
                  onSave={(rec) => {
                    const exists = bikeConditions.some(b => b.id === rec.id);
                    if (exists) {
                      setBikeConditions(bikeConditions.map(b => b.id === rec.id ? rec : b));
                    } else {
                      setBikeConditions([rec, ...bikeConditions]);
                    }
                    setShareToast(`Bike Condition Report #${rec.reportNo} saved!`);
                    setTimeout(() => setShareToast(null), 3000);
                  }}
                  onDelete={(id) => {
                    setBikeConditions(prev => prev.filter(b => b.id !== id));
                    setShareToast('Bike Condition Report deleted.');
                    setTimeout(() => setShareToast(null), 3000);
                  }}
                  customerProfiles={customerProfiles}
                  globalSignature={globalSignature}
                  initialViewMode={bikeConditionViewMode}
                  companyProfile={companyProfile}
                />
              )}

              {/* BILTY L.R. VIEW */}
              {(adminTab === 'add-bilty' || adminTab === 'list-bilty') && (
                <BiltyView
                  initialViewMode={adminTab === 'list-bilty' ? 'list' : 'form'}
                  bilties={bilties}
                  onSave={(rec) => {
                    const exists = bilties.some(b => b.id === rec.id);
                    if (exists) {
                      setBilties(bilties.map(b => b.id === rec.id ? rec : b));
                    } else {
                      setBilties([rec, ...bilties]);
                    }
                    setShareToast(`L.R. Bilty #${rec.biltyNo} saved!`);
                    setTimeout(() => setShareToast(null), 3000);
                  }}
                  onDelete={(id) => {
                    setBilties(prev => prev.filter(b => b.id !== id));
                    setShareToast('L.R. Bilty deleted.');
                    setTimeout(() => setShareToast(null), 3000);
                  }}
                  customerProfiles={customerProfiles}
                  globalSignature={globalSignature}
                  companyProfile={companyProfile}
                />
              )}

              {/* BILL / TAX INVOICE VIEW */}
              {adminTab === 'bill' && (
                <BillView
                  bills={bills}
                  onSave={(rec) => {
                    const exists = bills.some(b => b.id === rec.id);
                    if (exists) {
                      setBills(bills.map(b => b.id === rec.id ? rec : b));
                    } else {
                      setBills([rec, ...bills]);
                    }
                    setShareToast(`GST Bill #${rec.billNo} saved!`);
                    setTimeout(() => setShareToast(null), 3000);
                  }}
                  onDelete={(id) => {
                    setBills(prev => prev.filter(b => b.id !== id));
                    setShareToast('GST Bill deleted.');
                    setTimeout(() => setShareToast(null), 3000);
                  }}
                  customerProfiles={customerProfiles}
                  globalSignature={globalSignature}
                  companyProfile={companyProfile}
                />
              )}

              {/* MONEY RECEIPT VIEW */}
              {adminTab === 'money-receipt' && (
                <MoneyReceiptView
                  moneyReceipts={moneyReceipts}
                  onSave={(rec) => {
                    const exists = moneyReceipts.some(m => m.id === rec.id);
                    if (exists) {
                      setMoneyReceipts(moneyReceipts.map(m => m.id === rec.id ? rec : m));
                    } else {
                      setMoneyReceipts([rec, ...moneyReceipts]);
                    }
                    setShareToast(`Money Receipt #${rec.receiptNo} saved!`);
                    setTimeout(() => setShareToast(null), 3000);
                  }}
                  onDelete={(id) => {
                    setMoneyReceipts(prev => prev.filter(m => m.id !== id));
                    setShareToast('Money Receipt deleted.');
                    setTimeout(() => setShareToast(null), 3000);
                  }}
                  customerProfiles={customerProfiles}
                  globalSignature={globalSignature}
                  companyProfile={companyProfile}
                />
              )}

              {/* PAYMENT VOUCHER VIEW */}
              {adminTab === 'payment-voucher' && (
                <PaymentVoucherView
                  vouchers={vouchers}
                  onSave={(rec) => {
                    const exists = vouchers.some(v => v.id === rec.id);
                    if (exists) {
                      setVouchers(vouchers.map(v => v.id === rec.id ? rec : v));
                    } else {
                      setVouchers([rec, ...vouchers]);
                    }
                    setShareToast(`Payment Voucher #${rec.voucherNo} saved!`);
                    setTimeout(() => setShareToast(null), 3000);
                  }}
                  onDelete={(id) => {
                    setVouchers(prev => prev.filter(v => v.id !== id));
                    setShareToast('Payment Voucher deleted.');
                    setTimeout(() => setShareToast(null), 3000);
                  }}
                  globalSignature={globalSignature}
                  companyProfile={companyProfile}
                />
              )}

              {/* SETUP VIEWS (Company Profile, Signature, Settings, Contact Us) */}
              {(adminTab === 'company-profile' || adminTab === 'signature' || adminTab === 'settings' || adminTab === 'contact-us') && (
                <SetupView
                  activeTab={adminTab as any}
                  globalSignature={globalSignature}
                  onSaveSignature={(sig) => {
                    setGlobalSignature(sig);
                    setShareToast('Digital signature saved & updated globally across all PDF templates!');
                    setTimeout(() => setShareToast(null), 3000);
                  }}
                  profile={{
                    companyName: companyProfile.companyName || 'UrbanPro Packer & Logistics',
                    brandName: companyProfile.groupName || 'M/s Prakash & Company India',
                    tagline: 'Pack Smart & Move Safe',
                    gstin: companyProfile.gstin || '22CCQPS8419D1ZC',
                    panNo: companyProfile.panNo || 'AKMPV0774C',
                    regAddress: companyProfile.regAddress || companyProfile.addressLine1 || 'Ward No. 3, Near Old SBI ATM, Dipka, Korba, CG – 495452',
                    branchAddress: companyProfile.addressLine2 || 'Plot No. 1491, Balianta Canal Road, Near Lenskart, Hanspal, Bhubaneswar, Odisha – 752101',
                    phone1: companyProfile.mobilePrimary || '8093017400',
                    phone2: companyProfile.mobileSecondary || '8093017402',
                    email: companyProfile.email || 'urbanpro403@gmail.com',
                    website: 'https://urbanprologistics.com',
                    bankName: companyProfile.bankName || 'State Bank of India',
                    bankAccNo: companyProfile.accountNo || '30789330266',
                    bankIfsc: companyProfile.ifscCode || 'SBIN0009343',
                    bankBranch: companyProfile.bankBranch || 'Dipka, Korba',
                    upiId: companyProfile.upiId || '8093017400@sbi',
                    termsAndConditions: 'Goods transported at owner risk.'
                  }}
                  onSaveProfile={(p) => {
                    setCompanyProfile({
                      ...companyProfile,
                      companyName: p.companyName,
                      groupName: p.brandName,
                      gstin: p.gstin,
                      panNo: p.panNo,
                      regAddress: p.regAddress,
                      addressLine1: `Regd. Office: M/s Prakash & Company India, ${p.regAddress}`,
                      addressLine2: `Main Operational Office: ${p.branchAddress}`,
                      mobilePrimary: p.phone1,
                      mobileSecondary: p.phone2,
                      email: p.email,
                      bankName: p.bankName,
                      accountNo: p.bankAccNo,
                      ifscCode: p.bankIfsc,
                      bankBranch: p.bankBranch,
                      accountHolder: p.brandName || 'M/s Prakash & Company India'
                    });
                    setShareToast('Company settings saved successfully!');
                    setTimeout(() => setShareToast(null), 3000);
                  }}
                />
              )}
            </div>
            <div 
              onClick={() => setAdminTab(adminTab === 'add-survey' ? 'list-survey' : 'add-survey')}
              className="fixed bottom-6 right-6 w-12 h-12 bg-slate-900 hover:bg-slate-800 text-white rounded-full shadow-lg flex items-center justify-center cursor-pointer transition-transform hover:scale-105 z-30"
              title={adminTab === 'add-survey' ? "View All Surveys" : "Add Survey"}
            >
              <Link2 className="w-5 h-5 text-sky-400" />
            </div>
          </main>
        </div>

        {/* Mobile Bottom Navigation Bar for Phone Ergonomics */}
        <nav className="fixed bottom-0 left-0 right-0 z-30 bg-[#0f172a]/95 backdrop-blur-md border-t border-slate-800 px-1 py-1.5 flex items-center justify-around md:hidden shadow-2xl">
          <button 
            type="button"
            onClick={() => handleTabSelect('dashboard')} 
            className={`flex flex-col items-center py-1 px-2.5 rounded-xl text-[10px] font-medium transition-colors cursor-pointer ${adminTab === 'dashboard' ? 'text-sky-400 font-bold bg-sky-950/60' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <LayoutDashboard className="w-5 h-5 mb-0.5" />
            <span>Home</span>
          </button>
          <button 
            type="button"
            onClick={() => handleTabSelect('list-quotation')} 
            className={`flex flex-col items-center py-1 px-2.5 rounded-xl text-[10px] font-medium transition-colors relative cursor-pointer ${adminTab.includes('quotation') ? 'text-amber-400 font-bold bg-amber-950/60' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <FileText className="w-5 h-5 mb-0.5" />
            <span>Quotes</span>
            {quotations.length > 0 && <span className="absolute top-0.5 right-1 w-3.5 h-3.5 bg-amber-500 text-slate-950 text-[8.5px] font-black rounded-full flex items-center justify-center">{quotations.length}</span>}
          </button>
          <button 
            type="button"
            onClick={() => handleTabSelect('bill')} 
            className={`flex flex-col items-center py-1 px-2.5 rounded-xl text-[10px] font-medium transition-colors relative cursor-pointer ${adminTab === 'bill' ? 'text-blue-400 font-bold bg-blue-950/60' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <FileText className="w-5 h-5 mb-0.5" />
            <span>GST Bills</span>
            {bills.length > 0 && <span className="absolute top-0.5 right-1 w-3.5 h-3.5 bg-blue-500 text-white text-[8.5px] font-black rounded-full flex items-center justify-center">{bills.length}</span>}
          </button>
          <button 
            type="button"
            onClick={() => handleTabSelect('list-bilty')} 
            className={`flex flex-col items-center py-1 px-2.5 rounded-xl text-[10px] font-medium transition-colors relative cursor-pointer ${adminTab.includes('bilty') ? 'text-emerald-400 font-bold bg-emerald-950/60' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Truck className="w-5 h-5 mb-0.5" />
            <span>Bilty</span>
            {bilties.length > 0 && <span className="absolute top-0.5 right-1 w-3.5 h-3.5 bg-emerald-500 text-white text-[8.5px] font-black rounded-full flex items-center justify-center">{bilties.length}</span>}
          </button>
          <button 
            type="button"
            onClick={() => setSidebarOpen(true)} 
            className="flex flex-col items-center py-1 px-2.5 rounded-xl text-[10px] font-medium text-slate-300 hover:text-white cursor-pointer"
          >
            <Menu className="w-5 h-5 mb-0.5 text-sky-400" />
            <span>All Tools</span>
          </button>
        </nav>

        {/* Modals and Toasts inside Admin View */}
        {renderSharedModalsAndToasts()}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-red-100 selection:text-red-900">
      {/* Top Bar */}
      <div className="bg-blue-900 text-white text-sm py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-4">
            <a href="mailto:urbanpro403@gmail.com" className="flex items-center gap-2 hover:text-red-300 transition-colors">
              <Mail className="w-4 h-4 text-red-500" />
              <span>urbanpro403@gmail.com</span>
            </a>
          </div>
          <div className="flex items-center gap-4 font-medium">
            <span className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-yellow-400" />
              <span>Call Us:</span>
              <a href="tel:8093017400" className="hover:text-yellow-300 transition-colors">8093017400</a>,
              <a href="tel:8093017401" className="hover:text-yellow-300 transition-colors">401</a>,
              <a href="tel:8093017402" className="hover:text-yellow-300 transition-colors">402</a>
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="bg-white sticky top-0 z-50 border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img src={activeAppLogo || '/urbanpro%20logo.jpeg'} alt="UrbanPro Packer & Logistics" className="h-14 sm:h-16 w-auto object-contain" />
            <div className="ml-4 leading-tight hidden sm:block" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
              <div className="text-2xl font-black tracking-tight">
                <span style={{ color: '#1e3a8a' }}>Urban</span><span style={{ color: '#dc2626' }}>Pro</span>
              </div>
              <div className="text-xs font-extrabold tracking-wider uppercase" style={{ color: '#1e3a8a' }}>
                Packers & Logistics
              </div>
            </div>
          </div>
          <div className="hidden lg:flex items-center gap-6 font-medium text-slate-600 text-sm">
            <a href="#services" className="hover:text-blue-900 transition-colors">Services</a>
            <a href="#about" className="hover:text-blue-900 transition-colors">About Us</a>
            <a href="#packing-labour" className="hover:text-blue-900 transition-colors">Materials & Labour</a>
            <a href="#why-choose-us" className="hover:text-blue-900 transition-colors">Why Choose Us</a>
            <a href="#network" className="hover:text-blue-900 transition-colors">Network</a>
            <a href="#contact" className="hover:text-blue-900 transition-colors">Contact</a>
          </div>
          <div className="flex items-center gap-3">
            <a 
              href="https://wa.me/918093017400?text=Hi%20UrbanPro%20Packers%20%26%20Logistics%2C%20I%20would%20like%20to%20get%20a%20free%20quote%20for%20my%20relocation." 
              target="_blank" 
              rel="noopener noreferrer" 
              className="bg-[#25D366] hover:bg-[#20ba5a] text-white px-4 py-2.5 rounded-lg font-bold transition-all shadow-md text-xs sm:text-sm flex items-center gap-2 cursor-pointer hover:scale-105"
            >
              <WhatsAppIcon className="w-4 h-4 fill-white text-white" />
              <span>Get Free Quote</span>
            </a>
            <button
              type="button"
              onClick={() => setIsAdminView(true)}
              className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded font-semibold text-xs sm:text-sm transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
              title="Open Admin & Inventory Management"
            >
              <Lock className="w-3.5 h-3.5 text-yellow-400" />
              <span>Admin Portal</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-blue-900 pt-12 pb-20 px-4 overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full border-[40px] border-white"></div>
          <div className="absolute bottom-12 -left-12 w-48 h-48 rounded-full border-[20px] border-white"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Hero Text */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="text-white space-y-6"
            >
              <div className="inline-flex items-center gap-2 bg-blue-800/60 backdrop-blur-sm border border-blue-600 rounded-full px-4 py-1.5 text-xs sm:text-sm font-semibold text-yellow-300">
                <ShieldCheck className="w-4 h-4 text-yellow-400" />
                “Pack Smart & Move Safe with UrbanPro”
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight">
                Your Trusted Partner for <br />
                <span className="text-yellow-400">Packer & Mover, Relocation & Logistics</span>
              </h1>
              <p className="text-base sm:text-lg text-blue-100 max-w-xl leading-relaxed">
                UrbanPro Packer & Logistics provides professional and reliable Packer & Mover, Relocation, and Transportation services with Packing Material & Labour Supply for Households, Offices, Businesses, and Commercial Shifting requirements.
              </p>
              
              <div className="flex flex-wrap gap-3 pt-2">
                <a
                  href="https://wa.me/918093017400?text=Hi%20UrbanPro%20Packers%20%26%20Logistics%2C%20I%20would%20like%20to%20get%20a%20free%20quote%20for%20my%20relocation."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold px-6 py-3 rounded-lg shadow-lg transition-all flex items-center gap-2.5 text-sm uppercase tracking-wide cursor-pointer hover:scale-105"
                >
                  <WhatsAppIcon className="w-5 h-5 fill-white text-white" />
                  <span>Get Free Quote On WhatsApp</span>
                </a>
                <a
                  href="tel:8093017400"
                  className="bg-yellow-400 hover:bg-yellow-500 text-blue-950 font-bold px-6 py-3 rounded-lg shadow-lg transition-all flex items-center gap-2 text-sm uppercase tracking-wide cursor-pointer"
                >
                  <Phone className="w-4 h-4" /> Call Now: 8093017400
                </a>
              </div>

              <div className="pt-2 grid grid-cols-2 gap-3 max-w-lg">
                <div className="flex items-center gap-3 bg-blue-800/50 border border-blue-700/60 rounded-lg p-2.5 px-3">
                  <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span className="font-semibold text-xs text-white">100% Safe Delivery</span>
                </div>
                <div className="flex items-center gap-3 bg-blue-800/50 border border-blue-700/60 rounded-lg p-2.5 px-3">
                  <Clock className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                  <span className="font-semibold text-xs text-white">On-Time Execution</span>
                </div>
              </div>
            </motion.div>

            {/* Lead Form */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              id="quote"
              className="bg-white rounded-xl shadow-2xl p-6 sm:p-8 relative"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-red-600 rounded-t-xl"></div>
              <span className="text-xs font-bold text-red-600 uppercase tracking-widest bg-red-50 px-2.5 py-1 rounded">
                Enquiry Form
              </span>
              <h3 className="text-2xl font-bold text-slate-900 mt-2 mb-1">Planning a Move? Get Your Free Quote Today!</h3>
              <p className="text-slate-600 mb-5 text-xs sm:text-sm">
                Tell us about your relocation, packing or transportation requirement. Our team will help you with a suitable solution.
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Name *</label>
                  <input 
                    type="text" 
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-900 focus:border-blue-900 outline-none transition-all text-sm"
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Mobile Number *</label>
                    <input 
                      type="tel" 
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-900 focus:border-blue-900 outline-none transition-all text-sm"
                      placeholder="Enter mobile number"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Email</label>
                    <input 
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-900 focus:border-blue-900 outline-none transition-all text-sm"
                      placeholder="name@example.com"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Moving From *</label>
                    <input 
                      type="text" 
                      name="movingFrom"
                      required
                      value={formData.movingFrom}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-900 focus:border-blue-900 outline-none transition-all text-sm"
                      placeholder="Origin City / Area"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Moving To *</label>
                    <input 
                      type="text" 
                      name="movingTo"
                      required
                      value={formData.movingTo}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-900 focus:border-blue-900 outline-none transition-all text-sm"
                      placeholder="Destination City / Area"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Moving Date *</label>
                    <input 
                      type="date" 
                      name="date"
                      required
                      value={formData.date}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-900 focus:border-blue-900 outline-none transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Service Type Required *</label>
                    <select 
                      name="item"
                      required
                      value={formData.item}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-900 focus:border-blue-900 outline-none transition-all bg-white text-sm"
                    >
                      <option value="" disabled>Select Service Type</option>
                      {itemCategories.map((cat, i) => (
                        <option key={i} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>
                {formData.item === 'Other' && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                  >
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Please Specify</label>
                    <input 
                      type="text" 
                      name="otherItem"
                      required
                      value={formData.otherItem}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-900 focus:border-blue-900 outline-none transition-all text-sm"
                      placeholder="Type your required service details..."
                    />
                  </motion.div>
                )}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Message</label>
                  <textarea 
                    name="message"
                    rows={2}
                    value={formData.message}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-900 focus:border-blue-900 outline-none transition-all text-sm resize-none"
                    placeholder="Any specific items, floor details, or requirements..."
                  ></textarea>
                </div>
                <button 
                  type="submit" 
                  className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold py-3.5 rounded-lg mt-1 transition-all flex items-center justify-center gap-2.5 group uppercase tracking-wide text-sm cursor-pointer shadow-md hover:scale-[1.01]"
                >
                  <WhatsAppIcon className="w-5 h-5 fill-white text-white" />
                  <span>[ GET FREE QUOTE ON WHATSAPP ]</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <span className="text-xs font-bold text-red-600 uppercase tracking-widest bg-red-100/80 px-3.5 py-1.5 rounded-full border border-red-200">
              OUR SERVICES
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-blue-900">Complete Packing, Moving & Logistics Solutions</h2>
            <div className="w-24 h-1 bg-red-600 mx-auto rounded"></div>
            <p className="text-slate-600 max-w-2xl mx-auto text-base sm:text-lg">
              UrbanPro Packer & Logistics provides comprehensive, safe, and dependable shifting solutions tailored to your unique requirements across India.
            </p>
          </div>

          {/* Category 1: SHIFTING SERVICES */}
          <div className="mb-14">
            <div className="flex items-center gap-3 mb-6 pb-3 border-b border-slate-200">
              <div className="w-9 h-9 bg-blue-900 text-yellow-400 rounded-xl flex items-center justify-center font-bold text-sm">
                🏠
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900">Shifting Services</h3>
                <p className="text-xs sm:text-sm text-slate-500">Comprehensive household, office, corporate, and commercial relocation solutions</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.filter(s => s.category === 'Shifting Services').map((service, index) => {
                const globalIndex = services.findIndex(s => s.title === service.title);
                const Icon = service.icon;
                const isExpanded = expandedService === globalIndex;
                return (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="bg-white p-7 rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:border-blue-300 transition-all group flex flex-col h-full"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center group-hover:bg-blue-900 transition-colors">
                        <Icon className="w-7 h-7 text-blue-600 group-hover:text-yellow-400 transition-colors" />
                      </div>
                      <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wider bg-blue-50 px-2.5 py-1 rounded-full">
                        Shifting
                      </span>
                    </div>
                    <h4 className="text-lg font-bold text-slate-900 mb-2">{service.title}</h4>
                    <p className="text-slate-600 leading-relaxed mb-5 flex-grow text-xs sm:text-sm">
                      {service.desc}
                    </p>
                    
                    <div className="mt-auto">
                      <button 
                        type="button"
                        onClick={() => toggleService(globalIndex)}
                        className="flex items-center justify-between w-full text-blue-700 hover:text-blue-900 font-semibold py-2 border-t border-slate-100 group-hover:border-blue-100 transition-colors text-xs sm:text-sm cursor-pointer"
                      >
                        <span>{isExpanded ? 'Hide Details' : 'View Details & Inclusions'}</span>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                      
                      <motion.div 
                        initial={false}
                        animate={{ height: isExpanded ? 'auto' : 0, opacity: isExpanded ? 1 : 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-3 space-y-2.5">
                          {service.details.map((detail, idx) => (
                            <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                              <h5 className="font-bold text-slate-800 text-xs mb-1 flex items-center gap-1.5 text-blue-950">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block"></span>
                                {detail.title}
                              </h5>
                              <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed pl-3">{detail.text}</p>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Category 2: TRANSPORTATION SERVICES */}
          <div className="mb-14">
            <div className="flex items-center gap-3 mb-6 pb-3 border-b border-slate-200">
              <div className="w-9 h-9 bg-yellow-500 text-blue-950 rounded-xl flex items-center justify-center font-bold text-sm">
                🚛
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900">Transportation Services</h3>
                <p className="text-xs sm:text-sm text-slate-500">Vehicle relocation and commercial transportation fleet (Truck, Trailer, 22 Feet)</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              {services.filter(s => s.category === 'Transportation Services').map((service, index) => {
                const globalIndex = services.findIndex(s => s.title === service.title);
                const Icon = service.icon;
                const isExpanded = expandedService === globalIndex;
                return (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="bg-white p-7 rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:border-yellow-400 transition-all group flex flex-col h-full"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center group-hover:bg-blue-900 transition-colors">
                        <Icon className="w-7 h-7 text-amber-600 group-hover:text-yellow-400 transition-colors" />
                      </div>
                      <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider bg-amber-50 px-2.5 py-1 rounded-full">
                        Transportation
                      </span>
                    </div>
                    <h4 className="text-lg font-bold text-slate-900 mb-2">{service.title}</h4>
                    <p className="text-slate-600 leading-relaxed mb-5 flex-grow text-xs sm:text-sm">
                      {service.desc}
                    </p>
                    
                    <div className="mt-auto">
                      <button 
                        type="button"
                        onClick={() => toggleService(globalIndex)}
                        className="flex items-center justify-between w-full text-blue-700 hover:text-blue-900 font-semibold py-2 border-t border-slate-100 group-hover:border-blue-100 transition-colors text-xs sm:text-sm cursor-pointer"
                      >
                        <span>{isExpanded ? 'Hide Details' : 'View Details & Inclusions'}</span>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                      
                      <motion.div 
                        initial={false}
                        animate={{ height: isExpanded ? 'auto' : 0, opacity: isExpanded ? 1 : 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-3 space-y-2.5">
                          {service.details.map((detail, idx) => (
                            <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                              <h5 className="font-bold text-slate-800 text-xs mb-1 flex items-center gap-1.5 text-blue-950">
                                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 inline-block"></span>
                                {detail.title}
                              </h5>
                              <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed pl-3">{detail.text}</p>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Category 3: PACKING MATERIAL & LABOUR SUPPLY */}
          <div>
            <div className="flex items-center gap-3 mb-6 pb-3 border-b border-slate-200">
              <div className="w-9 h-9 bg-emerald-700 text-white rounded-xl flex items-center justify-center font-bold text-sm">
                📦
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900">Packing Material & Labour Supply</h3>
                <p className="text-xs sm:text-sm text-slate-500">Doorstep premium packaging material supply and verified trained manpower support</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              {services.filter(s => s.category === 'Packing Material & Labour Supply').map((service, index) => {
                const globalIndex = services.findIndex(s => s.title === service.title);
                const Icon = service.icon;
                const isExpanded = expandedService === globalIndex;
                return (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="bg-white p-7 rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:border-emerald-300 transition-all group flex flex-col h-full"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center group-hover:bg-blue-900 transition-colors">
                        <Icon className="w-7 h-7 text-emerald-600 group-hover:text-yellow-400 transition-colors" />
                      </div>
                      <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider bg-emerald-50 px-2.5 py-1 rounded-full">
                        Material & Labour
                      </span>
                    </div>
                    <h4 className="text-lg font-bold text-slate-900 mb-2">{service.title}</h4>
                    <p className="text-slate-600 leading-relaxed mb-5 flex-grow text-xs sm:text-sm">
                      {service.desc}
                    </p>
                    
                    <div className="mt-auto">
                      <button 
                        type="button"
                        onClick={() => toggleService(globalIndex)}
                        className="flex items-center justify-between w-full text-blue-700 hover:text-blue-900 font-semibold py-2 border-t border-slate-100 group-hover:border-blue-100 transition-colors text-xs sm:text-sm cursor-pointer"
                      >
                        <span>{isExpanded ? 'Hide Details' : 'View Details & Inclusions'}</span>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                      
                      <motion.div 
                        initial={false}
                        animate={{ height: isExpanded ? 'auto' : 0, opacity: isExpanded ? 1 : 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-3 space-y-2.5">
                          {service.details.map((detail, idx) => (
                            <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                              <h5 className="font-bold text-slate-800 text-xs mb-1 flex items-center gap-1.5 text-blue-950">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                                {detail.title}
                              </h5>
                              <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed pl-3">{detail.text}</p>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="mt-12 text-center">
            <a 
              href="#free-quote"
              className="inline-flex items-center gap-2 bg-blue-900 hover:bg-blue-950 text-white font-bold px-8 py-3.5 rounded-xl shadow-md transition-all text-sm uppercase tracking-wide cursor-pointer"
            >
              [ VIEW ALL SERVICES & GET FREE QUOTE ] <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="py-20 px-4 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold text-red-600 uppercase tracking-widest bg-red-50 px-3.5 py-1.5 rounded-full border border-red-200">
              ABOUT US
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mt-3 mb-4">
              <span className="text-[#1e3a8a]">Urban</span><span className="text-[#dc2626]">Pro</span> <span className="text-[#1e3a8a]">Packers & Logistics</span>
            </h2>
            <p className="text-lg text-slate-700 leading-relaxed font-semibold">
              UrbanPro Packer & Logistics is a professionally managed company led by <strong className="text-blue-900">Mr. Prakash V.</strong>
            </p>
          </div>

          {/* Group Legacy & Background Showcase */}
          <div className="max-w-4xl mx-auto mb-10 bg-gradient-to-br from-blue-900 via-blue-950 to-slate-900 text-white rounded-2xl p-8 sm:p-10 shadow-xl border border-blue-800">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-6">
              <div className="w-16 h-16 bg-yellow-400 text-blue-950 rounded-2xl flex flex-col items-center justify-center font-black flex-shrink-0 shadow-lg">
                <span className="text-xs uppercase tracking-tighter font-bold text-blue-900">ESTD</span>
                <span className="text-2xl leading-none font-black">2009</span>
              </div>
              <div>
                <span className="text-xs font-bold text-yellow-400 uppercase tracking-widest">Company Background & Legacy</span>
                <h3 className="text-2xl font-bold text-white mt-1">M/s Prakash & Company India Group</h3>
              </div>
            </div>
            
            <p className="text-blue-100 text-base sm:text-lg leading-relaxed mb-6 font-normal">
              The group was registered in <strong>2009 in Madhya Pradesh</strong> and has substantial experience in the Transportation sector with a strong foundation in transportation and logistics, sector, the group has undertaken a wide range of transportation-related work over the years.
            </p>

            <p className="text-blue-100 text-base sm:text-lg leading-relaxed mb-6 font-normal">
              For the past five years, <strong>UrbanPro Packer & Logistics</strong> has been providing professional Packer & Mover, relocation, transportation and logistics services across major cities under this Group of company.
            </p>

            {/* State Tags */}
            <div className="mb-6 pt-4 border-t border-blue-800/80">
              <span className="text-xs font-bold text-yellow-400 uppercase tracking-wider block mb-2.5">
                Our Primary Operations & State Network:
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  "Andhra Pradesh",
                  "Assam",
                  "Chhattisgarh",
                  "Delhi",
                  "Goa",
                  "Gujarat",
                  "Haryana",
                  "Karnataka",
                  "Madhya Pradesh",
                  "Maharashtra",
                  "Odisha",
                  "Punjab",
                  "Rajasthan",
                  "Uttar Pradesh",
                  "West Bengal"
                ].map((state, i) => (
                  <span key={i} className="bg-blue-800/80 border border-blue-600/70 text-blue-100 px-3 py-1 rounded-lg text-xs font-medium">
                    {state}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-blue-800/80 text-blue-100 text-sm sm:text-base leading-relaxed">
              <p>
                Our objective is to make every move safe, organized and hassle-free through professional planning, responsible handling and dependable transportation solutions.
              </p>
              <p>
                UrbanPro Packer & Logistics is committed to providing customer-focused services and building long-term relationships based on reliability, professionalism and responsible service.
              </p>
            </div>

            {/* Read More Accordion */}
            <div className="mt-6 pt-4 text-center">
              <button
                type="button"
                onClick={() => setIsAboutExpanded(!isAboutExpanded)}
                className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-blue-950 font-bold px-6 py-2.5 rounded-xl shadow transition-all text-xs uppercase tracking-wide cursor-pointer"
              >
                {isAboutExpanded ? "[ SHOW LESS ]" : "[ READ MORE ]"} {isAboutExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            {isAboutExpanded && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="pt-6 mt-6 border-t border-blue-800 space-y-4 text-xs sm:text-sm text-blue-200"
              >
                <div className="bg-blue-950/60 p-4 rounded-xl border border-blue-700/60">
                  <h5 className="font-bold text-white text-sm mb-1 text-yellow-300">Responsible Handling</h5>
                  <p className="leading-relaxed">Every item, from delicate household chinaware to corporate IT servers, is treated with maximum caution, packing precision, and dedicated transport insurance cover.</p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Vision and Mission Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-7 sm:p-8">
              <div className="w-12 h-12 rounded-xl bg-blue-900 text-yellow-400 flex items-center justify-center font-bold text-xl mb-4 shadow-sm">
                ★
              </div>
              <h3 className="text-xl font-bold text-blue-950 mb-2">Our Vision</h3>
              <p className="text-sm text-slate-700 leading-relaxed">
                To become one of the most trusted and preferred packer and mover brands known for quality, safety, and complete customer satisfaction across India.
              </p>
            </div>

            <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-7 sm:p-8">
              <div className="w-12 h-12 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold text-xl mb-4 shadow-sm">
                🎯
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Our Mission</h3>
              <p className="text-sm text-slate-700 leading-relaxed">
                To deliver dependable, efficient, and affordable shifting solutions with high standards of safety, integrity, and care for every household and commercial client.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PACKING MATERIAL & LABOUR SUPPLY SECTION */}
      <section id="packing-labour" className="py-20 px-4 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-bold text-yellow-400 uppercase tracking-widest bg-yellow-400/10 px-3.5 py-1.5 rounded-full border border-yellow-400/30">
              PACKING MATERIAL & LABOUR SUPPLY
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">Everything You Need for a Smooth Move</h2>
            <div className="w-20 h-1 bg-red-600 mx-auto rounded"></div>
            <p className="text-slate-300 text-base sm:text-lg">
              Need packing Material or Manpower for your shifting requirement?
            </p>
            <p className="text-slate-400 text-sm max-w-2xl mx-auto">
              UrbanPro Packer & Logistics provides packing materials and skilled labour support for household, office, commercial and relocation work.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-10">
            {/* Card 1: Packing Materials Available */}
            <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-8 hover:border-yellow-400 transition-all shadow-lg">
              <div className="flex items-center gap-3.5 mb-6">
                <div className="w-12 h-12 rounded-xl bg-yellow-400/20 text-yellow-400 flex items-center justify-center font-bold">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Packing Materials Available</h3>
                  <span className="text-xs text-yellow-400/90 font-medium">Premium protective packaging grade</span>
                </div>
              </div>

              <ul className="space-y-3">
                {[
                  "Corrugated Boxes & Cartons",
                  "Bubble Wrap",
                  "Stretch Film",
                  "Packing Tape",
                  "Thermocol & Protective Sheets",
                  "Foam & Cushioning Materials",
                  "Wrapping Materials",
                  "Other Packing Materials as Required"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-slate-200 text-sm">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 font-bold text-xs">
                      ✓
                    </div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Card 2: Skilled Labour Available */}
            <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-8 hover:border-sky-400 transition-all shadow-lg">
              <div className="flex items-center gap-3.5 mb-6">
                <div className="w-12 h-12 rounded-xl bg-sky-400/20 text-sky-400 flex items-center justify-center font-bold">
                  <HardHat className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Skilled Labour Available</h3>
                  <span className="text-xs text-sky-400/90 font-medium">Experienced, disciplined & trained crew</span>
                </div>
              </div>

              <ul className="space-y-3">
                {[
                  "Packing Labour",
                  "Loading Labour",
                  "Unloading Labour",
                  "Shifting Labour",
                  "Unpacking Support"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-slate-200 text-sm">
                    <div className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center flex-shrink-0 font-bold text-xs">
                      ✓
                    </div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 p-4 bg-slate-900/80 rounded-xl border border-slate-700/80">
                <h4 className="text-xs font-bold text-yellow-400 uppercase tracking-wider mb-1">Supervisor & Handling Assistance</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Every labour team is coordinated by an experienced supervisor to ensure punctuality, zero breakage, and respectful handling of goods.
                </p>
              </div>
            </div>
          </div>

          {/* Footer Callout */}
          <div className="max-w-3xl mx-auto bg-gradient-to-r from-blue-950 to-slate-900 border border-blue-700/60 rounded-2xl p-6 text-center">
            <p className="text-yellow-300 font-semibold text-base mb-4">
              Whether you require only packing material, only labour, or both, we can arrange support according to your requirement.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a 
                href="#quote"
                className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2.5 rounded-lg transition-colors text-xs uppercase tracking-wide cursor-pointer"
              >
                [ Request Material & Labour Quote ]
              </a>
              <a 
                href="tel:8093017400"
                className="bg-yellow-400 hover:bg-yellow-500 text-blue-950 font-bold px-6 py-2.5 rounded-lg transition-colors text-xs uppercase tracking-wide cursor-pointer flex items-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5" /> Call: 8093017400
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE UrbanPro SECTION */}
      <section id="why-choose-us" className="py-20 px-4 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-3">
            <span className="text-xs font-bold text-blue-900 uppercase tracking-widest bg-blue-50 px-3.5 py-1.5 rounded-full border border-blue-200">
              WHY CHOOSE UrbanPro?
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">Your Move. Our Responsibility.</h2>
            <div className="w-20 h-1 bg-red-600 mx-auto rounded"></div>
            <p className="text-slate-600 max-w-2xl mx-auto text-base">
              We stand out with transparent service, deep industry legacy, and uncompromised safety standards for every client.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              {
                title: "Experienced Team",
                desc: "Backed by substantial experience in the transportation and logistics sector.",
                color: "emerald"
              },
              {
                title: "Professional Service",
                desc: "Systematic planning and organized execution for every relocation.",
                color: "sky"
              },
              {
                title: "Safe Handling",
                desc: "Responsible handling of household, office and commercial belongings.",
                color: "yellow"
              },
              {
                title: "Wide Service Network",
                desc: "Serving major cities across multiple states in India.",
                color: "purple"
              },
              {
                title: "End-to-End Support",
                desc: "From packing and loading to transportation, unloading and delivery.",
                color: "cyan"
              },
              {
                title: "Customer Focused",
                desc: "We believe in clear communication, responsible service and long-term customer relationships.",
                color: "red"
              }
            ].map((item, idx) => (
              <div 
                key={idx} 
                className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-blue-900 text-yellow-400 flex items-center justify-center font-bold text-sm mb-4 shadow-sm">
                    0{idx + 1}
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OUR SERVICE NETWORK SECTION */}
      <section id="network" className="py-20 px-4 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-bold text-red-600 uppercase tracking-widest bg-red-100 px-3.5 py-1.5 rounded-full border border-red-200">
              OUR SERVICE NETWORK
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-blue-900">Serving Major Cities Across India</h2>
            <div className="w-20 h-1 bg-red-600 mx-auto rounded"></div>
            <p className="text-slate-700 text-base sm:text-lg font-medium">
              UrbanPro Packer & Logistics provides services across major cities in:
            </p>
          </div>

          {/* States Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 max-w-5xl mx-auto mb-12">
            {[
              { name: "Andhra Pradesh", hub: "Visakhapatnam / Vijayawada" },
              { name: "Assam", hub: "Guwahati / Dibrugarh / Silchar" },
              { name: "Chhattisgarh", hub: "Dipka / Raipur / Korba" },
              { name: "Delhi NCR", hub: "New Delhi / Noida / Gurgaon" },
              { name: "Goa", hub: "Panaji / Margao / Vasco" },
              { name: "Gujarat", hub: "Ahmedabad / Surat / Vadodara" },
              { name: "Haryana", hub: "Gurugram / Faridabad / Panipat" },
              { name: "Karnataka", hub: "Bengaluru / Mysuru / Hubli" },
              { name: "Madhya Pradesh", hub: "Bhopal / Indore / Jabalpur" },
              { name: "Maharashtra", hub: "Mumbai / Pune / Nagpur" },
              { name: "Odisha", hub: "Bhubaneswar / Cuttack / Rourkela" },
              { name: "Punjab", hub: "Ludhiana / Amritsar / Jalandhar" },
              { name: "Rajasthan", hub: "Jaipur / Jodhpur / Udaipur" },
              { name: "Uttar Pradesh", hub: "Lucknow / Kanpur / Varanasi" },
              { name: "West Bengal", hub: "Kolkata / Siliguri / Durgapur" }
            ].map((state, idx) => (
              <div 
                key={idx}
                className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-blue-500 hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-red-600 flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <h4 className="font-bold text-slate-900 text-base">{state.name}</h4>
                </div>
                <p className="text-xs text-slate-500 font-medium">{state.hub}</p>
              </div>
            ))}
          </div>

          {/* Network Badges */}
          <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-6 bg-blue-900 text-white p-6 rounded-2xl max-w-4xl mx-auto shadow-md">
            <span className="text-xs font-bold text-yellow-400 uppercase tracking-widest">Operation Scope:</span>
            {["Local Shifting", "Intercity Relocation", "Domestic Transport", "Commercial & Fleet Logistics"].map((badge, i) => (
              <span key={i} className="bg-blue-800/90 border border-blue-600 px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                {badge}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="py-20 px-4 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-3">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200">
              HOW IT WORKS
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">Your Move in 4 Simple Steps</h2>
            <div className="w-20 h-1 bg-red-600 mx-auto rounded"></div>
            <p className="text-slate-600 max-w-2xl mx-auto text-base">
              A straightforward and organized process designed to ensure a smooth shifting experience.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-10">
            {[
              {
                step: "01",
                title: "GET IN TOUCH",
                desc: "Share your shifting or transportation requirement with our team.",
                icon: Phone
              },
              {
                step: "02",
                title: "PLAN YOUR MOVE",
                desc: "We understand your requirements and plan the service accordingly.",
                icon: ClipboardList
              },
              {
                step: "03",
                title: "PACK & MOVE",
                desc: "Our team handles packing, loading and transportation with care.",
                icon: Truck
              },
              {
                step: "04",
                title: "SAFE DELIVERY",
                desc: "Your belongings are delivered to the destination as planned.",
                icon: Home
              }
            ].map((step, idx) => {
              const StepIcon = step.icon;
              return (
                <div key={idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-6 relative flex flex-col justify-between hover:shadow-lg hover:border-blue-300 transition-all">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-blue-900 text-yellow-400 rounded-xl flex items-center justify-center font-bold">
                        <StepIcon className="w-6 h-6" />
                      </div>
                      <span className="text-2xl font-black text-slate-300">{step.step}</span>
                    </div>
                    <h3 className="font-bold text-base text-slate-900 mb-2">{step.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center">
            <span className="inline-block bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold px-6 py-2.5 rounded-full shadow-xs">
              Simple Process. Professional Service. Hassle-Free Moving.
            </span>
          </div>
        </div>
      </section>

      {/* MISSION, VISION & VALUES SECTION */}
      <section className="py-20 px-4 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-12">
            {/* OUR MISSION */}
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-blue-900 text-yellow-400 flex items-center justify-center font-bold text-xl mb-4 shadow-sm">
                🎯
              </div>
              <span className="text-xs font-bold text-red-600 uppercase tracking-widest block mb-1">Guiding Purpose</span>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">OUR MISSION</h3>
              <p className="text-sm text-slate-700 leading-relaxed mb-4">
                Our mission is to provide safe, reliable, systematic and customer-focused Packer & Mover & Logistics services.
              </p>
              <p className="text-sm text-slate-600 leading-relaxed">
                We aim to make every relocation convenient and hassle-free through professional planning, responsible handling and dependable transportation solutions.
              </p>
            </div>

            {/* OUR VISION */}
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-blue-900 text-yellow-400 flex items-center justify-center font-bold text-xl mb-4 shadow-sm">
                ★
              </div>
              <span className="text-xs font-bold text-blue-900 uppercase tracking-widest block mb-1">Long-Term Goal</span>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">OUR VISION</h3>
              <p className="text-sm text-slate-700 leading-relaxed">
                Our vision is to establish UrbanPro Packer & Logistics as a trusted and recognized name in India's Packer & Mover and Logistics industry by continuously improving our services and building lasting relationships with our customers.
              </p>
            </div>
          </div>

          {/* OUR VALUES */}
          <div className="max-w-5xl mx-auto bg-gradient-to-r from-blue-950 via-blue-900 to-slate-900 text-white rounded-2xl p-8 text-center shadow-lg border border-blue-800">
            <span className="text-xs font-bold text-yellow-400 uppercase tracking-widest block mb-2">Our Core Principles</span>
            <h4 className="text-2xl font-bold text-white mb-6">Our Values</h4>
            <div className="flex flex-wrap justify-center items-center gap-2.5 sm:gap-4">
              {[
                "Reliability",
                "Safety",
                "Professionalism",
                "Responsibility",
                "Customer Satisfaction",
                "Timely Service"
              ].map((val, idx) => (
                <span 
                  key={idx}
                  className="bg-blue-800/80 border border-blue-600/80 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-blue-100 flex items-center gap-2 shadow-xs"
                >
                  <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                  {val}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* DEDICATED GET A FREE QUOTE SECTION */}
      <section id="free-quote" className="py-20 px-4 bg-white border-t border-slate-200">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 space-y-3">
            <span className="text-xs font-bold text-red-600 uppercase tracking-widest bg-red-50 px-3.5 py-1.5 rounded-full border border-red-200">
              GET A FREE QUOTE
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">Planning a Move? Get Your Free Quote Today!</h2>
            <div className="w-20 h-1 bg-red-600 mx-auto rounded"></div>
            <p className="text-slate-600 text-base max-w-2xl mx-auto">
              Tell us about your relocation, packing or transportation requirement. Our team will help you with a suitable solution.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xl relative">
            <div className="absolute top-0 left-8 right-8 h-2 bg-gradient-to-r from-red-600 via-yellow-400 to-blue-900 rounded-t-3xl"></div>
            <div className="mb-6 flex items-center justify-between border-b border-slate-200 pb-4">
              <span className="text-sm font-bold text-blue-950 uppercase tracking-wider flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-red-600" /> Enquiry Form
              </span>
              <span className="text-xs text-slate-500 font-medium">* Required fields</span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Name *</label>
                <input 
                  type="text" 
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-900 focus:border-blue-900 outline-none transition-all text-sm bg-white"
                  placeholder="Enter your full name"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Mobile Number *</label>
                  <input 
                    type="tel" 
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-900 focus:border-blue-900 outline-none transition-all text-sm bg-white"
                    placeholder="Enter 10-digit mobile number"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Email</label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-900 focus:border-blue-900 outline-none transition-all text-sm bg-white"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Moving From *</label>
                  <input 
                    type="text" 
                    name="movingFrom"
                    required
                    value={formData.movingFrom}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-900 focus:border-blue-900 outline-none transition-all text-sm bg-white"
                    placeholder="Origin City / Area"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Moving To *</label>
                  <input 
                    type="text" 
                    name="movingTo"
                    required
                    value={formData.movingTo}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-900 focus:border-blue-900 outline-none transition-all text-sm bg-white"
                    placeholder="Destination City / Area"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Moving Date *</label>
                  <input 
                    type="date" 
                    name="date"
                    required
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-900 focus:border-blue-900 outline-none transition-all text-sm bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Service Type Required *</label>
                  <select 
                    name="item"
                    required
                    value={formData.item}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-900 focus:border-blue-900 outline-none transition-all bg-white text-sm"
                  >
                    <option value="" disabled>Select Service Type</option>
                    {itemCategories.map((cat, i) => (
                      <option key={i} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {formData.item === 'Other' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                >
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Please Specify</label>
                  <input 
                    type="text" 
                    name="otherItem"
                    required
                    value={formData.otherItem}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-900 focus:border-blue-900 outline-none transition-all text-sm bg-white"
                    placeholder="Type your required service details..."
                  />
                </motion.div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Message</label>
                <textarea 
                  name="message"
                  rows={3}
                  value={formData.message}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-900 focus:border-blue-900 outline-none transition-all text-sm bg-white resize-none"
                  placeholder="Share details about items, floor level, packing preferences, etc."
                ></textarea>
              </div>

              <button 
                type="submit" 
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl mt-2 transition-all flex items-center justify-center gap-2 group uppercase tracking-wider text-sm cursor-pointer shadow-lg hover:shadow-red-500/20"
              >
                [ GET FREE QUOTE ]
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="py-16 px-4 bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900 text-white border-t border-blue-800">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <span className="text-xs font-bold text-yellow-400 uppercase tracking-widest bg-yellow-400/10 px-4 py-1.5 rounded-full border border-yellow-400/30 inline-block">
            FINAL CALL TO ACTION
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">Ready to Move?</h2>
          <p className="text-xl sm:text-2xl font-bold text-yellow-300">
            Pack Smart & Move Safe with UrbanPro
          </p>
          <p className="text-blue-100 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Professional Packer & Mover and Logistics Solutions for Local, Intercity, Domestic and Commercial Requirements.
          </p>
          <div className="pt-4 flex flex-wrap justify-center gap-4">
            <a 
              href="tel:8093017402"
              className="bg-red-600 hover:bg-red-700 text-white font-black px-8 py-4 rounded-xl shadow-xl hover:shadow-red-500/30 transition-all text-sm sm:text-base uppercase tracking-wider inline-flex items-center gap-2 cursor-pointer"
            >
              <Phone className="w-5 h-5" /> [ CALL NOW:- 8093017402 ]
            </a>
            <a 
              href="#free-quote"
              className="bg-yellow-400 hover:bg-yellow-500 text-blue-950 font-black px-8 py-4 rounded-xl shadow-xl transition-all text-sm sm:text-base uppercase tracking-wider inline-flex items-center gap-2 cursor-pointer"
            >
              [ GET A FREE QUOTE ]
            </a>
          </div>
        </div>
      </section>

      {/* Contact & Footer Section */}
      <section id="contact" className="bg-[#0b1329] pt-16 pb-8 px-4 text-white border-t border-slate-800">
        <div className="max-w-7xl mx-auto">
          {/* Main Contact Grid */}
          <div className="mb-14 bg-slate-900/80 rounded-3xl p-6 sm:p-8 lg:p-10 border border-slate-800 shadow-2xl">
            <div className="mb-8">
              <span className="text-xs font-bold text-yellow-400 uppercase tracking-widest bg-yellow-400/10 px-3.5 py-1.5 rounded-full border border-yellow-400/30">
                CONTACT US:
              </span>
              <div className="mt-4 mb-2">
                <div className="inline-flex items-center gap-3.5 bg-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-2xl shadow-xl border border-slate-200">
                  <img 
                    src={activeAppLogo || '/urbanpro%20logo.jpeg'} 
                    alt="UrbanPro Logo" 
                    className="h-9 sm:h-11 w-auto object-contain shrink-0" 
                  />
                  <div className="leading-tight">
                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                      <span className="text-[#1e3a8a]">Urban</span>
                      <span className="text-[#dc2626]">Pro</span>{' '}
                      <span className="text-[#1e3a8a] font-extrabold">Packers & Logistics</span>
                    </h2>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-yellow-400 font-bold text-base sm:text-lg mt-3">
                <PhoneCall className="w-5 h-5 text-yellow-400" />
                <span>All India Customer Care:</span>
                <a href="tel:8093017400" className="text-white hover:text-yellow-300 underline underline-offset-4 transition-colors">
                  8093017400
                </a>
              </div>
            </div>
            
            <div className="grid lg:grid-cols-12 gap-8 items-stretch">
              <div className="lg:col-span-7 space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  {/* MAIN OPERATIONAL OFFICE */}
                  <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2.5 mb-2.5">
                        <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center text-blue-950 font-bold">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <h4 className="font-bold text-xs text-yellow-400 uppercase tracking-wider">MAIN OPERATIONAL OFFICE:-</h4>
                      </div>
                      <p className="text-slate-200 text-xs sm:text-sm leading-relaxed mb-3">
                        Plot No. 1481, Hanspal, Balianta Canal Road, Bhubaneswar, Odisha – 752101
                      </p>
                      <div className="text-xs font-semibold text-slate-300 mb-3 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-yellow-400" /> Office: <a href="tel:8093017401" className="text-white hover:underline">8093017401</a>
                      </div>
                    </div>
                    <a 
                      href="https://maps.app.goo.gl/JGHEcpx2zpnkuA1b6" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-yellow-400 hover:text-yellow-300 transition-colors pt-2 border-t border-slate-700/60"
                    >
                      View on Google Maps <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  {/* REG. OFFICE */}
                  <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2.5 mb-2.5">
                        <div className="w-8 h-8 bg-sky-400 rounded-lg flex items-center justify-center text-blue-950 font-bold">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <h4 className="font-bold text-xs text-sky-300 uppercase tracking-wider">REG. OFFICE:-</h4>
                      </div>
                      <p className="text-slate-200 text-xs sm:text-sm leading-relaxed mb-2 font-medium">
                        M/s Prakash & Company India, Dipka, Korba, Chhattisgarh – 495452
                      </p>
                      <div className="text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-sky-400" /> Mobile: <a href="tel:8093017402" className="text-white hover:underline">8093017402</a>
                      </div>
                      <div className="text-xs font-semibold text-amber-300 mb-2">
                        GST No.: <span className="font-mono text-white">22CCQPS8419D1ZC</span>
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-400 pt-2 border-t border-slate-700/60">
                      Corporate Head / Registered Group Office
                    </span>
                  </div>
                </div>

                {/* BANK DETAILS & DIGITAL CONTACTS */}
                <div className="grid sm:grid-cols-2 gap-4">
                  {/* BANK DETAILS */}
                  <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 bg-emerald-500/20 text-emerald-400 rounded-lg flex items-center justify-center font-bold text-xs">
                        ₹
                      </div>
                      <h4 className="font-bold text-xs text-emerald-400 uppercase tracking-wider">BANK DETAILS:-</h4>
                    </div>
                    <div className="text-xs space-y-1 text-slate-200">
                      <p><span className="text-slate-400">Bank:</span> <strong className="text-white">State Bank of India</strong></p>
                      <p><span className="text-slate-400">Account No.:</span> <strong className="font-mono text-white">30789330266</strong></p>
                      <p><span className="text-slate-400">IFSC Code:</span> <strong className="font-mono text-white">SBIN0009343</strong></p>
                    </div>
                  </div>

                  {/* Email & Web */}
                  <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-7 h-7 bg-red-500/20 text-red-400 rounded-lg flex items-center justify-center">
                          <Mail className="w-3.5 h-3.5" />
                        </div>
                        <h4 className="font-bold text-xs text-red-400 uppercase tracking-wider">Email & Online</h4>
                      </div>
                      <div className="text-xs space-y-1 text-slate-200">
                        <p>
                          <a href="mailto:urbanpro403@gmail.com" className="text-slate-100 hover:text-yellow-300 font-medium transition-colors">
                            urbanpro403@gmail.com
                          </a>
                        </p>
                        <p className="text-slate-400">www.urbanpropacker.com</p>
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-400 pt-2 border-t border-slate-700/60 mt-2">
                      24x7 Digital Inquiry Support
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Map Preview */}
              <div className="lg:col-span-5 w-full min-h-[300px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 relative group cursor-pointer" onClick={() => window.open('https://maps.app.goo.gl/JGHEcpx2zpnkuA1b6', '_blank')}>
                <iframe 
                  src="https://maps.google.com/maps?q=20.3172609,85.8817964&t=&z=16&ie=UTF8&iwloc=&output=embed" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0, pointerEvents: 'none' }} 
                  allowFullScreen={true} 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  title="UrbanPro Packer & Logistics Location"
                  className="absolute inset-0 grayscale group-hover:grayscale-0 transition-all duration-500"
                ></iframe>
                <div className="absolute inset-0 bg-blue-950/20 group-hover:bg-transparent transition-colors z-10 flex items-center justify-center">
                   <div className="bg-white/95 backdrop-blur-sm px-4 py-2.5 rounded-xl text-blue-950 font-bold opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0 shadow-xl flex items-center gap-2 text-xs">
                      View Bhubaneswar Office on Maps <ExternalLink className="w-3.5 h-3.5" />
                   </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-slate-400 text-xs sm:text-sm">
            <div className="flex items-center gap-4">
              <p>© {new Date().getFullYear()} UrbanPro Packer & Logistics. All rights reserved.</p>
              <button onClick={() => setIsAdminView(true)} className="text-slate-400 hover:text-white transition-colors flex items-center gap-1 font-medium cursor-pointer">
                <Lock className="w-3 h-3" /> Admin Login
              </button>
            </div>
            <div className="flex items-center bg-white p-1.5 rounded-lg shadow-sm">
              <img src={activeAppLogo || '/urbanpro%20logo.jpeg'} alt="UrbanPro Logo" className="h-8 w-auto object-contain" />
            </div>
          </div>
        </div>
      </section>

      {/* Floating WhatsApp Quick Action */}
      <a
        href="https://wa.me/918093017400?text=Hi%20UrbanPro%20Packers%20%26%20Logistics%2C%20I%20would%20like%20to%20get%20a%20free%20quote%20for%20my%20relocation."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 bg-[#25D366] hover:bg-[#20ba5a] text-white px-4 py-3 rounded-full shadow-2xl flex items-center gap-2.5 font-bold text-xs sm:text-sm z-50 transition-all hover:scale-110 border-2 border-white cursor-pointer"
        title="Chat on WhatsApp for Free Quote"
      >
        <WhatsAppIcon className="w-5 h-5 fill-white text-white" />
        <span>Get Free Quote</span>
      </a>

      {/* Modals and Toasts inside Website View */}
      {renderSharedModalsAndToasts()}

    </div>
  );
}