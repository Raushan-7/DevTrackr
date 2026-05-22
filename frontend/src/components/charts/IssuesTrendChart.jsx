import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 p-3 rounded-xl shadow-lg backdrop-blur-sm">
        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mb-1.5">{label}</p>
        <div className="flex flex-col gap-1 text-xs font-semibold">
          <p className="text-blue-600 dark:text-blue-400">
            Open Issues: <span className="text-slate-800 dark:text-slate-200 font-bold">{payload[0].value}</span>
          </p>
          <p className="text-slate-500 dark:text-slate-450">
            Closed Issues: <span className="text-slate-800 dark:text-slate-200 font-bold">{payload[1].value}</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

const IssuesTrendChart = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center text-slate-450 dark:text-slate-500 text-sm gap-2 text-center">
        <span className="text-3xl">⚠️</span>
        <span>No issue statistics available.</span>
      </div>
    );
  }

  const formattedData = data.map(item => ({
    ...item,
    formattedDate: new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  }));

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
          <XAxis 
            dataKey="formattedDate" 
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="top" 
            height={36} 
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 12, fontWeight: 600 }}
          />
          <Line 
            type="monotone" 
            dataKey="open" 
            name="Open Issues"
            stroke="#3b82f6" 
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 6 }}
          />
          <Line 
            type="monotone" 
            dataKey="closed" 
            name="Closed Issues"
            stroke="#94a3b8" 
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default IssuesTrendChart;
