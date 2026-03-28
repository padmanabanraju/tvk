import { getCached, setCache, CACHE_TTL } from '../utils/cache';

const BASE = 'https://newsapi.org/v2';
let _key = '';
export function setApiKey(key) { _key = key; }

async function fetchNews(endpoint, cacheKey) {
  const cached = getCached(cacheKey);
  if (cached) return { articles: cached.data, _cached: true };

  if (!_key || _key === 'YOUR_KEY_HERE') return { articles: [], _error: 'No API key' };

  const res = await fetch(`${BASE}${endpoint}&apiKey=${_key}`);
  if (!res.ok) throw new Error(`NewsAPI ${res.status}`);
  const data = await res.json();
  const articles = data.articles || [];
  setCache(cacheKey, articles, CACHE_TTL.newsapi_any);
  return { articles };
}

export async function getMarketHeadlines() {
  return fetchNews('/top-headlines?category=business&country=us&pageSize=10', 'tr_news_market');
}

export async function getMarketMovingNews() {
  return fetchNews('/everything?q=stock+market+OR+S%26P+500+OR+Wall+Street&sortBy=publishedAt&pageSize=10&language=en', 'tr_news_moving');
}

export async function getTrumpPolicyNews() {
  return fetchNews('/everything?q=Trump+(market+OR+tariff+OR+Iran+OR+stocks+OR+trade+OR+economy)&sortBy=publishedAt&pageSize=10&language=en', 'tr_news_trump');
}

export async function getTickerNews(symbol) {
  return fetchNews(`/everything?q=${symbol}+stock&sortBy=publishedAt&pageSize=10&language=en`, `tr_news_${symbol}`);
}
