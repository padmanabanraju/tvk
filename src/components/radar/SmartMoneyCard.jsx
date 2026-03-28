import { useState } from 'react';
import { formatCurrency, formatLargeNumber, timeAgo } from '../../utils/format';

export default function SmartMoneyCard({ insiderSentiment, insiderTransactions, institutional, congressional }) {
  const [open, setOpen] = useState(true);

  const mspr = insiderSentiment?.data?.[insiderSentiment.data.length - 1];
  const msprColor = mspr?.mspr > 0 ? '#22c55e' : mspr?.mspr < 0 ? '#ef4444' : '#666';

  const recentInsider = insiderTransactions?.data?.slice(0, 3) || [];
  const congTrades = congressional?.data?.slice(0, 3) || [];

  return (
    <div className="bg-[#0d1117] rounded-xl border border-white/5 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <span className="font-bold text-white">SMART MONEY SIGNALS</span>
        <span className="text-[#666] text-sm">{open ? '▼' : '▶'}</span>
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-4">
          {/* Insider MSPR */}
          <div>
            <div className="text-xs text-[#666] mb-1">Insider Sentiment (MSPR)</div>
            {mspr ? (
              <div className="flex items-center gap-2">
                <span className="font-mono text-lg font-bold" style={{ color: msprColor }}>
                  {mspr.mspr > 0 ? '+' : ''}{mspr.mspr.toFixed(1)}
                </span>
                <span className="text-xs" style={{ color: msprColor }}>
                  {mspr.mspr > 20 ? 'Strong Buying' : mspr.mspr > 0 ? 'Buying' : mspr.mspr < -20 ? 'Strong Selling' : mspr.mspr < 0 ? 'Selling' : 'Neutral'}
                </span>
              </div>
            ) : (
              <span className="text-[#666] text-sm">Unavailable</span>
            )}
          </div>

          {/* Recent Insider Transactions */}
          {recentInsider.length > 0 && (
            <div>
              <div className="text-xs text-[#666] mb-1">Recent Insider Activity</div>
              {recentInsider.map((tx, i) => (
                <div key={i} className="text-xs py-1 border-b border-white/5 flex justify-between">
                  <span className="text-[#d0d0dd] truncate max-w-[180px]">{tx.name}</span>
                  <span className={tx.change > 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}>
                    {tx.change > 0 ? '+' : ''}{formatLargeNumber(tx.change)} shr
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Congressional Trading */}
          {congTrades.length > 0 && (
            <div>
              <div className="text-xs text-[#666] mb-1">Congressional Trades</div>
              {congTrades.map((tx, i) => (
                <div key={i} className="text-xs py-1 border-b border-white/5 flex justify-between">
                  <span className="text-[#d0d0dd]">{tx.transactionType}</span>
                  <span className="text-[#d0d0dd] font-mono">{tx.amount}</span>
                </div>
              ))}
            </div>
          )}

          {congTrades.length === 0 && recentInsider.length === 0 && !mspr && (
            <p className="text-[#666] text-sm">No smart money data available</p>
          )}
        </div>
      )}
    </div>
  );
}
