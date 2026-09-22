import React from 'react';
import {
  X,
  FileText,
  Edit,
  Trash2,
  CheckCircle2,
  Calendar,
  Building,
  MapPin,
  TrendingUp,
  Percent,
  Clock,
  ArrowRight,
  ShieldCheck,
  User,
  ExternalLink
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { formatCurrency, formatDatePT, getProposalStateBadge, getUserTheme } from '../../utils/formatters';
import { ProposalState } from '../../types/crm';

export const ProposalDetailModal: React.FC = () => {
  const {
    viewingProposal,
    setViewingProposal,
    setEditingProposal,
    setIsProposalFormOpen,
    deleteProposal,
    acceptProposal,
    updateProposal,
    setSelectedLeadForDrawer,
    leads
  } = useCRM();

  if (!viewingProposal) return null;

  const p = viewingProposal;
  const lead = leads.find(l => l.id === p.leadId);
  const stateBadge = getProposalStateBadge(p.estado);
  const userTheme = getUserTheme(p.assignedUser);

  // Return & Multiple Calculations
  const roiPercent = p.valorSinal > 0
    ? Math.round((p.margemPrevista / p.valorSinal) * 100)
    : 0;

  const handleEdit = () => {
    setViewingProposal(null);
    setEditingProposal(p);
    setIsProposalFormOpen(true);
  };

  const handleAccept = () => {
    acceptProposal(p.id);
    setViewingProposal(null);
  };

  const handleDelete = () => {
    if (window.confirm(`Tem a certeza que deseja eliminar a proposta para "${p.nomeProprietario}"?`)) {
      deleteProposal(p.id);
      setViewingProposal(null);
    }
  };

  const handleOpenLead = () => {
    if (lead) {
      setViewingProposal(null);
      setSelectedLeadForDrawer(lead);
    }
  };

  const handleChangeState = (newState: ProposalState) => {
    if (newState === 'Aceite') {
      handleAccept();
      return;
    }
    const updated = { ...p, estado: newState };
    updateProposal(updated);
    setViewingProposal(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fade-in font-sans">
      <div className="bg-white rounded-2xl border border-stone-200 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header (Obsidian Luxury Dark) */}
        <div className="bg-[#141518] px-6 py-5 text-white flex items-start justify-between border-b border-stone-800 shrink-0">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase tracking-wider">
                Proposta Formal de Arbitragem
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${stateBadge.bg} ${stateBadge.text} ${stateBadge.border}`}>
                {p.estado}
              </span>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${userTheme.badgeBg} ${userTheme.badgeText} ${userTheme.badgeBorder}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${userTheme.dot}`}></span>
                <span>{p.assignedUser}</span>
              </span>
            </div>

            <h3 className="text-xl font-black text-white tracking-tight font-display">
              {p.nomeProprietario}
            </h3>
            
            <p className="text-xs text-stone-400 flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>{p.moradaConcelhoFreguesia}</span>
              {lead && (
                <>
                  <span>•</span>
                  <span>{lead.tipoImovel} {lead.areaM2 ? `(${lead.areaM2} m²)` : ''}</span>
                </>
              )}
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleEdit}
              className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-lg transition"
              title="Editar Proposta"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewingProposal(null)}
              className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 space-y-6 overflow-y-auto text-xs text-stone-800 flex-1">
          
          {/* Quick Lead Navigation */}
          {lead && (
            <div className="bg-[#FAF8F5] p-3 rounded-xl border border-stone-200 flex items-center justify-between">
              <div className="flex items-center gap-2 text-stone-700">
                <Building className="w-4 h-4 text-amber-600" />
                <span>Oportunidade associada: <strong>{lead.nomeProprietario}</strong> ({lead.freguesia})</span>
              </div>
              <button
                onClick={handleOpenLead}
                className="text-amber-800 font-bold hover:underline flex items-center gap-1 text-[11px]"
              >
                <span>Ver Ficha Geral</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Main Financial Matrix (What user requested: Valor Proposta, Sinal CPCV, Retorno em valor + %) */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-black uppercase tracking-wider text-stone-500 font-display">
              Estrutura Financeira da Proposta & Capital de Sinal
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                  Valor Proposta
                </span>
                <span className="text-base font-black text-stone-900 mt-0.5 block">
                  {formatCurrency(p.valorProposta)}
                </span>
                <span className="text-[10px] text-stone-500 block mt-0.5">
                  Mín. pedido: {formatCurrency(p.valorMinimoAbsoluto)}
                </span>
              </div>

              <div className="bg-amber-50/80 p-3.5 rounded-xl border border-amber-300">
                <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                  Sinal CPCV (Capital)
                </span>
                <span className="text-base font-black text-amber-900 mt-0.5 block">
                  {formatCurrency(p.valorSinal)}
                </span>
                <span className="text-[10px] text-amber-700 font-semibold block mt-0.5">
                  {((p.valorSinal / p.valorProposta) * 100).toFixed(0)}% do valor de compra
                </span>
              </div>

              <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                  Revenda Estimada
                </span>
                <span className="text-base font-black text-stone-900 mt-0.5 block">
                  {formatCurrency(p.valorRevenda)}
                </span>
                <span className="text-[10px] text-stone-500 block mt-0.5">
                  Spread: {p.spread}%
                </span>
              </div>

              <div className="bg-emerald-50/80 p-3.5 rounded-xl border border-emerald-300">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                  Margem Prevista
                </span>
                <span className="text-base font-black text-emerald-700 mt-0.5 block">
                  {formatCurrency(p.margemPrevista)}
                </span>
                <span className="text-[10px] text-emerald-800 font-bold block mt-0.5">
                  Lucro bruto projetado
                </span>
              </div>
            </div>

            {/* Performance Highlights Bar */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-stone-900 to-stone-800 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
              <div className="flex items-center gap-6">
                <div>
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                    Múltiplo do Sinal
                  </span>
                  <span className="text-xl font-black text-amber-400 font-display">
                    {p.multiploSinal || '-'}x
                  </span>
                  <span className="text-[10px] text-stone-400 block">
                    Retorno / Investimento
                  </span>
                </div>

                <div className="border-l border-stone-700 pl-6">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                    Retorno sobre Capital (%)
                  </span>
                  <span className="text-xl font-black text-emerald-400 font-display">
                    +{roiPercent}%
                  </span>
                  <span className="text-[10px] text-stone-400 block">
                    Rentabilidade s/ Sinal
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {p.valorSinal > 0 ? `Para cada 1€ investido retorna ${(p.margemPrevista / p.valorSinal).toFixed(1)}€` : 'Sinal a definir'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Status Selector */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
              Alterar Estado da Proposta:
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              {(['Enviada', 'Em negociação', 'Recusada', 'Expirada'] as ProposalState[]).map(st => (
                <button
                  key={st}
                  onClick={() => handleChangeState(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                    p.estado === st
                      ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-200'
                  }`}
                >
                  {st}
                </button>
              ))}
              <button
                onClick={handleAccept}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition flex items-center gap-1"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Marcar como Aceite</span>
              </button>
            </div>
          </div>

          {/* Timeline & Follow-up */}
          <div className="grid grid-cols-2 gap-3 p-4 bg-[#FAF8F5] rounded-xl border border-stone-200">
            <div>
              <span className="text-stone-400 block text-[10px] font-bold uppercase">Data de Envio</span>
              <span className="font-bold text-stone-900 text-xs mt-0.5 block flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-stone-500" />
                {formatDatePT(p.dataEnvio)}
              </span>
            </div>
            <div>
              <span className="text-stone-400 block text-[10px] font-bold uppercase">Próximo Follow-up</span>
              <span className="font-bold text-amber-800 text-xs mt-0.5 block flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                {p.proximoFollowUp ? formatDatePT(p.proximoFollowUp) : 'Sem follow-up agendado'}
              </span>
            </div>
          </div>

          {/* Notes and Strategic Context */}
          {p.notas && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
                Notas & Condições Especiais:
              </span>
              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 text-stone-700 leading-relaxed italic">
                "{p.notas}"
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={handleDelete}
            className="flex items-center gap-1 text-xs font-semibold text-stone-400 hover:text-rose-600 transition p-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Eliminar Proposta</span>
          </button>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleEdit}
              className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Editar Proposta</span>
            </button>

            <button
              onClick={handleAccept}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Aceitar & Mover p/ Operações CPCV</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
