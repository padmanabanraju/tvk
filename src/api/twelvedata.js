import { getCached, setCache } from '../utils/cache';

const BASE = 'https://api.twelvedata.com';
let _key = '';
export function setApiKey(key) { _key = key; }

async function fetchTD(endpoint, params = {}) {
  const cacheKey = `td_${endpoint.replace('/', '')}_${params.symbol}_${params.time_period || ''}`;
  const cached = getCached(cacheKey);
  if (cached) return { ...cached.data, _cached: true };

  const url = new URL(`${BASE}${endpoint}`);
  url.searchParams.set('apikey', _key);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));

  const res = await fetch(url.toString());
  if (!res.ok) return null;
  const data = await res.json();
  if (data.status === 'error') return null;

  setCache(cacheKey, data, 7200000); // 2 hours
  return data;
}

export async function getRSI(symbol) {
  const data = await fetchTD('/rsi', { symbol, interval: '1day', time_period: 14, outputsize: 1 });
  if (!data?.values?.[0]) return null;
  return parseFloat(data.values[0].rsi);
}

export async function getMACD(symbol) {
  const data = await fetchTD('/macd', { symbol, interval: '1day', outputsize: 1 });
  if (!data?.values?.[0]) return null;
  const v = data.values[0];
  return {
    macd: parseFloat(v.macd),
    signal: parseFloat(v.macd_signal),
    histogram: parseFloat(v.macd_hist),
  };
}

export async function getSMA(symbol, period) {
  const data = await fetchTD('/sma', { symbol, interval: '1day', time_period: period, outputsize: 1 });
  if (!data?.values?.[0]) return null;
  return parseFloat(data.values[0].sma);
}

export async function getEMA(symbol, period) {
  const data = await fetchTD('/ema', { symbol, interval: '1day', time_period: period, outputsize: 1 });
  if (!data?.values?.[0]) return null;
  return parseFloat(data.values[0].ema);
}

export async function getBBands(symbol) {
  const data = await fetchTD('/bbands', { symbol, interval: '1day', time_period: 20, outputsize: 1 });
  if (!data?.values?.[0]) return null;
  const v = data.values[0];
  return {
    upper: parseFloat(v.upper_band),
    middle: parseFloat(v.middle_band),
    lower: parseFloat(v.lower_band),
  };
}

export async function getADX(symbol) {
  const data = await fetchTD('/adx', { symbol, interval: '1day', time_period: 14, outputsize: 1 });
  if (!data?.values?.[0]) return null;
  return parseFloat(data.values[0].adx);
}

export async function getStoch(symbol) {
  const data = await fetchTD('/stoch', { symbol, interval: '1day', outputsize: 1 });
  if (!data?.values?.[0]) return null;
  const v = data.values[0];
  return {
    slowK: parseFloat(v.slow_k),
    slowD: parseFloat(v.slow_d),
  };
}

export async function getOBV(symbol) {
  const data = await fetchTD('/obv', { symbol, interval: '1day', outputsize: 1 });
  if (!data?.values?.[0]) return null;
  return parseFloat(data.values[0].obv);
}
