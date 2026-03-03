import { useState, Component } from 'react';
import { Header } from './components/layout/Header';
import { ChatView } from './components/chat/ChatView';
import { AnalysisView } from './components/analysis/AnalysisView';
import { ScannerView } from './components/scanner/ScannerView';
import { Activity, Key, ExternalLink, AlertTriangle } from 'lucide-react';

// Error Boundary to catch rendering errors and show them instead of blank page
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('[TVK] Render error:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0a0e14] flex items-center justify-center p-6">
          <div className="glass-card rounded-2xl p-10 max-w-lg w-full text-center">
            <AlertTriangle className="w-12 h-12 text-[#ff4976] mx-auto mb-4" />
            <h1 className="text-xl font-bold text-[#e0e6ed] mb-2">Something went wrong</h1>
            <p className="text-sm text-[#5a6478] mb-4">{this.state.error?.message || 'Unknown error'}</p>
            <pre className="text-xs text-left bg-[#0d1117] p-4 rounded-lg overflow-auto max-h-40 text-[#ff4976] mb-4">
              {this.state.error?.stack}
            </pre>
            <button
              onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
              className="px-5 py-2.5 bg-[#00ffc8] text-[#0a0e14] rounded-xl text-sm font-semibold hover:bg-[#00ffc8]/90 transition-colors"
            >
              Reload App
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function ApiKeySetup() {
  return (
    <div className="min-h-screen bg-[#0a0e14] flex items-center justify-center p-6">
      <div className="glass-card rounded-2xl p-10 max-w-lg w-full text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#00ffc8]/10 flex items-center justify-center mx-auto mb-6">
          <Key className="w-8 h-8 text-[#00ffc8]" />
        </div>
        <h1 className="text-2xl font-bold text-[#e0e6ed] mb-2">Finnhub API Key Required</h1>
        <p className="text-sm text-[#5a6478] mb-6">
          TVK uses real market data from Finnhub. Set up your free API key to get started.
        </p>

        <div className="text-left space-y-4 mb-8">
          <div className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-[#00ffc8]/10 text-[#00ffc8] text-xs font-bold flex items-center justify-center shrink-0">1</span>
            <div>
              <p className="text-sm text-[#e0e6ed]">Sign up at Finnhub (free, no credit card)</p>
              <a
                href="https://finnhub.io/register"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#00ffc8] hover:underline flex items-center gap-1 mt-0.5"
              >
                finnhub.io/register <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-[#00ffc8]/10 text-[#00ffc8] text-xs font-bold flex items-center justify-center shrink-0">2</span>
            <p className="text-sm text-[#e0e6ed]">Copy your API key from the Finnhub dashboard</p>
          </div>
          <div className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-[#00ffc8]/10 text-[#00ffc8] text-xs font-bold flex items-center justify-center shrink-0">3</span>
            <div>
              <p className="text-sm text-[#e0e6ed]">
                Add it to the <code className="mono text-xs bg-[#1a1f2b] px-1.5 py-0.5 rounded">.env</code> file in the project root:
              </p>
              <pre className="mt-2 p-3 bg-[#0d1117] rounded-lg text-xs mono text-[#00ffc8] overflow-x-auto">
                VITE_FINNHUB_API_KEY=your_api_key_here
              </pre>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-[#00ffc8]/10 text-[#00ffc8] text-xs font-bold flex items-center justify-center shrink-0">4</span>
            <p className="text-sm text-[#e0e6ed]">
              Restart the dev server: <code className="mono text-xs bg-[#1a1f2b] px-1.5 py-0.5 rounded">npm run dev</code>
            </p>
          </div>
        </div>

        <div className="p-3 bg-[#1a1f2b] rounded-xl text-xs text-[#5a6478]">
          Free tier: 60 API calls/minute — plenty for personal analysis use.
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [currentView, setCurrentView] = useState('chat');
  const [selectedSymbol, setSelectedSymbol] = useState(null);
  const [watchlist, setWatchlist] = useState(['AAPL', 'TSLA', 'NVDA', 'MSFT', 'AMD', 'GOOGL']);

  const apiKey = import.meta.env.VITE_FINNHUB_API_KEY;

  // Show setup screen if no API key
  if (!apiKey) {
    return <ApiKeySetup />;
  }

  const handleAnalyze = (symbol) => {
    setSelectedSymbol(symbol.toUpperCase());
    setCurrentView('analysis');
  };

  const handleWatchlistAdd = (symbol) => {
    const sym = symbol.toUpperCase();
    if (!watchlist.includes(sym)) {
      setWatchlist((prev) => [...prev, sym]);
    }
  };

  const handleWatchlistRemove = (symbol) => {
    setWatchlist((prev) => prev.filter((s) => s !== symbol));
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#0a0e14] text-[#e0e6ed]">
        {/* Animated background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-900/10 via-transparent to-cyan-900/10 animate-pulse-slow" />
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10">
          <Header currentView={currentView} setCurrentView={setCurrentView} />
          <main className="max-w-[1920px] mx-auto p-6">
            {currentView === 'chat' && (
              <ChatView
                watchlist={watchlist}
                onAnalyze={handleAnalyze}
                onScannerOpen={() => setCurrentView('scanner')}
                onWatchlistAdd={handleWatchlistAdd}
                onWatchlistRemove={handleWatchlistRemove}
              />
            )}
            {currentView === 'analysis' && (
              <AnalysisView
                symbol={selectedSymbol}
                onSymbolChange={(sym) => setSelectedSymbol(sym)}
              />
            )}
            {currentView === 'scanner' && (
              <ScannerView onSelectSymbol={handleAnalyze} />
            )}
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
}
