import { Target, ArrowUp, ArrowDown } from 'lucide-react';

export function PriceTargets({ targets, price }) {
  if (!targets) return null;

  return (
    <div className="glass-card rounded-2xl p-6">
      <h3 className="text-sm font-semibold text-[#e0e6ed] mb-4 uppercase tracking-wider flex items-center gap-2">
        <Target className="w-4 h-4 text-[#ff6b35]" /> Price Targets
      </h3>

      {/* Next Week */}
      {targets.nextWeek && (
        <div className="mb-4">
          <div className="text-xs text-[#5a6478] mb-1.5">Next Week Range</div>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="h-2 bg-[#1a1f2b] rounded-full relative">
                <div
                  className="absolute h-full bg-gradient-to-r from-[#ff4976] via-[#ffd700] to-[#00ffc8] rounded-full"
                  style={{ left: '0%', right: '0%' }}
                />
                {price && (
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full border-2 border-[#0a0e14]"
                    style={{
                      left: `${Math.max(0, Math.min(100, ((price - targets.nextWeek.low) / (targets.nextWeek.high - targets.nextWeek.low)) * 100))}%`,
                    }}
                  />
                )}
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs mono text-[#ff4976]">${targets.nextWeek.low}</span>
                <span className="text-xs mono text-[#00ffc8]">${targets.nextWeek.high}</span>
              </div>
            </div>
          </div>
          <div className="text-[10px] text-[#5a6478] mt-1">{targets.nextWeek.basis}</div>
        </div>
      )}

      {/* Next Month */}
      {targets.nextMonth && (
        <div className="mb-4">
          <div className="text-xs text-[#5a6478] mb-1.5">Next Month Range</div>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="h-2 bg-[#1a1f2b] rounded-full relative">
                <div
                  className="absolute h-full bg-gradient-to-r from-[#ff4976] via-[#ffd700] to-[#00ffc8] rounded-full"
                  style={{ left: '0%', right: '0%' }}
                />
                {price && (
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full border-2 border-[#0a0e14]"
                    style={{
                      left: `${Math.max(0, Math.min(100, ((price - targets.nextMonth.low) / (targets.nextMonth.high - targets.nextMonth.low)) * 100))}%`,
                    }}
                  />
                )}
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs mono text-[#ff4976]">${targets.nextMonth.low}</span>
                <span className="text-xs mono text-[#00ffc8]">${targets.nextMonth.high}</span>
              </div>
            </div>
          </div>
          <div className="text-[10px] text-[#5a6478] mt-1">{targets.nextMonth.basis}</div>
        </div>
      )}

      {/* Support & Resistance */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        <div>
          <div className="text-xs text-[#5a6478] mb-2 flex items-center gap-1">
            <ArrowDown className="w-3 h-3 text-[#00ffc8]" /> Support
          </div>
          {targets.support.length > 0 ? targets.support.slice(0, 3).map((s, i) => (
            <div key={i} className="flex justify-between py-1 text-xs">
              <span className="text-[#5a6478]">{s.label}</span>
              <span className="mono text-[#00ffc8] font-medium">${s.level}</span>
            </div>
          )) : <span className="text-xs text-[#5a6478]">N/A</span>}
        </div>
        <div>
          <div className="text-xs text-[#5a6478] mb-2 flex items-center gap-1">
            <ArrowUp className="w-3 h-3 text-[#ff4976]" /> Resistance
          </div>
          {targets.resistance.length > 0 ? targets.resistance.slice(0, 3).map((r, i) => (
            <div key={i} className="flex justify-between py-1 text-xs">
              <span className="text-[#5a6478]">{r.label}</span>
              <span className="mono text-[#ff4976] font-medium">${r.level}</span>
            </div>
          )) : <span className="text-xs text-[#5a6478]">N/A</span>}
        </div>
      </div>
    </div>
  );
}
