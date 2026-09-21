import React from 'react';
import { LayoutDashboard, Columns, Calendar, FileText, Building2, Menu, X, RotateCcw } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, setMobileOpen }) => {
  const { activeTab, setActiveTab, resetToDemoData, leads, visits, proposals } = useCRM();

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'leads',
      label: 'Leads / Funil',
      icon: Columns,
      badge: leads.length
    },
    {
      id: 'calendar',
      label: 'Calendário',
      icon: Calendar,
      badge: visits.filter(v => v.estado === 'Marcada' || v.estado === 'Confirmada').length
    },
    {
      id: 'proposals',
      label: 'Propostas',
      icon: FileText,
      badge: proposals.filter(p => p.estado === 'Enviada' || p.estado === 'Em negociação').length
    },
  ] as const;

  const handleNavClick = (id: 'dashboard' | 'leads' | 'calendar' | 'proposals') => {
    setActiveTab(id);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#0E1726] text-slate-300 flex flex-col border-r border-slate-800 transform transition-transform duration-200 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top Header Logo */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800/80 bg-[#0B132B]">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-wide uppercase">Wholetailing CRM</h1>
              <p className="text-[10px] text-blue-400 font-medium tracking-wider uppercase">Gestão Imobiliária</p>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          <div className="px-3 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Menu Principal
          </div>

          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== null && item.badge > 0 && (
                  <span
                    className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Demo Status & Reset Data Button */}
        <div className="p-4 border-t border-slate-800/80 bg-[#0B132B]/50">
          <div className="bg-slate-900/80 rounded-lg p-3 border border-slate-800 mb-3">
            <div className="flex items-center space-x-2 text-[11px] text-amber-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              <span>Modo Demonstração</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Aveiro, Coimbra e Viseu. Alterações guardadas localmente.
            </p>
          </div>

          <button
            onClick={() => {
              if (window.confirm('Deseja repor os dados originais de demonstração? Todas as alterações guardadas serão substituídas.')) {
                resetToDemoData();
              }
            }}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-[11px] text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 rounded-md border border-slate-700/60 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Repor Dados Demo</span>
          </button>
        </div>
      </aside>
    </>
  );
};
