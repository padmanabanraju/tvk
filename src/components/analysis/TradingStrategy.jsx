import { Zap, TrendingUp, TrendingDown, Shield, DollarSign } from 'lucide-react';

export function TradingStrategy({ strategies, investmentThesis, optionsInsight }) {
  return (
    <div className="space-y-6">
      {/* Trading Setups */}
      {strategies && strategies.length > 0 && (
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-[#e0e6ed] mb-4 uppercase tracking-wider flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#ffd700]" /> Trading Setups
          </h3>
          <div className="space-y-4">
            {strategies.map((s, i) => (
              <div key={i} className="p-4 rounded-xl bg-[#0d1117] border border-[#1a1f2b]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-[#e0e6ed]">{s.type}</span>
                  <span className={`text-xs px-2 py-0.5 rounded font-bold ${
                    s.direction === 'Long' ? 'bg-[#00ffc8]/10 text-[#00ffc8]' : 'bg-[#ff4976]/10 text-[#ff4976]'
                  }`}>
                    {s.direction}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                  <div>
                    <span className="text-[#5a6478]">Entry: </span>
                    <span className="mono text-[#e0e6ed] font-medium">${typeof s.entry === 'number' ? s.entry : s.entry}</span>
                  </div>
                  <div>
                    <span className="text-[#5a6478]">Stop Loss: </span>
                    <span className="mono text-[#ff4976] font-medium">${s.stopLoss}</span>
                  </div>
                  <div>
                    <span className="text-[#5a6478]">Target 1: </span>
                    <span className="mono text-[#00ffc8] font-medium">${s.target1}</span>
                  </div>
                  {s.target2 && (
                    <div>
                      <span className="text-[#5a6478]">Target 2: </span>
                      <span className="mono text-[#00ffc8] font-medium">${s.target2}</span>
                    </div>
                  )}
                </div>
                {s.riskReward && (
                  <div className="text-xs text-[#9d4edd] mb-1">Risk/Reward: {s.riskReward}:1</div>
                )}
                <div className="text-xs text-[#5a6478] mt-1">{s.reasoning}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Investment Thesis */}
      {investmentThesis && (
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-[#e0e6ed] mb-4 uppercase tracking-wider flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-[#00ffc8]" /> Investment Thesis
          </h3>

          {/* Recommendation Badge */}
          <div className="flex items-center gap-3 mb-4">
            <span className={`text-lg font-bold px-4 py-2 rounded-xl ${
              investmentThesis.recommendation.includes('Buy') ? 'bg-[#00ffc8]/10 text-[#00ffc8]' :
              investmentThesis.recommendation.includes('Sell') || investmentThesis.recommendation === 'Reduce' ? 'bg-[#ff4976]/10 text-[#ff4976]' :
              'bg-[#ffd700]/10 text-[#ffd700]'
            }`}>
              {investmentThesis.recommendation}
            </span>
            <span className="text-xs text-[#5a6478]">Confidence: {investmentThesis.confidence}</span>
          </div>

          {/* Reasons */}
          {investmentThesis.reasons.length > 0 && (
            <div className="mb-3">
              <div className="text-xs text-[#5a6478] mb-1.5">Bullish Factors</div>
              {investmentThesis.reasons.map((r, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-[#8892a6] py-0.5">
                  <TrendingUp className="w-3.5 h-3.5 text-[#00ffc8] shrink-0" />
                  <span>{r}</span>
                </div>
              ))}
            </div>
          )}

          {/* Risks */}
          {investmentThesis.risks.length > 0 && (
            <div className="mb-3">
              <div className="text-xs text-[#5a6478] mb-1.5">Risk Factors</div>
              {investmentThesis.risks.map((r, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-[#8892a6] py-0.5">
                  <TrendingDown className="w-3.5 h-3.5 text-[#ff4976] shrink-0" />
                  <span>{r}</span>
                </div>
              ))}
            </div>
          )}

          {/* LEAP Advice */}
          {investmentThesis.leapThesis && (
            <div className="mt-4 p-3 rounded-xl bg-[#9d4edd]/5 border border-[#9d4edd]/20">
              <div className="text-xs font-semibold text-[#9d4edd] mb-1.5 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" /> LEAP Options Strategy
              </div>
              <div className="text-sm font-medium text-[#e0e6ed] mb-1">{investmentThesis.leapThesis.recommendation}</div>
              {investmentThesis.leapThesis.strike && (
                <div className="text-xs text-[#8892a6]">
                  Strike: {investmentThesis.leapThesis.strike} | Expiry: {investmentThesis.leapThesis.expiry}
                </div>
              )}
              <div className="text-xs text-[#5a6478] mt-1">{investmentThesis.leapThesis.reasoning}</div>
              {investmentThesis.leapThesis.caution && (
                <div className="text-[10px] text-[#ffd700] mt-1">{investmentThesis.leapThesis.caution}</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Options strategies are now in the dedicated OptionsStrategy panel */}
    </div>
  );
}
