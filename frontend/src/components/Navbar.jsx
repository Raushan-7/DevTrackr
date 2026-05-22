import React, { useEffect, useState } from 'react';
import { Sun, Moon, LogOut, Award } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import { Link } from 'react-router-dom';

const Github = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const Navbar = () => {
  const { user, logout } = useAuth();
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/80 transition-colors duration-200">
      <div className="flex h-16 items-center justify-between px-6">
        
        {/* Brand Logo */}
        <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
            <Award className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400">
            DevTrackr
          </span>
          <span className="text-[10px] font-semibold bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-md dark:bg-blue-950/50 dark:text-blue-400 uppercase tracking-wider">
            AI v2.5
          </span>
        </Link>

        {/* Action Controls & User Card */}
        <div className="flex items-center gap-4">
          
          {/* Theme Switcher */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
            title="Toggle theme"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {user && (
            <div className="flex items-center gap-3 border-l border-slate-200 dark:border-slate-800 pl-4">
              
              {/* GitHub Status Indicator */}
              <div 
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                  user.hasGithubToken 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50' 
                    : 'bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50'
                }`}
                title={user.hasGithubToken ? `Connected as ${user.githubUsername}` : 'GitHub PAT not configured'}
              >
                <Github size={13} className="stroke-[2.5]" />
                <span className="max-w-[80px] truncate">
                  {user.hasGithubToken ? user.githubUsername : 'Token Missing'}
                </span>
                <span className={`h-1.5 w-1.5 rounded-full ${user.hasGithubToken ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
              </div>

              {/* User Avatar Circle */}
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200 font-bold text-sm tracking-wide border border-blue-200/40 dark:border-blue-800/40 shadow-inner">
                {getInitials(user.name)}
              </div>

              {/* Name Details */}
              <div className="hidden md:flex flex-col text-left">
                <span className="text-sm font-semibold text-slate-850 dark:text-slate-200 leading-tight">
                  {user.name}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500">
                  {user.email}
                </span>
              </div>

              {/* Logout button */}
              <button
                onClick={logout}
                className="p-2 ml-1 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all"
                title="Log Out"
              >
                <LogOut size={18} />
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};

export default Navbar;
