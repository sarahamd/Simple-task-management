import React from 'react';

export const SkeletonCard: React.FC = () => {
  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 shadow-lg animate-pulse flex flex-col justify-between h-48">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="w-20 h-5 bg-slate-800 rounded-full"></div>
          <div className="w-14 h-5 bg-slate-800 rounded-full"></div>
        </div>
        <div className="w-3/4 h-5 bg-slate-800 rounded mb-2"></div>
        <div className="w-full h-4 bg-slate-800/60 rounded mb-1"></div>
        <div className="w-2/3 h-4 bg-slate-800/60 rounded"></div>
      </div>
      <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
        <div className="w-24 h-4 bg-slate-800 rounded"></div>
        <div className="w-12 h-4 bg-slate-800 rounded"></div>
      </div>
    </div>
  );
};

export const TaskSkeletonGrid: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
};
