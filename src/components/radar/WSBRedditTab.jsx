export default function WSBRedditTab({ posts, sentiment }) {
  return (
    <div>
      {/* Sentiment summary */}
      {sentiment && (
        <div className="mb-3 p-3 rounded-lg bg-white/5">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-[#666]">WSB Sentiment</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded ${
              sentiment.sentiment === 'BULLISH' ? 'bg-[#22c55e]/20 text-[#22c55e]' :
              sentiment.sentiment === 'BEARISH' ? 'bg-[#ef4444]/20 text-[#ef4444]' :
              'bg-[#f59e0b]/20 text-[#f59e0b]'
            }`}>
              {sentiment.sentiment}
            </span>
          </div>
          <div className="flex h-3 rounded overflow-hidden bg-white/5">
            <div className="bg-[#22c55e]" style={{ width: `${sentiment.bullishPct}%` }} />
            <div className="bg-[#ef4444]" style={{ width: `${sentiment.bearishPct}%` }} />
          </div>
          <div className="flex justify-between text-xs text-[#666] mt-1">
            <span>{sentiment.bullishPct}% Bull</span>
            <span>{sentiment.mentions} mentions</span>
            <span>{sentiment.bearishPct}% Bear</span>
          </div>
        </div>
      )}

      {/* Top Posts */}
      {sentiment?.topPosts?.length > 0 ? (
        <div className="space-y-1">
          {sentiment.topPosts.map((post, i) => (
            <a
              key={i}
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block py-2.5 px-1 border-b border-white/5"
            >
              <div className="text-sm text-[#d0d0dd] leading-snug">{post.title}</div>
              <div className="flex gap-3 mt-1 text-xs text-[#666]">
                {post.flair && <span className="text-[#a855f7]">{post.flair}</span>}
                <span>Score: {post.score}</span>
                <span>{post.comments} comments</span>
              </div>
            </a>
          ))}
        </div>
      ) : (
        <p className="text-[#666] text-sm py-4">No WSB posts found for this ticker</p>
      )}

      {/* Raw posts if no sentiment */}
      {!sentiment && posts && posts.length > 0 && (
        <div className="space-y-1">
          {posts.slice(0, 10).map((p, i) => (
            <a
              key={i}
              href={`https://reddit.com${p.data?.permalink}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block py-2.5 px-1 border-b border-white/5"
            >
              <div className="text-sm text-[#d0d0dd] leading-snug">{p.data?.title}</div>
              <div className="flex gap-3 mt-1 text-xs text-[#666]">
                <span>Score: {p.data?.score}</span>
                <span>{p.data?.num_comments} comments</span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
