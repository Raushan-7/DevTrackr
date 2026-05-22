import React, { useState } from 'react';
import { Eye, EyeOff, Loader2, Key, AlertTriangle } from 'lucide-react';
import useAuth from '../hooks/useAuth';

const GeminiKeyPrompt = ({ onKeySaved }) => {
  const { updateGeminiKey } = useAuth();
  const [key, setKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [statusType, setStatusType] = useState(''); // 'success' | 'error'

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!key.trim()) {
      setStatusMsg('❌ Please enter a valid key.');
      setStatusType('error');
      return;
    }

    setLoading(true);
    setStatusMsg('✅ Key saved! Generating your report...');
    setStatusType('success');

    try {
      await updateGeminiKey(key.trim());
      if (onKeySaved) {
        await onKeySaved();
      }
    } catch (err) {
      setStatusMsg('❌ This key also failed. Please check it and try again.');
      setStatusType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-450 space-y-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" size={20} />
        <div className="space-y-1">
          <h4 className="font-bold text-sm text-amber-900 dark:text-amber-300">🔑 API Limit Reached</h4>
          <p className="text-xs text-amber-850/90 dark:text-amber-400/90 leading-relaxed">
            The server's AI quota has been reached for today. Enter your own free Gemini API key to continue generating insights instantly.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 pl-8">
        <div className="relative max-w-md">
          <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-600/60 dark:text-amber-400/60" size={16} />
          <input
            type={showKey ? 'text' : 'password'}
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="Paste your Gemini API key here (AIzaSy...)"
            className="w-full pl-10 pr-10 py-2 py-2.5 rounded-xl border border-amber-200 bg-white text-slate-800 placeholder-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 focus:outline-none dark:border-amber-900/50 dark:bg-slate-900 dark:text-slate-100 transition-all text-xs"
            required
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            disabled={loading}
          >
            {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        <div className="text-xs">
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
          >
            Get a free API key at aistudio.google.com →
          </a>
        </div>

        <div className="flex items-center gap-4 pt-1">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 active:scale-[0.98] disabled:opacity-75 disabled:pointer-events-none text-white font-semibold rounded-xl text-xs transition-all shadow-md shadow-amber-500/10"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            <span>Save & Generate Report</span>
          </button>
        </div>
      </form>

      {statusMsg && (
        <div className={`text-xs font-semibold pl-8 ${statusType === 'success' ? 'text-emerald-600 dark:text-emerald-455' : 'text-rose-600 dark:text-rose-455'}`}>
          {statusMsg}
        </div>
      )}

      <p className="text-[10px] text-amber-700/80 dark:text-amber-500/60 pl-8">
        Your key is encrypted and stored securely. You can remove it anytime in Settings.
      </p>
    </div>
  );
};

export default GeminiKeyPrompt;
