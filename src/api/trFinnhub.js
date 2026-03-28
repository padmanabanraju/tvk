import { getCached, setCache, CACHE_TTL } from '../utils/cache';

const BASE = 'https://finnhub.io/api/v1';
let _key = '';
export function setApiKey(key) { _key = key; }

// Endpoints that require Finnhub premium — skip to avoid 403 noise
const PREMIUM_ENDPOINTS = [
  '/stock/price-target',
  '/scan/technical-indicator',
  '/stock/upgrade-downgrade',
  '/stock/congressional-trading',
  '/institutional/ownership',
  '/stock/social-sentiment',
];

async function fetchFH(endpoint, cacheKey, ttl) {
  // Skip known premium endpoints
  const path = endpoint.split('?')[0];
  if (PREMIUM_ENDPOINTS.some(p => path === p)) return null;

  if (ttl > 0) {
    const cached = getCached(cacheKey);
    if (cached) return { ...cached.data, _cached: true, _age: cached.age };
  }
  const url = `${BASE}${endpoint}${endpoint.includes('?') ? '&' : '?'}token=${_key}`;
  const res = await fetch(url);
  if (res.status === 403) return null;
  if (!res.ok) throw new Error(`Finnhub ${res.status}`);
  const data = await res.json();
  if (ttl > 0) setCache(cacheKey, data, ttl);
  return data;
}

export async function getQuote(symbol) {
  return fetchFH(`/quote?symbol=${symbol}`, `tr_fh_quote_${symbol}`, 0);
}

export async function getProfile(symbol) {
  return fetchFH(`/stock/profile2?symbol=${symbol}`, `tr_fh_profile_${symbol}`, CACHE_TTL.finnhub_profile);
}

export async function getFinancials(symbol) {
  return fetchFH(`/stock/metric?symbol=${symbol}&metric=all`, `tr_fh_fin_${symbol}`, CACHE_TTL.finnhub_financials);
}

export async function getRecommendations(symbol) {
  return fetchFH(`/stock/recommendation?symbol=${symbol}`, `tr_fh_rec_${symbol}`, CACHE_TTL.finnhub_recs);
}

export async function getPriceTarget(symbol) {
  return fetchFH(`/stock/price-target?symbol=${symbol}`, `tr_fh_pt_${symbol}`, CACHE_TTL.finnhub_recs);
}

export async function getEarnings(symbol) {
  return fetchFH(`/stock/earnings?symbol=${symbol}&limit=8`, `tr_fh_earn_${symbol}`, CACHE_TTL.finnhub_earnings);
}

export async function getEarningsCalendar(from, to) {
  return fetchFH(`/calendar/earnings?from=${from}&to=${to}`, `tr_fh_ecal_${from}`, CACHE_TTL.finnhub_earnings);
}

export async function getCompanyNews(symbol, from, to) {
  return fetchFH(`/company-news?symbol=${symbol}&from=${from}&to=${to}`, `tr_fh_news_${symbol}`, CACHE_TTL.finnhub_news);
}

export async function getTechnicalIndicator(symbol) {
  return fetchFH(`/scan/technical-indicator?symbol=${symbol}&resolution=D`, `tr_fh_tech_${symbol}`, CACHE_TTL.finnhub_signal);
}

export async function getUpgradeDowngrade(symbol) {
  return fetchFH(`/stock/upgrade-downgrade?symbol=${symbol}`, `tr_fh_ud_${symbol}`, CACHE_TTL.finnhub_recs);
}

export async function getInsiderSentiment(symbol) {
  return fetchFH(`/stock/insider-sentiment?symbol=${symbol}&from=2024-01-01`, `tr_fh_insent_${symbol}`, CACHE_TTL.finnhub_insider);
}

export async function getInsiderTransactions(symbol) {
  return fetchFH(`/stock/insider-transactions?symbol=${symbol}`, `tr_fh_intx_${symbol}`, CACHE_TTL.finnhub_insider);
}

export async function getInstitutionalOwnership(symbol) {
  return fetchFH(`/institutional/ownership?symbol=${symbol}`, `tr_fh_inst_${symbol}`, CACHE_TTL.finnhub_insider);
}

export async function getCongressionalTrading(symbol) {
  return fetchFH(`/stock/congressional-trading?symbol=${symbol}`, `tr_fh_cong_${symbol}`, CACHE_TTL.finnhub_congress);
}

export async function getSocialSentiment(symbol, from, to) {
  return fetchFH(`/stock/social-sentiment?symbol=${symbol}&from=${from}&to=${to}`, `tr_fh_social_${symbol}`, CACHE_TTL.finnhub_social);
}

export async function getPeers(symbol) {
  return fetchFH(`/stock/peers?symbol=${symbol}`, `tr_fh_peers_${symbol}`, CACHE_TTL.finnhub_profile);
}

export async function getPatternRecognition(symbol) {
  return fetchFH(`/scan/pattern?symbol=${symbol}&resolution=D`, `tr_fh_pattern_${symbol}`, CACHE_TTL.finnhub_signal);
}
