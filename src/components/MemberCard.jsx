import React from 'react';
import { Trash2, Send, Code, ShieldCheck } from 'lucide-react';

export default function MemberCard({ member, onDelete }) {
  const isBand = member.status === 'Band';

  return (
    <div className="bg-slate-900/60 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 transition-all duration-300 backdrop-blur-xl relative group flex flex-col justify-between">
      
      {/* Yuqori qism (Ism va Status) */}
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">
              {member.name}
            </h4>
            <p className="text-slate-400 text-xs font-medium mt-0.5">{member.role}</p>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
              isBand ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            }`}>
              {isBand ? 'Band' : 'Active'}
            </span>

            <button 
              onClick={() => onDelete(member.id)}
              className="text-slate-500 hover:text-rose-400 p-1 rounded-lg transition-colors cursor-pointer"
              title="O'chirish"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* Level Badji */}
        <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-800/40 w-max px-2.5 py-1 rounded-lg border border-slate-700/50">
          <ShieldCheck size={14} className="text-indigo-400" />
          <span>Darajasi: <strong className="text-indigo-300">{member.level}</strong></span>
        </div>

        {/* Skills list */}
        <div className="space-y-1.5 pt-2">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Code size={12} /> Bilimlari (Skills):
          </span>
          <div className="flex flex-wrap gap-1.5">
            {member.skills && member.skills.map((skill, index) => (
              <span key={index} className="bg-slate-800 text-slate-300 text-xs px-2.5 py-1 rounded-md border border-slate-700/60">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Telegram aloqa */}
      {member.telegram && (
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <span className="text-slate-500">Aloqa:</span>
          <a 
            href={`https://t.me/${member.telegram.replace('@', '')}`} 
            target="_blank" 
            rel="noreferrer"
            className="flex items-center gap-1 text-sky-400 hover:text-sky-300 font-medium transition-colors"
          >
            <Send size={12} />
            {member.telegram}
          </a>
        </div>
      )}

    </div>
  );
}