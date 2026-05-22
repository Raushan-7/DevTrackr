import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { 
  Sparkles, 
  Download, 
  Loader2, 
  AlertTriangle, 
  CheckCircle, 
  Compass, 
  ArrowRight,
  ClipboardList,
  Flame,
  Award
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import GeminiKeyPrompt from '../components/GeminiKeyPrompt';

const repoKey = `${(import.meta.env.VITE_APP_NAME || 'devtrackr').toLowerCase()}_active_repo`;
const tokenKey = `${(import.meta.env.VITE_APP_NAME || 'devtrackr').toLowerCase()}_token`;

const AIInsights = () => {
  const { setServerKeyFailed } = useAuth();
  const navigate = useNavigate();
  const [activeRepo, setActiveRepo] = useState(() => {
    const saved = localStorage.getItem(repoKey);
    return saved ? JSON.parse(saved) : null;
  });

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const owner = activeRepo?.owner || '';
  const repo = activeRepo?.name || activeRepo?.repo || '';

  const fetchAIReport = async () => {
    if (!owner || !repo) return;
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/ai/analyze', { owner, repo });
      setReport(response.data);
      setServerKeyFailed(false);
    } catch (err) {
      setError(err);
      if (err.response?.status === 402 || err.response?.data?.requiresUserKey) {
        setServerKeyFailed(true);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (owner && repo) {
      fetchAIReport();
    }
  }, [owner, repo]);

  const handleExportPDF = () => {
    if (!report) return;
    const token = localStorage.getItem(tokenKey);
    const reportId = report._id || report.id || 'demo';
    
    // We open it in a new window. To pass the auth token, we pass it as a query parameter.
    // The backend reports middleware will read this query token for authentication.
    const downloadUrl = `/api/reports/export/${reportId}?token=${token}&owner=${owner}&repo=${repo}`;
    window.open(downloadUrl, '_blank');
  };

  // Health Score color helper
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-500 stroke-emerald-500';
    if (score >= 60) return 'text-amber-500 stroke-amber-500';
    return 'text-rose-500 stroke-rose-500';
  };

  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-450';
    if (score >= 60) return 'bg-amber-50 text-amber-800 dark:bg-amber-950/20 dark:text-amber-450';
    return 'bg-rose-50 text-rose-800 dark:bg-rose-950/20 dark:text-rose-450';
  };

  if (!activeRepo) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-2xl mx-auto">
        <div className="h-16 w-16 bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-450 rounded-2xl flex items-center justify-center mb-6 border border-blue-200/50">
          <Sparkles size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">No Repo Selected</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-3 mb-8 text-sm leading-relaxed">
          Please select or connect a GitHub repository first, then run a sprint analysis.
        </p>
        <Link 
          to="/repos" 
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg transition-all"
        >
          <span>Select Repository</span>
          <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 md:p-8 space-y-8 overflow-y-auto max-h-[calc(100vh-64px)]">
      
      {/* Upper header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/50 dark:border-slate-800/50 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-blue-600 px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400 uppercase tracking-wider">
              Gemini AI Report
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
              {owner}/{repo}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-850 dark:text-slate-100 tracking-tight mt-1.5 flex items-center gap-2">
            <Sparkles className="text-indigo-500 animate-pulse" size={24} />
            <span>AI Team Insights & Analysis</span>
          </h1>
        </div>

        {report && (
          <button
            onClick={handleExportPDF}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 active:scale-[0.98] transition-all text-sm"
          >
            <Download size={16} />
            <span>Export PDF Report</span>
          </button>
        )}
      </div>

      {error ? (
        error.response?.status === 402 || error.response?.data?.requiresUserKey ? (
          <GeminiKeyPrompt onKeySaved={fetchAIReport} />
        ) : (
          <div className="p-5 rounded-2xl bg-red-50 dark:bg-rose-950/20 border border-red-200 dark:border-rose-900/50 text-red-700 dark:text-rose-450 flex items-center gap-3">
            <AlertTriangle className="shrink-0" />
            <div className="text-sm">
              <h4 className="font-bold">Failed to generate AI sprint report</h4>
              <p className="mt-0.5">{error.response?.data?.message || error.message || 'Failed to generate AI insights.'}</p>
            </div>
          </div>
        )
      ) : loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <Loader2 size={40} className="text-indigo-600 animate-spin stroke-[2.5]" />
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 animate-pulse">
            Gemini is compiling sprint commits and analyzing backlog bottlenecks...
          </p>
        </div>
      ) : report ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left / Mid Area: Summary, Bottlenecks, Priority Board */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Sprint Summary */}
            <div className="glass-card">
              <h3 className="text-base font-bold text-slate-850 dark:text-slate-150 mb-4 flex items-center gap-2">
                <Compass className="text-blue-500" size={18} />
                <span>Sprint Performance Summary</span>
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-350 leading-relaxed whitespace-pre-line">
                {report.sprintSummary}
              </p>
            </div>

            {/* Bottlenecks Badges */}
            <div className="glass-card">
              <h3 className="text-base font-bold text-slate-850 dark:text-slate-150 mb-4 flex items-center gap-2">
                <Flame className="text-orange-500" size={18} />
                <span>Detected Process Bottlenecks</span>
              </h3>
              {report.bottlenecks && report.bottlenecks.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {report.bottlenecks.map((item, idx) => (
                    <div 
                      key={idx} 
                      className="flex gap-3 p-4 rounded-xl bg-amber-50/50 border border-amber-100 dark:bg-amber-950/10 dark:border-amber-900/40"
                    >
                      <AlertTriangle className="text-amber-600 dark:text-amber-400 shrink-0" size={18} />
                      <div className="text-xs">
                        <span className="font-bold text-amber-800 dark:text-amber-400 block uppercase tracking-wider mb-1">
                          {item.badge}
                        </span>
                        <span className="text-slate-600 dark:text-slate-400 leading-normal">
                          {item.description}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-slate-500 text-sm py-2">
                  <CheckCircle className="text-emerald-500" size={16} />
                  <span>No bottlenecks detected in this cycle! Awesome work.</span>
                </div>
              )}
            </div>

            {/* Priority Action Board */}
            <div className="glass-card">
              <h3 className="text-base font-bold text-slate-850 dark:text-slate-150 mb-6 flex items-center gap-2">
                <ClipboardList className="text-indigo-500" size={18} />
                <span>Priority Action Board</span>
              </h3>
              
              <div className="overflow-hidden border border-slate-200/50 dark:border-slate-800/80 rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200/50 dark:border-slate-800/80 text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                      <th className="px-4 py-3">Task Description</th>
                      <th className="px-4 py-3 w-32 text-center">Urgency</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {report.priorityBoard?.map((item, idx) => {
                      const isHigh = item.priority?.toLowerCase() === 'high';
                      const isMed = item.priority?.toLowerCase() === 'medium';
                      
                      return (
                        <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                          <td className="px-4 py-3.5 text-slate-700 dark:text-slate-300 font-semibold leading-relaxed">
                            {item.task}
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wide text-[10px] ${
                              isHigh 
                                ? 'bg-red-100 text-red-700 border border-red-200 dark:bg-rose-950/20 dark:text-rose-450 dark:border-rose-900/50' 
                                : isMed 
                                ? 'bg-yellow-100 text-yellow-700 border border-yellow-200 dark:bg-amber-950/20 dark:text-amber-450 dark:border-amber-900/50' 
                                : 'bg-green-100 text-green-700 border border-green-200 dark:bg-blue-950/20 dark:text-blue-450 dark:border-blue-900/50'
                            }`}>
                              {item.priority}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* Right Column: Health Score Gauge, Recommendations */}
          <div className="space-y-8">
            
            {/* Health Score Circular Gauge */}
            <div className="glass-card flex flex-col items-center justify-center text-center">
              <h3 className="text-base font-bold text-slate-850 dark:text-slate-150 mb-6 flex items-center gap-2">
                <Award className="text-emerald-500" size={18} />
                <span>Team Health Index</span>
              </h3>

              <div className="relative w-44 h-44 mb-4">
                {/* SVG Radial Gauge */}
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    className="stroke-slate-200 dark:stroke-slate-800"
                    strokeWidth="8"
                    fill="transparent"
                    r="40"
                    cx="50"
                    cy="50"
                  />
                  <circle
                    className={`transition-all duration-1000 ease-out ${getScoreColor(report.gaugeScore)}`}
                    strokeWidth="8"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - (report.gaugeScore || 0) / 100)}`}
                    strokeLinecap="round"
                    fill="transparent"
                    r="40"
                    cx="50"
                    cy="50"
                  />
                </svg>
                
                {/* Center score labels */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-extrabold text-slate-800 dark:text-slate-100">
                    {report.gaugeScore}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">
                    out of 100
                  </span>
                </div>
              </div>

              {/* Text feedback banner */}
              <div className={`px-4 py-1.5 rounded-full font-bold text-xs uppercase tracking-wide ${getScoreBg(report.gaugeScore)}`}>
                {report.gaugeScore >= 80 ? 'Excellent Velocity' : report.gaugeScore >= 60 ? 'Stable Output' : 'Attention Needed'}
              </div>
            </div>

            {/* AI Recommendations */}
            <div className="glass-card">
              <h3 className="text-base font-bold text-slate-850 dark:text-slate-150 mb-4">
                Strategic Recommendations
              </h3>
              <ul className="space-y-4">
                {report.recommendations?.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-600 font-bold dark:bg-blue-950 dark:text-blue-400">
                      {index + 1}
                    </span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

        </div>
      ) : (
        <div className="flex h-[450px] flex-col items-center justify-center p-8 text-center glass-card">
          <Sparkles size={40} className="text-slate-400 dark:text-slate-500 mb-4" />
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No insights generated yet</h3>
          <p className="text-sm text-slate-500 dark:text-slate-450 mt-2 max-w-md">
            No insights generated yet. Click Analyze on any repository.
          </p>
          <button 
            onClick={fetchAIReport}
            className="mt-6 flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-md transition-all"
          >
            <span>Analyze Now</span>
          </button>
        </div>
      )}

    </div>
  );
};

export default AIInsights;
