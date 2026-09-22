import React, { useState, useMemo } from 'react';
import { Plus, Columns, Table, Filter, RotateCcw, Building, Search, Sparkles } from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { LeadPhase, ContactStatus, PhotoStatus, PriorityLevel, AppUser, MarketDealRating } from '../types/crm';
import { FunnelBoard } from '../components/leads/FunnelBoard';
import { LeadsTable } from '../components/leads/LeadsTable';
import { formatCurrency } from '../utils/formatters';

export const LeadsView: React.FC = () => {
  const {
    leads,
    leadViewMode,
    setLeadViewMode,
    globalSearch,
    setIsLeadFormOpen,
    setEditingLead
  } = useCRM();

  // Filters State
  const [userFilter, setUserFilter] = useState<'Todos' | AppUser>('Todos');
  const [faseFilter, setFaseFilter] = useState<LeadPhase | 'Todas'>('Todas');
  const [contactoFilter, setContactoFilter] = useState<ContactStatus | 'Todos'>('Todos');
  const [freguesiaFilter, setFreguesiaFilter] = useState<string>('Todas');

  // Unique freguesias for filter dropdown (only active leads)
  const uniqueFreguesias = useMemo(() => {
    const set = new Set<string>();
    leads.filter(l => l.fase !== 'Descartada').forEach(l => { if (l.freguesia) set.add(l.freguesia); });
    return Array.from(set);
  }, [leads]);

  // Filtered Leads logic (Excluded discarded leads from main pipeline by default)
  const filteredLeads = useMemo(() => {
    return leads.filter(l => {
      // Discarded leads disappear from main page and live in the 'Descartadas' tab
      if (faseFilter !== 'Descartada' && l.fase === 'Descartada') {
        return false;
      }

      // Global Search
      if (globalSearch.trim()) {
        const query = globalSearch.toLowerCase().trim();
        const matchesQuery =
          l.nomeProprietario.toLowerCase().includes(query) ||
          l.freguesia.toLowerCase().includes(query) ||
          (l.moradaZona ? l.moradaZona.toLowerCase().includes(query) : false) ||
          l.telefone.includes(query);
        if (!matchesQuery) return false;
      }

      // User filter
      if (userFilter !== 'Todos' && l.assignedTo !== userFilter) return false;

      // Phase filter
      if (faseFilter !== 'Todas' && l.fase !== faseFilter) return false;

      // Contact filter
      if (contactoFilter !== 'Todos' && l.contacto !== contactoFilter) return false;

      // Freguesia filter
      if (freguesiaFilter !== 'Todas' && l.freguesia !== freguesiaFilter) return false;

      return true;
    });
  }, [leads, globalSearch, userFilter, faseFilter, contactoFilter, freguesiaFilter]);

  // Aggregate Total Value of Filtered Leads
  const totalMinimoValor = filteredLeads.reduce((acc, curr) => acc + (curr.valorMinimoAbsoluto || 0), 0);
  const totalMargem = filteredLeads.reduce((acc, curr) => acc + (curr.margemPotencial || 0), 0);

  const hasActiveFilters =
    userFilter !== 'Todos' ||
    faseFilter !== 'Todas' ||
    contactoFilter !== 'Todos' ||
    freguesiaFilter !== 'Todas' ||
    globalSearch !== '';

  const resetFilters = () => {
    setUserFilter('Todos');
    setFaseFilter('Todas');
    setContactoFilter('Todos');
    setFreguesiaFilter('Todas');
  };

  return (
    <div className="space-y-4">
      
      {/* Action & Metrics Banner */}
      <div className="bg-white rounded-2xl shadow-2xs border border-stone-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Left Side: + Adicionar Lead Button & Total Metrics */}
        <div className="flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-start">
          <button
            onClick={() => {
              setEditingLead(null);
              setIsLeadFormOpen(true);
            }}
            className="flex items-center space-x-2 px-5 py-2.5 bg-stone-900 hover:bg-black text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs transition shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Lead</span>
          </button>

          <div className="flex items-baseline space-x-3 border-l border-stone-200 pl-4">
            <div>
              <span className="text-xl font-black text-stone-900 leading-none">{filteredLeads.length}</span>
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mt-0.5">Leads</span>
            </div>
            <div className="hidden sm:block border-l border-stone-200 pl-3">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block">Mínimo Total</span>
              <span className="text-sm font-black text-stone-900 leading-none">{formatCurrency(totalMinimoValor)}</span>
            </div>
            <div className="hidden md:block border-l border-stone-200 pl-3">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block">Margem Total</span>
              <span className="text-sm font-black text-emerald-600 leading-none">{formatCurrency(totalMargem)}</span>
            </div>
          </div>
        </div>

        {/* Right Side: View Mode Toggles (LISTAGEM vs FUNIL) */}
        <div className="flex items-center space-x-1 bg-[#F3EFE6] p-1 rounded-xl border border-[#E2DDD3] w-full sm:w-auto justify-center">
          <button
            onClick={() => setLeadViewMode('funnel')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              leadViewMode === 'funnel'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Columns className="w-3.5 h-3.5 text-amber-600" />
            <span>FUNIL</span>
          </button>

          <button
            onClick={() => setLeadViewMode('table')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              leadViewMode === 'table'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>TABELA</span>
          </button>
        </div>

      </div>

      {/* Simplified Clean Filter Bar */}
      <div className="bg-white rounded-2xl shadow-2xs border border-stone-200 p-3.5 space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-stone-800">
          <div className="flex items-center space-x-2">
            <Filter className="w-3.5 h-3.5 text-amber-600" />
            <span>Filtros Rápidos</span>
          </div>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-[11px] text-amber-800 hover:underline flex items-center gap-1 font-semibold"
            >
              <RotateCcw className="w-3 h-3" />
              Limpar Filtros
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          
          {/* User Filter */}
          <div>
            <label className="block text-[10px] font-bold text-stone-400 mb-0.5 uppercase tracking-wider">Responsável</label>
            <select
              value={userFilter}
              onChange={e => setUserFilter(e.target.value as any)}
              className="w-full px-2.5 py-1.5 bg-[#FAF8F5] border border-stone-200 rounded-xl focus:outline-none text-stone-800 font-semibold"
            >
              <option value="Todos">Todos (Queirós & Hugo)</option>
              <option value="Queirós">Queirós</option>
              <option value="Hugo">Hugo</option>
            </select>
          </div>

          {/* Phase Filter */}
          <div>
            <label className="block text-[10px] font-bold text-stone-400 mb-0.5 uppercase tracking-wider">Fase do Funil</label>
            <select
              value={faseFilter}
              onChange={e => setFaseFilter(e.target.value as any)}
              className="w-full px-2.5 py-1.5 bg-[#FAF8F5] border border-stone-200 rounded-xl focus:outline-none text-stone-800 font-semibold"
            >
              <option value="Todas">Todas as Fases</option>
              <option value="Nova lead">Nova lead</option>
              <option value="Em análise">Em análise</option>
              <option value="Pronta para proposta">Pronta p/ proposta</option>
              <option value="CPCV a preparar">CPCV a preparar</option>
              <option value="Descartada">Descartada</option>
            </select>
          </div>

          {/* Contact Status Filter */}
          <div>
            <label className="block text-[10px] font-bold text-stone-400 mb-0.5 uppercase tracking-wider">Contacto</label>
            <select
              value={contactoFilter}
              onChange={e => setContactoFilter(e.target.value as any)}
              className="w-full px-2.5 py-1.5 bg-[#FAF8F5] border border-stone-200 rounded-xl focus:outline-none text-stone-800 font-semibold"
            >
              <option value="Todos">Todos Contactos</option>
              <option value="Não contactado">Não contactado</option>
              <option value="Contactado">Contactado</option>
              <option value="Sem resposta">Sem resposta</option>
              <option value="Reunião marcada">Reunião marcada</option>
            </select>
          </div>

          {/* Freguesia Filter */}
          <div>
            <label className="block text-[10px] font-bold text-stone-400 mb-0.5 uppercase tracking-wider">Freguesia</label>
            <select
              value={freguesiaFilter}
              onChange={e => setFreguesiaFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-[#FAF8F5] border border-stone-200 rounded-xl focus:outline-none text-stone-800 font-semibold"
            >
              <option value="Todas">Todas as Freguesias</option>
              {uniqueFreguesias.map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* Main Content: Funnel or Table */}
      {leadViewMode === 'funnel' ? (
        <FunnelBoard filteredLeads={filteredLeads} />
      ) : (
        <LeadsTable filteredLeads={filteredLeads} faseFilter={faseFilter} />
      )}

    </div>
  );
};
