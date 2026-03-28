import { useState, useEffect } from 'react';
import { getRSI, getMACD, getSMA, getEMA, getBBands, getADX, getStoch } from '../../api/twelvedata';
import { formatNumber, formatCurrency } from '../../utils/format';

function Indicator({ label, value, interpretation, color }) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-white/5">
      <span className="text-sm text-[#666]">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-mono text-sm text-[#d0d0dd]">{value}</span>
        {interpretation && (
          <span className="text-xs px-1.5 py-0.5 rounded" style={{ color, backgroundColor: color + '20' }}>
            {interpretation}
          </span>
        )}
      </div>
    </div>
  );
}

export default function TechnicalCard({ technicalSignal, currentPrice, symbol, onDataLoaded }) {
  const [open, setOpen] = useState(true);
  const [avData, setAvData] = useState({});
  const [avLoading, setAvLoading] = useState(false);
  const [avCalls, setAvCalls] = useState(0);

  useEffect(() => {
    if (!symbol) return;
    setAvLoading(true);
    setAvData({});

    // Fetch in priority order to conserve API calls
    const fetchTechnicals = async () => {
      const results = {};
      try {
        // Batch 1: Most important (3 calls)
        const [rsi, macd, sma50] = await Promise.allSettled([
          getRSI(symbol),
          getMACD(symbol),
          getSMA(symbol, 50),
        ]);
        if (rsi.status === 'fulfilled') results.rsi = rsi.value;
        if (macd.status === 'fulfilled') results.macd = macd.value;
        if (sma50.status === 'fulfilled') results.sma50 = sma50.value;
        setAvData({ ...results });

        // Batch 2: Important (5 calls)
        const [sma200, bbands, adx, ema9, ema21] = await Promise.allSettled([
          getSMA(symbol, 200),
          getBBands(symbol),
          getADX(symbol),
          getEMA(symbol, 9),
          getEMA(symbol, 21),
        ]);
        if (sma200.status === 'fulfilled') results.sma200 = sma200.value;
        if (bbands.status === 'fulfilled') results.bbands = bbands.value;
        if (adx.status === 'fulfilled') results.adx = adx.value;
        if (ema9.status === 'fulfilled') results.ema9 = ema9.value;
        if (ema21.status === 'fulfilled') results.ema21 = ema21.value;
        setAvData({ ...results });

        // Batch 3: Nice to have (1 call)
        const [stoch] = await Promise.allSettled([getStoch(symbol)]);
        if (stoch.status === 'fulfilled') results.stoch = stoch.value;
        setAvData({ ...results });
      } catch {
        // Individual errors handled by allSettled
      } finally {
        setAvLoading(false);
        setAvCalls(prev => prev + 7);
        if (onDataLoaded) onDataLoaded(results);
      }
    };

    fetchTechnicals();
  }, [symbol]);

  const signal = technicalSignal?.technicalAnalysis;
  const trend = technicalSignal?.trend;
  const signalText = signal?.signal?.toUpperCase() || '—';
  const signalColor = signalText === 'BUY' ? '#22c55e' : signalText === 'SELL' ? '#ef4444' : '#f59e0b';

  // RSI interpretation
  const rsiColor = avData.rsi <= 30 ? '#ef4444' : avData.rsi >= 70 ? '#22c55e' : '#f59e0b';
  const rsiLabel = avData.rsi <= 30 ? 'Oversold' : avData.rsi >= 70 ? 'Overbought' : 'Neutral';

  // MACD interpretation
  const macdColor = avData.macd?.histogram > 0 ? '#22c55e' : '#ef4444';
  const macdLabel = avData.macd?.histogram > 0 ? 'Bullish' : 'Bearish';

  // SMA vs price
  const sma50Color = currentPrice && avData.sma50 ? (currentPrice > avData.sma50 ? '#22c55e' : '#ef4444') : '#666';
  const sma50Label = currentPrice && avData.sma50 ? (currentPrice > avData.sma50 ? 'Above' : 'Below') : null;
  const sma200Color = currentPrice && avData.sma200 ? (currentPrice > avData.sma200 ? '#22c55e' : '#ef4444') : '#666';
  const sma200Label = currentPrice && avData.sma200 ? (currentPrice > avData.sma200 ? 'Above' : 'Below') : null;

  // EMA vs price
  const ema9Color = currentPrice && avData.ema9 ? (currentPrice > avData.ema9 ? '#22c55e' : '#ef4444') : '#666';
  const ema9Label = currentPrice && avData.ema9 ? (currentPrice > avData.ema9 ? 'Above' : 'Below') : null;
  const ema21Color = currentPrice && avData.ema21 ? (currentPrice > avData.ema21 ? '#22c55e' : '#ef4444') : '#666';
  const ema21Label = currentPrice && avData.ema21 ? (currentPrice > avData.ema21 ? 'Above' : 'Below') : null;

  // BBands
  const bbandsLabel = currentPrice && avData.bbands
    ? currentPrice >= avData.bbands.upper ? 'Near Upper'
      : currentPrice <= avData.bbands.lower ? 'Near Lower'
      : 'Mid Range'
    : null;
  const bbandsColor = bbandsLabel === 'Near Upper' ? '#22c55e' : bbandsLabel === 'Near Lower' ? '#ef4444' : '#f59e0b';

  return (
    <div className="bg-[#0d1117] rounded-xl border border-white/5 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <span className="font-bold text-white">TECHNICAL INDICATORS</span>
        <span className="text-[#666] text-sm">{open ? '▼' : '▶'}</span>
      </button>
      {open && (
        <div className="px-4 pb-4">
          {/* Aggregate Signal from Finnhub */}
          {signal && (
            <div className="text-center mb-4 py-3 rounded-lg" style={{ backgroundColor: signalColor + '15' }}>
              <div className="text-xs text-[#666] mb-1">Aggregate Signal</div>
              <div className="text-2xl font-bold" style={{ color: signalColor }}>{signalText}</div>
              {signal.count && (
                <div className="text-xs text-[#666] mt-1">
                  Buy: {signal.count.buy} · Neutral: {signal.count.neutral} · Sell: {signal.count.sell}
                </div>
              )}
            </div>
          )}

          {/* Twelve Data Indicators */}
          {avLoading && Object.keys(avData).length === 0 && (
            <div className="space-y-2 mb-3">
              {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-5 w-full" />)}
            </div>
          )}

          {avData.rsi != null && (
            <Indicator label="RSI (14)" value={formatNumber(avData.rsi, 1)} interpretation={rsiLabel} color={rsiColor} />
          )}

          {avData.macd && (
            <>
              <Indicator
                label="MACD"
                value={formatNumber(avData.macd.macd, 2)}
                interpretation={macdLabel}
                color={macdColor}
              />
              <div className="flex justify-between items-center py-1 border-b border-white/5 pl-4">
                <span className="text-xs text-[#666]">Signal / Hist</span>
                <span className="font-mono text-xs text-[#d0d0dd]">
                  {formatNumber(avData.macd.signal, 2)} / {formatNumber(avData.macd.histogram, 2)}
                </span>
              </div>
            </>
          )}

          {avData.sma50 != null && (
            <Indicator
              label="SMA 50"
              value={formatCurrency(avData.sma50)}
              interpretation={sma50Label}
              color={sma50Color}
            />
          )}

          {avData.sma200 != null && (
            <Indicator
              label="SMA 200"
              value={formatCurrency(avData.sma200)}
              interpretation={sma200Label}
              color={sma200Color}
            />
          )}

          {avData.ema9 != null && (
            <Indicator
              label="EMA 9"
              value={formatCurrency(avData.ema9)}
              interpretation={ema9Label}
              color={ema9Color}
            />
          )}

          {avData.ema21 != null && (
            <Indicator
              label="EMA 21"
              value={formatCurrency(avData.ema21)}
              interpretation={ema21Label}
              color={ema21Color}
            />
          )}

          {avData.bbands && (
            <>
              <Indicator
                label="Bollinger Bands"
                value={`${formatCurrency(avData.bbands.lower)} — ${formatCurrency(avData.bbands.upper)}`}
                interpretation={bbandsLabel}
                color={bbandsColor}
              />
              <div className="flex justify-between items-center py-1 border-b border-white/5 pl-4">
                <span className="text-xs text-[#666]">Middle</span>
                <span className="font-mono text-xs text-[#d0d0dd]">{formatCurrency(avData.bbands.middle)}</span>
              </div>
            </>
          )}

          {avData.adx != null && (
            <Indicator
              label="ADX (Trend)"
              value={formatNumber(avData.adx, 1)}
              interpretation={avData.adx > 25 ? 'Trending' : 'Ranging'}
              color={avData.adx > 25 ? '#f59e0b' : '#666'}
            />
          )}

          {avData.stoch && (
            <Indicator
              label="Stochastic"
              value={`${formatNumber(avData.stoch.slowK, 1)} / ${formatNumber(avData.stoch.slowD, 1)}`}
              interpretation={avData.stoch.slowK < 20 ? 'Oversold' : avData.stoch.slowK > 80 ? 'Overbought' : 'Neutral'}
              color={avData.stoch.slowK < 20 ? '#ef4444' : avData.stoch.slowK > 80 ? '#22c55e' : '#f59e0b'}
            />
          )}

          {Object.keys(avData).length === 0 && !avLoading && (
            <p className="text-[#666] text-sm text-center py-2">
              {avCalls >= 800 ? 'Twelve Data limit reached' : 'No technical data available'}
            </p>
          )}

          <div className="mt-3 text-xs text-[#666] text-center">
            Twelve Data: {avCalls} calls used (800/day limit) {avLoading ? '· Loading...' : ''}
          </div>
        </div>
      )}
    </div>
  );
}
