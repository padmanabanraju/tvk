import { useState } from 'react';
import { formatCurrency, formatPercent } from '../../utils/format';

export default function AnalystCard({ recommendations, priceTarget, upgradeDowngrade, currentPrice }) {
  const [open, setOpen] = useState(true);
  const latest = recommendations?.[0];
  const recentUpgrades = upgradeDowngrade?.slice?.(0, 3) || [];

  const total = latest ? (latest.strongBuy + latest.buy + latest.hold + latest.sell + latest.strongSell) : 0;

  const upside = priceTarget?.targetMean && currentPrice
    ? ((priceTarget.targetMean - currentPrice) / currentPrice * 100)
    : null;
  const upsideColor = upside > 0 ? '#22c55e' : upside < 0 ? '#ef4444' : '#666';

  return (
    <div className="bg-[#0d1117] rounded-xl border border-white/5 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <span className="font-bold text-white">ANALYST RATINGS</span>
        <span className="text-[#666] text-sm">{open ? '▼' : '▶'}</span>
      </button>
      {open && (
        <div className="px-4 pb-4">
          {recommendations === null ? (
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-5 w-full" />)}
            </div>
          ) : !latest ? (
            <p className="text-[#666] text-sm">No analyst data available for this ticker</p>
          ) : (
            <>
              {/* Recommendation bar */}
              <div className="mb-3">
                <div className="flex gap-0.5 h-6 rounded overflow-hidden mb-1">
                  {latest.strongBuy > 0 && <div className="bg-[#22c55e]" style={{ flex: latest.strongBuy }} />}
                  {latest.buy > 0 && <div className="bg-[#22c55e]/60" style={{ flex: latest.buy }} />}
                  {latest.hold > 0 && <div className="bg-[#f59e0b]" style={{ flex: latest.hold }} />}
                  {latest.sell > 0 && <div className="bg-[#ef4444]/60" style={{ flex: latest.sell }} />}
                  {latest.strongSell > 0 && <div className="bg-[#ef4444]" style={{ flex: latest.strongSell }} />}
                </div>
                <div className="flex justify-between text-xs text-[#666]">
                  <span>SB:{latest.strongBuy} B:{latest.buy}</span>
                  <span>H:{latest.hold}</span>
                  <span>S:{latest.sell} SS:{latest.strongSell}</span>
                </div>
              </div>

              {/* Price Target */}
              {priceTarget && (
                <div className="py-2 border-b border-white/5">
                  <div className="flex justify-between">
                    <span className="text-sm text-[#666]">Target</span>
                    <div className="text-right">
                      <span className="font-mono text-sm text-[#d0d0dd]">{formatCurrency(priceTarget.targetMean)}</span>
                      {upside != null && (
                        <span className="text-xs ml-2" style={{ color: upsideColor }}>
                          ({upside > 0 ? '+' : ''}{formatPercent(upside)})
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-[#666] mt-1">
                    <span>Low: {formatCurrency(priceTarget.targetLow)}</span>
                    <span>High: {formatCurrency(priceTarget.targetHigh)}</span>
                  </div>
                </div>
              )}

              {/* Recent Upgrades/Downgrades */}
              {recentUpgrades.length > 0 && (
                <div className="mt-2">
                  {recentUpgrades.map((ud, i) => (
                    <div key={i} className="text-xs py-1 flex justify-between border-b border-white/5">
                      <span className="text-[#d0d0dd]">{ud.company}</span>
                      <span className={ud.action === 'upgrade' ? 'text-[#22c55e]' : ud.action === 'downgrade' ? 'text-[#ef4444]' : 'text-[#d0d0dd]'}>
                        {ud.toGrade}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
