import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, Save, AlertCircle } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { VisitState, VisitResult } from '../../types/crm';

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
    updateVisit
  } = useCRM();

  const [leadId, setLeadId] = useState('');
  const [data, setData] = useState('');
  const [hora, setHora] = useState('10:00');
  const [responsavel, setResponsavel] = useState('Carlos Silva');
  const [estado, setEstado] = useState<VisitState>('Marcada');
  const [resultado, setResultado] = useState<VisitResult>('Ainda por avaliar');
  const [notas, setNotas] = useState('');

  const [error, setError] = useState('');

  useEffect(() => {
    if (editingVisit) {
      setLeadId(editingVisit.leadId);
      setData(editingVisit.data);
      setHora(editingVisit.hora);
      setResponsavel(editingVisit.responsavel);
      setEstado(editingVisit.estado);
      setResultado(editingVisit.resultado);
      setNotas(editingVisit.notas || '');
    } else {
      setLeadId(preselectedVisitLeadId || (leads[0]?.id || ''));
      setData(new Date().toISOString().split('T')[0]);
      setHora('10:00');
      setResponsavel('Carlos Silva');
      setEstado('Marcada');
      setResultado('Ainda por avaliar');
      setNotas('');
    }
    setError('');
  }, [editingVisit, isVisitFormOpen, preselectedVisitLeadId, leads]);

  if (!isVisitFormOpen) return null;

  const selectedLead = leads.find(l => l.id === leadId);

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
        responsavel,
        estado,
        resultado,
        notas: notas.trim() || undefined
      });
    } else {
      addVisit({
        leadId,
        data,
        hora,
        responsavel,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden flex flex-col">
        
        {/* Modal Header */}
        <div className="bg-[#0B132B] px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-sm">
              {editingVisit ? 'Editar Visita Imobiliária' : 'Agendar Nova Visita'}
            </h3>
          </div>
          <button
            onClick={() => {
              setIsVisitFormOpen(false);
              setEditingVisit(null);
              setPreselectedVisitLeadId(null);
            }}
            className="text-slate-400 hover:text-white p-1 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs text-slate-800">

          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-xs flex items-center gap-2 border border-red-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Lead Selector */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Selecionar Lead *</label>
            <select
              value={leadId}
              onChange={e => setLeadId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium"
            >
              {leads.map(l => (
                <option key={l.id} value={l.id}>
                  {l.nomeProprietario} — {l.concelho} ({l.freguesia}) [{l.tipoImovel}]
                </option>
              ))}
            </select>
          </div>

          {/* Previews from selected lead */}
          {selectedLead && (
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1 text-[11px] text-slate-600">
              <p><strong>Proprietário:</strong> {selectedLead.nomeProprietario} ({selectedLead.telefone})</p>
              <p><strong>Morada / Zona:</strong> {selectedLead.moradaZona}, {selectedLead.concelho} ({selectedLead.freguesia})</p>
            </div>
          )}

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Data da Visita *</label>
              <input
                type="date"
                value={data}
                onChange={e => setData(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Hora *</label>
              <input
                type="time"
                value={hora}
                onChange={e => setHora(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Agent Responsável & State */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Responsável / Agente *</label>
              <select
                value={responsavel}
                onChange={e => setResponsavel(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="Carlos Silva">Carlos Silva</option>
                <option value="Ana Martins">Ana Martins</option>
                <option value="Pedro Ramos">Pedro Ramos</option>
                <option value="Hugo Marques">Hugo Marques</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Estado da Visita *</label>
              <select
                value={estado}
                onChange={e => setEstado(e.target.value as VisitState)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-semibold"
              >
                <option value="Marcada">Marcada</option>
                <option value="Confirmada">Confirmada</option>
                <option value="Realizada">Realizada</option>
                <option value="Reagendar">Reagendar</option>
                <option value="Cancelada">Cancelada</option>
              </select>
            </div>
          </div>

          {/* Result of Visit */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Resultado da Visita</label>
            <select
              value={resultado}
              onChange={e => setResultado(e.target.value as VisitResult)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="Ainda por avaliar">Ainda por avaliar</option>
              <option value="Interessante">Interessante</option>
              <option value="Não interessante">Não interessante</option>
              <option value="Pronta para proposta">Pronta para proposta</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Notas da Visita</label>
            <textarea
              rows={2}
              value={notas}
              onChange={e => setNotas(e.target.value)}
              placeholder="Ex: Levar empreiteiro de confiança para estimar obra..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-200 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                setIsVisitFormOpen(false);
                setEditingVisit(null);
                setPreselectedVisitLeadId(null);
              }}
              className="px-4 py-2 font-semibold text-slate-700 hover:bg-slate-100 bg-slate-50 border border-slate-300 rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center space-x-1.5 px-5 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>{editingVisit ? 'Guardar Visita' : 'Agendar Visita'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
