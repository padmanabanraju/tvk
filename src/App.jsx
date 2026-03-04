import { useState, useEffect, Component } from 'react';
import { Header } from './components/layout/Header';
import { ChatView } from './components/chat/ChatView';
import { AnalysisView } from './components/analysis/AnalysisView';
import { ScannerView } from './components/scanner/ScannerView';
import { SetupWizard } from './components/setup/SetupWizard';
import { UnlockScreen } from './components/setup/UnlockScreen';
import { useAuth } from './contexts/AuthContext';
import { finnhubClient } from './services/finnhub';
import { AlertTriangle } from 'lucide-react';

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

export default function App() {
  const { isFirstTime, isLocked, isUnlocked, apiKeys } = useAuth();

  const [currentView, setCurrentView] = useState('chat');
  const [selectedSymbol, setSelectedSymbol] = useState(null);
  const [watchlist, setWatchlist] = useState(['AAPL', 'TSLA', 'NVDA', 'MSFT', 'AMD', 'GOOGL']);

  // Inject Finnhub API key when unlocked
  useEffect(() => {
    if (isUnlocked && apiKeys?.finnhubApiKey) {
      finnhubClient.setApiKey(apiKeys.finnhubApiKey);
    }
  }, [isUnlocked, apiKeys]);

  // Show setup wizard for first-time users
  if (isFirstTime) {
    return <SetupWizard />;
  }

  // Show unlock screen for returning users
  if (isLocked) {
    return <UnlockScreen />;
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
          <footer className="max-w-[1920px] mx-auto px-6 py-4 text-center border-t border-[#252c3a]/50">
            <p className="text-[10px] text-[#5a6478] leading-relaxed">
              Not financial advice. TVK provides rule-based technical analysis and AI-generated insights for educational purposes only. Always do your own research before making any investment decisions.
            </p>
          </footer>
        </div>
      </div>
    </ErrorBoundary>
  );
}
