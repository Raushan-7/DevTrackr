import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 p-3 rounded-xl shadow-lg backdrop-blur-sm">
        <p className="text-sm font-bold text-slate-800 dark:text-slate-105 mb-1.5">{data.username}</p>
        <div className="flex flex-col gap-1 text-xs">
          <p className="text-blue-600 dark:text-blue-400 font-semibold">
            Commits: <span className="text-slate-700 dark:text-slate-300 font-bold">{data.commits}</span>
          </p>
          <p className="text-emerald-600 dark:text-emerald-400 font-semibold">
            Additions: <span className="text-slate-700 dark:text-slate-300 font-bold">+{data.additions}</span>
          </p>
          <p className="text-rose-600 dark:text-rose-400 font-semibold">
            Deletions: <span className="text-slate-700 dark:text-slate-300 font-bold">-{data.deletions}</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

const ContributorLeaderboard = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center text-slate-450 dark:text-slate-500 text-sm gap-2 text-center">
        <span className="text-3xl">👥</span>
        <span>No contributor data available for this repository.</span>
      </div>
    );
  }

  // Sort contributors by commits descending and slice top 5
  const sortedData = [...data]
    .sort((a, b) => b.commits - a.commits)
    .slice(0, 5);

  const isDark = document.documentElement.classList.contains('dark');
  const tickColor = isDark ? '#9ca3af' : '#374151';
  const gridColor = isDark ? '#374151' : '#e5e7eb';

  const colors = ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef'];

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={sortedData}
          layout="vertical"
          margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={gridColor} />
          <XAxis 
            type="number" 
            tick={{ fill: tickColor, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <YAxis 
            dataKey="username" 
            type="category" 
            tick={{ fill: tickColor, fontSize: 11, fontWeight: 600 }}
            tickLine={false}
            axisLine={false}
            width={85}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99, 102, 241, 0.04)', radius: 4 }} />
          <Bar 
            dataKey="commits" 
            radius={[0, 4, 4, 0]}
            maxBarSize={24}
          >
            {sortedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ContributorLeaderboard;
