import { TrendingUp, TrendingDown } from 'lucide-react';

export function PriceHeader({ data }) {
  const isPositive = data.change >= 0;

  return (
    <div className="flex items-start justify-between mb-2 xl:mb-4">
      <div>
        <div className="flex items-center gap-3 mb-1">
          {data.logo && (
            <img src={data.logo} alt={data.symbol} className="w-8 h-8 rounded-lg" onError={(e) => { e.target.style.display = 'none'; }} />
          )}
          <h2 className="text-2xl font-bold text-[#e0e6ed]">{data.symbol}</h2>
          <span className="text-sm text-[#5a6478]">{data.name}</span>
          {data.exchange && (
            <span className="text-xs px-2 py-0.5 rounded bg-[#1a1f2b] text-[#5a6478]">{data.exchange}</span>
          )}
        </div>
        <div className="flex items-baseline gap-3">
          <span className="text-4xl font-bold mono text-[#e0e6ed]">
            ${data.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className={`flex items-center gap-1 text-lg font-semibold mono ${isPositive ? 'text-[#00ffc8]' : 'text-[#ff4976]'}`}>
            {isPositive ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
            {isPositive ? '+' : ''}{data.change?.toFixed(2)} ({isPositive ? '+' : ''}{data.changePercent?.toFixed(2)}%)
          </span>
        </div>
        <div className="flex items-center gap-4 mt-1 text-xs text-[#5a6478] mono">
          <span>O: ${data.open?.toFixed(2)}</span>
          <span>H: ${data.high?.toFixed(2)}</span>
          <span>L: ${data.low?.toFixed(2)}</span>
          <span>Prev: ${data.previousClose?.toFixed(2)}</span>
        </div>
      </div>
      <div className={`px-3 py-1.5 rounded-lg text-sm font-bold ${
        data.indicators?.signal === 'Bullish' ? 'bg-[#00ffc8]/10 text-[#00ffc8]' :
        data.indicators?.signal === 'Bearish' ? 'bg-[#ff4976]/10 text-[#ff4976]' :
        'bg-[#ffd700]/10 text-[#ffd700]'
      }`}>
        {data.indicators?.signal || 'N/A'}
      </div>
    </div>
  );
}
