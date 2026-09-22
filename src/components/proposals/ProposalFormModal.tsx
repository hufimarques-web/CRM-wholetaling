import React, { useState, useEffect } from 'react';
import { X, FileText, Calculator, Save, AlertCircle, TrendingUp, Sparkles, RefreshCw } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { ProposalState, AppUser } from '../../types/crm';
import { formatCurrency, calcProposalMargin, calcProposalSpread, calcDefaultSinal, calcProposalMultiple, getUserTheme } from '../../utils/formatters';

export const ProposalFormModal: React.FC = () => {
  const {
    isProposalFormOpen,
    setIsProposalFormOpen,
    editingProposal,
    setEditingProposal,
    viewingProposal,
    setViewingProposal,
    prefilledProposalData,
    setPrefilledProposalData,
    preselectedProposalLeadId,
    setPreselectedProposalLeadId,
    leads,
    addProposal,
    updateProposal,
    acceptProposal,
    currentUser
  } = useCRM();

  const [leadId, setLeadId] = useState('');
  const [valorProposta, setValorProposta] = useState<string>('');
  const [valorSinal, setValorSinal] = useState<string>('');
  const [isSinalManuallyEdited, setIsSinalManuallyEdited] = useState(false);
  const [valorRevenda, setValorRevenda] = useState<string>('');
  const [dataEnvio, setDataEnvio] = useState('');
  const [estado, setEstado] = useState<ProposalState>('Enviada');
  const [assignedUser, setAssignedUser] = useState<AppUser>(currentUser);
  const [proximoFollowUp, setProximoFollowUp] = useState('');
  const [notas, setNotas] = useState('');

  const [error, setError] = useState('');

  useEffect(() => {
    if (editingProposal) {
      setLeadId(editingProposal.leadId);
      setValorProposta(String(editingProposal.valorProposta));
      setValorSinal(String(editingProposal.valorSinal || calcDefaultSinal(editingProposal.valorProposta)));
      setIsSinalManuallyEdited(true);
      setValorRevenda(String(editingProposal.valorRevenda));
      setDataEnvio(editingProposal.dataEnvio);
      setEstado(editingProposal.estado);
      setAssignedUser(editingProposal.assignedUser || currentUser);
      setProximoFollowUp(editingProposal.proximoFollowUp || '');
      setNotas(editingProposal.notas || '');
    } else if (prefilledProposalData) {
      const targetLeadId = prefilledProposalData.leadId || preselectedProposalLeadId || leads[0]?.id || '';
      setLeadId(targetLeadId);
      const propVal = prefilledProposalData.valorProposta || 100000;
      setValorProposta(String(propVal));
      setValorSinal(String(prefilledProposalData.valorSinal || calcDefaultSinal(propVal)));
      setIsSinalManuallyEdited(true);
      setValorRevenda(String(prefilledProposalData.valorRevenda || Math.round(propVal * 1.35)));
      setDataEnvio(prefilledProposalData.dataEnvio || new Date().toISOString().split('T')[0]);
      setEstado(prefilledProposalData.estado || 'Enviada');
      setAssignedUser(currentUser);
      setProximoFollowUp(prefilledProposalData.proximoFollowUp || '');
      setNotas(prefilledProposalData.notas || '');
    } else {
      const selected = leads.find(l => l.id === preselectedProposalLeadId) || leads[0];
      setLeadId(selected?.id || '');
      const propVal = selected?.valorMinimoAbsoluto ? selected.valorMinimoAbsoluto : 100000;
      setValorProposta(String(propVal));
      setValorSinal(String(calcDefaultSinal(propVal)));
      setIsSinalManuallyEdited(false);
      const defRevenda = selected ? (selected.valorMinimoAbsoluto + (selected.margemPotencial || 0)) : Math.round(propVal * 1.35);
      setValorRevenda(String(defRevenda));
      setDataEnvio(new Date().toISOString().split('T')[0]);
      setEstado('Enviada');
      setAssignedUser(currentUser);
      setProximoFollowUp('');
      setNotas('');
    }
    setError('');
  }, [editingProposal, prefilledProposalData, isProposalFormOpen, preselectedProposalLeadId, leads, currentUser]);

  if (!isProposalFormOpen) return null;

  const selectedLead = leads.find(l => l.id === leadId);

  // Live Calculations
  const numProposta = Number(valorProposta) || 0;
  const numRevenda = Number(valorRevenda) || 0;
  const numSinal = Number(valorSinal) || 0;
  const margemPrevista = calcProposalMargin(numRevenda, numProposta);
  const spread = calcProposalSpread(numRevenda, numProposta);
  const multiploSinal = calcProposalMultiple(margemPrevista, numSinal);

  // Auto-recalculate 10% sinal when proposta changes if user hasn't locked a custom value
  const handlePropostaChange = (val: string) => {
    setValorProposta(val);
    const parsed = Number(val) || 0;
    if (!isSinalManuallyEdited) {
      setValorSinal(String(calcDefaultSinal(parsed)));
    }
  };

  const handleResetSinalTo10Percent = () => {
    setValorSinal(String(calcDefaultSinal(numProposta)));
    setIsSinalManuallyEdited(false);
  };

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
    if (!numSinal || numSinal <= 0) {
      setError('Indique o valor do sinal (investimento).');
      return;
    }
    if (!valorRevenda || numRevenda <= 0) {
      setError('Indique o valor estimado de revenda.');
      return;
    }

    if (editingProposal) {
      const updated = {
        ...editingProposal,
        leadId,
        valorMinimoAbsoluto: selectedLead?.valorMinimoAbsoluto || 0,
        valorProposta: numProposta,
        valorSinal: numSinal,
        valorRevenda: numRevenda,
        dataEnvio,
        estado,
        assignedUser,
        proximoFollowUp: proximoFollowUp || undefined,
        notas: notas.trim() || undefined
      };
      updateProposal(updated);

      if (estado === 'Aceite' && editingProposal.estado !== 'Aceite') {
        acceptProposal(editingProposal.id);
      }
      setViewingProposal(updated);
    } else {
      const created = addProposal({
        leadId,
        valorMinimoAbsoluto: selectedLead?.valorMinimoAbsoluto || 0,
        valorProposta: numProposta,
        valorSinal: numSinal,
        valorRevenda: numRevenda,
        dataEnvio,
        estado,
        proximoFollowUp: proximoFollowUp || undefined,
        notas: notas.trim() || undefined
      });

      if (estado === 'Aceite') {
        acceptProposal(created.id);
      }
      setViewingProposal(created);
    }

    setIsProposalFormOpen(false);
    setEditingProposal(null);
    setPreselectedProposalLeadId(null);
    setPrefilledProposalData(null);
  };

  const handleClose = () => {
    setIsProposalFormOpen(false);
    setEditingProposal(null);
    setPreselectedProposalLeadId(null);
    setPrefilledProposalData(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="w-full max-w-xl bg-[#FAF8F5] rounded-2xl shadow-2xl border border-stone-300 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header (Obsidian) */}
        <div className="bg-[#16171B] px-6 py-4 text-white flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center space-x-2.5">
            <FileText className="w-5 h-5 text-amber-500" />
            <div>
              <h3 className="font-extrabold text-sm text-white">
                {editingProposal ? 'Editar Proposta de Compra' : 'Criar Nova Proposta de Compra'}
              </h3>
              <p className="text-[11px] text-stone-400">
                Cálculo de sinal (10% padrão editável) e rácio de margem
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs text-stone-800 overflow-y-auto">

          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs flex items-center gap-2 border border-red-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* User and Lead Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Lead Associada *</label>
              <select
                value={leadId}
                onChange={e => {
                  setLeadId(e.target.value);
                  const l = leads.find(item => item.id === e.target.value);
                  if (l) {
                    const propVal = l.valorMinimoAbsoluto || 100000;
                    setValorProposta(String(propVal));
                    setValorSinal(String(calcDefaultSinal(propVal)));
                    const defRevenda = (l.valorMinimoAbsoluto + (l.margemPotencial || 0)) || Math.round(propVal * 1.35);
                    setValorRevenda(String(defRevenda));
                  }
                }}
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {leads.map(l => (
                  <option key={l.id} value={l.id}>
                    {l.nomeProprietario} ({l.freguesia}) — {formatCurrency(l.valorMinimoAbsoluto)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Responsável pela Proposta</label>
              <div className="flex items-center bg-[#F3EFE6] p-0.5 rounded-xl border border-[#E2DDD3]">
                <button
                  type="button"
                  onClick={() => setAssignedUser('Queirós')}
                  className={`flex-1 py-1.5 rounded-lg font-bold text-xs transition ${
                    assignedUser === 'Queirós' ? 'bg-white text-emerald-800 shadow-xs border border-emerald-200' : 'text-stone-600'
                  }`}
                >
                  Queirós
                </button>
                <button
                  type="button"
                  onClick={() => setAssignedUser('Hugo')}
                  className={`flex-1 py-1.5 rounded-lg font-bold text-xs transition ${
                    assignedUser === 'Hugo' ? 'bg-white text-amber-800 shadow-xs border border-amber-200' : 'text-stone-600'
                  }`}
                >
                  Hugo
                </button>
              </div>
            </div>
          </div>

          {/* Proposal Value & Down Payment (Sinal) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Valor da Proposta de Compra (€) *
              </label>
              <input
                type="number"
                value={valorProposta}
                onChange={e => handlePropostaChange(e.target.value)}
                placeholder="Ex: 110000"
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-sm font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <span className="text-[10px] text-stone-400 mt-0.5 block">
                Valor total oferecido ao proprietário
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-semibold text-stone-700">
                  Valor de Sinal / Investimento (€) *
                </label>
                <button
                  type="button"
                  onClick={handleResetSinalTo10Percent}
                  className="text-[10px] font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
                  title="Calcular 10% automático"
                >
                  <RefreshCw className="w-2.5 h-2.5" />
                  <span>10% Auto</span>
                </button>
              </div>
              <input
                type="number"
                value={valorSinal}
                onChange={e => {
                  setValorSinal(e.target.value);
                  setIsSinalManuallyEdited(true);
                }}
                placeholder="Ex: 11000"
                className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-sm font-bold text-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <span className="text-[10px] text-stone-500 mt-0.5 block">
                Calculado a 10% por omissão (100% editável)
              </span>
            </div>
          </div>

          {/* Resale Value & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Valor Estimado de Revenda / Saída (€) *
              </label>
              <input
                type="number"
                value={valorRevenda}
                onChange={e => setValorRevenda(e.target.value)}
                placeholder="Ex: 155000"
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-sm font-bold text-emerald-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Data de Envio *</label>
              <input
                type="date"
                value={dataEnvio}
                onChange={e => setDataEnvio(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* DYNAMIC METRICS BOX: MARGIN & SIGNAL MULTIPLE */}
          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs space-y-2">
            <span className="font-bold text-xs text-stone-900 block uppercase tracking-wider">
              Análise de Retorno & Múltiplo do Sinal
            </span>

            <div className="grid grid-cols-3 gap-3 pt-1 border-t border-stone-100">
              <div>
                <span className="text-[10px] text-stone-400 font-semibold block">Margem Prevista</span>
                <span className="text-sm font-black text-emerald-600 block mt-0.5">
                  {formatCurrency(margemPrevista)}
                </span>
                <span className="text-[10px] text-stone-500">{spread}% spread</span>
              </div>

              <div>
                <span className="text-[10px] text-stone-400 font-semibold block">Sinal Imobilizado</span>
                <span className="text-sm font-black text-amber-700 block mt-0.5">
                  {formatCurrency(numSinal)}
                </span>
                <span className="text-[10px] text-stone-500">
                  {numProposta > 0 ? `${((numSinal / numProposta) * 100).toFixed(0)}% do total` : '10%'}
                </span>
              </div>

              <div className="bg-[#FAF8F5] p-2 rounded-lg border border-stone-200 text-center">
                <span className="text-[9px] uppercase font-extrabold text-stone-500 block">
                  Múltiplo do Sinal
                </span>
                <span className="text-lg font-black text-emerald-700 block leading-tight">
                  {multiploSinal}x
                </span>
                <span className="text-[9px] text-stone-500 font-medium">ROI no Investimento</span>
              </div>
            </div>
          </div>

          {/* State & Follow Up */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Estado da Proposta</label>
              <select
                value={estado}
                onChange={e => setEstado(e.target.value as ProposalState)}
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
              >
                <option value="Enviada">Enviada</option>
                <option value="Em negociação">Em negociação</option>
                <option value="Aceite">Aceite (Avança para CPCV)</option>
                <option value="Recusada">Recusada</option>
                <option value="Expirada">Expirada</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Próximo Follow-Up</label>
              <input
                type="date"
                value={proximoFollowUp}
                onChange={e => setProximoFollowUp(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-semibold text-stone-700 mb-1">Condições da Proposta / Notas</label>
            <textarea
              value={notas}
              onChange={e => setNotas(e.target.value)}
              placeholder="Ex: Sinal de 10% no CPCV, escritura a 90 dias com cláusula de cessão de posição."
              rows={2}
              className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

        </form>

        {/* Modal Footer */}
        <div className="bg-stone-100 px-6 py-3 border-t border-stone-200 flex items-center justify-between">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-stone-600 hover:text-stone-900 font-semibold text-xs"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2.5 bg-stone-900 hover:bg-black text-white font-bold rounded-xl text-xs shadow-xs transition flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{editingProposal ? 'Guardar Proposta' : 'Registar Proposta'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
