import { useState, useEffect } from 'react';
import { getQuote } from '../../api/trFinnhub';
import { formatNumber } from '../../utils/format';

const MARKET_TICKERS = [
  { symbol: 'SPY', label: 'S&P 500', type: 'index' },
  { symbol: 'QQQ', label: 'Nasdaq', type: 'index' },
  { symbol: 'DIA', label: 'Dow', type: 'index' },
  { symbol: 'IWM', label: 'Russell', type: 'index' },
  { symbol: 'VIXY', label: 'VIX*', type: 'volatility' },
  { symbol: 'USO', label: 'Oil', type: 'commodity' },
  { symbol: 'GLD', label: 'Gold', type: 'commodity' },
  { symbol: 'TLT', label: '20Y Bond', type: 'bond' },
];

function getRegime(data) {
  const spy = data['SPY'];
  const vixy = data['VIXY'];
  if (!spy) return { regime: 'LOADING', color: '#666', emoji: '⏳' };

  const spyChg = spy.dp || 0;
  const vixyChg = vixy?.dp || 0;

  if (spyChg < -1.5 || (spyChg < -0.5 && vixyChg > 5))
    return { regime: 'RISK-OFF', color: '#ef4444', emoji: '🔴' };
  if (spyChg > 1 && vixyChg < -3)
    return { regime: 'RISK-ON', color: '#22c55e', emoji: '🟢' };
  if (spyChg > 0.5)
    return { regime: 'RISK-ON', color: '#22c55e', emoji: '🟢' };
  if (spyChg < -0.5)
    return { regime: 'RISK-OFF', color: '#ef4444', emoji: '🔴' };
  return { regime: 'MIXED', color: '#f59e0b', emoji: '🟡' };
}

export default function MarketPulse({ onQuotesUpdate }) {
  const [quotes, setQuotes] = useState({});
  const [collapsed, setCollapsed] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      const results = await Promise.allSettled(
        MARKET_TICKERS.map(t =>
          getQuote(t.symbol).then(q => ({ symbol: t.symbol, quote: q }))
        )
      );
      const newQuotes = {};
      results.forEach(r => {
        if (r.status === 'fulfilled' && r.value.quote?.c) {
          newQuotes[r.value.symbol] = r.value.quote;
        }
      });
      setQuotes(newQuotes);
      setLastUpdate(new Date());
      if (onQuotesUpdate) onQuotesUpdate(newQuotes);
    };
    fetchAll();
    const interval = setInterval(fetchAll, 30000);
    return () => clearInterval(interval);
  }, []);

  const regime = getRegime(quotes);

  return (
    <div className="bg-[#0a0f1a] rounded-xl border border-white/5 mb-3 overflow-hidden">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between px-4 py-2.5"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-white">MARKET PULSE</span>
          <span
            className="text-xs font-bold px-2 py-0.5 rounded-full"
            style={{ color: regime.color, backgroundColor: regime.color + '20' }}
          >
            {regime.emoji} {regime.regime}
          </span>
        </div>
        <span className="text-[#666] text-xs">{collapsed ? '▶' : '▼'}</span>
      </button>
      {!collapsed && (
        <div className="px-4 pb-3">
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            {MARKET_TICKERS.map(t => {
              const q = quotes[t.symbol];
              if (!q?.c) return (
                <div key={t.symbol} className="flex justify-between py-0.5">
                  <span className="text-xs text-[#666]">{t.label}</span>
                  <span className="skeleton h-3 w-16" />
                </div>
              );
              const chg = q.dp || 0;
              const isVix = t.type === 'volatility';
              const color = isVix ? (chg >= 0 ? '#ef4444' : '#22c55e') : (chg >= 0 ? '#22c55e' : '#ef4444');
              return (
                <div key={t.symbol} className="flex justify-between py-0.5">
                  <span className="text-xs text-[#666]">{t.label}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs text-[#d0d0dd]">${formatNumber(q.c, 2)}</span>
                    <span className="font-mono text-[10px] font-semibold" style={{ color }}>
                      {chg >= 0 ? '+' : ''}{formatNumber(chg, 1)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          {lastUpdate && (
            <div className="text-[10px] text-[#666] mt-1 text-right">
              Updated {lastUpdate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Export for use in SendToClaude
export { MARKET_TICKERS, getRegime };
