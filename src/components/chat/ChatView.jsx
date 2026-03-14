import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, BarChart3, Search, Activity, StopCircle, TrendingUp, Target, Shield, BookOpen, Zap, DollarSign } from 'lucide-react';
import { Watchlist } from './Watchlist';
import { MarkdownMessage } from './MarkdownMessage';
import { useAIChat } from '../../hooks/useAIChat';

const QUICK_ACTIONS = [
  { label: 'Analyze TSLA', icon: BarChart3, action: 'analyze TSLA', category: 'analyze' },
  { label: 'Analyze NVDA', icon: BarChart3, action: 'analyze NVDA', category: 'analyze' },
  { label: 'Market Scanner', icon: Search, action: 'scan market', category: 'navigate' },
];

const CONVERSATION_STARTERS = [
  { label: 'What is a covered call?', icon: BookOpen, action: 'What is a covered call and when should I use one?' },
  { label: 'Explain RSI', icon: TrendingUp, action: 'Explain RSI and how traders use it to find entry points' },
  { label: 'Iron condor strategy', icon: Target, action: 'Explain the iron condor options strategy with an example' },
  { label: 'Risk management basics', icon: Shield, action: 'What are the key risk management rules for swing trading?' },
  { label: 'Bull put spread', icon: DollarSign, action: 'How does a bull put spread work? Walk me through the mechanics' },
  { label: 'Reading MACD signals', icon: Zap, action: 'How do I read MACD crossovers and divergences for trade signals?' },
];

// Smart intent detection — understands natural language, not just exact commands
function detectIntent(text) {
  const lower = text.toLowerCase().trim();

  // Direct analyze commands: "analyze TSLA", "check AAPL", "show me NVDA"
  const analyzeMatch = lower.match(/(?:analyze|check|look\s*at|show(?:\s*me)?|pull\s*up|open|chart)\s+\$?([a-z]{1,5})\b/i);
  if (analyzeMatch) return { type: 'analyze', symbol: analyzeMatch[1].toUpperCase() };

  // "TSLA analysis" or "AAPL chart" (ticker first)
  const tickerFirstMatch = lower.match(/^\$?([a-z]{1,5})\s+(?:analysis|chart|data|technicals|fundamentals|earnings)\b/i);
  if (tickerFirstMatch) return { type: 'analyze', symbol: tickerFirstMatch[1].toUpperCase() };

  // Scanner intents
  if (/\b(?:scan|scanner|find stocks|search market|market overview|watchlist scan)\b/.test(lower)) {
    return { type: 'scanner' };
  }

  // Everything else goes to AI chat (the chatbot handles it)
  return { type: 'chat' };
}

export function ChatView({ watchlist, onAnalyze, onScannerOpen, onWatchlistAdd, onWatchlistRemove }) {
  const { sendMessage, streaming, cancel, hasAI } = useAIChat();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: hasAI
        ? 'Welcome to **TVK**! I\'m your trading and investing assistant.\n\nI can help with:\n- **Stock analysis** — "analyze TSLA" for full charts & data\n- **Options strategies** — covered calls, spreads, iron condors\n- **Technical analysis** — RSI, MACD, chart patterns, support/resistance\n- **Trading concepts** — risk management, position sizing, market structure\n\nAsk me anything about the markets, or pick a topic below to get started.'
        : 'Welcome to **TVK**! I can help you analyze stocks with real market data.\n\n- **"Analyze TSLA"** for real-time price, charts, and technicals\n- **"Scan market"** to view the market scanner\n- Click any stock in your watchlist to dive in\n\n*Configure an AI provider in settings to unlock the full trading chatbot.*',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showStarters, setShowStarters] = useState(hasAI);
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
    setShowStarters(false);

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

    // General chat — use AI if available, otherwise canned response
    if (hasAI) {
      // Build conversation history (last 20 messages)
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

        // If streaming finished but no content was received, show a helpful message
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last && last.role === 'assistant' && !last.content.trim()) {
            updated[updated.length - 1] = {
              ...last,
              content: 'No response received. Your AI API key may be invalid or expired. Please check your API key in Settings (lock icon → Reset & Reconfigure).',
            };
          }
          return updated;
        });
      } catch (err) {
        const errorMsg = err.message || 'Unknown error';
        const isAuthError = /401|403|invalid.*key|auth|unauthorized/i.test(errorMsg);
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last && last.role === 'assistant') {
            updated[updated.length - 1] = {
              ...last,
              content: isAuthError
                ? `**API Key Error**: Your AI API key appears to be invalid or expired. Please check your key and reconfigure in Settings.\n\nError: ${errorMsg}`
                : `Sorry, I encountered an error: ${errorMsg}`,
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
            content: `I can help you analyze any US stock! Try:\n- **"Analyze TSLA"** — real-time price, candlestick chart, technical indicators, news & earnings\n- **"Analyze NVDA"** — same for any ticker\n- **"Scan market"** — view all major stocks at once\n\nOr just click a ticker in your watchlist on the right.\n\n*Tip: Configure an AI provider in setup for the full AI-powered trading chatbot.*`,
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
                className={`max-w-[75%] p-4 rounded-2xl text-sm ${
                  msg.role === 'user'
                    ? 'bg-[#00ffc8]/10 text-[#e0e6ed] rounded-br-md whitespace-pre-wrap'
                    : 'bg-[#131720] text-[#e0e6ed] rounded-bl-md'
                }`}
              >
                {msg.role === 'user'
                  ? msg.content
                  : <MarkdownMessage content={msg.content} />
                }
                <div className="text-xs text-[#5a6478] mt-2">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}

          {/* Conversation starters — shown after welcome message */}
          {showStarters && messages.length === 1 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
              {CONVERSATION_STARTERS.map((starter) => (
                <button
                  key={starter.label}
                  onClick={() => handleSend(starter.action)}
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-[#1a1f2b]/60 border border-[#252c3a] text-left text-xs text-[#8892a6] hover:text-[#00ffc8] hover:border-[#00ffc8]/30 hover:bg-[#1a1f2b] transition-all group"
                >
                  <starter.icon className="w-4 h-4 text-[#5a6478] group-hover:text-[#00ffc8] shrink-0 transition-colors" />
                  <span>{starter.label}</span>
                </button>
              ))}
            </div>
          )}

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
              placeholder={hasAI
                ? "Ask about stocks, options, strategies, or any ticker... (e.g., 'What's a good options strategy for TSLA?')"
                : "Type a ticker to analyze... (e.g., 'analyze TSLA')"
              }
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

        {/* Help card */}
        <div className="glass-card rounded-2xl p-4">
          <h3 className="text-xs font-semibold text-[#5a6478] uppercase tracking-wider mb-3">
            {hasAI ? 'Ask Me About' : 'Quick Start'}
          </h3>
          <div className="space-y-2 text-xs text-[#8892a6]">
            {hasAI ? (
              <>
                <div className="flex items-start gap-2">
                  <TrendingUp className="w-3.5 h-3.5 text-[#00ffc8] shrink-0 mt-0.5" />
                  <span><strong className="text-[#e0e6ed]">Technical analysis</strong> — patterns, indicators, signals</span>
                </div>
                <div className="flex items-start gap-2">
                  <Target className="w-3.5 h-3.5 text-[#9d4edd] shrink-0 mt-0.5" />
                  <span><strong className="text-[#e0e6ed]">Options strategies</strong> — spreads, Greeks, IV analysis</span>
                </div>
                <div className="flex items-start gap-2">
                  <Shield className="w-3.5 h-3.5 text-[#ff6b35] shrink-0 mt-0.5" />
                  <span><strong className="text-[#e0e6ed]">Risk management</strong> — sizing, stops, R:R ratios</span>
                </div>
                <div className="flex items-start gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#ffd700] shrink-0 mt-0.5" />
                  <span><strong className="text-[#e0e6ed]">Mention any ticker</strong> — I'll pull live data automatically</span>
                </div>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
