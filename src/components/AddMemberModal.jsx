import React, { useState, useEffect } from 'react';
import { X, UserPlus, UserCheck } from 'lucide-react';

export default function AddMemberModal({ isOpen, onClose, onAddMember, onEditMember, editingMember, isDarkMode = true }) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('Frontend Developer');
  const [level, setLevel] = useState('Middle');
  const [telegram, setTelegram] = useState('');
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (editingMember) {
      setName(editingMember.name || '');
      setRole(editingMember.role || 'Frontend Developer');
      setLevel(editingMember.level || 'Middle');
      setTelegram(editingMember.telegram || '');
      setComment(editingMember.comment || '');
    } else {
      setName('');
      setRole('Frontend Developer');
      setLevel('Middle');
      setTelegram('');
      setComment('');
    }
  }, [editingMember, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name) return;

    const memberData = {
      id: editingMember ? editingMember.id : Date.now(),
      name,
      role,
      level,
      telegram,
      // Oylik maydonlari formadan olib tashlangan: tahrirlashda mavjud qiymatlar saqlanib qoladi
      assignedSalary: editingMember ? (parseFloat(editingMember.assignedSalary) || 0) : 0,
      paidAmount: editingMember ? (parseFloat(editingMember.paidAmount) || 0) : 0,
      comment,
      status: editingMember ? editingMember.status : 'Active',
      skills: ['React', 'JavaScript', 'Tailwind'] // Standart yoki kiritilgan skillar
    };

    if (editingMember) {
      onEditMember(memberData);
    } else {
      onAddMember(memberData);
    }

    onClose();
  };

  const labelCls = `block text-xs font-semibold mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`;
  const fieldCls = `w-full border rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-indigo-500 ${
    isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
  }`;

  return (
    <div
      className={`fixed inset-0 backdrop-blur-md flex items-center justify-center p-4 z-[9999] animate-fadeIn ${isDarkMode ? 'bg-black/80' : 'bg-slate-900/40'}`}
      onClick={onClose}
    >
      <div
        className={`border rounded-3xl w-full max-w-md p-6 space-y-5 shadow-2xl relative ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`flex items-center justify-between border-b pb-3 ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
          <div className="flex items-center gap-2 text-indigo-400">
            {editingMember ? <UserCheck size={20} /> : <UserPlus size={20} />}
            <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {editingMember ? "A'zo Ma'lumotlarini Tahrirlash" : "Yangi A'zo Qo'shish"}
            </h3>
          </div>
          <button type="button" onClick={onClose} className={`p-1.5 rounded-xl cursor-pointer ${isDarkMode ? 'text-slate-400 hover:text-white bg-slate-800' : 'text-slate-600 hover:text-black bg-slate-200'}`}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className={labelCls}>Ismi va Familiyasi</label>
            <input type="text" placeholder="Masalan: Ismoiljon Odiljonov" value={name} onChange={e => setName(e.target.value)} className={fieldCls} required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Yo'nalishi (Role)</label>
              <select value={role} onChange={e => setRole(e.target.value)} className={fieldCls}>
                <option value="Frontend Developer">Frontend Developer</option>
                <option value="Backend Developer">Backend Developer</option>
                <option value="Full Stack Developer">Full Stack Developer</option>
                <option value="UI/UX Designer">UI/UX Designer</option>
                <option value="Mobile Developer">Mobile Developer</option>
              </select>
            </div>

            <div>
              <label className={labelCls}>Darajasi (Level)</label>
              <select value={level} onChange={e => setLevel(e.target.value)} className={fieldCls}>
                <option value="Junior">Junior</option>
                <option value="Middle">Middle</option>
                <option value="Senior">Senior</option>
                <option value="Lead">Lead</option>
              </select>
            </div>
          </div>

          <div>
            <label className={labelCls}>Telegram (username)</label>
            <input type="text" placeholder="@username" value={telegram} onChange={e => setTelegram(e.target.value)} className={fieldCls} />
          </div>

          <div>
            <label className={labelCls}>A'zo haqida Izoh</label>
            <textarea placeholder="Tajribasi, qobiliyatlari yoki eslatmalar..." value={comment} onChange={e => setComment(e.target.value)} className={`${fieldCls} resize-none h-16`} />
          </div>

          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 rounded-xl text-xs cursor-pointer transition-all shadow-lg shadow-indigo-500/20">
            {editingMember ? "O'zgarishlarni Saqlash" : "A'zoni Saqlash"}
          </button>
        </form>
      </div>
    </div>
  );
}