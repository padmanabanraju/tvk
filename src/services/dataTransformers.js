import {
  calcSMA, calcEMA, calcRSI, calcMACD,
  calcBollingerBands, calcATR, calcStochastic, latestValue
} from './indicators';

// Transform Finnhub candle response → array of OHLCV objects for chart
export function transformCandles(raw) {
  if (!raw || raw.s === 'no_data' || !raw.t) return [];
  return raw.t.map((timestamp, i) => ({
    time: timestamp,
    open: raw.o[i],
    high: raw.h[i],
    low: raw.l[i],
    close: raw.c[i],
    volume: raw.v[i],
  }));
}

// Compute all indicators from OHLCV candles
export function computeIndicators(candles) {
  if (!candles || candles.length < 2) {
    return { current: {}, chartOverlays: {} };
  }

  const closes = candles.map((c) => c.close);
  const highs = candles.map((c) => c.high);
  const lows = candles.map((c) => c.low);
  const volumes = candles.map((c) => c.volume);

  const rsiArr = calcRSI(closes);
  const macd = calcMACD(closes);
  const bollinger = calcBollingerBands(closes);
  const sma20 = calcSMA(closes, 20);
  const sma50 = calcSMA(closes, 50);
  const sma200 = calcSMA(closes, 200);
  const ema12 = calcEMA(closes, 12);
  const ema26 = calcEMA(closes, 26);
  const atr = calcATR(highs, lows, closes);
  const stoch = calcStochastic(highs, lows, closes);

  // Latest values for indicator cards
  const current = {
    rsi: latestValue(rsiArr),
    macd: latestValue(macd.macdLine),
    macdSignal: latestValue(macd.signalLine),
    macdHistogram: latestValue(macd.histogram),
    atr: latestValue(atr),
    stochasticK: latestValue(stoch.k),
    stochasticD: latestValue(stoch.d),
    sma20: latestValue(sma20),
    sma50: latestValue(sma50),
    sma200: latestValue(sma200),
    ema12: latestValue(ema12),
    ema26: latestValue(ema26),
    bollingerUpper: latestValue(bollinger.upper),
    bollingerMiddle: latestValue(bollinger.middle),
    bollingerLower: latestValue(bollinger.lower),
  };

  // Determine overall signal
  const price = closes[closes.length - 1];
  let bullSignals = 0;
  let bearSignals = 0;

  if (current.rsi !== null) {
    if (current.rsi < 30) bullSignals++;
    else if (current.rsi > 70) bearSignals++;
  }
  if (current.macd !== null && current.macdSignal !== null) {
    if (current.macd > current.macdSignal) bullSignals++;
    else bearSignals++;
  }
  if (current.sma20 !== null && current.sma50 !== null) {
    if (price > current.sma50) bullSignals++;
    else bearSignals++;
  }
  if (current.stochasticK !== null) {
    if (current.stochasticK < 20) bullSignals++;
    else if (current.stochasticK > 80) bearSignals++;
  }

  current.signal = bullSignals > bearSignals ? 'Bullish' : bearSignals > bullSignals ? 'Bearish' : 'Neutral';

  // Chart overlay data (for TradingView Lightweight Charts line series)
  const toTimeSeries = (arr) =>
    candles
      .map((c, i) => (arr[i] !== null ? { time: c.time, value: arr[i] } : null))
      .filter(Boolean);

  const chartOverlays = {
    sma20: toTimeSeries(sma20),
    sma50: toTimeSeries(sma50),
    sma200: toTimeSeries(sma200),
    ema12: toTimeSeries(ema12),
    ema26: toTimeSeries(ema26),
    bollingerUpper: toTimeSeries(bollinger.upper),
    bollingerLower: toTimeSeries(bollinger.lower),
    bollingerMiddle: toTimeSeries(bollinger.middle),
  };

  return { current, chartOverlays };
}

// Transform Finnhub news array → app news shape
export function transformNews(rawNews) {
  if (!rawNews || !Array.isArray(rawNews)) return [];
  return rawNews.slice(0, 15).map((item) => {
    // Simple sentiment heuristic from headline
    const headline = (item.headline || '').toLowerCase();
    let sentiment = 'neutral';
    const positiveWords = ['beat', 'surge', 'rise', 'gain', 'upgrade', 'record', 'rally', 'strong', 'growth', 'profit', 'boost', 'high', 'buy'];
    const negativeWords = ['miss', 'fall', 'drop', 'decline', 'downgrade', 'loss', 'crash', 'weak', 'cut', 'sell', 'low', 'risk', 'warning'];
    if (positiveWords.some((w) => headline.includes(w))) sentiment = 'positive';
    if (negativeWords.some((w) => headline.includes(w))) sentiment = 'negative';

    return {
      title: item.headline,
      source: item.source,
      time: formatRelativeTime(item.datetime),
      url: item.url,
      summary: item.summary,
      image: item.image,
      sentiment,
    };
  });
}

// Transform Finnhub earnings → app earnings shape
export function transformEarnings(rawEarnings) {
  if (!rawEarnings || !Array.isArray(rawEarnings)) return [];
  return rawEarnings.slice(0, 8).map((e) => ({
    period: e.period,
    quarter: `Q${e.quarter} ${e.year}`,
    actual: e.actual,
    estimate: e.estimate,
    surprise: e.surprise,
    surprisePercent: e.surprisePercent,
  }));
}

// Assemble full stock data from all API responses
export function assembleStockData(symbol, quote, profile, financials, candles, news, earnings, indicators) {
  const metric = financials?.metric || {};

  return {
    symbol: symbol.toUpperCase(),
    name: profile?.name || symbol.toUpperCase(),
    logo: profile?.logo || null,
    industry: profile?.finnhubIndustry || '',
    exchange: profile?.exchange || '',

    // Price data from real-time quote
    price: quote?.c || 0,
    change: quote?.d || 0,
    changePercent: quote?.dp || 0,
    open: quote?.o || 0,
    high: quote?.h || 0,
    low: quote?.l || 0,
    previousClose: quote?.pc || 0,

    // Fundamentals from basic financials
    marketCap: profile?.marketCapitalization ? profile.marketCapitalization * 1e6 : null, // Finnhub returns in millions
    pe: metric['peBasicExclExtraTTM'] || metric['peTTM'] || null,
    eps: metric['epsBasicExclExtraAnnual'] || metric['epsTTM'] || null,
    week52High: metric['52WeekHigh'] || null,
    week52Low: metric['52WeekLow'] || null,
    beta: metric['beta'] || null,
    dividend: metric['dividendYieldIndicatedAnnual'] || null,
    avgVolume: metric['10DayAverageTradingVolume'] ? metric['10DayAverageTradingVolume'] * 1e6 : null,
    revenueGrowth: metric['revenueGrowthQuarterlyYoy'] || null,
    epsGrowth: metric['epsGrowthQuarterlyYoy'] || null,

    // Chart data
    candles,
    chartOverlays: indicators.chartOverlays,

    // Computed indicators
    indicators: indicators.current,

    // News
    news,

    // Earnings
    earnings,
  };
}

// --- Helpers ---
function formatRelativeTime(unixTimestamp) {
  const now = Date.now() / 1000;
  const diff = now - unixTimestamp;

  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(unixTimestamp * 1000).toLocaleDateString();
}
