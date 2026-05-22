import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { 
  Award, 
  ArrowRight, 
  BarChart3, 
  Bot, 
  Users, 
  GitPullRequest, 
  Zap, 
  FileText 
} from 'lucide-react';

const Landing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans selection:bg-blue-600/30 selection:text-white overflow-x-hidden scroll-smooth">
      
      {/* Dynamic Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-200px] left-1/4 w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute top-[-100px] right-1/4 w-[400px] h-[400px] rounded-full bg-indigo-600/10 blur-[100px]" />
      </div>

      {/* NAVBAR */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-900 bg-gray-950/80 backdrop-blur-md transition-all">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-6 md:px-8">
          
          {/* Left: Logo & Name */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
              <Award className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              DevTrackr
            </span>
          </Link>

          {/* Right: Actions */}
          <div className="flex items-center gap-4">
            <Link 
              to="/login" 
              className="px-4 py-2 text-sm font-semibold text-gray-300 hover:text-white border border-gray-800 hover:border-gray-700 rounded-xl transition-all"
            >
              Login
            </Link>
            <Link 
              to="/signup" 
              className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-md shadow-blue-500/10"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative z-10 max-w-5xl mx-auto pt-20 pb-24 px-6 text-center flex flex-col items-center">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-400 mb-8 animate-fade-in">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
          <span>AI Powered • Free to Use • GitHub Native</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-[1.1] max-w-4xl">
          Turn your GitHub activity into{' '}
          <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent">
            actionable team insights.
          </span>
        </h1>

        {/* Subtext */}
        <p className="mt-6 text-base sm:text-lg md:text-xl text-gray-400 max-w-3xl leading-relaxed">
          DevTrackr analyzes your commits, pull requests, and issues using AI to give your team real productivity insights — no manual reporting needed.
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link 
            to="/signup" 
            className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all text-sm flex items-center justify-center gap-2"
          >
            <span>Get Started Free</span>
            <ArrowRight size={16} />
          </Link>
          <Link 
            to="/login" 
            className="w-full sm:w-auto px-8 py-3.5 bg-gray-900 border border-gray-800 hover:border-gray-700 text-gray-200 hover:text-white font-bold rounded-xl transition-all text-sm flex items-center justify-center"
          >
            View Demo
          </Link>
        </div>

        {/* Bottom micro-text */}
        <p className="mt-6 text-xs text-gray-500 font-semibold tracking-wide">
          No credit card required • Free GitHub integration
        </p>
      </section>

      {/* FEATURES SECTION */}
      <section className="relative z-10 max-w-7xl mx-auto py-20 px-6 md:px-8 border-t border-gray-900">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Everything your team needs
          </h2>
          <p className="mt-4 text-sm sm:text-base text-gray-400">
            Streamline your metrics, reporting, and team velocity without leaving your browser.
          </p>
        </div>

        {/* Features 3x2 Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Card 1 */}
          <div className="bg-gray-900/60 hover:bg-gray-900 border border-gray-800/80 hover:border-gray-700 rounded-xl p-6 transition-all duration-300 group">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-450 border border-blue-500/20 mb-4 group-hover:scale-105 transition-transform">
              <BarChart3 size={20} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">📊 Commit Analytics</h3>
            <p className="text-sm text-gray-450 leading-relaxed">
              Visualize daily commit activity and code churn over 90 days.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-gray-900/60 hover:bg-gray-900 border border-gray-800/80 hover:border-gray-700 rounded-xl p-6 transition-all duration-300 group">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20 mb-4 group-hover:scale-105 transition-transform">
              <Bot size={20} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">🤖 AI Sprint Reports</h3>
            <p className="text-sm text-gray-450 leading-relaxed">
              Gemini AI summarizes your sprint, detects bottlenecks, and scores your team health automatically.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-gray-900/60 hover:bg-gray-900 border border-gray-800/80 hover:border-gray-700 rounded-xl p-6 transition-all duration-300 group">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20 mb-4 group-hover:scale-105 transition-transform">
              <Users size={20} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">👥 Contributor Insights</h3>
            <p className="text-sm text-gray-450 leading-relaxed">
              See who is contributing, who is inactive, and where effort is concentrated across your team.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-gray-900/60 hover:bg-gray-900 border border-gray-800/80 hover:border-gray-700 rounded-xl p-6 transition-all duration-300 group">
            <div className="w-10 h-10 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-450 border border-rose-500/20 mb-4 group-hover:scale-105 transition-transform">
              <GitPullRequest size={20} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">🔀 PR & Issue Tracking</h3>
            <p className="text-sm text-gray-450 leading-relaxed">
              Track open, merged, and closed pull requests and issues in one unified dashboard.
            </p>
          </div>

          {/* Card 5 */}
          <div className="bg-gray-900/60 hover:bg-gray-900 border border-gray-800/80 hover:border-gray-700 rounded-xl p-6 transition-all duration-300 group">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20 mb-4 group-hover:scale-105 transition-transform">
              <Zap size={20} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">⚡ Real-time GitHub Sync</h3>
            <p className="text-sm text-gray-450 leading-relaxed">
              Connect any GitHub repository instantly using your Personal Access Token. Data refreshes on demand.
            </p>
          </div>

          {/* Card 6 */}
          <div className="bg-gray-900/60 hover:bg-gray-900 border border-gray-800/80 hover:border-gray-700 rounded-xl p-6 transition-all duration-300 group">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 mb-4 group-hover:scale-105 transition-transform">
              <FileText size={20} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">📄 Export PDF Reports</h3>
            <p className="text-sm text-gray-450 leading-relaxed">
              Download a full productivity report as a PDF to share with your team or stakeholders.
            </p>
          </div>

        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="relative z-10 max-w-7xl mx-auto py-20 px-6 md:px-8 border-t border-gray-900">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Up and running in 3 steps
          </h2>
          <p className="mt-4 text-sm sm:text-base text-gray-400">
            No complex installations or permissions. Get insights directly from GitHub PATs.
          </p>
        </div>

        {/* 3 Step horizontal list */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          
          {/* Step 1 */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left relative">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 font-bold mb-6 text-lg">
              1
            </div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-3 justify-center md:justify-start">
              <span>🔐 Create your account</span>
            </h3>
            <p className="text-sm text-gray-405 leading-relaxed max-w-xs">
              Sign up free in seconds. No credit card required.
            </p>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left relative">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 font-bold mb-6 text-lg">
              2
            </div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-3 justify-center md:justify-start">
              <span>🔗 Connect your GitHub</span>
            </h3>
            <p className="text-sm text-gray-405 leading-relaxed max-w-xs">
              Paste your GitHub Personal Access Token and select any repository to analyze.
            </p>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left relative">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-600/10 border border-purple-500/20 text-purple-400 font-bold mb-6 text-lg">
              3
            </div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-3 justify-center md:justify-start">
              <span>📈 Get AI Insights</span>
            </h3>
            <p className="text-sm text-gray-405 leading-relaxed max-w-xs">
              DevTrackr fetches your repo data and Gemini AI generates a full productivity report instantly.
            </p>
          </div>

        </div>
      </section>

      {/* STATS SECTION */}
      <section className="relative z-10 max-w-7xl mx-auto py-16 px-6 md:px-8 border-t border-gray-900 bg-gray-900/20">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          
          {/* Stat 1 */}
          <div className="p-6">
            <div className="text-4xl sm:text-5xl font-extrabold text-blue-500 tracking-tight">
              90 Days
            </div>
            <p className="mt-3 text-xs sm:text-sm font-semibold uppercase text-gray-400 tracking-wider">
              Of GitHub activity analyzed per report
            </p>
          </div>

          {/* Stat 2 */}
          <div className="p-6 border-y sm:border-y-0 sm:border-x border-gray-900">
            <div className="text-4xl sm:text-5xl font-extrabold text-indigo-455 tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              6 Metrics
            </div>
            <p className="mt-3 text-xs sm:text-sm font-semibold uppercase text-gray-400 tracking-wider">
              Commits, PRs, Issues, Churn, Contributors, Health
            </p>
          </div>

          {/* Stat 3 */}
          <div className="p-6">
            <div className="text-4xl sm:text-5xl font-extrabold text-purple-500 tracking-tight">
              AI Powered
            </div>
            <p className="mt-3 text-xs sm:text-sm font-semibold uppercase text-gray-400 tracking-wider">
              Gemini AI generates every insight automatically
            </p>
          </div>

        </div>
      </section>

      {/* CTA SECTION */}
      <section className="relative z-10 max-w-5xl mx-auto py-24 px-6 text-center border-t border-gray-900">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Ready to understand your team's productivity?
        </h2>
        <p className="mt-4 text-sm sm:text-base text-gray-400 max-w-2xl mx-auto">
          Join developers who use DevTrackr to ship faster and smarter.
        </p>
        
        <div className="mt-8 flex flex-col items-center">
          <Link 
            to="/signup" 
            className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all text-sm"
          >
            Get Started Free →
          </Link>
          
          <Link 
            to="/login" 
            className="mt-4 text-xs font-semibold text-gray-400 hover:text-white transition-all underline"
          >
            Already have an account? Log in →
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-gray-900 bg-gray-950/40 text-xs text-gray-500 py-8 px-6 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>© 2026 DevTrackr. Built for developers.</span>
          <div className="flex gap-6 font-semibold">
            <span className="hover:text-gray-400 cursor-pointer">GitHub</span>
            <span className="hover:text-gray-400 cursor-pointer">Privacy</span>
            <span className="hover:text-gray-400 cursor-pointer">Terms</span>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Landing;
