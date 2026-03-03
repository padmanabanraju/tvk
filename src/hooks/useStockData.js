import { useState, useEffect, useCallback } from 'react';
import { finnhubClient } from '../services/finnhub';
import { transformCandles, computeIndicators, transformNews, transformEarnings, assembleStockData } from '../services/dataTransformers';

export function useStockData(symbol) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [warnings, setWarnings] = useState([]);

  const fetchData = useCallback(async () => {
    if (!symbol) return;
    setLoading(true);
    setError(null);
    setWarnings([]);

    try {
      // Fetch quote first (critical), then everything else in parallel
      const quoteData = await finnhubClient.getQuote(symbol);

      if (!quoteData || quoteData.c === 0) {
        throw new Error(`No data found for symbol "${symbol}". Please check the ticker.`);
      }

      // Fetch remaining data in parallel
      const [profile, financials, rawCandles, rawNews, rawEarnings] = await Promise.allSettled([
        finnhubClient.getCompanyProfile(symbol),
        finnhubClient.getBasicFinancials(symbol),
        finnhubClient.getCandles(symbol, 'D'),
        finnhubClient.getCompanyNews(symbol),
        finnhubClient.getEarnings(symbol),
      ]);

      const profileData = profile.status === 'fulfilled' ? profile.value : null;
      const financialsData = financials.status === 'fulfilled' ? financials.value : null;
      const candlesRaw = rawCandles.status === 'fulfilled' ? rawCandles.value : null;
      const newsRaw = rawNews.status === 'fulfilled' ? rawNews.value : null;
      const earningsRaw = rawEarnings.status === 'fulfilled' ? rawEarnings.value : null;

      // Track warnings
      const newWarnings = [];

      const candles = transformCandles(candlesRaw);
      if (candles.length === 0) {
        newWarnings.push('Historical price data unavailable — chart and technical indicators may be limited. Check browser console for details.');
        console.warn(`[TVK] No candle data for ${symbol}. Finnhub status: ${candlesRaw?.s}. Try refreshing.`);
      } else {
        console.log(`[TVK] ${symbol}: loaded ${candles.length} candles`);
      }

      const indicators = computeIndicators(candles);
      const news = transformNews(newsRaw);
      const earnings = transformEarnings(earningsRaw);

      const assembled = assembleStockData(symbol, quoteData, profileData, financialsData, candles, news, earnings, indicators);
      setData(assembled);
      setWarnings(newWarnings);
    } catch (err) {
      console.error('[TVK] Error:', err);
      setError(err.message || 'Failed to fetch stock data');
    } finally {
      setLoading(false);
    }
  }, [symbol]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, warnings, refetch: fetchData };
}

export function useStockQuote(symbol) {
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!symbol) return;
    let cancelled = false;
    setLoading(true);

    finnhubClient.getQuote(symbol)
      .then((data) => {
        if (!cancelled) setQuote(data);
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [symbol]);

  return { quote, loading };
}
