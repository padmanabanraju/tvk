import { useState } from 'react';
import { formatCurrency, formatPercent } from '../../utils/format';

export default function EarningsCard({ earnings }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="bg-[#0d1117] rounded-xl border border-white/5 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <span className="font-bold text-white">EARNINGS</span>
        <span className="text-[#666] text-sm">{open ? '▼' : '▶'}</span>
      </button>
      {open && (
        <div className="px-4 pb-4">
          {earnings === null ? (
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-5 w-full" />)}
            </div>
          ) : !Array.isArray(earnings) || earnings.length === 0 ? (
            <p className="text-[#666] text-sm">No earnings data available for this ticker</p>
          ) : (
            <div className="space-y-2">
              {earnings.slice(0, 6).map((e, i) => {
                const surprise = e.surprisePercent;
                const color = surprise > 0 ? '#22c55e' : surprise < 0 ? '#ef4444' : '#666';
                return (
                  <div key={i} className="flex justify-between items-center py-1.5 border-b border-white/5">
                    <span className="text-sm text-[#666]">{e.period}</span>
                    <div className="flex items-center gap-3 font-mono text-sm">
                      <span className="text-[#d0d0dd]">{formatCurrency(e.actual)}</span>
                      <span className="text-[#666]">vs {formatCurrency(e.estimate)}</span>
                      {surprise != null && (
                        <span className="text-xs px-1.5 py-0.5 rounded" style={{ color, backgroundColor: color + '20' }}>
                          {surprise > 0 ? '+' : ''}{formatPercent(surprise)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
