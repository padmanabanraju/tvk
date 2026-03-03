import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, BarChart3, Search, Activity, StopCircle } from 'lucide-react';
import { Watchlist } from './Watchlist';
import { useAIChat } from '../../hooks/useAIChat';

const QUICK_ACTIONS = [
  { label: 'Analyze TSLA', icon: BarChart3, action: 'analyze TSLA' },
  { label: 'Analyze NVDA', icon: BarChart3, action: 'analyze NVDA' },
  { label: 'Analyze AAPL', icon: BarChart3, action: 'analyze AAPL' },
  { label: 'Market Scanner', icon: Search, action: 'scan market' },
];

// Simple intent detection to route to analysis/scanner
function detectIntent(text) {
  const lower = text.toLowerCase().trim();
  const tickerMatch = lower.match(/(?:analyze|check|look at|show)\s+([a-z]{1,5})/i);
  if (tickerMatch) return { type: 'analyze', symbol: tickerMatch[1].toUpperCase() };
  if (/scan|find|search|market/.test(lower)) return { type: 'scanner' };
  return { type: 'chat' };
}

export function ChatView({ watchlist, onAnalyze, onScannerOpen, onWatchlistAdd, onWatchlistRemove }) {
  const { sendMessage, streaming, cancel, hasAI } = useAIChat();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: hasAI
        ? 'Welcome to TVK! I can help you analyze stocks, answer market questions, and discuss trading strategies.\n\nTry:\n- "Analyze TSLA" to see real-time charts and data\n- Ask me anything about stocks, options, or technical analysis\n- "Scan market" to view the market scanner'
        : 'Welcome to TVK! I can help you analyze stocks with real market data.\n\nTry:\n- "Analyze TSLA" to see real-time price, charts, and technicals\n- "Scan market" to view the market scanner\n- Or click any stock in your watchlist to dive in.',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text) => {
    const msg = text || input.trim();
    if (!msg || isLoading || streaming) return;

    const userMessage = { role: 'user', content: msg, timestamp: new Date() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    const intent = detectIntent(msg);

    if (intent.type === 'analyze' && intent.symbol) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Loading real-time analysis for **${intent.symbol}**... Switching to Analysis view.`,
          timestamp: new Date(),
        },
      ]);
      setTimeout(() => onAnalyze(intent.symbol), 500);
      return;
    }

    if (intent.type === 'scanner') {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Opening the Market Scanner with real-time quotes...',
          timestamp: new Date(),
        },
      ]);
      setTimeout(() => onScannerOpen(), 500);
      return;
    }

    // General chat — use Claude if available, otherwise canned response
    if (hasAI) {
      // Build conversation history for Claude (last 20 messages)
      const allMessages = [...messages, userMessage];
      const chatHistory = allMessages
        .slice(-20)
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .map((m) => ({ role: m.role, content: m.content }));

      // Add a placeholder assistant message that we'll stream into
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '', timestamp: new Date() },
      ]);

      try {
        await sendMessage(chatHistory, null, (chunk) => {
          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last && last.role === 'assistant') {
              updated[updated.length - 1] = { ...last, content: last.content + chunk };
            }
            return updated;
          });
        });
      } catch (err) {
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last && last.role === 'assistant') {
            updated[updated.length - 1] = {
              ...last,
              content: last.content || `Sorry, I encountered an error: ${err.message}`,
            };
          }
          return updated;
        });
      }
    } else {
      // Fallback: canned response
      setIsLoading(true);
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `I can help you analyze any US stock! Try:\n- **"Analyze TSLA"** — real-time price, candlestick chart, technical indicators, news & earnings\n- **"Analyze NVDA"** — same for any ticker\n- **"Scan market"** — view all major stocks at once\n\nOr just click a ticker in your watchlist on the right.\n\n*Tip: Configure an AI provider in setup for AI-powered chat.*`,
            timestamp: new Date(),
          },
        ]);
        setIsLoading(false);
      }, 300);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
      {/* Chat panel */}
      <div className="lg:col-span-2 glass-card rounded-2xl flex flex-col overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[75%] p-4 rounded-2xl text-sm whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-[#00ffc8]/10 text-[#e0e6ed] rounded-br-md'
                    : 'bg-[#131720] text-[#e0e6ed] rounded-bl-md'
                }`}
              >
                {msg.content.split('**').map((part, j) =>
                  j % 2 === 1 ? <strong key={j} className="text-[#00ffc8]">{part}</strong> : part
                )}
                <div className="text-xs text-[#5a6478] mt-2">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-[#131720] p-4 rounded-2xl rounded-bl-md">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 bg-[#00ffc8] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-[#00ffc8] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-[#00ffc8] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick actions */}
        <div className="px-6 py-2 flex gap-2 flex-wrap border-t border-[#1a1f2b]">
          {QUICK_ACTIONS.map((qa) => (
            <button
              key={qa.label}
              onClick={() => handleSend(qa.action)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1a1f2b] text-xs text-[#8892a6] hover:text-[#00ffc8] hover:bg-[#252c3a] transition-colors"
            >
              <qa.icon className="w-3 h-3" />
              {qa.label}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-[#1a1f2b]">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me to analyze any stock... (e.g., 'analyze TSLA')"
              className="flex-1 px-4 py-3 bg-[#0d1117] border border-[#252c3a] rounded-xl text-sm text-[#e0e6ed] placeholder-[#5a6478] focus:outline-none focus:border-[#00ffc8]/50 transition-colors"
            />
            {streaming ? (
              <button
                onClick={cancel}
                className="p-3 bg-[#ff4976] text-white rounded-xl hover:bg-[#ff4976]/90 transition-colors"
              >
                <StopCircle className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => handleSend()}
                disabled={isLoading}
                className="p-3 bg-[#00ffc8] text-[#0a0e14] rounded-xl hover:bg-[#00ffc8]/90 transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-4">
        <Watchlist
          watchlist={watchlist}
          onAnalyze={onAnalyze}
          onAdd={onWatchlistAdd}
          onRemove={onWatchlistRemove}
        />

        {/* Market info card */}
        <div className="glass-card rounded-2xl p-4">
          <h3 className="text-xs font-semibold text-[#5a6478] uppercase tracking-wider mb-3">Quick Start</h3>
          <div className="space-y-2 text-xs text-[#8892a6]">
            <div className="flex items-start gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#00ffc8] shrink-0 mt-0.5" />
              <span>Type <strong className="text-[#e0e6ed]">"analyze TSLA"</strong> for full analysis</span>
            </div>
            <div className="flex items-start gap-2">
              <Activity className="w-3.5 h-3.5 text-[#9d4edd] shrink-0 mt-0.5" />
              <span>Click any watchlist ticker for real-time data</span>
            </div>
            <div className="flex items-start gap-2">
              <Search className="w-3.5 h-3.5 text-[#ff6b35] shrink-0 mt-0.5" />
              <span>Use the <strong className="text-[#e0e6ed]">Scanner</strong> tab for market overview</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
