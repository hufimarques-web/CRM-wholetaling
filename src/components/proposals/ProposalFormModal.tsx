import React, { useState, useEffect } from 'react';
import { X, FileText, Calculator, Save, AlertCircle, TrendingUp } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { ProposalState } from '../../types/crm';
import { formatCurrency, calcProposalMargin, calcProposalSpread } from '../../utils/formatters';

export const ProposalFormModal: React.FC = () => {
  const {
    isProposalFormOpen,
    setIsProposalFormOpen,
    editingProposal,
    setEditingProposal,
    preselectedProposalLeadId,
    setPreselectedProposalLeadId,
    leads,
    addProposal,
    updateProposal,
    acceptProposal
  } = useCRM();

  const [leadId, setLeadId] = useState('');
  const [valorProposta, setValorProposta] = useState<string>('');
  const [valorRevenda, setValorRevenda] = useState<string>('');
  const [dataEnvio, setDataEnvio] = useState('');
  const [estado, setEstado] = useState<ProposalState>('Enviada');
  const [proximoFollowUp, setProximoFollowUp] = useState('');
  const [notas, setNotas] = useState('');

  const [error, setError] = useState('');

  useEffect(() => {
    if (editingProposal) {
      setLeadId(editingProposal.leadId);
      setValorProposta(String(editingProposal.valorProposta));
      setValorRevenda(String(editingProposal.valorRevenda));
      setDataEnvio(editingProposal.dataEnvio);
      setEstado(editingProposal.estado);
      setProximoFollowUp(editingProposal.proximoFollowUp || '');
      setNotas(editingProposal.notas || '');
    } else {
      const selected = leads.find(l => l.id === preselectedProposalLeadId) || leads[0];
      setLeadId(selected?.id || '');
      setValorProposta(selected?.valorMinimoAbsoluto ? String(selected.valorMinimoAbsoluto + 5000) : '');
      setValorRevenda(selected?.valorEstimadoAvaliacao ? String(selected.valorEstimadoAvaliacao) : '');
      setDataEnvio(new Date().toISOString().split('T')[0]);
      setEstado('Enviada');
      setProximoFollowUp('');
      setNotas('');
    }
    setError('');
  }, [editingProposal, isProposalFormOpen, preselectedProposalLeadId, leads]);

  if (!isProposalFormOpen) return null;

  const selectedLead = leads.find(l => l.id === leadId);

  // Live Calculations
  const numProposta = Number(valorProposta) || 0;
  const numRevenda = Number(valorRevenda) || 0;
  const margemPrevista = calcProposalMargin(numRevenda, numProposta);
  const spread = calcProposalSpread(numRevenda, numProposta);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadId) {
      setError('Selecione uma lead associada.');
      return;
    }
    if (!valorProposta || numProposta <= 0) {
      setError('Indique um valor de proposta válido.');
      return;
    }
    if (!valorRevenda || numRevenda <= 0) {
      setError('Indique o valor estimado de revenda.');
      return;
    }

    if (editingProposal) {
      updateProposal({
        ...editingProposal,
        leadId,
        precoPedido: selectedLead?.precoPedido,
        valorMinimoAbsoluto: selectedLead?.valorMinimoAbsoluto || 0,
        valorProposta: numProposta,
        valorRevenda: numRevenda,
        dataEnvio,
        estado,
        proximoFollowUp: proximoFollowUp || undefined,
        notas: notas.trim() || undefined
      });

      if (estado === 'Aceite' && editingProposal.estado !== 'Aceite') {
        acceptProposal(editingProposal.id);
      }
    } else {
      const created = addProposal({
        leadId,
        precoPedido: selectedLead?.precoPedido,
        valorMinimoAbsoluto: selectedLead?.valorMinimoAbsoluto || 0,
        valorProposta: numProposta,
        valorRevenda: numRevenda,
        dataEnvio,
        estado,
        proximoFollowUp: proximoFollowUp || undefined,
        notas: notas.trim() || undefined
      });

      if (estado === 'Aceite') {
        acceptProposal(created.id);
      }
    }

    setIsProposalFormOpen(false);
    setEditingProposal(null);
    setPreselectedProposalLeadId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="bg-[#0B132B] px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-purple-400" />
            <h3 className="font-bold text-sm">
              {editingProposal ? 'Editar Proposta de Compra' : 'Criar Nova Proposta de Compra'}
            </h3>
          </div>
          <button
            onClick={() => {
              setIsProposalFormOpen(false);
              setEditingProposal(null);
              setPreselectedProposalLeadId(null);
            }}
            className="text-slate-400 hover:text-white p-1 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs text-slate-800">

          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-xs flex items-center gap-2 border border-red-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Lead Selector */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Lead Associada *</label>
            <select
              value={leadId}
              onChange={e => {
                setLeadId(e.target.value);
                const l = leads.find(item => item.id === e.target.value);
                if (l) {
                  if (l.valorEstimadoAvaliacao) setValorRevenda(String(l.valorEstimadoAvaliacao));
                  if (l.valorMinimoAbsoluto) setValorProposta(String(l.valorMinimoAbsoluto + 5000));
                }
              }}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium"
            >
              {leads.map(l => (
                <option key={l.id} value={l.id}>
                  {l.nomeProprietario} — {l.concelho} ({l.freguesia}) [Min: {formatCurrency(l.valorMinimoAbsoluto)}]
                </option>
              ))}
            </select>
          </div>

          {/* Values Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Valor da Nossa Proposta (€) *</label>
              <input
                type="number"
                value={valorProposta}
                onChange={e => setValorProposta(e.target.value)}
                placeholder="Ex: 215000"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Valor Estimado de Revenda (€) *</label>
              <input
                type="number"
                value={valorRevenda}
                onChange={e => setValorRevenda(e.target.value)}
                placeholder="Ex: 340000"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Automatic Margin & Spread Preview Card */}
          <div className="bg-purple-50 p-4 rounded-xl border border-purple-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-900 uppercase flex items-center gap-1">
                <Calculator className="w-4 h-4 text-purple-600" />
                Margem Bruta Estimada (Sem Lucro Líquido)
              </span>
              <span className="text-xs font-extrabold text-purple-700 bg-purple-200 px-2 py-0.5 rounded">
                Spread: {spread}%
              </span>
            </div>
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-600">Margem Prevista (Revenda - Proposta):</span>
              <span className="text-base font-extrabold text-emerald-700">{formatCurrency(margemPrevista)}</span>
            </div>
            <p className="text-[10px] text-purple-800 italic">
              * Nota: A margem prevista representa a margem bruta estimada entre a nossa compra e revenda.
            </p>
          </div>

          {/* Dates & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Data de Envio *</label>
              <input
                type="date"
                value={dataEnvio}
                onChange={e => setDataEnvio(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Estado da Proposta *</label>
              <select
                value={estado}
                onChange={e => setEstado(e.target.value as ProposalState)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-semibold"
              >
                <option value="Enviada">Enviada</option>
                <option value="Em negociação">Em negociação</option>
                <option value="Aceite">Aceite (Avança p/ CPCV)</option>
                <option value="Recusada">Recusada</option>
                <option value="Expirada">Expirada</option>
              </select>
            </div>
          </div>

          {/* Follow-up date */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Próximo Follow-Up (Opcional)</label>
            <input
              type="date"
              value={proximoFollowUp}
              onChange={e => setProximoFollowUp(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Notas da Proposta</label>
            <textarea
              rows={2}
              value={notas}
              onChange={e => setNotas(e.target.value)}
              placeholder="Ex: Proposta com validade de 7 dias e sinal de 10% no CPCV..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                setIsProposalFormOpen(false);
                setEditingProposal(null);
                setPreselectedProposalLeadId(null);
              }}
              className="px-4 py-2 font-semibold text-slate-700 hover:bg-slate-100 bg-slate-50 border border-slate-300 rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center space-x-1.5 px-5 py-2 font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>{editingProposal ? 'Guardar Proposta' : 'Criar Proposta'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
