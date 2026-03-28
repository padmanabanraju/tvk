import { useState } from 'react';
import { formatCurrency, formatLargeNumber } from '../../utils/format';

export default function UnusualActivityCard({ unusualActivity }) {
  const [open, setOpen] = useState(true);

  const signalColors = { EXTREME: '#a855f7', HIGH: '#ef4444', ELEVATED: '#f59e0b' };

  return (
    <div className="bg-[#0d1117] rounded-xl border border-white/5 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <span className="font-bold text-white">UNUSUAL ACTIVITY</span>
        <span className="text-[#666] text-sm">{open ? '▼' : '▶'}</span>
      </button>
      {open && (
        <div className="px-4 pb-4">
          {!unusualActivity || unusualActivity.length === 0 ? (
            <p className="text-[#666] text-sm">No unusual activity detected</p>
          ) : (
            <div className="space-y-2">
              {unusualActivity.map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                      item.type === 'call' ? 'bg-[#22c55e]/20 text-[#22c55e]' : 'bg-[#ef4444]/20 text-[#ef4444]'
                    }`}>
                      {item.type === 'call' ? 'C' : 'P'}
                    </span>
                    <span className="font-mono text-sm text-[#d0d0dd]">{formatCurrency(item.strike, 0)}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-mono">
                    <span className="text-[#666]">Vol:{formatLargeNumber(item.volume)}</span>
                    <span className="text-[#666]">OI:{formatLargeNumber(item.openInterest)}</span>
                    <span className="font-bold" style={{ color: signalColors[item.signal] || '#f59e0b' }}>
                      {item.ratio}x
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
