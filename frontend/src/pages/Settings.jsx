import React, { useState } from 'react';
import useAuth from '../hooks/useAuth';
import { 
  Settings as SettingsIcon, 
  Key, 
  AlertTriangle, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  Loader2,
  Info
} from 'lucide-react';

const Github = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const Settings = () => {
  const { user, updateGithubToken } = useAuth();
  const [token, setToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleUpdateToken = async (e) => {
    e.preventDefault();
    if (!token) {
      setError('Please provide a valid token string.');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await updateGithubToken(token);
      setSuccess('GitHub Personal Access Token updated and encrypted successfully.');
      setToken('');
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-6 md:p-8 space-y-8 overflow-y-auto max-h-[calc(100vh-64px)]">
      
      {/* Header bar */}
      <div className="flex items-center gap-2 border-b border-slate-200/50 dark:border-slate-800/50 pb-5">
        <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/40 dark:border-slate-850 text-slate-500">
          <SettingsIcon size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-850 dark:text-slate-100 tracking-tight">
            Account Settings
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configure profile keys, tokens, and credentials securely.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Token Update Card (Left) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card">
            
            <h3 className="text-base font-bold text-slate-850 dark:text-slate-150 mb-6 flex items-center gap-2">
              <Github size={18} className="text-slate-700 dark:text-slate-300" />
              <span>GitHub Integration Token</span>
            </h3>

            {/* Banners */}
            {error && (
              <div className="flex items-start gap-2.5 p-3.5 mb-5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 dark:bg-rose-950/20 dark:border-rose-900/50 dark:text-rose-450 text-xs font-semibold">
                <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-start gap-2.5 p-3.5 mb-5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900/50 dark:text-emerald-450 text-xs font-semibold">
                <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                <span>{success}</span>
              </div>
            )}

            {user?.hasGithubToken && (
              <div className="flex items-center gap-3 p-4 mb-6 rounded-xl bg-emerald-50/50 border border-emerald-150 text-emerald-800 dark:bg-emerald-950/10 dark:border-emerald-900/40 dark:text-emerald-400">
                <CheckCircle2 className="shrink-0" size={20} />
                <div className="text-xs font-semibold">
                  <h5 className="font-bold">Token Configured Successfully</h5>
                  <p className="mt-0.5 opacity-90">
                    Linked account username: <strong className="underline">{user.githubUsername}</strong>. You can overwrite this by submitting a new token below.
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleUpdateToken} className="space-y-4">
              
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Personal Access Token (PAT)
                </label>
                
                <div className="relative">
                  <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type={showToken ? 'text' : 'password'}
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder={user?.hasGithubToken ? '••••••••••••••••••••••••••••••••••••••••' : 'ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'}
                    className="w-full pl-11 pr-11 py-3 rounded-xl border border-slate-200/80 bg-white/50 text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 focus:outline-none dark:border-slate-800 dark:bg-slate-900/55 dark:text-slate-100 transition-all text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-650"
                  >
                    {showToken ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] disabled:opacity-75 disabled:pointer-events-none text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-blue-500/10"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Encrypting and Saving...</span>
                  </>
                ) : (
                  <span>Update GitHub Token</span>
                )}
              </button>

            </form>
          </div>
        </div>

        {/* Info card (Right) */}
        <div className="space-y-6">
          <div className="glass-card">
            
            <h3 className="text-base font-bold text-slate-850 dark:text-slate-150 mb-4 flex items-center gap-2">
              <Info size={18} className="text-blue-550" />
              <span>How to generate a GitHub PAT?</span>
            </h3>

            <div className="text-xs text-slate-500 dark:text-slate-400 space-y-3 leading-relaxed">
              <p>
                To aggregate commits and sync metrics, DevTrackr queries the GitHub API. You must configure a Personal Access Token with the correct scopes.
              </p>
              
              <ol className="list-decimal pl-4 space-y-2">
                <li>
                  Go to <a href="https://github.com/settings/tokens" target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">GitHub &rarr; Developer Settings &rarr; Tokens (Classic)</a>.
                </li>
                <li>
                  Click <strong>Generate new token</strong>.
                </li>
                <li>
                  Check the following permissions (scopes):
                  <ul className="list-disc pl-4 mt-1 font-semibold space-y-1">
                    <li>`repo` (access repository commit data)</li>
                    <li>`read:user` (access basic user profile info)</li>
                  </ul>
                </li>
                <li>
                  Set duration (e.g. 30 days) and click <strong>Generate</strong>.
                </li>
                <li>
                  Copy the generated token string and paste it into the form.
                </li>
              </ol>

              <div className="p-3 bg-blue-50/50 dark:bg-blue-950/10 border border-blue-150 dark:border-blue-900/40 rounded-xl mt-4">
                💡 <strong>Data Privacy Note:</strong> We use an industry standard 256-bit encryption algorithm (`aes-256-cbc`) to store your token. Decryption occurs only in backend memory when querying stats.
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};

export default Settings;
