import { useState, useRef, useEffect } from 'react';
import { Search, X, ChevronDown } from 'lucide-react';

export default function SearchableSelect({ options, value, onChange, placeholder, renderOption, renderSelected, disabled }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = options.filter(opt => {
    const searchText = (opt._searchText || '').toLowerCase();
    return searchText.includes(query.toLowerCase());
  });

  const handleSelect = (opt) => {
    onChange(opt);
    setQuery('');
    setOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange(null);
    setQuery('');
  };

  return (
    <div ref={wrapperRef} className="relative">
      {value ? (
        <div
          onClick={() => { if (!disabled) { setOpen(!open); } }}
          className={`flex items-center justify-between border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white cursor-pointer hover:border-indigo-300 transition-colors ${disabled ? 'opacity-60 pointer-events-none' : ''}`}
        >
          <div className="flex-1 min-w-0">{renderSelected ? renderSelected(value) : value.label}</div>
          <button onClick={handleClear} className="shrink-0 ml-2 text-slate-400 hover:text-slate-600 transition-colors">
            <X size={14} />
          </button>
        </div>
      ) : (
        <div
          onClick={() => { if (!disabled) { setOpen(true); setTimeout(() => inputRef.current?.focus(), 50); } }}
          className={`flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white cursor-pointer hover:border-indigo-300 transition-colors ${disabled ? 'opacity-60 pointer-events-none' : ''}`}
        >
          <Search size={14} className="text-slate-400 shrink-0" />
          {open ? (
            <input
              ref={inputRef}
              type="text"
              className="flex-1 outline-none bg-transparent text-slate-800 placeholder-slate-400"
              placeholder={placeholder || 'Cari...'}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setOpen(true)}
            />
          ) : (
            <span className="flex-1 text-slate-400">{placeholder || 'Cari...'}</span>
          )}
          <ChevronDown size={14} className={`text-slate-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
        </div>
      )}

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-52 overflow-y-auto">
          {value && (
            <div className="p-2 border-b border-slate-100">
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  ref={inputRef}
                  type="text"
                  className="w-full pl-8 pr-3 py-1.5 text-sm outline-none bg-slate-50 rounded-lg placeholder-slate-400"
                  placeholder="Ketik untuk mencari..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
          )}
          {filtered.length === 0 ? (
            <div className="px-3 py-6 text-center text-sm text-slate-400">Tidak ditemukan</div>
          ) : (
            filtered.map((opt, i) => (
              <button
                key={opt._id || i}
                type="button"
                onClick={() => handleSelect(opt)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-indigo-50 transition-colors flex items-center gap-2"
              >
                {renderOption ? renderOption(opt) : <span>{opt.label}</span>}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
