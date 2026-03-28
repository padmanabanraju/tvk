import { useState, useEffect, useCallback } from 'react';
import * as finnhub from '../api/trFinnhub';

export function useStockData(symbol) {
  const [data, setData] = useState({
    quote: null,
    profile: null,
    financials: null,
    recommendations: null,
    priceTarget: null,
    earnings: null,
    technicalSignal: null,
    upgradeDowngrade: null,
    insiderSentiment: null,
    insiderTransactions: null,
    institutional: null,
    congressional: null,
    socialSentiment: null,
    peers: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    if (!symbol) return;
    setLoading(true);
    setError(null);

    try {
      const today = new Date().toISOString().split('T')[0];
      const weekAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];

      // Fetch in priority batches to respect rate limits
      const [quote, profile, financials] = await Promise.allSettled([
        finnhub.getQuote(symbol),
        finnhub.getProfile(symbol),
        finnhub.getFinancials(symbol),
      ]);

      setData(prev => ({
        ...prev,
        quote: quote.status === 'fulfilled' ? quote.value : null,
        profile: profile.status === 'fulfilled' ? profile.value : null,
        financials: financials.status === 'fulfilled' ? financials.value : null,
      }));

      // Second batch
      const [recs, pt, earnings, signal] = await Promise.allSettled([
        finnhub.getRecommendations(symbol),
        finnhub.getPriceTarget(symbol),
        finnhub.getEarnings(symbol),
        finnhub.getTechnicalIndicator(symbol),
      ]);

      setData(prev => ({
        ...prev,
        recommendations: recs.status === 'fulfilled' ? recs.value : null,
        priceTarget: pt.status === 'fulfilled' ? pt.value : null,
        earnings: earnings.status === 'fulfilled' ? earnings.value : null,
        technicalSignal: signal.status === 'fulfilled' ? signal.value : null,
      }));

      // Third batch - less critical
      const [ud, insent, intx, inst, cong, social, peers] = await Promise.allSettled([
        finnhub.getUpgradeDowngrade(symbol),
        finnhub.getInsiderSentiment(symbol),
        finnhub.getInsiderTransactions(symbol),
        finnhub.getInstitutionalOwnership(symbol),
        finnhub.getCongressionalTrading(symbol),
        finnhub.getSocialSentiment(symbol, weekAgo, today),
        finnhub.getPeers(symbol),
      ]);

      setData(prev => ({
        ...prev,
        upgradeDowngrade: ud.status === 'fulfilled' ? ud.value : null,
        insiderSentiment: insent.status === 'fulfilled' ? insent.value : null,
        insiderTransactions: intx.status === 'fulfilled' ? intx.value : null,
        institutional: inst.status === 'fulfilled' ? inst.value : null,
        congressional: cong.status === 'fulfilled' ? cong.value : null,
        socialSentiment: social.status === 'fulfilled' ? social.value : null,
        peers: peers.status === 'fulfilled' ? peers.value : null,
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [symbol]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { ...data, loading, error, refresh: fetchAll };
}
