const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';

// --- Rate Limiter (token bucket, 55/min to leave headroom) ---
class RateLimiter {
  constructor(maxTokens = 55, refillPeriodMs = 60000) {
    this.tokens = maxTokens;
    this.maxTokens = maxTokens;
    this.refillRate = maxTokens / refillPeriodMs;
    this.lastRefill = Date.now();
  }

  refill() {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    this.tokens = Math.min(this.maxTokens, this.tokens + elapsed * this.refillRate);
    this.lastRefill = now;
  }

  async acquire() {
    this.refill();
    if (this.tokens >= 1) {
      this.tokens -= 1;
      return;
    }
    return new Promise((resolve) => {
      const check = () => {
        this.refill();
        if (this.tokens >= 1) {
          this.tokens -= 1;
          resolve();
        } else {
          setTimeout(check, 1100);
        }
      };
      setTimeout(check, 1100);
    });
  }
}

// --- In-memory Cache ---
class ApiCache {
  constructor() {
    this.store = new Map();
  }

  get(key, maxAgeMs) {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > maxAgeMs) {
      this.store.delete(key);
      return null;
    }
    return entry.data;
  }

  set(key, data) {
    this.store.set(key, { data, timestamp: Date.now() });
  }
}

const CACHE_TTL = {
  quote: 15_000,
  candles: 300_000,
  profile: 3_600_000,
  financials: 3_600_000,
  news: 600_000,
  earnings: 3_600_000,
};

// --- Timeout helper (AbortSignal.timeout not available in all browsers) ---
function createTimeout(ms) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  // Attach cleanup so callers can clear if fetch finishes early
  controller._timer = timer;
  return controller;
}

// --- Yahoo Finance fallback for candle data ---
async function fetchYahooCandles(symbol, range = '1y', interval = '1d') {
  // Try multiple CORS proxy approaches
  const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}&includePrePost=false`;

  const proxyUrls = [
    yahooUrl, // Direct first (works in some environments)
    `https://api.allorigins.win/raw?url=${encodeURIComponent(yahooUrl)}`,
    `https://corsproxy.io/?${encodeURIComponent(yahooUrl)}`,
  ];

  for (const url of proxyUrls) {
    const ctrl = createTimeout(8000);
    try {
      const resp = await window.fetch(url, { signal: ctrl.signal });
      clearTimeout(ctrl._timer);
      if (!resp.ok) continue;
      const json = await resp.json();
      const result = json?.chart?.result?.[0];
      if (!result || !result.timestamp) continue;

      const quotes = result.indicators?.quote?.[0];
      if (!quotes) continue;

      // Convert to Finnhub-compatible format
      return {
        t: result.timestamp,
        o: quotes.open,
        h: quotes.high,
        l: quotes.low,
        c: quotes.close,
        v: quotes.volume,
        s: 'ok',
      };
    } catch (e) {
      clearTimeout(ctrl._timer);
      console.warn(`[Yahoo] Proxy attempt failed:`, e.message);
      continue;
    }
  }

  return null;
}

// --- Finnhub Client ---
class FinnhubClient {
  constructor() {
    this.rateLimiter = new RateLimiter();
    this.cache = new ApiCache();
    this._apiKey = null;
  }

  setApiKey(key) {
    this._apiKey = key;
  }

  getApiKey() {
    return this._apiKey || import.meta.env.VITE_FINNHUB_API_KEY || '';
  }

  async fetch(endpoint, params = {}, cacheTtl = 0) {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error('FINNHUB_API_KEY_MISSING');
    }

    const searchParams = new URLSearchParams({ ...params, token: apiKey });
    const url = `${FINNHUB_BASE_URL}${endpoint}?${searchParams}`;

    // Check cache
    if (cacheTtl > 0) {
      const cached = this.cache.get(url, cacheTtl);
      if (cached) return cached;
    }

    // Rate limit
    await this.rateLimiter.acquire();

    const response = await window.fetch(url);

    if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please wait a moment and try again.');
    }

    if (!response.ok) {
      throw new Error(`Finnhub API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (cacheTtl > 0) {
      this.cache.set(url, data);
    }

    return data;
  }

  // Real-time quote
  async getQuote(symbol) {
    return this.fetch('/quote', { symbol }, CACHE_TTL.quote);
  }

  // Historical OHLCV candles — tries Finnhub first, falls back to Yahoo Finance
  async getCandles(symbol, resolution = 'D', from, to) {
    const cacheKey = `candles_${symbol}_${resolution}_${from}_${to}`;
    const cached = this.cache.get(cacheKey, CACHE_TTL.candles);
    if (cached) return cached;

    if (!from || !to) {
      to = Math.floor(Date.now() / 1000);
      from = to - 365 * 24 * 60 * 60;
    }

    // Attempt 1: Finnhub candles
    try {
      const params = {
        symbol,
        resolution: String(resolution),
        from: String(Math.floor(Number(from))),
        to: String(Math.floor(Number(to))),
      };
      const data = await this.fetch('/stock/candle', params, 0);
      if (data && data.s === 'ok' && data.t && Array.isArray(data.t) && data.t.length > 10) {
        console.log(`[Finnhub] Got ${data.t.length} candles for ${symbol}`);
        this.cache.set(cacheKey, data);
        return data;
      }
      console.warn(`[Finnhub] Candle data insufficient for ${symbol}: s=${data?.s}, count=${data?.t?.length || 0}`);
    } catch (err) {
      console.warn(`[Finnhub] Candle fetch failed for ${symbol}:`, err.message);
    }

    // Attempt 2: Yahoo Finance fallback
    console.log(`[Yahoo] Trying Yahoo Finance fallback for ${symbol}...`);
    try {
      const yahooData = await fetchYahooCandles(symbol, '1y', '1d');
      if (yahooData && yahooData.t && yahooData.t.length > 10) {
        // Filter out null values that Yahoo sometimes includes
        const validIndices = yahooData.t.map((_, i) => i).filter(
          (i) => yahooData.c[i] != null && yahooData.o[i] != null && yahooData.h[i] != null && yahooData.l[i] != null
        );
        const cleaned = {
          t: validIndices.map((i) => yahooData.t[i]),
          o: validIndices.map((i) => yahooData.o[i]),
          h: validIndices.map((i) => yahooData.h[i]),
          l: validIndices.map((i) => yahooData.l[i]),
          c: validIndices.map((i) => yahooData.c[i]),
          v: validIndices.map((i) => yahooData.v[i] || 0),
          s: 'ok',
        };
        console.log(`[Yahoo] Got ${cleaned.t.length} candles for ${symbol}`);
        this.cache.set(cacheKey, cleaned);
        return cleaned;
      }
    } catch (err) {
      console.warn(`[Yahoo] Fallback failed for ${symbol}:`, err.message);
    }

    console.error(`[Data] No candle data available for ${symbol} from any source`);
    return { o: [], h: [], l: [], c: [], v: [], t: [], s: 'no_data' };
  }

  // Company profile
  async getCompanyProfile(symbol) {
    return this.fetch('/stock/profile2', { symbol }, CACHE_TTL.profile);
  }

  // Company news
  async getCompanyNews(symbol, from, to) {
    if (!from || !to) {
      const now = new Date();
      to = now.toISOString().split('T')[0];
      const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
      from = thirtyDaysAgo.toISOString().split('T')[0];
    }
    return this.fetch('/company-news', { symbol, from, to }, CACHE_TTL.news);
  }

  // Basic financials (P/E, EPS, 52-week range, etc.)
  async getBasicFinancials(symbol) {
    return this.fetch('/stock/metric', { symbol, metric: 'all' }, CACHE_TTL.financials);
  }

  // Earnings
  async getEarnings(symbol) {
    return this.fetch('/stock/earnings', { symbol }, CACHE_TTL.earnings);
  }
}

export const finnhubClient = new FinnhubClient();
