import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceLine, Cell } from 'recharts';
import { formatCurrency, formatLargeNumber } from '../../utils/format';

export default function GEXCard({ gex, spotPrice }) {
  const [open, setOpen] = useState(true);

  const chartData = useMemo(() => {
    if (!gex?.gexByStrike) return [];
    return Object.entries(gex.gexByStrike)
      .map(([strike, value]) => ({ strike: Number(strike), gex: value }))
      .filter(d => spotPrice ? Math.abs(d.strike - spotPrice) / spotPrice < 0.15 : true)
      .sort((a, b) => a.strike - b.strike);
  }, [gex, spotPrice]);

  const regimeColor = gex?.regime === 'POSITIVE' ? '#22c55e' : '#ef4444';

  return (
    <div className="bg-[#0d1117] rounded-xl border border-white/5 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <span className="font-bold text-white">GAMMA EXPOSURE (GEX)</span>
        <span className="text-[#666] text-sm">{open ? '▼' : '▶'}</span>
      </button>
      {open && (
        <div className="px-4 pb-4">
          {!gex ? (
            <div className="skeleton h-40 w-full" />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="text-center py-2 rounded-lg" style={{ backgroundColor: regimeColor + '15' }}>
                  <div className="text-xs text-[#666]">Net GEX</div>
                  <div className="font-bold font-mono" style={{ color: regimeColor }}>{gex.regime}</div>
                </div>
                <div className="text-center py-2 rounded-lg bg-white/5">
                  <div className="text-xs text-[#666]">Gamma Flip</div>
                  <div className="font-bold font-mono text-[#d0d0dd]">{formatCurrency(gex.gammaFlip, 0)}</div>
                </div>
              </div>
              <div className="text-xs text-[#666] mb-2 text-center">{gex.implication}</div>
              {chartData.length > 0 && (
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={chartData}>
                    <XAxis dataKey="strike" tick={{ fill: '#666', fontSize: 10 }} tickFormatter={v => '$' + v} />
                    <YAxis tick={{ fill: '#666', fontSize: 10 }} tickFormatter={formatLargeNumber} />
                    <Tooltip
                      contentStyle={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }}
                      formatter={(v) => [formatLargeNumber(v), 'GEX']}
                      labelFormatter={(v) => `Strike: $${v}`}
                    />
                    <Bar dataKey="gex">
                      {chartData.map((entry, i) => (
                        <Cell key={i} fill={entry.gex > 0 ? '#22c55e' : '#ef4444'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
