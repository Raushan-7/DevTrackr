import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 p-3 rounded-xl shadow-lg backdrop-blur-sm">
        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mb-1">{label}</p>
        <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
          Commits: <span className="text-slate-800 dark:text-slate-100">{payload[0].value}</span>
        </p>
      </div>
    );
  }
  return null;
};

const CommitActivityChart = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center text-slate-450 dark:text-slate-500 text-sm gap-2 text-center">
        <span className="text-3xl">📊</span>
        <span>No commit activity data available.</span>
      </div>
    );
  }

  const isDark = document.documentElement.classList.contains('dark');
  const tickColor = isDark ? '#9ca3af' : '#374151';
  const gridColor = isDark ? '#374151' : '#e5e7eb';

  // Adjust values for dates to be human readable
  const formattedData = data.map(item => ({
    ...item,
    formattedDate: new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  }));

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
          <XAxis 
            dataKey="formattedDate" 
            tick={{ fill: tickColor, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            tick={{ fill: tickColor, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59, 130, 246, 0.05)', radius: 4 }} />
          <Bar 
            dataKey="commits" 
            fill="#3b82f6" 
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CommitActivityChart;
