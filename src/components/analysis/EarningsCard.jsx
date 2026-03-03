import { DollarSign } from 'lucide-react';

export function EarningsCard({ earnings }) {
  if (!earnings || earnings.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-[#e0e6ed] mb-4 uppercase tracking-wider flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-[#00ffc8]" /> Earnings History
        </h3>
        <p className="text-sm text-[#5a6478]">No earnings data available.</p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-6">
      <h3 className="text-sm font-semibold text-[#e0e6ed] mb-4 uppercase tracking-wider flex items-center gap-2">
        <DollarSign className="w-4 h-4 text-[#00ffc8]" /> Earnings History
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[#5a6478] text-xs uppercase tracking-wider">
              <th className="text-left pb-3 font-medium">Quarter</th>
              <th className="text-right pb-3 font-medium">Estimate</th>
              <th className="text-right pb-3 font-medium">Actual</th>
              <th className="text-right pb-3 font-medium">Surprise</th>
            </tr>
          </thead>
          <tbody>
            {earnings.map((e, i) => {
              const beat = e.actual !== null && e.estimate !== null && e.actual >= e.estimate;
              return (
                <tr key={i} className="border-t border-[#1a1f2b]">
                  <td className="py-2.5 text-[#e0e6ed] font-medium">{e.quarter}</td>
                  <td className="py-2.5 text-right mono text-[#8892a6]">
                    {e.estimate !== null ? `$${e.estimate.toFixed(2)}` : 'N/A'}
                  </td>
                  <td className={`py-2.5 text-right mono font-medium ${beat ? 'text-[#00ffc8]' : 'text-[#ff4976]'}`}>
                    {e.actual !== null ? `$${e.actual.toFixed(2)}` : 'N/A'}
                  </td>
                  <td className={`py-2.5 text-right mono text-xs ${
                    e.surprisePercent > 0 ? 'text-[#00ffc8]' : e.surprisePercent < 0 ? 'text-[#ff4976]' : 'text-[#5a6478]'
                  }`}>
                    {e.surprisePercent !== null ? (
                      <>
                        {e.surprisePercent > 0 ? '+' : ''}{e.surprisePercent.toFixed(2)}%
                      </>
                    ) : 'N/A'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
