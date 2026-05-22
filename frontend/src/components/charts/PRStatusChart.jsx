import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl shadow-lg backdrop-blur-sm">
        <p className="text-xs font-semibold text-slate-800 dark:text-slate-250 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: data.color }}></span>
          {data.name}: <span className="font-bold">{data.value} PRs</span>
        </p>
      </div>
    );
  }
  return null;
};

const PRStatusChart = ({ data = {} }) => {
  const openCount = data.open || 0;
  const closedCount = data.closed || 0;
  const mergedCount = data.merged || 0;
  const total = openCount + closedCount + mergedCount;

  if (total === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-400 text-sm">
        No Pull Request data available
      </div>
    );
  }

  const chartData = [
    { name: 'Merged', value: mergedCount, color: '#10b981' }, // Green
    { name: 'Open', value: openCount, color: '#3b82f6' },     // Blue
    { name: 'Closed', value: closedCount, color: '#ef4444' }    // Red
  ];

  return (
    <div className="w-full h-64 flex flex-col justify-between">
      <div className="h-52 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<CustomTooltip />} />
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={75}
              paddingAngle={4}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center label showing total */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-[-5px]">
          <span className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">
            {total}
          </span>
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            Total PRs
          </span>
        </div>
      </div>

      {/* Custom Legend */}
      <div className="flex items-center justify-center gap-6 text-xs font-semibold mt-1">
        {chartData.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
            <span className="text-slate-500 dark:text-slate-450">{item.name}</span>
            <span className="text-slate-800 dark:text-slate-200">
              {item.value} ({total > 0 ? Math.round((item.value / total) * 100) : 0}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PRStatusChart;
