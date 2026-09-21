import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { X, PhoneCall, Save, Clock, Calendar, AlertCircle, Trash2, CheckCircle2, RotateCcw } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { CallResult, ContactStatus } from '../../types/crm';

export const CallLogModal: React.FC = () => {
  const {
    isCallModalOpen,
    setIsCallModalOpen,
    callModalLeadId,
    setCallModalLeadId,
    leads,
    addCallNoteToLead
  } = useCRM();

  const [callResult, setCallResult] = useState<CallResult>('Contactado');
  const [dataHora, setDataHora] = useState('');
  const [nextContactDate, setNextContactDate] = useState('');
  const [text, setText] = useState('');
  const [hasDraftRestored, setHasDraftRestored] = useState(false);
  const [error, setError] = useState('');

  const lead = leads.find(l => l.id === callModalLeadId);

  // Draft recovery & initialization when modal opens for a lead
  useEffect(() => {
    if (callModalLeadId) {
      // Set default current local date/time using date-fns format to preserve local timezone (Europe/Lisbon)
      const now = new Date();
      const formattedNow = format(now, "yyyy-MM-dd'T'HH:mm");
      setDataHora(formattedNow);

      // Check for saved draft in localStorage
      const savedDrafts = localStorage.getItem('wt_crm_call_drafts');
      if (savedDrafts) {
        try {
          const draftsObj = JSON.parse(savedDrafts);
          if (draftsObj[callModalLeadId]) {
            setText(draftsObj[callModalLeadId]);
            setHasDraftRestored(true);
          } else {
            setText('');
            setHasDraftRestored(false);
          }
        } catch {
          setText('');
          setHasDraftRestored(false);
        }
      } else {
        setText('');
        setHasDraftRestored(false);
      }
      setCallResult('Contactado');
      setNextContactDate('');
      setError('');
    }
  }, [callModalLeadId, isCallModalOpen]);

  if (!isCallModalOpen || !lead) return null;

  // Auto-save draft on input change
  const handleTextChange = (newVal: string) => {
    setText(newVal);
    const savedDrafts = localStorage.getItem('wt_crm_call_drafts');
    let draftsObj: Record<string, string> = {};
    if (savedDrafts) {
      try { draftsObj = JSON.parse(savedDrafts); } catch (e) { console.error(e); }
    }
    if (newVal.trim()) {
      draftsObj[lead.id] = newVal;
    } else {
      delete draftsObj[lead.id];
    }
    localStorage.setItem('wt_crm_call_drafts', JSON.stringify(draftsObj));
  };

  const handleDiscardDraft = () => {
    if (window.confirm('Tem a certeza de que deseja descartar o rascunho desta chamada?')) {
      setText('');
      setHasDraftRestored(false);
      const savedDrafts = localStorage.getItem('wt_crm_call_drafts');
      if (savedDrafts) {
        try {
          const draftsObj = JSON.parse(savedDrafts);
          delete draftsObj[lead.id];
          localStorage.setItem('wt_crm_call_drafts', JSON.stringify(draftsObj));
        } catch (e) { console.error(e); }
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      setError('Por favor introduza as notas da chamada.');
      return;
    }

    // Convert local datetime-local string (YYYY-MM-DDTHH:mm) to ISO Date string
    const dateToSave = dataHora ? new Date(dataHora).toISOString() : new Date().toISOString();

    addCallNoteToLead({
      leadId: lead.id,
      text: text.trim(),
      callResult,
      date: dateToSave,
      nextContactDate: nextContactDate || undefined
    });

    // Clear draft for this lead
    const savedDrafts = localStorage.getItem('wt_crm_call_drafts');
    if (savedDrafts) {
      try {
        const draftsObj = JSON.parse(savedDrafts);
        delete draftsObj[lead.id];
        localStorage.setItem('wt_crm_call_drafts', JSON.stringify(draftsObj));
      } catch (e) { console.error(e); }
    }

    setIsCallModalOpen(false);
    setCallModalLeadId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto">
        
        {/* Header */}
        <div className="bg-[#0B132B] px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <PhoneCall className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold">Registar Chamada com Lead</h2>
              <p className="text-xs text-blue-300">
                {lead.nomeProprietario} ({lead.telefone})
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setIsCallModalOpen(false);
              setCallModalLeadId(null);
            }}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Draft restored notification badge */}
        {hasDraftRestored && (
          <div className="bg-amber-50 px-6 py-2 border-b border-amber-200 flex items-center justify-between text-xs text-amber-900">
            <span className="flex items-center gap-1.5 font-semibold">
              <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
              Rascunho não guardado recuperado automaticamente.
            </span>
            <button
              onClick={handleDiscardDraft}
              className="text-[11px] text-red-600 hover:underline font-bold"
            >
              Descartar Rascunho
            </button>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs text-slate-800">
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Date/Time & Result Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Data e Hora da Chamada (Hora Local) *
              </label>
              <input
                type="datetime-local"
                value={dataHora}
                onChange={e => setDataHora(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Resultado da Chamada *
              </label>
              <select
                value={callResult}
                onChange={e => setCallResult(e.target.value as CallResult)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-bold text-xs"
              >
                <option value="Contactado">Contactado (Atendeu e conversou)</option>
                <option value="Sem resposta">Sem resposta (Não atendeu / desligou)</option>
                <option value="Voltar a ligar">Voltar a ligar (Agendar novo contacto)</option>
              </select>
            </div>
          </div>

          {/* Optional Next Contact Date */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Próximo Contacto Agendado (Opcional)
            </label>
            <input
              type="date"
              value={nextContactDate}
              onChange={e => setNextContactDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
            />
          </div>

          {/* Ampla área de notas da chamada */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-900">
                Notas & Detalhes da Chamada *
              </label>
              <span className="text-[10px] text-slate-400">
                Rascunho guardado automaticamente
              </span>
            </div>
            <textarea
              rows={5}
              value={text}
              onChange={e => handleTextChange(e.target.value)}
              placeholder="Escreva aqui tudo o que foi falado durante a chamada com o proprietário..."
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs leading-relaxed"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              {text.trim() && (
                <button
                  type="button"
                  onClick={handleDiscardDraft}
                  className="text-xs text-red-600 hover:underline flex items-center gap-1 font-semibold"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Descartar Rascunho</span>
                </button>
              )}
            </div>

            <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={() => {
                  setIsCallModalOpen(false);
                  setCallModalLeadId(null);
                }}
                className="px-4 py-2 font-semibold text-slate-700 hover:bg-slate-100 bg-slate-50 border border-slate-300 rounded-lg transition"
              >
                Cancelar (Guardar Rascunho)
              </button>
              <button
                type="submit"
                className="flex items-center space-x-1.5 px-5 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition"
              >
                <Save className="w-4 h-4" />
                <span>Guardar Chamada</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
