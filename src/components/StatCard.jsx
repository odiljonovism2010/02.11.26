import React from 'react';

export default function StatCard({ item }) {
  const Icon = item.icon;
  
  return (
    <div className="group relative bg-slate-900/45 hover:bg-slate-900/80 border border-slate-800/80 hover:border-slate-700/80 rounded-2xl p-5 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 backdrop-blur-sm overflow-hidden">
      {/* Orqa fondagi yorug'lik effekt */}
      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${item.color} opacity-10 blur-2xl group-hover:opacity-25 transition-opacity`} />
      
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <span className="text-slate-400 text-sm font-medium tracking-wide">
            {item.title}
          </span>
          <div className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
            {item.value}
          </div>
        </div>

        <div className={`p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 ${item.textColor}`}>
          <Icon size={24} />
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-500">
        <span>{item.subtext}</span>
        <span className="font-semibold text-slate-400 group-hover:text-slate-200 transition-colors">
          Batafsil &rarr;
        </span>
      </div>
    </div>
  );
}