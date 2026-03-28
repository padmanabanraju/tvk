import { useState } from 'react';
import { formatCurrency, formatLargeNumber, formatPercent, formatNumber } from '../../utils/format';

function Row({ label, value, suffix = '' }) {
  return (
    <div className="flex justify-between py-1 border-b border-white/5">
      <span className="text-[#666] text-sm">{label}</span>
      <span className="text-[#d0d0dd] font-mono text-sm text-right">{value}{suffix}</span>
    </div>
  );
}

export default function FundamentalsCard({ financials, profile }) {
  const [open, setOpen] = useState(true);
  const m = financials?.metric;

  return (
    <div className="bg-[#0d1117] rounded-xl border border-white/5 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <span className="font-bold text-white">FUNDAMENTALS</span>
        <span className="text-[#666] text-sm">{open ? '▼' : '▶'}</span>
      </button>
      {open && (
        <div className="px-4 pb-4">
          {!m ? (
            <div className="space-y-2">
              {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-5 w-full" />)}
            </div>
          ) : (
            <>
              <Row label="Mkt Cap" value={profile?.marketCapitalization ? formatLargeNumber(profile.marketCapitalization * 1e6) : '—'} />
              <Row label="P/E (TTM)" value={m.peTTM ? formatNumber(m.peTTM, 1) : '—'} />
              <Row label="EPS (TTM)" value={m.epsTTM ? formatCurrency(m.epsTTM) : '—'} />
              <Row label="Beta" value={m.beta ? formatNumber(m.beta, 2) : '—'} />
              <Row label="52W High" value={m['52WeekHigh'] ? formatCurrency(m['52WeekHigh']) : '—'} />
              <Row label="52W Low" value={m['52WeekLow'] ? formatCurrency(m['52WeekLow']) : '—'} />
              <Row label="ROE" value={m.roeTTM ? formatPercent(m.roeTTM) : '—'} />
              <Row label="Div Yield" value={m.dividendYieldIndicatedAnnual ? formatPercent(m.dividendYieldIndicatedAnnual) : '—'} />
              <Row label="Avg Vol (10D)" value={m['10DayAverageTradingVolume'] ? formatLargeNumber(m['10DayAverageTradingVolume'] * 1e6) : '—'} />
            </>
          )}
        </div>
      )}
    </div>
  );
}
