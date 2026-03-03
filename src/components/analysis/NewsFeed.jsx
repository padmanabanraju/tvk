import { Newspaper, ExternalLink } from 'lucide-react';

export function NewsFeed({ news }) {
  if (!news || news.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-[#e0e6ed] mb-4 uppercase tracking-wider flex items-center gap-2">
          <Newspaper className="w-4 h-4 text-[#00ffc8]" /> Latest News
        </h3>
        <p className="text-sm text-[#5a6478]">No recent news available.</p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-6">
      <h3 className="text-sm font-semibold text-[#e0e6ed] mb-4 uppercase tracking-wider flex items-center gap-2">
        <Newspaper className="w-4 h-4 text-[#00ffc8]" /> Latest News
      </h3>
      <div className="space-y-3 max-h-[400px] overflow-y-auto scrollbar-thin">
        {news.map((item, i) => (
          <a
            key={i}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-3 rounded-xl bg-[#0d1117] hover:bg-[#1a1f2b] transition-colors group"
          >
            <div className="flex gap-3">
              {item.image && (
                <img
                  src={item.image}
                  alt=""
                  className="w-16 h-16 rounded-lg object-cover shrink-0"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-medium text-[#e0e6ed] group-hover:text-[#00ffc8] transition-colors line-clamp-2">
                    {item.title}
                  </h4>
                  <ExternalLink className="w-3.5 h-3.5 text-[#5a6478] shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-[#5a6478]">{item.source}</span>
                  <span className="text-xs text-[#3a4150]">•</span>
                  <span className="text-xs text-[#5a6478]">{item.time}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${
                    item.sentiment === 'positive' ? 'bg-[#00ffc8]/10 text-[#00ffc8]' :
                    item.sentiment === 'negative' ? 'bg-[#ff4976]/10 text-[#ff4976]' :
                    'bg-[#5a6478]/10 text-[#5a6478]'
                  }`}>
                    {item.sentiment}
                  </span>
                </div>
                {item.summary && (
                  <p className="text-xs text-[#5a6478] mt-1 line-clamp-2">{item.summary}</p>
                )}
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
