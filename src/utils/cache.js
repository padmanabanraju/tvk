const CACHE_TTL = {
  finnhub_quote: 0,
  finnhub_profile: 86400000,
  finnhub_financials: 3600000,
  finnhub_recs: 3600000,
  finnhub_earnings: 86400000,
  finnhub_news: 1800000,
  finnhub_signal: 3600000,
  finnhub_insider: 86400000,
  finnhub_congress: 86400000,
  alphavantage_any: 14400000,
  tradier_chain: 300000,
  tradier_expirations: 86400000,
  google_rss_market: 300000,
  google_rss_trump: 300000,
  google_rss_iran: 300000,
  google_rss_ticker: 600000,
  finnhub_company_news: 1800000,
  newsapi_any: 900000,
  reddit_wsb: 600000,
  reddit_sentiment: 600000,
  finnhub_social: 3600000,
};

export function getCached(key) {
  try {
    const item = localStorage.getItem(key);
    if (!item) return null;
    const { data, timestamp, ttl } = JSON.parse(item);
    if (Date.now() - timestamp > ttl) {
      localStorage.removeItem(key);
      return null;
    }
    return { data, isCached: true, age: Date.now() - timestamp };
  } catch {
    return null;
  }
}

export function setCache(key, data, ttl) {
  try {
    localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now(), ttl }));
  } catch {
    // localStorage full — clear oldest entries
    clearOldCache();
    try {
      localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now(), ttl }));
    } catch { /* give up */ }
  }
}

export function clearOldCache() {
  const keys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('tr_')) {
      try {
        const { timestamp } = JSON.parse(localStorage.getItem(key));
        keys.push({ key, timestamp });
      } catch { /* skip */ }
    }
  }
  keys.sort((a, b) => a.timestamp - b.timestamp);
  // Remove oldest 25%
  const toRemove = Math.ceil(keys.length * 0.25);
  for (let i = 0; i < toRemove; i++) {
    localStorage.removeItem(keys[i].key);
  }
}

export function getAlphaVantageCalls() {
  const today = new Date().toDateString();
  const stored = localStorage.getItem('tr_av_calls');
  if (stored) {
    const { date, count } = JSON.parse(stored);
    if (date === today) return count;
  }
  return 0;
}

export function incrementAlphaVantageCalls() {
  const today = new Date().toDateString();
  const stored = localStorage.getItem('tr_av_calls');
  let count = 0;
  if (stored) {
    const parsed = JSON.parse(stored);
    if (parsed.date === today) count = parsed.count;
  }
  count++;
  localStorage.setItem('tr_av_calls', JSON.stringify({ date: today, count }));
  return count;
}

export { CACHE_TTL };
