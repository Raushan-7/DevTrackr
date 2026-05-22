import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 p-3 rounded-xl shadow-lg backdrop-blur-sm">
        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mb-1.5">{label}</p>
        <div className="flex flex-col gap-1 text-xs font-semibold">
          <p className="text-emerald-600 dark:text-emerald-400">
            Lines Added: <span className="text-slate-800 dark:text-slate-200 font-bold">+{payload[0].value}</span>
          </p>
          <p className="text-rose-600 dark:text-rose-400">
            Lines Deleted: <span className="text-slate-800 dark:text-slate-200 font-bold">-{payload[1].value}</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

const CodeChurnChart = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center text-slate-450 dark:text-slate-500 text-sm gap-2 text-center">
        <span className="text-3xl">📈</span>
        <span>No code churn metrics available.</span>
      </div>
    );
  }

  const isDark = document.documentElement.classList.contains('dark');
  const tickColor = isDark ? '#9ca3af' : '#374151';
  const gridColor = isDark ? '#374151' : '#e5e7eb';

  const formattedData = data.map(item => ({
    ...item,
    formattedDate: new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  }));

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: -15, bottom: 5 }}>
          <defs>
            <linearGradient id="additionsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.01}/>
            </linearGradient>
            <linearGradient id="deletionsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0.01}/>
            </linearGradient>
          </defs>
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
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="top" 
            height={36} 
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 12, fontWeight: 600 }}
          />
          <Area 
            type="monotone" 
            dataKey="additions" 
            name="Additions"
            stroke="#10b981" 
            strokeWidth={2.5}
            fillOpacity={1} 
            fill="url(#additionsGrad)" 
          />
          <Area 
            type="monotone" 
            dataKey="deletions" 
            name="Deletions"
            stroke="#ef4444" 
            strokeWidth={2.5}
            fillOpacity={1} 
            fill="url(#deletionsGrad)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CodeChurnChart;
