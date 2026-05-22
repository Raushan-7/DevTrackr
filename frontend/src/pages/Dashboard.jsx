import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useGitHubRepos, useRepoStats } from '../hooks/useGitHub';
import useAuth from '../hooks/useAuth';
import Card from '../components/Card';
import CommitActivityChart from '../components/charts/CommitActivityChart';
import PRStatusChart from '../components/charts/PRStatusChart';
import CodeChurnChart from '../components/charts/CodeChurnChart';
import IssuesTrendChart from '../components/charts/IssuesTrendChart';
import ContributorLeaderboard from '../components/charts/ContributorLeaderboard';
import { 
  GitCommit, 
  GitPullRequest, 
  AlertCircle, 
  Activity, 
  FolderPlus, 
  RefreshCw, 
  ArrowRight,
  Database,
  UserCheck
} from 'lucide-react';

const repoKey = `${(import.meta.env.VITE_APP_NAME || 'devtrackr').toLowerCase()}_active_repo`;

const Dashboard = () => {
  const { user, serverKeyFailed } = useAuth();
  const { data: repos = [], isLoading: reposLoading, refetch: refetchRepos } = useGitHubRepos();
  
  const [selectedRepo, setSelectedRepo] = useState(() => {
    const saved = localStorage.getItem(repoKey);
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (repos.length > 0 && !selectedRepo) {
      const defaultRepo = repos[0];
      setSelectedRepo(defaultRepo);
      localStorage.setItem(repoKey, JSON.stringify(defaultRepo));
    }
  }, [repos, selectedRepo]);

  const owner = selectedRepo?.owner || '';
  const repoName = selectedRepo?.name || selectedRepo?.repo || ''; // handle backend/mock structure variance

  const { 
    data: stats, 
    isLoading: statsLoading, 
    isFetching: statsFetching,
    error: statsError, 
    refetch: refetchStats 
  } = useRepoStats(owner, repoName);

  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const isFailed = serverKeyFailed || statsError?.response?.status === 402 || statsError?.response?.data?.requiresUserKey;
    if (isFailed && !user?.hasGeminiKey) {
      const dismissedTime = localStorage.getItem('gemini_banner_dismissed');
      if (!dismissedTime) {
        setShowBanner(true);
      } else {
        const timeDiff = Date.now() - parseInt(dismissedTime, 10);
        if (timeDiff > 24 * 60 * 60 * 1000) {
          setShowBanner(true);
        } else {
          setShowBanner(false);
        }
      }
    } else {
      setShowBanner(false);
    }
  }, [serverKeyFailed, statsError, user]);

  const handleDismissBanner = () => {
    localStorage.setItem('gemini_banner_dismissed', Date.now().toString());
    setShowBanner(false);
  };

  const handleRepoChange = (e) => {
    const repoId = parseInt(e.target.value);
    const repo = repos.find(r => r.id === repoId);
    if (repo) {
      setSelectedRepo(repo);
      localStorage.setItem(repoKey, JSON.stringify(repo));
    }
  };

  const syncActiveRepo = () => {
    refetchStats();
  };

  if (!user?.hasGithubToken && repos.length === 0 && !reposLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-2xl mx-auto">
        <div className="h-16 w-16 bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-450 rounded-2xl flex items-center justify-center mb-6 border border-blue-200/50 dark:border-blue-800/40">
          <Database size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Connect to GitHub</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-3 mb-8 text-sm leading-relaxed">
          DevTrackr needs a GitHub Personal Access Token (PAT) to retrieve metrics and analyze repositories. Your token will be securely encrypted using AES-256-cbc.
        </p>
        <Link 
          to="/settings" 
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 active:scale-[0.98] transition-all"
        >
          <span>Go to Settings</span>
          <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 md:p-8 space-y-8 overflow-y-auto max-h-[calc(100vh-64px)]">
      
      {showBanner && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-xl bg-amber-50 border border-amber-250 text-amber-800 dark:bg-amber-950/20 dark:border-amber-900/50 dark:text-amber-400 text-xs font-semibold shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-base">⚠️</span>
            <span>AI features are limited today due to API quota. Add your Gemini key in Settings to unlock full insights.</span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link 
              to="/settings" 
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 active:scale-[0.98] text-white font-semibold rounded-lg transition-all"
            >
              Go to Settings →
            </Link>
            <button 
              onClick={handleDismissBanner}
              className="px-3 py-1.5 border border-amber-300 hover:bg-amber-100 dark:border-amber-800 dark:hover:bg-amber-950/45 text-amber-700 dark:text-amber-350 font-semibold rounded-lg transition-all"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
      
      {/* Upper header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/50 dark:border-slate-800/50 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-850 dark:text-slate-100 tracking-tight">
            Developer Productivity
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Aggregated dashboard indicators over the last 90 days.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {reposLoading ? (
            <div className="h-10 w-44 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-xl"></div>
          ) : repos.length > 0 ? (
            <select
              value={selectedRepo?.id || ''}
              onChange={handleRepoChange}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-semibold cursor-pointer shadow-sm"
            >
              {repos.map((repo) => (
                <option key={repo.id} value={repo.id}>
                  {repo.owner}/{repo.name || repo.repo}
                </option>
              ))}
            </select>
          ) : (
            <Link 
              to="/repos" 
              className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl text-sm font-semibold transition-colors"
            >
              <FolderPlus size={16} />
              <span>Track Repositories</span>
            </Link>
          )}

          {selectedRepo && (
            <button
              onClick={syncActiveRepo}
              disabled={statsLoading || statsFetching}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 disabled:opacity-50 transition-colors"
              title="Sync Metrics"
            >
              <RefreshCw size={18} className={`${statsFetching ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Main content grid */}
      {statsError ? (
        <div className="p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-450 flex items-center gap-3">
          <AlertCircle className="shrink-0" />
          <div className="text-sm">
            <h4 className="font-bold">Failed to load statistics</h4>
            <p className="mt-0.5">{statsError.response?.data?.message || statsError.message || 'Rate limit or connection error.'}</p>
          </div>
        </div>
      ) : statsLoading ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 animate-pulse"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-80 bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 animate-pulse"></div>
            ))}
          </div>
        </div>
      ) : stats ? (
        <div className="space-y-8">
          
          {/* KPI Widget Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card 
              title="Total Commits"
              value={stats.summary?.totalCommits || 0}
              icon={GitCommit}
              trend="+12%"
              trendType="positive"
              description="last 90 days"
            />
            <Card 
              title="Open PRs"
              value={stats.summary?.openPRs || 0}
              icon={GitPullRequest}
              trend="Active"
              trendType="neutral"
              description="awaiting review"
            />
            <Card 
              title="Open Issues"
              value={stats.summary?.openIssues || 0}
              icon={AlertCircle}
              trend={`${stats.summary?.closedIssues || 0} closed`}
              trendType="positive"
              description="resolved tickets"
            />
            <Card 
              title="Code Churn"
              value={((stats.summary?.additions || 0) + (stats.summary?.deletions || 0)).toLocaleString()}
              icon={Activity}
              trend={`+${(stats.summary?.additions || 0).toLocaleString()} / -${(stats.summary?.deletions || 0).toLocaleString()}`}
              trendType="neutral"
              description="lines modified"
            />
          </div>

          {/* Charts Area Grids */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Commit Frequency */}
            <div className="glass-card">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-6">
                Commit Velocity
              </h3>
              <CommitActivityChart data={stats.charts?.commitActivity} />
            </div>

            {/* Pull Requests Status Breakdown */}
            <div className="glass-card">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-6">
                PR Pipeline Distribution
              </h3>
              <PRStatusChart data={stats.charts?.prStatus} />
            </div>

            {/* Code Churn Additions vs Deletions */}
            <div className="glass-card">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-6">
                Code Additions vs Deletions (Churn)
              </h3>
              <CodeChurnChart data={stats.charts?.codeChurn} />
            </div>

            {/* Open vs Closed Issues timelines */}
            <div className="glass-card">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-6">
                Issue Backlog Resolution
              </h3>
              <IssuesTrendChart data={stats.charts?.issuesTrend} />
            </div>

            {/* Contributor contributions */}
            <div className="glass-card lg:col-span-2">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-6">
                Top Contributors Leaderboard
              </h3>
              <ContributorLeaderboard data={stats.contributors} />
            </div>

          </div>

        </div>
      ) : (
        <div className="flex h-[450px] flex-col items-center justify-center p-8 text-center glass-card">
          <Database size={40} className="text-slate-400 dark:text-slate-500 mb-4" />
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No data yet</h3>
          <p className="text-sm text-slate-500 dark:text-slate-450 mt-2 max-w-md">
            No data yet. Select a repository and run an analysis.
          </p>
          <Link 
            to="/repos" 
            className="mt-6 flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-md transition-all"
          >
            <span>Go to Repositories</span>
          </Link>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
