import { useState, useEffect } from 'react';
import { getMarketClock } from '../../api/tradier';

export default function MarketStatus() {
  const [status, setStatus] = useState(null);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    getMarketClock().then(setStatus).catch(() => {});
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const stateColors = {
    open: '#22c55e',
    closed: '#ef4444',
    premarket: '#f59e0b',
    postmarket: '#f59e0b',
  };

  const state = status?.state || 'unknown';
  const color = stateColors[state] || '#666';

  return (
    <div className="flex items-center gap-2 text-sm text-[#666]">
      <span
        className="w-2 h-2 rounded-full animate-pulse"
        style={{ backgroundColor: color }}
      />
      <span style={{ color }}>
        Market {state.charAt(0).toUpperCase() + state.slice(1)}
      </span>
      <span>|</span>
      <span className="font-mono">
        {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
      </span>
    </div>
  );
}
