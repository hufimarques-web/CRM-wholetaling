import React from 'react';
import { Search, Plus, CalendarPlus, Menu, X } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';

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
    setActiveTab
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

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Dashboard de Vendas & Pipeline';
      case 'leads': return 'Pipeline de Leads (Wholetailing)';
      case 'calendar': return 'Calendário de Visitas';
      case 'proposals': return 'Gestão de Propostas Enviadas';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
      <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        
        {/* Left Side: Mobile Menu Button & Page Title */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenMobileSidebar}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition"
            aria-label="Abrir Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="hidden sm:block">
            <h2 className="text-base font-bold text-slate-800 tracking-tight">{getPageTitle()}</h2>
            <p className="text-[11px] text-slate-500">Wholetailing & Arbitragem Imobiliária (Portugal)</p>
          </div>
        </div>

        {/* Middle: Functional Global Search Bar */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={globalSearch}
              onChange={(e) => {
                setGlobalSearch(e.target.value);
                if (activeTab !== 'leads' && e.target.value.trim().length > 0) {
                  setActiveTab('leads');
                }
              }}
              placeholder="Pesquisar por nome, concelho, freguesia, telefone ou morada..."
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
            />
            {globalSearch && (
              <button
                onClick={() => setGlobalSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Right Side: Quick Action Buttons & User Profile */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleNewVisitClick}
            className="hidden sm:flex items-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 shadow-xs transition"
          >
            <CalendarPlus className="w-3.5 h-3.5 text-blue-600" />
            <span>Marcar Visita</span>
          </button>

          <button
            onClick={handleNewLeadClick}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden xs:inline">Adicionar Lead</span>
            <span className="xs:hidden">Lead</span>
          </button>

          {/* User Badge */}
          <div className="hidden lg:flex items-center space-x-2 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
              WT
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-slate-800 leading-tight">Wholetailing CRM</p>
              <p className="text-[10px] text-blue-600 font-semibold leading-none">Gestão Imobiliária</p>
            </div>
          </div>
        </div>

      </div>
    </header>
  );
};
