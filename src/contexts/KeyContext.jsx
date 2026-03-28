import { createContext, useContext } from 'react';
import { useAuth } from './AuthContext';

const KeyContext = createContext(null);

export function KeyProvider({ children }) {
  const { apiKeys } = useAuth();

  const value = {
    finnhubKey: apiKeys?.finnhubApiKey || '',
    twelveDataKey: apiKeys?.twelveDataApiKey || '',
    tradierKey: apiKeys?.tradierApiKey || '',
    newsApiKey: apiKeys?.newsApiKey || '',
    hasFinnhub: !!apiKeys?.finnhubApiKey,
    hasTwelveData: !!apiKeys?.twelveDataApiKey,
    hasTradier: !!apiKeys?.tradierApiKey,
    hasNewsAPI: !!apiKeys?.newsApiKey,
  };

  return <KeyContext.Provider value={value}>{children}</KeyContext.Provider>;
}

export function useKeys() {
  const ctx = useContext(KeyContext);
  if (!ctx) throw new Error('useKeys must be used within KeyProvider');
  return ctx;
}
