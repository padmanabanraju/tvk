import { Brain, TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle, Info } from 'lucide-react';

function SignalIcon({ type }) {
  if (type === 'bullish') return <TrendingUp className="w-3.5 h-3.5 text-[#00ffc8] shrink-0" />;
  if (type === 'bearish') return <TrendingDown className="w-3.5 h-3.5 text-[#ff4976] shrink-0" />;
  if (type === 'warning') return <AlertTriangle className="w-3.5 h-3.5 text-[#ffd700] shrink-0" />;
  if (type === 'info') return <Info className="w-3.5 h-3.5 text-[#9d4edd] shrink-0" />;
  return <Minus className="w-3.5 h-3.5 text-[#5a6478] shrink-0" />;
}

function SignalBadge({ type }) {
  const colors = {
    bullish: 'bg-[#00ffc8]/10 text-[#00ffc8]',
    bearish: 'bg-[#ff4976]/10 text-[#ff4976]',
    warning: 'bg-[#ffd700]/10 text-[#ffd700]',
    neutral: 'bg-[#5a6478]/10 text-[#5a6478]',
    info: 'bg-[#9d4edd]/10 text-[#9d4edd]',
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded font-medium ${colors[type] || colors.neutral}`}>
      {type}
    </span>
  );
}

export function AIInsights({ analysis }) {
  if (!analysis) return null;

  const { trend, momentum, valuation, newsSentiment, riskAssessment } = analysis;

  return (
    <div className="glass-card rounded-2xl p-6">
      <h3 className="text-sm font-semibold text-[#e0e6ed] mb-4 uppercase tracking-wider flex items-center gap-2">
        <Brain className="w-4 h-4 text-[#9d4edd]" /> AI Analysis
      </h3>

      {/* Trend Summary */}
      {trend && (
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-[#5a6478] uppercase tracking-wider">Trend</span>
            <span className={`text-sm font-bold ${
              trend.trend.includes('Up') ? 'text-[#00ffc8]' :
              trend.trend.includes('Down') ? 'text-[#ff4976]' : 'text-[#ffd700]'
            }`}>{trend.trend}</span>
            <span className="text-xs text-[#5a6478]">({trend.strength})</span>
          </div>
          <div className="space-y-1.5">
            {trend.signals.map((s, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-[#8892a6]">
                <SignalIcon type={s.type} />
                <span>{s.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Momentum */}
      {momentum && momentum.length > 0 && (
        <div className="mb-5">
          <div className="text-xs text-[#5a6478] uppercase tracking-wider mb-2">Momentum Signals</div>
          <div className="space-y-1.5">
            {momentum.map((s, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-[#8892a6]">
                <SignalIcon type={s.type} />
                <span className="flex-1">{s.text}</span>
                {s.importance === 'high' && <span className="text-[9px] px-1 py-0.5 rounded bg-[#ff6b35]/10 text-[#ff6b35]">KEY</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Valuation */}
      {valuation && valuation.length > 0 && (
        <div className="mb-5">
          <div className="text-xs text-[#5a6478] uppercase tracking-wider mb-2">Valuation & Earnings</div>
          <div className="space-y-1.5">
            {valuation.map((s, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-[#8892a6]">
                <SignalIcon type={s.type} />
                <span>{s.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* News Sentiment */}
      {newsSentiment && newsSentiment.total > 0 && (
        <div className="mb-5">
          <div className="text-xs text-[#5a6478] uppercase tracking-wider mb-2">News Sentiment</div>
          <div className="flex items-center gap-3 mb-2">
            <span className={`text-sm font-bold ${
              newsSentiment.overall.includes('bull') ? 'text-[#00ffc8]' :
              newsSentiment.overall.includes('bear') ? 'text-[#ff4976]' : 'text-[#ffd700]'
            }`}>
              {newsSentiment.overall.charAt(0).toUpperCase() + newsSentiment.overall.slice(1)}
            </span>
            <div className="flex-1 h-2 bg-[#1a1f2b] rounded-full overflow-hidden flex">
              <div className="bg-[#00ffc8]" style={{ width: `${(newsSentiment.positive / newsSentiment.total) * 100}%` }} />
              <div className="bg-[#5a6478]" style={{ width: `${(newsSentiment.neutral / newsSentiment.total) * 100}%` }} />
              <div className="bg-[#ff4976]" style={{ width: `${(newsSentiment.negative / newsSentiment.total) * 100}%` }} />
            </div>
          </div>
          <div className="flex gap-4 text-xs text-[#5a6478]">
            <span className="text-[#00ffc8]">{newsSentiment.positive} positive</span>
            <span>{newsSentiment.neutral} neutral</span>
            <span className="text-[#ff4976]">{newsSentiment.negative} negative</span>
          </div>
        </div>
      )}

      {/* Risk Assessment */}
      {riskAssessment && riskAssessment.length > 0 && (
        <div>
          <div className="text-xs text-[#5a6478] uppercase tracking-wider mb-2">Risk Factors</div>
          <div className="space-y-1.5">
            {riskAssessment.map((r, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-[#8892a6]">
                <AlertTriangle className={`w-3.5 h-3.5 shrink-0 ${
                  r.level === 'high' ? 'text-[#ff4976]' : r.level === 'medium' ? 'text-[#ffd700]' : 'text-[#5a6478]'
                }`} />
                <span>{r.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
