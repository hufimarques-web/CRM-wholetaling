import React, { useState } from 'react';
import { Plus, FileText, CheckCircle2, AlertCircle, Calculator, TrendingUp, Clock, Filter, Trash2, Edit } from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { ProposalState, Proposal } from '../types/crm';
import { formatCurrency, formatDatePT, getProposalStateBadge } from '../utils/formatters';

export const ProposalsView: React.FC = () => {
  const {
    proposals,
    setIsProposalFormOpen,
    setEditingProposal,
    setPreselectedProposalLeadId,
    deleteProposal,
    acceptProposal,
    leads
  } = useCRM();

  const [estadoFilter, setEstadoFilter] = useState<ProposalState | 'Todas'>('Todas');

  const filteredProposals = proposals.filter(p => {
    if (estadoFilter !== 'Todas' && p.estado !== estadoFilter) return false;
    return true;
  });

  // KPI Metrics
  const totalCount = proposals.length;
  const aceitesCount = proposals.filter(p => p.estado === 'Aceite').length;
  const emNegociacaoCount = proposals.filter(p => p.estado === 'Em negociação' || p.estado === 'Enviada').length;
  const recusadasCount = proposals.filter(p => p.estado === 'Recusada').length;

  const totalMargemPrevista = proposals.reduce((acc, curr) => acc + (curr.margemPrevista || 0), 0);
  const mediaSpread = proposals.length > 0
    ? (proposals.reduce((acc, curr) => acc + (curr.spread || 0), 0) / proposals.length).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-[#0B132B] text-white p-6 rounded-2xl shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Gestão de Propostas de Compra Enviadas</h2>
          <p className="text-xs text-slate-300 mt-1">
            Acompanhamento de propostas, spreads de arbitragem e aprovação para assinatura de CPCV.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingProposal(null);
            setPreselectedProposalLeadId(null);
            setIsProposalFormOpen(true);
          }}
          className="flex items-center space-x-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-sm transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Proposta</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 block">Total Propostas</span>
          <span className="text-2xl font-extrabold text-slate-900 mt-0.5 block">{totalCount}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 block">Propostas Aceites</span>
          <span className="text-2xl font-extrabold text-emerald-600 mt-0.5 block">{aceitesCount}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 block">Margem Bruta Total Prevista</span>
          <span className="text-lg font-extrabold text-emerald-700 mt-0.5 block">{formatCurrency(totalMargemPrevista)}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 block">Spread Médio Previsto</span>
          <span className="text-2xl font-extrabold text-purple-600 mt-0.5 block">{mediaSpread}%</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between text-xs">
        <div className="flex items-center space-x-3">
          <div className="flex items-center gap-1.5 font-bold text-slate-700">
            <Filter className="w-3.5 h-3.5 text-blue-600" />
            <span>Filtrar Estado:</span>
          </div>

          <select
            value={estadoFilter}
            onChange={e => setEstadoFilter(e.target.value as any)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none"
          >
            <option value="Todas">Todas as Propostas</option>
            <option value="Enviada">Enviadas</option>
            <option value="Em negociação">Em Negociação</option>
            <option value="Aceite">Aceites</option>
            <option value="Recusada">Recusadas</option>
            <option value="Expirada">Expiradas</option>
          </select>
        </div>
      </div>

      {/* Proposals List Grid */}
      {filteredProposals.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400 text-xs">
          Nenhuma proposta encontrada com o filtro selecionado.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProposals.map(p => {
            const stBadge = getProposalStateBadge(p.estado);
            const lead = leads.find(l => l.id === p.leadId);

            return (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition p-5 space-y-4"
              >
                
                {/* Proposal Card Header */}
                <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">{p.nomeProprietario}</h3>
                    <p className="text-xs text-slate-500">{p.moradaConcelhoFreguesia}</p>
                  </div>

                  <span className={`px-3 py-1 rounded-md text-xs font-bold border ${stBadge.bg} ${stBadge.text} ${stBadge.border}`}>
                    {p.estado}
                  </span>
                </div>

                {/* Financial Values Grid */}
                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-medium">Nossa Proposta</span>
                    <span className="text-lg font-extrabold text-blue-600">{formatCurrency(p.valorProposta)}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-medium">Estimativa de Revenda</span>
                    <span className="text-lg font-extrabold text-slate-900">{formatCurrency(p.valorRevenda)}</span>
                  </div>

                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-[10px] text-slate-500 block uppercase font-medium">Margem Bruta Estimada</span>
                    <span className="text-sm font-extrabold text-emerald-600">{formatCurrency(p.margemPrevista)}</span>
                  </div>

                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-[10px] text-slate-500 block uppercase font-medium">Spread % (Margem/Revenda)</span>
                    <span className="text-sm font-extrabold text-purple-600">{p.spread}%</span>
                  </div>
                </div>

                {/* Lead reference information */}
                {lead && (
                  <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                    <span>Preço Pedido: <strong>{formatCurrency(lead.precoPedido)}</strong></span>
                    <span>Mín. Absoluto: <strong>{formatCurrency(lead.valorMinimoAbsoluto)}</strong></span>
                  </div>
                )}

                {/* Dates & Follow-up */}
                <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1">
                  <span>Enviada em: <strong>{formatDatePT(p.dataEnvio)}</strong></span>
                  {p.proximoFollowUp && (
                    <span className="text-purple-700 font-semibold flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Follow-Up: {formatDatePT(p.proximoFollowUp)}
                    </span>
                  )}
                </div>

                {p.notas && (
                  <p className="text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    {p.notas}
                  </p>
                )}

                {/* Proposal Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  {p.estado !== 'Aceite' ? (
                    <button
                      onClick={() => acceptProposal(p.id)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Marcar Aceite (Mover p/ CPCV)</span>
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Proposta Aceite (CPCV a Preparar)
                    </span>
                  )}

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => {
                        setEditingProposal(p);
                        setIsProposalFormOpen(true);
                      }}
                      className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition"
                      title="Editar Proposta"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteProposal(p.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition"
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
