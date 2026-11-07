import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Users, UserCheck, UserX, FolderCheck, 
  Clock, Briefcase, Wallet, TrendingUp, CreditCard,
  X, UserPlus, Trash2, CheckCircle2, Check, MessageSquare, DollarSign, Edit3, Sun, Moon, Trash, RotateCcw, ArrowLeft, Send, HandCoins, StickyNote, Save, History
} from 'lucide-react';
import Header from './components/Header';
import AddMemberModal from './components/AddMemberModal';

// Pul matnini songa aylantirish (probel va vergullarni olib tashlaydi)
// localStorage dan xavfsiz o'qish (buzilgan ma'lumot ilovani yiqitmasin)
const loadStored = (key, fallback) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
};

// Bugungi sana (mahalliy vaqt, YYYY-MM-DD). toISOString UTC bergani uchun ishlatilmaydi
const todayStr = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const toNum = (v) => parseFloat(String(v ?? 0).replace(/\s+/g, '').replace(/,/g, '')) || 0;

export default function App() {
  const [team, setTeam] = useState(() => loadStored('it_jamoa_members', []));

  const [projects, setProjects] = useState(() => loadStored('it_jamoa_projects', []));

  const [trashProjects, setTrashProjects] = useState(() => loadStored('it_jamoa_trash_projects', []));

  const [trashTeam, setTrashTeam] = useState(() => loadStored('it_jamoa_trash_team', []));

  const [personalNotes, setPersonalNotes] = useState(() => loadStored('it_jamoa_personal_notes', []));
  const [newNoteText, setNewNoteText] = useState('');

  const [isDarkMode, setIsDarkMode] = useState(() => loadStored('it_jamoa_theme', true));

  const [activeModal, setActiveModal] = useState(null); 
  const [selectedProjectInfoId, setSelectedProjectInfoId] = useState(null);
  
  const [selectedMemberInfo, setSelectedMemberInfo] = useState(null);
  const [payUserSalaryModal, setPayUserSalaryModal] = useState(null);
  const [salaryPayAmount, setSalaryPayAmount] = useState('');
  const [viewHistoryMember, setViewHistoryMember] = useState(null);

  const [partialPayModalProject, setPartialPayModalProject] = useState(null);
  const [partialPayAmount, setPartialPayAmount] = useState('');

  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);

  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  const [newProject, setNewProject] = useState({
    name: '',
    client: '',
    totalPrice: '',
    paidPrice: '',
    comment: '',
    date: todayStr(),
    deadline: '',
    assignedUsers: []
  });

  const [activeTrashTab, setActiveTrashTab] = useState('projects');
  const [projectSortOrder, setProjectSortOrder] = useState('newest'); // 'newest' | 'oldest'

  const USD_RATE = 12800;

  const formatMoney = (value) => {
    if (!value && value !== 0) return '';
    const stringValue = value.toString().replace(/\s+/g, '').replace(/[^0-9.]/g, '');
    const parts = stringValue.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return parts.join('.');
  };

  // Dasturchi statusi (Band/Active) jarayondagi loyihalarga qarab avtomatik belgilanadi
  useEffect(() => {
    const busy = new Set();
    projects.forEach(p => {
      if (p.status === 'jarayonda') (p.assignedUsers || []).forEach(n => busy.add(n));
    });
    setTeam(prev => {
      let changed = false;
      const next = prev.map(m => {
        const status = busy.has(m.name) ? 'Band' : 'Active';
        if (m.status !== status) { changed = true; return { ...m, status }; }
        return m;
      });
      return changed ? next : prev;
    });
  }, [projects, team.length]);

  const formatUsd = (value) => `$${formatMoney((toNum(value) / USD_RATE).toFixed(2))}`;

  const sortProjects = (list) =>
    [...list].sort((a, b) => (projectSortOrder === 'newest' ? b.id - a.id : a.id - b.id));

  useEffect(() => {
    localStorage.setItem('it_jamoa_members', JSON.stringify(team));
  }, [team]);

  useEffect(() => {
    localStorage.setItem('it_jamoa_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('it_jamoa_trash_projects', JSON.stringify(trashProjects));
  }, [trashProjects]);

  useEffect(() => {
    localStorage.setItem('it_jamoa_trash_team', JSON.stringify(trashTeam));
  }, [trashTeam]);

  useEffect(() => {
    localStorage.setItem('it_jamoa_personal_notes', JSON.stringify(personalNotes));
  }, [personalNotes]);

  useEffect(() => {
    localStorage.setItem('it_jamoa_theme', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setActiveModal(null);
        setSelectedProjectInfoId(null);
        setSelectedMemberInfo(null);
        setPayUserSalaryModal(null);
        setViewHistoryMember(null);
        setPartialPayModalProject(null);
        setIsAddProjectOpen(false);
        setIsAddMemberOpen(false);
        setEditingProject(null);
        setEditingMember(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const selectedProjectInfo = projects.find(p => p.id === selectedProjectInfoId);

  const totalUsers = team.length;
  const activeUsers = team.filter(m => m.status === 'Active');
  const activeUsersCount = activeUsers.length;
  const bandUsers = team.filter(m => m.status === 'Band');
  const bandUsersCount = bandUsers.length;

  const totalProjectsCount = projects.length;
  const completedProjectsList = projects.filter(p => p.status === 'topshirilgan');
  const completedProjectsCount = completedProjectsList.length;
  
  const inProgressProjectsList = projects.filter(p => p.status === 'jarayonda');
  const inProgressProjectsCount = inProgressProjectsList.length;

  const debtProjectsList = projects.filter(p => (toNum(p?.totalPrice) - toNum(p?.paidPrice)) > 0);

  const calculatedQarzlarSumma = projects.reduce((sum, p) => {
    return sum + Math.max(0, toNum(p?.totalPrice) - toNum(p?.paidPrice));
  }, 0);

  const calculatedTarixAndUmumiySumma = projects.reduce((sum, p) => sum + toNum(p?.paidPrice), 0);

  const calculatedCompletedPaidSumma = completedProjectsList.reduce((sum, p) => sum + toNum(p?.paidPrice), 0);

  const handleAddMember = (member) => {
    const newMemberWithFinance = {
      ...member,
      id: Date.now(),
      assignedSalary: toNum(member.assignedSalary), 
      paidAmount: toNum(member.paidAmount),
      bossNote: member.bossNote || '',
      status: member.status || 'Active',
      salaryHistory: [] 
    };
    setTeam(prev => [...prev, newMemberWithFinance]);
    setIsAddMemberOpen(false);
  };

  const handleEditMember = (updatedMember) => {
    const oldMember = team.find(m => m.id === updatedMember.id);
    if (oldMember && oldMember.name !== updatedMember.name) {
      setProjects(prev => prev.map(p => (
        (p.assignedUsers || []).includes(oldMember.name)
          ? { ...p, assignedUsers: p.assignedUsers.map(n => (n === oldMember.name ? updatedMember.name : n)) }
          : p
      )));
    }
    setTeam(prev => prev.map(m => {
      if (m.id === updatedMember.id) {
        return {
          ...m,
          ...updatedMember,
          assignedSalary: toNum(updatedMember.assignedSalary),
        };
      }
      return m;
    }));
    setEditingMember(null);
    setIsAddMemberOpen(false);
  };

  const handleDeleteMember = (id) => {
    const memberToTrash = team.find(m => m.id === id);
    if (memberToTrash) {
      setTrashTeam(prev => [...prev, memberToTrash]);
      setTeam(prev => prev.filter(m => m.id !== id));
      setSelectedMemberInfo(null);
    }
  };

  const handleRestoreMember = (id) => {
    const memberToRestore = trashTeam.find(m => m.id === id);
    if (memberToRestore) {
      setTeam(prev => [...prev, memberToRestore]);
      setTrashTeam(prev => prev.filter(m => m.id !== id));
    }
  };

  const handlePermanentDeleteMember = (id) => {
    if (window.confirm("A'zoni butunlay o'chirib tashlashni tasdiqlaysizmi?")) {
      setTrashTeam(prev => prev.filter(m => m.id !== id));
    }
  };

  const handleUpdateBossNote = (id, noteText) => {
    setTeam(prev => prev.map(m => m.id === id ? { ...m, bossNote: noteText } : m));
  };

  const handlePaySalarySubmit = (e) => {
    e.preventDefault();
    if (!payUserSalaryModal) return;

    const amount = toNum(salaryPayAmount);
    if (amount <= 0) return;

    const now = new Date();
    const dateStr = now.toLocaleDateString();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    setTeam(prev => prev.map(m => {
      if (m.id === payUserSalaryModal.id) {
        const currentPaid = parseFloat(m.paidAmount || 0) || 0;
        const newPaid = currentPaid + amount;
        const historyList = m.salaryHistory || [];

        const newRecord = {
          id: Date.now(),
          amount: amount,
          date: dateStr,
          time: timeStr,
          type: 'Oylik berildi'
        };

        return {
          ...m,
          paidAmount: newPaid,
          salaryHistory: [newRecord, ...historyList]
        };
      }
      return m;
    }));

    setPayUserSalaryModal(null);
    setSalaryPayAmount('');
  };

  const handleSendPersonalNote = (e) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    const newNote = {
      id: Date.now(),
      text: newNoteText.trim(),
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setPersonalNotes(prev => [...prev, newNote]);
    setNewNoteText('');
  };

  const handleDeletePersonalNote = (id) => {
    setPersonalNotes(prev => prev.filter(n => n.id !== id));
  };

  const openEditProjectModal = (project) => {
    setSelectedProjectInfoId(null);
    // Userlar sahifasida bo'lsak, o'sha sahifadan chiqib ketmaymiz
    setActiveModal(prev => (prev === 'only_users' ? prev : null));
    setEditingProject(project);
    setNewProject({
      name: project.name || '',
      client: project.client || '',
      totalPrice: formatMoney(project.totalPrice || ''),
      paidPrice: formatMoney(project.paidPrice || ''),
      comment: project.comment || '',
      date: project.date || todayStr(),
      deadline: project.deadline || '',
      assignedUsers: project.assignedUsers || []
    });
    setIsAddProjectOpen(true);
  };

  const handleSaveProject = (e) => {
    e.preventDefault();
    if (!newProject.name) return;

    const total = toNum(newProject.totalPrice);
    const paidInput = toNum(newProject.paidPrice);
    const paid = paidInput > total ? total : paidInput;

    const now = new Date();
    const dateStr = now.toLocaleDateString();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    if (editingProject) {
      setProjects(prev => prev.map(p => {
        if (p.id === editingProject.id) {
          const oldPaid = toNum(p.paidPrice);
          const diff = paid - oldPaid;
          const historyList = p.paymentHistory || [];
          let updatedHistory = [...historyList];

          if (diff > 0) {
            updatedHistory.unshift({
              id: Date.now(),
              amount: diff,
              date: dateStr,
              time: timeStr,
              type: 'Tahrirlash orqali qoʻshildi'
            });
          }

          return {
            ...p,
            name: newProject.name,
            client: newProject.client,
            totalPrice: total,
            paidPrice: paid,
            comment: newProject.comment,
            date: newProject.date,
            deadline: newProject.deadline,
            assignedUsers: [...newProject.assignedUsers],
            paymentHistory: updatedHistory
          };
        }
        return p;
      }));
      setEditingProject(null);
    } else {
      let initialHistory = [];
      if (paid > 0) {
        initialHistory.push({
          id: Date.now(),
          amount: paid,
          date: newProject.date || dateStr,
          time: timeStr,
          type: 'Oldindan toʻlov'
        });
      }

      const proj = {
        id: Date.now(),
        name: newProject.name,
        client: newProject.client,
        totalPrice: total,
        paidPrice: paid,
        comment: newProject.comment,
        date: newProject.date,
        deadline: newProject.deadline,
        assignedUsers: [...newProject.assignedUsers],
        status: 'jarayonda',
        paymentHistory: initialHistory
      };

      setProjects(prev => [...prev, proj]);
    }

    setNewProject({ name: '', client: '', totalPrice: '', paidPrice: '', comment: '', date: todayStr(), deadline: '', assignedUsers: [] });
    setIsAddProjectOpen(false);
  };

  const handleToggleProjectStatus = (projId) => {
    setProjects(prev => prev.map(p => (
      p.id === projId
        ? { ...p, status: p.status === 'jarayonda' ? 'topshirilgan' : 'jarayonda' }
        : p
    )));
  };

  const handleDeleteProject = (id) => {
    const proj = projects.find(p => p.id === id);
    if (proj) {
      setTrashProjects(prev => [...prev, proj]);
      setProjects(prev => prev.filter(p => p.id !== id));
      setSelectedProjectInfoId(null);
    }
  };

  const handleRestoreProject = (id) => {
    const proj = trashProjects.find(p => p.id === id);
    if (proj) {
      setProjects(prev => [...prev, proj]);
      setTrashProjects(prev => prev.filter(p => p.id !== id));
    }
  };

  const handlePermanentDeleteProject = (id) => {
    if (window.confirm("Loyihani butunlay o'chirib tashlashni tasdiqlaysizmi?")) {
      setTrashProjects(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleFullPayProject = (projId) => {
    const now = new Date();
    const dateStr = now.toLocaleDateString();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    setProjects(prev => prev.map(p => {
      if (p.id === projId) {
        const total = toNum(p.totalPrice);
        const paid = toNum(p.paidPrice);
        const diff = total - paid;

        if (diff <= 0) return p;

        const historyList = p.paymentHistory || [];
        const updatedHistory = [{
          id: Date.now(),
          amount: diff,
          date: dateStr,
          time: timeStr,
          type: 'Qarz toʻliq toʻlandi'
        }, ...historyList];

        return {
          ...p,
          paidPrice: total,
          paymentHistory: updatedHistory
        };
      }
      return p;
    }));
  };

  const handlePartialPaySubmit = (e) => {
    e.preventDefault();
    if (!partialPayModalProject) return;

    const addAmount = toNum(partialPayAmount);
    if (addAmount <= 0) return;

    const now = new Date();
    const dateStr = now.toLocaleDateString();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    setProjects(prev => prev.map(p => {
      if (p.id === partialPayModalProject.id) {
        const total = toNum(p.totalPrice);
        const paid = toNum(p.paidPrice);
        const newPaid = Math.min(total, paid + addAmount);
        const actualAdded = newPaid - paid;
        if (actualAdded <= 0) return p;

        const historyList = p.paymentHistory || [];
        const updatedHistory = [{
          id: Date.now(),
          amount: actualAdded,
          date: dateStr,
          time: timeStr,
          type: 'Boʻlaklab toʻlandi'
        }, ...historyList];

        return {
          ...p,
          paidPrice: newPaid,
          paymentHistory: updatedHistory
        };
      }
      return p;
    }));

    setPartialPayModalProject(null);
    setPartialPayAmount('');
  };

  const statsList = [
    { id: 1, type: 'umumiySumma', title: "Umumiy Summa", value: `${formatMoney(calculatedTarixAndUmumiySumma)} so'm`, subvalue: `$${formatMoney((calculatedTarixAndUmumiySumma / USD_RATE).toFixed(2))}`, subtext: "Qo'lga teggan jami naqt pul", icon: Wallet, color: "from-emerald-500 to-teal-600", textColor: "text-emerald-500" },
    { id: 2, type: 'kutilayotgan', title: "Kutilayotgan Summa (Qarzlar)", value: `${formatMoney(calculatedQarzlarSumma)} so'm`, subvalue: `$${formatMoney((calculatedQarzlarSumma / USD_RATE).toFixed(2))}`, subtext: "Mijozlardan olinishi kerak", icon: TrendingUp, color: "from-amber-500 to-yellow-600", textColor: "text-amber-500" },
    { id: 3, type: 'qarzlar', title: "Qarzlar Tafsiloti", value: `${debtProjectsList.length} ta qarzdor`, subvalue: "", subtext: "Hali to'liq to'lamaganlar", icon: CreditCard, color: "from-rose-500 to-red-600", textColor: "text-rose-500" },

    { id: 4, type: 'only_users_card', title: "Users (A'zolar)", value: totalUsers.toString(), subvalue: "", subtext: "Barcha dasturchilar", icon: Users, color: "from-blue-500 to-indigo-600", textColor: "text-blue-500" },
    { id: 5, type: 'band_users', title: "Band Users", value: bandUsersCount.toString(), subvalue: "", subtext: "Loyihada bandlar", icon: UserX, color: "from-amber-500 to-orange-600", textColor: "text-amber-500" },
    { id: 6, type: 'active_users', title: "Active Users", value: activeUsersCount.toString(), subvalue: "", subtext: "Bo'sh / Tayyor", icon: UserCheck, color: "from-cyan-500 to-blue-600", textColor: "text-cyan-500" },

    { id: 7, type: 'projects', title: "Umumiy Loyihalar", value: totalProjectsCount.toString(), subvalue: "", subtext: "Qabul qilingan barcha", icon: Briefcase, color: "from-purple-500 to-violet-600", textColor: "text-purple-500" },
    { id: 8, type: 'history', title: "Topshirilgan Loyihalar", value: completedProjectsCount.toString(), subvalue: "", subtext: "Muvaffaqiyatli topshirilgan", icon: FolderCheck, color: "from-green-500 to-emerald-600", textColor: "text-green-500" },
    { id: 9, type: 'jarayonda', title: "Jarayondagi Loyihalar", value: inProgressProjectsCount.toString(), subvalue: "", subtext: "Hozirda ishlanmoqda", icon: Clock, color: "from-sky-500 to-blue-600", textColor: "text-sky-500" },
  ];

  // Active / Band dasturchilar modali uchun ixcham karta (860 x ~195)
  const renderMemberModalCard = (member, isActive) => (
    <div
      key={member.id}
      className={`w-full max-w-[860px] mx-auto min-h-[195px] p-4 rounded-2xl border transition-all shadow-md flex flex-col justify-between gap-3 ${isDarkMode ? 'bg-slate-950/80 border-slate-800/90' : 'bg-slate-50 border-slate-200'}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <h4 onClick={() => setSelectedMemberInfo(member)} className="font-bold text-base text-indigo-400 cursor-pointer hover:underline">{member.name}</h4>
          <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{member.role} • <span className="text-slate-400">{member.level || 'Junior'}</span></p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${isActive ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'}`}>{isActive ? 'Active' : 'Band'}</span>
          <button type="button" onClick={() => { setActiveModal(null); setEditingMember(member); setIsAddMemberOpen(true); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer bg-indigo-600/20 text-indigo-400 border-indigo-500/30 hover:bg-indigo-600/30 transition-all">
            <Edit3 size={14} />
            <span>Tahrirlash</span>
          </button>
          <button type="button" onClick={() => handleDeleteMember(member.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer bg-rose-600/20 text-rose-400 border-rose-500/30 hover:bg-rose-600/30 transition-all">
            <Trash2 size={14} />
            <span>O'chirish</span>
          </button>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className={`block text-xs font-bold flex items-center gap-1.5 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}>
          <StickyNote size={13} />
          <span>O'zim uchun eslatma:</span>
        </label>
        <textarea rows={3} value={member.bossNote || ''} onChange={(e) => handleUpdateBossNote(member.id, e.target.value)} className={`w-full border rounded-xl p-3 text-xs focus:outline-none focus:border-amber-500 transition-all resize-none ${isDarkMode ? 'bg-slate-900 border-slate-800 text-amber-200 placeholder-slate-600' : 'bg-white border-slate-300 text-amber-900 placeholder-slate-400'}`} placeholder="Eslatma yozing..." />
      </div>
    </div>
  );

  // =====================================================================
  // UMUMIY MODALLAR — ham asosiy sahifada, ham "Userlar bo'limi"da ishlaydi
  // =====================================================================
  const sharedModals = createPortal(
    <>
      {/* DASTURCHI TAFSILOTLARI MODALI */}
      {selectedMemberInfo && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-[9999] animate-fadeIn" onClick={() => setSelectedMemberInfo(null)}>
          <div className={`border rounded-3xl w-full max-w-md p-6 space-y-5 shadow-2xl relative ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'}`} onClick={(e) => e.stopPropagation()}>
            <div className={`flex items-center justify-between border-b pb-3 ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
              <div className="flex items-center gap-2.5 text-indigo-400">
                <Users size={22} />
                <h3 className="text-base font-bold">{selectedMemberInfo.name} — Ma'lumotlar</h3>
              </div>
              <button type="button" onClick={() => setSelectedMemberInfo(null)} className={`p-1.5 rounded-xl cursor-pointer ${isDarkMode ? 'text-slate-400 hover:text-white bg-slate-800' : 'text-slate-600 hover:text-black bg-slate-200'}`}><X size={18} /></button>
            </div>

            <div className="space-y-3 text-xs">
              <div className={`p-3.5 rounded-2xl border flex justify-between items-center ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <span className="text-slate-400">Mutaxassislik (Role):</span>
                <strong className="text-indigo-400">{selectedMemberInfo.role || 'Nomaʼlum'}</strong>
              </div>

              <div className={`p-3.5 rounded-2xl border flex justify-between items-center ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <span className="text-slate-400">Darajasi (Level):</span>
                <strong className="text-emerald-400">{selectedMemberInfo.level || 'Junior'}</strong>
              </div>

              <div className={`p-3.5 rounded-2xl border flex justify-between items-center ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <span className="text-slate-400">Statusi:</span>
                <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider text-[10px] ${selectedMemberInfo.status === 'Active' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'}`}>
                  {selectedMemberInfo.status}
                </span>
              </div>

              <div className={`p-3.5 rounded-2xl border space-y-1.5 ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex justify-between">
                  <span className="text-slate-400">Belgilangan oylik:</span>
                  <strong className="text-white">{formatMoney(selectedMemberInfo.assignedSalary || 0)} so'm</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Berilgan oylik:</span>
                  <strong className="text-emerald-400">{formatMoney(selectedMemberInfo.paidAmount || 0)} so'm</strong>
                </div>
                <div className="flex justify-between border-t pt-1 border-slate-800">
                  <span className="text-slate-400">Qolgan maosh:</span>
                  <strong className="text-rose-500 font-bold">{formatMoney(Math.max(0, (parseFloat(selectedMemberInfo.assignedSalary || 0) - parseFloat(selectedMemberInfo.paidAmount || 0))))} so'm</strong>
                </div>
              </div>

              {selectedMemberInfo.bossNote && (
                <div className={`p-3.5 rounded-2xl border space-y-1 ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-amber-400 font-bold block">Eslatma:</span>
                  <p className="text-slate-300">{selectedMemberInfo.bossNote}</p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button type="button" onClick={() => { const m = selectedMemberInfo; setSelectedMemberInfo(null); setEditingMember(m); setIsAddMemberOpen(true); }} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 rounded-xl text-xs cursor-pointer transition-all shadow-md flex items-center justify-center gap-1.5">
                <Edit3 size={14} />
                <span>Tahrirlash</span>
              </button>
              <button type="button" onClick={() => handleDeleteMember(selectedMemberInfo.id)} className="bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 font-semibold px-4 py-2.5 rounded-xl text-xs cursor-pointer transition-all flex items-center gap-1.5">
                <Trash2 size={14} />
                <span>O'chirish</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OYLIK BERISH MODALI */}
      {payUserSalaryModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-[9999] animate-fadeIn" onClick={() => setPayUserSalaryModal(null)}>
          <div className={`border rounded-3xl w-full max-w-md p-6 space-y-5 shadow-2xl relative ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'}`} onClick={(e) => e.stopPropagation()}>
            <div className={`flex items-center justify-between border-b pb-3 ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
              <div className="flex items-center gap-2 text-emerald-400">
                <DollarSign size={22} />
                <h3 className="text-base font-bold">{payUserSalaryModal.name} — Oylik Berish</h3>
              </div>
              <button type="button" onClick={() => setPayUserSalaryModal(null)} className={`p-1.5 rounded-xl cursor-pointer ${isDarkMode ? 'text-slate-400 hover:text-white bg-slate-800' : 'text-slate-600 hover:text-black bg-slate-200'}`}><X size={18} /></button>
            </div>

            <form onSubmit={handlePaySalarySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1 text-emerald-400">Qancha pul berildi? (so'm)</label>
                <input 
                  type="text" 
                  placeholder="Masalan: 1 500 000" 
                  value={salaryPayAmount} 
                  onChange={e => setSalaryPayAmount(formatMoney(e.target.value))} 
                  className={`w-full border rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-emerald-500 ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`} 
                  autoFocus 
                  required 
                />
                {salaryPayAmount && !isNaN(parseFloat(String(salaryPayAmount).replace(/\s+/g, ''))) && (
                  <p className="text-[11px] text-sky-400 mt-1 font-semibold">
                    ≈ $ {formatMoney((parseFloat(String(salaryPayAmount).replace(/\s+/g, '')) / USD_RATE).toFixed(2))}
                  </p>
                )}
              </div>

              <button type="submit" className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold py-3 rounded-xl text-xs cursor-pointer transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5">
                <Save size={15} />
                <span>To'lovni Saqlash</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* OYLIK TARIXI MODALI */}
      {viewHistoryMember && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-[9999] animate-fadeIn" onClick={() => setViewHistoryMember(null)}>
          <div className={`border rounded-3xl w-full max-w-md p-6 space-y-5 shadow-2xl relative ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'}`} onClick={(e) => e.stopPropagation()}>
            <div className={`flex items-center justify-between border-b pb-3 ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
              <div className="flex items-center gap-2 text-sky-400">
                <History size={22} />
                <h3 className="text-base font-bold">{viewHistoryMember.name} — Oylik tarixi</h3>
              </div>
              <button type="button" onClick={() => setViewHistoryMember(null)} className={`p-1.5 rounded-xl cursor-pointer ${isDarkMode ? 'text-slate-400 hover:text-white bg-slate-800' : 'text-slate-600 hover:text-black bg-slate-200'}`}><X size={18} /></button>
            </div>

            <div className={`max-h-64 overflow-y-auto space-y-2.5 p-3 rounded-2xl border ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              {!viewHistoryMember.salaryHistory || viewHistoryMember.salaryHistory.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-8">Hozircha to'lovlar tarixi mavjud emas.</p>
              ) : (
                viewHistoryMember.salaryHistory.map(item => (
                  <div key={item.id} className="flex items-center justify-between text-xs py-2 border-b border-slate-800/40 last:border-0">
                    <div>
                      <strong className="text-emerald-400">+{formatMoney(item.amount)} so'm</strong> <span className="text-sky-400 text-[10px] font-semibold">({formatUsd(item.amount)})</span>
                      <p className="text-[10px] opacity-70">📅 {item.date} • ⏰ {item.time}</p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold">{item.type}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* BO'LAKLAB TO'LASH MODALI */}
      {partialPayModalProject && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-[9999] animate-fadeIn" onClick={() => setPartialPayModalProject(null)}>
          <div className={`border rounded-3xl w-full max-w-md p-6 space-y-5 shadow-2xl relative ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'}`} onClick={(e) => e.stopPropagation()}>
            <div className={`flex items-center justify-between border-b pb-3 ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
              <div className="flex items-center gap-2 text-amber-400">
                <HandCoins size={22} />
                <h3 className="text-base font-bold">{partialPayModalProject.name} — Bo'laklab To'lash</h3>
              </div>
              <button type="button" onClick={() => setPartialPayModalProject(null)} className={`p-1.5 rounded-xl cursor-pointer ${isDarkMode ? 'text-slate-400 hover:text-white bg-slate-800' : 'text-slate-600 hover:text-black bg-slate-200'}`}><X size={18} /></button>
            </div>

            <form onSubmit={handlePartialPaySubmit} className="space-y-4">
              <div>
                <label className={`block text-xs font-semibold mb-1 text-emerald-400`}>Qancha pul olindi? (so'm)</label>
                <input 
                  type="text" 
                  placeholder="Masalan: 500 000" 
                  value={partialPayAmount} 
                  onChange={e => setPartialPayAmount(formatMoney(e.target.value))} 
                  className={`w-full border rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-emerald-500 ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`} 
                  autoFocus 
                  required 
                />
                {partialPayAmount && !isNaN(parseFloat(String(partialPayAmount).replace(/\s+/g, ''))) && (
                  <p className="text-[11px] text-sky-400 mt-1 font-semibold">
                    ≈ $ {formatMoney((parseFloat(String(partialPayAmount).replace(/\s+/g, '')) / USD_RATE).toFixed(2))}
                  </p>
                )}
              </div>

              <button type="submit" className="w-full bg-gradient-to-r from-amber-600 to-emerald-600 hover:from-amber-500 hover:to-emerald-500 text-white font-semibold py-3 rounded-xl text-xs cursor-pointer transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5">
                <Save size={15} />
                <span>To'lovni Saqlash</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* LOYIHA TAFSILOTLARI MODALI */}
      {selectedProjectInfo && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-[9999] animate-fadeIn" onClick={() => setSelectedProjectInfoId(null)}>
          <div className={`border rounded-3xl w-full max-w-xl max-h-[85vh] overflow-y-auto p-6 space-y-6 shadow-2xl relative ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'}`} onClick={(e) => e.stopPropagation()}>
            <div className={`flex items-center justify-between border-b pb-4 ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
              <div>
                <span className={`text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider ${selectedProjectInfo.status === 'topshirilgan' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-sky-500/15 text-sky-400 border border-sky-500/30'}`}>
                  {selectedProjectInfo.status === 'topshirilgan' ? 'Topshirilgan' : 'Jarayonda'}
                </span>
                <h2 className="text-xl font-extrabold mt-2 text-indigo-400">{selectedProjectInfo.name}</h2>
              </div>
              <button type="button" onClick={() => setSelectedProjectInfoId(null)} className={`p-2 rounded-xl cursor-pointer ${isDarkMode ? 'text-slate-400 hover:text-white bg-slate-800' : 'text-slate-600 hover:text-black bg-slate-200'}`}><X size={18} /></button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>Mijoz:</span>
                <p className="font-bold text-sm mt-0.5">{selectedProjectInfo.client || 'Kiritilmagan'}</p>
              </div>
              <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>Deadline:</span>
                <p className="font-bold text-sm mt-0.5 text-rose-500">{selectedProjectInfo.deadline || 'Oʻrnatilmagan'}</p>
              </div>
              <div className={`col-span-2 p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>Loyiha olingan sana:</span>
                <p className="font-bold text-sm mt-0.5 text-sky-400">{selectedProjectInfo.date || 'Kiritilmagan'}</p>
              </div>
            </div>

            <div className={`p-4 rounded-2xl border space-y-2 text-xs ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex justify-between">
                <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>Umumiy narx:</span>
                <strong className="text-white text-sm text-right">{formatMoney(selectedProjectInfo.totalPrice)} so'm <span className="block text-[11px] text-sky-400">{formatUsd(selectedProjectInfo.totalPrice)}</span></strong>
              </div>
              <div className="flex justify-between">
                <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>To'langan:</span>
                <strong className="text-emerald-400 text-sm text-right">{formatMoney(selectedProjectInfo.paidPrice || 0)} so'm <span className="block text-[11px] text-sky-400">{formatUsd(selectedProjectInfo.paidPrice || 0)}</span></strong>
              </div>
              <div className="flex justify-between border-t pt-2 border-slate-800">
                <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>Qolgan qarz:</span>
                <strong className="text-rose-500 text-sm">
                  {formatMoney(Math.max(0, toNum(selectedProjectInfo.totalPrice) - toNum(selectedProjectInfo.paidPrice)))} so'm
                  <span className="block text-[11px] text-sky-400 text-right">{formatUsd(Math.max(0, toNum(selectedProjectInfo.totalPrice) - toNum(selectedProjectInfo.paidPrice)))}</span>
                </strong>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold flex items-center gap-1.5 text-sky-400">
                <History size={15} />
                <span>To'lovlar tarixi (Sana va summalar):</span>
              </h4>
              <div className={`max-h-40 overflow-y-auto space-y-2 p-3 rounded-2xl border ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                {!selectedProjectInfo.paymentHistory || selectedProjectInfo.paymentHistory.length === 0 ? (
                  <p className="text-[11px] text-slate-500 italic">Hozircha qo'shimcha to'lovlar tarixi yo'q.</p>
                ) : (
                  selectedProjectInfo.paymentHistory.map(item => (
                    <div key={item.id} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-800/40 last:border-0">
                      <div>
                        <strong className="text-emerald-400">+{formatMoney(item.amount)} so'm</strong> <span className="text-sky-400 text-[10px] font-semibold">({formatUsd(item.amount)})</span>
                        <p className="text-[10px] opacity-70">📅 {item.date} ({item.time || '00:00'}) • {item.note || item.type || 'Toʻlov'}</p>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-sky-500/10 text-sky-400">Naqd/O'tkazma</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div>
              <span className={`block text-xs font-semibold mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Mas'ul Dasturchilar:</span>
              <div className="flex flex-wrap gap-1.5">
                {selectedProjectInfo.assignedUsers && selectedProjectInfo.assignedUsers.length > 0 ? (
                  selectedProjectInfo.assignedUsers.map((uName, idx) => (
                    <span key={idx} className="bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 px-3 py-1 rounded-full text-xs font-medium">
                      {uName}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500 italic">Dasturchilar biriktirilmagan</span>
                )}
              </div>
            </div>

            {selectedProjectInfo.comment && (
              <div className={`p-3.5 rounded-2xl border text-xs ${isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                <strong>Izoh:</strong> {selectedProjectInfo.comment}
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
              <button type="button" onClick={() => handleToggleProjectStatus(selectedProjectInfo.id)} className={`flex-1 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all border ${selectedProjectInfo.status === 'topshirilgan' ? 'bg-sky-600/20 text-sky-400 border-sky-500/30 hover:bg-sky-600/30' : 'bg-emerald-600/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-600/30'}`}>
                {selectedProjectInfo.status === 'topshirilgan' ? 'Jarayonga qaytarish' : 'Topshirildi deb belgilash'}
              </button>

              <button type="button" onClick={() => openEditProjectModal(selectedProjectInfo)} className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold cursor-pointer transition-all">
                Tahrirlash
              </button>

              <button type="button" onClick={() => handleDeleteProject(selectedProjectInfo.id)} className="p-2.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 rounded-xl cursor-pointer transition-all">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LOYIHA QO'SHISH / TAHRIRLASH MODALI */}
      {isAddProjectOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-[9999] animate-fadeIn" onClick={() => setIsAddProjectOpen(false)}>
          <div className={`border rounded-3xl w-full max-w-lg p-6 space-y-5 shadow-2xl relative ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'}`} onClick={(e) => e.stopPropagation()}>
            <div className={`flex items-center justify-between border-b pb-3 ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
              <div className="flex items-center gap-2 text-indigo-400">
                <Briefcase size={22} />
                <h3 className="text-base font-bold">{editingProject ? "Loyihani Tahrirlash" : "Yangi Loyiha Qo'shish"}</h3>
              </div>
              <button type="button" onClick={() => setIsAddProjectOpen(false)} className={`p-1.5 rounded-xl cursor-pointer ${isDarkMode ? 'text-slate-400 hover:text-white bg-slate-800' : 'text-slate-600 hover:text-black bg-slate-200'}`}><X size={18} /></button>
            </div>

            <form onSubmit={handleSaveProject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Loyiha Nomi</label>
                <input type="text" placeholder="Masalan: CRM Sistemasi" value={newProject.name} onChange={e => setNewProject({ ...newProject, name: e.target.value })} className={`w-full border rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-indigo-500 ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`} required />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Mijoz Ismi</label>
                  <input type="text" placeholder="Mijoz F.I.O" value={newProject.client} onChange={e => setNewProject({ ...newProject, client: e.target.value })} className={`w-full border rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-indigo-500 ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`} />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-sky-400">Loyiha olingan sana (avtomatik)</label>
                  <input type="date" style={{ colorScheme: isDarkMode ? 'dark' : 'light' }} value={newProject.date} onChange={e => setNewProject({ ...newProject, date: e.target.value })} className={`w-full border rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-sky-500 ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`} required />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-rose-400">Deadline (Topshirish sanasi)</label>
                <input type="date" style={{ colorScheme: isDarkMode ? 'dark' : 'light' }} value={newProject.deadline} onChange={e => setNewProject({ ...newProject, deadline: e.target.value })} className={`w-full border rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-rose-500 ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`} required />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-indigo-400">Umumiy Narx (so'm)</label>
                  <input type="text" placeholder="Masalan: 5 000 000" value={newProject.totalPrice} onChange={e => setNewProject({ ...newProject, totalPrice: formatMoney(e.target.value) })} className={`w-full border rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-indigo-500 ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`} required />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-emerald-400">Oldindan To'lov (so'm)</label>
                  <input type="text" placeholder="Masalan: 1 000 000" value={newProject.paidPrice} onChange={e => setNewProject({ ...newProject, paidPrice: formatMoney(e.target.value) })} className={`w-full border rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-emerald-500 ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Izoh / Ma'lumot</label>
                <textarea rows={2} placeholder="Loyiha haqida qisqacha..." value={newProject.comment} onChange={e => setNewProject({ ...newProject, comment: e.target.value })} className={`w-full border rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-indigo-500 resize-none ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`} />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Mas'ul Dasturchilar</label>
                <div className={`max-h-36 overflow-y-auto border rounded-xl p-2.5 space-y-1.5 ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-300'}`}>
                  {team.length === 0 ? (
                    <p className="text-[11px] text-slate-500 italic">Avval jamoaga a'zolar qo'shing.</p>
                  ) : (
                    team.map(m => {
                      const isChecked = newProject.assignedUsers.includes(m.name);
                      return (
                        <label key={m.id} className={`flex items-center justify-between p-2 rounded-lg cursor-pointer text-xs transition-colors ${isChecked ? (isDarkMode ? 'bg-indigo-600/20 text-indigo-300' : 'bg-indigo-50 text-indigo-900') : (isDarkMode ? 'hover:bg-slate-900 text-slate-300' : 'hover:bg-slate-100 text-slate-700')}`}>
                          <span className="font-medium">{m.name} <span className="opacity-60 text-[10px]">({m.role})</span></span>
                          <input type="checkbox" checked={isChecked} onChange={(e) => {
                            if (e.target.checked) {
                              setNewProject({ ...newProject, assignedUsers: [...newProject.assignedUsers, m.name] });
                            } else {
                              setNewProject({ ...newProject, assignedUsers: newProject.assignedUsers.filter(name => name !== m.name) });
                            }
                          }} className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer" />
                        </label>
                      );
                    })
                  )}
                </div>
              </div>

              <button type="submit" className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-semibold py-3 rounded-xl text-xs cursor-pointer transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-1.5">
                <Save size={15} />
                <span>Loyihani Saqlash</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* A'ZO QO'SHISH / TAHRIRLASH MODALI */}
      <AddMemberModal 
        isOpen={isAddMemberOpen} 
        onClose={() => setIsAddMemberOpen(false)} 
        onAddMember={handleAddMember} 
        onEditMember={handleEditMember}
        editingMember={editingMember}
        isDarkMode={isDarkMode}
      />
    </>,
    document.body
  );

  // =====================================================================
  // USERLAR BO'LIMI SAHIFASI
  // =====================================================================
  if (activeModal === 'only_users') {
    return (
      <div className={`min-h-screen p-3 sm:p-6 lg:p-10 font-sans selection:bg-indigo-500 selection:text-white transition-colors duration-300 ${isDarkMode ? 'bg-[#030712] text-slate-100' : 'bg-slate-100 text-slate-900'}`}>
        <div className="w-full mx-auto space-y-6">
          <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl border shadow-2xl ${isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <button 
                type="button"
                onClick={() => setActiveModal(null)}
                className={`p-3.5 sm:px-5 sm:py-3.5 rounded-2xl border cursor-pointer transition-all flex items-center gap-2 font-bold text-sm shrink-0 shadow-md ${
                  isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-100 hover:bg-slate-700' : 'bg-slate-100 border-slate-300 text-slate-900 hover:bg-slate-200'
                }`}
              >
                <ArrowLeft size={20} />
                <span>Orqaga qaytish</span>
              </button>
              
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-2xl bg-blue-500/15 text-blue-400 border border-blue-500/30"><Users size={32} /></div>
                <div>
                  <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight">Users (A'zolar) Bo'limi</h1>
                  <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Faqatgina dasturchilar ro'yxati</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`p-6 rounded-3xl border shadow-2xl flex flex-col justify-between h-[450px] ${isDarkMode ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center justify-between border-b pb-4 border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                    <MessageSquare size={22} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base">O'zim uchun eslatma (Izbranniy)</h3>
                    <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Telegram chat ko'rinishida</p>
                  </div>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-bold border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-600'}`}>
                  {personalNotes.length} ta xabar
                </span>
              </div>

              <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1">
                {personalNotes.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <MessageSquare size={40} className="mb-2 opacity-20 text-slate-400" />
                    <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Hozircha eslatmalar yo'q.</p>
                  </div>
                ) : (
                  personalNotes.map(note => (
                    <div key={note.id} className={`p-3.5 rounded-2xl border max-w-[85%] ml-auto relative group shadow-sm ${isDarkMode ? 'bg-indigo-950/40 border-indigo-900/50 text-indigo-100' : 'bg-indigo-50 border-indigo-200 text-indigo-950'}`}>
                      <p className="text-xs break-words">{note.text}</p>
                      <div className="flex items-center justify-end gap-2 mt-1">
                        <span className="text-[10px] opacity-60">{note.date}</span>
                        <button type="button" onClick={() => handleDeletePersonalNote(note.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-rose-400 hover:text-rose-500">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleSendPersonalNote} className="relative pt-3 border-t border-slate-800/80">
                <input 
                  type="text" 
                  placeholder="Eslatma yozing..." 
                  value={newNoteText} 
                  onChange={(e) => setNewNoteText(e.target.value)}
                  className={`w-full border rounded-2xl py-3 pl-4 pr-12 text-xs focus:outline-none focus:border-indigo-500 transition-all ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'}`}
                />
                <button type="submit" className="absolute right-2.5 top-[calc(50%+6px)] -translate-y-1/2 p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all cursor-pointer shadow-md">
                  <Send size={15} />
                </button>
              </form>
            </div>

            <div className={`p-6 rounded-3xl border shadow-2xl flex flex-col h-[450px] ${isDarkMode ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center justify-between border-b pb-4 border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    <FolderCheck size={22} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base">Qilingan Loyihalar</h3>
                    <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Muvaffaqiyatli yakunlanganlar</p>
                  </div>
                </div>
                <span className="text-xs px-3 py-1 rounded-full font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Jami: {completedProjectsList.length} ta
                </span>
              </div>

              <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-2">
                {completedProjectsList.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <FolderCheck size={40} className="mb-2 opacity-20 text-slate-400" />
                    <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Hozircha qilingan loyihalar yo'q.</p>
                  </div>
                ) : (
                  sortProjects(completedProjectsList).map(p => {
                    const total = toNum(p.totalPrice);
                    const paid = toNum(p.paidPrice);
                    return (
                      <div key={p.id} onClick={() => setSelectedProjectInfoId(p.id)} className={`p-4 rounded-2xl border space-y-2 cursor-pointer transition-all hover:border-indigo-500 shadow-sm ${isDarkMode ? 'bg-slate-950/80 border-slate-800/90' : 'bg-slate-50 border-slate-200'}`}>
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-bold text-sm text-indigo-400">{p.name}</h4>
                          <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">Topshirildi</span>
                        </div>
                        <div className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                          Mijoz: <span className="font-semibold text-slate-200">{p.client || 'Nomaʼlum'}</span> | Topshirilgan Sana: <span className="text-slate-200">{p.deadline || 'Oʻrnatilmagan'}</span>
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-xs">
                          <span className="text-emerald-400 font-extrabold">{formatMoney(paid)} / {formatMoney(total)} so'm <span className="text-sky-400 font-semibold">({formatUsd(paid)} / {formatUsd(total)})</span></span>
                          <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                            <button type="button" onClick={() => openEditProjectModal(p)} className={`p-1.5 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-indigo-400' : 'bg-white border-slate-300 text-slate-700'}`}><Edit3 size={13} /></button>
                            <button type="button" onClick={() => handleDeleteProject(p.id)} className={`p-1.5 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800 text-rose-400' : 'bg-white border-slate-300 text-rose-600'}`}><Trash2 size={13} /></button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div className={`p-6 sm:p-8 rounded-3xl border shadow-2xl space-y-6 ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4 border-slate-800/80">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20"><Users size={24} /></div>
                <div>
                  <h2 className="text-xl font-bold">Barcha Dasturchilar</h2>
                  <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Jami: {team.length} ta a'zo</p>
                </div>
              </div>

              <button type="button" onClick={() => { setEditingMember(null); setIsAddMemberOpen(true); }} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2.5 rounded-xl text-xs transition-all cursor-pointer shadow-lg shadow-indigo-500/20">
                <UserPlus size={16} />
                <span>Yangi A'zo Qo'shish</span>
              </button>
            </div>

            {team.length === 0 ? (
              <div className={`text-center py-16 border border-dashed rounded-2xl ${isDarkMode ? 'text-slate-500 border-slate-800' : 'text-slate-400 border-slate-300'}`}>
                <Users size={48} className="mx-auto mb-2 opacity-30" />
                <p className="text-xs font-semibold">Hozircha jamoada a'zolar yo'q.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {team.map(member => {
                  const assignedSalary = parseFloat(member.assignedSalary || 0) || 0;
                  const paidAmount = parseFloat(member.paidAmount || 0) || 0;
                  const remainingSalary = Math.max(0, assignedSalary - paidAmount);

                  return (
                    <div 
                      key={member.id} 
                      onClick={() => setSelectedMemberInfo(member)}
                      className={`p-5 rounded-2xl border flex flex-col justify-between space-y-4 transition-all hover:shadow-2xl cursor-pointer ${isDarkMode ? 'bg-slate-950/80 border-slate-800/90' : 'bg-slate-50 border-slate-200'}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-base text-indigo-400 hover:underline">
                            {member.name}
                          </h4>
                          <p className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{member.role} • <span className="text-slate-400">{member.level || 'Junior'}</span></p>
                        </div>
                        <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${member.status === 'Active' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'}`}>
                          {member.status === 'Active' ? 'Active' : 'Band'}
                        </span>
                      </div>

                      <div className={`p-3 rounded-xl border text-xs space-y-1.5 ${isDarkMode ? 'bg-slate-900/60 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700'}`}>
                        <div className="flex justify-between">
                          <span className="opacity-70">Belgilangan oylik:</span>
                          <strong className="text-white">{formatMoney(assignedSalary)} so'm</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="opacity-70">Berilgan:</span>
                          <strong className="text-emerald-400">{formatMoney(paidAmount)} so'm</strong>
                        </div>
                        <div className="flex justify-between border-t pt-1 border-slate-800">
                          <span className="opacity-70">Qolgan maosh:</span>
                          <strong className="text-rose-500 font-bold">{formatMoney(remainingSalary)} so'm</strong>
                        </div>
                      </div>

                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <button 
                          type="button" 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            setPayUserSalaryModal(member); 
                            setSalaryPayAmount(''); 
                          }} 
                          className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2 rounded-xl text-xs cursor-pointer transition-all shadow-md flex items-center justify-center gap-1.5"
                        >
                          <DollarSign size={14} />
                          <span>Oylik To'lash</span>
                        </button>
                        <button 
                          type="button" 
                          onClick={() => setViewHistoryMember(member)} 
                          className={`px-3 py-2 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${isDarkMode ? 'bg-slate-900 border-slate-800 text-sky-400 hover:bg-slate-800' : 'bg-white border-slate-200 text-sky-600 hover:bg-slate-100'}`} 
                          title="To'lovlar tarixi"
                        >
                          <History size={14} />
                        </button>
                      </div>

                      <div className="space-y-1" onClick={(e) => e.stopPropagation()}>
                        <label className={`block text-[11px] font-bold flex items-center gap-1.5 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}>
                          <StickyNote size={13} />
                          <span>O'zim uchun eslatma:</span>
                        </label>
                        <textarea rows={2} value={member.bossNote || ''} onChange={(e) => handleUpdateBossNote(member.id, e.target.value)} className={`w-full border rounded-xl p-2.5 text-xs focus:outline-none focus:border-amber-500 transition-all resize-none ${isDarkMode ? 'bg-slate-900 border-slate-800 text-amber-200 placeholder-slate-600' : 'bg-white border-slate-300 text-amber-900 placeholder-slate-400'}`} />
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-slate-800/60" onClick={(e) => e.stopPropagation()}>
                        <button type="button" onClick={() => { setEditingMember(member); setIsAddMemberOpen(true); }} className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${isDarkMode ? 'text-slate-300 hover:text-indigo-400 bg-slate-900 border-slate-800 hover:border-indigo-500' : 'text-slate-700 hover:text-indigo-600 bg-white border-slate-200'}`}>
                          <Edit3 size={14} />
                          <span>Tahrirlash</span>
                        </button>
                        
                        <button type="button" onClick={() => handleDeleteMember(member.id)} className={`p-2 rounded-xl border cursor-pointer ${isDarkMode ? 'text-slate-400 hover:text-rose-400 bg-slate-900 border-slate-800' : 'text-slate-600 hover:text-rose-600 bg-white border-slate-200'}`}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Umumiy modallar — "Oylik To'lash" ham shu yerda chiqadi */}
        {sharedModals}
      </div>
    );
  }

  // =====================================================================
  // ASOSIY SAHIFA
  // =====================================================================
  return (
    <div className={`min-h-screen p-6 sm:p-8 font-sans selection:bg-indigo-500 selection:text-white transition-colors duration-300 ${isDarkMode ? 'bg-[#030712] text-slate-100' : 'bg-slate-100 text-slate-900'}`}>
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className={`flex flex-col lg:flex-row justify-between items-center gap-4 p-4 rounded-2xl border backdrop-blur-md transition-colors duration-300 ${isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200 shadow-xl'}`}>
          <Header 
            isDarkMode={isDarkMode}
            onOpenAddModal={() => { 
              setEditingProject(null); 
              setNewProject({ name: '', client: '', totalPrice: '', paidPrice: '', comment: '', date: todayStr(), deadline: '', assignedUsers: [] }); 
              setIsAddProjectOpen(true); 
            }} 
            onOpenAddMemberModal={() => { 
              setEditingMember(null); 
              setIsAddMemberOpen(true); 
            }} 
          />

          <div className="flex items-center gap-3">
            <button 
              type="button"
              onClick={() => setActiveModal('only_users')}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold px-5 py-3 rounded-2xl transition-all text-xs cursor-pointer shadow-lg shadow-indigo-500/25 border border-indigo-400/30"
            >
              <Users size={18} />
              <span>Userlar bo'limi</span>
            </button>

            <div className="flex items-center gap-2">
              <button 
                type="button"
                onClick={() => setActiveModal('trash')}
                className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-center shadow-lg relative ${
                  isDarkMode ? 'bg-slate-800 border-slate-700 text-rose-400 hover:bg-slate-700' : 'bg-slate-100 border-slate-300 text-rose-600 hover:bg-slate-200'
                }`}
              >
                <Trash size={18} />
                {(trashProjects.length > 0 || trashTeam.length > 0) && (
                  <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {trashProjects.length + trashTeam.length}
                  </span>
                )}
              </button>

              <button 
                type="button"
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-center shadow-lg ${
                  isDarkMode ? 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700' : 'bg-slate-100 border-slate-300 text-indigo-600 hover:bg-slate-200'
                }`}
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statsList.map((item) => {
            const Icon = item.icon;
            return (
              <div 
                key={item.id}
                onClick={() => {
                  if (item.type === 'only_users_card') {
                    setActiveModal('active_users');
                  } else {
                    setActiveModal(item.type);
                  }
                }}
                className={`group relative rounded-2xl p-6 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 backdrop-blur-xl overflow-hidden cursor-pointer border ${
                  isDarkMode ? 'bg-slate-900/40 hover:bg-slate-900/80 border-slate-800/80 hover:border-indigo-500/50' : 'bg-white/80 hover:bg-white border-slate-200 hover:border-indigo-500/40 shadow-sm'
                }`}
              >
                <div className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${item.color} opacity-10 blur-3xl group-hover:opacity-30 transition-all duration-500`} />
                
                <div className="flex items-start justify-between relative z-10">
                  <div className="space-y-1">
                    <span className={`text-xs font-semibold tracking-wider uppercase ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{item.title}</span>
                    <div className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{item.value}</div>
                    {item.subvalue && (
                      <div className="text-sm font-bold text-sky-400 tracking-wide">{item.subvalue}</div>
                    )}
                  </div>

                  <div className={`p-3.5 rounded-2xl border shadow-inner ${item.textColor} group-hover:scale-110 transition-transform duration-300 ${isDarkMode ? 'bg-slate-800/80 border-slate-700/50' : 'bg-slate-100 border-slate-200'}`}>
                    <Icon size={24} />
                  </div>
                </div>

                <div className={`mt-4 pt-3 border-t flex items-center justify-between text-xs relative z-10 ${isDarkMode ? 'border-slate-800/60 text-slate-500' : 'border-slate-100 text-slate-400'}`}>
                  <span>{item.subtext}</span>
                  <span className="text-indigo-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">Boshqarish &rarr;</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* KORZINA (TRASH) MODALI */}
        {activeModal === 'trash' && createPortal(
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-[9999] animate-fadeIn" onClick={() => setActiveModal(null)}>
            <div className={`border rounded-3xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl relative overflow-hidden ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'}`} onClick={(e) => e.stopPropagation()}>
              <div className={`p-6 border-b ${isDarkMode ? 'border-slate-800 bg-slate-950/90' : 'border-slate-200 bg-slate-50'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-rose-400">
                    <Trash size={22} />
                    <h3 className="text-xl font-extrabold">Korzina (O'chirilganlar)</h3>
                  </div>
                  <button type="button" onClick={() => setActiveModal(null)} className={`p-2 rounded-xl cursor-pointer ${isDarkMode ? 'text-slate-400 hover:text-white bg-slate-800' : 'text-slate-600 hover:text-black bg-slate-200'}`}><X size={18} /></button>
                </div>
                
                {/* Tablar */}
                <div className="flex items-center gap-2 mt-4">
                  <button 
                    type="button"
                    onClick={() => setActiveTrashTab('projects')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${activeTrashTab === 'projects' ? 'bg-rose-500 text-white border-rose-600 shadow-lg' : (isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-200 border-slate-300 text-slate-700')}`}
                  >
                    Loyihalar ({trashProjects.length})
                  </button>
                  <button 
                    type="button"
                    onClick={() => setActiveTrashTab('team')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${activeTrashTab === 'team' ? 'bg-rose-500 text-white border-rose-600 shadow-lg' : (isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-200 border-slate-300 text-slate-700')}`}
                  >
                    A'zolar / Users ({trashTeam.length})
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto space-y-4 flex-1">
                {activeTrashTab === 'projects' ? (
                  trashProjects.length === 0 ? (
                    <div className="text-center py-16 text-slate-500">
                      <Trash size={48} className="mx-auto mb-2 opacity-30" />
                      <p className="text-xs font-semibold">Korzinada o'chirilgan loyihalar yo'q.</p>
                    </div>
                  ) : (
                    trashProjects.map(p => (
                      <div key={p.id} className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                        <div>
                          <h4 className="font-bold text-sm text-indigo-400">{p.name}</h4>
                          <p className="text-xs text-slate-400 mt-0.5">Mijoz: {p.client || 'Nomaʼlum'} | Narx: {formatMoney(p.totalPrice)} so'm ({formatUsd(p.totalPrice)})</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={() => handleRestoreProject(p.id)} className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all shadow-md">
                            <RotateCcw size={14} />
                            <span>Tiklash</span>
                          </button>
                          <button type="button" onClick={() => handlePermanentDeleteProject(p.id)} className="p-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 cursor-pointer transition-all" title="Butunlay o'chirish">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    ))
                  )
                ) : (
                  trashTeam.length === 0 ? (
                    <div className="text-center py-16 text-slate-500">
                      <Users size={48} className="mx-auto mb-2 opacity-30" />
                      <p className="text-xs font-semibold">Korzinada o'chirilgan a'zolar yo'q.</p>
                    </div>
                  ) : (
                    trashTeam.map(m => (
                      <div key={m.id} className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                        <div>
                          <h4 className="font-bold text-sm text-indigo-400">{m.name}</h4>
                          <p className="text-xs text-slate-400 mt-0.5">{m.role} • {m.level || 'Junior'}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={() => handleRestoreMember(m.id)} className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all shadow-md">
                            <RotateCcw size={14} />
                            <span>Tiklash</span>
                          </button>
                          <button type="button" onClick={() => handlePermanentDeleteMember(m.id)} className="p-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 cursor-pointer transition-all" title="Butunlay o'chirish">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    ))
                  )
                )}
              </div>
            </div>
          </div>
        , document.body)}

        {/* ACTIVE / BAND DASTURCHILAR VA LOYIHALAR RO'YXATI MODALI */}
        {activeModal && activeModal !== 'only_users' && activeModal !== 'trash' && createPortal(
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-[9999] animate-fadeIn" onClick={() => setActiveModal(null)}>
            <div className={`border rounded-3xl w-full max-w-[1184px] h-[722px] max-h-[90vh] flex flex-col shadow-2xl relative overflow-hidden ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'}`} onClick={(e) => e.stopPropagation()}>
              
              <div className={`p-6 border-b ${isDarkMode ? 'border-slate-800 bg-slate-950/90' : 'border-slate-200 bg-slate-50'}`}>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-extrabold">
                    {activeModal === 'umumiySumma' && "Topshirilgan Loyihalar & Tushumlar"}
                    {activeModal === 'history' && "Topshirilgan Loyihalar & Tushumlar"}
                    {activeModal === 'jarayonda' && "Jarayondagi Loyihalar"}
                    {(activeModal === 'kutilayotgan' || activeModal === 'qarzlar') && "Qarzdorliklar Ro'yxati"}
                    {activeModal === 'projects' && "Barcha Qabul Qilingan Loyihalar"}
                    {activeModal === 'active_users' && "Active Dasturchilar"}
                    {activeModal === 'band_users' && "Band Dasturchilar"}
                  </h3>
                  <button type="button" onClick={() => setActiveModal(null)} className={`p-2 rounded-xl cursor-pointer ${isDarkMode ? 'text-slate-400 hover:text-white bg-slate-800' : 'text-slate-600 hover:text-black bg-slate-200'}`}><X size={18} /></button>
                </div>
                
                {['umumiySumma', 'history', 'jarayonda', 'kutilayotgan', 'qarzlar', 'projects'].includes(activeModal) && (
                  <div className="mt-3 mb-1 flex items-center gap-2">
                    <button type="button" onClick={() => setProjectSortOrder('newest')} className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${projectSortOrder === 'newest' ? 'bg-indigo-600 text-white border-indigo-500 shadow-md' : (isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-slate-200 border-slate-300 text-slate-700')}`}>
                      Avval yangilari
                    </button>
                    <button type="button" onClick={() => setProjectSortOrder('oldest')} className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${projectSortOrder === 'oldest' ? 'bg-indigo-600 text-white border-indigo-500 shadow-md' : (isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-slate-200 border-slate-300 text-slate-700')}`}>
                      Avval eskilari
                    </button>
                  </div>
                )}
                <div className="mt-1">
                  {activeModal === 'umumiySumma' && (
                    <p className="text-xs text-emerald-400 font-semibold">Jami tushum: {formatMoney(calculatedTarixAndUmumiySumma)} so'm ({formatUsd(calculatedTarixAndUmumiySumma)})</p>
                  )}
                  {activeModal === 'history' && (
                    <p className="text-xs text-emerald-400 font-semibold">Jami tushum: {formatMoney(calculatedCompletedPaidSumma)} so'm ({formatUsd(calculatedCompletedPaidSumma)})</p>
                  )}
                  {activeModal === 'jarayonda' && (
                    <p className="text-xs text-sky-400 font-semibold">Faol bajarilayotganlar: {inProgressProjectsList.length} ta</p>
                  )}
                  {(activeModal === 'kutilayotgan' || activeModal === 'qarzlar') && (
                    <p className="text-xs text-amber-400 font-semibold">Jami olinishi kerak qoldiq: {formatMoney(calculatedQarzlarSumma)} so'm ({formatUsd(calculatedQarzlarSumma)})</p>
                  )}
                  {activeModal === 'projects' && (
                    <p className="text-xs text-purple-400 font-semibold">Jami: {projects.length} ta</p>
                  )}
                  {activeModal === 'active_users' && (
                    <p className="text-xs text-emerald-400 font-semibold">Jami: {activeUsers.length} ta</p>
                  )}
                  {activeModal === 'band_users' && (
                    <p className="text-xs text-amber-400 font-semibold">Jami: {bandUsers.length} ta</p>
                  )}
                </div>
              </div>

              <div className="p-6 overflow-y-auto space-y-4 flex-1">
                
                {activeModal === 'active_users' && (
                  activeUsers.length === 0 ? (
                    <div className={`text-center py-16 border border-dashed rounded-2xl ${isDarkMode ? 'text-slate-500 border-slate-800' : 'text-slate-400 border-slate-300'}`}>
                      <Users size={48} className="mx-auto mb-2 opacity-30" />
                      <p className="text-xs font-semibold">Hozircha active dasturchilar yo'q.</p>
                    </div>
                  ) : (
                    activeUsers.map(member => renderMemberModalCard(member, true))
                  )
                )}

                {activeModal === 'band_users' && (
                  bandUsers.length === 0 ? (
                    <div className={`text-center py-16 border border-dashed rounded-2xl ${isDarkMode ? 'text-slate-500 border-slate-800' : 'text-slate-400 border-slate-300'}`}>
                      <Users size={48} className="mx-auto mb-2 opacity-30" />
                      <p className="text-xs font-semibold">Hozircha band dasturchilar yo'q.</p>
                    </div>
                  ) : (
                    bandUsers.map(member => renderMemberModalCard(member, false))
                  )
                )}

                {(activeModal === 'umumiySumma' || activeModal === 'history') && (
                  sortProjects(activeModal === 'history' ? completedProjectsList : projects).length === 0 ? (
                    <p className={`text-center py-12 text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Hozircha loyihalar mavjud emas.</p>
                  ) : (
                    sortProjects(activeModal === 'history' ? completedProjectsList : projects).map(p => {
                      const total = toNum(p.totalPrice);
                      const paid = toNum(p.paidPrice);
                      const remaining = Math.max(0, total - paid);

                      return (
                        <div key={p.id} onClick={() => { setActiveModal(null); setSelectedProjectInfoId(p.id); }} className={`p-5 rounded-2xl border space-y-3 transition-all shadow-md cursor-pointer hover:border-indigo-500 ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <h4 className="font-extrabold text-base text-indigo-400 flex items-center gap-1.5">
                                <CheckCircle2 size={16} className="text-emerald-400" />
                                {p.name}
                              </h4>
                              <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">Topshirildi</span>
                            </div>

                            <div className="flex items-center gap-3" onClick={e => e.stopPropagation()}>
                              <div className="text-right">
                                <span className="text-emerald-400 font-extrabold text-sm sm:text-base">
                                  {formatMoney(paid)} / {formatMoney(total)} so'm
                                </span>
                                <p className="text-[11px] text-sky-400 font-semibold">{formatUsd(paid)} / {formatUsd(total)}</p>
                                {remaining > 0 && (
                                  <p className="text-[11px] text-rose-500 font-bold">Qarz: {formatMoney(remaining)} so'm <span className="text-sky-400">({formatUsd(remaining)})</span></p>
                                )}
                              </div>

                              <div className="flex items-center gap-1.5 border-l pl-3 border-slate-800">
                                <button type="button" onClick={() => openEditProjectModal(p)} className={`p-2 rounded-xl border cursor-pointer ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-indigo-400' : 'bg-white border-slate-300 text-slate-700 hover:text-indigo-600'}`}><Edit3 size={15} /></button>
                                <button type="button" onClick={() => handleDeleteProject(p.id)} className={`p-2 rounded-xl border cursor-pointer ${isDarkMode ? 'bg-slate-900 border-slate-800 text-rose-400 hover:bg-rose-950/40' : 'bg-white border-slate-300 text-rose-600 hover:bg-rose-50'}`}><Trash2 size={15} /></button>
                              </div>
                            </div>
                          </div>

                          <div className="text-xs text-slate-400">
                            Mijoz: <span className="font-semibold text-slate-200">{p.client || 'Nomaʼlum'}</span> | Topshirilgan Sana: <span className="text-slate-200">{p.deadline || 'Oʻrnatilmagan'}</span>
                          </div>
                        </div>
                      );
                    })
                  )
                )}

                {activeModal === 'jarayonda' && (
                  inProgressProjectsList.length === 0 ? (
                    <p className={`text-center py-12 text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Hozircha jarayondagi loyihalar mavjud emas.</p>
                  ) : (
                    sortProjects(inProgressProjectsList).map(p => {
                      const total = toNum(p.totalPrice);
                      const paid = toNum(p.paidPrice);
                      const remaining = Math.max(0, total - paid);

                      return (
                        <div key={p.id} onClick={() => { setActiveModal(null); setSelectedProjectInfoId(p.id); }} className={`p-5 rounded-2xl border space-y-3 transition-all shadow-md cursor-pointer hover:border-indigo-500 ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <h4 className="font-extrabold text-base text-indigo-400">{p.name}</h4>
                              <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-sky-500/15 text-sky-400 border border-sky-500/30">Jarayonda</span>
                            </div>

                            <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                              <button type="button" onClick={() => openEditProjectModal(p)} className={`p-2 rounded-xl border cursor-pointer ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-indigo-400' : 'bg-white border-slate-300 text-slate-700 hover:text-indigo-600'}`}><Edit3 size={15} /></button>
                              <button type="button" onClick={() => handleDeleteProject(p.id)} className={`p-2 rounded-xl border cursor-pointer ${isDarkMode ? 'bg-slate-900 border-slate-800 text-rose-400 hover:bg-rose-950/40' : 'bg-white border-slate-300 text-rose-600 hover:bg-rose-50'}`}><Trash2 size={15} /></button>
                              <button type="button" onClick={() => handleToggleProjectStatus(p.id)} className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-4 py-2 rounded-xl text-xs cursor-pointer transition-all shadow-md flex items-center gap-1.5">
                                <Check size={14} />
                                <span>Topshirildi</span>
                              </button>
                            </div>
                          </div>

                          <div className="text-xs text-slate-400">
                            Mijoz: <span className="font-semibold text-slate-200">{p.client || 'Nomaʼlum'}</span> | Deadline: <strong className="text-rose-500 font-bold">{p.deadline || 'Oʻrnatilmagan'}</strong>
                          </div>

                          <div className="text-xs pt-1 border-t border-slate-800/50">
                            <span className="text-slate-300 font-semibold">Narx: {formatMoney(total)} so'm <span className="text-sky-400">({formatUsd(total)})</span></span>
                            <span className="mx-2 text-slate-600">|</span>
                            <span className="text-rose-500 font-bold">Qolgan Qarz: {formatMoney(remaining)} so'm <span className="text-sky-400">({formatUsd(remaining)})</span></span>
                          </div>
                        </div>
                      );
                    })
                  )
                )}

                {activeModal === 'projects' && (
                  projects.length === 0 ? (
                    <p className={`text-center py-12 text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Hozircha loyihalar mavjud emas.</p>
                  ) : (
                    sortProjects(projects).map(p => (
                      <div key={p.id} onClick={() => { setActiveModal(null); setSelectedProjectInfoId(p.id); }} className={`p-5 rounded-2xl border space-y-3 transition-all shadow-md cursor-pointer hover:border-indigo-500 ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <h4 className="font-extrabold text-base text-indigo-400">{p.name}</h4>
                            <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border ${p.status === 'topshirilgan' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-sky-500/15 text-sky-400 border-sky-500/30'}`}>
                              {p.status === 'topshirilgan' ? 'topshirilgan' : 'jarayonda'}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                            <button type="button" onClick={() => openEditProjectModal(p)} className={`p-2 rounded-xl border cursor-pointer ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-indigo-400' : 'bg-white border-slate-300 text-slate-700 hover:text-indigo-600'}`}><Edit3 size={15} /></button>
                            <button type="button" onClick={() => handleDeleteProject(p.id)} className={`p-2 rounded-xl border cursor-pointer ${isDarkMode ? 'bg-slate-900 border-slate-800 text-rose-400 hover:bg-rose-950/40' : 'bg-white border-slate-300 text-rose-600 hover:bg-rose-50'}`}><Trash2 size={15} /></button>
                          </div>
                        </div>

                        <div className="text-xs text-slate-400">
                          Mijoz: <span className="font-semibold text-slate-200">{p.client || 'Nomaʼlum'}</span> | Deadline: <span className="text-rose-500 font-bold">{p.deadline || 'Oʻrnatilmagan'}</span>
                          <span className="block mt-1 text-emerald-400 font-semibold">{formatMoney(toNum(p.paidPrice))} / {formatMoney(toNum(p.totalPrice))} so'm <span className="text-sky-400">({formatUsd(toNum(p.paidPrice))} / {formatUsd(toNum(p.totalPrice))})</span></span>
                        </div>
                      </div>
                    ))
                  )
                )}

                {(activeModal === 'kutilayotgan' || activeModal === 'qarzlar') && (
                  debtProjectsList.length === 0 ? (
                    <p className={`text-center py-12 text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Hozircha qarzdorliklar mavjud emas.</p>
                  ) : (
                    sortProjects(debtProjectsList).map(p => {
                      const total = toNum(p.totalPrice);
                      const paid = toNum(p.paidPrice);
                      const remaining = Math.max(0, total - paid);

                      return (
                        <div key={p.id} onClick={() => { setActiveModal(null); setSelectedProjectInfoId(p.id); }} className={`p-5 rounded-2xl border space-y-4 transition-all shadow-md cursor-pointer hover:border-indigo-500 ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <h4 className="font-extrabold text-base text-indigo-400">{p.name}</h4>
                              <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border ${p.status === 'topshirilgan' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-sky-500/15 text-sky-400 border-sky-500/30'}`}>{p.status === 'topshirilgan' ? 'Topshirilgan (Qarzi bor)' : 'Jarayonda (Qarzi bor)'}</span>
                            </div>

                            <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                              <button type="button" onClick={() => openEditProjectModal(p)} className={`p-2 rounded-xl border cursor-pointer ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-indigo-400' : 'bg-white border-slate-300 text-slate-700 hover:text-indigo-600'}`}><Edit3 size={15} /></button>
                              <button type="button" onClick={() => handleDeleteProject(p.id)} className={`p-2 rounded-xl border cursor-pointer ${isDarkMode ? 'bg-slate-900 border-slate-800 text-rose-400 hover:bg-rose-950/40' : 'bg-white border-slate-300 text-rose-600 hover:bg-rose-50'}`}><Trash2 size={15} /></button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            <p className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>Mijoz: <span className={isDarkMode ? 'text-slate-200 font-semibold' : 'text-slate-900 font-semibold'}>{p.client || 'Nomaʼlum'}</span></p>
                            <p className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>Deadline: <strong className="text-rose-500 font-bold">{p.deadline || 'O’rnatilmagan'}</strong></p>
                          </div>

                          <div className="space-y-1 text-xs pt-1 border-t border-slate-800/50">
                            <p className={isDarkMode ? 'text-slate-300' : 'text-slate-800'}>Jami narx: <strong className="text-white font-bold">{formatMoney(total)} so'm</strong> <span className="text-sky-400 text-[11px] font-semibold">({formatUsd(total)})</span></p>
                            <p className="text-emerald-400 font-medium">To'langan: {formatMoney(paid)} so'm <span className="text-sky-400 text-[11px] font-semibold">({formatUsd(paid)})</span></p>
                            <p className="text-rose-500 font-extrabold text-sm">Qolgan Qarz: {formatMoney(remaining)} so'm <span className="text-sky-400 text-[11px] font-semibold">({formatUsd(remaining)})</span></p>
                          </div>

                          <div className="flex flex-col sm:flex-row items-center gap-2 pt-2 border-t border-slate-800/50" onClick={e => e.stopPropagation()}>
                            <button type="button" onClick={() => { setActiveModal(null); setPartialPayModalProject(p); setPartialPayAmount(''); }} className="w-full sm:flex-1 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white font-semibold py-2.5 rounded-xl text-xs cursor-pointer transition-all shadow-md flex items-center justify-center gap-1.5">
                              <HandCoins size={15} />
                              <span>Bo'laklab to'lash</span>
                            </button>

                            <button type="button" onClick={() => handleFullPayProject(p.id)} className="w-full sm:flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 rounded-xl text-xs cursor-pointer transition-all shadow-md flex items-center justify-center gap-1.5">
                              <CheckCircle2 size={15} />
                              <span>Qarz to'liq to'landi</span>
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )
                )}

              </div>
            </div>
          </div>
        , document.body)}

        {/* Umumiy modallar */}
        {sharedModals}

      </div>
    </div>
  );
}