import { getCached, setCache, CACHE_TTL } from '../utils/cache';

const REDDIT_BASE = 'https://www.reddit.com';

async function fetchReddit(path, cacheKey) {
  const cached = getCached(cacheKey);
  if (cached) return { posts: cached.data, _cached: true };

  try {
    const res = await fetch(`${REDDIT_BASE}${path}`, {
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) throw new Error(`Reddit ${res.status}`);
    const data = await res.json();
    const posts = data?.data?.children || [];
    setCache(cacheKey, posts, CACHE_TTL.reddit_wsb);
    return { posts };
  } catch {
    return { posts: [] };
  }
}

export async function getWSBHot() {
  return fetchReddit('/r/wallstreetbets/hot.json?limit=15', 'tr_wsb_hot');
}

export async function getWSBTicker(symbol) {
  return fetchReddit(
    `/r/wallstreetbets/search.json?q=${symbol}&sort=new&restrict_sr=1&limit=10`,
    `tr_wsb_${symbol}`
  );
}

export async function getOptionsReddit() {
  return fetchReddit('/r/options/hot.json?limit=10', 'tr_roptions');
}

export async function getStocksReddit() {
  return fetchReddit('/r/stocks/hot.json?limit=10', 'tr_rstocks');
}

export function calculateWSBSentiment(posts, symbol) {
  const mentions = posts.filter(p =>
    p.data.title.toUpperCase().includes(symbol) ||
    (p.data.selftext || '').toUpperCase().includes(symbol)
  );

  const bullishWords = ['calls', 'bull', 'moon', 'buy', 'long', 'rocket', 'tendies', 'yolo call'];
  const bearishWords = ['puts', 'bear', 'drill', 'short', 'sell', 'crash', 'dump', 'rug'];

  let bullish = 0, bearish = 0;
  mentions.forEach(p => {
    const text = (p.data.title + ' ' + (p.data.selftext || '')).toLowerCase();
    const weight = Math.max(1, Math.log10(p.data.score + 1));
    bullishWords.forEach(w => { if (text.includes(w)) bullish += weight; });
    bearishWords.forEach(w => { if (text.includes(w)) bearish += weight; });
  });

  const total = bullish + bearish || 1;
  return {
    mentions: mentions.length,
    bullishPct: Math.round((bullish / total) * 100),
    bearishPct: Math.round((bearish / total) * 100),
    sentiment: bullish > bearish * 1.3 ? 'BULLISH' : bearish > bullish * 1.3 ? 'BEARISH' : 'MIXED',
    topPosts: mentions.slice(0, 5).map(p => ({
      title: p.data.title,
      score: p.data.score,
      comments: p.data.num_comments,
      flair: p.data.link_flair_text,
      url: `https://reddit.com${p.data.permalink}`,
    })),
  };
}
