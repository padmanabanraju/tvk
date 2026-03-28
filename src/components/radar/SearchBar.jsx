import { useState } from 'react';

const QUICK_TICKERS = ['META', 'SPY', 'QQQ', 'TSLA', 'AAPL', 'NVDA', 'AMZN', 'MSFT'];

export default function SearchBar({ onSearch, currentSymbol }) {
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const sym = input.trim().toUpperCase();
    if (sym) {
      onSearch(sym);
      setInput('');
    }
  };

  return (
    <div className="mb-4">
      <form onSubmit={handleSubmit} className="flex gap-2 mb-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter ticker..."
          className="flex-1 bg-[#0d1117] border border-white/5 rounded-lg px-4 py-3 text-white text-lg placeholder-[#666] outline-none focus:border-[#22c55e]/50"
        />
        <button
          type="submit"
          className="bg-[#22c55e] text-black font-bold px-6 py-3 rounded-lg active:scale-95 transition-transform"
        >
          GO
        </button>
      </form>
      <div className="flex flex-wrap gap-2">
        {QUICK_TICKERS.map(t => (
          <button
            key={t}
            onClick={() => onSearch(t)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              currentSymbol === t
                ? 'bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/30'
                : 'bg-[#0d1117] text-[#d0d0dd] border border-white/5 active:bg-white/10'
            }`}
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}
