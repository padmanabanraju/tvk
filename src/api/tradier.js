import { getCached, setCache, CACHE_TTL } from '../utils/cache';

const BASE = 'https://sandbox.tradier.com/v1';
let _key = '';
export function setApiKey(key) { _key = key; }

async function fetchTR(endpoint, cacheKey, ttl) {
  if (ttl > 0) {
    const cached = getCached(cacheKey);
    if (cached) return { ...cached.data, _cached: true, _age: cached.age };
  }
  const res = await fetch(`${BASE}${endpoint}`, {
    headers: { 'Authorization': `Bearer ${_key}`, 'Accept': 'application/json' },
  });
  if (!res.ok) throw new Error(`Tradier ${res.status}`);
  const data = await res.json();
  if (ttl > 0) setCache(cacheKey, data, ttl);
  return data;
}

export async function getExpirations(symbol) {
  const data = await fetchTR(
    `/markets/options/expirations?symbol=${symbol}&includeAllRoots=true&strikes=false`,
    `tr_td_exp_${symbol}`,
    CACHE_TTL.tradier_expirations
  );
  return data?.expirations?.date || [];
}

export function categorizeExpirations(dates) {
  const now = new Date();
  return dates.map(dateStr => {
    const date = new Date(dateStr + 'T12:00:00');
    const dayOfWeek = date.getDay(); // 5 = Friday
    const dayOfMonth = date.getDate();

    // Monthly OPEX = 3rd Friday (day 15-21 that's a Friday)
    const isMonthlyOPEX = dayOfWeek === 5 && dayOfMonth >= 15 && dayOfMonth <= 21;
    // Quarterly = monthly OPEX in Mar, Jun, Sep, Dec
    const month = date.getMonth();
    const isQuarterly = isMonthlyOPEX && [2, 5, 8, 11].includes(month);

    return {
      date: dateStr,
      type: isQuarterly ? 'QUARTERLY' : isMonthlyOPEX ? 'MONTHLY' : 'WEEKLY',
      label: isQuarterly ? 'Quarterly' :
             isMonthlyOPEX ? 'OPEX' : 'Weekly',
      daysAway: Math.ceil((date.getTime() - now.getTime()) / 86400000),
    };
  });
}

export async function getOptionsChain(symbol, expiration) {
  const data = await fetchTR(
    `/markets/options/chains?symbol=${symbol}&expiration=${expiration}&greeks=true`,
    `tr_td_chain_${symbol}_${expiration}`,
    CACHE_TTL.tradier_chain
  );
  return data?.options?.option || [];
}

export async function getStrikes(symbol, expiration) {
  const data = await fetchTR(
    `/markets/options/strikes?symbol=${symbol}&expiration=${expiration}`,
    `tr_td_strikes_${symbol}_${expiration}`,
    CACHE_TTL.tradier_chain
  );
  return data?.strikes?.strike || [];
}

export async function getHistory(symbol, start, end) {
  const data = await fetchTR(
    `/markets/history?symbol=${symbol}&interval=daily&start=${start}&end=${end}`,
    `tr_td_hist_${symbol}_${start}`,
    CACHE_TTL.finnhub_financials
  );
  return data?.history?.day || [];
}

export async function getMarketClock() {
  const data = await fetchTR('/markets/clock', 'tr_td_clock', 60000);
  return data?.clock || {};
}
