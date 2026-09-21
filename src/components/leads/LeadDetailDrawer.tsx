import React, { useState } from 'react';
import {
  X, Phone, PhoneCall, Mail, MapPin, Calendar, FileText, Plus, Edit, Trash2,
  CheckCircle2, AlertCircle, Calculator, Building, Tag, Send, Clock, RotateCcw
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { formatCurrency, formatDatePT, checkLeadReadiness, getContactStatusBadge, getPhotoStatusBadge, getPhaseBadge, getPriorityBadge, getVisitStateBadge, getProposalStateBadge } from '../../utils/formatters';

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
    addNoteToLead,
    openCallModal,
    visits,
    proposals
  } = useCRM();

  const [activeTab, setActiveTab] = useState<'info' | 'visits' | 'proposals' | 'notes'>('info');
  const [newNoteText, setNewNoteText] = useState('');

  if (!selectedLeadForDrawer) return null;

  const lead = selectedLeadForDrawer;
  const leadVisits = visits.filter(v => v.leadId === lead.id);
  const leadProposals = proposals.filter(p => p.leadId === lead.id);
  const readiness = checkLeadReadiness(lead);

  const contactBadge = getContactStatusBadge(lead.contacto);
  const photoBadge = getPhotoStatusBadge(lead.fotos);
  const phaseBadge = getPhaseBadge(lead.fase);
  const priorityBadge = getPriorityBadge(lead.prioridade);

  // Phase-dependent visibility rule
  const isInitialPhase = lead.fase === 'Nova lead' || lead.fase === 'Em análise';

  const handleAddNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    addNoteToLead(lead.id, newNoteText.trim(), 'Gestor Imobiliário');
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
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={() => setSelectedLeadForDrawer(null)}
      />

      {/* Drawer Container */}
      <div className="relative w-full max-w-2xl bg-white shadow-2xl h-full z-10 flex flex-col border-l border-slate-200">
        
        {/* Drawer Header */}
        <div className="bg-[#0B132B] px-6 py-5 text-white flex items-start justify-between shrink-0">
          <div className="space-y-1 pr-4">
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <h2 className="text-lg font-bold">{lead.nomeProprietario}</h2>
              <span className={`px-2 py-0.5 text-[10px] rounded-full uppercase tracking-wider font-semibold ${priorityBadge.bg}`}>
                {priorityBadge.text}
              </span>
              <span className={`px-2 py-0.5 text-[10px] rounded-md font-semibold border ${phaseBadge.bg} ${phaseBadge.text} ${phaseBadge.border}`}>
                {lead.fase}
              </span>
            </div>

            <div className="flex items-center space-x-3 text-xs text-slate-300">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                {lead.moradaZona}, {lead.concelho} ({lead.freguesia})
              </span>
              <span className="flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-blue-400" />
                {lead.tipoImovel} ({lead.areaM2} m²)
              </span>
            </div>
          </div>

          <button
            onClick={() => setSelectedLeadForDrawer(null)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Readiness Badges Bar */}
        <div className="bg-slate-50 px-6 py-2.5 border-b border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-3">
            {readiness.readyForVisit ? (
              <span className="flex items-center gap-1 text-emerald-700 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Pronta para Visita
              </span>
            ) : (
              <span className="flex items-center gap-1 text-slate-500">
                <AlertCircle className="w-4 h-4 text-slate-400" />
                Visita pendente de contacto/fotos
              </span>
            )}

            {readiness.readyForProposal ? (
              <span className="flex items-center gap-1 text-purple-700 font-medium">
                <CheckCircle2 className="w-4 h-4 text-purple-600" />
                Pronta para Proposta
              </span>
            ) : (
              <span className="flex items-center gap-1 text-slate-500">
                <AlertCircle className="w-4 h-4 text-slate-400" />
                Proposta pendente de fotos/mínimo
              </span>
            )}
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={handleEditLead}
              className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-200/60 rounded-md transition"
              title="Editar Lead"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => requestDeleteLead(lead.id)}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition"
              title="Eliminar Lead"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Action Button Ribbon with Registar Chamada */}
        <div className="px-6 py-3 bg-white border-b border-slate-200 flex items-center gap-2 overflow-x-auto shrink-0">
          <button
            onClick={() => openCallModal(lead.id)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition shrink-0"
            title="Registar notas de chamada"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>+ Registar Chamada</span>
          </button>

          <button
            onClick={handleBookVisit}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 shadow-xs transition shrink-0"
          >
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <span>+ Marcar Visita</span>
          </button>

          <button
            onClick={handleCreateProposal}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-xs transition shrink-0"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>+ Criar Proposta</span>
          </button>
        </div>

        {/* Tabs Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 shrink-0 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('info')}
            className={`py-3 px-4 border-b-2 transition ${
              activeTab === 'info'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Ficha Geral
          </button>
          <button
            onClick={() => setActiveTab('visits')}
            className={`py-3 px-4 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'visits'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Visitas</span>
            <span className="bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded-full text-[10px]">
              {leadVisits.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('proposals')}
            className={`py-3 px-4 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'proposals'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Propostas</span>
            <span className="bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded-full text-[10px]">
              {leadProposals.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`py-3 px-4 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'notes'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Histórico de Notas & Chamadas ({lead.notas?.length || 0})</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-800">

          {/* TAB 1: FICHA GERAL */}
          {activeTab === 'info' && (
            <div className="space-y-6">

              {/* Financial Box (Clean layout with 'Mínimo pedido' for initial phases) */}
              <div className="bg-gradient-to-r from-slate-900 to-[#0B132B] text-white p-4 rounded-xl shadow-md space-y-3">
                {isInitialPhase ? (
                  /* Initial Phase: Show ONLY 'Mínimo pedido' and value */
                  <div className="flex items-center justify-between py-1">
                    <span className="text-xs text-slate-300 font-medium">Mínimo pedido:</span>
                    <span className="text-lg font-extrabold text-amber-400">{formatCurrency(lead.valorMinimoAbsoluto)}</span>
                  </div>
                ) : (
                  /* Advanced Phases: Show full Mínimo, Preço Pedido, Avaliação, and Margem Potencial */
                  <>
                    <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                      <span className="text-xs text-slate-300 font-medium">Mínimo pedido:</span>
                      <span className="text-lg font-extrabold text-amber-400">{formatCurrency(lead.valorMinimoAbsoluto)}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center pt-1">
                      <div>
                        <span className="block text-[10px] text-slate-400">Preço Pedido</span>
                        <span className="text-xs font-bold text-white">{formatCurrency(lead.precoPedido)}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-400">Avaliação Revenda</span>
                        <span className="text-xs font-bold text-white">{formatCurrency(lead.valorEstimadoAvaliacao)}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-400">Margem Potencial</span>
                        <span className="text-xs font-bold text-emerald-400">{formatCurrency(lead.margemPotencial)}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Qualification Answers */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider text-slate-500">
                  Respostas às Perguntas Obrigatórias de Qualificação
                </h4>

                <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-2">
                  <div>
                    <span className="font-bold text-slate-700">P1. Situação atual do imóvel / terreno:</span>
                    <p className="text-slate-800 mt-0.5 bg-white p-2 rounded border border-slate-200">
                      {lead.situacaoAtual || 'Sem informação registada.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <span className="font-bold text-slate-700">P2. Prazo pretendido para fechar:</span>
                      <p className="text-slate-800 font-semibold">{lead.prazoPretendido}</p>
                    </div>
                    <div>
                      <span className="font-bold text-slate-700">P6. Flexibilidade de Negociação:</span>
                      <p className={`font-bold ${lead.flexibilidade === 'Sim' ? 'text-emerald-600' : 'text-red-600'}`}>
                        {lead.flexibilidade}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lead Metadata */}
              <div className="grid grid-cols-2 gap-4 bg-white p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">Estado de Contacto</span>
                  <div className="mt-1">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${contactBadge.bg} ${contactBadge.text} ${contactBadge.border}`}>
                      {lead.contacto}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">Estado de Fotos</span>
                  <div className="mt-1">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${photoBadge.bg} ${photoBadge.text} ${photoBadge.border}`}>
                      {lead.fotos}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">Origem da Lead</span>
                  <p className="font-semibold text-slate-800">{lead.origem}</p>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">Data de Entrada</span>
                  <p className="font-semibold text-slate-800">{formatDatePT(lead.dataEntrada)}</p>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: VISITAS */}
          {activeTab === 'visits' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 text-xs">Visitas Agendadas para esta Lead</h4>
                <button
                  onClick={handleBookVisit}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                >
                  + Nova Visita
                </button>
              </div>

              {leadVisits.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-xl border border-slate-200 text-slate-500">
                  <Calendar className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs font-medium">Nenhuma visita agendada ainda.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {leadVisits.map(v => {
                    const stBadge = getVisitStateBadge(v.estado);
                    return (
                      <div key={v.id} className="p-3.5 bg-white rounded-lg border border-slate-200 shadow-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-blue-600" />
                            {formatDatePT(v.data)} às {v.hora}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${stBadge.bg} ${stBadge.text} ${stBadge.border}`}>
                            {v.estado}
                          </span>
                        </div>
                        <p className="text-slate-600 text-[11px]"><strong>Responsável:</strong> {v.responsavel}</p>
                        {v.notas && <p className="text-slate-600 italic bg-slate-50 p-2 rounded text-[11px]">{v.notas}</p>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PROPOSTAS */}
          {activeTab === 'proposals' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 text-xs">Propostas de Compra Enviadas</h4>
                <button
                  onClick={handleCreateProposal}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                >
                  + Nova Proposta
                </button>
              </div>

              {leadProposals.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-xl border border-slate-200 text-slate-500">
                  <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs font-medium">Nenhuma proposta enviada para esta lead.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {leadProposals.map(p => {
                    const stBadge = getProposalStateBadge(p.estado);
                    return (
                      <div key={p.id} className="p-4 bg-white rounded-lg border border-slate-200 shadow-xs space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <div>
                            <span className="text-[10px] text-slate-400 block">Nossa Proposta</span>
                            <span className="text-base font-extrabold text-blue-600">{formatCurrency(p.valorProposta)}</span>
                          </div>
                          <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${stBadge.bg} ${stBadge.text} ${stBadge.border}`}>
                            {p.estado}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: HISTÓRICO DE NOTAS & CHAMADAS */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              
              {/* Top Action Bar */}
              <div className="flex items-center justify-between gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-800">Registo de Histórico</span>
                <button
                  onClick={() => openCallModal(lead.id)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs shadow-xs transition flex items-center gap-1.5"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>+ Registar Chamada</span>
                </button>
              </div>

              <form onSubmit={handleAddNoteSubmit} className="space-y-2 pt-1">
                <label className="block font-semibold text-slate-700">Adicionar Nota Geral (Sem chamada)</label>
                <textarea
                  rows={2}
                  value={newNoteText}
                  onChange={e => setNewNoteText(e.target.value)}
                  placeholder="Escreva uma observação ou comentário geral..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-semibold text-xs transition flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Adicionar Nota Geral</span>
                </button>
              </form>

              {/* Timeline of Notes & Calls */}
              <div className="space-y-3 pt-2">
                {(!lead.notas || lead.notas.length === 0) ? (
                  <p className="text-slate-400 text-xs italic text-center py-6">Sem notas ou chamadas registadas.</p>
                ) : (
                  lead.notas.map(note => {
                    const isCall = note.type === 'call';

                    return (
                      <div
                        key={note.id}
                        className={`p-3.5 rounded-xl border text-xs space-y-2 transition ${
                          isCall
                            ? 'bg-blue-50/60 border-blue-200'
                            : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        {/* Entry Header */}
                        <div className="flex items-center justify-between text-[11px] border-b border-slate-200/80 pb-2">
                          <div className="flex items-center space-x-2">
                            {isCall ? (
                              <span className="flex items-center gap-1 font-bold text-blue-700">
                                <PhoneCall className="w-3.5 h-3.5 text-blue-600" />
                                Chamada Telefónica
                              </span>
                            ) : (
                              <span className="font-bold text-slate-700">Nota Geral</span>
                            )}
                            <span className="text-slate-400">•</span>
                            <span className="text-slate-600 font-semibold">{note.author}</span>
                          </div>

                          <span className="text-slate-500 font-medium">
                            {new Date(note.date).toLocaleString('pt-PT')}
                          </span>
                        </div>

                        {/* Call Result Badge if Call */}
                        {isCall && note.callResult && (
                          <div className="flex items-center space-x-2 pt-0.5">
                            <span className="text-[10px] text-slate-500 font-semibold">Resultado:</span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                note.callResult === 'Contactado'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  : note.callResult === 'Sem resposta'
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                  : 'bg-purple-100 text-purple-800 border border-purple-200'
                              }`}
                            >
                              {note.callResult}
                            </span>

                            {note.nextContactDate && (
                              <span className="text-[10px] text-purple-700 font-medium ml-auto">
                                Próximo Contacto: {formatDatePT(note.nextContactDate)}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Text */}
                        <p className="text-slate-800 font-normal leading-relaxed whitespace-pre-wrap">
                          {note.text}
                        </p>
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
