import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export function MAAnalysis({ maAnalysis, price }) {
  if (!maAnalysis || maAnalysis.length === 0) return null;

  return (
    <div className="glass-card rounded-2xl p-6">
      <h3 className="text-sm font-semibold text-[#e0e6ed] mb-4 uppercase tracking-wider">Moving Average Analysis</h3>
      <div className="space-y-3">
        {maAnalysis.map((ma, i) => (
          <div key={i} className="p-3 rounded-xl bg-[#0d1117]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-[#e0e6ed]">{ma.label}</span>
              <div className="flex items-center gap-2">
                {ma.value && (
                  <span className="text-xs mono text-[#8892a6]">${ma.value.toFixed(2)}</span>
                )}
                <span className={`flex items-center gap-0.5 text-xs font-medium px-2 py-0.5 rounded ${
                  ma.position === 'above' || ma.position === 'bullish'
                    ? 'bg-[#00ffc8]/10 text-[#00ffc8]'
                    : ma.position === 'below' || ma.position === 'bearish'
                    ? 'bg-[#ff4976]/10 text-[#ff4976]'
                    : 'bg-[#5a6478]/10 text-[#5a6478]'
                }`}>
                  {ma.position === 'above' || ma.position === 'bullish' ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : ma.position === 'below' || ma.position === 'bearish' ? (
                    <TrendingDown className="w-3 h-3" />
                  ) : (
                    <Minus className="w-3 h-3" />
                  )}
                  {ma.distance}
                </span>
              </div>
            </div>
            <div className="text-xs text-[#5a6478]">{ma.interpretation}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
