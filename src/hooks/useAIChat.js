import { useState, useCallback, useRef } from 'react';
import { streamChat, buildAiConfig, hasAiKey, extractTickers, formatStockContext } from '../services/aiClient';
import { useAuth } from '../contexts/AuthContext';
import { finnhubClient } from '../services/finnhub';

// Fetch a quick snapshot for a ticker (quote + profile) — lightweight, no candles
async function fetchQuickContext(symbol) {
  try {
    const [quote, profile, financials] = await Promise.allSettled([
      finnhubClient.getQuote(symbol),
      finnhubClient.getCompanyProfile(symbol),
      finnhubClient.getBasicFinancials(symbol),
    ]);

    const q = quote.status === 'fulfilled' ? quote.value : null;
    const p = profile.status === 'fulfilled' ? profile.value : null;
    const f = financials.status === 'fulfilled' ? financials.value : null;

    if (!q || q.c === 0) return null;

    const metrics = f?.metric || {};
    return {
      symbol,
      name: p?.name || symbol,
      price: q.c,
      change: q.d,
      changePercent: q.dp,
      open: q.o,
      high: q.h,
      low: q.l,
      previousClose: q.pc,
      pe: metrics['peBasicExclExtraTTM'] || null,
      eps: metrics['epsBasicExclExtraItemsTTM'] || null,
      week52High: metrics['52WeekHigh'] || null,
      week52Low: metrics['52WeekLow'] || null,
      beta: metrics['beta'] || null,
      marketCap: p?.marketCapitalization ? p.marketCapitalization * 1e6 : null,
    };
  } catch {
    return null;
  }
}

export function useAIChat() {
  const { apiKeys } = useAuth();
  const [streaming, setStreaming] = useState(false);
  const abortRef = useRef(false);

  const hasAI = hasAiKey(apiKeys);

  const sendMessage = useCallback(async (messages, explicitStockContext, onChunk) => {
    if (!hasAiKey(apiKeys)) return;
    abortRef.current = false;
    setStreaming(true);

    try {
      const aiConfig = buildAiConfig(apiKeys);
      if (!aiConfig) throw new Error('No AI provider configured. Go to Settings to set up your API key.');

      // Extract tickers from the latest user message
      const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
      const tickers = lastUserMsg ? extractTickers(lastUserMsg.content) : [];

      // Fetch live data for mentioned tickers (max 3 to keep it fast)
      let stockContexts = explicitStockContext ? [formatStockContext(explicitStockContext)] : [];

      if (tickers.length > 0) {
        const tickersToFetch = tickers.slice(0, 3);
        const snapshots = await Promise.all(tickersToFetch.map(fetchQuickContext));
        const validSnapshots = snapshots.filter(Boolean);
        if (validSnapshots.length > 0) {
          stockContexts = [
            ...stockContexts,
            ...validSnapshots.map(s => formatStockContext(s)),
          ];
        }
      }

      await streamChat(
        messages,
        stockContexts.length > 0 ? stockContexts : null,
        aiConfig,
        (chunk) => {
          if (!abortRef.current) onChunk(chunk);
        }
      );
    } catch (err) {
      setStreaming(false);
      throw err;
    } finally {
      setStreaming(false);
    }
  }, [apiKeys]);

  const cancel = useCallback(() => {
    abortRef.current = true;
    setStreaming(false);
  }, []);

  return { sendMessage, streaming, cancel, hasAI };
}
