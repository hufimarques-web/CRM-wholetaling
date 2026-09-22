import React, { useState, useEffect } from 'react';
import {
  X, Phone, PhoneCall, MapPin, Calendar, FileText, Plus, Edit, Trash2,
  CheckCircle2, AlertCircle, Calculator, Building, Tag, Send, Clock, Sparkles, User, Check, ArrowRight, ShieldCheck,
  Archive, RotateCcw, Mail, TrendingUp, Percent, Save, RefreshCw, Sliders
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

  // Property Evaluation State (A partir dessa ficha o imóvel tem de ser avaliado)
  const [evalRevenda, setEvalRevenda] = useState<string>('');
  const [evalObras, setEvalObras] = useState<string>('0');
  const [evalCustos, setEvalCustos] = useState<string>('3000');
  const [evalMargemAlvo, setEvalMargemAlvo] = useState<string>('20000');
  const [evalSavedSuccess, setEvalSavedSuccess] = useState(false);
  const [lastEvalLeadId, setLastEvalLeadId] = useState<string | null>(null);

  // Sync evaluation defaults when lead changes
  useEffect(() => {
    if (selectedLeadForDrawer && selectedLeadForDrawer.id !== lastEvalLeadId) {
      const l = selectedLeadForDrawer;
      const benchmarkRevenda = l.areaM2 && l.mediaFreguesiaM2
        ? Math.round(l.areaM2 * l.mediaFreguesiaM2)
        : Math.round(l.valorMinimoAbsoluto * 1.35);

      const defaultRevenda = (l.valorMinimoAbsoluto + (l.margemPotencial || 0)) > l.valorMinimoAbsoluto
        ? (l.valorMinimoAbsoluto + (l.margemPotencial || 0))
        : benchmarkRevenda;

      const defaultObras = l.estadoImovel === 'Ruína total' ? '30000'
        : l.estadoImovel === 'A necessitar de obras profundas' ? '18000'
        : l.estadoImovel === 'Habitável a precisar de modernização' ? '7500'
        : '0';

      const defaultCustos = String(Math.round(defaultRevenda * 0.04) || 3000);
      const defaultMargem = String(l.margemPotencial && l.margemPotencial > 0 ? l.margemPotencial : Math.max(15000, Math.round(defaultRevenda * 0.15)));

      setEvalRevenda(String(defaultRevenda));
      setEvalObras(defaultObras);
      setEvalCustos(defaultCustos);
      setEvalMargemAlvo(defaultMargem);
      setLastEvalLeadId(l.id);
      setEvalSavedSuccess(false);
    }
  }, [selectedLeadForDrawer, lastEvalLeadId]);

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

  // Live Evaluation Calculations (A partir dessa ficha o imóvel pode ser avaliado)
  const numRevenda = Number(evalRevenda) || 0;
  const numObras = Number(evalObras) || 0;
  const numCustos = Number(evalCustos) || 0;
  const numMargemAlvo = Number(evalMargemAlvo) || 0;

  // Maximum Allowable Offer (Teto Máximo de Compra Seguro)
  const evalTetoCompra = Math.max(0, numRevenda - numObras - numCustos - numMargemAlvo);
  // Sinal CPCV (10% padrão sobre o teto de compra)
  const evalSinal10 = Math.round(evalTetoCompra * 0.10);
  // Diferença vs Pedido do Proprietário
  const deltaVsPedido = evalTetoCompra - (lead?.valorMinimoAbsoluto || 0);
  // Rentabilidade s/ Sinal
  const evalRoi = evalSinal10 > 0 ? Math.round((numMargemAlvo / evalSinal10) * 100) : 0;
  const evalMultiplo = evalSinal10 > 0 ? (numMargemAlvo / evalSinal10).toFixed(1) : '0';
  const evalSpread = numRevenda > 0 ? ((numMargemAlvo / numRevenda) * 100).toFixed(1) : '0';

  const handleSaveEvaluation = () => {
    if (!lead) return;
    const updated: Lead = {
      ...lead,
      margemPotencial: numMargemAlvo
    };
    updateLead(updated);
    setSelectedLeadForDrawer(updated);
    setEvalSavedSuccess(true);
    setTimeout(() => setEvalSavedSuccess(false), 3500);
  };

  const handleGenerateProposalFromEval = () => {
    if (!lead) return;
    setPrefilledProposalData({
      leadId: lead.id,
      valorProposta: evalTetoCompra > 0 ? evalTetoCompra : lead.valorMinimoAbsoluto,
      valorSinal: evalSinal10 > 0 ? evalSinal10 : Math.round(lead.valorMinimoAbsoluto * 0.1),
      valorRevenda: numRevenda,
      notas: `Avaliação efetuada na ficha da lead: Revenda estimada ${formatCurrency(numRevenda)}, Obras ${formatCurrency(numObras)}, Custos/Reserva ${formatCurrency(numCustos)}, Margem Alvo ${formatCurrency(numMargemAlvo)}.`
    });
    setIsProposalFormOpen(true);
  };

  const handleResetToAveiroBenchmark = () => {
    if (!lead) return;
    const bm = lead.areaM2 && lead.mediaFreguesiaM2
      ? Math.round(lead.areaM2 * lead.mediaFreguesiaM2)
      : Math.round(lead.valorMinimoAbsoluto * 1.35);
    setEvalRevenda(String(bm));
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
          
          {/* TAB 1: FICHA GERAL COMPLETA & AVALIAÇÃO DE IMÓVEL */}
          {activeTab === 'info' && (
            <div className="space-y-6">
              
              {/* SECTION: MOTOR INTERATIVO DE AVALIAÇÃO DO IMÓVEL (A partir dessa ficha o imóvel pode ser avaliado) */}
              <div className="bg-[#141519] text-white p-5 rounded-2xl border border-stone-800 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-800 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
                      <Calculator className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-xs text-white uppercase tracking-wider flex items-center gap-1.5 font-display">
                        <span>Avaliador & Simulador de Arbitragem</span>
                        <span className="px-2 py-0.2 rounded-full text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30 normal-case font-bold">
                          Avaliação Direta
                        </span>
                      </h3>
                      <p className="text-[11px] text-stone-400">
                        Simulação de teto de compra, capital de sinal CPCV (10%) e retorno financeiro
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleResetToAveiroBenchmark}
                    className="text-[11px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 self-start sm:self-auto transition"
                    title="Recalcular revenda estimada com base no €/m² médio desta freguesia"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Média da Freguesia ({lead.mediaFreguesiaM2 || 1500} €/m²)</span>
                  </button>
                </div>

                {/* 4 Interactive Evaluation Inputs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-stone-400 block mb-1">
                      Revenda Estimada (€)
                    </label>
                    <input
                      type="number"
                      value={evalRevenda}
                      onChange={e => setEvalRevenda(e.target.value)}
                      placeholder="Ex: 180000"
                      className="w-full px-3 py-2 bg-[#1C1E24] border border-stone-700 rounded-xl text-white font-bold text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <span className="text-[9px] text-stone-500 block mt-0.5">Preço final de saída</span>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase text-stone-400 block mb-1">
                      Obras / Limpeza (€)
                    </label>
                    <input
                      type="number"
                      value={evalObras}
                      onChange={e => setEvalObras(e.target.value)}
                      placeholder="Ex: 0 ou 15000"
                      className="w-full px-3 py-2 bg-[#1C1E24] border border-stone-700 rounded-xl text-white font-bold text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <span className="text-[9px] text-stone-500 block mt-0.5">0€ se for wholetailing</span>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase text-stone-400 block mb-1">
                      Reserva & Custos (€)
                    </label>
                    <input
                      type="number"
                      value={evalCustos}
                      onChange={e => setEvalCustos(e.target.value)}
                      placeholder="Ex: 3000"
                      className="w-full px-3 py-2 bg-[#1C1E24] border border-stone-700 rounded-xl text-white font-bold text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <span className="text-[9px] text-stone-500 block mt-0.5">CPCV, registos e folga</span>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase text-emerald-400 block mb-1">
                      Margem Alvo (€)
                    </label>
                    <input
                      type="number"
                      value={evalMargemAlvo}
                      onChange={e => setEvalMargemAlvo(e.target.value)}
                      placeholder="Ex: 25000"
                      className="w-full px-3 py-2 bg-[#1C1E24] border border-emerald-600/50 rounded-xl text-emerald-400 font-black text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <span className="text-[9px] text-emerald-500/80 block mt-0.5">Lucro pretendido</span>
                  </div>
                </div>

                {/* Live Real-time Evaluation Results */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                  <div className="bg-[#191A20] p-3 rounded-xl border border-stone-800">
                    <span className="text-[10px] font-bold uppercase text-stone-400 block">
                      Teto Máximo Compra (MAO)
                    </span>
                    <span className="text-base font-black text-white mt-0.5 block font-display">
                      {formatCurrency(evalTetoCompra)}
                    </span>
                    <span className={`text-[10px] font-bold block mt-0.5 ${
                      deltaVsPedido >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {deltaVsPedido >= 0
                        ? `+${formatCurrency(deltaVsPedido)} acima do mín.`
                        : `Negociar -${formatCurrency(Math.abs(deltaVsPedido))}`}
                    </span>
                  </div>

                  <div className="bg-[#191A20] p-3 rounded-xl border border-amber-500/30">
                    <span className="text-[10px] font-bold uppercase text-amber-400 block">
                      Sinal CPCV (10%)
                    </span>
                    <span className="text-base font-black text-amber-300 mt-0.5 block font-display">
                      {formatCurrency(evalSinal10)}
                    </span>
                    <span className="text-[10px] text-stone-400 block mt-0.5">
                      Capital a desembolsar
                    </span>
                  </div>

                  <div className="bg-[#191A20] p-3 rounded-xl border border-emerald-500/30">
                    <span className="text-[10px] font-bold uppercase text-emerald-400 block">
                      Retorno Final (+€)
                    </span>
                    <span className="text-base font-black text-emerald-400 mt-0.5 block font-display">
                      +{formatCurrency(numMargemAlvo)}
                    </span>
                    <span className="text-[10px] text-emerald-300/80 block mt-0.5">
                      Spread: {evalSpread}%
                    </span>
                  </div>

                  <div className="bg-[#191A20] p-3 rounded-xl border border-stone-700">
                    <span className="text-[10px] font-bold uppercase text-stone-300 block">
                      Rentabilidade / Múltiplo
                    </span>
                    <span className="text-base font-black text-amber-400 mt-0.5 block font-display">
                      +{evalRoi}% <span className="text-xs text-white">({evalMultiplo}x)</span>
                    </span>
                    <span className="text-[10px] text-stone-400 block mt-0.5">
                      ROI sobre o sinal pago
                    </span>
                  </div>
                </div>

                {/* Direct Evaluation Actions */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2 border-t border-stone-800">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSaveEvaluation}
                      className="px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white rounded-xl text-xs font-bold border border-stone-700 transition flex items-center gap-1.5"
                    >
                      <Save className="w-3.5 h-3.5 text-amber-400" />
                      <span>Guardar Avaliação na Lead</span>
                    </button>
                    {evalSavedSuccess && (
                      <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1 animate-fade-in">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Margem guardada!</span>
                      </span>
                    )}
                  </div>

                  <button
                    onClick={handleGenerateProposalFromEval}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-black shadow-xs transition flex items-center justify-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Gerar Proposta Formal a partir da Avaliação &rarr;</span>
                  </button>
                </div>
              </div>

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
