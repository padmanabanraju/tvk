import { useState } from 'react';
import { Activity, Key, Brain, Lock, ExternalLink, CheckCircle, AlertTriangle, Eye, EyeOff, ArrowRight, ArrowLeft, Cpu, Sparkles, Globe, Server } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { AI_PROVIDERS, PROVIDER_IDS } from '../../services/aiProviders';

const PROVIDER_ICONS = {
  claude: Sparkles,
  openai: Brain,
  gemini: Globe,
  ollama: Server,
};

function StepIndicator({ current }) {
  const steps = ['Finnhub API', 'AI Provider', 'Password'];
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((label, i) => (
        <div key={label} className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
            i < current ? 'bg-[#00ffc8] text-[#0a0e14]' :
            i === current ? 'bg-[#00ffc8]/20 text-[#00ffc8] ring-2 ring-[#00ffc8]/50' :
            'bg-[#1a1f2b] text-[#5a6478]'
          }`}>
            {i < current ? <CheckCircle className="w-4 h-4" /> : i + 1}
          </div>
          <span className={`text-xs hidden sm:inline ${i === current ? 'text-[#e0e6ed]' : 'text-[#5a6478]'}`}>{label}</span>
          {i < steps.length - 1 && <div className={`w-8 h-px ${i < current ? 'bg-[#00ffc8]' : 'bg-[#252c3a]'}`} />}
        </div>
      ))}
    </div>
  );
}

export function SetupWizard() {
  const { setupKeys } = useAuth();
  const [step, setStep] = useState(0);

  // Step 0: Finnhub
  const [finnhubKey, setFinnhubKey] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  // Step 1: AI Provider
  const [selectedProvider, setSelectedProvider] = useState('claude');
  const [anthropicKey, setAnthropicKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  const [ollamaModel, setOllamaModel] = useState('llama3.2');
  const [ollamaBaseUrl, setOllamaBaseUrl] = useState('http://localhost:11434');
  const [ollamaTest, setOllamaTest] = useState(null); // 'success' | 'error' | null
  const [ollamaTesting, setOllamaTesting] = useState(false);

  // Step 2: Password
  const [masterPassword, setMasterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Test Finnhub connection
  const testFinnhub = async () => {
    if (!finnhubKey.trim()) return;
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=AAPL&token=${finnhubKey.trim()}`);
      const data = await res.json();
      setTestResult(data && data.name ? 'success' : 'error');
    } catch {
      setTestResult('error');
    }
    setTesting(false);
  };

  // Test Ollama connection
  const testOllama = async () => {
    setOllamaTesting(true);
    setOllamaTest(null);
    try {
      const res = await fetch(`/api/ai/ollama-tags?baseUrl=${encodeURIComponent(ollamaBaseUrl)}`);
      const data = await res.json();
      setOllamaTest(data.models ? 'success' : 'error');
    } catch {
      setOllamaTest('error');
    }
    setOllamaTesting(false);
  };

  // Get current provider's API key
  const providerKeyMap = {
    claude: { value: anthropicKey, set: setAnthropicKey },
    openai: { value: openaiKey, set: setOpenaiKey },
    gemini: { value: geminiKey, set: setGeminiKey },
  };

  const currentProviderDef = AI_PROVIDERS[selectedProvider];

  // Complete setup
  const handleComplete = async () => {
    setError('');
    if (masterPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (masterPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setSaving(true);
    try {
      const keysObject = {
        finnhubApiKey: finnhubKey.trim(),
        aiProvider: selectedProvider,
        anthropicApiKey: anthropicKey.trim(),
        openaiApiKey: openaiKey.trim(),
        geminiApiKey: geminiKey.trim(),
        ollamaModel: ollamaModel.trim() || 'llama3.2',
        ollamaBaseUrl: ollamaBaseUrl.trim() || 'http://localhost:11434',
      };
      await setupKeys(keysObject, masterPassword);
    } catch {
      setError('Failed to save keys. Please try again.');
    }
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0e14] flex items-center justify-center p-6">
      <div className="glass-card rounded-2xl p-8 max-w-lg w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Activity className="w-7 h-7 text-[#00ffc8]" />
            <span className="text-xl font-bold gradient-text">TVK</span>
          </div>
          <p className="text-sm text-[#5a6478]">Set up your API keys to get started</p>
        </div>

        <StepIndicator current={step} />

        {/* Step 1: Finnhub */}
        {step === 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Key className="w-5 h-5 text-[#00ffc8]" />
              <h2 className="text-lg font-semibold text-[#e0e6ed]">Finnhub API Key</h2>
            </div>
            <p className="text-sm text-[#5a6478]">
              Provides real-time stock quotes, charts, news, and earnings data.
            </p>
            <a
              href="https://finnhub.io/register"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-[#00ffc8] hover:underline"
            >
              <ExternalLink className="w-3 h-3" /> Get your free API key at finnhub.io/register
            </a>
            <input
              type="text"
              value={finnhubKey}
              onChange={(e) => { setFinnhubKey(e.target.value); setTestResult(null); }}
              placeholder="Paste your Finnhub API key here"
              className="w-full px-4 py-3 bg-[#0d1117] border border-[#252c3a] rounded-xl text-sm text-[#e0e6ed] placeholder-[#5a6478] focus:outline-none focus:border-[#00ffc8]/50 mono"
            />
            <div className="flex items-center gap-3">
              <button
                onClick={testFinnhub}
                disabled={!finnhubKey.trim() || testing}
                className="px-4 py-2 bg-[#1a1f2b] text-[#e0e6ed] rounded-xl text-sm hover:bg-[#252c3a] transition-colors disabled:opacity-50"
              >
                {testing ? 'Testing...' : 'Test Connection'}
              </button>
              {testResult === 'success' && (
                <span className="flex items-center gap-1 text-xs text-[#00ffc8]">
                  <CheckCircle className="w-3.5 h-3.5" /> Connected successfully
                </span>
              )}
              {testResult === 'error' && (
                <span className="flex items-center gap-1 text-xs text-[#ff4976]">
                  <AlertTriangle className="w-3.5 h-3.5" /> Invalid key or network error
                </span>
              )}
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setStep(1)}
                disabled={!finnhubKey.trim()}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#00ffc8] text-[#0a0e14] rounded-xl text-sm font-semibold hover:bg-[#00ffc8]/90 transition-colors disabled:opacity-50"
              >
                Next <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: AI Provider */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Cpu className="w-5 h-5 text-[#9d4edd]" />
              <h2 className="text-lg font-semibold text-[#e0e6ed]">AI Provider</h2>
            </div>
            <p className="text-sm text-[#5a6478]">
              Choose your AI provider for stock analysis and chat.
            </p>

            {/* Provider cards */}
            <div className="grid grid-cols-2 gap-2">
              {PROVIDER_IDS.map((id) => {
                const prov = AI_PROVIDERS[id];
                const Icon = PROVIDER_ICONS[id];
                const isSelected = selectedProvider === id;
                return (
                  <button
                    key={id}
                    onClick={() => setSelectedProvider(id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-[' + prov.color + ']/60 bg-[' + prov.color + ']/5'
                        : 'border-[#252c3a] bg-[#0d1117] hover:border-[#5a6478]'
                    }`}
                    style={isSelected ? { borderColor: prov.color + '99', backgroundColor: prov.color + '0d' } : {}}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="w-4 h-4" style={{ color: prov.color }} />
                      <span className={`text-xs font-semibold ${isSelected ? 'text-[#e0e6ed]' : 'text-[#8892a6]'}`}>{prov.name}</span>
                    </div>
                    <p className="text-[10px] text-[#5a6478] leading-tight">{prov.description}</p>
                  </button>
                );
              })}
            </div>

            {/* API Key input (for cloud providers) */}
            {currentProviderDef.requiresApiKey && (
              <>
                <a
                  href={currentProviderDef.docsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs hover:underline"
                  style={{ color: currentProviderDef.color }}
                >
                  <ExternalLink className="w-3 h-3" /> Get your API key at {currentProviderDef.docsLabel}
                </a>
                <input
                  type="text"
                  value={providerKeyMap[selectedProvider]?.value || ''}
                  onChange={(e) => providerKeyMap[selectedProvider]?.set(e.target.value)}
                  placeholder={currentProviderDef.keyPlaceholder}
                  className="w-full px-4 py-3 bg-[#0d1117] border border-[#252c3a] rounded-xl text-sm text-[#e0e6ed] placeholder-[#5a6478] focus:outline-none mono"
                  style={{ '--tw-ring-color': currentProviderDef.color + '80' }}
                />
                {/* Prefix warning */}
                {currentProviderDef.keyPrefix && providerKeyMap[selectedProvider]?.value && !providerKeyMap[selectedProvider].value.startsWith(currentProviderDef.keyPrefix) && (
                  <p className="text-xs text-[#ffd700] flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Key usually starts with "{currentProviderDef.keyPrefix}"
                  </p>
                )}
              </>
            )}

            {/* Ollama config */}
            {selectedProvider === 'ollama' && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-[#5a6478] mb-1 block">Model name</label>
                  <input
                    type="text"
                    value={ollamaModel}
                    onChange={(e) => setOllamaModel(e.target.value)}
                    placeholder="llama3.2"
                    className="w-full px-4 py-2.5 bg-[#0d1117] border border-[#252c3a] rounded-xl text-sm text-[#e0e6ed] placeholder-[#5a6478] focus:outline-none focus:border-[#ffffff]/30 mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#5a6478] mb-1 block">Base URL</label>
                  <input
                    type="text"
                    value={ollamaBaseUrl}
                    onChange={(e) => { setOllamaBaseUrl(e.target.value); setOllamaTest(null); }}
                    placeholder="http://localhost:11434"
                    className="w-full px-4 py-2.5 bg-[#0d1117] border border-[#252c3a] rounded-xl text-sm text-[#e0e6ed] placeholder-[#5a6478] focus:outline-none focus:border-[#ffffff]/30 mono"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={testOllama}
                    disabled={ollamaTesting}
                    className="px-4 py-2 bg-[#1a1f2b] text-[#e0e6ed] rounded-xl text-sm hover:bg-[#252c3a] transition-colors disabled:opacity-50"
                  >
                    {ollamaTesting ? 'Testing...' : 'Test Connection'}
                  </button>
                  {ollamaTest === 'success' && (
                    <span className="flex items-center gap-1 text-xs text-[#00ffc8]">
                      <CheckCircle className="w-3.5 h-3.5" /> Ollama is running
                    </span>
                  )}
                  {ollamaTest === 'error' && (
                    <span className="flex items-center gap-1 text-xs text-[#ff4976]">
                      <AlertTriangle className="w-3.5 h-3.5" /> Cannot connect. Is Ollama running?
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => setStep(0)}
                className="flex items-center gap-2 px-4 py-2.5 text-[#5a6478] hover:text-[#e0e6ed] text-sm transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { setSelectedProvider(''); setStep(2); }}
                  className="text-xs text-[#5a6478] hover:text-[#e0e6ed] transition-colors"
                >
                  Skip — use rule-based only
                </button>
                <button
                  onClick={() => setStep(2)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#00ffc8] text-[#0a0e14] rounded-xl text-sm font-semibold hover:bg-[#00ffc8]/90 transition-colors"
                >
                  Next <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Master Password */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-5 h-5 text-[#ffd700]" />
              <h2 className="text-lg font-semibold text-[#e0e6ed]">Master Password</h2>
            </div>
            <p className="text-sm text-[#5a6478]">
              Your API keys will be encrypted with AES-256 using this password. You'll need it each time you open TVK.
            </p>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={masterPassword}
                onChange={(e) => setMasterPassword(e.target.value)}
                placeholder="Enter master password (min 6 chars)"
                className="w-full px-4 py-3 pr-10 bg-[#0d1117] border border-[#252c3a] rounded-xl text-sm text-[#e0e6ed] placeholder-[#5a6478] focus:outline-none focus:border-[#ffd700]/50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5a6478] hover:text-[#e0e6ed]"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
              className="w-full px-4 py-3 bg-[#0d1117] border border-[#252c3a] rounded-xl text-sm text-[#e0e6ed] placeholder-[#5a6478] focus:outline-none focus:border-[#ffd700]/50"
            />
            {confirmPassword && masterPassword !== confirmPassword && (
              <p className="text-xs text-[#ff4976]">Passwords do not match</p>
            )}
            <div className="flex items-start gap-2 p-3 bg-[#ffd700]/5 rounded-lg border border-[#ffd700]/10">
              <AlertTriangle className="w-3.5 h-3.5 text-[#ffd700] shrink-0 mt-0.5" />
              <span className="text-[10px] text-[#5a6478]">
                If you forget this password, you'll need to reset and re-enter your API keys. The password is never stored — only used to encrypt/decrypt.
              </span>
            </div>
            {error && (
              <p className="text-xs text-[#ff4976] flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> {error}
              </p>
            )}
            <div className="flex justify-between pt-2">
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-2 px-4 py-2.5 text-[#5a6478] hover:text-[#e0e6ed] text-sm transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                onClick={handleComplete}
                disabled={saving || masterPassword.length < 6 || masterPassword !== confirmPassword}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#00ffc8] text-[#0a0e14] rounded-xl text-sm font-semibold hover:bg-[#00ffc8]/90 transition-colors disabled:opacity-50"
              >
                {saving ? 'Encrypting...' : 'Complete Setup'}
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-[#1a1f2b] text-center">
          <p className="text-[10px] text-[#5a6478]">
            Keys are encrypted locally with AES-256-GCM. They never leave your machine.
          </p>
        </div>
      </div>
    </div>
  );
}
