import { TrendingUp, Calculator, AlertTriangle } from 'lucide-react';

export function FutureProjection({ projection, price, symbol }) {
  if (!projection) return null;

  const { projections, returns, growthRateUsed, disclaimer } = projection;

  return (
    <div className="glass-card rounded-2xl p-6">
      <h3 className="text-sm font-semibold text-[#e0e6ed] mb-1 uppercase tracking-wider flex items-center gap-2">
        <Calculator className="w-4 h-4 text-[#00ffc8]" /> Future Projection
      </h3>
      <div className="text-xs text-[#5a6478] mb-4">
        Based on {growthRateUsed.toFixed(1)}% annual growth rate (derived from historical earnings/revenue growth)
      </div>

      {/* Price Projections Table */}
      {projections && projections.length > 0 && (
        <div className="mb-6">
          <div className="text-xs text-[#5a6478] uppercase tracking-wider mb-2">Price Projections</div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-[#5a6478]">
                  <th className="text-left pb-2 font-medium">Timeframe</th>
                  <th className="text-right pb-2 font-medium">Conservative</th>
                  <th className="text-right pb-2 font-medium">Base Case</th>
                  <th className="text-right pb-2 font-medium">Optimistic</th>
                </tr>
              </thead>
              <tbody>
                {projections.map((p, i) => (
                  <tr key={i} className="border-t border-[#1a1f2b]">
                    <td className="py-2 text-[#e0e6ed] font-medium">{p.year} Year{p.year > 1 ? 's' : ''}</td>
                    <td className="py-2 text-right mono text-[#8892a6]">${p['Conservative']?.toLocaleString()}</td>
                    <td className="py-2 text-right mono text-[#00ffc8] font-medium">${p['Base Case']?.toLocaleString()}</td>
                    <td className="py-2 text-right mono text-[#9d4edd]">${p['Optimistic']?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Investment Returns Calculator */}
      {returns && returns.length > 0 && (
        <div className="mb-4">
          <div className="text-xs text-[#5a6478] uppercase tracking-wider mb-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Hypothetical Investment Returns
          </div>
          <div className="text-[10px] text-[#5a6478] mb-2">If you invest today at ${price?.toFixed(2)}/share:</div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-[#5a6478]">
                  <th className="text-left pb-2 font-medium">Invested</th>
                  <th className="text-right pb-2 font-medium">Shares</th>
                  <th className="text-right pb-2 font-medium">5-Year Value</th>
                  <th className="text-right pb-2 font-medium">10-Year Value</th>
                </tr>
              </thead>
              <tbody>
                {returns.map((r, i) => (
                  <tr key={i} className="border-t border-[#1a1f2b]">
                    <td className="py-2 mono text-[#e0e6ed]">${r.invested.toLocaleString()}</td>
                    <td className="py-2 text-right mono text-[#8892a6]">{r.shares}</td>
                    <td className="py-2 text-right mono text-[#00ffc8] font-medium">
                      ${r.value5yr.toLocaleString()}
                      <span className="text-[10px] text-[#5a6478] ml-1">
                        (+{((r.value5yr / r.invested - 1) * 100).toFixed(0)}%)
                      </span>
                    </td>
                    <td className="py-2 text-right mono text-[#9d4edd] font-medium">
                      ${r.value10yr.toLocaleString()}
                      <span className="text-[10px] text-[#5a6478] ml-1">
                        (+{((r.value10yr / r.invested - 1) * 100).toFixed(0)}%)
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="flex items-start gap-2 p-3 bg-[#ffd700]/5 rounded-lg border border-[#ffd700]/10 mt-4">
        <AlertTriangle className="w-3.5 h-3.5 text-[#ffd700] shrink-0 mt-0.5" />
        <span className="text-[10px] text-[#5a6478]">{disclaimer}</span>
      </div>
    </div>
  );
}
