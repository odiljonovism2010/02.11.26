import React from 'react';
import { Users, UserPlus, Code, ShieldCheck, Trash2, Send } from 'lucide-react';

export default function TeamList({ team, onDeleteMember, onOpenAddModal }) {
  return (
    <div className="space-y-6">
      {/* Jamoa Sahifasi Headeri */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/40 p-5 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="text-indigo-400" size={22} />
            Jamoa A'zolari Ro'yxati ({team.length})
          </h2>
          <p className="text-slate-400 text-xs mt-1">Barcha qo'shilgan dasturchilar va ularning bilimlari</p>
        </div>

        <button 
          onClick={onOpenAddModal}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2 rounded-xl transition-all text-xs cursor-pointer shadow-lg shadow-indigo-500/20"
        >
          <UserPlus size={16} />
          <span>+ Yangi A'zo Qo'shish</span>
        </button>
      </div>

      {/* Agar jamoa bo'sh bo'lsa */}
      {team.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/30 border border-dashed border-slate-800 rounded-2xl">
          <Users size={48} className="mx-auto text-slate-600 mb-3" />
          <h3 className="text-lg font-semibold text-slate-300">Jamoada hali hech kim yo'q</h3>
          <p className="text-slate-500 text-xs mt-1 max-w-sm mx-auto">
            Tepadagi "+ Yangi A'zo Qo'shish" tugmasini bosib, jamoangizdagi dasturchilar ma'lumotlarini kiriting.
          </p>
        </div>
      ) : (
        /* A'zolar Cardlari Gridi */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {team.map((member) => {
            const isBand = member.status === 'Band';
            return (
              <div 
                key={member.id}
                className="bg-slate-900/60 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 transition-all duration-300 backdrop-blur-xl relative group flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">
                        {member.name}
                      </h4>
                      <p className="text-slate-400 text-xs font-medium mt-0.5">{member.role}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                        isBand ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {isBand ? 'Band' : 'Active'}
                      </span>

                      <button 
                        onClick={() => onDeleteMember(member.id)}
                        className="text-slate-500 hover:text-rose-400 p-1 rounded-lg transition-colors cursor-pointer"
                        title="O'chirish"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-800/40 w-max px-2.5 py-1 rounded-lg border border-slate-700/50">
                    <ShieldCheck size={14} className="text-indigo-400" />
                    <span>Darajasi: <strong className="text-indigo-300">{member.level}</strong></span>
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                      <Code size={12} /> Bilimlari (Skills):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {member.skills && member.skills.map((skill, index) => (
                        <span key={index} className="bg-slate-800 text-slate-300 text-xs px-2 py-0.5 rounded-md border border-slate-700/60">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {member.telegram && (
                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Telegram:</span>
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
          })}
        </div>
      )}
    </div>
  );
}