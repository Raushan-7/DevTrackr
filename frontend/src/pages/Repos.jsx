import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGitHubRepos } from '../hooks/useGitHub';
import { useAnalyzeRepo } from '../hooks/useAI';
import { GitFork, Search, Sparkles, Loader2, Lock, Unlock, AlertTriangle, ArrowRight, ExternalLink } from 'lucide-react';

const repoKey = `${(import.meta.env.VITE_APP_NAME || 'devtrackr').toLowerCase()}_active_repo`;

const Repos = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const { data: repos = [], isLoading, error, refetch } = useGitHubRepos();
  const analyzeMutation = useAnalyzeRepo();

  const handleAnalyze = async (owner, repo) => {
    try {
      localStorage.setItem(repoKey, JSON.stringify({ owner, name: repo }));
      // Trigger the backend sync & analysis report generation
      await analyzeMutation.mutateAsync({ owner, repo });
      // Redirect to the insights view
      navigate('/insights');
    } catch (err) {
      console.error('Analysis failed:', err);
    }
  };

  const filteredRepos = repos.filter(repo => {
    const query = search.toLowerCase();
    const repoName = (repo.name || repo.repo || '').toLowerCase();
    const ownerName = (repo.owner || '').toLowerCase();
    return repoName.includes(query) || ownerName.includes(query);
  });

  return (
    <div className="flex-1 p-6 md:p-8 space-y-8 overflow-y-auto max-h-[calc(100vh-64px)]">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/50 dark:border-slate-800/50 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-850 dark:text-slate-100 tracking-tight">
            Tracked Repositories
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Choose repositories to analyze commits and create sprint summaries.
          </p>
        </div>

        {/* Search input field */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search repositories..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
          />
        </div>
      </div>

      {/* Main repo list grid */}
      {error ? (
        <div className="p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-450 flex items-center gap-3">
          <AlertTriangle className="shrink-0" />
          <div className="text-sm">
            <h4 className="font-bold">Failed to load repositories</h4>
            <p className="mt-0.5">{error.response?.data?.message || error.message || 'Please check if your GitHub token has correct permissions.'}</p>
          </div>
        </div>
      ) : isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-44 bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 animate-pulse"></div>
          ))}
        </div>
      ) : filteredRepos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredRepos.map((repo) => {
            const isAnalyzingThis = analyzeMutation.variables?.owner === repo.owner && analyzeMutation.variables?.repo === (repo.name || repo.repo);
            const isAnyAnalyzing = analyzeMutation.isPending;

            return (
              <div 
                key={repo.id} 
                className="glass-card hover:translate-y-[-2px] hover:shadow-md transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Title & Visibility badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/40 dark:border-slate-850">
                        <GitFork size={16} className="text-slate-655 dark:text-slate-400" />
                      </div>
                      <a 
                        href={`https://github.com/${repo.owner}/${repo.name || repo.repo}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-base font-bold text-slate-800 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1 group/link"
                      >
                        <span className="truncate max-w-[180px] sm:max-w-[240px]">
                          {repo.owner}/{repo.name || repo.repo}
                        </span>
                        <ExternalLink size={12} className="opacity-0 group-hover/link:opacity-100 transition-opacity" />
                      </a>
                    </div>

                    <div className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                      repo.private 
                        ? 'bg-amber-50 text-amber-700 border-amber-200/50 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50' 
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200/50 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50'
                    }`}>
                      {repo.private ? <Lock size={10} /> : <Unlock size={10} />}
                      <span>{repo.private ? 'Private' : 'Public'}</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-450 dark:text-slate-400 mt-4 line-clamp-2 h-8 leading-relaxed">
                    {repo.description || 'No repository description available.'}
                  </p>
                </div>

                {/* Lower Action buttons */}
                <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/50 pt-4 mt-6">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                    Actions
                  </span>

                  <button
                    onClick={() => handleAnalyze(repo.owner, repo.name || repo.repo)}
                    disabled={isAnyAnalyzing}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none rounded-xl transition-all shadow-md shadow-blue-500/10"
                  >
                    {isAnalyzingThis ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        <span>AI Analyzing...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={13} />
                        <span>AI Analysis</span>
                        <ArrowRight size={12} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex h-96 flex-col items-center justify-center p-8 text-center glass-card">
          <GitFork size={40} className="text-slate-400 dark:text-slate-500 mb-4" />
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No repositories found</h3>
          <p className="text-sm text-slate-500 dark:text-slate-450 mt-2 max-w-md">
            No repositories found. Add your GitHub PAT in Settings to get started.
          </p>
          <button 
            onClick={() => navigate('/settings')}
            className="mt-6 flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-md transition-all"
          >
            <span>Go to Settings</span>
          </button>
        </div>
      )}

    </div>
  );
};

export default Repos;
