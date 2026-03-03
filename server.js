// TVK Production Server
// Serves the built frontend and proxies AI API calls (Claude, OpenAI, Gemini, Ollama)
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '1mb' }));

// Serve static frontend build
app.use(express.static(path.join(__dirname, 'dist')));

// ── Shared helpers ──────────────────────────────────────────────

function streamPassthrough(upstreamResponse, res, contentType = 'text/event-stream') {
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

// ── Claude (Anthropic) ──────────────────────────────────────────

async function handleClaude(req, res) {
  const { apiKey, stream, ...payload } = req.body;
  if (!apiKey) return res.status(400).json({ error: 'Missing apiKey' });

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

    if (stream) {
      streamPassthrough(response, res);
    } else {
      const data = await response.json();
      res.status(response.status).json(data);
    }
  } catch (err) {
    console.error('[TVK] Claude proxy error:', err.message);
    res.status(502).json({ error: 'Failed to reach Claude API', details: err.message });
  }
}

app.post('/api/ai/claude', handleClaude);
app.post('/api/claude', handleClaude); // legacy route

// ── OpenAI ──────────────────────────────────────────────────────

app.post('/api/ai/openai', async (req, res) => {
  const { apiKey, stream, ...payload } = req.body;
  if (!apiKey) return res.status(400).json({ error: 'Missing apiKey' });

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ ...payload, stream: stream || false }),
    });

    if (stream) {
      streamPassthrough(response, res);
    } else {
      const data = await response.json();
      res.status(response.status).json(data);
    }
  } catch (err) {
    console.error('[TVK] OpenAI proxy error:', err.message);
    res.status(502).json({ error: 'Failed to reach OpenAI API', details: err.message });
  }
});

// ── Google Gemini ───────────────────────────────────────────────

app.post('/api/ai/gemini', async (req, res) => {
  const { apiKey, stream, model, ...payload } = req.body;
  if (!apiKey) return res.status(400).json({ error: 'Missing apiKey' });

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

    if (stream) {
      streamPassthrough(response, res);
    } else {
      const data = await response.json();
      res.status(response.status).json(data);
    }
  } catch (err) {
    console.error('[TVK] Gemini proxy error:', err.message);
    res.status(502).json({ error: 'Failed to reach Gemini API', details: err.message });
  }
});

// ── Ollama (local) ──────────────────────────────────────────────

app.post('/api/ai/ollama', async (req, res) => {
  const { baseUrl, ...payload } = req.body;
  const ollamaUrl = (baseUrl || 'http://localhost:11434') + '/api/chat';

  try {
    const response = await fetch(ollamaUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (payload.stream) {
      streamPassthrough(response, res, 'application/x-ndjson');
    } else {
      const data = await response.json();
      res.status(response.status).json(data);
    }
  } catch (err) {
    console.error('[TVK] Ollama proxy error:', err.message);
    res.status(502).json({ error: 'Failed to reach Ollama. Is it running?', details: err.message });
  }
});

// Ollama model list (for setup wizard test connection)
app.get('/api/ai/ollama-tags', async (req, res) => {
  const baseUrl = req.query.baseUrl || 'http://localhost:11434';
  try {
    const response = await fetch(`${baseUrl}/api/tags`);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: 'Cannot connect to Ollama', details: err.message });
  }
});

// ── Yahoo Finance proxy (candle data fallback) ──────────────────

app.get('/api/yahoo/chart/:symbol', async (req, res) => {
  const { symbol } = req.params;
  const range = req.query.range || '1y';
  const interval = req.query.interval || '1d';
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}&includePrePost=false`;

  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error('[TVK] Yahoo proxy error:', err.message);
    res.status(502).json({ error: 'Failed to reach Yahoo Finance', details: err.message });
  }
});

// ── SPA fallback ────────────────────────────────────────────────

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n  TVK server running at http://localhost:${PORT}\n`);
});
