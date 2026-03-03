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

const CHAT_SYSTEM = `You are TVK's AI assistant — a knowledgeable, concise stock market analyst.
You can answer questions about stocks, trading strategies, technical analysis, options, and market concepts.
Be direct, use data when available, and keep responses focused.
If the user asks to analyze a specific ticker, tell them to use the Analysis tab for full charts and data.
Format important numbers and tickers in bold using **bold** syntax.`;

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
    if (ind.signal) indicators.push(`Signal: ${ind.signal}`);
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

export async function streamChat(messages, stockContext, aiConfig, onChunk) {
  const systemPrompt = stockContext
    ? `${CHAT_SYSTEM}\n\nCurrent stock context:\n${formatStockContext(stockContext)}`
    : CHAT_SYSTEM;

  const adapter = ADAPTERS[aiConfig.provider];
  const model = aiConfig.provider === 'ollama' ? aiConfig.ollamaModel : aiConfig.model;

  const requestBody = adapter.buildRequest(
    systemPrompt,
    messages.map(m => ({ role: m.role, content: m.content })),
    model,
    1024,
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
