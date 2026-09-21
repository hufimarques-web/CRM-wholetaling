import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { VisitState, VisitResult, AppUser } from '../../types/crm';
import { getUserTheme } from '../../utils/formatters';

export const VisitFormModal: React.FC = () => {
  const {
    isVisitFormOpen,
    setIsVisitFormOpen,
    editingVisit,
    setEditingVisit,
    preselectedVisitLeadId,
    setPreselectedVisitLeadId,
    leads,
    addVisit,
    updateVisit,
    currentUser
  } = useCRM();

  const [leadId, setLeadId] = useState('');
  const [data, setData] = useState('');
  const [hora, setHora] = useState('10:00');
  const [assignedUser, setAssignedUser] = useState<AppUser>(currentUser);
  const [estado, setEstado] = useState<VisitState>('Marcada');
  const [resultado, setResultado] = useState<VisitResult>('Ainda por avaliar');
  const [notas, setNotas] = useState('');

  const [error, setError] = useState('');

  useEffect(() => {
    if (editingVisit) {
      setLeadId(editingVisit.leadId);
      setData(editingVisit.data);
      setHora(editingVisit.hora);
      setAssignedUser((editingVisit.assignedUser as AppUser) || (editingVisit.responsavel === 'Hugo' ? 'Hugo' : 'Queirós'));
      setEstado(editingVisit.estado);
      setResultado(editingVisit.resultado);
      setNotas(editingVisit.notas || '');
    } else {
      setLeadId(preselectedVisitLeadId || (leads[0]?.id || ''));
      setData(new Date().toISOString().split('T')[0]);
      setHora('10:00');
      setAssignedUser(currentUser);
      setEstado('Marcada');
      setResultado('Ainda por avaliar');
      setNotas('');
    }
    setError('');
  }, [editingVisit, isVisitFormOpen, preselectedVisitLeadId, leads, currentUser]);

  if (!isVisitFormOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadId) {
      setError('Por favor selecione uma lead.');
      return;
    }
    if (!data) {
      setError('Por favor selecione a data da visita.');
      return;
    }

    if (editingVisit) {
      updateVisit({
        ...editingVisit,
        leadId,
        data,
        hora,
        responsavel: assignedUser,
        assignedUser,
        estado,
        resultado,
        realizadaEm: estado === 'Realizada' ? (editingVisit.realizadaEm || new Date().toISOString()) : undefined,
        notas: notas.trim() || undefined
      });
    } else {
      addVisit({
        leadId,
        data,
        hora,
        estado,
        resultado,
        notas: notas.trim() || undefined
      });
    }

    setIsVisitFormOpen(false);
    setEditingVisit(null);
    setPreselectedVisitLeadId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-[#FAF8F5] rounded-2xl shadow-2xl border border-stone-300 overflow-hidden flex flex-col">
        
        {/* Modal Header */}
        <div className="bg-[#16171B] px-6 py-4 text-white flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center space-x-2.5">
            <Calendar className="w-5 h-5 text-amber-500" />
            <div>
              <h3 className="font-extrabold text-sm text-white">
                {editingVisit ? 'Editar Visita ao Imóvel' : 'Agendar / Registar Visita'}
              </h3>
              <p className="text-[11px] text-stone-400">
                Pode agendar ou registar como já realizada
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsVisitFormOpen(false);
              setEditingVisit(null);
              setPreselectedVisitLeadId(null);
            }}
            className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-stone-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs text-stone-800">

          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs flex items-center gap-2 border border-red-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Lead Selector */}
          <div>
            <label className="block font-semibold text-stone-700 mb-1">Lead / Imóvel Associado *</label>
            <select
              value={leadId}
              onChange={e => setLeadId(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {leads.map(l => (
                <option key={l.id} value={l.id}>
                  {l.nomeProprietario} ({l.freguesia}) — {l.tipoImovel}
                </option>
              ))}
            </select>
          </div>

          {/* User Responsible Selector */}
          <div>
            <label className="block font-semibold text-stone-700 mb-1">Responsável pela Visita</label>
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

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Data da Visita *</label>
              <input
                type="date"
                value={data}
                onChange={e => setData(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Hora da Visita</label>
              <input
                type="time"
                value={hora}
                onChange={e => setHora(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* State Selector with quick option for 'Realizada' */}
          <div className="space-y-1.5">
            <label className="block font-semibold text-stone-700">Estado da Visita *</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setEstado('Marcada')}
                className={`py-2 rounded-xl font-bold border transition text-xs ${
                  estado === 'Marcada'
                    ? 'bg-blue-50 text-blue-800 border-blue-300 shadow-2xs'
                    : 'bg-white text-stone-600 border-stone-300'
                }`}
              >
                Marcada
              </button>
              <button
                type="button"
                onClick={() => setEstado('Confirmada')}
                className={`py-2 rounded-xl font-bold border transition text-xs ${
                  estado === 'Confirmada'
                    ? 'bg-amber-50 text-amber-800 border-amber-300 shadow-2xs'
                    : 'bg-white text-stone-600 border-stone-300'
                }`}
              >
                Confirmada
              </button>
              <button
                type="button"
                onClick={() => setEstado('Realizada')}
                className={`py-2 rounded-xl font-bold border transition text-xs flex items-center justify-center gap-1 ${
                  estado === 'Realizada'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs'
                    : 'bg-white text-stone-600 border-stone-300'
                }`}
              >
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Já Feita</span>
              </button>
            </div>
          </div>

          {/* Result of Visit */}
          <div>
            <label className="block font-semibold text-stone-700 mb-1">Avaliação / Diagnóstico do Imóvel</label>
            <select
              value={resultado}
              onChange={e => setResultado(e.target.value as VisitResult)}
              className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
            >
              <option value="Ainda por avaliar">Ainda por avaliar</option>
              <option value="Interessante">Interessante (Bom potencial de arbitragem)</option>
              <option value="Pronta para proposta">Pronta para Proposta (Validada tecnicamente)</option>
              <option value="Não interessante">Não interessante (Descartar)</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-semibold text-stone-700 mb-1">Notas da Visita</label>
            <textarea
              value={notas}
              onChange={e => setNotas(e.target.value)}
              placeholder="Ex: Levar fita métrica, proprietário foi cordial, cobertura necessita reforço."
              rows={2}
              className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

        </form>

        {/* Modal Footer */}
        <div className="bg-stone-100 px-6 py-3 border-t border-stone-200 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              setIsVisitFormOpen(false);
              setEditingVisit(null);
            }}
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
            <span>{editingVisit ? 'Guardar Alterações' : 'Registar Visita'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
