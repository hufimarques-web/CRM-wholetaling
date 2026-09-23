import React, { useState, useEffect } from 'react';
import {
  X, Phone, PhoneCall, MapPin, Calendar, FileText, Plus, Edit, Trash2,
  CheckCircle2, AlertCircle, Building, Tag, Send, Clock, Sparkles, User, Check, ArrowRight, ShieldCheck,
  Archive, RotateCcw, Mail, TrendingUp, Percent, Sliders
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { formatCurrency, formatDatePT, checkLeadReadiness, getContactStatusBadge, getPhotoStatusBadge, getPhaseBadge, getPriorityBadge, getVisitStateBadge, getProposalStateBadge, getUserTheme } from '../../utils/formatters';
import { Lead } from '../../types/crm';

export const LeadDetailDrawer: React.FC = () => {
  const {
    selectedLeadForDrawer,
    setSelectedLeadForDrawer,
    updateLead,
    setPrefilledProposalData,
    setEditingLead,
    setIsLeadFormOpen,
    setPreselectedVisitLeadId,
    setIsVisitFormOpen,
    setPreselectedProposalLeadId,
    setIsProposalFormOpen,
    setEditingProposal,
    setViewingProposal,
    requestDeleteLead,
    updateLeadPhase,
    discardLead,
    restoreLead,
    addNoteToLead,
    openCallModal,
    openAIAnalysis,
    toggleVisitRealizada,
    setActiveTab: setNavTab,
    operations,
    currentUser,
    visits,
    proposals
  } = useCRM();

  const [activeTab, setActiveTab] = useState<'info' | 'visits' | 'proposals' | 'notes'>('info');
  const [newNoteText, setNewNoteText] = useState('');



  if (!selectedLeadForDrawer) return null;

  const lead = selectedLeadForDrawer;
  const leadVisits = visits.filter(v => v.leadId === lead.id);
  const leadProposals = proposals.filter(p => p.leadId === lead.id);
  const leadOperation = operations.find(o => o.leadId === lead.id);
  const readiness = checkLeadReadiness(lead);

  const contactBadge = getContactStatusBadge(lead.contacto);
  const photoBadge = getPhotoStatusBadge(lead.fotos);
  const phaseBadge = getPhaseBadge(lead.fase);
  const priorityBadge = getPriorityBadge(lead.prioridade);
  const userTheme = getUserTheme(lead.assignedTo || 'Queirós');

  const handleAddNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    addNoteToLead(lead.id, newNoteText.trim());
    setNewNoteText('');
  };

  const handleBookVisit = () => {
    setPreselectedVisitLeadId(lead.id);
    setIsVisitFormOpen(true);
  };

  const handleCreateProposal = () => {
    setPreselectedProposalLeadId(lead.id);
    setIsProposalFormOpen(true);
  };

  const handleEditLead = () => {
    setEditingLead(lead);
    setIsLeadFormOpen(true);
  };



  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs transition-opacity"
        onClick={() => setSelectedLeadForDrawer(null)}
      />

      {/* Drawer Container (Architectural Straight Border) */}
      <div className="relative w-full max-w-2xl bg-white shadow-2xl h-full z-10 flex flex-col border-l border-stone-300">
        
        {/* Drawer Header (Obsidian luxury theme) */}
        <div className="bg-[#16171B] px-6 py-5 text-white flex items-start justify-between shrink-0 border-b border-stone-800">
          <div className="space-y-1.5 pr-4">
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <h2 className="text-lg font-black text-white">{lead.nomeProprietario}</h2>
              <span className={`px-2 py-0.5 text-[10px] rounded-full uppercase tracking-wider font-bold ${priorityBadge.bg}`}>
                {priorityBadge.text}
              </span>
              <span className={`px-2 py-0.5 text-[10px] rounded-md font-bold border ${phaseBadge.bg} ${phaseBadge.text} ${phaseBadge.border}`}>
                {lead.fase}
              </span>
              {/* Assigned User Badge */}
              <span className={`flex items-center gap-1 px-2 py-0.5 text-[10px] rounded-md font-bold border ${userTheme.badgeBg} ${userTheme.badgeText} ${userTheme.badgeBorder}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${userTheme.dot}`}></span>
                <span>{userTheme.name}</span>
              </span>
            </div>

            <div className="flex items-center space-x-3 text-xs text-stone-300">
              <span className="flex items-center gap-1 text-stone-300">
                <MapPin className="w-3.5 h-3.5 text-amber-500" />
                {lead.freguesia}
              </span>
              <span className="flex items-center gap-1 text-stone-300">
                <Building className="w-3.5 h-3.5 text-amber-500" />
                {lead.tipoImovel} ({lead.areaM2} m²)
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={handleEditLead}
              className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition"
              title="Editar Lead (100% editável)"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSelectedLeadForDrawer(null)}
              className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Readiness Badges & Operation Status */}
        <div className="bg-[#FAF8F5] px-6 py-2.5 border-b border-stone-200 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-3">
            {leadOperation ? (
              <button
                onClick={() => {
                  setSelectedLeadForDrawer(null);
                  setNavTab('operations');
                }}
                className="flex items-center gap-1 text-amber-900 font-bold bg-amber-100/70 px-2 py-0.5 rounded-md border border-amber-300 hover:bg-amber-200 transition"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                <span>Em Operação: {leadOperation.fase.replace('_', ' ')}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            ) : readiness.readyForProposal ? (
              <span className="flex items-center gap-1 text-amber-800 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-amber-600" />
                Pronta para Proposta
              </span>
            ) : (
              <span className="flex items-center gap-1 text-stone-500">
                <AlertCircle className="w-4 h-4 text-stone-400" />
                Pendente de contacto/fotos
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {lead.fase === 'Descartada' ? (
              <button
                onClick={() => {
                  restoreLead(lead.id, 'Nova lead');
                  setSelectedLeadForDrawer(null);
                }}
                className="px-2.5 py-1 text-xs font-bold text-emerald-800 bg-emerald-100/80 hover:bg-emerald-200 rounded-md border border-emerald-300 transition flex items-center gap-1.5"
                title="Reativar e colocar no funil ativo"
              >
                <RotateCcw className="w-3.5 h-3.5 text-emerald-700" />
                <span>Reativar Lead</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  if (window.confirm(`Descartar a lead "${lead.nomeProprietario}" e mover para a aba Descartadas?`)) {
                    discardLead(lead.id);
                    setSelectedLeadForDrawer(null);
                  }
                }}
                className="px-2 py-1 text-xs font-semibold text-stone-600 hover:text-rose-700 bg-stone-100 hover:bg-rose-50 rounded-md border border-stone-200 hover:border-rose-300 transition flex items-center gap-1"
                title="Descartar esta lead (sai do funil ativo)"
              >
                <Archive className="w-3.5 h-3.5 text-rose-500" />
                <span>Descartar Lead</span>
              </button>
            )}

            <button
              onClick={() => requestDeleteLead(lead.id)}
              className="p-1 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-md transition text-xs flex items-center gap-1"
              title="Eliminar Lead permanentemente"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="text-[10px]">Eliminar</span>
            </button>
          </div>
        </div>

        {/* Quick Action Ribbon with AI Assistant */}
        <div className="px-6 py-2.5 bg-white border-b border-stone-200 flex items-center gap-2 overflow-x-auto shrink-0">
          <button
            onClick={() => openAIAnalysis(lead)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold shadow-2xs transition shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Análise AI</span>
          </button>

          <button
            onClick={() => openCallModal(lead.id)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200 rounded-xl text-xs font-semibold shadow-2xs transition shrink-0"
          >
            <PhoneCall className="w-3.5 h-3.5 text-stone-600" />
            <span>Registar Chamada</span>
          </button>

          <button
            onClick={handleBookVisit}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200 rounded-xl text-xs font-semibold shadow-2xs transition shrink-0"
          >
            <Calendar className="w-3.5 h-3.5 text-stone-600" />
            <span>Marcar Visita</span>
          </button>

          <button
            onClick={handleCreateProposal}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-stone-900 hover:bg-black text-white rounded-xl text-xs font-bold shadow-2xs transition shrink-0"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Criar Proposta</span>
          </button>
        </div>

        {/* Tabs Navigation */}
        <div className="flex border-b border-stone-200 bg-[#FAF8F5] px-6 shrink-0 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('info')}
            className={`py-2.5 px-4 border-b-2 transition ${
              activeTab === 'info'
                ? 'border-stone-900 text-stone-900 font-bold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Ficha Geral & Mercado
          </button>
          <button
            onClick={() => setActiveTab('visits')}
            className={`py-2.5 px-4 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'visits'
                ? 'border-stone-900 text-stone-900 font-bold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <span>Visitas</span>
            <span className="bg-stone-200 text-stone-700 px-1.5 py-0.2 rounded-full text-[10px]">
              {leadVisits.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('proposals')}
            className={`py-2.5 px-4 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'proposals'
                ? 'border-stone-900 text-stone-900 font-bold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <span>Propostas & Sinal</span>
            <span className="bg-stone-200 text-stone-700 px-1.5 py-0.2 rounded-full text-[10px]">
              {leadProposals.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`py-2.5 px-4 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'notes'
                ? 'border-stone-900 text-stone-900 font-bold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <span>Histórico & Notas</span>
            <span className="bg-stone-200 text-stone-700 px-1.5 py-0.2 rounded-full text-[10px]">
              {lead.notas?.length || 0}
            </span>
          </button>
        </div>

        {/* Drawer Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-stone-800">
          
          {/* TAB 1: FICHA GERAL COMPLETA */}
          {activeTab === 'info' && (
            <div className="space-y-6">

              {/* SECTION: ESTUDO DE MERCADO AVEIRO */}
              <div className="bg-[#FAF8F5] p-4 border border-stone-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    Estudo de Mercado & Benchmark Aveiro ({lead.freguesia})
                  </span>
                  {lead.etiquetaMercado && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white text-stone-800 border border-stone-300 shadow-2xs">
                      {lead.etiquetaMercado}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-stone-200">
                  <div className="bg-white p-2.5 border border-stone-200">
                    <span className="text-[10px] text-stone-400 font-semibold block">Preço da Lead / m²</span>
                    <span className="text-sm font-black text-stone-900 block mt-0.5">
                      {lead.precoM2 ? `${lead.precoM2} €/m²` : '-'}
                    </span>
                  </div>
                  <div className="bg-white p-2.5 border border-stone-200">
                    <span className="text-[10px] text-stone-400 font-semibold block">Média da Freguesia</span>
                    <span className="text-sm font-black text-stone-700 block mt-0.5">
                      {lead.mediaFreguesiaM2 ? `${lead.mediaFreguesiaM2} €/m²` : '-'}
                    </span>
                  </div>
                  <div className="bg-white p-2.5 border border-stone-200">
                    <span className="text-[10px] text-stone-400 font-semibold block">Diferença vs Mercado</span>
                    <span className={`text-sm font-black block mt-0.5 ${
                      (lead.deltaMercadoPercent || 0) <= -15 ? 'text-emerald-600' : 'text-stone-800'
                    }`}>
                      {lead.deltaMercadoPercent !== undefined ? `${lead.deltaMercadoPercent > 0 ? '+' : ''}${lead.deltaMercadoPercent}%` : '-'}
                    </span>
                  </div>
                </div>
              </div>

              {/* SECTION: FICHA GERAL COMPLETA ("NA FICHA GERAL TEM DE APARECER TUDO!") */}
              <div className="bg-white p-5 border border-stone-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-stone-700" />
                    <h3 className="font-extrabold text-xs text-stone-900 uppercase tracking-wider">
                      Ficha Geral Completa do Imóvel & Proprietário
                    </h3>
                  </div>
                  <button
                    onClick={handleEditLead}
                    className="text-stone-700 hover:text-stone-950 font-bold text-xs underline flex items-center gap-1"
                  >
                    <Edit className="w-3.5 h-3.5 text-amber-600" />
                    <span>Editar Ficha</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 text-xs">
                  {/* Proprietário */}
                  <div className="bg-[#FAF8F5] p-3 rounded-xl border border-stone-200">
                    <span className="text-[10px] text-stone-400 font-bold uppercase block">Nome do Proprietário</span>
                    <span className="font-black text-stone-900 text-sm mt-0.5 block">{lead.nomeProprietario}</span>
                  </div>

                  {/* Telefone */}
                  <div className="bg-[#FAF8F5] p-3 rounded-xl border border-stone-200 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] text-stone-400 font-bold uppercase block">Contacto Telefónico</span>
                      <a href={`tel:${lead.telefone}`} className="font-bold text-amber-700 hover:underline text-xs mt-0.5 block">
                        {lead.telefone}
                      </a>
                    </div>
                    <button
                      onClick={() => openCallModal(lead.id)}
                      className="mt-2 text-[10px] font-bold text-stone-700 hover:text-stone-900 flex items-center gap-1"
                    >
                      <PhoneCall className="w-3 h-3 text-amber-600" />
                      <span>Registar Chamada</span>
                    </button>
                  </div>

                  {/* Email */}
                  <div className="bg-[#FAF8F5] p-3 rounded-xl border border-stone-200">
                    <span className="text-[10px] text-stone-400 font-bold uppercase block">Email de Contacto</span>
                    <span className="font-semibold text-stone-800 text-xs mt-0.5 block truncate">
                      {lead.email || <span className="text-stone-400 italic">Não indicado</span>}
                    </span>
                  </div>

                  {/* Localização & Concelho */}
                  <div className="bg-[#FAF8F5] p-3 rounded-xl border border-stone-200">
                    <span className="text-[10px] text-stone-400 font-bold uppercase block">Freguesia & Concelho</span>
                    <span className="font-bold text-stone-900 text-xs mt-0.5 block">
                      {lead.freguesia}, {lead.concelho || 'Aveiro'}
                    </span>
                  </div>

                  {/* Morada / Zona */}
                  <div className="bg-[#FAF8F5] p-3 rounded-xl border border-stone-200">
                    <span className="text-[10px] text-stone-400 font-bold uppercase block">Morada / Rua / Zona</span>
                    <span className="font-semibold text-stone-800 text-xs mt-0.5 block">
                      {lead.moradaZona || <span className="text-stone-400 italic">Zona geral</span>}
                    </span>
                  </div>

                  {/* Tipo & Área */}
                  <div className="bg-[#FAF8F5] p-3 rounded-xl border border-stone-200">
                    <span className="text-[10px] text-stone-400 font-bold uppercase block">Tipo & Área</span>
                    <span className="font-bold text-stone-900 text-xs mt-0.5 block">
                      {lead.tipoImovel} ({lead.areaM2 ? `${lead.areaM2} m²` : 'Área por confirmar'})
                    </span>
                  </div>

                  {/* Estado do Imóvel */}
                  <div className="bg-[#FAF8F5] p-3 rounded-xl border border-stone-200">
                    <span className="text-[10px] text-stone-400 font-bold uppercase block">Estado do Imóvel</span>
                    <span className="font-bold text-amber-900 text-xs mt-0.5 block">
                      {lead.estadoImovel}
                    </span>
                  </div>

                  {/* Estado das Fotos */}
                  <div className="bg-[#FAF8F5] p-3 rounded-xl border border-stone-200">
                    <span className="text-[10px] text-stone-400 font-bold uppercase block">Estado das Fotos</span>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold border ${photoBadge.bg} ${photoBadge.text} ${photoBadge.border}`}>
                      {lead.fotos}
                    </span>
                  </div>

                  {/* Origem da Lead */}
                  <div className="bg-[#FAF8F5] p-3 rounded-xl border border-stone-200">
                    <span className="text-[10px] text-stone-400 font-bold uppercase block">Origem da Oportunidade</span>
                    <span className="font-bold text-stone-800 text-xs mt-0.5 block">
                      {lead.origem || 'Prospeção direta'}
                    </span>
                  </div>

                  {/* Valor Mínimo Aceitável */}
                  <div className="bg-[#FAF8F5] p-3 rounded-xl border border-stone-200">
                    <span className="text-[10px] text-stone-400 font-bold uppercase block">Valor Mínimo Aceitável</span>
                    <span className="font-black text-stone-900 text-sm mt-0.5 block">
                      {formatCurrency(lead.valorMinimoAbsoluto)}
                    </span>
                  </div>

                  {/* Sinal CPCV 10% Padrão */}
                  <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-300">
                    <span className="text-[10px] text-amber-800 font-bold uppercase block">Sinal CPCV 10% (Padrão)</span>
                    <span className="font-black text-amber-900 text-sm mt-0.5 block">
                      {formatCurrency(Math.round(lead.valorMinimoAbsoluto * 0.10))}
                    </span>
                    <span className="text-[9px] text-amber-700 block mt-0.5">Capital investido a 10%</span>
                  </div>

                  {/* Margem Bruta Estimada */}
                  <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-300">
                    <span className="text-[10px] text-emerald-800 font-bold uppercase block">Margem Bruta Estimada</span>
                    <span className="font-black text-emerald-700 text-sm mt-0.5 block">
                      {formatCurrency(lead.margemPotencial)}
                    </span>
                    <span className="text-[9px] text-emerald-800 block mt-0.5">Pipeline de arbitragem</span>
                  </div>

                  {/* Prazo Pretendido */}
                  <div className="bg-[#FAF8F5] p-3 rounded-xl border border-stone-200">
                    <span className="text-[10px] text-stone-400 font-bold uppercase block">Prazo Pretendido</span>
                    <span className="font-bold text-stone-800 text-xs mt-0.5 block">
                      {lead.prazoPretendido}
                    </span>
                  </div>

                  {/* Flexibilidade Negocial */}
                  <div className="bg-[#FAF8F5] p-3 rounded-xl border border-stone-200">
                    <span className="text-[10px] text-stone-400 font-bold uppercase block">Flexibilidade no Preço</span>
                    <span className="font-bold text-stone-800 text-xs mt-0.5 block">
                      {lead.flexibilidade}
                    </span>
                  </div>

                  {/* Data de Entrada & Responsável */}
                  <div className="bg-[#FAF8F5] p-3 rounded-xl border border-stone-200">
                    <span className="text-[10px] text-stone-400 font-bold uppercase block">Entrada & Responsável</span>
                    <span className="font-semibold text-stone-800 text-xs mt-0.5 block">
                      {formatDatePT(lead.dataEntrada)} • <strong>{lead.assignedTo}</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* SECTION: PROPOSTAS ASSOCIADAS DIRETO NA FICHA GERAL */}
              <div className="bg-white p-4 border border-stone-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-stone-700" />
                    <h3 className="font-bold text-xs text-stone-900 uppercase tracking-wider">
                      Propostas de Compra para este Imóvel ({leadProposals.length})
                    </h3>
                  </div>
                  <button
                    onClick={handleCreateProposal}
                    className="px-3 py-1 bg-stone-900 hover:bg-black text-white rounded-lg text-xs font-bold transition flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Nova Proposta</span>
                  </button>
                </div>

                {leadProposals.length === 0 ? (
                  <p className="text-stone-400 text-xs italic py-2">Nenhuma proposta formal criada ainda para este imóvel.</p>
                ) : (
                  <div className="space-y-2">
                    {leadProposals.map(p => {
                      const st = getProposalStateBadge(p.estado);
                      return (
                        <div
                          key={p.id}
                          className="p-3 bg-[#FAF8F5] rounded-xl border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.2 rounded text-[9px] font-bold border ${st.bg} ${st.text} ${st.border}`}>
                                {p.estado}
                              </span>
                              <span className="text-stone-400 text-[10px]">Envio: {formatDatePT(p.dataEnvio)}</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs mt-1">
                              <span>Proposta: <strong className="text-stone-900">{formatCurrency(p.valorProposta)}</strong></span>
                              <span>Sinal (10%): <strong className="text-amber-800">{formatCurrency(p.valorSinal)}</strong></span>
                              <span>Margem: <strong className="text-emerald-700 font-bold">{formatCurrency(p.margemPrevista)}</strong></span>
                              <span className="font-black text-stone-800">({p.multiploSinal || '-'}x)</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => setViewingProposal(p)}
                              className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-lg text-xs transition"
                            >
                              Ver Proposta
                            </button>
                            <button
                              onClick={() => {
                                setEditingProposal(p);
                                setIsProposalFormOpen(true);
                              }}
                              className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold rounded-lg text-xs transition flex items-center gap-1"
                            >
                              <Edit className="w-3 h-3" />
                              <span>Editar</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: VISITAS */}
          {activeTab === 'visits' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-stone-900">Visitas Associadas ({leadVisits.length})</span>
                <button
                  onClick={handleBookVisit}
                  className="px-3 py-1.5 bg-stone-900 hover:bg-black text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Agendar Visita</span>
                </button>
              </div>

              {leadVisits.length === 0 ? (
                <div className="p-8 text-center text-stone-400 bg-[#FAF8F5] border border-stone-200">
                  Nenhuma visita registada ainda.
                </div>
              ) : (
                <div className="space-y-3">
                  {leadVisits.map(v => {
                    const st = getVisitStateBadge(v.estado);
                    const isRealizada = v.estado === 'Realizada';
                    return (
                      <div key={v.id} className="p-4 bg-white border border-stone-200 shadow-2xs space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-stone-900">{formatDatePT(v.data)} às {v.hora}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${st.bg} ${st.text} ${st.border}`}>
                              {v.estado}
                            </span>
                          </div>

                          <button
                            onClick={() => toggleVisitRealizada(v.id)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                              isRealizada
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                                : 'bg-stone-100 hover:bg-emerald-50 text-stone-700 hover:text-emerald-800 border border-stone-200'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>{isRealizada ? 'Concluída' : 'Marcar Feita'}</span>
                          </button>
                        </div>

                        <p className="text-[11px] text-stone-600">Responsável: <strong>{v.responsavel}</strong></p>
                        {v.notas && <p className="text-[11px] text-stone-600 italic bg-[#FAF8F5] p-2">{v.notas}</p>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PROPOSTAS & SINAL */}
          {activeTab === 'proposals' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-stone-900">Propostas de Compra ({leadProposals.length})</span>
                <button
                  onClick={handleCreateProposal}
                  className="px-3 py-1.5 bg-stone-900 hover:bg-black text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Criar Proposta</span>
                </button>
              </div>

              {leadProposals.length === 0 ? (
                <div className="p-8 text-center text-stone-400 bg-[#FAF8F5] border border-stone-200">
                  Nenhuma proposta registada para esta lead.
                </div>
              ) : (
                <div className="space-y-3">
                  {leadProposals.map(p => {
                    const st = getProposalStateBadge(p.estado);
                    return (
                      <div key={p.id} className="p-4 bg-white border border-stone-200 shadow-2xs space-y-3">
                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${st.bg} ${st.text} ${st.border}`}>
                            {p.estado}
                          </span>
                          <span className="text-stone-400 text-[10px]">Data: {formatDatePT(p.dataEnvio)}</span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-stone-100">
                          <div>
                            <span className="text-stone-400 text-[10px] block">Valor Proposta</span>
                            <span className="text-xs font-bold text-stone-900">{formatCurrency(p.valorProposta)}</span>
                          </div>
                          <div>
                            <span className="text-stone-400 text-[10px] block font-semibold">Valor Sinal (10%)</span>
                            <span className="text-xs font-bold text-amber-700">{formatCurrency(p.valorSinal)}</span>
                          </div>
                          <div>
                            <span className="text-stone-400 text-[10px] block">Margem Prevista</span>
                            <span className="text-xs font-bold text-emerald-600">{formatCurrency(p.margemPrevista)}</span>
                          </div>
                          <div>
                            <span className="text-stone-400 text-[10px] block font-semibold">Múltiplo do Sinal</span>
                            <span className="text-xs font-black text-emerald-700">{p.multiploSinal || '-'}x</span>
                          </div>
                        </div>

                        {p.notas && <p className="text-[11px] text-stone-600 bg-[#FAF8F5] p-2 rounded-lg italic">"{p.notas}"</p>}

                        <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                          <button
                            onClick={() => setViewingProposal(p)}
                            className="text-xs font-bold text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 px-3 py-1 rounded-lg transition"
                          >
                            Ver Detalhes da Proposta
                          </button>

                          <button
                            onClick={() => {
                              setEditingProposal(p);
                              setIsProposalFormOpen(true);
                            }}
                            className="text-xs font-bold text-amber-800 hover:text-amber-950 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1 rounded-lg transition flex items-center gap-1"
                          >
                            <Edit className="w-3 h-3" />
                            <span>Editar</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: HISTÓRICO & NOTAS */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              <form onSubmit={handleAddNoteSubmit} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-stone-900">Adicionar Nota (Autor: {currentUser})</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newNoteText}
                    onChange={e => setNewNoteText(e.target.value)}
                    placeholder="Escreva uma nota ou follow-up..."
                    className="flex-1 px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-stone-900 hover:bg-black text-white font-bold rounded-xl text-xs transition"
                  >
                    Adicionar
                  </button>
                </div>
              </form>

              <div className="space-y-2 pt-2">
                {(!lead.notas || lead.notas.length === 0) ? (
                  <p className="text-stone-400 text-center py-6 text-xs">Sem notas registadas.</p>
                ) : (
                  lead.notas.map(n => {
                    const noteTheme = getUserTheme(n.author);
                    return (
                      <div key={n.id} className="p-3 bg-white border border-stone-200 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${noteTheme.badgeBg} ${noteTheme.badgeText}`}>
                            {n.author}
                          </span>
                          <span className="text-[10px] text-stone-400">{formatDatePT(n.date)}</span>
                        </div>
                        <p className="text-stone-700">{n.text}</p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
