import { useState, useEffect, useCallback, useRef } from 'react';
import * as googleNews from '../api/googlenews';
import * as finnhubApi from '../api/trFinnhub';
import * as reddit from '../api/reddit';

export function useNewsData(symbol) {
  const [marketNews, setMarketNews] = useState([]);
  const [companyNews, setCompanyNews] = useState([]);
  const [trumpNews, setTrumpNews] = useState([]);
  const [wsbData, setWsbData] = useState({ posts: [], sentiment: null });
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [nextRefresh, setNextRefresh] = useState(300);
  const timerRef = useRef(null);

  const fetchNews = useCallback(async () => {
    setLoading(true);
    try {
      const [market, trump] = await Promise.allSettled([
        googleNews.getMarketNews(),
        googleNews.getTrumpPolicyNews(),
      ]);

      if (market.status === 'fulfilled') setMarketNews(market.value.articles);
      if (trump.status === 'fulfilled') setTrumpNews(trump.value.articles);

      // Company news from Finnhub
      if (symbol) {
        const today = new Date().toISOString().split('T')[0];
        const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];

        const [company, wsb] = await Promise.allSettled([
          finnhubApi.getCompanyNews(symbol, weekAgo, today),
          reddit.getWSBHot(),
        ]);

        if (company.status === 'fulfilled') {
          setCompanyNews(Array.isArray(company.value) ? company.value.slice(0, 15) : []);
        }

        if (wsb.status === 'fulfilled') {
          const posts = wsb.value.posts || [];
          const sentiment = reddit.calculateWSBSentiment(posts, symbol);
          setWsbData({ posts: posts.slice(0, 10), sentiment });
        }
      }

      setLastRefresh(new Date());
      setNextRefresh(300);
    } catch (err) {
      console.error('News fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [symbol]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    fetchNews();
    const interval = setInterval(fetchNews, 300000);
    return () => clearInterval(interval);
  }, [fetchNews]);

  // Countdown timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setNextRefresh(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  return {
    marketNews,
    companyNews,
    trumpNews,
    wsbData,
    loading,
    lastRefresh,
    nextRefresh,
    refresh: fetchNews,
  };
}
