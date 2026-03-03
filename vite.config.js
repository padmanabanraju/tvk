import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ── Shared helpers for dev proxy ────────────────────────────────

function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      try { resolve(JSON.parse(body)); }
      catch { resolve(null); }
    });
  });
}

function sendError(res, status, message) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ error: message }));
}

async function proxyStream(upstreamResponse, res, contentType = 'text/event-stream') {
  res.setHeader('Content-Type', contentType);
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  const reader = upstreamResponse.body.getReader();
  const decoder = new TextDecoder();
  const pump = async () => {
    while (true) {
      const { done, value } = await reader.read();
      if (done) { res.end(); return; }
      res.write(decoder.decode(value, { stream: true }));
    }
  };
  pump().catch(() => res.end());
}

async function proxyJSON(upstreamResponse, res) {
  const data = await upstreamResponse.json();
  res.statusCode = upstreamResponse.status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

// ── AI proxy plugin (all four providers) ────────────────────────

function aiProxyPlugin() {
  return {
    name: 'ai-proxy',
    configureServer(server) {

      // Claude handler (shared by /api/ai/claude and legacy /api/claude)
      async function handleClaude(req, res) {
        if (req.method !== 'POST') return sendError(res, 405, 'Method not allowed');
        const parsed = await parseBody(req);
        if (!parsed) return sendError(res, 400, 'Invalid JSON');
        const { apiKey, stream, ...payload } = parsed;
        if (!apiKey) return sendError(res, 400, 'Missing apiKey');

        try {
          const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': apiKey,
              'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({ ...payload, stream: stream || false }),
          });
          stream ? await proxyStream(response, res) : await proxyJSON(response, res);
        } catch (err) {
          sendError(res, 502, `Failed to reach Claude API: ${err.message}`);
        }
      }

      server.middlewares.use('/api/ai/claude', handleClaude);
      server.middlewares.use('/api/claude', handleClaude); // legacy

      // OpenAI
      server.middlewares.use('/api/ai/openai', async (req, res) => {
        if (req.method !== 'POST') return sendError(res, 405, 'Method not allowed');
        const parsed = await parseBody(req);
        if (!parsed) return sendError(res, 400, 'Invalid JSON');
        const { apiKey, stream, ...payload } = parsed;
        if (!apiKey) return sendError(res, 400, 'Missing apiKey');

        try {
          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({ ...payload, stream: stream || false }),
          });
          stream ? await proxyStream(response, res) : await proxyJSON(response, res);
        } catch (err) {
          sendError(res, 502, `Failed to reach OpenAI API: ${err.message}`);
        }
      });

      // Gemini
      server.middlewares.use('/api/ai/gemini', async (req, res) => {
        if (req.method !== 'POST') return sendError(res, 405, 'Method not allowed');
        const parsed = await parseBody(req);
        if (!parsed) return sendError(res, 400, 'Invalid JSON');
        const { apiKey, stream, model, ...payload } = parsed;
        if (!apiKey) return sendError(res, 400, 'Missing apiKey');

        const modelId = model || 'gemini-2.0-flash';
        const action = stream ? 'streamGenerateContent' : 'generateContent';
        const suffix = stream ? '?alt=sse' : '';
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:${action}${suffix}`;

        try {
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-goog-api-key': apiKey,
            },
            body: JSON.stringify(payload),
          });
          stream ? await proxyStream(response, res) : await proxyJSON(response, res);
        } catch (err) {
          sendError(res, 502, `Failed to reach Gemini API: ${err.message}`);
        }
      });

      // Ollama
      server.middlewares.use('/api/ai/ollama', async (req, res) => {
        if (req.method !== 'POST') return sendError(res, 405, 'Method not allowed');
        const parsed = await parseBody(req);
        if (!parsed) return sendError(res, 400, 'Invalid JSON');
        const { baseUrl, ...payload } = parsed;
        const ollamaUrl = (baseUrl || 'http://localhost:11434') + '/api/chat';

        try {
          const response = await fetch(ollamaUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          payload.stream
            ? await proxyStream(response, res, 'application/x-ndjson')
            : await proxyJSON(response, res);
        } catch (err) {
          sendError(res, 502, `Failed to reach Ollama: ${err.message}`);
        }
      });

      // Yahoo Finance proxy (candle data fallback)
      server.middlewares.use('/api/yahoo/chart/', async (req, res) => {
        if (req.method !== 'GET') return sendError(res, 405, 'Method not allowed');
        const symbol = req.url.split('?')[0].replace(/^\//, '');
        const url = new URL(req.url, 'http://localhost');
        const range = url.searchParams.get('range') || '1y';
        const interval = url.searchParams.get('interval') || '1d';
        const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}&includePrePost=false`;

        try {
          const response = await fetch(yahooUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
          });
          const data = await response.json();
          res.statusCode = response.status;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(data));
        } catch (err) {
          sendError(res, 502, `Failed to reach Yahoo Finance: ${err.message}`);
        }
      });

      // Ollama model list
      server.middlewares.use('/api/ai/ollama-tags', async (req, res) => {
        if (req.method !== 'GET') return sendError(res, 405, 'Method not allowed');
        const url = new URL(req.url, 'http://localhost');
        const baseUrl = url.searchParams.get('baseUrl') || 'http://localhost:11434';
        try {
          const response = await fetch(`${baseUrl}/api/tags`);
          const data = await response.json();
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(data));
        } catch (err) {
          sendError(res, 502, `Cannot connect to Ollama: ${err.message}`);
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), aiProxyPlugin()],
  server: {
    port: 3000,
    open: true
  }
})
