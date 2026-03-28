import { useState, useEffect } from 'react';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import { getHistory } from '../../api/tradier';
import { formatCurrency } from '../../utils/format';

export default function MiniChart({ symbol }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    if (!symbol) return;
    const end = new Date().toISOString().split('T')[0];
    const start = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
    getHistory(symbol, start, end)
      .then(days => setData(days.map(d => ({ date: d.date, close: d.close }))))
      .catch(() => setData([]));
  }, [symbol]);

  if (data.length === 0) {
    return <div className="skeleton h-16 w-full rounded-xl" />;
  }

  const first = data[0]?.close || 0;
  const last = data[data.length - 1]?.close || 0;
  const color = last >= first ? '#22c55e' : '#ef4444';

  return (
    <div className="bg-[#0d1117] rounded-xl border border-white/5 p-3">
      <div className="text-xs text-[#666] mb-1">30D Chart</div>
      <ResponsiveContainer width="100%" height={64}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id={`grad-${symbol}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Tooltip
            contentStyle={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: '#666' }}
            formatter={(v) => [formatCurrency(v), 'Close']}
          />
          <Area
            type="monotone"
            dataKey="close"
            stroke={color}
            strokeWidth={1.5}
            fill={`url(#grad-${symbol})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
