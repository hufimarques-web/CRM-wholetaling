import React from 'react';
import { Search, Plus, CalendarPlus, StickyNote, Menu, X, User, LogOut } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { getUserTheme } from '../../utils/formatters';

interface TopbarProps {
  onOpenMobileSidebar: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onOpenMobileSidebar }) => {
  const {
    globalSearch,
    setGlobalSearch,
    setIsLeadFormOpen,
    setEditingLead,
    setIsVisitFormOpen,
    setEditingVisit,
    setPreselectedVisitLeadId,
    activeTab,
    setActiveTab,
    currentUser,
    logout,
    addNote
  } = useCRM();

  const handleNewLeadClick = () => {
    setEditingLead(null);
    setIsLeadFormOpen(true);
  };

  const handleNewVisitClick = () => {
    setEditingVisit(null);
    setPreselectedVisitLeadId(null);
    setIsVisitFormOpen(true);
  };

  const handleQuickNoteClick = () => {
    const text = window.prompt(`Nova nota rápida criada por ${currentUser}:`);
    if (text && text.trim()) {
      addNote({
        text: text.trim(),
        pinned: true
      });
      if (activeTab !== 'notes' && activeTab !== 'dashboard') {
        setActiveTab('notes');
      }
    }
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Visão Geral & Dashboard';
      case 'leads': return 'Pipeline & Estudo de Mercado (Aveiro)';
      case 'notes': return 'Central de Notas & Follow-ups';
      case 'calendar': return 'Visitas Agendadas & Realizadas';
      case 'proposals': return 'Propostas & Múltiplos de Sinal';
      case 'operations': return 'Operações & CPCV (Pós-Aceitação)';
      case 'discarded': return 'Leads Descartadas (Arquivo Histórico)';
    }
  };

  const queirosTheme = getUserTheme('Queirós');
  const hugoTheme = getUserTheme('Hugo');

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E6E1D7] shadow-2xs">
      <div className="px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        
        {/* Left Side: Mobile Menu Button & Brand Logo & Page Title */}
        <div className="flex items-center space-x-3 min-w-0">
          <button
            onClick={onOpenMobileSidebar}
            className="md:hidden p-2 rounded-xl text-stone-600 hover:bg-stone-100 transition"
            aria-label="Abrir Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="w-7 h-7 rounded-lg bg-black border border-stone-800 hidden sm:flex items-center justify-center p-0.5 shrink-0 shadow-xs">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
          </div>

          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-extrabold text-stone-900 tracking-tight truncate">
              {getPageTitle()}
            </h2>
            <p className="hidden sm:block text-[11px] text-stone-500 truncate">
              Wholetailing & Arbitragem • Aveiro (Freguesia ao Centímetro)
            </p>
          </div>
        </div>

        {/* Middle: Functional Global Search Bar */}
        <div className="flex-1 max-w-sm hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={globalSearch}
              onChange={(e) => {
                setGlobalSearch(e.target.value);
                if (activeTab !== 'leads' && activeTab !== 'notes' && e.target.value.trim().length > 0) {
                  setActiveTab('leads');
                }
              }}
              placeholder="Pesquisar por proprietário, freguesia, telemóvel..."
              className="w-full pl-9 pr-8 py-1.5 bg-[#F9F7F2] border border-[#E6E1D7] rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition"
            />
            {globalSearch && (
              <button
                onClick={() => setGlobalSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Right Side: Static Session Indicator, Quick Actions & Logout */}
        <div className="flex items-center space-x-2 shrink-0">
          
          {/* Static Session Indicator (No in-session switcher) */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#FAF8F5] rounded-xl border border-[#E2DDD3] shadow-2xs">
            <span className={`w-2 h-2 rounded-full ${currentUser === 'Queirós' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <span className="text-xs font-bold text-stone-800">
              <span className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider hidden sm:inline">Sessão: </span>
              {currentUser}
            </span>
          </div>

          {/* Quick Logout Button */}
          <button
            onClick={logout}
            title="Terminar Sessão e Voltar ao Login"
            className="p-1.5 sm:px-2.5 sm:py-1.5 text-stone-500 hover:text-red-700 bg-stone-100 hover:bg-red-50 rounded-xl text-xs font-semibold border border-stone-200 hover:border-red-200 transition flex items-center gap-1"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Sair</span>
          </button>

          {/* Quick Note Button */}
          <button
            onClick={handleQuickNoteClick}
            title="Criar Nota Rápida"
            className="hidden sm:flex items-center space-x-1 px-2.5 py-1.5 bg-[#FAF8F5] hover:bg-[#F3EFE6] text-stone-700 rounded-xl text-xs font-semibold border border-[#E2DDD3] shadow-2xs transition"
          >
            <StickyNote className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden lg:inline">Nota</span>
          </button>

          {/* Schedule Visit Button */}
          <button
            onClick={handleNewVisitClick}
            className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold border border-stone-300 shadow-2xs transition"
          >
            <CalendarPlus className="w-3.5 h-3.5 text-stone-700" />
            <span className="hidden lg:inline">Visita</span>
          </button>

          {/* Add Lead Primary Button */}
          <button
            onClick={handleNewLeadClick}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-stone-900 hover:bg-black text-white rounded-xl text-xs font-bold shadow-xs transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nova Lead</span>
          </button>
        </div>

      </div>
    </header>
  );
};
