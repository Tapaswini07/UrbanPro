import React, { useMemo, useState } from 'react';
import { Search } from 'lucide-react';

interface RecordLookupProps {
  profiles: any[];
  onSelect: (profile: any) => void;
  label?: string;
}

export const RecordLookup: React.FC<RecordLookupProps> = ({
  profiles,
  onSelect,
  label = 'Find saved record by unique number, ID, name, or mobile',
}) => {
  const [query, setQuery] = useState('');

  const matches = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return [];
    const digits = value.replace(/\D/g, '');
    return profiles.filter((profile) => {
      const ids = (profile.uniqueIds || []).map((id: any) => String(id).toLowerCase());
      const searchable = [
        profile.partyName,
        profile.source,
        profile.mobileNo,
        ...ids,
      ].filter(Boolean).map((item: any) => String(item).toLowerCase());
      return searchable.some((item) => item.includes(value)) ||
        (digits.length >= 6 && String(profile.mobileNo || '').replace(/\D/g, '').includes(digits));
    }).slice(0, 8);
  }, [profiles, query]);

  const selectProfile = (profile: any) => {
    onSelect(profile);
    setQuery('');
  };

  return (
    <div className="rounded-xl border border-indigo-200 bg-indigo-50/70 p-3">
      <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-indigo-900">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 shrink-0 text-indigo-500" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="e.g. Survey 1001, quotation no., customer name..."
          className="w-full rounded-lg border border-indigo-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-indigo-500"
        />
      </div>
      {query.trim() && (
        <div className="mt-2 space-y-1.5">
          {matches.length > 0 ? matches.map((profile, index) => (
            <button
              key={`${profile.source || profile.partyName}-${index}`}
              type="button"
              onClick={() => selectProfile(profile)}
              className="flex w-full items-center justify-between rounded-lg border border-indigo-100 bg-white px-2.5 py-1.5 text-left text-xs hover:border-indigo-400 hover:bg-indigo-50"
            >
              <span className="font-semibold text-slate-800">{profile.partyName || 'Saved record'}</span>
              <span className="ml-2 text-[10px] text-indigo-700">{profile.source || 'Saved profile'}</span>
            </button>
          )) : (
            <p className="text-[11px] italic text-slate-500">No saved record found.</p>
          )}
        </div>
      )}
    </div>
  );
};
