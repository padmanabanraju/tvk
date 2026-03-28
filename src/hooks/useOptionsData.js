import { useState, useEffect } from 'react';
import { getExpirations, getOptionsChain, categorizeExpirations } from '../api/tradier';
import { calculateMaxPain } from '../calculations/maxPain';
import { calculatePutCallRatios } from '../calculations/putCallRatio';
import { calculateWalls } from '../calculations/walls';
import { calculateGEX } from '../calculations/gex';
import { detectUnusualActivity } from '../calculations/unusualActivity';
import { calculateIVSkew } from '../calculations/ivSkew';
import { calculateNetDelta } from '../calculations/netDelta';

export function useOptionsData(symbol, spotPrice, enabled = true) {
  const [expirations, setExpirations] = useState([]);
  const [categorizedExps, setCategorizedExps] = useState([]);
  const [selectedExp, setSelectedExp] = useState('');
  const [chain, setChain] = useState([]);
  const [calculations, setCalculations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch expirations
  useEffect(() => {
    if (!symbol || !enabled) return;
    setLoading(true);
    getExpirations(symbol)
      .then(exps => {
        setExpirations(exps);

        // Categorize all expirations
        const today = new Date().toISOString().split('T')[0];
        const futureExps = exps.filter(e => e > today);
        const categorized = categorizeExpirations(futureExps);
        setCategorizedExps(categorized);

        // Auto-select first future expiration
        const defaultExp = futureExps[0] || exps[exps.length - 1];
        if (!selectedExp || selectedExp <= today) {
          setSelectedExp(defaultExp);
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [symbol, enabled]);

  // Fetch chain when expiration changes
  useEffect(() => {
    if (!symbol || !selectedExp || !enabled) return;
    setLoading(true);
    getOptionsChain(symbol, selectedExp)
      .then(data => {
        setChain(data);
        if (data.length > 0 && spotPrice) {
          setCalculations({
            maxPain: calculateMaxPain(data),
            putCallRatios: calculatePutCallRatios(data),
            walls: calculateWalls(data),
            gex: calculateGEX(data, spotPrice),
            unusualActivity: detectUnusualActivity(data),
            ivSkew: calculateIVSkew(data, spotPrice),
            netDelta: calculateNetDelta(data),
          });
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [symbol, selectedExp, spotPrice, enabled]);

  return {
    expirations,
    categorizedExps,
    selectedExp,
    setSelectedExp,
    chain,
    calculations,
    loading,
    error,
  };
}
