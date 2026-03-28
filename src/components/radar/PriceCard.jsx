import { formatCurrency, formatNumber } from '../../utils/format';

export default function PriceCard({ quote, profile }) {
  if (!quote) {
    return (
      <div className="bg-[#0d1117] rounded-xl p-4 border border-white/5">
        <div className="skeleton h-8 w-48 mb-2" />
        <div className="skeleton h-6 w-32" />
      </div>
    );
  }

  const change = quote.d || 0;
  const changePct = quote.dp || 0;
  const isPositive = change >= 0;
  const color = isPositive ? '#22c55e' : '#ef4444';

  // Check if quote is stale (market closed) — Finnhub timestamp is unix seconds
  const quoteTime = quote.t ? new Date(quote.t * 1000) : null;
  const now = new Date();
  const isStale = quoteTime && (now.getTime() - quoteTime.getTime() > 600000); // >10 min old
  const quoteTimeStr = quoteTime
    ? quoteTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <div className="bg-[#0d1117] rounded-xl p-4 border border-white/5">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h2 className="text-xl font-bold text-white">
            {profile?.name || profile?.ticker || '—'}
          </h2>
          <p className="text-xs text-[#666]">
            {profile?.exchange} · {profile?.finnhubIndustry}
          </p>
        </div>
        {profile?.logo && (
          <img src={profile.logo} alt="" className="w-8 h-8 rounded" />
        )}
      </div>

      <div className="flex items-baseline gap-3 mb-1">
        <span className="text-3xl font-bold font-mono text-white">
          {formatCurrency(quote.c)}
        </span>
        <span className="font-mono font-semibold" style={{ color }}>
          {isPositive ? '+' : ''}{formatCurrency(change, 2)}
          ({isPositive ? '+' : ''}{formatNumber(changePct, 2)}%)
        </span>
      </div>

      {isStale && (
        <div className="text-xs text-[#f59e0b] mb-2">
          As of {quoteTimeStr} (Market Close) · After-hours data not available on free tier
        </div>
      )}

      <div className="grid grid-cols-4 gap-2 text-xs font-mono">
        <div>
          <span className="text-[#666]">O:</span>
          <span className="text-[#d0d0dd] ml-1">{formatNumber(quote.o)}</span>
        </div>
        <div>
          <span className="text-[#666]">H:</span>
          <span className="text-[#d0d0dd] ml-1">{formatNumber(quote.h)}</span>
        </div>
        <div>
          <span className="text-[#666]">L:</span>
          <span className="text-[#d0d0dd] ml-1">{formatNumber(quote.l)}</span>
        </div>
        <div>
          <span className="text-[#666]">PC:</span>
          <span className="text-[#d0d0dd] ml-1">{formatNumber(quote.pc)}</span>
        </div>
      </div>
    </div>
  );
}
