function formatLargeNumber(num) {
  if (num === null || num === undefined) return 'N/A';
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  return `$${num.toLocaleString()}`;
}

function formatNumber(num, decimals = 2) {
  if (num === null || num === undefined) return 'N/A';
  return typeof num === 'number' ? num.toFixed(decimals) : num;
}

function StatRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-[#1a1f2b] last:border-b-0">
      <span className="text-xs text-[#5a6478]">{label}</span>
      <span className="text-sm mono text-[#e0e6ed] font-medium">{value}</span>
    </div>
  );
}

export function KeyStatistics({ data }) {
  if (!data) return null;

  return (
    <div className="glass-card rounded-2xl p-6">
      <h3 className="text-sm font-semibold text-[#e0e6ed] mb-4 uppercase tracking-wider">Key Statistics</h3>
      <div className="space-y-0">
        <StatRow label="Market Cap" value={formatLargeNumber(data.marketCap)} />
        <StatRow label="P/E Ratio" value={formatNumber(data.pe)} />
        <StatRow label="EPS" value={data.eps !== null ? `$${formatNumber(data.eps)}` : 'N/A'} />
        <StatRow label="52-Week High" value={data.week52High !== null ? `$${formatNumber(data.week52High)}` : 'N/A'} />
        <StatRow label="52-Week Low" value={data.week52Low !== null ? `$${formatNumber(data.week52Low)}` : 'N/A'} />
        <StatRow label="Beta" value={formatNumber(data.beta)} />
        <StatRow label="Dividend Yield" value={data.dividend !== null ? `${formatNumber(data.dividend)}%` : 'N/A'} />
        <StatRow label="Avg Volume" value={data.avgVolume !== null ? `${(data.avgVolume / 1e6).toFixed(1)}M` : 'N/A'} />
        {data.revenueGrowth !== null && data.revenueGrowth !== undefined && (
          <StatRow
            label="Rev Growth (QoQ)"
            value={
              <span className={data.revenueGrowth >= 0 ? 'text-[#00ffc8]' : 'text-[#ff4976]'}>
                {data.revenueGrowth >= 0 ? '+' : ''}{formatNumber(data.revenueGrowth)}%
              </span>
            }
          />
        )}
        {data.epsGrowth !== null && data.epsGrowth !== undefined && (
          <StatRow
            label="EPS Growth (QoQ)"
            value={
              <span className={data.epsGrowth >= 0 ? 'text-[#00ffc8]' : 'text-[#ff4976]'}>
                {data.epsGrowth >= 0 ? '+' : ''}{formatNumber(data.epsGrowth)}%
              </span>
            }
          />
        )}
      </div>
    </div>
  );
}
