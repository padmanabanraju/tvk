import { useState } from 'react';
import { formatCurrency, formatNumber, formatLargeNumber } from '../../utils/format';
import ExpirationPicker from './ExpirationPicker';

function Row({ label, value, color }) {
  return (
    <div className="flex justify-between py-1.5 border-b border-white/5">
      <span className="text-sm text-[#666]">{label}</span>
      <span className="font-mono text-sm" style={{ color: color || '#d0d0dd' }}>{value}</span>
    </div>
  );
}

export default function OptionsQuantCard({ calculations, expirations, categorizedExps, selectedExp, onExpChange, loading }) {
  const [open, setOpen] = useState(true);

  const pc = calculations?.putCallRatios;
  const mp = calculations?.maxPain;
  const walls = calculations?.walls;
  const skew = calculations?.ivSkew;

  const pcColor = pc?.sentiment === 'BEARISH' ? '#ef4444' : pc?.sentiment === 'BULLISH' ? '#22c55e' : '#f59e0b';
  const skewColor = skew?.interpretation?.includes('FEAR') ? '#ef4444' : skew?.interpretation?.includes('GREED') ? '#22c55e' : '#f59e0b';

  return (
    <div className="bg-[#0d1117] rounded-xl border border-white/5 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-3">
          <span className="font-bold text-white">OPTIONS QUANT</span>
          <ExpirationPicker expirations={expirations} categorizedExps={categorizedExps} selected={selectedExp} onChange={onExpChange} />
        </div>
        <span className="text-[#666] text-sm">{open ? '▼' : '▶'}</span>
      </button>
      {open && (
        <div className="px-4 pb-4">
          {loading || !calculations ? (
            <div className="space-y-2">
              {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-5 w-full" />)}
            </div>
          ) : (
            <>
              <Row label="P/C Vol Ratio" value={`${formatNumber(pc?.volumeRatio, 2)} ${pc?.sentiment}`} color={pcColor} />
              <Row label="P/C OI Ratio" value={formatNumber(pc?.oiRatio, 2)} />
              <Row label="Max Pain" value={mp?.strike ? formatCurrency(mp.strike, 0) : '—'} />
              <Row label="Call Wall (Resist)" value={walls?.callWall?.strike ? `${formatCurrency(walls.callWall.strike, 0)} (${formatLargeNumber(walls.callWall.oi)} OI)` : '—'} color="#ef4444" />
              <Row label="Put Wall (Support)" value={walls?.putWall?.strike ? `${formatCurrency(walls.putWall.strike, 0)} (${formatLargeNumber(walls.putWall.oi)} OI)` : '—'} color="#22c55e" />
              <Row label="IV Skew" value={skew?.skew || '—'} color={skewColor} />
              <Row label="Avg Put IV" value={skew?.putIV ? skew.putIV + '%' : '—'} />
              <Row label="Avg Call IV" value={skew?.callIV ? skew.callIV + '%' : '—'} />
              {skew && (
                <div className="mt-2 py-2 border-t border-white/5">
                  <div className="text-xs text-[#666] mb-1">IV Context</div>
                  <div className="text-xs text-[#d0d0dd]">
                    {parseFloat(skew.putIV) > 80 || parseFloat(skew.callIV) > 80 ? (
                      <span className="text-[#ef4444]">HIGH IV Environment — Favor selling premium (credit spreads, iron condors)</span>
                    ) : parseFloat(skew.putIV) < 30 && parseFloat(skew.callIV) < 30 ? (
                      <span className="text-[#22c55e]">LOW IV Environment — Favor buying premium (debit spreads, straddles)</span>
                    ) : (
                      <span className="text-[#f59e0b]">MODERATE IV — Mixed strategies appropriate</span>
                    )}
                  </div>
                </div>
              )}
              <div className="mt-2 text-xs text-[#f59e0b]">Sandbox: Delayed Data</div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
