import { getCached, setCache, CACHE_TTL } from '../utils/cache';
import { parseGoogleNews } from '../utils/rssParser';

const GNEWS_URL = 'https://api.rss2json.com/v1/api.json';

async function fetchGNews(query, cacheKey, ttl) {
  const cached = getCached(cacheKey);
  if (cached) return { articles: cached.data, _cached: true, _age: cached.age };

  try {
    let articles = [];

    // Use rss2json API to convert RSS to JSON (no CORS issues)
    const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;
    const apiUrl = `${GNEWS_URL}?rss_url=${encodeURIComponent(rssUrl)}`;
    const res = await fetch(apiUrl);
    if (res.ok) {
      const data = await res.json();
      if (data.status === 'ok' && data.items) {
        articles = data.items.slice(0, 15).map(item => ({
          title: item.title || '',
          link: item.link || '',
          pubDate: item.pubDate || '',
          source: item.author || '',
        }));
      }
    }

    // Fallback: try direct fetch
    if (articles.length === 0) {
      const directUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;
      articles = await parseGoogleNews(directUrl);
    }

    if (articles.length > 0) setCache(cacheKey, articles, ttl);
    return { articles };
  } catch {
    return { articles: [] };
  }
}

export async function getMarketNews() {
  return fetchGNews('stock market today', 'tr_grss_market', CACHE_TTL.google_rss_market);
}

export async function getTrumpPolicyNews() {
  return fetchGNews('Trump stocks OR Trump market OR Trump Iran OR Trump tariff', 'tr_grss_trump', CACHE_TTL.google_rss_trump);
}

export async function getIranNews() {
  return fetchGNews('Iran war oil Hormuz ceasefire', 'tr_grss_iran', CACHE_TTL.google_rss_iran);
}

export async function getFedNews() {
  return fetchGNews('Federal Reserve interest rate inflation', 'tr_grss_fed', CACHE_TTL.google_rss_market);
}

export async function getTickerNews(symbol) {
  return fetchGNews(`${symbol} stock earnings`, `tr_grss_${symbol}`, CACHE_TTL.google_rss_ticker);
}
