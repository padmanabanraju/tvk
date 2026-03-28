import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { encrypt, decrypt, saveEncryptedKeys, loadEncryptedKeys, clearKeys, hasStoredKeys } from '../services/keyVault';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Three states: 'firstTime' | 'locked' | 'unlocked'
  const [authState, setAuthState] = useState(() =>
    hasStoredKeys() ? 'locked' : 'firstTime'
  );
  const [apiKeys, setApiKeys] = useState(null);
  const [error, setError] = useState(null);

  // First-time setup: encrypt and store keys
  const setupKeys = useCallback(async (keysObject, masterPassword) => {
    try {
      setError(null);
      const encrypted = await encrypt(keysObject, masterPassword);
      saveEncryptedKeys(encrypted);
      setApiKeys(keysObject);
      setAuthState('unlocked');
    } catch (err) {
      setError('Failed to encrypt keys. Please try again.');
      throw err;
    }
  }, []);

  // Unlock: decrypt existing keys with master password
  const unlock = useCallback(async (masterPassword) => {
    try {
      setError(null);
      const payload = loadEncryptedKeys();
      if (!payload) {
        setError('No stored keys found. Please set up again.');
        setAuthState('firstTime');
        return;
      }
      let keysObject = await decrypt(payload, masterPassword);

      // Migrate old schema { finnhubApiKey, anthropicApiKey } → new multi-provider schema
      if (!keysObject.aiProvider && keysObject.aiProvider !== '') {
        keysObject = {
          ...keysObject,
          aiProvider: keysObject.anthropicApiKey ? 'claude' : '',
          openaiApiKey: keysObject.openaiApiKey || '',
          geminiApiKey: keysObject.geminiApiKey || '',
          ollamaModel: keysObject.ollamaModel || '',
          ollamaBaseUrl: keysObject.ollamaBaseUrl || 'http://localhost:11434',
        };
        // Re-encrypt with new schema so migration is one-time
        const encrypted = await encrypt(keysObject, masterPassword);
        saveEncryptedKeys(encrypted);
      }

      // Migrate: add trading API keys if missing
      if (keysObject.twelveDataApiKey === undefined) {
        keysObject = {
          ...keysObject,
          twelveDataApiKey: '',
          tradierApiKey: '',
          newsApiKey: '',
        };
        const encrypted = await encrypt(keysObject, masterPassword);
        saveEncryptedKeys(encrypted);
      }

      setApiKeys(keysObject);
      setAuthState('unlocked');
    } catch (err) {
      // AES-GCM auth tag mismatch = wrong password
      setError('Wrong password. Please try again.');
    }
  }, []);

  // Lock: clear in-memory keys
  const lock = useCallback(() => {
    setApiKeys(null);
    setError(null);
    setAuthState('locked');
  }, []);

  // Reset: clear everything, back to first-time
  const resetKeys = useCallback(() => {
    clearKeys();
    setApiKeys(null);
    setError(null);
    setAuthState('firstTime');
  }, []);

  const value = {
    isFirstTime: authState === 'firstTime',
    isLocked: authState === 'locked',
    isUnlocked: authState === 'unlocked',
    apiKeys,
    error,
    setupKeys,
    unlock,
    lock,
    resetKeys,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
