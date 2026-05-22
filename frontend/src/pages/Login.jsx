import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { Mail, Lock, AlertTriangle, ArrowRight, Loader2, Sparkles } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 transition-colors duration-200">
      
      {/* Background blobs for visual impact */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -z-10"></div>

      <div className="w-full max-w-md">
        
        {/* Top Branding Header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20 mb-4 animate-pulse">
            <Sparkles className="h-6 w-6" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
            Welcome back
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Access your engineering velocity insights dashboard.
          </p>
        </div>

        {/* Card Body */}
        <div className="glass-card shadow-xl border border-slate-200/50 dark:border-slate-800/50">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Error handling alert */}
            {error && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 dark:bg-rose-950/20 dark:border-rose-900/50 dark:text-rose-450 text-sm animate-shake">
                <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200/80 bg-white/50 text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 focus:outline-none dark:border-slate-800 dark:bg-slate-900/55 dark:text-slate-100 transition-all text-sm"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5 text-left">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200/80 bg-white/50 text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 focus:outline-none dark:border-slate-800 dark:bg-slate-900/55 dark:text-slate-100 transition-all text-sm"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] disabled:opacity-75 disabled:pointer-events-none transition-all shadow-md shadow-blue-500/10 hover:shadow-lg hover:shadow-blue-500/20"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Logging in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Seed account reminder helper */}
          <div className="mt-5 p-3 rounded-xl bg-slate-50 border border-slate-150 text-center dark:bg-slate-900/40 dark:border-slate-800/40">
            <p className="text-[11px] text-slate-500 dark:text-slate-450">
              💡 Testing offline? Use the seeded credentials: <br/>
              <strong className="text-slate-700 dark:text-slate-305">demo@devtrackr.com</strong> / <strong className="text-slate-700 dark:text-slate-305">password123</strong>
            </p>
          </div>
        </div>

        {/* Footer Redirect link */}
        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="font-bold text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300">
            Sign Up Free
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Login;
