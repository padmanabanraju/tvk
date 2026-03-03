import { useState, useCallback, useRef } from 'react';
import { streamChat, buildAiConfig, hasAiKey } from '../services/aiClient';
import { useAuth } from '../contexts/AuthContext';

export function useAIChat() {
  const { apiKeys } = useAuth();
  const [streaming, setStreaming] = useState(false);
  const abortRef = useRef(false);

  const hasAI = hasAiKey(apiKeys);

  const sendMessage = useCallback(async (messages, stockContext, onChunk) => {
    if (!hasAiKey(apiKeys)) return;
    abortRef.current = false;
    setStreaming(true);

    try {
      const aiConfig = buildAiConfig(apiKeys);
      await streamChat(
        messages,
        stockContext,
        aiConfig,
        (chunk) => {
          if (!abortRef.current) onChunk(chunk);
        }
      );
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
