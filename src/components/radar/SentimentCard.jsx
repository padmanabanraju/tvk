import { useState } from 'react';

export default function SentimentCard({ socialSentiment, wsbSentiment }) {
  const [open, setOpen] = useState(true);

  const reddit = socialSentiment?.reddit;
  const twitter = socialSentiment?.twitter;

  return (
    <div className="bg-[#0d1117] rounded-xl border border-white/5 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <span className="font-bold text-white">SOCIAL SENTIMENT</span>
        <span className="text-[#666] text-sm">{open ? '▼' : '▶'}</span>
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-3">
          {/* WSB Sentiment */}
          {wsbSentiment && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-[#666]">WSB/Reddit</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                  wsbSentiment.sentiment === 'BULLISH' ? 'bg-[#22c55e]/20 text-[#22c55e]' :
                  wsbSentiment.sentiment === 'BEARISH' ? 'bg-[#ef4444]/20 text-[#ef4444]' :
                  'bg-[#f59e0b]/20 text-[#f59e0b]'
                }`}>
                  {wsbSentiment.sentiment}
                </span>
              </div>
              <div className="flex h-4 rounded overflow-hidden bg-white/5">
                <div className="bg-[#22c55e]" style={{ width: `${wsbSentiment.bullishPct}%` }} />
                <div className="bg-[#ef4444]" style={{ width: `${wsbSentiment.bearishPct}%` }} />
              </div>
              <div className="flex justify-between text-xs text-[#666] mt-1">
                <span>{wsbSentiment.bullishPct}% Bull</span>
                <span>{wsbSentiment.mentions} mentions</span>
                <span>{wsbSentiment.bearishPct}% Bear</span>
              </div>
            </div>
          )}

          {/* Finnhub Social */}
          {reddit && reddit.length > 0 && (
            <div>
              <div className="text-xs text-[#666] mb-1">Finnhub Social (Reddit)</div>
              <div className="text-sm text-[#d0d0dd]">
                {reddit.length} data points tracked
              </div>
            </div>
          )}

          {twitter && twitter.length > 0 && (
            <div>
              <div className="text-xs text-[#666] mb-1">Finnhub Social (Twitter)</div>
              <div className="text-sm text-[#d0d0dd]">
                {twitter.length} data points tracked
              </div>
            </div>
          )}

          {!wsbSentiment && !reddit?.length && !twitter?.length && (
            <p className="text-[#666] text-sm">No sentiment data available</p>
          )}
        </div>
      )}
    </div>
  );
}
