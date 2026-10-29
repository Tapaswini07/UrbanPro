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
  AlertCircle,
  Receipt,
  Save,
  Send
} from 'lucide-react';

const WhatsAppIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.99c-.002 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c-.001 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662a11.87 11.87 0 005.709 1.458h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);
import { SurveyPdfModal } from './components/SurveyPdfModal';
import { QuotationPdfModal, numberToIndianWords } from './components/QuotationPdfModal';
import { calculateQuotationTotals, parseChargeNumber, parseChargeDetails, formatChargeValue } from './utils/quotationCalculations';
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
import { findCustomerProfileByMobile } from './utils/customerLookup';
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

type SubmittedQuoteDetails = {
  name: string;
  phone: string;
  movingFrom: string;
  movingTo: string;
  item: string;
  whatsappUrl: string;
};

const readSubmittedQuoteDetails = (): SubmittedQuoteDetails | null => {
  try {
    const saved = window.sessionStorage.getItem('upl_pending_quote_confirmation');
    if (!saved) return null;
    const details = JSON.parse(saved);
    if (
      typeof details.name !== 'string' ||
      typeof details.phone !== 'string' ||
      typeof details.whatsappUrl !== 'string'
    ) {
      return null;
    }
    return details as SubmittedQuoteDetails;
  } catch (error) {
    console.error('Failed to restore enquiry confirmation', error);
    return null;
  }
};

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
    itemRows: [{ name: '', value: '' }],
  });

  const [expandedService, setExpandedService] = useState<number | null>(null);
  const [isAboutExpanded, setIsAboutExpanded] = useState(false);
  const [showAllServicesModal, setShowAllServicesModal] = useState(false);
  const [quoteSubmitted, setQuoteSubmitted] = useState(false);
  const [submittedQuoteDetails, setSubmittedQuoteDetails] = useState<SubmittedQuoteDetails | null>(readSubmittedQuoteDetails);
  const [showQuoteSubmitToast, setShowQuoteSubmitToast] = useState(() => Boolean(readSubmittedQuoteDetails()));

  const [isAdminView, setIsAdminView] = useState(() => {
    try {
      const saved = localStorage.getItem('upl_is_admin_view');
      if (saved !== null) return saved === 'true';
    } catch (e) {}
    return true;
  });
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(true);
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [adminTab, setAdminTab] = useState(() => {
    try {
      const saved = localStorage.getItem('upl_admin_tab');
      if (saved) return saved;
    } catch (e) {}
    return 'list-survey';
  });

  useEffect(() => {
    try {
      localStorage.setItem('upl_is_admin_view', String(isAdminView));
      localStorage.setItem('upl_admin_tab', adminTab);
    } catch (e) {}
  }, [isAdminView, adminTab]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [surveyMenuOpen, setSurveyMenuOpen] = useState(true);
  const ADMIN_PASSWORD = "owner123";

  // Survey State & Helper Functions
  const generateNextSurveyNo = (existingSurveys: any[]): string => {
    const usedNumbers = new Set(
      existingSurveys
        .map(s => Number.parseInt(String(s.surveyNo || '').replace(/\D/g, ''), 10))
        .filter(Number.isFinite)
    );
    let nextNumber = 1;
    while (usedNumbers.has(nextNumber)) nextNumber += 1;
    return String(nextNumber);
  };

  const initialSurveyForm = {
    id: Date.now(),
    surveyNo: '1',
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
    items: [] as {name: string, qty: string, value: string, remark: string}[],
    advancePay: '',
    easyAccess: '',
    balconyItems: '',
    extraInfo: ''
  };

  const [surveyForm, setSurveyForm] = useState(() => ({
    ...initialSurveyForm,
    surveyNo: '1'
  }));
  const [surveys, setSurveys] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('upl_surveys');
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const hasSurveyOne = parsed.some(s => String(s.surveyNo || '').trim() === '1');
          const hasLegacyNumbering = parsed.every(s => {
            const number = Number.parseInt(String(s.surveyNo || '').replace(/\D/g, ''), 10);
            return Number.isFinite(number) && number >= 1000;
          });
          return !hasSurveyOne && hasLegacyNumbering
            ? parsed.map((survey, index) => ({ ...survey, surveyNo: String(index + 1) }))
            : parsed;
        }
      }
    } catch (e) {
      console.error(e);
    }
    // Default sample survey so localhost always starts with visible survey data
    const sampleSurveys = [
      {
        id: 1711800000001,
        surveyNo: '1',
        surveyDate: new Date().toISOString().split('T')[0],
        partyName: 'Rahul Sharma',
        mobileNo: '9876543210',
        email: 'rahul.sharma@gmail.com',
        packingDate: new Date().toISOString().split('T')[0],
        dateOfDelivery: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
        fromCountry: 'India',
        fromState: 'Odisha',
        fromCity: 'Bhubaneswar',
        fromArea: 'Hanspal',
        fromPinCode: '752101',
        fromFloor: '2nd Floor',
        fromLift: 'Available',
        toCountry: 'India',
        toState: 'Odisha',
        toCity: 'Cuttack',
        toArea: 'CDA Sector 9',
        toPinCode: '753014',
        toFloor: '1st Floor',
        toLift: 'Available',
        moveType: 'Household Goods',
        items: [
          { name: 'Double Bed with Mattress', qty: '1', value: '25000', remark: 'Wood' },
          { name: 'Refrigerator (Double Door)', qty: '1', value: '30000', remark: 'LG 260L' },
          { name: 'Sofa Set 3+1+1', qty: '1', value: '35000', remark: 'Fabric' },
          { name: 'Washing Machine (Front Load)', qty: '1', value: '28000', remark: 'Samsung' },
          { name: 'LED TV 55 Inch', qty: '1', value: '45000', remark: 'Box Packed' },
          { name: 'Dining Table with 4 Chairs', qty: '1', value: '18000', remark: 'Glass Top' },
          { name: 'Kitchen Utensils (Cartons)', qty: '6', value: '15000', remark: 'Fragile' },
          { name: 'Clothes & Personal Items (Boxes)', qty: '8', value: '20000', remark: 'Standard' }
        ],
        advancePay: '5000',
        easyAccess: 'Yes',
        balconyItems: 'Nil',
        extraInfo: 'Door to door shifting with packing and unpacking'
      }
    ];
    try {
      localStorage.setItem('upl_surveys', JSON.stringify(sampleSurveys));
    } catch (e) {}
    return sampleSurveys;
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
          parsed.text = 'UrbanPro Packer & Logistics';
        }
        return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return { text: 'UrbanPro Packer & Logistics', image: PRAKASH_SIGNATURE_BASE64 };
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
      setSurveyForm(prev => ({ ...prev, items: [currentItem, ...prev.items] }));
      setCurrentItem({name: '', qty: '1', value: '', remark: ''});
    }
  };

  const removeItemFromSurvey = (index: number) => {
    setSurveyForm(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
  };

  const handleSaveSurvey = () => {
    if (!surveyForm.partyName.trim()) {
      setShareToast('Please enter Party Name');
      setTimeout(() => setShareToast(null), 3000);
      return;
    }

    const currentSurveyNo = String(surveyForm.surveyNo || '').trim();
    const finalSurveyNo = currentSurveyNo || generateNextSurveyNo(surveys);
    surveyForm.surveyNo = finalSurveyNo;

    // Uniqueness validation check across all other records
    const duplicate = surveys.find(
      s => String(s.id) !== String(editingSurveyId) &&
           String(s.surveyNo || '').trim().toLowerCase() === finalSurveyNo.toLowerCase()
    );

    if (duplicate) {
      setSurveyNoWarning(`Survey No. "${finalSurveyNo}" already exists for ${duplicate.partyName || 'another customer'}. Every survey number must be unique.`);
      setShareToast(`âš ï¸ Survey No. "${finalSurveyNo}" is already in use! Please choose a unique number.`);
      setTimeout(() => setShareToast(null), 4000);
      return;
    }

    setSurveyNoWarning(null);
    let updatedSurveys: any[];
    if (editingSurveyId) {
      updatedSurveys = surveys.map(s => String(s.id) === String(editingSurveyId) ? { ...surveyForm, surveyNo: finalSurveyNo, id: s.id } : s);
      setSurveys(updatedSurveys);
      setShareToast(`âœ“ Survey #${finalSurveyNo} updated successfully!`);
    } else {
      const newSurvey = { ...surveyForm, surveyNo: finalSurveyNo, id: Date.now() };
      updatedSurveys = [newSurvey, ...surveys];
      setSurveys(updatedSurveys);
      setShareToast(`âœ“ Survey #${newSurvey.surveyNo} created and saved successfully!`);
    }

    // Direct synchronous save to localStorage
    try {
      localStorage.setItem('upl_surveys', JSON.stringify(updatedSurveys));
    } catch (e) {
      console.error('Failed to save survey to localStorage', e);
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
    const numericQuery = Number.parseInt(query, 10);
    const match = surveys.find(
      s => String(s.surveyNo || '').trim().toLowerCase() === query ||
           (Number.isInteger(numericQuery) &&
             Number.parseInt(String(s.surveyNo || '').trim(), 10) === numericQuery)
    );

    if (!match) {
      setShareToast(`No survey found matching "${surveyNoOrId}"`);
      setTimeout(() => setShareToast(null), 3000);
      return;
    }

    const surveyItems = (match.items || []).filter((item: any) => item.name?.trim());
    const surveyItemsSummary = surveyItems.length > 0
      ? `Survey items: ${surveyItems.map((item: any) => `${item.name} (Qty: ${item.qty || 1}, Value: ${item.value || 0})`).join(', ')}`
      : '';
    const surveyGoodsValue = surveyItems.reduce((total: number, item: any) => {
      const value = Number.parseFloat(String(item.value || '').replace(/,/g, ''));
      return total + (Number.isFinite(value) ? value : 0);
    }, 0);

    setQuotationForm(prev => ({
      ...prev,
      quotationNo: String(match.surveyNo || prev.quotationNo),
      surveyNo: String(match.surveyNo || ''),
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
      goodsValue: surveyGoodsValue > 0 ? String(surveyGoodsValue) : prev.goodsValue,
      extraInfo: match.extraInfo || surveyItemsSummary || prev.extraInfo || '',
    }));

    setSelectedSurveyForQuotationAutoFill(surveyNoOrId.trim());
    setShareToast(`âœ“ Auto-filled details from Survey #${match.surveyNo} for ${match.partyName}`);
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
    setShareToast(`âœ“ Auto-filled details and ${match.items?.length || 0} items from Survey #${match.surveyNo} for ${match.partyName}`);
    setTimeout(() => setShareToast(null), 3500);
  };

  const handleCreateQuotationFromSurvey = (survey: any) => {
    const linkedQuotation = quotations.find(
      quotation => String(quotation.surveyNo || '').trim() === String(survey.surveyNo || '').trim()
    );
    if (linkedQuotation) {
      const totals = calculateQuotationTotals(linkedQuotation);
      setQuotationForm({
        ...initialQuotationForm,
        ...linkedQuotation,
        serviceChargePercent: linkedQuotation.serviceChargePercent || (totals.serviceChargePercent !== '0%' ? totals.serviceChargePercent : '0%'),
        insuranceStatus: totals.insStatus,
        insurancePercent: totals.insPercent,
        gstStatus: totals.gstStatus,
        gstPercent: totals.gstPercent,
        gstType: linkedQuotation.gstType || 'CGST/SGST',
      });
      setEditingQuotationId(linkedQuotation.id);
      setSelectedSurveyForQuotationAutoFill(String(survey.surveyNo));
      setAdminTab('add-quotation');
      return;
    }

    setEditingQuotationId(null);
    const surveyItems = (survey.items || []).filter((item: any) => item.name?.trim());
    const surveyItemsSummary = surveyItems.length > 0
      ? `Survey items: ${surveyItems.map((item: any) => `${item.name} (Qty: ${item.qty || 1}, Value: ${item.value || 0})`).join(', ')}`
      : '';
    const surveyGoodsValue = surveyItems.reduce((total: number, item: any) => {
      const value = Number.parseFloat(String(item.value || '').replace(/,/g, ''));
      return total + (Number.isFinite(value) ? value : 0);
    }, 0);
    setQuotationForm({
      ...initialQuotationForm,
      quotationNo: String(survey.surveyNo || getNextQuotationNumber()),
      surveyNo: String(survey.surveyNo || ''),
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
      goodsValue: surveyGoodsValue > 0 ? String(surveyGoodsValue) : '',
      extraInfo: survey.extraInfo || surveyItemsSummary || '',
    });
    setSelectedSurveyForQuotationAutoFill(String(survey.surveyNo));
    setAdminTab('add-quotation');
    setShareToast(`âœ“ Pre-loaded all customer & route info from Survey #${survey.surveyNo}`);
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
    setShareToast(`âœ“ Pre-loaded info & ${convertedItems.length} items from Survey #${survey.surveyNo}`);
    setTimeout(() => setShareToast(null), 3500);
  };

  // Service Charge % options from 0% to 20% in steps of 0.5%
  const SERVICE_CHARGE_PERCENT_OPTIONS = Array.from({ length: 41 }, (_, i) => `${i * 0.5}%`);

  // Quotation Management State
  const initialQuotationForm = {
    quotationNo: '1',
    surveyNo: '',
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
          // Exclude legacy mock items if any
          const cleaned = parsed.filter(
            q => !(q.id === '3' && q.partyName === 'Anita Mohapatra') &&
                 !(q.id === '2' && q.partyName === 'Ramesh Sharma') &&
                 !(q.id === '1' && q.partyName === 'Devender Raolloth')
          );
          return cleaned;
        }
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  const getNextQuotationNumber = (records = quotations) => {
    const highestQuotationNumber = records.reduce((highest, quotation) => {
      const quotationNumber = Number.parseInt(String(quotation.quotationNo || ''), 10);
      return Number.isFinite(quotationNumber) ? Math.max(highest, quotationNumber) : highest;
    }, 0);
    return String(highestQuotationNumber + 1);
  };

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
  const [surveySearchQuery, setSurveySearchQuery] = useState('');
  const [shareToast, setShareToast] = useState<string | null>(null);

  useEffect(() => {
    if (
      adminTab === 'add-quotation' &&
      !editingQuotationId &&
      !quotationForm.partyName.trim()
    ) {
      const numberIsUsed = quotations.some(
        quotation => String(quotation.quotationNo || '').trim() === quotationForm.quotationNo
      );
      const nextQuotationNo = numberIsUsed ? getNextQuotationNumber() : quotationForm.quotationNo;
      if (nextQuotationNo !== quotationForm.quotationNo) {
        setQuotationForm(prev => ({ ...prev, quotationNo: nextQuotationNo }));
        return;
      }

      const matchingSurvey = surveys.find(
        survey => String(survey.surveyNo || '').trim() === nextQuotationNo
      );
      if (matchingSurvey) applySurveyToQuotation(String(matchingSurvey.surveyNo));
    }
  }, [adminTab, editingQuotationId, quotations, quotationForm.quotationNo, quotationForm.partyName, surveys]);

  const handleSaveQuotation = () => {
    if (!quotationForm.partyName.trim()) {
      setShareToast('Please enter Party Name');
      setTimeout(() => setShareToast(null), 3000);
      return;
    }

    const totals = calculateQuotationTotals(quotationForm);
    const words = totals.grandTotal > 0 ? `${numberToIndianWords(totals.grandTotal)} Rupees Only` : '';

    const updated = {
      ...quotationForm,
      serviceCharge: '',
      serviceChargePercent: '0%',
      insuranceCharge: totals.insStatus === 'Exempted' ? 'Exempted' : '',
      gstCharge: totals.gstStatus === 'Exempted' ? 'Exempted' : '',
      subTotal: String(totals.subTotal),
      grandTotal: String(totals.grandTotal),
      payableInWords: words || quotationForm.payableInWords || ''
    };

    if (editingQuotationId) {
      setQuotations(quotations.map(q => (q.id === editingQuotationId ? { ...updated, id: editingQuotationId } : q)));
      setShareToast('Quotation updated successfully!');
    } else {
      const newQuot = { ...updated, id: Date.now().toString() };
      const updatedQuotations = [newQuot, ...quotations];
      setQuotations(updatedQuotations);
      setShareToast('Quotation created successfully!');
      setQuotationForm({ ...initialQuotationForm, quotationNo: getNextQuotationNumber(updatedQuotations) });
      setEditingQuotationId(null);
      setAdminTab('list-quotation');
      setTimeout(() => setShareToast(null), 3000);
      return;
    }
    setTimeout(() => setShareToast(null), 3000);
    setQuotationForm({ ...initialQuotationForm, quotationNo: getNextQuotationNumber() });
    setEditingQuotationId(null);
    setAdminTab('list-quotation');
  };

  const handleEditQuotation = (quotation: any) => {
    const formTotals = calculateQuotationTotals(quotation);
    setQuotationForm({
      ...initialQuotationForm,
      ...quotation,
      serviceChargePercent: quotation.serviceChargePercent || (formTotals.serviceChargePercent !== '0%' ? formTotals.serviceChargePercent : '0%'),
      insuranceStatus: formTotals.insStatus,
      insurancePercent: formTotals.insPercent,
      gstStatus: formTotals.gstStatus,
      gstPercent: formTotals.gstPercent,
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
    const text = `Quotation #${quotation.quotationNo} from UrbanPro Packer & Logistics for ${quotation.partyName} (â‚¹${quotation.grandTotal}): ${quotation.fromCity} to ${quotation.toCity}. Customer Care: 8093017400`;
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
          return parsed.filter(p => !(p.id === 'pl-sample-1' && p.partyName === 'Rajesh Kumar Mishra'));
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

  useEffect(() => {
    if (adminTab === 'add-packing') {
      setCurrentPackingItem({
        name: '',
        qty: '1',
        boxNo: '1',
        value: '',
        remark: '',
      });
    }
  }, [adminTab, editingPackingListId]);

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
      alert('Please enter Item Name (à¤¸à¤¾à¤®à¤¾à¤¨ à¤•à¤¾ à¤¨à¤¾à¤®) before adding this row.');
      return;
    }
    if (!String(currentPackingItem.value).trim()) {
      alert('Please enter the item value before adding this row.');
      return;
    }
    if (!String(currentPackingItem.qty).trim() || !String(currentPackingItem.boxNo).trim()) {
      alert('Please enter both quantity and box number before adding this row.');
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

    const hasPendingItemDetails = Boolean(
      currentPackingItem.name.trim() ||
      String(currentPackingItem.value).trim() ||
      currentPackingItem.remark.trim() ||
      (String(currentPackingItem.qty).trim() && String(currentPackingItem.qty).trim() !== '1') ||
      (String(currentPackingItem.boxNo).trim() && String(currentPackingItem.boxNo).trim() !== '1')
    );
    if (hasPendingItemDetails && !currentPackingItem.name.trim()) {
      alert('Please enter an item name for the details you entered, then save the packing list.');
      return;
    }
    if (currentPackingItem.name.trim() && !String(currentPackingItem.value).trim()) {
      alert('Please enter the value for the item you are entering, then save the packing list.');
      return;
    }
    if (
      currentPackingItem.name.trim() &&
      (!String(currentPackingItem.qty).trim() || !String(currentPackingItem.boxNo).trim())
    ) {
      alert('Please enter both quantity and box number for the item you are entering.');
      return;
    }
    const itemsToSave = currentPackingItem.name.trim()
      ? [
          ...packingListForm.items,
          {
            ...currentPackingItem,
            id: Date.now().toString(),
            qty: currentPackingItem.qty || '1',
            boxNo: currentPackingItem.boxNo || '1',
          },
        ]
      : packingListForm.items;
    const nextListNo = String(packingLists.length + 2);
    const updated: PackingListData = {
      ...packingListForm,
      id: editingPackingListId ? editingPackingListId : Date.now().toString(),
      packingListNo: packingListForm.packingListNo || nextListNo,
      items: itemsToSave,
      totalItems: itemsToSave.reduce((s, it) => s + (parseInt(String(it.qty)) || 1), 0),
      totalBoxes: new Set(itemsToSave.map(it => String(it.boxNo || '').trim()).filter(Boolean)).size || 1,
      totalValue: itemsToSave.reduce((s, it) => s + (parseFloat(String(it.value)) || 0), 0),
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
    setCurrentPackingItem({
      name: '',
      qty: '1',
      boxNo: '1',
      value: '',
      remark: '',
    });
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
          return parsed.filter(b => !(b.id === 'lr-1' && b.consignorName === 'Jagamaya sarangi'));
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

  useEffect(() => {
    try { localStorage.setItem('upl_bills', JSON.stringify(bills)); } catch (e) { console.error(e); }
  }, [bills]);

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
      setTimeout(() => setShareToast(null), 5000);
      return;
    }
    const amt = parseFloat(billForm.amount) || 0;
    const gstRate = parseFloat(billForm.gstPercent) || 0;
    const total = amt + (amt * gstRate / 100);
    const newBill = { ...billForm, totalAmount: String(total), id: `bill-${Date.now()}` };
    setBills([newBill, ...bills]);
    setShareToast(`Tax Invoice #${billForm.billNo} generated!`);
    setTimeout(() => setShareToast(null), 5000);
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

  useEffect(() => {
    try { localStorage.setItem('upl_money_receipts', JSON.stringify(moneyReceipts)); } catch (e) { console.error(e); }
  }, [moneyReceipts]);

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
      setTimeout(() => setShareToast(null), 5000);
      return;
    }
    const newRec = { ...receiptForm, id: `mr-${Date.now()}` };
    setMoneyReceipts([newRec, ...moneyReceipts]);
    setShareToast(`Money Receipt #${receiptForm.receiptNo} created!`);
    setTimeout(() => setShareToast(null), 5000);
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

  useEffect(() => {
    try { localStorage.setItem('upl_vouchers', JSON.stringify(vouchers)); } catch (e) { console.error(e); }
  }, [vouchers]);

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
      setTimeout(() => setShareToast(null), 5000);
      return;
    }
    const newV = { ...voucherForm, id: `pv-${Date.now()}` };
    setVouchers([newV, ...vouchers]);
    setShareToast(`Payment Voucher #${voucherForm.voucherNo} created!`);
    setTimeout(() => setShareToast(null), 5000);
    setViewingVoucher(newV);
  };

  const handleSharePackingList = (pl: any) => {
    const text = `ðŸ“¦ UrbanPro Logistics - Packing List #${pl.packingListNo}\nParty: ${pl.partyName}\nMobile: ${pl.mobileNo}\nFrom: ${pl.fromCity} -> To: ${pl.toCity}\nTotal Items: ${pl.items?.length || 0}`;
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
          parsed.groupName = 'UrbanPro Packer & Logistics';
        }
        if (parsed.accountNo === '30789330266' || parsed.bankName === 'State Bank of India') {
          parsed.bankName = '';
          parsed.accountNo = '';
          parsed.ifscCode = '';
          parsed.accountHolder = '';
          parsed.bankBranch = '';
          parsed.upiId = '';
        }
        if (!parsed.addressLine1) {
          parsed.addressLine1 = 'Regd. Office: UrbanPro Packer & Logistics, Ward No. 3, Near Old SBI ATM, Dipka, Korba, CG â€“ 495452';
        }
        if (!parsed.addressLine2) {
          parsed.addressLine2 = 'Main Operational Office: Plot No. 1491, Hanspal, Balianta Canal Road, Near Lenskart, Bhubaneswar, Odisha â€“ 752101';
        }
        return parsed;
      }
    } catch (e) { console.error(e); }
    return {
      companyName: 'UrbanPro Packer & Logistics',
      groupName: 'UrbanPro Packer & Logistics',
      gstin: '',
      regAddress: 'Ward No. 3, Near Old SBI ATM, Dipka, Korba, CG â€“ 495452',
      addressLine1: 'Regd. Office: UrbanPro Packer & Logistics, Ward No. 3, Near Old SBI ATM, Dipka, Korba, CG â€“ 495452',
      addressLine2: 'Main Operational Office: Plot No. 1491, Hanspal, Balianta Canal Road, Near Lenskart, Bhubaneswar, Odisha â€“ 752101',
      mobilePrimary: '8093017400',
      mobileSecondary: '8093017400',
      email: 'urbanpro403@gmail.com',
      bankName: '',
      accountNo: '',
      ifscCode: '',
      accountHolder: '',
      bankBranch: '',
      upiId: '',
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

    const addProfile = (p: any) => {
      const name = (p.partyName || '').trim();
      const phone = String(p.mobileNo || '').trim();
      if (!name && !phone && !p.uniqueId) return;

      const key = (name || phone).toLowerCase();

      if (map.has(key)) {
        const existing = map.get(key);
        map.set(key, {
          ...existing,
          partyName: existing.partyName || name,
          mobileNo: existing.mobileNo || phone,
          email: existing.email || p.email || '',
          fromCountry: existing.fromCountry || 'India',
          fromState: existing.fromState || p.fromState || 'Odisha',
          fromCity: existing.fromCity || p.fromCity || '',
          fromArea: existing.fromArea || p.fromArea || '',
          fromPinCode: existing.fromPinCode || p.fromPincode || '',
          fromPincode: existing.fromPincode || p.fromPincode || '',
          fromAddress: existing.fromAddress || p.fromAddress || '',
          fromFloor: existing.fromFloor || p.fromFloor || 'Ground',
          fromLift: existing.fromLift || p.fromLift || 'Not Required',
          toCountry: existing.toCountry || 'India',
          toState: existing.toState || p.toState || 'Odisha',
          toCity: existing.toCity || p.toCity || '',
          toArea: existing.toArea || p.toArea || '',
          toPinCode: existing.toPinCode || p.toPincode || '',
          toPincode: existing.toPincode || p.toPincode || '',
          toAddress: existing.toAddress || p.toAddress || '',
          toFloor: existing.toFloor || p.toFloor || 'Ground',
          toLift: existing.toLift || p.toLift || 'Not Required',
          gstin: existing.gstin || p.gstin || '',
          moveType: existing.moveType || p.moveType || 'Household Goods',
          vehicleNo: existing.vehicleNo || p.vehicleNo || '',
          items: (existing.items && existing.items.length > 0) ? existing.items : (p.items || []),
          uniqueIds: Array.from(new Set([...(existing.uniqueIds || []), p.uniqueId, p.source].filter(Boolean))),
          source: existing.source || p.source,
        });
      } else {
        map.set(key, {
          partyName: name,
          mobileNo: phone,
          email: p.email || '',
          fromCountry: 'India',
          fromState: p.fromState || 'Odisha',
          fromCity: p.fromCity || '',
          fromArea: p.fromArea || '',
          fromPinCode: p.fromPincode || '',
          fromPincode: p.fromPincode || '',
          fromAddress: p.fromAddress || '',
          fromFloor: p.fromFloor || 'Ground',
          fromLift: p.fromLift || 'Not Required',
          toCountry: 'India',
          toState: p.toState || 'Odisha',
          toCity: p.toCity || '',
          toArea: p.toArea || '',
          toPincode: p.toPincode || '',
          toAddress: p.toAddress || '',
          toFloor: p.toFloor || 'Ground',
          toLift: p.toLift || 'Not Required',
          gstin: p.gstin || '',
          moveType: p.moveType || 'Household Goods',
          packingDate: p.packingDate || '',
          deliveryDate: p.deliveryDate || '',
          vehicleNo: p.vehicleNo || '',
          uniqueIds: [p.uniqueId, p.source].filter(Boolean),
          source: p.source,
          items: p.items || [],
          subTotal: p.subTotal,
          grandTotal: p.grandTotal,
        });
      }
    };

    // 1. From Surveys
    surveys.forEach(s => {
      addProfile({
        partyName: s.partyName,
        mobileNo: s.mobileNo,
        email: s.email,
        fromCity: s.fromCity,
        fromState: s.fromState,
        fromArea: s.fromArea,
        fromPincode: s.fromPinCode || s.fromPincode,
        fromAddress: s.fromArea ? `${s.fromArea}, ${s.fromCity}` : s.fromCity,
        fromFloor: s.fromFloor,
        fromLift: s.fromLift,
        toCity: s.toCity,
        toState: s.toState,
        toArea: s.toArea,
        toPincode: s.toPinCode || s.toPincode,
        toAddress: s.toArea ? `${s.toArea}, ${s.toCity}` : s.toCity,
        toFloor: s.toFloor,
        toLift: s.toLift,
        moveType: s.moveType,
        packingDate: s.packingDate || s.surveyDate,
        deliveryDate: s.dateOfDelivery,
        uniqueId: String(s.surveyNo),
        source: `Survey #${s.surveyNo}`,
        items: s.items || [],
      });
    });

    // 2. From Quotations
    quotations.forEach(q => {
      addProfile({
        partyName: q.partyName,
        mobileNo: q.mobileNo,
        email: q.email,
        fromCity: q.fromCity,
        fromState: q.fromState,
        fromArea: q.fromArea,
        fromPincode: q.fromPincode,
        fromAddress: q.fromAddress || (q.fromArea ? `${q.fromArea}, ${q.fromCity}` : q.fromCity),
        toCity: q.toCity,
        toState: q.toState,
        toArea: q.toArea,
        toPincode: q.toPincode,
        toAddress: q.toAddress || (q.toArea ? `${q.toArea}, ${q.toCity}` : q.toCity),
        moveType: q.moveType,
        packingDate: q.packingDate,
        deliveryDate: q.deliveryDate,
        uniqueId: String(q.quotationNo),
        source: `Quotation #${q.quotationNo}`,
        items: [],
        subTotal: Number(q.subTotal) || 0,
        grandTotal: Number(q.grandTotal) || 0,
      });
    });

    // 3. From Packing Lists
    packingLists.forEach(pl => {
      addProfile({
        partyName: pl.partyName,
        mobileNo: pl.mobileNo,
        fromCity: pl.fromCity,
        fromState: pl.fromState,
        fromArea: pl.fromArea,
        fromPincode: pl.fromPincode,
        fromAddress: pl.fromArea ? `${pl.fromArea}, ${pl.fromCity}` : pl.fromCity,
        toCity: pl.toCity,
        toState: pl.toState,
        toArea: pl.toArea,
        toPincode: pl.toPincode,
        toAddress: pl.toArea ? `${pl.toArea}, ${pl.toCity}` : pl.toCity,
        uniqueId: String(pl.packingListNo),
        source: `Packing List #${pl.packingListNo}`,
        items: pl.items || [],
      });
    });

    // 4. From Bilties
    bilties.forEach(b => {
      addProfile({
        partyName: b.consignorName || b.consigneeName,
        mobileNo: b.consignorPhone || b.consigneePhone,
        fromCity: b.consignorCity,
        fromState: b.consignorState,
        fromArea: b.consignorArea,
        fromPincode: b.consignorPincode,
        fromAddress: b.consignorAddress,
        toCity: b.consigneeCity,
        toState: b.consigneeState,
        toArea: b.consigneeArea,
        toPincode: b.consigneePincode,
        toAddress: b.consigneeAddress,
        gstin: b.consignorGstin || b.consigneeGstin,
        vehicleNo: b.vehicleNo,
        uniqueId: String(b.biltyNo),
        source: `Bilty (LR) #${b.biltyNo}`,
      });
    });

    // 5. From Bills
    bills.forEach(bi => {
      addProfile({
        partyName: bi.partyName || bi.consignorName,
        mobileNo: bi.mobileNo || bi.consignorPhone,
        fromCity: bi.fromCity || bi.city,
        toCity: bi.toCity,
        fromAddress: bi.address || bi.consignorAddress,
        fromPincode: bi.pincode || bi.fromPincode,
        gstin: bi.gstin || bi.consignorGstin,
        vehicleNo: bi.vehicleNo,
        uniqueId: String(bi.billNo || bi.lrBiltyNo),
        source: `Bill #${bi.billNo}`,
      });
    });

    // 6. From Money Receipts
    moneyReceipts.forEach(mr => {
      addProfile({
        partyName: mr.partyName || mr.receivedFrom,
        mobileNo: mr.mobileNo,
        fromCity: mr.relocateFrom,
        toCity: mr.relocateTo,
        uniqueId: String(mr.receiptNo || mr.quotationBillNo),
        source: `Receipt #${mr.receiptNo}`,
      });
    });

    // 7. From Car Conditions
    carConditions.forEach(cc => {
      addProfile({
        partyName: cc.partyName,
        mobileNo: cc.mobileNo,
        fromCity: cc.fromCity,
        fromState: cc.fromState,
        fromArea: cc.fromArea,
        fromPincode: cc.fromPincode,
        toCity: cc.toCity,
        toState: cc.toState,
        toArea: cc.toArea,
        toPincode: cc.toPincode,
        vehicleNo: cc.vehicleNo,
        uniqueId: String(cc.orderNo || cc.id),
        source: `Car Report #${cc.orderNo || cc.id}`,
      });
    });

    // 8. From Bike Conditions
    bikeConditions.forEach(bc => {
      addProfile({
        partyName: bc.partyName,
        mobileNo: bc.mobileNo,
        fromCity: bc.fromCity,
        fromState: bc.fromState,
        fromArea: bc.fromArea,
        fromPincode: bc.fromPincode,
        toCity: bc.toCity,
        toState: bc.toState,
        toArea: bc.toArea,
        toPincode: bc.toPincode,
        vehicleNo: bc.vehicleNo,
        uniqueId: String(bc.orderNo || bc.id),
        source: `Bike Report #${bc.orderNo || bc.id}`,
      });
    });

    return Array.from(map.values());
  }, [surveys, quotations, packingLists, bilties, bills, moneyReceipts, carConditions, bikeConditions]);

  const findCustomerProfile = (query: string) => {
    if (!query || !query.trim()) return null;
    const cleanStr = query.trim().toLowerCase();
    const cleanDigits = query.replace(/\D/g, '');

    return customerProfiles.find(c => {
      // 1. Match Unique IDs
      if (c.uniqueIds && c.uniqueIds.some((id: string) => id && String(id).trim().toLowerCase() === cleanStr)) return true;
      if (c.surveyNo && String(c.surveyNo).trim().toLowerCase() === cleanStr) return true;
      if (c.quotationNo && String(c.quotationNo).trim().toLowerCase() === cleanStr) return true;
      if (c.biltyNo && String(c.biltyNo).trim().toLowerCase() === cleanStr) return true;
      if (c.billNo && String(c.billNo).trim().toLowerCase() === cleanStr) return true;
      if (c.packingListNo && String(c.packingListNo).trim().toLowerCase() === cleanStr) return true;
      if (c.source && c.source.toLowerCase() === cleanStr) return true;

      // 2. Exact or clean Party Name match
      if (c.partyName && c.partyName.trim().toLowerCase() === cleanStr) return true;

      // 3. Exact mobile number match, including numbers stored with a country code.
      if (cleanDigits.length >= 10 && findCustomerProfileByMobile([c], query)) return true;

      // 4. Starts-with match on party name
      if (c.partyName && cleanStr.length >= 3 && c.partyName.trim().toLowerCase().startsWith(cleanStr)) return true;

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
      setShareToast(`âœ“ Existing Survey #${match.surveyNo} found! Auto-loaded details for "${match.partyName}"`);
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
        setShareToast(`âœ“ Auto-filled customer details for ${match.partyName}`);
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
          setShareToast(`âœ“ Auto-filled customer info for ${match.partyName}`);
          setTimeout(() => setShareToast(null), 3000);
          return {
            ...prev,
            mobileNo: val,
            partyName: match.partyName || prev.partyName,
            email: match.email || prev.email,
            fromCountry: match.fromCountry || prev.fromCountry,
            fromState: match.fromState || prev.fromState,
            fromCity: match.fromCity || prev.fromCity,
            fromArea: match.fromArea || prev.fromArea,
            fromPinCode: match.fromPinCode || prev.fromPinCode,
            fromFloor: match.fromFloor || prev.fromFloor,
            fromLift: match.fromLift || prev.fromLift,
            toCountry: match.toCountry || prev.toCountry,
            toState: match.toState || prev.toState,
            toCity: match.toCity || prev.toCity,
            toArea: match.toArea || prev.toArea,
            toPinCode: match.toPinCode || prev.toPinCode,
            toFloor: match.toFloor || prev.toFloor,
            toLift: match.toLift || prev.toLift,
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
        setShareToast(`âœ“ Auto-filled quotation details for ${match.partyName}`);
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
          setShareToast(`âœ“ Auto-filled party & route for ${match.partyName}`);
          setTimeout(() => setShareToast(null), 3000);
          return {
            ...prev,
            mobileNo: val,
            partyName: match.partyName || prev.partyName,
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
        setShareToast(`âœ“ Auto-filled packing list for ${match.partyName}`);
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
          const itemsToSet = (!prev.items || prev.items.length === 0) && match.items?.length
            ? match.items.map((item: any, index: number) => ({
                id: `pli-${Date.now()}-${index}`,
                name: item.name || 'Item',
                qty: item.qty || '1',
                boxNo: String(index + 1),
                value: item.value || '0',
                remark: item.remark || 'Standard Packing',
              }))
            : prev.items;
          setShareToast(`âœ“ Auto-filled name & route for ${match.partyName}`);
          setTimeout(() => setShareToast(null), 3000);
          return {
            ...prev,
            mobileNo: val,
            partyName: match.partyName || prev.partyName,
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
            items: itemsToSet,
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

    // Prepare the enquiry for the admin's WhatsApp.
    const finalItem = formData.item === 'Other' ? (formData.otherItem || 'Custom requirement') : formData.item;
    const itemListText = formData.itemRows
      .filter(row => row.name.trim())
      .map((row, index) => `Item ${index + 1}: ${row.name}\nItem Value: ${row.value || 'Not specified'}`)
      .join('\n');
    const message = [
      'New Quote Request from Website',
      '',
      `Name: ${formData.name}`,
      `Phone: ${formData.phone}`,
      ...(formData.email ? [`Email: ${formData.email}`] : []),
      `Moving Date: ${formData.date}`,
      `Service Type: ${finalItem}`,
      ...(itemListText ? [itemListText] : []),
      `Moving From: ${formData.movingFrom}`,
      `Moving To: ${formData.movingTo}`,
    ].join('\n');
    const whatsappNumber = "918093017400";
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

    const submittedDetails: SubmittedQuoteDetails = {
      name: formData.name,
      phone: formData.phone,
      movingFrom: formData.movingFrom,
      movingTo: formData.movingTo,
      item: finalItem,
      whatsappUrl,
    };
    setSubmittedQuoteDetails(submittedDetails);
    try {
      window.sessionStorage.setItem('upl_pending_quote_confirmation', JSON.stringify(submittedDetails));
    } catch (error) {
      console.error('Failed to save enquiry confirmation for return to the page', error);
    }
    setShowQuoteSubmitToast(true);

    // Clear the form
    setFormData({ name: '', phone: '', email: '', date: '', item: '', otherItem: '', movingFrom: '', movingTo: '', itemRows: [{ name: '', value: '' }] });
  };

  const updateItemRow = (index: number, field: 'name' | 'value', value: string) => {
    setFormData(prev => ({
      ...prev,
      itemRows: prev.itemRows.map((row, rowIndex) => rowIndex === index ? { ...row, [field]: value } : row)
    }));
  };

  const addItemRow = () => {
    setFormData(prev => ({ ...prev, itemRows: [...prev.itemRows, { name: '', value: '' }] }));
  };

  const removeItemRow = (index: number) => {
    setFormData(prev => ({
      ...prev,
      itemRows: prev.itemRows.length > 1 ? prev.itemRows.filter((_, rowIndex) => rowIndex !== index) : prev.itemRows
    }));
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
          title: 'Comprehensive household relocation with multi-layer packing for furniture, appliances, kitchenware, and fragile items',
          text: 'Comprehensive household relocation with multi-layer packing for furniture, appliances, kitchenware, and fragile items.'
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
      title: 'Skilled Labour Available',
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
        onEdit={(quot) => {
          setViewingQuotation(null);
          handleEditQuotation(quot);
        }}
        onSave={(updatedQuot) => {
          setQuotations(prev => {
            const next = prev.map(q => q.id === updatedQuot.id ? updatedQuot : q);
            try {
              localStorage.setItem('upl_quotations', JSON.stringify(next));
            } catch (e) {
              console.error(e);
            }
            return next;
          });
          setViewingQuotation(updatedQuot);
          setShareToast(`Quotation #${updatedQuot.quotationNo} updated successfully!`);
          setTimeout(() => setShareToast(null), 3000);
        }}
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
                            {q.fromCity || 'Origin'} &rarr; {q.toCity || 'Destination'} â€¢ {q.mobileNo || 'No phone'}
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
                            {s.fromCity || 'Origin'} &rarr; {s.toCity || 'Destination'} â€¢ {s.mobileNo || 'No phone'}
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
        <div className="fixed bottom-6 right-6 max-w-sm sm:max-w-md bg-slate-900/95 text-white px-4 py-3 rounded-2xl text-sm shadow-2xl z-[120] flex items-center justify-between gap-3 border border-slate-700 backdrop-blur-md animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="font-semibold text-slate-100">{shareToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setShareToast(null)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            title="Dismiss message"
          >
            <X className="w-4 h-4" />
          </button>
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
                    <span className="text-[#1e3a8a] font-black">Urban</span><span className="text-[#dc2626] font-black">Pro</span> <span className="text-[#1e3a8a] font-extrabold hidden xs:inline">Packer & Logistics</span>
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
                <div className="bg-white px-3.5 py-2 rounded-xl flex flex-col justify-center shadow-sm flex-1 mr-2">
                  <h2 className="font-bold text-sm leading-tight">
                    <span className="text-[#1e3a8a] font-black">Urban</span><span className="text-[#dc2626] font-black">Pro</span>
                  </h2>
                  <p className="text-[10px] text-[#1e3a8a] font-bold">Packer & Logistics</p>
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
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="px-3 text-xs font-semibold text-slate-300">Bill / Tax Invoice</div>
                      <button
                        onClick={() => setAdminTab('add-bill')}
                        className={`w-full flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-sm transition-colors cursor-pointer ${adminTab === 'add-bill' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
                      >
                        <PlusCircle className="w-4 h-4 text-amber-400" />
                        <span>Add Bill</span>
                      </button>
                      <button
                        onClick={() => setAdminTab('list-bill')}
                        className={`w-full flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-sm transition-colors cursor-pointer ${adminTab === 'list-bill' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
                      >
                        <FileText className="w-4 h-4 text-amber-400" />
                        <span>All Bills</span>
                      </button>
                    </div>
                    <div className="space-y-1">
                      <div className="px-3 text-xs font-semibold text-slate-300">Money Receipt</div>
                      <button
                        onClick={() => setAdminTab('add-money-receipt')}
                        className={`w-full flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-sm transition-colors cursor-pointer ${adminTab === 'add-money-receipt' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
                      >
                        <PlusCircle className="w-4 h-4 text-emerald-400" />
                        <span>Add Money Receipt</span>
                      </button>
                      <button
                        onClick={() => setAdminTab('list-money-receipt')}
                        className={`w-full flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-sm transition-colors cursor-pointer ${adminTab === 'list-money-receipt' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
                      >
                        <FileText className="w-4 h-4 text-emerald-400" />
                        <span>All Money Receipts</span>
                      </button>
                    </div>
                    <div className="space-y-1">
                      <div className="px-3 text-xs font-semibold text-slate-300">Payment Voucher</div>
                      <button
                        onClick={() => setAdminTab('add-payment-voucher')}
                        className={`w-full flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-sm transition-colors cursor-pointer ${adminTab === 'add-payment-voucher' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
                      >
                        <PlusCircle className="w-4 h-4 text-purple-400" />
                        <span>Add Payment Voucher</span>
                      </button>
                      <button
                        onClick={() => setAdminTab('list-payment-voucher')}
                        className={`w-full flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-sm transition-colors cursor-pointer ${adminTab === 'list-payment-voucher' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
                      >
                        <FileText className="w-4 h-4 text-purple-400" />
                        <span>All Payment Vouchers</span>
                      </button>
                    </div>
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
                  {c.mobileNo ? `${c.mobileNo} â€¢ ${c.source}` : c.source}
                </option>
              ))}
              {customerProfiles.flatMap((c, i) => (c.uniqueIds || []).map((id, j) => (
                <option key={`dl-uid-${i}-${j}`} value={String(id)}>
                  {c.partyName} ({c.mobileNo || 'No phone'}) â€¢ {c.source}
                </option>
              )))}
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
                  Survey #{s.surveyNo} â€” {s.partyName} ({s.fromCity || 'Origin'} â†’ {s.toCity || 'Dest'})
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
                  <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-xs border border-slate-200">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <span className="text-[11px] font-bold uppercase tracking-widest bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200">
                              <span className="text-[#1e3a8a]">Urban</span><span className="text-[#dc2626]">Pro</span>{' '}
                              <span className="text-[#1e3a8a]">Packer & Logistics</span>
                            </span>
                          </div>
                          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-baseline flex-wrap gap-1.5">
                            <span className="text-[#1e3a8a] font-black">Urban</span><span className="text-[#dc2626] font-black">Pro</span>
                            <span className="text-[#1e3a8a] font-extrabold text-xl sm:text-2xl">Packer & Logistics</span>
                            <span className="text-slate-500 font-semibold text-base sm:text-lg">Dashboard</span>
                          </h1>
                          <p className="text-slate-500 text-xs sm:text-sm mt-1 font-medium">
                            Pack Smart & Move Safe â€¢ Admin Management & Documentation Suite
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 w-full sm:w-auto">
                        <button
                          onClick={() => { setAdminTab('add-survey'); setEditingSurveyId(null); setSurveyForm(initialSurveyForm); }}
                          className="flex-1 sm:flex-initial bg-[#1e3a8a] hover:bg-blue-900 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <PlusCircle className="w-4 h-4 text-emerald-400" />
                          <span>New Survey</span>
                        </button>
                        <button
                          onClick={() => { setAdminTab('add-quotation'); setEditingQuotationId(null); setQuotationForm({ ...initialQuotationForm, quotationNo: getNextQuotationNumber() }); }}
                          className="flex-1 sm:flex-initial bg-[#0f172a] hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <PlusCircle className="w-4 h-4 text-amber-400" />
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
                          onClick={() => { setAdminTab('add-quotation'); setEditingQuotationId(null); setQuotationForm({ ...initialQuotationForm, quotationNo: getNextQuotationNumber() }); }}
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
                                  {s.fromCity || 'Origin'} &rarr; {s.toCity || 'Destination'} â€¢ {s.mobileNo || 'No phone'}
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
                              onClick={() => { setAdminTab('add-quotation'); setEditingQuotationId(null); setQuotationForm({ ...initialQuotationForm, quotationNo: getNextQuotationNumber() }); }}
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
                                  {q.fromCity || 'Origin'} &rarr; {q.toCity || 'Destination'} â€¢ â‚¹{q.grandTotal || '0'}
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
                        <h4 className="font-bold text-white text-sm">Company Details</h4>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 text-xs text-slate-300">
                      <div>
                        <span className="font-semibold text-yellow-400 block mb-1">MAIN OPERATIONAL OFFICE</span>
                        Plot No. 1491, Hanspal, Balianta Canal Road, Bhubaneswar, Odisha â€“ 752101<br />
                        <span className="text-slate-400">Office: 8093017400</span>
                      </div>
                      <div>
                        <span className="font-semibold text-yellow-400 block mb-1">REGISTERED OFFICE</span>
                        Ward No. 3, Near Old SBI ATM, Dipka, Korba, CG â€“ 495452<br />
                        <span className="text-slate-400">Mobile: 8093017400</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {adminTab === 'add-survey' && (
                <div className="pb-16">
                  {/* Top Bar Header with "All Surveys" button */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 sm:p-5 px-6 rounded-2xl shadow-xs border border-slate-200 mb-6">
                    <div>
                      <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
                        {editingSurveyId ? `Edit Survey #${surveyForm.surveyNo}` : 'Add Survey List'}
                      </h1>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Record inventory items, moving locations, and generate official printable Survey PDF.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setAdminTab('list-survey')}
                        className="bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                      >
                        <ClipboardList className="w-4 h-4 text-sky-600" />
                        <span>View All Surveys ({surveys.length})</span>
                      </button>
                    </div>
                  </div>

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

                    {/* Quick Customer & Unique ID Autofill Selector */}
                    {customerProfiles.length > 0 && (
                      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-950">
                          <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>âš¡ Auto-fill Customer from Saved Record or Unique ID:</span>
                        </div>
                        <select
                          onChange={(e) => {
                            if (e.target.value) handleSurveyPartyNameChange(e.target.value);
                          }}
                          defaultValue=""
                          className="bg-white border border-emerald-300 text-slate-800 text-xs rounded-xl px-3 py-1.5 font-medium outline-none focus:ring-2 focus:ring-emerald-500 max-w-full sm:max-w-md cursor-pointer"
                        >
                          <option value="">-- Select Customer or Unique ID to Auto-fill --</option>
                          {customerProfiles.map((cp, idx) => (
                            <option key={idx} value={cp.partyName}>
                              {cp.partyName} {cp.mobileNo ? `(${cp.mobileNo})` : ''} - {cp.source}
                            </option>
                          ))}
                        </select>
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
                                    âš ï¸ Already Taken
                                  </span>
                                );
                              }
                              return (
                                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                                  âœ“ Unique Number
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
                                âœ“ Synced Profile
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
                                âœ“ Recognized Contact
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
                            placeholder="Item Name (à¤¸à¤¾à¤®à¤¾à¤¨ à¤•à¤¾ à¤¨à¤¾à¤®)"
                            className="w-full outline-none text-slate-800 text-sm bg-transparent placeholder-slate-400 font-medium"
                            value={currentItem.name}
                            onChange={e => setCurrentItem({...currentItem, name: e.target.value})}
                            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addItemToSurvey(); } }}
                          />
                        </div>

                        <div className="border border-slate-300 rounded-xl p-2 px-3 focus-within:border-sky-500 transition-all bg-white">
                          <label className="block text-[11px] text-slate-500 font-medium leading-none mb-1">Quantity (à¤¸à¤‚à¤–à¥à¤¯à¤¾)</label>
                          <input
                            type="number"
                            min="1"
                            placeholder="Quantity (à¤¸à¤‚à¤–à¥à¤¯à¤¾)"
                            className="w-full outline-none text-slate-800 text-sm bg-transparent font-medium"
                            value={currentItem.qty}
                            onChange={e => setCurrentItem({...currentItem, qty: e.target.value})}
                          />
                        </div>

                        <div className="border border-slate-300 rounded-xl p-3 focus-within:border-sky-500 transition-all bg-white">
                          <input
                            type="text"
                            placeholder="Value (à¤•à¥€à¤®à¤¤)"
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
                  {/* Breadcrumb Header */}
                  <div className="flex justify-between items-center mb-6 bg-white p-4 sm:p-5 px-6 rounded-2xl shadow-xs border border-slate-200">
                    <div>
                      <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">All Survey Lists</h1>
                      <p className="text-xs text-slate-500 mt-0.5">Manage, print, and convert your saved customer relocation surveys.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="bg-[#0284c7] text-white px-3.5 py-1 rounded-full text-xs font-bold shadow-xs">
                        Total: {surveys.length}
                      </span>
                    </div>
                  </div>

                  {/* Filter and Search Bar */}
                  <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mb-6">
                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={() => {
                          const next = generateNextSurveyNo(surveys);
                          setSurveyForm({ ...initialSurveyForm, id: Date.now(), surveyNo: next });
                          setEditingSurveyId(null);
                          setAdminTab('add-survey');
                        }}
                        className="bg-[#0f172a] hover:bg-slate-800 text-white px-7 py-2 rounded-full font-bold text-sm shadow-xs transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
                      >
                        <PlusCircle className="w-4 h-4 text-emerald-400" />
                        <span>Add Survey</span>
                      </button>
                      <button
                        onClick={() => setSurveySearchQuery('')}
                        className="bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 px-6 py-2 rounded-full font-semibold text-sm shadow-xs transition-colors cursor-pointer"
                      >
                        All ({surveys.length})
                      </button>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="text"
                        placeholder="Search by Name, No, Mobile, City.."
                        value={surveySearchQuery}
                        onChange={(e) => setSurveySearchQuery(e.target.value)}
                        className="bg-white border border-slate-300 text-slate-800 text-sm px-4 py-2 rounded-l-md outline-none focus:border-[#0088cc] w-full sm:w-72"
                      />
                      <button
                        type="button"
                        onClick={() => {}}
                        className="bg-[#0088cc] hover:bg-[#0077b5] text-white px-5 py-2 rounded-r-md text-sm font-semibold transition-colors shrink-0 cursor-pointer shadow-xs"
                      >
                        Search
                      </button>
                    </div>
                  </div>

                  {(() => {
                    const filteredSurveys = surveys.filter(s => {
                      if (!surveySearchQuery.trim()) return true;
                      const q = surveySearchQuery.toLowerCase();
                      return (
                        (s.partyName && s.partyName.toLowerCase().includes(q)) ||
                        (s.mobileNo && s.mobileNo.includes(q)) ||
                        (s.surveyNo && String(s.surveyNo).toLowerCase().includes(q)) ||
                        (s.fromCity && s.fromCity.toLowerCase().includes(q)) ||
                        (s.toCity && s.toCity.toLowerCase().includes(q))
                      );
                    });

                    if (filteredSurveys.length === 0) {
                      return (
                        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-12 text-center">
                          <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                          <h3 className="text-lg font-bold text-slate-700">
                            {surveys.length === 0 ? 'No Surveys Created Yet' : 'No Surveys Match Search'}
                          </h3>
                          <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
                            {surveys.length === 0
                              ? 'Click below to create your first survey or load demo surveys for testing on localhost.'
                              : `No records found matching "${surveySearchQuery}". Clear your search or create a new survey.`}
                          </p>
                          <div className="mt-4 flex flex-wrap justify-center gap-3">
                            <button
                              onClick={() => {
                                const next = generateNextSurveyNo(surveys);
                                setSurveyForm({ ...initialSurveyForm, id: Date.now(), surveyNo: next });
                                setEditingSurveyId(null);
                                setAdminTab('add-survey');
                              }}
                              className="bg-[#0088cc] hover:bg-sky-600 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                            >
                              Create New Survey
                            </button>
                            {surveySearchQuery && (
                              <button
                                onClick={() => setSurveySearchQuery('')}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                              >
                                Clear Search Filter
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-6 flex justify-center flex-col items-center">
                        {filteredSurveys.map((survey) => (
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
                    );
                  })()}
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

                  {editingQuotationId && (
                    <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shrink-0">
                          <Edit className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-amber-950 text-sm">Editing Quotation #{quotationForm.quotationNo}</h4>
                          <p className="text-xs text-amber-800">
                            Customer: {quotationForm.partyName || 'Customer'} â€¢ You are updating an existing quotation. All charges, tax and route details are editable.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingQuotationId(null);
                          setQuotationForm({ ...initialQuotationForm, quotationNo: getNextQuotationNumber() });
                        }}
                        className="bg-white border border-amber-300 hover:bg-amber-100 text-amber-900 font-bold px-4 py-1.5 rounded-xl text-xs shadow-2xs transition-colors cursor-pointer self-start sm:self-auto"
                      >
                        Cancel Edit / New Quotation
                      </button>
                    </div>
                  )}

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
                              <option key={s.id} value={String(s.surveyNo)}>
                                Survey #{s.surveyNo} â€” {s.partyName} ({s.fromCity || 'From'} â†’ {s.toCity || 'To'})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="sm:col-span-5 flex gap-2 items-end">
                          <div className="grow">
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Or Enter Survey No:</label>
                            <input
                              type="text"
                              placeholder="e.g. 1 or 2"
                              className="w-full bg-white border border-emerald-300 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                              value={selectedSurveyForQuotationAutoFill}
                              onChange={(e) => {
                                const value = e.target.value;
                                setSelectedSurveyForQuotationAutoFill(value);
                                const numericValue = Number.parseInt(value.trim(), 10);
                                const exactSurvey = surveys.find(survey =>
                                  String(survey.surveyNo || '').trim() === value.trim() ||
                                  (Number.isInteger(numericValue) &&
                                    Number.parseInt(String(survey.surveyNo || '').trim(), 10) === numericValue)
                                );
                                if ((exactSurvey || (Number.isInteger(numericValue) && numericValue > 0)) && value.trim()) {
                                  applySurveyToQuotation(value);
                                }
                              }}
                              onBlur={() => {
                                if (selectedSurveyForQuotationAutoFill.trim()) {
                                  applySurveyToQuotation(selectedSurveyForQuotationAutoFill);
                                }
                              }}
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
                            readOnly
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
                                âœ“ Synced Profile
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
                                âœ“ Recognized Contact
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
                      <span className="absolute -top-3.5 left-4 bg-cyan-400 text-white px-4 py-1 rounded-md text-sm font-medium shadow-sm">Charge Details</span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          { key: 'transportCharges', label: 'Transportation Charges' },
                          { key: 'packingCharges', label: 'Packing Charges' },
                          { key: 'unpackingCharges', label: 'Unpacking Charges' },
                          { key: 'loadingCharges', label: 'Loading Charges' },
                          { key: 'unloadingCharges', label: 'Unloading Charges' },
                          { key: 'dismantlingCharges', label: 'Dismantling/Assembling Charges' },
                          { key: 'carCharges', label: 'Car Transportation Charges' },
                          { key: 'bikeCharges', label: 'Bike Transportation Charges' },
                          { key: 'octroiCharges', label: 'Octroi/Entry Charges' },
                          { key: 'statCharges', label: 'Statistical/Document Charges' },
                        ].map((item) => {
                          const currentVal = (quotationForm as any)[item.key];
                          const parsed = parseChargeDetails(currentVal);
                          const isIncluded = parsed.status === 'included';
                          const isExcluded = parsed.status === 'excluded';

                          const toggleStatus = (target: 'included' | 'excluded') => {
                            const newStatus = parsed.status === target ? 'standard' : target;
                            const newVal = formatChargeValue(parsed.displayAmount, newStatus);
                            setQuotationForm({
                              ...quotationForm,
                              [item.key]: newVal
                            });
                          };

                          const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                            const inputVal = e.target.value;
                            const newVal = formatChargeValue(inputVal, parsed.status);
                            setQuotationForm({
                              ...quotationForm,
                              [item.key]: newVal
                            });
                          };

                          return (
                            <div key={item.key} className="border border-slate-300 rounded-lg p-3 transition-all bg-white group shadow-2xs focus-within:border-cyan-500">
                              <div className="flex items-center justify-between mb-1.5">
                                <label className="block text-xs font-bold text-cyan-950 uppercase tracking-wider">
                                  {item.label}
                                </label>
                                {/* Included / Excluded Quick Toggles */}
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => toggleStatus('included')}
                                    className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer border flex items-center gap-1 ${
                                      isIncluded
                                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                                        : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                    }`}
                                    title={isIncluded ? 'Select Included to clear' : 'Select Included'}
                                  >
                                    Included
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => toggleStatus('excluded')}
                                    className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer border flex items-center gap-1 ${
                                      isExcluded
                                        ? 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                                        : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                                    }`}
                                    title={isExcluded ? 'Select Excluded to clear' : 'Select Excluded'}
                                  >
                                    Excluded
                                  </button>
                                </div>
                              </div>
                              <div className="flex items-center justify-between gap-2">
                                <div className="relative flex-1 flex items-center">
                                  <span className="text-slate-400 text-xs font-bold mr-1.5 select-none">â‚¹</span>
                                  <input
                                    type="text"
                                    placeholder="Enter amount (e.g. 5000)"
                                    value={parsed.displayAmount}
                                    onChange={handleAmountChange}
                                    className="w-full outline-none text-sm font-semibold bg-transparent placeholder-slate-400 text-slate-800"
                                  />
                                </div>
                                <div className="w-6 h-6 rounded-full bg-sky-50 flex items-center justify-center border border-sky-200 text-sky-500 group-hover:bg-sky-100 transition-colors flex-shrink-0">
                                  <Edit className="w-3 h-3" />
                                </div>
                              </div>
                            </div>
                          );
                        })}
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
                            {quotationForm.customCharges.map((cc: any, idx: number) => {
                              const parsed = parseChargeDetails(cc.val);
                              const isCcIncluded = parsed.status === 'included';
                              const isCcExcluded = parsed.status === 'excluded';

                              const toggleCcStatus = (target: 'included' | 'excluded') => {
                                const newStatus = parsed.status === target ? 'standard' : target;
                                const newVal = formatChargeValue(parsed.displayAmount, newStatus);
                                const updated = [...(quotationForm.customCharges || [])];
                                updated[idx] = { ...updated[idx], val: newVal };
                                setQuotationForm({ ...quotationForm, customCharges: updated });
                              };

                              const handleCcAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                                const inputVal = e.target.value;
                                const newVal = formatChargeValue(inputVal, parsed.status);
                                const updated = [...(quotationForm.customCharges || [])];
                                updated[idx] = { ...updated[idx], val: newVal };
                                setQuotationForm({ ...quotationForm, customCharges: updated });
                              };

                              return (
                                <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center bg-cyan-50/60 p-2.5 rounded-lg border border-cyan-200">
                                  <div className="sm:col-span-5">
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
                                  <div className="sm:col-span-6">
                                    <div className="flex items-center justify-between mb-0.5">
                                      <label className="block text-[10px] font-bold text-cyan-900 uppercase tracking-wider">Applied Amount</label>
                                      <div className="flex items-center gap-1">
                                        <button
                                          type="button"
                                          onClick={() => toggleCcStatus('included')}
                                          className={`px-1.5 py-0.2 rounded text-[10px] font-bold transition-all cursor-pointer border flex items-center gap-0.5 ${
                                            isCcIncluded
                                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                                              : 'bg-white text-emerald-700 border-emerald-300 hover:bg-emerald-50'
                                          }`}
                                          title={isCcIncluded ? 'Select Included to clear' : 'Select Included'}
                                        >
                                          {isCcIncluded && <span>âœ“</span>} Included
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => toggleCcStatus('excluded')}
                                          className={`px-1.5 py-0.2 rounded text-[10px] font-bold transition-all cursor-pointer border flex items-center gap-0.5 ${
                                            isCcExcluded
                                              ? 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                                              : 'bg-white text-rose-700 border-rose-300 hover:bg-rose-50'
                                          }`}
                                          title={isCcExcluded ? 'Select Excluded to clear' : 'Select Excluded'}
                                        >
                                          {isCcExcluded && <span>âœ•</span>} Excluded
                                        </button>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      <div className="relative flex-1 flex items-center bg-white border border-slate-300 rounded-md px-2 focus-within:border-cyan-500">
                                        <span className="text-slate-400 text-xs font-bold mr-1 select-none">â‚¹</span>
                                        <input
                                          type="text"
                                          placeholder="Enter amount"
                                          value={parsed.displayAmount}
                                          onChange={handleCcAmountChange}
                                          className="w-full py-1 text-xs font-bold outline-none bg-transparent text-slate-800"
                                        />
                                      </div>
                                    </div>
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
                              );
                            })}
                          </div>
                        )}
                      </div>
                      {(() => {
                        const formTotals = calculateQuotationTotals(quotationForm);
                        return (
                          <div className="mt-5 pt-4 border-t-2 border-cyan-300">
                            <div className="rounded-lg p-3 bg-cyan-50 focus-within:bg-cyan-100 group">
                              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1 flex items-center justify-between">
                                <span>SUB TOTAL</span>
                              </label>
                              <div className="flex items-center justify-between">
                                <input
                                  type="text"
                                  placeholder={String(formTotals.subTotal || '0')}
                                  value={String(formTotals.subTotal)}
                                  readOnly
                                  className="w-full outline-none text-slate-800 text-sm font-bold bg-transparent"
                                />
                                <span className="text-[11px] text-slate-400 font-medium ml-1 shrink-0">â‚¹ INR</span>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* GST/Insurance */}
                    <div className="border-2 border-slate-900 rounded-xl p-6 pt-8 relative bg-white shadow-sm">
                      <span className="absolute -top-3.5 left-4 bg-slate-900 text-white px-4 py-1 rounded-md text-sm font-medium shadow-sm">GST/Insurance</span>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* 1. Insurance rate */}
                        <div className="border border-slate-300 rounded-lg p-3 focus-within:border-emerald-600 transition-all bg-white relative shadow-2xs">
                          <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
                            Insurance %
                          </label>
                          <select
                            value={quotationForm.insurancePercent || '3%'}
                            onChange={(e) => setQuotationForm({ ...quotationForm, insurancePercent: e.target.value, insuranceStatus: 'Extra' })}
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
                          </label>
                          <div className="flex items-center justify-between">
                            <input
                              type="text"
                              placeholder="0"
                              value={calculateQuotationTotals(quotationForm).insuranceNum > 0 ? String(calculateQuotationTotals(quotationForm).insuranceNum) : ''}
                              readOnly
                              className="w-full outline-none text-slate-800 text-sm font-semibold bg-transparent placeholder-slate-400"
                            />
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
                          </div>
                          <select
                            value={quotationForm.gstPercent || '18%'}
                            onChange={(e) => setQuotationForm({ ...quotationForm, gstPercent: e.target.value, gstStatus: 'Extra' })}
                            className="w-full outline-none text-slate-800 text-sm font-semibold bg-transparent appearance-none cursor-pointer py-1"
                          >
                            <option value="18%">18% (Standard Logistics & Packers)</option>
                            <option value="12%">12% (Standard Goods Moving)</option>
                            <option value="5%">5% (Goods Transport Agency / GTA)</option>
                            <option value="3%">3%</option>
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
                          </label>
                          <div className="flex items-center justify-between">
                            <input
                              type="text"
                              placeholder="0"
                              value={calculateQuotationTotals(quotationForm).gstNum > 0 ? String(calculateQuotationTotals(quotationForm).gstNum) : ''}
                              readOnly
                              className="w-full outline-none text-slate-800 text-sm font-semibold bg-transparent placeholder-slate-400"
                            />
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
                          </label>
                          <div className="flex items-center justify-between">
                            <input
                              type="text"
                              placeholder="Declared Goods Value"
                              value={quotationForm.goodsValue || ''}
                              onChange={(e) => {
                                const newGoodsVal = e.target.value;
                                setQuotationForm({ ...quotationForm, goodsValue: newGoodsVal, insuranceStatus: 'Extra' });
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
                            onChange={(e) => setQuotationForm({ ...quotationForm, gstType: e.target.value, gstStatus: 'Extra' })}
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
                        const formTotals = calculateQuotationTotals(quotationForm);
                        return (
                          <div className="mt-4 p-3.5 bg-gradient-to-r from-blue-50 via-indigo-50 to-sky-50 border border-blue-200 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-xs">
                            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-semibold text-slate-700">
                              <div>
                                <span className="text-slate-500">Base Charges:</span>{' '}
                                <strong className="text-slate-900 font-mono">â‚¹ {formTotals.baseTotal.toLocaleString()}</strong>
                              </div>
                              <div className="bg-blue-100/70 text-blue-950 px-2 py-0.5 rounded font-bold">
                                <span>Sub Total:</span>{' '}
                                <strong className="font-mono">â‚¹ {formTotals.subTotal.toLocaleString()}</strong>
                              </div>
                              {formTotals.insuranceNum > 0 && (
                                <div className="text-emerald-700">
                                  <span>+ Ins ({formTotals.insPercent} Extra):</span>{' '}
                                  <strong className="font-mono">â‚¹ {formTotals.insuranceNum.toLocaleString()}</strong>
                                </div>
                              )}
                              {formTotals.gstNum > 0 && (
                                <div className="text-purple-700">
                                  <span>+ GST ({formTotals.gstPercent}):</span>{' '}
                                  <strong className="font-mono">â‚¹ {formTotals.gstNum.toLocaleString()}</strong>
                                </div>
                              )}
                              {formTotals.gstStatus === 'Exempted' && (
                                <span className="text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded text-[11px] font-bold">
                                  GST Exempted (0%)
                                </span>
                              )}
                              {formTotals.goodsVal > 0 && (
                                <div className="text-amber-800 bg-amber-50 border border-amber-300 px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1 shadow-2xs">
                                  <span>+ Goods Value:</span>{' '}
                                  <strong className="font-mono">â‚¹ {formTotals.goodsVal.toLocaleString()}</strong>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs uppercase font-extrabold text-blue-900 tracking-wider">Grand Total:</span>
                                <span className="text-base sm:text-lg font-black text-blue-950 font-mono bg-white px-2.5 py-0.5 rounded-lg border border-blue-300 shadow-2xs">
                                  â‚¹ {formTotals.grandTotal.toLocaleString()}
                                </span>
                              </div>
                              {formTotals.advanceNum > 0 && (
                                <div className="text-xs font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                                  Due: <span className="text-emerald-700 font-mono">â‚¹ {formTotals.balanceDue.toLocaleString()}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })()}

                      {/* Calculated Grand Total */}
                      {(() => {
                        const formTotals = calculateQuotationTotals(quotationForm);
                        return (
                          <div className="mt-4 pt-3 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="border border-slate-300 rounded-lg p-3 bg-white focus-within:border-blue-500 shadow-2xs group">
                              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1 flex items-center justify-between">
                                <span>Grand Total (Final Payable)</span>
                              </label>
                              <div className="flex items-center justify-between">
                                <input
                                  type="text"
                                  placeholder={String(formTotals.grandTotal || '0')}
                                  value={String(formTotals.grandTotal)}
                                  readOnly
                                  className="w-full outline-none text-blue-950 text-sm font-black bg-transparent"
                                />
                                <span className="text-[11px] text-slate-400 font-medium ml-1 shrink-0">â‚¹ INR</span>
                              </div>
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
                          <label className="block text-[11px] text-slate-500 font-medium mb-0.5">Advance Payment (â‚¹)</label>
                          <input
                            type="text"
                            placeholder="Enter advance amount"
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
                        {(() => {
                          const formTotals = calculateQuotationTotals(quotationForm);
                          return (
                            <div className="border border-emerald-300 rounded-lg p-3 bg-emerald-50 md:col-span-2">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm">
                                <div className="text-slate-700">
                                  <span className="font-semibold">Grand Total:</span>{' '}
                                  <span className="font-black text-blue-950">â‚¹ {formTotals.grandTotal.toLocaleString()}</span>
                                </div>
                                <div className="text-slate-700">
                                  <span className="font-semibold">Advance Paid:</span>{' '}
                                  <span className="font-black text-emerald-700">â‚¹ {formTotals.advanceNum.toLocaleString()}</span>
                                </div>
                                <div className="text-slate-700">
                                  <span className="font-semibold">Balance Due:</span>{' '}
                                  <span className="font-black text-rose-700">â‚¹ {formTotals.balanceDue.toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })()}
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

                  <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={handleSaveQuotation}
                      className="bg-[#0088cc] hover:bg-blue-600 text-white px-10 py-2.5 rounded text-sm font-bold transition-all shadow-md cursor-pointer flex items-center gap-2 active:scale-95"
                    >
                      <Save className="w-4 h-4" />
                      <span>{editingQuotationId ? `Update Quotation #${quotationForm.quotationNo}` : 'Save Quotation'}</span>
                    </button>
                    {editingQuotationId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingQuotationId(null);
                          setQuotationForm({ ...initialQuotationForm, quotationNo: getNextQuotationNumber() });
                          setAdminTab('list-quotation');
                        }}
                        className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-6 py-2.5 rounded text-sm font-semibold transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
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
                          setQuotationForm({ ...initialQuotationForm, quotationNo: getNextQuotationNumber() });
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
                                setQuotationForm({ ...initialQuotationForm, quotationNo: getNextQuotationNumber() });
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
                                  â‚¹
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

                            {/* Create GST Bill / Tax Invoice */}
                            <button
                              type="button"
                              onClick={() => {
                                setAdminTab('add-bill');
                                setShareToast(`Opening Bill view â€” Select Quotation #${quotation.quotationNo} from auto-fill to import!`);
                                setTimeout(() => setShareToast(null), 3500);
                              }}
                              className="flex flex-col items-center gap-1 group cursor-pointer"
                              title="Convert this Quotation into a GST Tax Invoice / Bill"
                            >
                              <div className="w-9 h-9 rounded-full bg-[#8b5cf6] text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                                <Receipt className="w-4 h-4" />
                              </div>
                              <span className="text-[11px] font-bold text-[#8b5cf6]">Bill</span>
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
                              Survey #{s.surveyNo} â€” {s.partyName} ({s.items?.length || 0} items)
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
                                âœ“ Synced Profile
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
                                âœ“ Recognized Contact
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
                            <label className="block text-[11px] text-slate-500 font-medium mb-0.5">Item Name (à¤¸à¤¾à¤®à¤¾à¤¨ à¤•à¤¾ à¤¨à¤¾à¤®) *</label>
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
                            <label className="block text-[11px] text-slate-500 font-medium mb-0.5">Quantity (à¤¸à¤‚à¤–à¥à¤¯à¤¾) *</label>
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
                            <label className="block text-[11px] text-slate-500 font-medium mb-0.5">Box No. *</label>
                            <input
                              type="text"
                              placeholder="1"
                              className="w-full outline-none text-slate-800 text-sm bg-transparent font-medium"
                              value={currentPackingItem.boxNo}
                              onChange={e => setCurrentPackingItem({...currentPackingItem, boxNo: e.target.value})}
                            />
                          </div>

                          <div className="md:col-span-2 border border-slate-300 rounded-xl p-2 px-3 focus-within:border-sky-500 transition-all bg-white">
                            <label className="block text-[11px] text-slate-500 font-medium mb-0.5">Value (à¤•à¥€à¤®à¤¤) *</label>
                            <input
                              type="text"
                              placeholder="â‚¹"
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
                          <p className="mr-auto self-center text-[11px] text-slate-500">
                            Item name, quantity, box number and value are required. Save also includes the current named item.
                          </p>
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
                                    <th className="p-2.5 px-3">Item Name (à¤¸à¤¾à¤®à¤¾à¤¨ à¤•à¤¾ à¤¨à¤¾à¤®)</th>
                                    <th className="p-2.5 px-3 w-16 text-center">Qty</th>
                                    <th className="p-2.5 px-3 w-24 text-right">Value (â‚¹)</th>
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
                                        {item.value ? `â‚¹${item.value}` : '-'}
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
                                    Packing List #{pl.packingListNo} â€¢ {pl.packingListDate}
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
                                      <div className="text-sm font-black text-emerald-700">â‚¹{totalVal.toLocaleString('en-IN')}</div>
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
                    setTimeout(() => setShareToast(null), 5000);
                  }}
                  onDelete={(id) => {
                    setCarConditions(prev => prev.filter(c => c.id !== id));
                    setShareToast('Car Condition Report deleted.');
                    setTimeout(() => setShareToast(null), 5000);
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
              {(adminTab === 'add-bill' || adminTab === 'list-bill') && (
                <BillView
                  bills={bills}
                  initialViewMode={adminTab === 'list-bill' ? 'list' : 'form'}
                  quotations={quotations}
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
              {(adminTab === 'add-money-receipt' || adminTab === 'list-money-receipt') && (
                <MoneyReceiptView
                  moneyReceipts={moneyReceipts}
                  initialViewMode={adminTab === 'list-money-receipt' ? 'list' : 'form'}
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
              {(adminTab === 'add-payment-voucher' || adminTab === 'list-payment-voucher') && (
                <PaymentVoucherView
                  vouchers={vouchers}
                  initialViewMode={adminTab === 'list-payment-voucher' ? 'list' : 'form'}
                  customerProfiles={customerProfiles}
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
                    brandName: companyProfile.groupName || 'UrbanPro Packer & Logistics',
                    tagline: 'Pack Smart & Move Safe',
                    gstin: companyProfile.gstin || '',
                    regAddress: companyProfile.regAddress || companyProfile.addressLine1 || 'Ward No. 3, Near Old SBI ATM, Dipka, Korba, CG â€“ 495452',
                    branchAddress: companyProfile.addressLine2 || 'Plot No. 1491, Balianta Canal Road, Near Lenskart, Hanspal, Bhubaneswar, Odisha â€“ 752101',
                    phone1: companyProfile.mobilePrimary || '8093017400',
                    phone2: companyProfile.mobileSecondary || '8093017400',
                    email: companyProfile.email || 'urbanpro403@gmail.com',
                    website: 'https://urbanprologistics.com',
                    bankName: companyProfile.bankName || '',
                    bankAccNo: companyProfile.accountNo || companyProfile.bankAccNo || '',
                    bankIfsc: companyProfile.ifscCode || companyProfile.bankIfsc || '',
                    bankBranch: companyProfile.bankBranch || '',
                    upiId: companyProfile.upiId || '',
                    termsAndConditions: 'Goods transported at owner risk.'
                  }}
                  onSaveProfile={(p) => {
                    setCompanyProfile({
                      ...companyProfile,
                      companyName: p.companyName,
                      groupName: p.brandName,
                      gstin: p.gstin,
                      regAddress: p.regAddress,
                      addressLine1: p.regAddress,
                      addressLine2: p.branchAddress,
                      mobilePrimary: p.phone1,
                      mobileSecondary: p.phone2,
                      email: p.email,
                      bankName: p.bankName,
                      accountNo: p.bankAccNo,
                      ifscCode: p.bankIfsc,
                      bankBranch: p.bankBranch,
                      accountHolder: p.brandName || 'UrbanPro Packer & Logistics'
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
            onClick={() => handleTabSelect('list-bill')}
            className={`flex flex-col items-center py-1 px-2.5 rounded-xl text-[10px] font-medium transition-colors relative cursor-pointer ${adminTab.includes('bill') ? 'text-blue-400 font-bold bg-blue-950/60' : 'text-slate-400 hover:text-slate-200'}`}
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
      {showQuoteSubmitToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-4 left-1/2 z-[100] flex w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 items-start gap-3 rounded-xl border border-emerald-300 bg-emerald-700 px-4 py-3 text-sm font-semibold text-white shadow-xl"
        >
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
          <span className="flex-1">
            {submittedQuoteDetails?.name
              ? `Thank you, ${submittedQuoteDetails.name}! Your enquiry is prepared. This confirmation will remain here when you return from WhatsApp. Tap Send there to deliver it to UrbanPro.`
              : 'Your enquiry is prepared for WhatsApp. This confirmation will remain here when you return. Tap Send there to deliver it to UrbanPro.'}
          </span>
          {submittedQuoteDetails?.whatsappUrl && (
            <a
              href={submittedQuoteDetails.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-50"
            >
              Open WhatsApp
            </a>
          )}
          <button
            type="button"
            onClick={() => {
              setShowQuoteSubmitToast(false);
              try {
                window.sessionStorage.removeItem('upl_pending_quote_confirmation');
              } catch (error) {
                console.error('Failed to clear enquiry confirmation', error);
              }
            }}
            aria-label="Dismiss enquiry confirmation"
            className="rounded p-0.5 text-white/80 hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Top Bar */}
      <div className="bg-blue-900 text-white text-sm py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div />
          <div className="flex items-center gap-4 font-medium">
            <span className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-yellow-400" />
              <span>All India Customer Care:</span>
              <a href="tel:8093017400" className="hover:text-yellow-300 transition-colors">8093017400</a>
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="bg-white sticky top-0 z-50 border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex min-h-[88px] items-center justify-between gap-5">
          <div className="flex min-w-0 shrink-0 items-center gap-2">
            <img src={activeAppLogo || '/urbanpro%20logo.jpeg'} alt="UrbanPro Packer & Logistics" className="h-11 sm:h-12 w-auto max-w-[112px] object-contain" />
            <div className="leading-tight hidden sm:block" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
              <div className="text-xl sm:text-[23px] font-black tracking-tight whitespace-nowrap">
                <span style={{ color: '#1e3a8a', fontWeight: 900 }}>Urban</span><span style={{ color: '#dc2626', fontWeight: 900 }}>Pro</span>
              </div>
              <div className="text-base sm:text-[18px] font-black tracking-[0.1em] uppercase whitespace-nowrap" style={{ color: '#1e3a8a' }}>
                Packer & Logistics
              </div>
            </div>
          </div>
          <div className="hidden lg:flex min-w-0 flex-1 items-center justify-center gap-4 xl:gap-5 font-semibold text-slate-600 text-[13px] xl:text-sm">
            <a href="#services" className="whitespace-nowrap hover:text-blue-900 transition-colors">Services</a>
            <a href="#about" className="whitespace-nowrap hover:text-blue-900 transition-colors">About Us</a>
            <a href="#packing-labour" className="whitespace-nowrap hover:text-blue-900 transition-colors">Materials & Labour</a>
            <a href="#why-choose-us" className="whitespace-nowrap hover:text-blue-900 transition-colors">Why Choose Us</a>
            <a href="#network" className="whitespace-nowrap hover:text-blue-900 transition-colors">Network</a>
            <a href="#contact" className="whitespace-nowrap hover:text-blue-900 transition-colors">Contact</a>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setIsAdminView(true)}
              className="bg-slate-900 hover:bg-slate-800 text-white px-2.5 py-2 rounded font-semibold text-[11px] transition-colors shadow-sm flex items-center gap-1 cursor-pointer whitespace-nowrap"
              title="Open Admin & Inventory Management"
            >
              <Lock className="w-3 h-3 text-yellow-400" />
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
                <span>Pack Smart &amp; Move Safe with Urban<span className="text-[#ff0800]">Pro</span></span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight">
                <span className="block text-white">Your Trusted Partner</span>
              </h1>
              <p className="text-base sm:text-lg text-blue-100 max-w-xl leading-relaxed">
                <strong className="font-extrabold">
                  <span className="text-blue-200">Urban</span><span className="text-[#ff0800] font-bold">Pro</span>{' '}
                  <span className="text-blue-200">Packer &amp; Logistics</span>
                </strong>{' '}
                provides professional and reliable Packer & Mover, Relocation, and Transportation services with Packing Material & Labour Supply for Households, Offices, Businesses, and Commercial Shifting requirements.
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <a
                  href="https://wa.me/918093017400?text=Hi%20UrbanPro%20Packers%20%26%20Logistics%2C%20I%20would%20like%20to%20get%20a%20free%20quote%20for%20my%20relocation."
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    setShareToast('Opening WhatsApp for your Free Quote...');
                    setTimeout(() => setShareToast(null), 4000);
                  }}
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

              {quoteSubmitted && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="mb-5 bg-gradient-to-br from-emerald-600 to-green-700 text-white rounded-xl p-4 sm:p-5 shadow-lg border border-emerald-400/40 relative overflow-hidden"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 border border-white/30 shadow-xs">
                      <CheckCircle2 className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/25 text-white font-extrabold text-xs uppercase tracking-wider">
                          âœ“ Sent Successfully
                        </span>
                        <button
                          type="button"
                          onClick={() => setQuoteSubmitted(false)}
                          className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                          title="Dismiss notice"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <h4 className="font-bold text-lg text-white mt-1.5 leading-snug">
                        Your Free Quote Was Sent Successfully!
                      </h4>
                      <p className="text-emerald-50 text-xs sm:text-sm mt-1 leading-relaxed">
                        Your quotation inquiry has been sent to WhatsApp (+91 8093017400). Our team at <strong className="text-white"><span className="text-blue-200">Urban</span><span className="text-[#5b0f17] font-bold">Pro</span> <span className="text-blue-200">Packer &amp; Logistics</span></strong> will review your details and respond shortly!
                      </p>

                      {submittedQuoteDetails && (
                        <div className="mt-2.5 py-2 px-3 bg-black/20 rounded-lg text-xs space-y-1 text-emerald-100 border border-white/10">
                          <div><span className="text-white font-semibold">Customer:</span> {submittedQuoteDetails.name} â€¢ <span className="text-white font-semibold">Phone:</span> {submittedQuoteDetails.phone}</div>
                          <div><span className="text-white font-semibold">Route:</span> {submittedQuoteDetails.movingFrom} â†’ {submittedQuoteDetails.movingTo}</div>
                          <div><span className="text-white font-semibold">Service:</span> {submittedQuoteDetails.item}</div>
                        </div>
                      )}

                      <div className="mt-3 flex flex-wrap items-center gap-2.5">
                        {submittedQuoteDetails?.whatsappUrl && (
                          <a
                            href={submittedQuoteDetails.whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-bold bg-white text-emerald-800 hover:bg-emerald-50 px-3.5 py-2 rounded-lg shadow-sm transition-all"
                          >
                            <WhatsAppIcon className="w-4 h-4 fill-[#25D366] text-[#25D366]" />
                            Re-open WhatsApp
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => setQuoteSubmitted(false)}
                          className="text-xs font-semibold text-white/90 hover:text-white underline px-2 py-1 cursor-pointer"
                        >
                          Submit Another Quote
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

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
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Item List</label>
                  <div className="space-y-2">
                    {formData.itemRows.map((row, index) => (
                      <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                        <input type="text" value={row.name} onChange={e => updateItemRow(index, 'name', e.target.value)} className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-900 outline-none text-sm" placeholder="Item name" />
                        <input type="number" min="0" value={row.value} onChange={e => updateItemRow(index, 'value', e.target.value)} className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-900 outline-none text-sm" placeholder="Value" />
                        <button type="button" onClick={() => removeItemRow(index)} disabled={formData.itemRows.length === 1} className="px-2 text-red-600 disabled:text-slate-300 text-lg" aria-label="Remove item">×</button>
                      </div>
                    ))}
                    <button type="button" onClick={addItemRow} className="text-xs font-bold text-blue-900 hover:text-blue-700">+ Add another item</button>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold py-3.5 rounded-lg mt-1 transition-all flex items-center justify-center gap-2 group uppercase tracking-wider text-sm cursor-pointer shadow-md hover:scale-[1.01]"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 px-4 bg-slate-50">
        <div className="max-w-screen-2xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <span className="inline-block text-2xl sm:text-3xl font-black text-red-600 uppercase tracking-widest bg-red-100/80 px-6 py-2 rounded-full border border-red-200">
              OUR SERVICES
            </span>
            <h2 className="w-full text-4xl sm:text-5xl lg:text-6xl font-black text-blue-900 leading-tight">
              Complete Packing, Moving & Logistics Solutions
            </h2>
            <p className="text-slate-600 max-w-none mx-auto text-base sm:text-lg">
              <span className="text-blue-900">Urban</span><span className="text-[#ff0800] font-bold">Pro</span>{' '}<span className="text-blue-900">Packer &amp; Logistics</span> provides comprehensive, safe, and dependable shifting solutions tailored to your unique requirements across India.
            </p>
          </div>

          {/* Category 1: SHIFTING SERVICES */}
          <div className="mb-14">
            <div className="flex items-center gap-3 mb-6 pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-blue-900">Shifting Services</h3>
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
                        {service.title === 'Household Shifting' ? (
                          <span className="text-3xl leading-none" role="img" aria-label="Household shifting">🏠 📦</span>
                        ) : service.title === 'Office & Corporate Relocation' ? (
                          <span className="text-3xl leading-none" role="img" aria-label="Office relocation">🏢 💼</span>
                        ) : service.title === 'Commercial Shifting' ? (
                          <span className="text-3xl leading-none" role="img" aria-label="Commercial shifting">🏬 🚚</span>
                        ) : (
                          <Icon className="w-7 h-7 text-blue-600 group-hover:text-yellow-400 transition-colors" />
                        )}
                      </div>
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

          {/* Transportation & Other Services */}
          <div className="mb-14">
            <div className="flex items-center gap-3 mb-6 pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-blue-900">Transportation & Other Services</h3>
                <p className="text-xs sm:text-sm text-slate-500">Vehicle shifting, packing material supply, and skilled labour support</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-6">
              {services.filter(service => ['Vehicle Shifting', 'Packing Material Supply', 'Skilled Labour Available'].includes(service.title)).map((service, index) => {
                const Icon = service.icon;

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
                        {service.title === 'Vehicle Shifting' ? (
                          <span className="text-2xl leading-none" role="img" aria-label="Car and bike">
                            🚙 🛵
                          </span>
                        ) : service.title === 'Packing Material Supply' ? (
                          <span className="text-2xl leading-none" role="img" aria-label="Packing materials">
                            📦 🎁
                          </span>
                        ) : service.title === 'Skilled Labour Available' ? (
                          <img
                            src="/labour-supply.png"
                            alt="Skilled labour support"
                            className="h-12 w-12 object-contain"
                          />
                        ) : (
                          <Icon className="w-7 h-7 text-blue-600 group-hover:text-yellow-400 transition-colors" />
                        )}
                      </div>
                    </div>
                    <h4 className="text-lg font-bold text-slate-900 mb-2">{service.title}</h4>
                    <p className="text-slate-600 leading-relaxed flex-grow text-xs sm:text-sm">
                      {service.desc}
                    </p>
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
              <span className="text-[#1e3a8a]">Urban</span><span className="text-[#ff0800]">Pro</span> <span className="text-[#1e3a8a]">Packer & Logistics</span>
            </h2>
          </div>

          {/* Company Background & Legacy */}
          <div className="max-w-4xl mx-auto mb-10 bg-gradient-to-br from-blue-900 via-blue-950 to-slate-900 text-white rounded-2xl p-8 sm:p-10 shadow-xl border border-blue-800">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-6">
              <div className="w-16 h-16 bg-yellow-400 text-blue-950 rounded-2xl flex flex-col items-center justify-center font-black flex-shrink-0 shadow-lg">
                <span className="text-xs uppercase tracking-tighter font-bold text-blue-900">ESTD</span>
                <span className="text-2xl leading-none font-black">2009</span>
              </div>
              <div>
                <span className="text-xs font-bold text-yellow-400 uppercase tracking-widest">Company Background & Legacy</span>
                <h3 className="text-2xl font-bold mt-1"><span className="text-blue-200">Urban</span><span className="text-[#ff0800] font-bold">Pro</span> <span className="text-blue-200">Packer &amp; Logistics</span></h3>
              </div>
            </div>

            <p className="text-blue-100 text-base sm:text-lg leading-relaxed mb-6 font-normal">
              <span className="text-blue-200">Urban</span><span className="text-[#ff0800] font-bold">Pro</span> <span className="text-blue-200">Packer &amp; Logistics</span> was established in <strong>2009</strong> and has substantial experience in the transportation and logistics sector, undertaking a wide range of transportation-related work over the years.
            </p>

            <p className="text-blue-100 text-base sm:text-lg leading-relaxed mb-6 font-normal">
              <strong><span className="text-blue-200">Urban</span><span className="text-[#ff0800] font-bold">Pro</span> <span className="text-blue-200">Packer &amp; Logistics</span></strong> provides professional Packer & Mover, relocation, transportation and logistics services across India.
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
                <span className="text-blue-200">Urban</span><span className="text-[#ff0800] font-bold">Pro</span>{' '}<span className="text-blue-200">Packer &amp; Logistics</span> is committed to providing customer-focused services and building long-term relationships based on reliability, professionalism and responsible service.
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
                  <p className="leading-relaxed">We are committed to delivering every shipment with reliability, professionalism, and responsibility.</p>
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

            <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-7 sm:p-8">
              <div className="w-12 h-12 rounded-xl bg-blue-900 text-yellow-400 flex items-center justify-center font-bold text-xl mb-4 shadow-sm">
                🎯
              </div>
              <h3 className="text-xl font-bold text-blue-950 mb-2">Our Mission</h3>
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
            <span className="inline-flex items-center gap-2 text-xs font-bold text-blue-200 uppercase tracking-widest bg-blue-800/40 px-3.5 py-1.5 rounded-full border border-blue-500/50">
              <span>Packing Material</span>
              <span>&amp;</span>
              <span>Labour Supply</span>
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">Everything You Need for a Smooth Move</h2>
            <p className="text-slate-300 text-base sm:text-lg">
              Need packing Material or Manpower for your shifting requirement?
            </p>
            <p className="text-slate-400 text-sm max-w-2xl mx-auto">
              <span className="text-blue-200">Urban</span><span className="text-[#ff0800] font-bold">Pro</span>{' '}<span className="text-blue-200">Packer &amp; Logistics</span> provides packing materials and skilled labour support for household, office, commercial and relocation work.
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
                <div className="w-16 h-16 rounded-xl bg-white flex items-center justify-center font-bold overflow-hidden">
                  <img
                    src="/labour-supply.png"
                    alt="Skilled labour team"
                    className="h-full w-full object-contain"
                  />
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
                  Every labour team is coordinated by an experienced supervisor to ensure punctuality and respectful handling of goods.
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
              WHY CHOOSE Urban<span className="text-[#ff0800]">Pro</span> <span className="text-blue-900">Packer &amp; Logistics</span>?
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">Your Move. Our Responsibility.</h2>
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
            <span className="inline-block text-2xl sm:text-3xl font-black text-[#ff0800] uppercase tracking-widest bg-red-100 px-6 py-2 rounded-full border border-red-200">
              OUR SERVICE NETWORK
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-blue-900">Serving Major States Across India</h2>
            <p className="text-slate-700 text-base sm:text-lg font-medium">
              <span className="text-blue-900">Urban</span><span className="text-[#ff0800] font-bold">Pro</span>{' '}<span className="text-blue-900">Packer &amp; Logistics</span> provides services across major states in India:
            </p>
          </div>

          {/* States Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 max-w-5xl mx-auto mb-12">
            {[
              "Andhra Pradesh",
              "Assam",
              "Bihar",
              "Chhattisgarh",
              "Delhi",
              "Goa",
              "Gujarat",
              "Haryana",
              "Jharkhand",
              "Karnataka",
              "Kerala",
              "Madhya Pradesh",
              "Maharashtra",
              "Odisha",
              "Punjab",
              "Rajasthan",
              "Tamil Nadu",
              "Telangana",
              "Uttar Pradesh",
              "West Bengal"
            ].map((state, idx) => (
              <div
                key={idx}
                className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-blue-500 hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-red-600 flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <h4 className="font-bold text-slate-900 text-base">{state}</h4>
                </div>
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
              <span className="text-xs font-bold text-blue-700 uppercase tracking-widest block mb-1">Guiding Purpose</span>
              <h3 className="text-2xl font-bold text-blue-900 mb-3">OUR MISSION</h3>
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
              <h3 className="text-2xl font-bold text-blue-900 mb-3">OUR VISION</h3>
              <p className="text-sm text-slate-700 leading-relaxed">
                Our vision is to establish <span className="text-blue-900">Urban</span><span className="text-[#ff0800] font-bold">Pro</span> <span className="text-blue-900">Packer & Logistics</span> as a trusted and recognized name in India's Packer & Mover and Logistics industry by continuously improving our services and building lasting relationships with our customers.
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

            {quoteSubmitted && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-lg border border-emerald-500"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-white text-emerald-700 flex items-center justify-center shrink-0 font-bold">
                    âœ“
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs uppercase tracking-wider font-extrabold bg-emerald-800/80 px-2.5 py-0.5 rounded-full border border-emerald-400/40">
                        âœ“ Sent Successfully
                      </span>
                    </div>
                    <h4 className="font-bold text-sm sm:text-base mt-1 text-white">Your Free Quote Was Sent Successfully!</h4>
                    <p className="text-xs text-emerald-100 mt-0.5 leading-relaxed">
                      Thank you for contacting <span className="text-blue-900">Urban</span><span className="text-[#ff0800] font-bold">Pro</span>{' '}<span className="text-blue-900">Packer &amp; Logistics</span>. Your quote enquiry has been forwarded.
                    </p>
                    <div className="mt-3 flex items-center gap-2 flex-wrap">
                      {submittedQuoteDetails?.whatsappUrl && (
                        <a
                          href={submittedQuoteDetails.whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-bold bg-white text-emerald-800 hover:bg-emerald-50 px-3.5 py-2 rounded-lg shadow-sm transition-all"
                        >
                          <WhatsAppIcon className="w-4 h-4 fill-[#25D366] text-[#25D366]" />
                          Re-open WhatsApp
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => setQuoteSubmitted(false)}
                        className="text-xs font-semibold text-white/90 hover:text-white underline px-2 py-1 cursor-pointer"
                      >
                        Submit Another Quote
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

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
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Item List</label>
                <div className="space-y-2">
                  {formData.itemRows.map((row, index) => (
                    <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                      <input type="text" value={row.name} onChange={e => updateItemRow(index, 'name', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-900 outline-none text-sm bg-white" placeholder="Item name" />
                      <input type="number" min="0" value={row.value} onChange={e => updateItemRow(index, 'value', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-900 outline-none text-sm bg-white" placeholder="Value" />
                      <button type="button" onClick={() => removeItemRow(index)} disabled={formData.itemRows.length === 1} className="px-2 text-red-600 disabled:text-slate-300 text-lg" aria-label="Remove item">×</button>
                    </div>
                  ))}
                  <button type="button" onClick={addItemRow} className="text-xs font-bold text-blue-900 hover:text-blue-700">+ Add another item</button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold py-4 rounded-xl mt-2 transition-all flex items-center justify-center gap-2 group uppercase tracking-wider text-sm cursor-pointer shadow-lg hover:shadow-blue-900/20 active:scale-95"
              >
                <Send className="w-4 h-4" />
                <span>Submit</span>
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
            Pack Smart &amp; Move Safe with <span className="text-blue-200">Urban</span><span className="text-[#ff0800]">Pro</span>{' '}<span className="text-blue-200">Packer &amp; Logistics</span>
          </p>
          <p className="text-blue-100 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Professional Packer & Mover and Logistics Solutions for Local, Intercity, Domestic and Commercial Requirements.
          </p>
          <div className="pt-4 flex flex-wrap justify-center gap-4">
            <a
              href="tel:8093017400"
              className="bg-red-600 hover:bg-red-700 text-white font-black px-8 py-4 rounded-xl shadow-xl hover:shadow-red-500/30 transition-all text-sm sm:text-base uppercase tracking-wider inline-flex items-center gap-2 cursor-pointer"
            >
              <Phone className="w-5 h-5" /> [ CALL NOW:- 8093017400 ]
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
          <div className="mb-14 bg-blue-950/90 rounded-3xl p-6 sm:p-8 lg:p-10 border border-blue-800 shadow-2xl">
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
                      <span className="text-[#ff0800]">Pro</span>{' '}
                      <span className="text-[#1e3a8a] font-extrabold">Packer &amp; Logistics</span>
                    </h2>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-blue-200 font-bold text-base sm:text-lg mt-3">
                <PhoneCall className="w-5 h-5 text-blue-300" />
                <span>All India Customer Care:</span>
                <a href="tel:8093017400" className="text-blue-100 hover:text-blue-300 underline underline-offset-4 transition-colors">
                  8093017400
                </a>
              </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-8 items-stretch">
              <div className="lg:col-span-7 space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  {/* MAIN OPERATIONAL OFFICE */}
                  <div className="bg-blue-900/90 border border-blue-700/80 rounded-2xl p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2.5 mb-2.5">
                        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <h4 className="font-bold text-xs text-blue-200 uppercase tracking-wider">MAIN OPERATIONAL OFFICE:-</h4>
                      </div>
                      <p className="text-slate-200 text-xs sm:text-sm leading-relaxed mb-3">
                        Plot No. 1491, Hanspal, Balianta Canal Road, Bhubaneswar, Odisha â€“ 752101
                      </p>
                      <div className="text-xs font-semibold text-slate-300 mb-3 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-blue-300" /> Office: <a href="tel:8093017400" className="text-blue-100 hover:underline">8093017400</a>
                      </div>
                    </div>
                  </div>

                  {/* REG. OFFICE */}
                  <div className="bg-blue-900/90 border border-blue-700/80 rounded-2xl p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2.5 mb-2.5">
                        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <h4 className="font-bold text-xs text-blue-200 uppercase tracking-wider">REG. OFFICE:-</h4>
                      </div>
                      <p className="text-slate-200 text-xs sm:text-sm leading-relaxed mb-2 font-medium">
                        Dipka, Korba, Chhattisgarh â€“ 495452
                      </p>
                      <div className="text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-blue-300" /> Mobile: <a href="tel:8093017400" className="text-blue-100 hover:underline">8093017400</a>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-900/90 border border-blue-700/80 rounded-2xl p-4 sm:p-5 w-full max-w-full overflow-hidden">
                  <h4 className="font-bold text-xs text-blue-200 uppercase tracking-wider mb-3">CONTACT DETAILS</h4>
                  <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm font-semibold text-slate-200">
                    <a href="tel:8093017400" className="inline-flex max-w-full items-center gap-2 text-blue-100 hover:underline break-all">
                      <Phone className="w-4 h-4 text-blue-300 shrink-0" /> Contact: 8093017400
                    </a>
                    <a href="mailto:urbanpro403@gmail.com" className="inline-flex max-w-full items-center gap-2 text-blue-100 hover:underline break-all">
                      <Mail className="w-4 h-4 text-blue-300 shrink-0" /> urbanpro403@gmail.com
                    </a>
                    <a href="https://www.urbanprologistics.com" target="_blank" rel="noreferrer" className="inline-flex max-w-full items-center gap-2 text-blue-100 hover:underline break-all">
                      <Globe className="w-4 h-4 text-blue-300 shrink-0" /> www.urbanprologistics.com
                    </a>
                  </div>
                </div>

              </div>

              {/* Map Preview */}
              <div
                className="lg:col-span-5 w-full min-h-[300px] bg-blue-950 rounded-2xl overflow-hidden border border-blue-800 relative cursor-pointer"
                role="link"
                tabIndex={0}
                onClick={() => window.open('https://www.google.com/maps/search/?api=1&query=Plot+No.+1491,+Hanspal,+Balianta+Canal+Road,+Bhubaneswar,+Odisha+752101', '_blank', 'noopener,noreferrer')}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    window.open('https://www.google.com/maps/search/?api=1&query=Plot+No.+1491,+Hanspal,+Balianta+Canal+Road,+Bhubaneswar,+Odisha+752101', '_blank', 'noopener,noreferrer');
                  }
                }}
              >
                <iframe
                  src="https://maps.google.com/maps?q=Plot+No.+1491,+Hanspal,+Balianta+Canal+Road,+Bhubaneswar,+Odisha+752101&t=&z=16&ie=UTF8&iwloc=&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0, pointerEvents: 'none' }}
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="UrbanPro Packer & Logistics Location"
                  className="absolute inset-0 grayscale group-hover:grayscale-0 transition-all duration-500"
                ></iframe>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-slate-400 text-xs sm:text-sm">
            <div className="flex items-center gap-4">
              <p>© {new Date().getFullYear()} <span className="text-blue-200">Urban</span><span className="text-[#ff0800] font-bold">Pro</span>{' '}<span className="text-blue-200">Packer &amp; Logistics</span>. All rights reserved.</p>
              <button onClick={() => setIsAdminView(true)} className="text-slate-400 hover:text-white transition-colors flex items-center gap-1 font-medium cursor-pointer">
                <Lock className="w-3 h-3" /> Admin Login
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Floating WhatsApp Quick Action */}
      <a
        href="https://wa.me/918093017400?text=Hi%20UrbanPro%20Packers%20%26%20Logistics%2C%20I%20would%20like%20to%20get%20a%20free%20quote%20for%20my%20relocation."
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => {
          setShareToast('Opening WhatsApp for your Free Quote...');
          setTimeout(() => setShareToast(null), 4000);
        }}
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
