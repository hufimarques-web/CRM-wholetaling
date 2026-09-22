import React, { useState } from 'react';
import { Plus, FileText, CheckCircle2, TrendingUp, Clock, Filter, Trash2, Edit, ShieldCheck, ArrowRight } from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { ProposalState, Proposal } from '../types/crm';
import { formatCurrency, formatDatePT, getProposalStateBadge, getUserTheme } from '../utils/formatters';

export const ProposalsView: React.FC = () => {
  const {
    proposals,
    setIsProposalFormOpen,
    setEditingProposal,
    setViewingProposal,
    setPreselectedProposalLeadId,
    deleteProposal,
    acceptProposal,
    setActiveTab,
    leads
  } = useCRM();

  const [estadoFilter, setEstadoFilter] = useState<'Todas' | 'Enviada' | 'Em negociação' | 'Recusada' | 'Expirada'>('Todas');

  // CRITICAL REQUIREMENT: Proposals with state 'Aceite' leave this tab and are managed in Operações & CPCV!
  const activeProposals = proposals.filter(p => p.estado !== 'Aceite');
  const aceitesCount = proposals.filter(p => p.estado === 'Aceite').length;

  const filteredProposals = activeProposals.filter(p => {
    if (estadoFilter !== 'Todas' && p.estado !== estadoFilter) return false;
    return true;
  });

  // KPI Metrics for Active Proposals
  const totalCount = activeProposals.length;
  const totalMargemPrevista = activeProposals.reduce((acc, curr) => acc + (curr.margemPrevista || 0), 0);
  const totalSinais = activeProposals.reduce((acc, curr) => acc + (curr.valorSinal || 0), 0);
  const mediaMultiplo = totalSinais > 0 ? (totalMargemPrevista / totalSinais).toFixed(1) : '0';

  const handleAcceptProposal = (proposalId: string) => {
    acceptProposal(proposalId);
    // Proposal immediately transitions to Operações & CPCV
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-[#16171B] text-white p-6 rounded-2xl shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-stone-800">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-white">Propostas & Múltiplos de Sinal</h2>
          <p className="text-xs text-stone-400 mt-1">
            Controlo de propostas ativas em negociação. Ao serem aceites, transitam diretamente para a aba Operações & CPCV.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingProposal(null);
            setPreselectedProposalLeadId(null);
            setIsProposalFormOpen(true);
          }}
          className="flex items-center space-x-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Proposta</span>
        </button>
      </div>

      {/* Info Banner: Accepted Proposals Transition to Operations */}
      <div className="bg-amber-50/90 border border-amber-200/90 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-2xs">
        <div className="flex items-center gap-2.5 text-amber-950">
          <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800 shrink-0">
            <ShieldCheck className="w-4.5 h-4.5" />
          </div>
          <div>
            <span className="font-bold text-stone-900 block text-xs">
              Transição Automática de Propostas Aceites
            </span>
            <span className="text-stone-600 text-[11px]">
              Quando uma proposta é aceite, sai desta lista e passa para a aba <strong>Operações & CPCV</strong> para validação jurídica e assinatura.
            </span>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('operations')}
          className="px-3.5 py-1.5 bg-stone-900 hover:bg-black text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 shadow-2xs"
        >
          <span>Ver Operações ({aceitesCount})</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">Propostas Ativas</span>
          <span className="text-2xl font-black text-stone-900 mt-1 block">{totalCount}</span>
          <span className="text-[10px] text-stone-500 font-medium">{aceitesCount} já em Operações</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">Margem Ativa Prevista</span>
          <span className="text-xl font-black text-emerald-600 mt-1 block">{formatCurrency(totalMargemPrevista)}</span>
          <span className="text-[10px] text-stone-500 font-medium">Propostas em negociação</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">Sinais Totais (10%)</span>
          <span className="text-xl font-black text-amber-800 mt-1 block">{formatCurrency(totalSinais)}</span>
          <span className="text-[10px] text-stone-500 font-medium">Capital de sinal previsto</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">Múltiplo Médio</span>
          <span className="text-2xl font-black text-emerald-700 mt-1 block">{mediaMultiplo}x</span>
          <span className="text-[10px] text-stone-500 font-medium">Rácio Margem / Sinal</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-2xs flex items-center justify-between text-xs">
        <div className="flex items-center space-x-3">
          <span className="font-bold text-stone-700 flex items-center gap-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-amber-600" />
            Estado:
          </span>

          <select
            value={estadoFilter}
            onChange={e => setEstadoFilter(e.target.value as any)}
            className="px-3 py-1.5 bg-[#FAF8F5] border border-stone-200 rounded-xl text-xs font-semibold focus:outline-none"
          >
            <option value="Todas">Todas as Propostas Ativas</option>
            <option value="Enviada">Enviadas</option>
            <option value="Em negociação">Em Negociação</option>
            <option value="Recusada">Recusadas</option>
            <option value="Expirada">Expiradas</option>
          </select>
        </div>
      </div>

      {/* Proposals List Grid */}
      {filteredProposals.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-stone-200 text-stone-400 text-xs">
          {totalCount === 0
            ? 'Não existem propostas pendentes. As propostas aceites encontram-se em Operações & CPCV.'
            : 'Nenhuma proposta encontrada com o filtro selecionado.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredProposals.map(p => {
            const stBadge = getProposalStateBadge(p.estado);
            const userTheme = getUserTheme(p.assignedUser || 'Queirós');
            const lead = leads.find(l => l.id === p.leadId);

            return (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-stone-200 shadow-2xs hover:shadow-md transition p-5 space-y-4"
              >
                
                {/* Proposal Card Header */}
                <div className="flex items-start justify-between border-b border-stone-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-stone-900 text-base">{p.nomeProprietario}</h3>
                      <span className={`w-5 h-5 rounded-md text-[10px] font-black inline-flex items-center justify-center ${userTheme.avatarBg} shadow-2xs`} title={`Responsável: ${userTheme.name}`}>
                        {userTheme.initial}
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 mt-0.5">{p.moradaConcelhoFreguesia}</p>
                  </div>

                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${stBadge.bg} ${stBadge.text} ${stBadge.border}`}>
                    {p.estado}
                  </span>
                </div>

                {/* Financial Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#FAF8F5] p-3.5 rounded-xl border border-stone-100 text-xs">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-stone-400 block">Mínimo Aceitável</span>
                    <span className="font-bold text-stone-700">{formatCurrency(p.valorMinimoAbsoluto)}</span>
                  </div>

                  <div>
                    <span className="text-[9px] uppercase font-bold text-stone-400 block">Proposta</span>
                    <span className="font-black text-stone-900">{formatCurrency(p.valorProposta)}</span>
                  </div>

                  <div>
                    <span className="text-[9px] uppercase font-bold text-amber-700 block">Sinal (10%)</span>
                    <span className="font-extrabold text-amber-900">{formatCurrency(p.valorSinal)}</span>
                  </div>

                  <div>
                    <span className="text-[9px] uppercase font-bold text-stone-400 block">Revenda Estimada</span>
                    <span className="font-bold text-stone-700">{formatCurrency(p.valorRevenda)}</span>
                  </div>
                </div>

                {/* Metrics Highlight: Margem & Múltiplo */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#F4EFE6]/60 border border-[#E8E2D6] text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-stone-500 block">Margem Prevista</span>
                    <span className="text-base font-black text-emerald-700">
                      {formatCurrency(p.margemPrevista)}
                    </span>
                    <span className="text-[10px] text-stone-500 block font-medium">
                      Spread de {p.spread}%
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-stone-500 block">Múltiplo do Sinal</span>
                    <span className="text-lg font-black text-emerald-800 bg-white px-2.5 py-1 rounded-lg border border-stone-200 shadow-2xs inline-block">
                      {p.multiploSinal || '-'}x
                    </span>
                    <span className="text-[9px] text-stone-500 block font-semibold mt-0.5">
                      Lucro / Investimento
                    </span>
                  </div>
                </div>

                {/* Dates & Follow-up */}
                <div className="flex items-center justify-between text-[11px] text-stone-500">
                  <span>Enviada a: <strong>{formatDatePT(p.dataEnvio)}</strong></span>
                  {p.proximoFollowUp && (
                    <span className="text-amber-800 font-semibold">
                      Follow-up: {formatDatePT(p.proximoFollowUp)}
                    </span>
                  )}
                </div>

                {/* Notes if any */}
                {p.notas && (
                  <p className="text-xs text-stone-600 bg-[#FAF8F5] p-2.5 rounded-xl border border-stone-200/80 italic">
                    "{p.notas}"
                  </p>
                )}

                {/* Proposal Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setViewingProposal(p)}
                      className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold transition flex items-center gap-1"
                      title="Ver Proposta Completa"
                    >
                      <span>Ver Proposta</span>
                    </button>

                    <button
                      onClick={() => handleAcceptProposal(p.id)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-2xs"
                      title="Aceitar Proposta e transitar para Operações & CPCV"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Aceite</span>
                    </button>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => {
                        setEditingProposal(p);
                        setIsProposalFormOpen(true);
                      }}
                      className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition"
                      title="Editar Proposta (100% editável)"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteProposal(p.id)}
                      className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Eliminar Proposta"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
