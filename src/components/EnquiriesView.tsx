import React, { useState, useMemo } from 'react';
import {
  Inbox,
  Search,
  Phone,
  Mail,
  MapPin,
  Calendar,
  MessageSquare,
  CheckCircle2,
  Clock,
  ArrowRight,
  Trash2,
  Edit3,
  Save,
  X,
  FileText,
  ClipboardList,
  Filter,
  AlertCircle,
  PhoneCall,
  UserCheck,
  Package,
  Layers,
  Sparkles,
  ShieldCheck,
  Copy,
  Check
} from 'lucide-react';

export interface EnquiryItem {
  id?: string;
  name: string;
  phone: string;
  email?: string;
  movingFrom?: string;
  movingTo?: string;
  item?: string;
  serviceType?: string;
  movingDate?: string;
  items?: string;
  itemRows?: Array<{ name: string; qty?: string; value?: string }>;
  message?: string;
  whatsappUrl?: string;
  status?: 'New' | 'Contacted' | 'Survey Scheduled' | 'Quotation Sent' | 'Converted' | 'Cancelled';
  adminNotes?: string;
  submittedAt?: string;
  emailDelivered?: boolean;
}

interface EnquiriesViewProps {
  enquiries: EnquiryItem[];
  onUpdateStatus: (enquiryId: string, status: EnquiryItem['status']) => void;
  onUpdateNotes: (enquiryId: string, notes: string) => void;
  onDeleteEnquiry: (enquiryId: string) => void;
  onCreateSurvey?: (enquiry: EnquiryItem) => void;
  onCreateQuotation?: (enquiry: EnquiryItem) => void;
}

const STATUS_CONFIG: Record<
  NonNullable<EnquiryItem['status']>,
  { label: string; badgeClass: string; dotClass: string }
> = {
  New: {
    label: 'New / Unread',
    badgeClass: 'bg-red-50 text-red-700 border-red-200 ring-1 ring-red-400/20',
    dotClass: 'bg-red-500 animate-pulse',
  },
  Contacted: {
    label: 'Contacted',
    badgeClass: 'bg-sky-50 text-sky-700 border-sky-200 ring-1 ring-sky-400/20',
    dotClass: 'bg-sky-500',
  },
  'Survey Scheduled': {
    label: 'Survey Scheduled',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200 ring-1 ring-amber-400/20',
    dotClass: 'bg-amber-500',
  },
  'Quotation Sent': {
    label: 'Quotation Sent',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200 ring-1 ring-purple-400/20',
    dotClass: 'bg-purple-500',
  },
  Converted: {
    label: 'Converted / Booked',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200 ring-1 ring-emerald-400/20',
    dotClass: 'bg-emerald-500',
  },
  Cancelled: {
    label: 'Cancelled / Lost',
    badgeClass: 'bg-slate-100 text-slate-600 border-slate-200 ring-1 ring-slate-300/40',
    dotClass: 'bg-slate-400',
  },
};

export const EnquiriesView: React.FC<EnquiriesViewProps> = ({
  enquiries,
  onUpdateStatus,
  onUpdateNotes,
  onDeleteEnquiry,
  onCreateSurvey,
  onCreateQuotation,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copiedPhoneId, setCopiedPhoneId] = useState<string | null>(null);

  const getEnquiryId = (enq: EnquiryItem, index: number): string => {
    return enq.id || (enq.submittedAt ? `ENQ-${new Date(enq.submittedAt).getTime()}` : `ENQ-${index}`);
  };

  const filteredEnquiries = useMemo(() => {
    return enquiries.filter((enq, index) => {
      const id = getEnquiryId(enq, index);
      const status = enq.status || 'New';
      if (statusFilter !== 'All' && status !== statusFilter) return false;

      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        id.toLowerCase().includes(term) ||
        (enq.name || '').toLowerCase().includes(term) ||
        (enq.phone || '').toLowerCase().includes(term) ||
        (enq.email || '').toLowerCase().includes(term) ||
        (enq.movingFrom || '').toLowerCase().includes(term) ||
        (enq.movingTo || '').toLowerCase().includes(term) ||
        (enq.item || '').toLowerCase().includes(term) ||
        (enq.adminNotes || '').toLowerCase().includes(term)
      );
    });
  }, [enquiries, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    const total = enquiries.length;
    const newCount = enquiries.filter(e => !e.status || e.status === 'New').length;
    const contactedCount = enquiries.filter(e => e.status === 'Contacted').length;
    const scheduledCount = enquiries.filter(e => e.status === 'Survey Scheduled' || e.status === 'Quotation Sent').length;
    const convertedCount = enquiries.filter(e => e.status === 'Converted').length;
    return { total, newCount, contactedCount, scheduledCount, convertedCount };
  }, [enquiries]);

  const formatDate = (isoString?: string) => {
    if (!isoString) return 'Recent';
    try {
      const d = new Date(isoString);
      return d.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return isoString;
    }
  };

  const getCleanPhone = (phone: string) => {
    return phone.replace(/[^\d]/g, '');
  };

  return (
    <div className="space-y-6 text-slate-800">
      {/* Top Banner / Header in Professional White & Light Blue */}
      <div className="bg-white rounded-2xl border border-sky-100 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-[#1e3a8a] via-[#1e40af] to-[#0f172a] text-white p-6 sm:p-7 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div>
              <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-xs border border-white/20 flex items-center justify-center text-white shadow-xs">
                  <Inbox className="w-5 h-5 text-sky-300" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                    Customer Enquiries & Moving Leads
                  </h1>
                  <p className="text-xs text-sky-100/90 font-medium">
                    Live leads submitted directly through the UrbanPro website forms
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 self-start sm:self-center">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-white/15 text-white backdrop-blur-xs border border-white/20">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Real-Time Database Connected
              </span>
            </div>
          </div>
        </div>

        {/* 4 Stats Cards in White & Soft Pastel Tones */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 p-4 sm:p-5 bg-sky-50/40 border-t border-sky-100">
          <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Total Enquiries
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-800">{stats.total}</div>
          </div>

          <div className="bg-white border border-red-200 rounded-xl p-3.5 shadow-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-red-600 uppercase tracking-wider">
                New / Unread
              </span>
              {stats.newCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              )}
            </div>
            <div className="text-2xl sm:text-3xl font-black text-red-600">{stats.newCount}</div>
          </div>

          <div className="bg-white border border-sky-200 rounded-xl p-3.5 shadow-xs">
            <span className="text-[11px] font-bold text-sky-700 uppercase tracking-wider block mb-1">
              In Follow-Up
            </span>
            <div className="text-2xl sm:text-3xl font-black text-sky-700">
              {stats.contactedCount + stats.scheduledCount}
            </div>
          </div>

          <div className="bg-white border border-emerald-200 rounded-xl p-3.5 shadow-xs">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block mb-1">
              Converted Moves
            </span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-700">{stats.convertedCount}</div>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar in Crisp White */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by customer name, phone, moving city, items, or notes..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs">
          <span className="text-slate-400 flex items-center gap-1 font-bold pl-1 pr-1.5 shrink-0 uppercase tracking-wider text-[11px]">
            <Filter className="w-3.5 h-3.5 text-slate-500" /> Filter:
          </span>
          {['All', 'New', 'Contacted', 'Survey Scheduled', 'Quotation Sent', 'Converted', 'Cancelled'].map(
            status => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg font-bold shrink-0 transition-all cursor-pointer text-xs ${
                  statusFilter === status
                    ? 'bg-[#1e3a8a] text-white shadow-xs'
                    : 'bg-sky-50/80 hover:bg-sky-100 text-slate-700 border border-sky-100'
                }`}
              >
                {status}
              </button>
            )
          )}
        </div>
      </div>

      {/* Enquiries List in Clean Light Blue & White */}
      {filteredEnquiries.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-xs">
          <div className="w-14 h-14 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-sky-100">
            <Inbox className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-1">No Enquiries Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchTerm || statusFilter !== 'All'
              ? 'No customer enquiries match your search query or status filter.'
              : 'Website customer enquiries will appear here automatically in real time.'}
          </p>
          {(searchTerm || statusFilter !== 'All') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('All');
              }}
              className="mt-4 px-4 py-1.5 bg-sky-50 hover:bg-sky-100 text-blue-900 border border-sky-200 text-xs rounded-lg font-bold transition-colors cursor-pointer"
            >
              Clear Search & Filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEnquiries.map((enquiry, index) => {
            const id = getEnquiryId(enquiry, index);
            const status = enquiry.status || 'New';
            const statusCfg = STATUS_CONFIG[status] || STATUS_CONFIG.New;
            const cleanPhone = getCleanPhone(enquiry.phone || '');
            const waText = encodeURIComponent(
              `Hello ${enquiry.name || 'Customer'},\n\nThank you for choosing UrbanPro Packer & Logistics regarding your relocation from ${enquiry.movingFrom || 'your city'} to ${enquiry.movingTo || 'destination'}.\n\nWe have received your enquiry and would like to provide you with the best moving estimate.`
            );

            return (
              <div
                key={id}
                className="bg-white border border-slate-200/90 hover:border-sky-300 rounded-2xl shadow-xs hover:shadow-md transition-all overflow-hidden"
              >
                {/* Header Strip with Light Blue Tint */}
                <div className="bg-gradient-to-r from-sky-50 via-white to-slate-50 px-5 py-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono text-xs font-black text-blue-900 bg-blue-100/70 border border-blue-200 px-2.5 py-0.5 rounded-md">
                      {id}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {formatDate(enquiry.submittedAt)}
                    </span>
                    {enquiry.emailDelivered === false && (
                      <span className="text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 text-amber-500" /> Email Notice Delayed
                      </span>
                    )}
                  </div>

                  {/* Status Dropdown Selector */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                      Status:
                    </span>
                    <div className="relative inline-block">
                      <select
                        value={status}
                        onChange={e => onUpdateStatus(id, e.target.value as EnquiryItem['status'])}
                        className={`text-xs font-bold rounded-lg px-3 py-1.5 border appearance-none pr-7 cursor-pointer focus:outline-none transition-colors ${statusCfg.badgeClass}`}
                      >
                        <option value="New">● New / Unread</option>
                        <option value="Contacted">● Contacted</option>
                        <option value="Survey Scheduled">● Survey Scheduled</option>
                        <option value="Quotation Sent">● Quotation Sent</option>
                        <option value="Converted">● Converted / Booked</option>
                        <option value="Cancelled">● Cancelled / Lost</option>
                      </select>
                      <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[10px]">
                        ▼
                      </span>
                    </div>
                  </div>
                </div>

                {/* Main Card Body */}
                <div className="p-5">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Column 1: Customer Info */}
                    <div className="space-y-2.5">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                        Customer Contact
                      </span>
                      <div className="text-[15px] font-bold text-slate-900 flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-blue-600 shrink-0" />
                        <span className="truncate">{enquiry.name || 'Anonymous Customer'}</span>
                      </div>

                      {/* Phone with Selection, Copy & Quick Actions */}
                      <div className="flex items-center gap-2 flex-wrap pt-0.5">
                        {/* Selectable Phone Badge with Copy Button */}
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-sky-50 text-blue-950 text-xs font-bold border border-sky-200 shadow-2xs">
                          <PhoneCall className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                          <span
                            className="select-all font-mono tracking-wide cursor-text selection:bg-blue-200 selection:text-blue-950"
                            title="Selectable phone number"
                          >
                            {enquiry.phone || 'No phone'}
                          </span>
                          {cleanPhone && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                void navigator.clipboard?.writeText(cleanPhone);
                                setCopiedPhoneId(id);
                                setTimeout(() => setCopiedPhoneId(null), 2000);
                              }}
                              className="ml-1 p-1 rounded-md text-blue-600 hover:text-blue-900 hover:bg-sky-200/60 transition-colors cursor-pointer"
                              title="Copy phone number to clipboard"
                            >
                              {copiedPhoneId === id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          )}
                        </div>

                        {cleanPhone && (
                          <a
                            href={`tel:${cleanPhone}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-sky-100 hover:bg-sky-200 text-blue-900 text-xs font-bold border border-sky-300 transition-colors shadow-2xs cursor-pointer"
                            title="Call customer directly"
                          >
                            <Phone className="w-3.5 h-3.5 text-blue-700" />
                            <span className="hidden sm:inline">Call</span>
                          </a>
                        )}

                        {cleanPhone && (
                          <a
                            href={`https://wa.me/91${cleanPhone}?text=${waText}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 transition-colors shadow-2xs cursor-pointer"
                            title="Chat on WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                            <span>WhatsApp</span>
                          </a>
                        )}
                      </div>

                      {enquiry.email && (
                        <div className="pt-0.5">
                          <a
                            href={`mailto:${enquiry.email}`}
                            className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-blue-900 transition-colors font-medium"
                          >
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            <span className="truncate">{enquiry.email}</span>
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Column 2: Relocation Requirements */}
                    <div className="space-y-2.5 md:border-l md:border-r border-slate-100 md:px-5">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                        Relocation Route & Date
                      </span>

                      {/* From -> To Route Badge */}
                      <div className="flex items-center gap-2 text-xs sm:text-sm bg-sky-50/80 p-2.5 rounded-xl border border-sky-200/80">
                        <span className="text-slate-800 font-bold">{enquiry.movingFrom || 'Origin'}</span>
                        <ArrowRight className="w-4 h-4 text-red-500 shrink-0" />
                        <span className="text-slate-800 font-bold">{enquiry.movingTo || 'Destination'}</span>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-slate-600 pt-0.5">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-sky-600" />
                          Moving Date: <strong className="text-slate-900 font-bold ml-1">{enquiry.movingDate || 'Flexible'}</strong>
                        </span>
                      </div>

                      <div className="text-xs text-slate-600 flex items-center gap-1.5">
                        <span>Service Type:</span>
                        <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-900 text-xs font-bold border border-blue-200">
                          {enquiry.item || enquiry.serviceType || 'Household Goods'}
                        </span>
                      </div>
                    </div>

                    {/* Column 3: Item List with Quantity & Value */}
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                          Item Inventory & Quantity
                        </span>
                        {(() => {
                          const totalVal = enquiry.itemRows
                            ?.filter(r => r.value && !isNaN(Number(r.value)))
                            .reduce((sum, r) => sum + Number(r.value) * (Number(r.qty) || 1), 0);
                          return totalVal && totalVal > 0 ? (
                            <span className="text-[11px] font-extrabold text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-2 py-0.5 rounded-md">
                              Total: ₹{totalVal.toLocaleString('en-IN')}
                            </span>
                          ) : null;
                        })()}
                      </div>

                      {enquiry.itemRows && enquiry.itemRows.length > 0 && enquiry.itemRows.some(r => r.name) ? (
                        <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                          {enquiry.itemRows
                            .filter(r => r.name?.trim())
                            .map((r, rIdx) => (
                              <div
                                key={rIdx}
                                className="bg-slate-50/90 hover:bg-slate-100/90 border border-slate-200/90 rounded-lg px-3 py-1.5 flex items-center justify-between text-slate-700 transition-colors"
                              >
                                <span className="text-[13px] font-medium text-slate-800 truncate mr-2">{r.name}</span>
                                <div className="flex items-center gap-2 shrink-0">
                                  <span className="bg-sky-100 text-sky-800 text-[11px] font-extrabold px-2 py-0.5 rounded-md">
                                    Qty: {r.qty || '1'}
                                  </span>
                                  {r.value && (
                                    <span className="text-sm font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md shadow-2xs">
                                      ₹{Number(r.value) ? Number(r.value).toLocaleString('en-IN') : r.value}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                        </div>
                      ) : enquiry.items ? (
                        <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200 leading-relaxed whitespace-pre-line">
                          {enquiry.items}
                        </p>
                      ) : (
                        <p className="text-xs text-slate-400 italic">No specific items listed in enquiry.</p>
                      )}

                      {enquiry.message &&
                        !enquiry.message.toLowerCase().includes('new quote request from website') &&
                        !enquiry.message.toLowerCase().includes('moving from:') &&
                        enquiry.message.trim() !== '' && (
                        <div className="mt-2 text-xs bg-blue-50/40 p-2.5 rounded-lg border-l-3 border-blue-500 border border-blue-100 text-slate-700">
                          <strong className="text-blue-950 font-bold block text-[11px] mb-0.5">Customer Note:</strong>
                          <p className="leading-relaxed whitespace-pre-wrap">{enquiry.message}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Admin Follow-up Notes in Light Warm Box */}
                  <div className="mt-4 pt-3.5 border-t border-slate-100">
                    {editingNotesId === id ? (
                      <div className="space-y-2 bg-sky-50/50 p-3 rounded-xl border border-sky-100">
                        <label className="text-[11px] font-bold text-blue-900 uppercase tracking-wider block">
                          Update Follow-up Notes:
                        </label>
                        <textarea
                          value={tempNotes}
                          onChange={e => setTempNotes(e.target.value)}
                          placeholder="e.g. 'Called customer, 2BHK shifting scheduled for Sunday, quote agreed at ₹12,500...'"
                          rows={2}
                          className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900"
                        />
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              onUpdateNotes(id, tempNotes);
                              setEditingNotesId(null);
                            }}
                            className="px-3 py-1.5 bg-[#1e3a8a] hover:bg-blue-900 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Save className="w-3.5 h-3.5" /> Save Notes
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingNotesId(null)}
                            className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-xs bg-sky-50/40 px-3.5 py-2 rounded-xl border border-sky-100/70">
                        <div className="text-slate-600 flex items-center gap-2 flex-wrap">
                          <Edit3 className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                          <span className="font-bold text-slate-700">Follow-up Notes:</span>
                          <span className="text-slate-800">
                            {enquiry.adminNotes || (
                              <span className="italic text-slate-400">No follow-up notes yet. Click to add.</span>
                            )}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingNotesId(id);
                            setTempNotes(enquiry.adminNotes || '');
                          }}
                          className="text-xs text-blue-900 hover:text-blue-700 font-bold hover:underline transition-colors cursor-pointer shrink-0 ml-2"
                        >
                          {enquiry.adminNotes ? 'Edit Notes' : '+ Add Note'}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons: Convert to Survey / Quotation, WhatsApp, Delete */}
                  <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      {onCreateSurvey && (
                        <button
                          type="button"
                          onClick={() => onCreateSurvey(enquiry)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                          title="Open Add Survey form pre-filled with this customer's details"
                        >
                          <ClipboardList className="w-3.5 h-3.5" />
                          <span>Create Survey</span>
                        </button>
                      )}

                      {onCreateQuotation && (
                        <button
                          type="button"
                          onClick={() => onCreateQuotation(enquiry)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                          title="Open Add Quotation form pre-filled with this customer's details"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Create Quotation</span>
                        </button>
                      )}
                    </div>

                    {/* Delete Enquiry with safety prompt */}
                    <div>
                      {deletingId === id ? (
                        <div className="flex items-center gap-2 bg-red-50 p-1.5 rounded-lg border border-red-200">
                          <span className="text-xs text-red-700 font-bold">Delete this lead?</span>
                          <button
                            type="button"
                            onClick={() => {
                              onDeleteEnquiry(id);
                              setDeletingId(null);
                            }}
                            className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded cursor-pointer"
                          >
                            Yes, Delete
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingId(null)}
                            className="px-2 py-1 bg-slate-200 text-slate-700 text-xs rounded hover:bg-slate-300 cursor-pointer font-semibold"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setDeletingId(id)}
                          className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                          title="Delete Enquiry"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
