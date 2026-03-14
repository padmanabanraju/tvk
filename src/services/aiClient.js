// Unified AI client — supports Claude, OpenAI, Gemini, and Ollama
// Routes all requests through local proxy at /api/ai/{provider}

import { AI_PROVIDERS } from './aiProviders';

// ── System Prompts (provider-agnostic) ──────────────────────────

const STOCK_ANALYSIS_SYSTEM = `You are an expert financial analyst providing stock analysis for TVK (Trading View Kind-of).
Analyze the provided stock data and produce a concise 3-4 paragraph narrative covering:
1. Current trend and price action based on the technical indicators
2. Fundamental valuation (P/E, earnings history, growth rates)
3. Key risks and opportunities
4. Your overall assessment (bullish/bearish/neutral) with a clear reasoning

Be specific — reference actual numbers from the data. Be direct and actionable. Do not use disclaimers or hedge excessively. Format key numbers in bold using **bold** syntax.`;

const CHAT_SYSTEM = `You are TVK — a professional trading and investing AI assistant built for active traders and investors.

## Your Expertise
- **Technical Analysis**: RSI, MACD, Bollinger Bands, SMA/EMA, support/resistance, chart patterns (head & shoulders, double tops/bottoms, flags, wedges, cup & handle), candlestick patterns (doji, engulfing, hammer, shooting star), volume analysis, trend identification
- **Options Trading**: Greeks (delta, gamma, theta, vega, rho), strategies (covered calls, protective puts, iron condors, spreads, straddles, strangles, butterflies, calendar spreads), IV rank/percentile, options chain analysis, max pain, put/call ratios, expiration dynamics, rolling, assignment risk
- **Fundamental Analysis**: P/E, P/S, P/B, PEG, DCF basics, earnings analysis, revenue growth, margins, free cash flow, debt/equity, ROE, insider activity, institutional ownership
- **Trading Strategies**: Swing trading, day trading setups, position sizing, risk management (stop losses, risk/reward ratios), sector rotation, mean reversion, momentum, breakout trading
- **Market Concepts**: Market structure, order flow basics, market breadth, correlation, beta, volatility (VIX), economic indicators (CPI, PPI, NFP, FOMC), sector analysis, ETF strategies

## Behavior Rules
1. Be direct and actionable — traders value clarity over hedging
2. When the user mentions a ticker (like TSLA, AAPL, $SPY), use any provided live market data to inform your response
3. When live data is provided in the context, ALWAYS reference the actual numbers (price, RSI, MACD, etc.) in your answer
4. For options questions, walk through the strategy mechanics with concrete examples (use the stock's actual price if available)
5. Explain risk/reward for every trade idea — always mention what could go wrong
6. If asked about a strategy, give entry criteria, exit criteria, and position sizing guidance
7. Use **bold** for tickers, key numbers, and important terms
8. Keep responses focused — 2-4 paragraphs max unless the user asks for detail
9. If someone is clearly a beginner, adjust your language but don't dumb down the concepts
10. Never give specific buy/sell recommendations — frame as educational analysis ("if a trader were bullish, they might consider...")
11. For multi-leg options strategies, always break down max profit, max loss, and breakeven points

## What You Can Do
- Explain any trading concept, strategy, or indicator
- Analyze stocks using live data when provided
- Build options strategy recommendations with full P&L breakdown
- Compare stocks, discuss sector trends, explain market events
- Help with position sizing and risk management calculations
- Discuss earnings plays, IV crush, and event-driven strategies
- Teach technical analysis patterns and how to trade them

## Response Format
- Use **bold** for tickers and key numbers
- Use bullet points for multi-part answers
- For options strategies, use a structured format: Strategy → Legs → Max Profit → Max Loss → Breakeven → When to Use
- Keep it conversational but professional`;

// ── Format stock data for any LLM ──────────────────────────────

export function formatStockContext(data) {
  if (!data) return '';

  const parts = [
    `**${data.symbol}** (${data.name}) — $${data.price?.toFixed(2)} (${data.changePercent >= 0 ? '+' : ''}${data.changePercent?.toFixed(2)}%)`,
  ];

  if (data.indicators) {
    const ind = data.indicators;
    const indicators = [];
    if (ind.rsi != null) indicators.push(`RSI: ${ind.rsi.toFixed(1)}`);
    if (ind.macd != null) indicators.push(`MACD: ${ind.macd.toFixed(2)}`);
    if (ind.sma20 != null) indicators.push(`SMA20: $${ind.sma20.toFixed(2)}`);
    if (ind.sma50 != null) indicators.push(`SMA50: $${ind.sma50.toFixed(2)}`);
    if (ind.sma200 != null) indicators.push(`SMA200: $${ind.sma200.toFixed(2)}`);
    if (ind.atr != null) indicators.push(`ATR: $${ind.atr.toFixed(2)}`);
    if (ind.adx != null) indicators.push(`ADX: ${ind.adx.toFixed(1)}`);
    if (ind.vwap != null) indicators.push(`VWAP: $${ind.vwap.toFixed(2)}`);
    if (ind.obv != null) indicators.push(`OBV: ${(ind.obv / 1e6).toFixed(1)}M`);
    if (ind.signal) indicators.push(`Signal: ${ind.signal}`);
    if (ind.trendStrength) indicators.push(`Trend: ${ind.trendStrength}`);
    if (indicators.length) parts.push(`Technical: ${indicators.join(', ')}`);
  }

  if (data.pe != null) parts.push(`P/E: ${data.pe.toFixed(1)}`);
  if (data.eps != null) parts.push(`EPS: $${data.eps.toFixed(2)}`);
  if (data.week52High != null) parts.push(`52W: $${data.week52Low?.toFixed(2)}-$${data.week52High.toFixed(2)}`);
  if (data.beta != null) parts.push(`Beta: ${data.beta.toFixed(2)}`);
  if (data.revenueGrowth != null) parts.push(`Rev Growth: ${data.revenueGrowth.toFixed(1)}%`);
  if (data.marketCap != null) parts.push(`Mkt Cap: $${(data.marketCap / 1e9).toFixed(1)}B`);

  if (data.earnings?.length) {
    const recent = data.earnings.slice(0, 4).map(e =>
      `${e.quarter}: actual $${e.actual?.toFixed(2)} vs est $${e.estimate?.toFixed(2)} (${e.surprisePercent > 0 ? '+' : ''}${e.surprisePercent?.toFixed(1)}%)`
    ).join('; ');
    parts.push(`Earnings: ${recent}`);
  }

  if (data.news?.length) {
    const headlines = data.news.slice(0, 5).map(n => `[${n.sentiment}] ${n.title}`).join('; ');
    parts.push(`Recent News: ${headlines}`);
  }

  return parts.join('\n');
}

// ── Extract tickers from natural language ───────────────────────

const COMMON_WORDS = new Set([
  'I', 'A', 'AM', 'AN', 'AS', 'AT', 'BE', 'BY', 'DO', 'GO', 'IF', 'IN', 'IS', 'IT', 'ME',
  'MY', 'NO', 'OF', 'OK', 'ON', 'OR', 'SO', 'TO', 'UP', 'US', 'WE', 'AI', 'ALL', 'AND',
  'ANY', 'ARE', 'BUT', 'BUY', 'CAN', 'DAY', 'DID', 'FOR', 'GET', 'GOT', 'HAS', 'HAD',
  'HER', 'HIM', 'HIS', 'HOW', 'ITS', 'LET', 'LOT', 'MAY', 'NEW', 'NOT', 'NOW', 'OLD',
  'ONE', 'OUR', 'OUT', 'OWN', 'PUT', 'RUN', 'SAY', 'SET', 'SHE', 'THE', 'TOO', 'TWO',
  'USE', 'WAS', 'WAY', 'WHO', 'WHY', 'WIN', 'YES', 'YET', 'YOU', 'CALL', 'SELL', 'LONG',
  'HIGH', 'LOW', 'RISK', 'STOP', 'LOSS', 'HOLD', 'CASH', 'WHAT', 'WHEN', 'WILL', 'WITH',
  'THAT', 'THAN', 'THEM', 'THEY', 'THIS', 'ALSO', 'BEEN', 'BEST', 'BOTH', 'BULL', 'BEAR',
  'DOES', 'DOWN', 'EACH', 'EVEN', 'FROM', 'GOOD', 'HAVE', 'HERE', 'INTO', 'JUST', 'KEEP',
  'KNOW', 'LIKE', 'LOOK', 'MADE', 'MAKE', 'MANY', 'MORE', 'MOST', 'MUCH', 'MUST', 'NEED',
  'NEXT', 'ONLY', 'OVER', 'SAME', 'SHOW', 'SOME', 'SUCH', 'SURE', 'TAKE', 'TELL', 'VERY',
  'WANT', 'WELL', 'WERE', 'WORK', 'YEAR', 'YOUR', 'ABOUT', 'ABOVE', 'AFTER', 'BEING',
  'BELOW', 'COULD', 'EVERY', 'FIRST', 'GREAT', 'MIGHT', 'NEVER', 'OTHER', 'PRICE', 'RIGHT',
  'SHALL', 'SHARE', 'SHOULD', 'SINCE', 'STILL', 'STOCK', 'THEIR', 'THERE', 'THESE', 'THINK',
  'THOSE', 'THREE', 'TODAY', 'TRADE', 'UNDER', 'UNTIL', 'VALUE', 'WATCH', 'WHICH', 'WHILE',
  'WORLD', 'WOULD', 'SHORT', 'CHART', 'CHECK', 'MONEY', 'POINT', 'GOING', 'WHERE',
  'TREND', 'BREAK', 'LEVEL', 'CLOSE', 'AFTER', 'MOVE', 'SCAN', 'FIND', 'HELP',
  'RSI', 'MACD', 'ATR', 'EMA', 'SMA', 'ADX', 'OBV', 'IV', 'PE', 'EPS', 'ROE', 'DCF',
  'ETF', 'IPO', 'CEO', 'CFO', 'SEC', 'FED', 'GDP', 'CPI', 'PPI', 'NFP',
]);

export function extractTickers(text) {
  const tickers = new Set();

  // Match $TICKER format (high confidence)
  const dollarMatches = text.match(/\$([A-Z]{1,5})\b/g);
  if (dollarMatches) {
    dollarMatches.forEach(m => tickers.add(m.slice(1)));
  }

  // Match ALL-CAPS words that look like tickers (1-5 chars), but filter common words
  const capsMatches = text.match(/\b([A-Z]{1,5})\b/g);
  if (capsMatches) {
    capsMatches.forEach(word => {
      if (!COMMON_WORDS.has(word) && word.length >= 2) {
        tickers.add(word);
      }
    });
  }

  return Array.from(tickers);
}

// ── Config builders ─────────────────────────────────────────────

export function buildAiConfig(apiKeys) {
  const provider = apiKeys?.aiProvider;
  if (!provider) return null;
  const def = AI_PROVIDERS[provider];
  if (!def) return null;
  return {
    provider,
    apiKey: def.keyField ? (apiKeys?.[def.keyField] || '') : '',
    model: def.model,
    proxyRoute: def.proxyRoute,
    ollamaBaseUrl: apiKeys?.ollamaBaseUrl || 'http://localhost:11434',
    ollamaModel: apiKeys?.ollamaModel || 'llama3.2',
  };
}

export function hasAiKey(apiKeys) {
  const provider = apiKeys?.aiProvider;
  if (!provider) return !!apiKeys?.anthropicApiKey; // backwards compat
  const def = AI_PROVIDERS[provider];
  if (!def) return false;
  if (!def.requiresApiKey) return true; // ollama
  return !!(apiKeys?.[def.keyField]);
}

// ── Per-provider request builders ───────────────────────────────

function buildClaudeRequest(system, messages, model, maxTokens, stream) {
  return {
    model,
    max_tokens: maxTokens,
    system,
    messages,
    stream,
  };
}

function buildOpenAIRequest(system, messages, model, maxTokens, stream) {
  return {
    model,
    max_tokens: maxTokens,
    messages: [{ role: 'system', content: system }, ...messages],
    stream,
  };
}

function buildGeminiRequest(system, messages, model, maxTokens, stream) {
  return {
    model,
    systemInstruction: { parts: [{ text: system }] },
    contents: messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    })),
    generationConfig: { maxOutputTokens: maxTokens },
    stream,
  };
}

function buildOllamaRequest(system, messages, model, maxTokens, stream) {
  return {
    model,
    messages: [{ role: 'system', content: system }, ...messages],
    stream,
    options: { num_predict: maxTokens },
  };
}

// ── Per-provider response extractors ────────────────────────────

function extractClaudeText(data) { return data.content?.[0]?.text; }
function extractOpenAIText(data) { return data.choices?.[0]?.message?.content; }
function extractGeminiText(data) { return data.candidates?.[0]?.content?.parts?.[0]?.text; }
function extractOllamaText(data) { return data.message?.content; }

// ── Per-provider SSE chunk extractors ───────────────────────────

function extractClaudeChunk(parsed) {
  if (parsed.type === 'content_block_delta' && parsed.delta?.text) return parsed.delta.text;
  return null;
}

function extractOpenAIChunk(parsed) {
  return parsed.choices?.[0]?.delta?.content || null;
}

function extractGeminiChunk(parsed) {
  return parsed.candidates?.[0]?.content?.parts?.[0]?.text || null;
}

// ── Adapter map ─────────────────────────────────────────────────

const ADAPTERS = {
  claude: { buildRequest: buildClaudeRequest, extractText: extractClaudeText, extractChunk: extractClaudeChunk, streamFormat: 'sse' },
  openai: { buildRequest: buildOpenAIRequest, extractText: extractOpenAIText, extractChunk: extractOpenAIChunk, streamFormat: 'sse' },
  gemini: { buildRequest: buildGeminiRequest, extractText: extractGeminiText, extractChunk: extractGeminiChunk, streamFormat: 'sse' },
  ollama: { buildRequest: buildOllamaRequest, extractText: extractOllamaText, extractChunk: null, streamFormat: 'ndjson' },
};

// ── Stream readers ──────────────────────────────────────────────

async function readSSE(response, onParsed) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const data = line.slice(6);
      if (data === '[DONE]') return;

      try {
        onParsed(JSON.parse(data));
      } catch {
        // skip non-JSON lines
      }
    }
  }
}

async function readNDJSON(response, onParsed) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const parsed = JSON.parse(line);
        if (parsed.done) return;
        onParsed(parsed);
      } catch {
        // skip malformed lines
      }
    }
  }
}

// ── Public API ──────────────────────────────────────────────────

// Build the fetch body — adds baseUrl for Ollama, apiKey for cloud providers
function buildFetchBody(aiConfig, requestBody) {
  const body = { ...requestBody };
  if (aiConfig.apiKey) body.apiKey = aiConfig.apiKey;
  if (aiConfig.provider === 'ollama') body.baseUrl = aiConfig.ollamaBaseUrl;
  return body;
}

export async function analyzeStock(stockData, aiConfig) {
  const context = formatStockContext(stockData);
  const adapter = ADAPTERS[aiConfig.provider];
  const model = aiConfig.provider === 'ollama' ? aiConfig.ollamaModel : aiConfig.model;

  const requestBody = adapter.buildRequest(
    STOCK_ANALYSIS_SYSTEM,
    [{ role: 'user', content: `Analyze this stock:\n\n${context}` }],
    model,
    1024,
    false
  );

  const response = await fetch(aiConfig.proxyRoute, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(buildFetchBody(aiConfig, requestBody)),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || err.error || `AI API error: ${response.status}`);
  }

  const data = await response.json();
  return adapter.extractText(data) || 'No analysis generated.';
}

export async function streamChat(messages, stockContexts, aiConfig, onChunk) {
  let systemPrompt = CHAT_SYSTEM;

  // stockContexts can be a single object or an array of formatted context strings
  if (stockContexts) {
    if (typeof stockContexts === 'string') {
      systemPrompt += `\n\n## Live Market Data\n${stockContexts}`;
    } else if (Array.isArray(stockContexts) && stockContexts.length > 0) {
      systemPrompt += `\n\n## Live Market Data\n${stockContexts.join('\n\n---\n\n')}`;
    } else if (typeof stockContexts === 'object') {
      systemPrompt += `\n\n## Live Market Data\n${formatStockContext(stockContexts)}`;
    }
  }

  const adapter = ADAPTERS[aiConfig.provider];
  const model = aiConfig.provider === 'ollama' ? aiConfig.ollamaModel : aiConfig.model;

  const requestBody = adapter.buildRequest(
    systemPrompt,
    messages.map(m => ({ role: m.role, content: m.content })),
    model,
    2048,
    true
  );

  const response = await fetch(aiConfig.proxyRoute, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(buildFetchBody(aiConfig, requestBody)),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || err.error || `AI API error: ${response.status}`);
  }

  if (adapter.streamFormat === 'ndjson') {
    await readNDJSON(response, (parsed) => {
      if (parsed.message?.content) onChunk(parsed.message.content);
    });
  } else {
    await readSSE(response, (parsed) => {
      const text = adapter.extractChunk(parsed);
      if (text) onChunk(text);
    });
  }
}
