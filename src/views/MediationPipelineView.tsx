import React, { useState, useMemo } from 'react';
import {
  Building2,
  CheckCircle2,
  Clock,
  DollarSign,
  TrendingUp,
  Percent,
  Search,
  Filter,
  Plus,
  Phone,
  MessageSquare,
  MapPin,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Archive,
  RotateCcw,
  Check,
  AlertCircle,
  FileText,
  Trash2,
  Edit3
} from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { Lead, MediationPhase, AppUser } from '../types/crm';
import { formatCurrency, formatDatePT, getMediationPhaseBadge, getUserTheme } from '../utils/formatters';

const MEDIATION_STAGES: {
  id: MediationPhase;
  stepNumber: number;
  label: string;
  description: string;
  badgeColor: string;
}[] = [
  {
    id: 'Analise_Selecao',
    stepNumber: 1,
    label: '1. EM ANÁLISE / SELEÇÃO',
    description: 'Imóveis em avaliação (condições boas, vendabilidade, preço justo)',
    badgeColor: 'bg-blue-500'
  },
  {
    id: 'Proposta_Apresentada',
    stepNumber: 2,
    label: '2. PROPOSTA APRESENTADA',
    description: 'Proposta de venda por mediação comunicada ao proprietário',
    badgeColor: 'bg-amber-500'
  },
  {
    id: 'Em_Negociacao',
    stepNumber: 3,
    label: '3. EM NEGOCIAÇÃO',
    description: 'Ajuste de comissão 2.8% (IVA incl.), valor e exclusividade',
    badgeColor: 'bg-indigo-500'
  },
  {
    id: 'Contrato_Aceite',
    stepNumber: 4,
    label: '4. CONTRATO ACEITE / ASSINADO',
    description: 'Mediação fechada! Passa AUTOMATICAMENTE para a Gestão de Vendas',
    badgeColor: 'bg-emerald-500'
  },
  {
    id: 'Descartado',
    stepNumber: 5,
    label: '5. DESCARTAR LEAD',
    description: 'Larga aqui para mover diretamente para a aba Descartadas',
    badgeColor: 'bg-rose-500'
  }
];

export const MediationPipelineView: React.FC = () => {
  const {
    leads,
    updateMediationPhase,
    setSelectedLeadForDrawer,
    setEditingLead,
    setIsLeadFormOpen,
    setActiveTab,
    openPropertyMediationCRM,
    requalifyLead,
    currentUser
  } = useCRM();

  const [searchQuery, setSearchQuery] = useState('');
  const [responsavelFilter, setResponsavelFilter] = useState<'Todos' | AppUser>('Todos');
  const [discardNotice, setDiscardNotice] = useState<string | null>(null);

  // Drag and drop state
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<MediationPhase | null>(null);

  // Quick Requalify Modal state
  const [isSelectLeadModalOpen, setIsSelectLeadModalOpen] = useState(false);

  // Filter only active leads that are set to Mediação (discarded leaves this pipeline)
  const mediationLeads = useMemo(() => {
    return leads.filter(l => l.modeloNegocio === 'Mediação' && l.fase !== 'Descartada' && l.mediacaoFase !== 'Descartado');
  }, [leads]);

  // Non-mediation leads available to requalify
  const availableToRequalify = useMemo(() => {
    return leads.filter(l => l.modeloNegocio !== 'Mediação' && l.fase !== 'Descartada');
  }, [leads]);

  // Filtered by search and user
  const filteredLeads = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return mediationLeads.filter(l => {
      if (responsavelFilter !== 'Todos' && l.assignedTo !== responsavelFilter) return false;
      if (q) {
        const matches =
          l.nomeProprietario.toLowerCase().includes(q) ||
          l.freguesia.toLowerCase().includes(q) ||
          (l.moradaZona ? l.moradaZona.toLowerCase().includes(q) : false) ||
          l.telefone.includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [mediationLeads, responsavelFilter, searchQuery]);

  // Top KPI Metrics
  const { totalAngariacoes, contratosAssinados, valorCarteiraTotal, comissaoPrevistaTotal } = useMemo(() => {
    let assinados = 0;
    let carteira = 0;
    let comissao = 0;

    for (let i = 0; i < mediationLeads.length; i++) {
      const l = mediationLeads[i];
      const p = l.mediacaoPrecoVenda || l.valorMinimoAbsoluto || 0;
      const comPct = l.mediacaoComissaoPercent ?? 2.8;

      carteira += p;
      comissao += Math.round(p * (comPct / 100));

      if (l.mediacaoFase === 'Contrato_Aceite') {
        assinados++;
      }
    }

    return {
      totalAngariacoes: mediationLeads.length,
      contratosAssinados: assinados,
      valorCarteiraTotal: carteira,
      comissaoPrevistaTotal: comissao
    };
  }, [mediationLeads]);

  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData('text/plain', leadId);
    setDraggedLeadId(leadId);
  };

  const handleDragOver = (e: React.DragEvent, stage: MediationPhase) => {
    e.preventDefault();
    setDragOverStage(stage);
  };

  const handleDrop = (e: React.DragEvent, stage: MediationPhase) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('text/plain') || draggedLeadId;
    if (leadId) {
      updateMediationPhase(leadId, stage);
      if (stage === 'Descartado') {
        const leadObj = leads.find(l => l.id === leadId);
        setDiscardNotice(`A lead "${leadObj?.nomeProprietario || 'Imóvel'}" foi descartada e movida para a aba Descartadas.`);
        setTimeout(() => setDiscardNotice(null), 5000);
      }
    }
    setDraggedLeadId(null);
    setDragOverStage(null);
  };

  const handleQuickDiscard = (lead: Lead) => {
    if (window.confirm(`Descartar a lead "${lead.nomeProprietario}"? Ela sairá do CRM Mediação e será movida para a aba Descartadas.`)) {
      updateMediationPhase(lead.id, 'Descartado');
      setDiscardNotice(`A lead "${lead.nomeProprietario}" foi descartada e movida para a aba Descartadas.`);
      setTimeout(() => setDiscardNotice(null), 5000);
    }
  };

  return (
    <div className="space-y-6">

      {/* Discard Notification Banner */}
      {discardNotice && (
        <div className="p-3.5 bg-rose-50 border border-rose-300 rounded-xl text-xs text-rose-900 flex items-center justify-between shadow-xs animate-fade-in">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{discardNotice}</span>
          </div>
          <button
            onClick={() => setActiveTab('discarded')}
            className="font-bold underline hover:text-rose-950 ml-3 shrink-0"
          >
            Ver em Descartadas &rarr;
          </button>
        </div>
      )}
      
      {/* Top Header & Context Description */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#141518] text-amber-500 shadow-sm border border-stone-800">
              <Building2 className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight font-display">
                CRM Mediação Imobiliária
              </h1>
              <p className="text-xs text-stone-500 font-medium">
                Pipeline de Angariação: Propostas de mediação para imóveis com boa vendabilidade e preço justo
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsSelectLeadModalOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Requalificar Lead para Mediação</span>
          </button>

          <button
            onClick={() => setActiveTab('mediacao_gestao')}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-[#141518] hover:bg-black text-white rounded-xl text-xs font-bold shadow-sm transition border border-stone-800"
          >
            <span>Ir para Gestão de Vendas</span>
            <ArrowRight className="w-4 h-4 text-emerald-400" />
          </button>
        </div>
      </div>

      {/* KPI Highlight Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
            Angariações Ativas
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-stone-900">{totalAngariacoes}</span>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              Pipeline
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
            Contratos Aceites / Assinados
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-emerald-600">{contratosAssinados}</span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Prontos p/ Venda
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
            Valor de Carteira Estimado
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-black text-stone-900">{formatCurrency(valorCarteiraTotal)}</span>
            <DollarSign className="w-4 h-4 text-stone-400" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
            Comissão Prevista (~5%)
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-black text-amber-700">{formatCurrency(comissaoPrevistaTotal)}</span>
            <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              Margem de Mediação
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-stone-200/90 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Pesquisar por proprietário, freguesia, telefone..."
              className="w-full pl-9 pr-3 py-2 bg-[#FAF8F5] border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-stone-400 font-bold uppercase text-[10px]">Responsável:</span>
          {(['Todos', 'Queirós', 'Hugo'] as const).map(user => (
            <button
              key={user}
              onClick={() => setResponsavelFilter(user)}
              className={`px-3 py-1.5 rounded-xl font-bold transition text-xs ${
                responsavelFilter === user
                  ? 'bg-[#141518] text-white shadow-2xs'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
              }`}
            >
              {user}
            </button>
          ))}
        </div>
      </div>

      {/* 5-Column Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start min-w-full overflow-x-auto pb-4">
        {MEDIATION_STAGES.map(stage => {
          const stageLeads = filteredLeads.filter(l => (l.mediacaoFase || 'Analise_Selecao') === stage.id);
          const isOver = dragOverStage === stage.id;
          const isAceiteColumn = stage.id === 'Contrato_Aceite';
          const isDescartadoColumn = stage.id === 'Descartado';

          if (isDescartadoColumn) {
            return (
              <div
                key={stage.id}
                onDragOver={e => handleDragOver(e, stage.id)}
                onDragLeave={() => setDragOverStage(null)}
                onDrop={e => handleDrop(e, stage.id)}
                className={`rounded-2xl p-3 border transition-all flex flex-col min-h-[480px] bg-rose-50/40 border-rose-300/80 shadow-2xs ${
                  isOver ? 'ring-2 ring-rose-500 bg-rose-100/60 scale-[1.01]' : ''
                }`}
              >
                <div className="pb-2.5 mb-2.5 border-b border-rose-200 flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                      <h3 className="text-xs font-black text-rose-900 tracking-tight">{stage.label}</h3>
                    </div>
                    <p className="text-[10px] text-stone-500 mt-0.5">{stage.description}</p>
                  </div>
                  <Archive className="w-4 h-4 text-rose-400" />
                </div>

                <div className="space-y-3 flex-1 flex flex-col justify-center items-center p-5 text-center rounded-xl border-2 border-dashed border-rose-300 bg-white/70">
                  <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-1">
                    <Trash2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-xs font-black text-rose-900">Zona de Descarte</h4>
                  <p className="text-[11px] text-stone-600 leading-relaxed max-w-[190px]">
                    Larga aqui qualquer lead para a retirar do CRM Mediação e mover automaticamente para a aba <strong>Descartadas</strong>.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('discarded')}
                    className="mt-2 px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-900 font-bold text-xs rounded-xl transition"
                  >
                    Ver Aba Descartadas &rarr;
                  </button>
                </div>
              </div>
            );
          }

          return (
            <div
              key={stage.id}
              onDragOver={e => handleDragOver(e, stage.id)}
              onDragLeave={() => setDragOverStage(null)}
              onDrop={e => handleDrop(e, stage.id)}
              className={`rounded-2xl p-3 border transition-all flex flex-col min-h-[480px] ${
                isAceiteColumn
                  ? 'bg-emerald-50/40 border-emerald-300'
                  : 'bg-[#EFECE6]/80 border-stone-300/80 shadow-2xs'
              } ${isOver ? 'ring-2 ring-emerald-500 bg-emerald-100/50' : ''}`}
            >
              {/* Column Header */}
              <div className="pb-2.5 mb-2.5 border-b border-stone-300 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${stage.badgeColor}`}></span>
                    <h3 className="text-xs font-black text-stone-900 tracking-tight">{stage.label}</h3>
                  </div>
                  <p className="text-[10px] text-stone-500 mt-0.5 line-clamp-1">{stage.description}</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-white border border-stone-300 rounded-full text-stone-800 shadow-2xs shrink-0">
                  {stageLeads.length}
                </span>
              </div>

              {/* Cards List */}
              <div className="space-y-3 flex-1 overflow-y-auto">
                {stageLeads.length === 0 ? (
                  <div className="p-6 text-center text-stone-400 text-xs italic rounded-xl border border-dashed border-stone-300 bg-white/40">
                    Nenhuma lead nesta fase
                  </div>
                ) : (
                  stageLeads.map(lead => {
                    const precoVenda = lead.mediacaoPrecoVenda || lead.valorMinimoAbsoluto;
                    const comissaoPercent = lead.mediacaoComissaoPercent ?? 2.8;
                    const comissaoEur = Math.round(precoVenda * (comissaoPercent / 100));
                    const userTheme = getUserTheme(lead.assignedTo || 'Queirós');
                    const buyersCount = lead.buyers ? lead.buyers.length : 0;

                    return (
                      <div
                        key={lead.id}
                        draggable
                        onDragStart={e => handleDragStart(e, lead.id)}
                        className={`bg-white rounded-xl p-3.5 border transition cursor-grab active:cursor-grabbing space-y-2.5 shadow-2xs hover:shadow-md ${
                          isAceiteColumn ? 'border-emerald-300 hover:border-emerald-500' : 'border-stone-300/80 hover:border-stone-400'
                        }`}
                      >
                        {/* Top Card Row */}
                        <div className="flex items-start justify-between gap-1">
                          <div
                            onClick={() => setSelectedLeadForDrawer(lead)}
                            className="space-y-0.5 cursor-pointer group/title"
                          >
                            <span className="font-black text-xs text-stone-900 block leading-tight group-hover/title:text-emerald-700 transition">
                              {lead.nomeProprietario}
                            </span>
                            <span className="text-[11px] text-stone-500 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-amber-600 shrink-0" />
                              <span className="truncate">{lead.freguesia}</span>
                            </span>
                          </div>

                          <span className={`px-2 py-0.5 text-[9px] font-bold rounded ${userTheme.badgeBg} ${userTheme.badgeText}`}>
                            {lead.assignedTo}
                          </span>
                        </div>

                        {/* Property Specs */}
                        <div className="bg-[#FAF8F5] p-2 rounded-lg border border-stone-200/80 text-[11px] space-y-1">
                          <div className="flex items-center justify-between text-stone-600">
                            <span>{lead.tipoImovel}</span>
                            {lead.areaM2 && <span className="font-semibold">{lead.areaM2} m²</span>}
                          </div>

                          <div className="flex items-center justify-between pt-1 border-t border-stone-200">
                            <span className="text-stone-500 text-[10px]">Venda Pretendida:</span>
                            <strong className="text-stone-900 font-black">{formatCurrency(precoVenda)}</strong>
                          </div>

                          <div className="flex items-center justify-between text-emerald-800">
                            <span className="text-[10px]">Comissão ({comissaoPercent}% IVA incl.):</span>
                            <strong className="font-bold">{formatCurrency(comissaoEur)}</strong>
                          </div>
                        </div>

                        {/* Contacts & Direct Actions */}
                        <div className="flex items-center justify-between text-xs pt-1">
                          {lead.telefone ? (
                            <div className="flex items-center gap-2">
                              <a
                                href={`tel:${lead.telefone}`}
                                className="text-amber-700 hover:underline font-mono text-[11px] font-semibold flex items-center gap-1"
                              >
                                <Phone className="w-3 h-3" />
                                <span>{lead.telefone}</span>
                              </a>
                              <a
                                href={`https://wa.me/351${lead.telefone.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-600 hover:text-emerald-700 text-[10px] font-bold flex items-center gap-0.5"
                              >
                                <MessageSquare className="w-2.5 h-2.5" />
                                <span>WA</span>
                              </a>
                            </div>
                          ) : (
                            <span className="text-[10px] text-stone-400 italic">Sem telefone</span>
                          )}

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setEditingLead(lead);
                                setIsLeadFormOpen(true);
                              }}
                              className="text-[11px] font-bold text-stone-500 hover:text-stone-900 flex items-center gap-0.5"
                              title="Editar Lead"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Editar</span>
                            </button>

                            <button
                              onClick={() => setSelectedLeadForDrawer(lead)}
                              className="text-[11px] font-bold text-emerald-700 hover:text-emerald-950 underline"
                              title="Ver Ficha Geral Completa"
                            >
                              Ficha
                            </button>

                            <button
                              onClick={() => handleQuickDiscard(lead)}
                              className="text-stone-400 hover:text-rose-600 p-0.5 rounded transition"
                              title="Descartar Lead"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Requalification Notes snippet if present */}
                        {lead.requalificacaoNotas && (
                          <p className="text-[10px] text-stone-500 italic bg-amber-50/50 p-1.5 rounded border border-amber-100 line-clamp-2">
                            "{lead.requalificacaoNotas}"
                          </p>
                        )}

                        {/* If Contrato Aceite -> Quick Button to Open Property Mini CRM */}
                        {isAceiteColumn ? (
                          <div className="pt-2 border-t border-emerald-100 space-y-1.5">
                            <button
                              onClick={() => openPropertyMediationCRM(lead)}
                              className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-bold shadow-2xs transition flex items-center justify-center gap-1.5"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                              <span>Gerir Interessados ({buyersCount})</span>
                            </button>
                          </div>
                        ) : (
                          /* Quick Phase Advancer */
                          <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                            <select
                              value={lead.mediacaoFase || 'Analise_Selecao'}
                              onChange={e => updateMediationPhase(lead.id, e.target.value as MediationPhase)}
                              className="text-[10px] font-semibold bg-[#FAF8F5] border border-stone-200 rounded px-1.5 py-0.5 text-stone-700"
                            >
                              {MEDIATION_STAGES.map(s => (
                                <option key={s.id} value={s.id}>{s.label}</option>
                              ))}
                            </select>

                            {stage.id !== 'Contrato_Aceite' && stage.id !== 'Descartado' && (
                              <button
                                onClick={() => updateMediationPhase(lead.id, 'Contrato_Aceite')}
                                className="text-[10px] font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200 transition flex items-center gap-1"
                                title="Aceitar Contrato e passar para Gestão de Vendas"
                              >
                                <Check className="w-3 h-3" />
                                <span>Aceite</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: Requalificar Lead Existente para Mediação */}
      {isSelectLeadModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-stone-300 p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div>
                <h3 className="text-base font-black text-stone-900">Requalificar Imóvel para Mediação</h3>
                <p className="text-xs text-stone-500">
                  Seleciona uma lead ativa para converter em oportunidade de Mediação Imobiliária
                </p>
              </div>
              <button
                onClick={() => setIsSelectLeadModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-2 pr-1">
              {availableToRequalify.length === 0 ? (
                <p className="text-stone-400 text-xs italic text-center py-8">
                  Todas as leads ativas já estão em Mediação ou não há leads disponíveis.
                </p>
              ) : (
                availableToRequalify.map(l => (
                  <div
                    key={l.id}
                    className="p-3 rounded-xl border border-stone-200 hover:border-amber-400 bg-[#FAF8F5] flex items-center justify-between gap-3 text-xs transition"
                  >
                    <div className="space-y-0.5">
                      <span className="font-bold text-stone-900 block">{l.nomeProprietario}</span>
                      <span className="text-[11px] text-stone-500">{l.tipoImovel} em {l.freguesia} ({l.areaM2} m²)</span>
                      <span className="text-[11px] text-stone-600 block">
                        Valor Mínimo Atual: <strong>{formatCurrency(l.valorMinimoAbsoluto)}</strong>
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        requalifyLead(l.id, 'Mediação', 'Requalificado para Mediação Imobiliária via Pipeline', {
                          mediacaoPrecoVenda: l.valorMinimoAbsoluto,
                          mediacaoComissaoPercent: 2.8,
                          mediacaoFase: 'Analise_Selecao'
                        });
                        setIsSelectLeadModalOpen(false);
                      }}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs shadow-2xs transition shrink-0 flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Requalificar</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
