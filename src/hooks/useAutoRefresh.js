import { useEffect, useRef } from 'react';

export function useAutoRefresh(callback, intervalMs = 15000, enabled = true) {
  const savedCallback = useRef(callback);
  const intervalRef = useRef(null);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) return;

    intervalRef.current = setInterval(() => {
      savedCallback.current();
    }, intervalMs);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [intervalMs, enabled]);

  return {
    stop: () => { if (intervalRef.current) clearInterval(intervalRef.current); },
  };
}
