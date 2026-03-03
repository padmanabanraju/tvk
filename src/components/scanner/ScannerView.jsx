import { TrendingUp, TrendingDown, RefreshCw, Clock } from 'lucide-react';
import { useMarketScanner } from '../../hooks/useMarketScanner';
import { ScannerSkeleton } from '../common/LoadingSkeleton';
import { ErrorBanner } from '../common/ErrorBanner';

export function ScannerView({ onSelectSymbol }) {
  const { results, loading, error, lastUpdated, refetch } = useMarketScanner();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#e0e6ed]">Market Scanner</h2>
          <p className="text-sm text-[#5a6478]">Real-time quotes for major US stocks</p>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="flex items-center gap-1.5 text-xs text-[#5a6478]">
              <Clock className="w-3.5 h-3.5" />
              Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          )}
          <button
            onClick={refetch}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-[#1a1f2b] text-[#e0e6ed] rounded-xl text-sm hover:bg-[#252c3a] transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {error && <ErrorBanner message={error} onRetry={refetch} />}

      {/* Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1a1f2b]">
                <th className="text-left px-6 py-4 text-xs font-semibold text-[#5a6478] uppercase tracking-wider">Symbol</th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-[#5a6478] uppercase tracking-wider">Price</th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-[#5a6478] uppercase tracking-wider">Change</th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-[#5a6478] uppercase tracking-wider">Change %</th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-[#5a6478] uppercase tracking-wider">Open</th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-[#5a6478] uppercase tracking-wider">High</th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-[#5a6478] uppercase tracking-wider">Low</th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-[#5a6478] uppercase tracking-wider">Prev Close</th>
              </tr>
            </thead>
            <tbody>
              {loading && results.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-6">
                    <ScannerSkeleton />
                  </td>
                </tr>
              ) : (
                results.map((row) => {
                  const isPositive = row.change >= 0;
                  return (
                    <tr
                      key={row.symbol}
                      onClick={() => onSelectSymbol(row.symbol)}
                      className="border-b border-[#1a1f2b] hover:bg-[#1a1f2b]/50 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-[#e0e6ed]">{row.symbol}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm mono font-medium text-[#e0e6ed]">
                          {row.price !== null ? `$${row.price.toFixed(2)}` : '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`text-sm mono font-medium flex items-center gap-1 justify-end ${isPositive ? 'text-[#00ffc8]' : 'text-[#ff4976]'}`}>
                          {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                          {row.change !== null ? `${isPositive ? '+' : ''}${row.change.toFixed(2)}` : '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`text-sm mono font-semibold px-2 py-0.5 rounded ${
                          isPositive ? 'bg-[#00ffc8]/10 text-[#00ffc8]' : 'bg-[#ff4976]/10 text-[#ff4976]'
                        }`}>
                          {row.changePercent !== null ? `${isPositive ? '+' : ''}${row.changePercent.toFixed(2)}%` : '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right mono text-sm text-[#8892a6]">
                        {row.open !== null ? `$${row.open.toFixed(2)}` : '—'}
                      </td>
                      <td className="px-6 py-4 text-right mono text-sm text-[#8892a6]">
                        {row.high !== null ? `$${row.high.toFixed(2)}` : '—'}
                      </td>
                      <td className="px-6 py-4 text-right mono text-sm text-[#8892a6]">
                        {row.low !== null ? `$${row.low.toFixed(2)}` : '—'}
                      </td>
                      <td className="px-6 py-4 text-right mono text-sm text-[#8892a6]">
                        {row.previousClose !== null ? `$${row.previousClose.toFixed(2)}` : '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
