import { Shield, TrendingUp, TrendingDown, Minus, Activity, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

function StrategyCard({ strategy, defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const directionColor = strategy.direction.includes('Bullish') ? '#00ffc8'
    : strategy.direction.includes('Bearish') ? '#ff4976'
    : strategy.direction.includes('Neutral') ? '#ffd700'
    : '#9d4edd';

  const typeColors = {
    directional: { bg: 'bg-[#00ffc8]/5', border: 'border-[#00ffc8]/20' },
    income: { bg: 'bg-[#9d4edd]/5', border: 'border-[#9d4edd]/20' },
    hedge: { bg: 'bg-[#ffd700]/5', border: 'border-[#ffd700]/20' },
  };
  const colors = typeColors[strategy.type] || typeColors.directional;

  return (
    <div className={`rounded-xl border ${colors.border} ${colors.bg} overflow-hidden`}>
      {/* Header — always visible */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className={`text-sm font-bold text-[#e0e6ed]`}>{strategy.name}</span>
          <span className="text-[10px] px-2 py-0.5 rounded font-medium" style={{ background: `${directionColor}15`, color: directionColor }}>
            {strategy.direction}
          </span>
          {strategy.confidence && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded ${
              strategy.confidence === 'High' ? 'bg-[#00ffc8]/10 text-[#00ffc8]' :
              strategy.confidence === 'Low' ? 'bg-[#ff4976]/10 text-[#ff4976]' :
              'bg-[#5a6478]/10 text-[#5a6478]'
            }`}>
              {strategy.confidence} Conf.
            </span>
          )}
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-[#5a6478]" /> : <ChevronDown className="w-4 h-4 text-[#5a6478]" />}
      </button>

      {/* Expanded details */}
      {isOpen && (
        <div className="px-4 pb-4 space-y-3">
          {/* Legs table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-[#5a6478]">
                  <th className="text-left pb-1.5 font-medium">Action</th>
                  <th className="text-left pb-1.5 font-medium">Type</th>
                  <th className="text-right pb-1.5 font-medium">Strike</th>
                  <th className="text-right pb-1.5 font-medium">Expiry</th>
                  <th className="text-right pb-1.5 font-medium">Est. Premium</th>
                </tr>
              </thead>
              <tbody>
                {strategy.legs.map((leg, i) => (
                  <tr key={i} className="border-t border-[#1a1f2b]/50">
                    <td className="py-1.5">
                      <span className={`text-xs font-bold ${
                        leg.action === 'BUY' ? 'text-[#00ffc8]' : leg.action === 'SELL' ? 'text-[#ff4976]' : 'text-[#8892a6]'
                      }`}>{leg.action}</span>
                    </td>
                    <td className="py-1.5 text-[#e0e6ed]">{leg.type}</td>
                    <td className="py-1.5 text-right mono text-[#e0e6ed]">{leg.strike}</td>
                    <td className="py-1.5 text-right text-[#8892a6]">{leg.expiry}</td>
                    <td className="py-1.5 text-right mono text-[#ffd700]">{leg.premium}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* P/L details */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="p-2 rounded-lg bg-[#0a0e14]/50">
              <div className="text-[#5a6478] mb-0.5">Max Profit</div>
              <div className="text-[#00ffc8] font-medium">{strategy.maxProfit}</div>
            </div>
            <div className="p-2 rounded-lg bg-[#0a0e14]/50">
              <div className="text-[#5a6478] mb-0.5">Max Loss</div>
              <div className="text-[#ff4976] font-medium">{strategy.maxLoss}</div>
            </div>
            <div className="p-2 rounded-lg bg-[#0a0e14]/50">
              <div className="text-[#5a6478] mb-0.5">Breakeven</div>
              <div className="text-[#e0e6ed] mono font-medium">{strategy.breakeven}</div>
            </div>
          </div>

          {/* Reasoning */}
          <div className="text-xs text-[#8892a6] leading-relaxed">
            {strategy.reasoning}
          </div>
        </div>
      )}
    </div>
  );
}

export function OptionsStrategy({ optionsStrategies, optionsInsight }) {
  if (!optionsStrategies) return null;

  const { strategies = [], volatilitySummary } = optionsStrategies;
  if (!strategies || strategies.length === 0) return null;

  return (
    <div className="glass-card rounded-2xl p-6">
      <h3 className="text-sm font-semibold text-[#e0e6ed] mb-1 uppercase tracking-wider flex items-center gap-2">
        <Shield className="w-4 h-4 text-[#ff6b35]" /> Options Strategies
      </h3>
      <p className="text-xs text-[#5a6478] mb-4">Algorithmic strategy recommendations based on current technicals and volatility</p>

      {/* Volatility Summary */}
      {volatilitySummary && (
        <div className="mb-4 p-3 rounded-xl bg-[#0d1117] border border-[#1a1f2b]">
          <div className="flex items-center gap-4 mb-2">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#ff6b35]" />
              <span className="text-xs text-[#5a6478]">Est. Implied Volatility:</span>
              <span className={`text-sm font-bold mono ${
                volatilitySummary.ivLevel === 'High' ? 'text-[#ff4976]' :
                volatilitySummary.ivLevel === 'Low' ? 'text-[#00ffc8]' : 'text-[#ffd700]'
              }`}>
                ~{volatilitySummary.ivEstimate}% ({volatilitySummary.ivLevel})
              </span>
            </div>
            {volatilitySummary.bbWidth !== null && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-[#5a6478]">BB Width:</span>
                <span className="text-xs mono text-[#8892a6]">{volatilitySummary.bbWidth}%</span>
                {volatilitySummary.isSqueeze && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#ffd700]/10 text-[#ffd700] font-medium">SQUEEZE</span>
                )}
              </div>
            )}
          </div>
          <div className="text-xs text-[#8892a6]">{volatilitySummary.recommendation}</div>
        </div>
      )}

      {/* Strategy Cards */}
      <div className="space-y-2">
        {strategies.map((s, i) => (
          <StrategyCard key={i} strategy={s} defaultOpen={i === 0} />
        ))}
      </div>

      {/* General Options Insights */}
      {optionsInsight && optionsInsight.length > 0 && (
        <div className="mt-4 pt-4 border-t border-[#1a1f2b]">
          <div className="text-xs text-[#5a6478] uppercase tracking-wider mb-2">Additional Insights</div>
          <div className="space-y-1.5">
            {optionsInsight.map((insight, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-[#8892a6]">
                <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                  insight.type === 'bullish' ? 'bg-[#00ffc8]' :
                  insight.type === 'bearish' ? 'bg-[#ff4976]' :
                  insight.type === 'warning' ? 'bg-[#ffd700]' : 'bg-[#9d4edd]'
                }`} />
                <span>{insight.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="flex items-start gap-2 p-3 bg-[#ffd700]/5 rounded-lg border border-[#ffd700]/10 mt-4">
        <AlertTriangle className="w-3.5 h-3.5 text-[#ffd700] shrink-0 mt-0.5" />
        <span className="text-[10px] text-[#5a6478]">
          Options involve risk and are not suitable for all investors. Premium estimates are approximations.
          Always verify with your broker's actual options chain before trading.
        </span>
      </div>
    </div>
  );
}
