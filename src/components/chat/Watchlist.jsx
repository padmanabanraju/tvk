import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Plus, X } from 'lucide-react';
import { finnhubClient } from '../../services/finnhub';

export function Watchlist({ watchlist, onAnalyze, onAdd, onRemove }) {
  const [quotes, setQuotes] = useState({});
  const [addInput, setAddInput] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    const fetchQuotes = async () => {
      const results = {};
      const responses = await Promise.allSettled(
        watchlist.map((sym) => finnhubClient.getQuote(sym))
      );
      watchlist.forEach((sym, i) => {
        if (responses[i].status === 'fulfilled' && responses[i].value?.c > 0) {
          results[sym] = responses[i].value;
        }
      });
      setQuotes(results);
    };

    fetchQuotes();
    const interval = setInterval(fetchQuotes, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [watchlist.join(',')]);

  const handleAdd = (e) => {
    e.preventDefault();
    const sym = addInput.trim().toUpperCase();
    if (sym && onAdd) {
      onAdd(sym);
      setAddInput('');
      setShowAdd(false);
    }
  };

  return (
    <div className="glass-card rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-[#5a6478] uppercase tracking-wider">Watchlist</h3>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="w-6 h-6 flex items-center justify-center rounded bg-[#1a1f2b] text-[#5a6478] hover:text-[#00ffc8] transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} className="flex gap-2 mb-3">
          <input
            type="text"
            value={addInput}
            onChange={(e) => setAddInput(e.target.value)}
            placeholder="TICKER"
            className="flex-1 px-2 py-1.5 bg-[#0d1117] border border-[#252c3a] rounded-lg text-xs text-[#e0e6ed] placeholder-[#5a6478] focus:outline-none focus:border-[#00ffc8]/50 uppercase"
            autoFocus
          />
          <button type="submit" className="px-2 py-1.5 bg-[#00ffc8] text-[#0a0e14] rounded-lg text-xs font-semibold">
            Add
          </button>
        </form>
      )}

      <div className="space-y-1">
        {watchlist.map((sym) => {
          const q = quotes[sym];
          const isPositive = q && q.d >= 0;

          return (
            <div
              key={sym}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#1a1f2b] cursor-pointer transition-colors group"
              onClick={() => onAnalyze(sym)}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-[#e0e6ed]">{sym}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-sm mono font-medium text-[#e0e6ed]">
                    {q ? `$${q.c.toFixed(2)}` : '...'}
                  </div>
                  {q && (
                    <div className={`text-xs mono flex items-center gap-0.5 justify-end ${isPositive ? 'text-[#00ffc8]' : 'text-[#ff4976]'}`}>
                      {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {isPositive ? '+' : ''}{q.dp?.toFixed(2)}%
                    </div>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(sym);
                  }}
                  className="w-5 h-5 flex items-center justify-center rounded text-[#5a6478] hover:text-[#ff4976] opacity-0 group-hover:opacity-100 transition-all"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
