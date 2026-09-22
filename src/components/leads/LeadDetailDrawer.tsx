import React, { useState } from 'react';
import {
  X, Phone, PhoneCall, MapPin, Calendar, FileText, Plus, Edit, Trash2,
  CheckCircle2, AlertCircle, Calculator, Building, Tag, Send, Clock, Sparkles, User, Check, ArrowRight, ShieldCheck,
  Archive, RotateCcw
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { formatCurrency, formatDatePT, checkLeadReadiness, getContactStatusBadge, getPhotoStatusBadge, getPhaseBadge, getPriorityBadge, getVisitStateBadge, getProposalStateBadge, getUserTheme } from '../../utils/formatters';

export const LeadDetailDrawer: React.FC = () => {
  const {
    selectedLeadForDrawer,
    setSelectedLeadForDrawer,
    setEditingLead,
    setIsLeadFormOpen,
    setPreselectedVisitLeadId,
    setIsVisitFormOpen,
    setPreselectedProposalLeadId,
    setIsProposalFormOpen,
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
          
          {/* TAB 1: FICHA GERAL & ESTUDO DE MERCADO AVEIRO */}
          {activeTab === 'info' && (
            <div className="space-y-6">
              
              {/* Automated Aveiro Market Study Box */}
              <div className="bg-[#FAF8F5] p-4 border border-stone-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    Estudo de Mercado Automático ({lead.freguesia})
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

              {/* Financial Box */}
              <div className="bg-white p-4 border border-stone-200 shadow-2xs space-y-3">
                <h3 className="font-bold text-xs text-stone-900 uppercase tracking-wider flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-stone-600" />
                  Valor Mínimo & Margem Projetada
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-stone-500 block text-[11px]">Valor Mínimo Aceitável</span>
                    <span className="text-lg font-black text-stone-900">{formatCurrency(lead.valorMinimoAbsoluto)}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block text-[11px]">Margem Bruta Estimada</span>
                    <span className="text-lg font-black text-emerald-600">{formatCurrency(lead.margemPotencial)}</span>
                  </div>
                </div>
              </div>

              {/* General Property & Contact Data */}
              <div className="bg-white p-4 border border-stone-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-xs text-stone-900 uppercase tracking-wider">
                    Detalhes do Imóvel & Proprietário
                  </h3>
                  <button
                    onClick={handleEditLead}
                    className="text-stone-600 hover:text-stone-900 font-semibold text-[11px] underline flex items-center gap-1"
                  >
                    <Edit className="w-3 h-3" />
                    <span>Editar Tudo</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-stone-400 block text-[10px] font-semibold">Proprietário</span>
                    <span className="font-bold text-stone-900">{lead.nomeProprietario}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px] font-semibold">Contacto Telefónico</span>
                    <a href={`tel:${lead.telefone}`} className="font-bold text-amber-700 hover:underline">
                      {lead.telefone}
                    </a>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px] font-semibold">Freguesia (Aveiro)</span>
                    <span className="font-bold text-stone-900">{lead.freguesia}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px] font-semibold">Área & Tipo</span>
                    <span className="text-stone-800">{lead.areaM2} m² ({lead.tipoImovel})</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px] font-semibold">Estado do Imóvel</span>
                    <span className="font-bold text-amber-800">{lead.estadoImovel}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px] font-semibold">Prazo Pretendido</span>
                    <span className="font-bold text-stone-800">{lead.prazoPretendido}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px] font-semibold">Flexibilidade</span>
                    <span className="font-semibold text-stone-800">{lead.flexibilidade}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px] font-semibold">Responsável</span>
                    <span className="font-bold text-stone-800">{lead.assignedTo}</span>
                  </div>
                </div>
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

                        {p.notas && <p className="text-[11px] text-stone-600 bg-[#FAF8F5] p-2">{p.notas}</p>}
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
