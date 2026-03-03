import { useState, useEffect, useCallback } from 'react';
import { finnhubClient } from '../services/finnhub';

const DEFAULT_SYMBOLS = ['AAPL', 'TSLA', 'NVDA', 'AMD', 'MSFT', 'GOOGL', 'META', 'AMZN', 'NFLX', 'SPY'];

export function useMarketScanner(symbols = DEFAULT_SYMBOLS) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch quotes for all symbols in parallel
      const responses = await Promise.allSettled(
        symbols.map((sym) => finnhubClient.getQuote(sym))
      );

      const data = symbols.map((sym, i) => {
        const resp = responses[i];
        if (resp.status === 'fulfilled' && resp.value && resp.value.c > 0) {
          const q = resp.value;
          return {
            symbol: sym,
            price: q.c,
            change: q.d,
            changePercent: q.dp,
            high: q.h,
            low: q.l,
            open: q.o,
            previousClose: q.pc,
          };
        }
        return {
          symbol: sym,
          price: null,
          change: null,
          changePercent: null,
          error: true,
        };
      });

      setResults(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message || 'Failed to fetch scanner data');
    } finally {
      setLoading(false);
    }
  }, [symbols.join(',')]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { results, loading, error, lastUpdated, refetch: fetchAll };
}
