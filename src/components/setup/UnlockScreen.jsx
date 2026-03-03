import { useState } from 'react';
import { Activity, Lock, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function UnlockScreen() {
  const { unlock, resetKeys, error } = useAuth();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [showReset, setShowReset] = useState(false);

  const handleUnlock = async (e) => {
    e.preventDefault();
    if (!password) return;
    setUnlocking(true);
    await unlock(password);
    setUnlocking(false);
  };

  const handleReset = () => {
    resetKeys();
  };

  return (
    <div className="min-h-screen bg-[#0a0e14] flex items-center justify-center p-6">
      <div className="glass-card rounded-2xl p-8 max-w-sm w-full text-center">
        {/* Branding */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <Activity className="w-7 h-7 text-[#00ffc8]" />
          <span className="text-xl font-bold gradient-text">TVK</span>
        </div>
        <p className="text-xs text-[#5a6478] mb-6">
          (<span className="text-[#00ffc8]">T</span>rading <span className="text-[#00ffc8]">V</span>iew <span className="text-[#00ffc8]">K</span>ind-of)
        </p>

        <div className="w-14 h-14 rounded-2xl bg-[#ffd700]/10 flex items-center justify-center mx-auto mb-4">
          <Lock className="w-7 h-7 text-[#ffd700]" />
        </div>

        <h1 className="text-lg font-bold text-[#e0e6ed] mb-1">Welcome Back</h1>
        <p className="text-sm text-[#5a6478] mb-6">Enter your master password to decrypt your API keys</p>

        <form onSubmit={handleUnlock} className="space-y-4">
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Master password"
              autoFocus
              className="w-full px-4 py-3 pr-10 bg-[#0d1117] border border-[#252c3a] rounded-xl text-sm text-[#e0e6ed] placeholder-[#5a6478] focus:outline-none focus:border-[#ffd700]/50 text-center"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5a6478] hover:text-[#e0e6ed]"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {error && (
            <p className="text-xs text-[#ff4976] flex items-center justify-center gap-1">
              <AlertTriangle className="w-3 h-3" /> {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!password || unlocking}
            className="w-full py-3 bg-[#00ffc8] text-[#0a0e14] rounded-xl text-sm font-semibold hover:bg-[#00ffc8]/90 transition-colors disabled:opacity-50"
          >
            {unlocking ? 'Decrypting...' : 'Unlock'}
          </button>
        </form>

        <div className="mt-6">
          {!showReset ? (
            <button
              onClick={() => setShowReset(true)}
              className="text-xs text-[#5a6478] hover:text-[#ff4976] transition-colors"
            >
              Forgot password? Reset keys
            </button>
          ) : (
            <div className="p-3 bg-[#ff4976]/5 rounded-lg border border-[#ff4976]/10">
              <p className="text-xs text-[#ff4976] mb-2">This will delete all stored keys. You'll need to re-enter them.</p>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => setShowReset(false)}
                  className="px-3 py-1.5 text-xs text-[#5a6478] hover:text-[#e0e6ed] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReset}
                  className="px-3 py-1.5 bg-[#ff4976] text-white rounded-lg text-xs font-semibold hover:bg-[#ff4976]/90 transition-colors"
                >
                  Reset Everything
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
