import { useState, useRef, useEffect } from 'react';
import { MessageCircle, BarChart3, Search, Activity, Lock, Shield, Server, Globe, CheckCircle, Crosshair } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const NAV_ITEMS = [
  { key: 'chat', label: 'AI Chat', icon: MessageCircle },
  { key: 'analysis', label: 'Analysis', icon: BarChart3 },
  { key: 'radar', label: 'Radar', icon: Crosshair },
  { key: 'scanner', label: 'Scanner', icon: Search },
];

export function Header({ currentView, setCurrentView }) {
  const { lock } = useAuth();
  const [showSecurity, setShowSecurity] = useState(false);
  const securityRef = useRef(null);

  // Close popover on outside click
  useEffect(() => {
    if (!showSecurity) return;
    const handler = (e) => {
      if (securityRef.current && !securityRef.current.contains(e.target)) {
        setShowSecurity(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showSecurity]);

  return (
    <header className="sticky top-0 z-50 border-b border-[#252c3a] backdrop-blur-xl bg-[#0a0e14]/80">
      <div className="max-w-[1920px] mx-auto px-3 md:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2 md:gap-3">
          <Activity className="w-5 h-5 md:w-6 md:h-6 text-[#00ffc8]" />
          <span className="text-lg font-bold gradient-text">TVK</span>
          <span className="hidden md:inline text-xs text-[#5a6478]">(<span className="text-[#00ffc8]">T</span>rading <span className="text-[#00ffc8]">V</span>iew <span className="text-[#00ffc8]">K</span>ind-of)</span>
        </div>
        <div className="flex items-center gap-1 md:gap-2">
          <nav className="flex items-center gap-1">
            {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setCurrentView(key)}
                className={`flex items-center gap-2 px-2.5 md:px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  currentView === key
                    ? 'bg-[#00ffc8]/10 text-[#00ffc8]'
                    : 'text-[#5a6478] hover:text-[#e0e6ed] hover:bg-[#1a1f2b]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden md:inline">{label}</span>
              </button>
            ))}
          </nav>
          <div className="w-px h-6 bg-[#252c3a] mx-1" />
          <div className="relative" ref={securityRef}>
            <button
              onClick={() => setShowSecurity(!showSecurity)}
              title="Security info"
              className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-sm transition-all ${showSecurity ? 'text-[#00ffc8] bg-[#00ffc8]/10' : 'text-[#5a6478] hover:text-[#00ffc8] hover:bg-[#1a1f2b]'}`}
            >
              <Shield className="w-4 h-4" />
            </button>
            {showSecurity && (
              <div className="absolute right-0 top-full mt-2 w-80 p-4 bg-[#131720] rounded-xl border border-[#252c3a] shadow-2xl z-50 space-y-2.5">
                <h4 className="text-xs font-semibold text-[#e0e6ed] mb-2">How are my keys protected?</h4>
                <div className="flex items-start gap-2">
                  <Lock className="w-3 h-3 text-[#ffd700] shrink-0 mt-0.5" />
                  <span className="text-[10px] text-[#8892a6]"><strong className="text-[#e0e6ed]">Encrypted at rest</strong> — keys are stored in your browser using AES-256-GCM, locked with your master password.</span>
                </div>
                <div className="flex items-start gap-2">
                  <Server className="w-3 h-3 text-[#9d4edd] shrink-0 mt-0.5" />
                  <span className="text-[10px] text-[#8892a6]"><strong className="text-[#e0e6ed]">Proxied for AI calls</strong> — your key is forwarded to the AI provider, never logged or stored on the server.</span>
                </div>
                <div className="flex items-start gap-2">
                  <Globe className="w-3 h-3 text-[#00ffc8] shrink-0 mt-0.5" />
                  <span className="text-[10px] text-[#8892a6]"><strong className="text-[#e0e6ed]">Finnhub is direct</strong> — stock data calls go straight from your browser. No proxy involved.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-3 h-3 text-[#00ffc8] shrink-0 mt-0.5" />
                  <span className="text-[10px] text-[#8892a6]"><strong className="text-[#e0e6ed]">Verifiable</strong> — open your browser's Network tab to see exactly what's sent.</span>
                </div>
              </div>
            )}
          </div>
          <button
            onClick={lock}
            title="Lock app"
            className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-sm text-[#5a6478] hover:text-[#ffd700] hover:bg-[#1a1f2b] transition-all"
          >
            <Lock className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
