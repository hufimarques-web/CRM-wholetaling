import React, { useMemo } from 'react';
import {
  LayoutDashboard,
  Columns,
  Calendar,
  FileText,
  StickyNote,
  Building2,
  X,
  ShieldCheck,
  Archive,
  LogOut
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { getUserTheme } from '../../utils/formatters';

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, setMobileOpen }) => {
  const {
    activeTab,
    setActiveTab,
    leads,
    visits,
    proposals,
    notes,
    operations,
    currentUser,
    logout
  } = useCRM();

  const userTheme = getUserTheme(currentUser);

  const counts = useMemo(() => ({
    activeLeads: leads.filter(l => l.fase !== 'Descartada').length,
    notes: notes.length,
    upcomingVisits: visits.filter(v => v.estado === 'Marcada' || v.estado === 'Confirmada').length,
    activeProposals: proposals.filter(p => p.estado === 'Enviada' || p.estado === 'Em negociação').length,
    activeOperations: operations.filter(o => o.fase !== 'Venda_Fechada' && o.fase !== 'Cancelado').length,
    discardedLeads: leads.filter(l => l.fase === 'Descartada').length
  }), [leads, notes, visits, proposals, operations]);

  const navItems = useMemo(() => [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'leads',
      label: 'Leads & Funil',
      icon: Columns,
      badge: counts.activeLeads
    },
    {
      id: 'notes',
      label: 'Notas & Follow-ups',
      icon: StickyNote,
      badge: counts.notes
    },
    {
      id: 'calendar',
      label: 'Calendário Visitas',
      icon: Calendar,
      badge: counts.upcomingVisits
    },
    {
      id: 'proposals',
      label: 'Propostas & Sinal',
      icon: FileText,
      badge: counts.activeProposals
    },
    {
      id: 'operations',
      label: 'Operações & CPCV',
      icon: ShieldCheck,
      badge: counts.activeOperations
    },
    {
      id: 'discarded',
      label: 'Descartadas',
      icon: Archive,
      badge: counts.discardedLeads
    }
  ] as const, [counts]);

  const handleNavClick = (id: 'dashboard' | 'leads' | 'calendar' | 'proposals' | 'notes' | 'operations' | 'discarded') => {
    setActiveTab(id);
    setMobileOpen(false);
  };


  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container (Dark obsidian luxury base) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#141518] text-stone-300 flex flex-col border-r border-stone-800/80 transform transition-transform duration-200 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top Header Logo */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-stone-800 bg-[#0F1012]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-black border border-stone-800 flex items-center justify-center p-1 shadow-md shadow-black/50">
              <img src="/logo.png" alt="Wholetailing" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-wider uppercase font-mono">Wholetailing</h1>
              <p className="text-[10px] text-stone-400 font-medium tracking-wider">Aveiro & Centro</p>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-1 rounded-md text-stone-400 hover:text-white hover:bg-stone-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Session Static Indicator in Sidebar (No in-session switcher) */}
        <div className="px-3 pt-4 pb-2">
          <div className="bg-[#1A1B20] p-2.5 rounded-xl border border-stone-800 flex items-center space-x-2.5">
            <div className={`w-8 h-8 rounded-lg font-bold text-xs flex items-center justify-center ${userTheme.avatarBg} shadow-xs`}>
              {userTheme.initial}
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">Sessão Ativa</span>
              <span className="text-xs font-bold text-white block leading-tight">{currentUser}</span>
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 py-3 px-3 space-y-1 overflow-y-auto">
          <div className="px-3 py-1.5 text-[10px] font-bold text-stone-500 uppercase tracking-wider">
            Navegação Principal
          </div>

          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-stone-800 text-white font-bold border border-stone-700 shadow-sm'
                    : 'text-stone-400 hover:text-stone-100 hover:bg-stone-800/50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-500' : 'text-stone-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== null && item.badge > 0 && (
                  <span
                    className={`px-2 py-0.5 text-[10px] rounded-full font-bold ${
                      isActive ? 'bg-amber-600 text-white' : 'bg-stone-800 text-stone-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Sidebar Footer with Logout (NO RESET DATA BUTTON) */}
        <div className="p-3 border-t border-stone-800/80 bg-[#0F1012] space-y-2">
          <div className="flex items-center justify-between px-2 text-[10px] text-stone-500">
            <span>Base de Dados: Prisma (Ativa)</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" title="Prisma ORM ligado"></span>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-xl text-stone-400 hover:text-red-400 bg-stone-900/80 hover:bg-stone-800 text-xs font-semibold border border-stone-800 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Terminar Sessão</span>
          </button>
        </div>
      </aside>
    </>
  );
};
