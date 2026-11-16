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
  ExternalLink,
  Trash2,
  Edit3,
  Save,
  X,
  FileText,
  ClipboardList,
  Filter,
  Check,
  AlertCircle,
  Sparkles,
  PhoneCall,
  UserCheck
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
  itemRows?: Array<{ name: string; value: string }>;
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
    badgeClass: 'bg-red-500/20 text-red-400 border-red-500/30',
    dotClass: 'bg-red-500 animate-pulse',
  },
  Contacted: {
    label: 'Contacted',
    badgeClass: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    dotClass: 'bg-blue-500',
  },
  'Survey Scheduled': {
    label: 'Survey Scheduled',
    badgeClass: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    dotClass: 'bg-amber-500',
  },
  'Quotation Sent': {
    label: 'Quotation Sent',
    badgeClass: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    dotClass: 'bg-purple-500',
  },
  Converted: {
    label: 'Converted / Booked',
    badgeClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    dotClass: 'bg-emerald-500',
  },
  Cancelled: {
    label: 'Cancelled / Lost',
    badgeClass: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    dotClass: 'bg-slate-500',
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

  // Helper to ensure each enquiry has a stable ID
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
    const convertedCount = enquiries.filter(e => e.status === 'Converted').length;
    return { total, newCount, contactedCount, convertedCount };
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
    <div className="space-y-6">
      {/* Top Banner / Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400">
                <Inbox className="w-5 h-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Website Customer Enquiries & Leads
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Sync Active
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
              Real-time enquiries submitted through the website. Contact customers instantly, schedule surveys, prepare quotations, and track lead conversion statuses.
            </p>
          </div>

          {/* Quick Counter */}
          <div className="flex items-center gap-2 sm:gap-3 bg-slate-950/70 border border-slate-800 px-4 py-2.5 rounded-xl self-start sm:self-center">
            <span className="text-xs text-slate-400 font-medium">New Leads:</span>
            <span className="px-2 py-0.5 bg-red-500 text-white font-black text-xs rounded-full animate-pulse">
              {stats.newCount}
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-xs text-slate-400 font-medium">Total:</span>
            <span className="text-xs font-bold text-white">{stats.total}</span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800/80">
          <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-3">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Total Enquiries
            </span>
            <span className="text-2xl font-black text-white">{stats.total}</span>
          </div>
          <div className="bg-slate-950/50 border border-red-500/20 rounded-xl p-3">
            <span className="text-[11px] font-semibold text-red-400 uppercase tracking-wider block mb-1">
              New / Pending
            </span>
            <span className="text-2xl font-black text-red-400">{stats.newCount}</span>
          </div>
          <div className="bg-slate-950/50 border border-blue-500/20 rounded-xl p-3">
            <span className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider block mb-1">
              Contacted
            </span>
            <span className="text-2xl font-black text-blue-400">{stats.contactedCount}</span>
          </div>
          <div className="bg-slate-950/50 border border-emerald-500/20 rounded-xl p-3">
            <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider block mb-1">
              Converted Moves
            </span>
            <span className="text-2xl font-black text-emerald-400">{stats.convertedCount}</span>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between shadow-lg">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by customer name, phone, moving city, items, or notes..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs">
          <span className="text-slate-500 flex items-center gap-1 font-semibold pl-1 pr-2 shrink-0">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          {['All', 'New', 'Contacted', 'Survey Scheduled', 'Quotation Sent', 'Converted', 'Cancelled'].map(
            status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 transition-colors cursor-pointer ${
                  statusFilter === status
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {status}
              </button>
            )
          )}
        </div>
      </div>

      {/* Enquiries List */}
      {filteredEnquiries.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center shadow-lg">
          <div className="w-14 h-14 bg-slate-800/60 rounded-2xl flex items-center justify-center mx-auto mb-3 text-slate-500">
            <Inbox className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">No Enquiries Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchTerm || statusFilter !== 'All'
              ? 'No customer enquiries match your search keywords or active status filter.'
              : 'Website enquiries submitted by customers will show up here in real-time automatically.'}
          </p>
          {(searchTerm || statusFilter !== 'All') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('All');
              }}
              className="mt-4 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg font-semibold transition-colors cursor-pointer"
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
              `Hello ${enquiry.name || 'Customer'},\n\nThank you for reaching out to UrbanPro Packer & Logistics regarding your relocation from ${enquiry.movingFrom || 'your city'} to ${enquiry.movingTo || 'destination'}.\n\nWe have received your enquiry and would like to share the best moving quote for your requirement.`
            );

            return (
              <div
                key={id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 shadow-lg transition-all"
              >
                {/* Header: ID, Date, Status Selector */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono text-xs font-bold text-sky-400 bg-sky-950/80 border border-sky-800/60 px-2.5 py-1 rounded-md">
                      {id}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      {formatDate(enquiry.submittedAt)}
                    </span>
                    {enquiry.emailDelivered === false && (
                      <span className="text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Email Delivery Delayed
                      </span>
                    )}
                  </div>

                  {/* Status Dropdown */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-semibold">Status:</span>
                    <div className="relative inline-block">
                      <select
                        value={status}
                        onChange={e => onUpdateStatus(id, e.target.value as EnquiryItem['status'])}
                        className={`text-xs font-bold rounded-lg px-3 py-1.5 border appearance-none pr-7 cursor-pointer focus:outline-hidden ${statusCfg.badgeClass}`}
                      >
                        <option value="New" className="bg-slate-900 text-red-400">
                          ● New / Unread
                        </option>
                        <option value="Contacted" className="bg-slate-900 text-blue-400">
                          ● Contacted
                        </option>
                        <option value="Survey Scheduled" className="bg-slate-900 text-amber-400">
                          ● Survey Scheduled
                        </option>
                        <option value="Quotation Sent" className="bg-slate-900 text-purple-400">
                          ● Quotation Sent
                        </option>
                        <option value="Converted" className="bg-slate-900 text-emerald-400">
                          ● Converted / Booked
                        </option>
                        <option value="Cancelled" className="bg-slate-900 text-slate-400">
                          ● Cancelled / Lost
                        </option>
                      </select>
                      <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[10px]">
                        ▼
                      </span>
                    </div>
                  </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 py-4">
                  {/* Column 1: Customer Contact Info */}
                  <div className="space-y-2.5">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Customer Details
                    </span>
                    <div className="text-base font-extrabold text-white flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-sky-400" />
                      {enquiry.name || 'Anonymous Customer'}
                    </div>

                    {/* Phone with Instant Call & WhatsApp */}
                    <div className="flex items-center gap-2 flex-wrap pt-1">
                      <a
                        href={`tel:${cleanPhone}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 hover:text-sky-300 text-xs font-bold border border-slate-700 transition-colors"
                        title="Click to Call"
                      >
                        <PhoneCall className="w-3.5 h-3.5 text-sky-400" />
                        <span>{enquiry.phone || 'No phone'}</span>
                      </a>

                      {cleanPhone && (
                        <a
                          href={`https://wa.me/91${cleanPhone}?text=${waText}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 hover:text-emerald-200 text-xs font-bold border border-emerald-500/30 transition-colors"
                          title="Open WhatsApp chat with prefilled message"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                          <span>WhatsApp</span>
                        </a>
                      )}
                    </div>

                    {enquiry.email && (
                      <div className="pt-0.5">
                        <a
                          href={`mailto:${enquiry.email}`}
                          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
                        >
                          <Mail className="w-3.5 h-3.5 text-slate-500" />
                          <span>{enquiry.email}</span>
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Column 2: Relocation Requirements */}
                  <div className="space-y-2.5 md:border-l md:border-r border-slate-800/80 md:px-5">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Move Requirements
                    </span>

                    {/* Route */}
                    <div className="flex items-center gap-2 text-sm font-semibold text-white">
                      <span className="text-slate-300">{enquiry.movingFrom || 'Not specified'}</span>
                      <ArrowRight className="w-4 h-4 text-amber-400 shrink-0" />
                      <span className="text-amber-300">{enquiry.movingTo || 'Not specified'}</span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-300 pt-1">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        Date: <strong className="text-white">{enquiry.movingDate || 'Flexible'}</strong>
                      </span>
                    </div>

                    <div className="text-xs text-slate-300">
                      Service Type:{' '}
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-sky-300 font-bold border border-slate-700">
                        {enquiry.item || enquiry.serviceType || 'Household Goods'}
                      </span>
                    </div>
                  </div>

                  {/* Column 3: Items & Customer Message */}
                  <div className="space-y-2.5">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Items & Notes
                    </span>

                    {enquiry.itemRows && enquiry.itemRows.length > 0 && enquiry.itemRows.some(r => r.name) ? (
                      <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                        {enquiry.itemRows
                          .filter(r => r.name?.trim())
                          .map((r, rIdx) => (
                            <div
                              key={rIdx}
                              className="text-xs bg-slate-950/70 border border-slate-800 rounded px-2.5 py-1 flex items-center justify-between text-slate-300"
                            >
                              <span>{r.name}</span>
                              {r.value && <span className="font-mono text-slate-400 text-[11px]">₹{r.value}</span>}
                            </div>
                          ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No specific items listed in enquiry.</p>
                    )}

                    {enquiry.message && (
                      <div className="mt-2 text-xs bg-slate-950/40 p-2 rounded-lg border border-slate-800/80 text-slate-400 line-clamp-2">
                        {enquiry.message}
                      </div>
                    )}
                  </div>
                </div>

                {/* Admin Notes Section */}
                <div className="mt-2 pt-3 border-t border-slate-800/80">
                  {editingNotesId === id ? (
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        Update Follow-up Notes:
                      </label>
                      <textarea
                        value={tempNotes}
                        onChange={e => setTempNotes(e.target.value)}
                        placeholder="Add notes like: 'Called customer, quote agreed at ₹14,000, survey fixed for 16th...'"
                        rows={2}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
                      />
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            onUpdateNotes(id, tempNotes);
                            setEditingNotesId(null);
                          }}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Save className="w-3.5 h-3.5" /> Save Notes
                        </button>
                        <button
                          onClick={() => setEditingNotesId(null)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-xs">
                      <div className="text-slate-400 flex items-center gap-2">
                        <Edit3 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="font-semibold text-slate-400">Admin Notes:</span>
                        <span className="text-slate-200">
                          {enquiry.adminNotes || <span className="italic text-slate-500">No follow-up notes yet.</span>}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setEditingNotesId(id);
                          setTempNotes(enquiry.adminNotes || '');
                        }}
                        className="text-xs text-sky-400 hover:text-sky-300 font-semibold transition-colors cursor-pointer"
                      >
                        {enquiry.adminNotes ? 'Edit Notes' : '+ Add Note'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Bottom Actions: Convert to Survey / Quotation, WhatsApp, Delete */}
                <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {onCreateSurvey && (
                      <button
                        type="button"
                        onClick={() => onCreateSurvey(enquiry)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                        title="Create Survey pre-filled with this enquiry's details"
                      >
                        <ClipboardList className="w-3.5 h-3.5" />
                        <span>Create Survey</span>
                      </button>
                    )}

                    {onCreateQuotation && (
                      <button
                        type="button"
                        onClick={() => onCreateQuotation(enquiry)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                        title="Create Quotation pre-filled with this enquiry's details"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Create Quotation</span>
                      </button>
                    )}
                  </div>

                  {/* Delete Enquiry Button */}
                  <div>
                    {deletingId === id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-red-400 font-semibold">Confirm delete?</span>
                        <button
                          type="button"
                          onClick={() => {
                            onDeleteEnquiry(id);
                            setDeletingId(null);
                          }}
                          className="px-2 py-1 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded cursor-pointer"
                        >
                          Yes, Delete
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingId(null)}
                          className="px-2 py-1 bg-slate-800 text-slate-300 text-xs rounded hover:bg-slate-700 cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setDeletingId(id)}
                        className="text-slate-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-950/30 transition-colors cursor-pointer"
                        title="Delete Enquiry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
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
