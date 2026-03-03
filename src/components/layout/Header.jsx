import { MessageCircle, BarChart3, Search, Activity, Lock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const NAV_ITEMS = [
  { key: 'chat', label: 'AI Chat', icon: MessageCircle },
  { key: 'analysis', label: 'Analysis', icon: BarChart3 },
  { key: 'scanner', label: 'Scanner', icon: Search },
];

export function Header({ currentView, setCurrentView }) {
  const { lock } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-[#252c3a] backdrop-blur-xl bg-[#0a0e14]/80">
      <div className="max-w-[1920px] mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity className="w-6 h-6 text-[#00ffc8]" />
          <span className="text-lg font-bold gradient-text">TVK</span>
          <span className="text-xs text-[#5a6478]">(<span className="text-[#00ffc8]">T</span>rading <span className="text-[#00ffc8]">V</span>iew <span className="text-[#00ffc8]">K</span>ind-of)</span>
        </div>
        <div className="flex items-center gap-2">
          <nav className="flex items-center gap-1">
            {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setCurrentView(key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  currentView === key
                    ? 'bg-[#00ffc8]/10 text-[#00ffc8]'
                    : 'text-[#5a6478] hover:text-[#e0e6ed] hover:bg-[#1a1f2b]'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </nav>
          <div className="w-px h-6 bg-[#252c3a] mx-1" />
          <button
            onClick={lock}
            title="Lock app"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-[#5a6478] hover:text-[#ffd700] hover:bg-[#1a1f2b] transition-all"
          >
            <Lock className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
