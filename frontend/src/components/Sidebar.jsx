import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, GitFork, Sparkles, Settings as SettingsIcon } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();

  const links = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Repositories', path: '/repos', icon: GitFork },
    { name: 'AI Insights', path: '/insights', icon: Sparkles },
    { name: 'Settings', path: '/settings', icon: SettingsIcon },
  ];

  return (
    <aside className="w-64 border-r border-slate-200/80 bg-white/50 dark:border-slate-800/80 dark:bg-slate-950/20 px-4 py-6 hidden md:flex flex-col justify-between h-[calc(100vh-64px)] sticky top-16">
      <div className="flex flex-col gap-6">
        
        {/* Section label */}
        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-3">
          Navigation
        </span>

        {/* Links list */}
        <nav className="flex flex-col gap-1.5">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;

            return (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) => 
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10 dark:bg-blue-600 dark:text-white'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-900/50 hover:text-slate-800 dark:hover:text-slate-200'
                  }`
                }
              >
                <Icon 
                  size={18} 
                  className={`transition-transform duration-200 group-hover:scale-105 ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-650 dark:group-hover:text-slate-200'
                  }`} 
                />
                <span>{link.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer / Info Block */}
      <div className="p-3 bg-slate-50 dark:bg-slate-900/30 rounded-xl border border-slate-200/40 dark:border-slate-800/40 text-center">
        <h5 className="text-xs font-bold text-slate-800 dark:text-slate-350">
          DevTrackr Dashboard
        </h5>
        <p className="text-[10px] text-slate-450 dark:text-slate-500 mt-1">
          Increase delivery velocity with AI performance analysis.
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
