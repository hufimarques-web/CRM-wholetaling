import React, { useState, useMemo } from 'react';
import { Plus, Columns, Table, Filter, RotateCcw, Building, Search, Download } from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { LeadPhase, ContactStatus, PhotoStatus, PriorityLevel, YesNo } from '../types/crm';
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
  const [faseFilter, setFaseFilter] = useState<LeadPhase | 'Todas'>('Todas');
  const [contactoFilter, setContactoFilter] = useState<ContactStatus | 'Todos'>('Todos');
  const [fotosFilter, setFotosFilter] = useState<PhotoStatus | 'Todas'>('Todas');
  const [prioridadeFilter, setPrioridadeFilter] = useState<PriorityLevel | 'Todas'>('Todas');
  const [flexibilidadeFilter, setFlexibilidadeFilter] = useState<YesNo | 'Todas'>('Todas');
  const [concelhoFilter, setConcelhoFilter] = useState<string>('Todos');

  // Unique concelhos for filter dropdown
  const uniqueConcelhos = useMemo(() => {
    const set = new Set<string>();
    leads.forEach(l => { if (l.concelho) set.add(l.concelho); });
    return Array.from(set);
  }, [leads]);

  // Filtered Leads logic
  const filteredLeads = useMemo(() => {
    return leads.filter(l => {
      // Global Search
      if (globalSearch.trim()) {
        const query = globalSearch.toLowerCase().trim();
        const matchesQuery =
          l.nomeProprietario.toLowerCase().includes(query) ||
          l.concelho.toLowerCase().includes(query) ||
          l.freguesia.toLowerCase().includes(query) ||
          l.moradaZona.toLowerCase().includes(query) ||
          l.telefone.includes(query) ||
          (l.email && l.email.toLowerCase().includes(query));
        if (!matchesQuery) return false;
      }

      // Phase filter
      if (faseFilter !== 'Todas' && l.fase !== faseFilter) return false;

      // Contact filter
      if (contactoFilter !== 'Todos' && l.contacto !== contactoFilter) return false;

      // Photo filter
      if (fotosFilter !== 'Todas' && l.fotos !== fotosFilter) return false;

      // Priority filter
      if (prioridadeFilter !== 'Todas' && l.prioridade !== prioridadeFilter) return false;

      // Flexibility filter
      if (flexibilidadeFilter !== 'Todas' && l.flexibilidade !== flexibilidadeFilter) return false;

      // Concelho filter
      if (concelhoFilter !== 'Todos' && l.concelho !== concelhoFilter) return false;

      return true;
    });
  }, [leads, globalSearch, faseFilter, contactoFilter, fotosFilter, prioridadeFilter, flexibilidadeFilter, concelhoFilter]);

  // Aggregate Total Value of Filtered Leads
  const totalMinimoValor = filteredLeads.reduce((acc, curr) => acc + (curr.valorMinimoAbsoluto || 0), 0);

  const hasActiveFilters =
    faseFilter !== 'Todas' ||
    contactoFilter !== 'Todos' ||
    fotosFilter !== 'Todas' ||
    prioridadeFilter !== 'Todas' ||
    flexibilidadeFilter !== 'Todas' ||
    concelhoFilter !== 'Todos' ||
    globalSearch !== '';

  const resetFilters = () => {
    setFaseFilter('Todas');
    setContactoFilter('Todos');
    setFotosFilter('Todas');
    setPrioridadeFilter('Todas');
    setFlexibilidadeFilter('Todas');
    setConcelhoFilter('Todos');
  };

  return (
    <div className="space-y-4">
      
      {/* Compact Action & Metrics Banner (Matching Freitas OS reference layout) */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Left Side: + Adicionar Lead Button & Total Metrics */}
        <div className="flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-start">
          <button
            onClick={() => {
              setEditingLead(null);
              setIsLeadFormOpen(true);
            }}
            className="flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Lead</span>
          </button>

          <div className="flex items-baseline space-x-2 border-l border-slate-200 pl-4">
            <span className="text-xl font-extrabold text-slate-900">{filteredLeads.length}</span>
            <div className="text-left">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block leading-none">NEGÓCIOS</span>
              <span className="text-sm font-extrabold text-emerald-600 block leading-tight">{formatCurrency(totalMinimoValor)}</span>
            </div>
          </div>
        </div>

        {/* Right Side: View Mode Toggles (LISTAGEM vs FUNIL) */}
        <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200 w-full sm:w-auto justify-center">
          <button
            onClick={() => setLeadViewMode('table')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition ${
              leadViewMode === 'table'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>LISTAGEM</span>
          </button>

          <button
            onClick={() => setLeadViewMode('funnel')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition ${
              leadViewMode === 'funnel'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>FUNIL</span>
          </button>
        </div>

      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-3.5 space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-blue-600" />
            <span>Filtros de Qualificação</span>
          </div>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 font-semibold"
            >
              <RotateCcw className="w-3 h-3" />
              Limpar Filtros
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
          
          {/* Phase Filter */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Fase</label>
            <select
              value={faseFilter}
              onChange={e => setFaseFilter(e.target.value as any)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 font-medium"
            >
              <option value="Todas">Todas as Fases</option>
              <option value="Nova lead">Nova lead</option>
              <option value="Em análise">Em análise</option>
              <option value="Pronta para proposta">Pronta para proposta</option>
              <option value="CPCV a preparar">CPCV a preparar</option>
              <option value="Descartada">Descartada</option>
            </select>
          </div>

          {/* Contact Status Filter */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Contacto</label>
            <select
              value={contactoFilter}
              onChange={e => setContactoFilter(e.target.value as any)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 font-medium"
            >
              <option value="Todos">Todos Contactos</option>
              <option value="Não contactado">Não contactado</option>
              <option value="Contactado">Contactado</option>
              <option value="Sem resposta">Sem resposta</option>
              <option value="Reunião marcada">Reunião marcada</option>
            </select>
          </div>

          {/* Photo Status Filter */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Fotos</label>
            <select
              value={fotosFilter}
              onChange={e => setFotosFilter(e.target.value as any)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 font-medium"
            >
              <option value="Todas">Todas as Fotos</option>
              <option value="Sem fotos">Sem fotos</option>
              <option value="Fotos pedidas">Fotos pedidas</option>
              <option value="Fotos recebidas">Fotos recebidas</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Prioridade</label>
            <select
              value={prioridadeFilter}
              onChange={e => setPrioridadeFilter(e.target.value as any)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 font-medium"
            >
              <option value="Todas">Todas Prioridades</option>
              <option value="Baixa">Baixa</option>
              <option value="Média">Média</option>
              <option value="Alta">Alta</option>
              <option value="Urgente">Urgente</option>
            </select>
          </div>

          {/* Flexibility Filter */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Flexibilidade</label>
            <select
              value={flexibilidadeFilter}
              onChange={e => setFlexibilidadeFilter(e.target.value as any)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 font-medium"
            >
              <option value="Todas">Todas</option>
              <option value="Sim">Sim</option>
              <option value="Não">Não</option>
            </select>
          </div>

          {/* Concelho Filter */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Concelho</label>
            <select
              value={concelhoFilter}
              onChange={e => setConcelhoFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 font-medium"
            >
              <option value="Todos">Todos os Concelhos</option>
              {uniqueConcelhos.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* Main View Area: Funnel (Default) or Table */}
      {leadViewMode === 'funnel' ? (
        <FunnelBoard filteredLeads={filteredLeads} />
      ) : (
        <LeadsTable filteredLeads={filteredLeads} faseFilter={faseFilter} />
      )}

    </div>
  );
};
