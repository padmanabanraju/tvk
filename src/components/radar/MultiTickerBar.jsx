import { useState, useEffect } from 'react';
import { getQuote } from '../../api/trFinnhub';
import { formatNumber } from '../../utils/format';

const DEFAULT_TICKERS = ['SPY', 'QQQ', 'VIXY', 'AAPL', 'NVDA'];

// Display names for tickers
const DISPLAY_NAMES = { VIXY: 'VIX*' };

export default function MultiTickerBar({ onSelect, currentSymbol, onQuotesUpdate }) {
  const [quotes, setQuotes] = useState({});
  const [tickers] = useState(DEFAULT_TICKERS);

  useEffect(() => {
    const fetchAll = async () => {
      const results = await Promise.allSettled(
        tickers.map(t => getQuote(t).then(q => ({ symbol: t, quote: q })))
      );
      const newQuotes = {};
      results.forEach(r => {
        if (r.status === 'fulfilled' && r.value.quote?.c) {
          newQuotes[r.value.symbol] = r.value.quote;
        }
      });
      setQuotes(newQuotes);
      if (onQuotesUpdate) onQuotesUpdate(newQuotes);
    };
    fetchAll();
    const interval = setInterval(fetchAll, 30000);
    return () => clearInterval(interval);
  }, [tickers]);

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 mb-3 -mx-1 px-1 scrollbar-none">
      {tickers.map(sym => {
        const q = quotes[sym];
        const change = q?.dp || 0;
        // For VIX proxy, red when VIX goes up (bad for market), green when down
        const isVix = sym === 'VIXY';
        const color = isVix
          ? (change >= 0 ? '#ef4444' : '#22c55e')
          : (change >= 0 ? '#22c55e' : '#ef4444');
        const isActive = sym === currentSymbol;
        const displayName = DISPLAY_NAMES[sym] || sym;

        return (
          <button
            key={sym}
            onClick={() => onSelect(sym)}
            className={`flex-shrink-0 px-3 py-2 rounded-lg border transition-colors ${
              isActive
                ? 'bg-[#22c55e]/10 border-[#22c55e]/30'
                : 'bg-[#0d1117] border-white/5 active:bg-white/10'
            }`}
          >
            <div className="text-xs font-bold text-white">{displayName}</div>
            {q ? (
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="font-mono text-xs text-[#d0d0dd]">${formatNumber(q.c, 2)}</span>
                <span className="font-mono text-[10px] font-semibold" style={{ color }}>
                  {change >= 0 ? '+' : ''}{formatNumber(change, 1)}%
                </span>
              </div>
            ) : (
              <div className="skeleton h-3 w-16 mt-1" />
            )}
          </button>
        );
      })}
    </div>
  );
}
