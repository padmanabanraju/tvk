import { useState, useEffect } from 'react';

export default function EarningsCountdown({ earnings, symbol }) {
  const [countdown, setCountdown] = useState(null);

  useEffect(() => {
    if (!Array.isArray(earnings) || earnings.length === 0) {
      setCountdown(null);
      return;
    }

    // Find the next future earnings date
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    // Earnings are sorted by period descending. Look for a future one
    // or estimate next based on last quarter + 90 days
    const lastEarnings = earnings[0];
    if (!lastEarnings?.period) {
      setCountdown(null);
      return;
    }

    // Estimate next earnings: last period + ~90 days
    const lastDate = new Date(lastEarnings.period);
    const nextEstimate = new Date(lastDate.getTime() + 90 * 86400000);

    // If the estimate is in the past, add another quarter
    const targetDate = nextEstimate > now ? nextEstimate : new Date(nextEstimate.getTime() + 90 * 86400000);

    const updateCountdown = () => {
      const diff = targetDate.getTime() - Date.now();
      if (diff <= 0) {
        setCountdown(null);
        return;
      }
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      setCountdown({ days, hours, date: targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) });
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 60000);
    return () => clearInterval(timer);
  }, [earnings]);

  if (!countdown) return null;

  return (
    <div className="flex items-center justify-between py-2 px-3 bg-[#f59e0b]/10 rounded-lg border border-[#f59e0b]/20">
      <div className="text-xs text-[#f59e0b]">
        Est. Earnings ~{countdown.date}
      </div>
      <div className="font-mono text-sm text-[#f59e0b] font-bold">
        {countdown.days}d {countdown.hours}h
      </div>
    </div>
  );
}
