import React from 'react';
import { Plus, UserPlus } from 'lucide-react';

export default function Header({ onOpenAddModal, onOpenAddMemberModal, isDarkMode = true }) {
  return (
    <header className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border p-6 rounded-3xl backdrop-blur-xl shadow-xl transition-colors duration-300 ${
      isDarkMode ? 'bg-slate-900/60 border-slate-800/80' : 'bg-slate-50 border-slate-200'
    }`}>
      <div>
        <h1 className={`text-2xl font-black tracking-tight flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          IT Jamoa Boshqaruvi
        </h1>
        <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Loyihalar, jamoa a'zolari va moliyaviy hisob-kitoblar paneli</p>
      </div>

      <div className="flex items-center gap-3">
        {/* A'zo qo'shish tugmasi */}
        <button
          onClick={onOpenAddMemberModal}
          className={`flex items-center gap-2 font-semibold px-4 py-3 rounded-2xl transition-all text-xs cursor-pointer border shadow-md ${
            isDarkMode
              ? 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700/60'
              : 'bg-white hover:bg-slate-100 text-slate-900 border-slate-300'
          }`}
        >
          <UserPlus size={16} className="text-indigo-400" />
          <span>+ A'zo Qo'shish</span>
        </button>

        {/* Yangi Loyiha tugmasi */}
        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-semibold px-5 py-3 rounded-2xl transition-all text-xs cursor-pointer shadow-lg shadow-indigo-500/25 active:scale-95"
        >
          <Plus size={18} />
          <span>Yangi Loyiha</span>
        </button>
      </div>
    </header>
  );
}