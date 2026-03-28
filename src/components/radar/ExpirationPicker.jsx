import { useMemo } from 'react';

export default function ExpirationPicker({ expirations, categorizedExps, selected, onChange }) {
  // Use categorized if available, otherwise fall back to raw
  const items = useMemo(() => {
    if (categorizedExps && categorizedExps.length > 0) return categorizedExps;
    if (!expirations || expirations.length === 0) return [];
    const today = new Date().toISOString().split('T')[0];
    return expirations.filter(e => e > today).map(e => ({ date: e, type: 'WEEKLY', label: 'Weekly', daysAway: 0 }));
  }, [expirations, categorizedExps]);

  if (items.length === 0) return <span className="text-xs text-[#666]">No future expirations</span>;

  // Show first 3 as quick buttons, rest in dropdown
  const quickItems = items.slice(0, 3);
  const restItems = items.slice(3);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getStyle = (item, isSelected) => {
    if (isSelected) {
      return 'bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/30';
    }
    if (item.type === 'QUARTERLY') {
      return 'bg-[#a855f7]/10 text-[#a855f7] border border-[#a855f7]/30';
    }
    if (item.type === 'MONTHLY') {
      return 'bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/30';
    }
    return 'bg-white/5 text-[#d0d0dd] border border-white/5';
  };

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {quickItems.map(item => (
        <button
          key={item.date}
          onClick={() => onChange(item.date)}
          className={`px-2 py-1 rounded text-xs font-medium transition-colors ${getStyle(item, selected === item.date)}`}
        >
          {formatDate(item.date)}
          {item.type !== 'WEEKLY' && (
            <span className="ml-1 opacity-75">{item.label}</span>
          )}
        </button>
      ))}
      {restItems.length > 0 && (
        <select
          value={restItems.some(i => i.date === selected) ? selected : ''}
          onChange={(e) => { if (e.target.value) onChange(e.target.value); }}
          className="bg-[#0d1117] border border-white/5 rounded px-2 py-1 text-xs text-[#d0d0dd] outline-none"
        >
          <option value="">More ({restItems.length})...</option>
          {restItems.map(item => (
            <option key={item.date} value={item.date}>
              {formatDate(item.date)} {item.type !== 'WEEKLY' ? `[${item.label}]` : ''} ({item.daysAway}d)
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
