import React from 'react';

const Card = ({ title, value, icon: Icon, description, trend, trendType = 'neutral', className = '' }) => {
  const getTrendColor = () => {
    if (trendType === 'positive') return 'text-emerald-600 dark:text-emerald-400';
    if (trendType === 'negative') return 'text-rose-600 dark:text-rose-400';
    return 'text-slate-500 dark:text-slate-400';
  };

  return (
    <div className={`glass-card hover:translate-y-[-2px] hover:shadow-md transition-all duration-300 relative overflow-hidden group ${className}`}>
      {/* Background Glow */}
      <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/15 transition-all duration-300"></div>
      
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
          {title}
        </span>
        {Icon && (
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 transition-colors duration-300">
            <Icon size={20} className="stroke-[2px]" />
          </div>
        )}
      </div>
      
      <div className="flex flex-col gap-1">
        <h3 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
          {value}
        </h3>
        
        {(description || trend) && (
          <div className="flex items-center gap-1.5 mt-2 text-xs">
            {trend && (
              <span className={`font-semibold ${getTrendColor()}`}>
                {trend}
              </span>
            )}
            {description && (
              <span className="text-slate-400 dark:text-slate-500">
                {description}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Card;
