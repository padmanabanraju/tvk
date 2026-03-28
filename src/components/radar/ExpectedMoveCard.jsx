import { useState, useEffect } from 'react';
import { getOptionsChain } from '../../api/tradier';
import { calculateExpectedMove } from '../../calculations/expectedMove';
import { formatCurrency } from '../../utils/format';

export default function ExpectedMoveCard({ symbol, currentPrice, categorizedExps }) {
  const [open, setOpen] = useState(true);
  const [moves, setMoves] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!symbol || !currentPrice || !categorizedExps || categorizedExps.length === 0) {
      setMoves([]);
      return;
    }

    setLoading(true);
    const expsToFetch = categorizedExps.slice(0, 4);

    Promise.allSettled(
      expsToFetch.map(exp =>
        getOptionsChain(symbol, exp.date).then(chain => {
          const em = calculateExpectedMove(chain, currentPrice);
          if (em) {
            return { ...em, expiration: exp.date, daysToExp: exp.daysAway, type: exp.type, label: exp.label };
          }
          return null;
        })
      )
    ).then(results => {
      const validMoves = results
        .filter(r => r.status === 'fulfilled' && r.value)
        .map(r => r.value);
      setMoves(validMoves);
    }).finally(() => setLoading(false));
  }, [symbol, currentPrice, categorizedExps]);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-[#0d1117] rounded-xl border border-white/5 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <span className="font-bold text-white">EXPECTED MOVE</span>
        <span className="text-[#666] text-sm">{open ? '▼' : '▶'}</span>
      </button>
      {open && (
        <div className="px-4 pb-4">
          {loading && moves.length === 0 ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-12 w-full" />)}
            </div>
          ) : moves.length === 0 ? (
            <p className="text-[#666] text-sm">No expected move data available</p>
          ) : (
            <div className="space-y-3">
              {moves.map((m, i) => {
                const rangeWidth = parseFloat(m.upperBound) - parseFloat(m.lowerBound);
                const pricePos = ((currentPrice - parseFloat(m.lowerBound)) / rangeWidth) * 100;
                return (
                  <div key={i} className="py-2 border-b border-white/5 last:border-0">
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-[#d0d0dd] font-medium">{formatDate(m.expiration)}</span>
                        <span className="text-[10px] text-[#666]">({m.daysToExp}d)</span>
                        {m.type !== 'WEEKLY' && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                            m.type === 'QUARTERLY' ? 'bg-[#a855f7]/20 text-[#a855f7]' : 'bg-[#f59e0b]/20 text-[#f59e0b]'
                          }`}>{m.label}</span>
                        )}
                      </div>
                      <span className="font-mono text-sm text-[#f59e0b] font-bold">
                        ±${m.expectedMove} (±{m.expectedMovePct}%)
                      </span>
                    </div>
                    <div className="text-xs text-[#666] mb-1.5">
                      Range: {formatCurrency(parseFloat(m.lowerBound))} — {formatCurrency(parseFloat(m.upperBound))}
                    </div>
                    {/* Range bar */}
                    <div className="relative h-3 rounded-full bg-[#22c55e]/15 overflow-hidden">
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-white z-10"
                        style={{ left: `${Math.min(100, Math.max(0, pricePos))}%` }}
                        title="Current price"
                      />
                      <div className="absolute left-0 top-0 bottom-0 bg-[#ef4444]/20 rounded-l-full" style={{ width: '15%' }} />
                      <div className="absolute right-0 top-0 bottom-0 bg-[#ef4444]/20 rounded-r-full" style={{ width: '15%' }} />
                    </div>
                  </div>
                );
              })}
              <div className="text-[10px] text-[#666] text-center mt-1">
                EM = ATM Straddle × 0.85 · Sandbox data (delayed)
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
