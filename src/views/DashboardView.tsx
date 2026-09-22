import React, { useState } from 'react';
import {
  Building2, PhoneCall, Search, Calendar, FileText, CheckCircle2,
  TrendingUp, ArrowRight, MapPin, Clock, StickyNote, Plus, Pin, Sparkles, User, Check, ShieldCheck
} from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { formatCurrency, formatDatePT, formatDateTimePT, getVisitStateBadge, getProposalStateBadge, getUserTheme } from '../utils/formatters';

export const DashboardView: React.FC = () => {
  const {
    leads,
    visits,
    proposals,
    notes,
    operations,
    addNote,
    togglePinNote,
    toggleVisitRealizada,
    setActiveTab,
    setSelectedLeadForDrawer,
    setLeadViewMode,
    openAIAnalysis,
    currentUser
  } = useCRM();

  const [dashboardNoteText, setDashboardNoteText] = useState('');

  // Active Leads (Descartadas desaparecem da página principal)
  const activeLeads = leads.filter(l => l.fase !== 'Descartada');
  const discardedLeadsCount = leads.filter(l => l.fase === 'Descartada').length;

  // Primary Metrics
  const totalLeads = activeLeads.length;
  const porContactar = activeLeads.filter(l => l.contacto === 'Não contactado').length;
  const totalMargem = activeLeads.reduce((acc, curr) => acc + (curr.margemPotencial || 0), 0);
  const propostasAceites = proposals.filter(p => p.estado === 'Aceite').length;
  const totalSinais = proposals.reduce((acc, curr) => acc + (curr.valorSinal || 0), 0);
  const operacoesAtivas = operations.filter(o => o.fase !== 'Venda_Fechada' && o.fase !== 'Cancelado').length;
  const totalLucroFechado = operations
    .filter(o => o.fase === 'Venda_Fechada')
    .reduce((acc, curr) => acc + (curr.lucroRealizado || 0), 0);

  // Top Deals by Potential Margin (Apenas leads ativas)
  const topMarginDeals = [...activeLeads]
    .sort((a, b) => (b.margemPotencial || 0) - (a.margemPotencial || 0))
    .slice(0, 4);

  // Upcoming Visits
  const upcomingVisits = [...visits]
    .filter(v => v.estado === 'Marcada' || v.estado === 'Confirmada')
    .sort((a, b) => new Date(`${a.data}T${a.hora}`).getTime() - new Date(`${b.data}T${b.hora}`).getTime())
    .slice(0, 4);

  // Active Proposals with Multiplier
  const activeProposals = proposals
    .filter(p => p.estado === 'Enviada' || p.estado === 'Em negociação')
    .slice(0, 4);

  // Dashboard Notes (Sorted: pinned first, then recent)
  const dashboardNotes = [...notes]
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    })
    .slice(0, 6);

  const handleCreateDashboardNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dashboardNoteText.trim()) return;

    addNote({
      text: dashboardNoteText.trim(),
      pinned: true
    });

    setDashboardNoteText('');
  };

  const userTheme = getUserTheme(currentUser);

  return (
    <div className="space-y-6">
      
      {/* Top Banner (Obsidian luxury theme) */}
      <div className="bg-[#16171B] text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-stone-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase font-bold tracking-wider text-amber-500">Painel Operacional</span>
            <span className="text-stone-600">•</span>
            <span className="text-xs text-stone-300">
              Sessão iniciada como: <strong className="text-white">{currentUser}</strong>
            </span>
          </div>
          <h2 className="text-xl font-black tracking-tight text-white">Wholetailing CRM Portugal</h2>
          <p className="text-xs text-stone-400 mt-0.5">
            Gestão simplificada de oportunidades, estudo de mercado por m² e controlo de propostas.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              setLeadViewMode('funnel');
              setActiveTab('leads');
            }}
            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-2"
          >
            <span>Ver Funil de Leads</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 5 Clean Key Metrics with mixed sharp frame & rounded pills */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 border border-stone-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">Total de Leads</span>
          <span className="text-2xl font-black text-stone-900 mt-1 block">{totalLeads}</span>
          <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-600">
            {porContactar} por contactar
          </span>
        </div>

        <div className="bg-white p-4 border border-stone-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">Margem Potencial</span>
          <span className="text-xl font-black text-emerald-600 mt-1 block">{formatCurrency(totalMargem)}</span>
          <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
            Pipeline arbitragem
          </span>
        </div>

        <div className="bg-white p-4 border border-stone-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">Sinais CPCV (10%)</span>
          <span className="text-xl font-black text-amber-800 mt-1 block">{formatCurrency(totalSinais)}</span>
          <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800">
            Capital de sinal
          </span>
        </div>

        <div
          onClick={() => setActiveTab('operations')}
          className="bg-white p-4 border border-stone-200 shadow-2xs cursor-pointer hover:border-amber-400 transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">Operações & CPCV</span>
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <span className="text-2xl font-black text-stone-900 mt-1 block">{operacoesAtivas}</span>
          <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-900 text-white">
            {propostasAceites} aceites no total
          </span>
        </div>

        <div
          onClick={() => setActiveTab('operations')}
          className="bg-emerald-950 text-white p-4 border border-emerald-800 shadow-2xs cursor-pointer hover:bg-emerald-900 transition"
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 block">Lucro Realizado</span>
          <span className="text-xl font-black text-emerald-400 mt-1 block">{formatCurrency(totalLucroFechado)}</span>
          <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-800 text-emerald-200">
            Deals concluídos
          </span>
        </div>

        {discardedLeadsCount > 0 && (
          <div
            onClick={() => setActiveTab('discarded')}
            className="bg-[#1A1B20] text-stone-300 p-4 border border-stone-800 shadow-2xs cursor-pointer hover:border-amber-500 transition"
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 block">Leads Descartadas</span>
            <span className="text-2xl font-black text-white mt-1 block">{discardedLeadsCount}</span>
            <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-800 text-stone-300 hover:text-white">
              Ver aba Descartadas &rarr;
            </span>
          </div>
        )}
      </div>

      {/* REQUIREMENT 5: PRIMARY NOTES BOARD IN THE DASHBOARD */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
              <StickyNote className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-stone-900 leading-tight">
                Quadro Primário de Notas & Ações
              </h3>
              <p className="text-[11px] text-stone-500">
                Registo imediato e acompanhamento direto das notas de Queirós e Hugo
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('notes')}
            className="text-xs font-bold text-amber-800 hover:text-amber-900 underline flex items-center gap-1"
          >
            <span>Ver Todas as Notas</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Quick Note Input */}
        <form onSubmit={handleCreateDashboardNote} className="flex gap-2">
          <input
            type="text"
            value={dashboardNoteText}
            onChange={e => setDashboardNoteText(e.target.value)}
            placeholder={`Escreva uma nota rápida ou ação pendente (Autor: ${currentUser})...`}
            className="flex-1 px-3.5 py-2 bg-[#FAF8F5] border border-stone-200 rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-amber-500 transition"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-stone-900 hover:bg-black text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Adicionar</span>
          </button>
        </form>

        {/* Notes Feed Grid */}
        {dashboardNotes.length === 0 ? (
          <p className="text-center py-6 text-stone-400 text-xs">Sem notas registadas.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
            {dashboardNotes.map(note => {
              const authorTheme = getUserTheme(note.author);
              return (
                <div
                  key={note.id}
                  className={`p-3 rounded-xl border text-xs flex flex-col justify-between space-y-2 transition ${
                    note.pinned ? 'bg-[#FAF8F4] border-amber-300 shadow-2xs' : 'bg-[#FAF8F5] border-stone-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-4 h-4 rounded text-[9px] font-black flex items-center justify-center ${authorTheme.avatarBg}`}>
                        {authorTheme.initial}
                      </span>
                      <span className="font-bold text-stone-800 text-[11px]">{authorTheme.name}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-stone-400">{formatDateTimePT(note.date)}</span>
                      <button
                        onClick={() => togglePinNote(note.id)}
                        className={`p-1 rounded ${note.pinned ? 'text-amber-600' : 'text-stone-300 hover:text-stone-600'}`}
                        title={note.pinned ? 'Desafixar' : 'Fixar'}
                      >
                        <Pin className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <p className="text-stone-700 leading-relaxed line-clamp-3">
                    {note.text}
                  </p>

                  {note.leadTitle && (
                    <div className="pt-1 border-t border-stone-200/60">
                      <span className="text-[10px] font-semibold text-amber-800 truncate block">
                        📍 {note.leadTitle}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Middle Grid: Top Deals & Upcoming Visits & Proposals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* TOP DEALS BY MARGIN */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <h3 className="font-bold text-stone-900 text-xs uppercase tracking-wider">
                Maiores Margens Potenciais
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('leads')}
              className="text-xs text-amber-800 hover:underline font-bold"
            >
              Ver Todas
            </button>
          </div>

          {topMarginDeals.length === 0 ? (
            <p className="text-stone-400 text-xs text-center py-6">Nenhuma lead registada de momento.</p>
          ) : (
            <div className="space-y-2.5">
              {topMarginDeals.map(l => {
                const userTheme = getUserTheme(l.assignedTo);
                return (
                  <div
                    key={l.id}
                    onClick={() => setSelectedLeadForDrawer(l)}
                    className="p-3 bg-[#FAF8F5] hover:bg-[#F5F1E8] rounded-xl border border-stone-200 text-xs space-y-1.5 cursor-pointer transition"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-900">{l.nomeProprietario}</span>
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-stone-100 text-stone-700 border border-stone-200">
                        {l.tipoImovel}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-stone-600">
                      <span>{l.freguesia}</span>
                      {l.precoM2 ? (
                        <span className="font-bold text-stone-900">{l.precoM2} €/m²</span>
                      ) : null}
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-stone-200/60">
                      <span className="text-stone-500">Mín: {formatCurrency(l.valorMinimoAbsoluto)}</span>
                      <span className="text-emerald-700 font-extrabold">Margem: {formatCurrency(l.margemPotencial)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* UPCOMING VISITS (WITH 1-CLICK TOGGLE REALIZADA) */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-stone-700" />
              <h3 className="font-bold text-stone-900 text-xs uppercase tracking-wider">
                Próximas Visitas ({upcomingVisits.length})
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('calendar')}
              className="text-xs text-amber-800 hover:underline font-bold"
            >
              Calendário
            </button>
          </div>

          {upcomingVisits.length === 0 ? (
            <p className="text-stone-400 text-xs text-center py-6">Sem visitas agendadas em breve.</p>
          ) : (
            <div className="space-y-2.5">
              {upcomingVisits.map(v => {
                const userTheme = getUserTheme(v.assignedUser || v.responsavel);
                return (
                  <div key={v.id} className="p-3 bg-[#FAF8F5] rounded-xl border border-stone-200 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-900">{v.nomeProprietario}</span>
                      <button
                        onClick={() => toggleVisitRealizada(v.id)}
                        className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-white hover:bg-emerald-50 text-stone-700 hover:text-emerald-800 border border-stone-300 transition flex items-center gap-1"
                      >
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>Marcar Feita</span>
                      </button>
                    </div>

                    <p className="text-[11px] text-stone-600 flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                      {v.moradaZona}, {v.concelhoFreguesia}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-stone-500 pt-1 border-t border-stone-200/60">
                      <span>{formatDatePT(v.data)} às {v.hora}</span>
                      <span className="font-bold text-stone-700">Resp: {userTheme.name}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ACTIVE PROPOSALS WITH DOWN PAYMENT MULTIPLE */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-stone-700" />
              <h3 className="font-bold text-stone-900 text-xs uppercase tracking-wider">
                Propostas & Múltiplos
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('proposals')}
              className="text-xs text-amber-800 hover:underline font-bold"
            >
              Propostas
            </button>
          </div>

          {activeProposals.length === 0 ? (
            <p className="text-stone-400 text-xs text-center py-6">Nenhuma proposta ativa em negociação.</p>
          ) : (
            <div className="space-y-2.5">
              {activeProposals.map(p => {
                const st = getProposalStateBadge(p.estado);
                return (
                  <div key={p.id} className="p-3 bg-[#FAF8F5] rounded-xl border border-stone-200 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-900">{p.nomeProprietario}</span>
                      <span className={`px-2 py-0.5 text-[9px] rounded font-bold border ${st.bg} ${st.text} ${st.border}`}>
                        {p.estado}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                      <div>
                        <span className="text-[9px] text-stone-400 block uppercase font-bold">Proposta</span>
                        <span className="font-bold text-stone-900">{formatCurrency(p.valorProposta)}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-stone-400 block uppercase font-bold">Sinal (10%)</span>
                        <span className="font-bold text-amber-800">{formatCurrency(p.valorSinal)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-stone-200/60">
                      <span className="text-emerald-700 font-bold">Margem: {formatCurrency(p.margemPrevista)}</span>
                      <span className="px-2 py-0.5 rounded bg-white text-emerald-800 border border-stone-200 font-black text-[10px]">
                        {p.multiploSinal || '-'}x Múltiplo
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
