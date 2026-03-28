import { useState, useEffect } from 'react';
import MarketNewsTab from './MarketNewsTab';
import CompanyNewsTab from './CompanyNewsTab';
import TrumpPolicyTab from './TrumpPolicyTab';
import WSBRedditTab from './WSBRedditTab';

const TABS = [
  { id: 'market', label: 'Market', color: '#ef4444' },
  { id: 'company', label: 'Company', color: '#22c55e' },
  { id: 'trump', label: 'Trump', color: '#3b82f6' },
  { id: 'wsb', label: 'WSB', color: '#a855f7' },
];

export default function NewsCenterCard({ marketNews, companyNews, trumpNews, wsbData, nextRefresh, loading }) {
  const [open, setOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('market');
  const [readTimestamps, setReadTimestamps] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('tr_news_read') || '{}');
    } catch { return {}; }
  });

  // Count new items per tab
  const getNewCount = (tab, items) => {
    const lastRead = readTimestamps[tab] || 0;
    if (!items) return 0;
    return items.filter(item => {
      const time = item.pubDate ? new Date(item.pubDate).getTime() :
                   item.publishedAt ? new Date(item.publishedAt).getTime() :
                   item.datetime ? item.datetime * 1000 : 0;
      return time > lastRead;
    }).length;
  };

  // Mark tab as read
  useEffect(() => {
    const now = Date.now();
    setReadTimestamps(prev => {
      const updated = { ...prev, [activeTab]: now };
      localStorage.setItem('tr_news_read', JSON.stringify(updated));
      return updated;
    });
  }, [activeTab]);

  const tabCounts = {
    market: getNewCount('market', marketNews),
    company: getNewCount('company', companyNews),
    trump: getNewCount('trump', trumpNews),
    wsb: getNewCount('wsb', wsbData?.sentiment?.topPosts),
  };

  return (
    <div className="bg-[#0d1117] rounded-xl border border-white/5 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <span className="font-bold text-white">NEWS CENTER</span>
        <div className="flex items-center gap-2">
          {nextRefresh != null && (
            <span className="text-xs text-[#666] font-mono">{Math.floor(nextRefresh / 60)}:{String(nextRefresh % 60).padStart(2, '0')}</span>
          )}
          <span className="text-[#666] text-sm">{open ? '▼' : '▶'}</span>
        </div>
      </button>
      {open && (
        <div className="px-4 pb-4">
          {/* Tab bar */}
          <div className="flex gap-1 mb-3">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex-1 py-2 text-xs font-medium rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'text-white'
                    : 'text-[#666] hover:text-[#d0d0dd]'
                }`}
                style={activeTab === tab.id ? { backgroundColor: tab.color + '20', color: tab.color } : {}}
              >
                {tab.label}
                {tabCounts[tab.id] > 0 && activeTab !== tab.id && (
                  <span className="absolute -top-1 -right-1 bg-[#ef4444] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                    {tabCounts[tab.id]}
                  </span>
                )}
              </button>
            ))}
          </div>

          {loading && <div className="skeleton h-32 w-full mb-2" />}

          {/* Tab content */}
          {activeTab === 'market' && <MarketNewsTab articles={marketNews} />}
          {activeTab === 'company' && <CompanyNewsTab articles={companyNews} />}
          {activeTab === 'trump' && <TrumpPolicyTab articles={trumpNews} />}
          {activeTab === 'wsb' && <WSBRedditTab posts={wsbData?.posts} sentiment={wsbData?.sentiment} />}

          <div className="mt-2 text-xs text-[#666] text-center">
            Source: {activeTab === 'company' ? 'Finnhub' : activeTab === 'wsb' ? 'Reddit' : 'Google News RSS'}
          </div>
        </div>
      )}
    </div>
  );
}
