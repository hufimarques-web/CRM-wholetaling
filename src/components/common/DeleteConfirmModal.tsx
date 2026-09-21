import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';

export const DeleteConfirmModal: React.FC = () => {
  const { deleteImpactModal, setDeleteImpactModal, confirmDeleteLead } = useCRM();

  if (!deleteImpactModal) return null;

  const { lead, visitCount, proposalCount } = deleteImpactModal;
  const hasAssociatedRecords = visitCount > 0 || proposalCount > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
        
        {/* Modal Header */}
        <div className="bg-red-50 px-6 py-4 border-b border-red-100 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-red-700">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h3 className="font-bold text-sm">Confirmar Eliminação de Lead</h3>
          </div>
          <button
            onClick={() => setDeleteImpactModal(null)}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          <div>
            <p className="text-xs text-slate-500 font-medium">Lead Selecionada:</p>
            <p className="text-sm font-bold text-slate-800">{lead.nomeProprietario}</p>
            <p className="text-xs text-slate-600">{lead.moradaZona}, {lead.concelho} ({lead.freguesia})</p>
          </div>

          {hasAssociatedRecords ? (
            <div className="bg-amber-50 p-3.5 rounded-lg border border-amber-200 text-xs text-amber-800 space-y-1.5">
              <p className="font-bold flex items-center gap-1.5 text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                Impacto da Eliminação:
              </p>
              <ul className="list-disc list-inside space-y-0.5 text-amber-800 pl-1">
                {visitCount > 0 && <li><strong>{visitCount}</strong> visita(s) agendada(s) ou realizada(s)</li>}
                {proposalCount > 0 && <li><strong>{proposalCount}</strong> proposta(s) de compra associada(s)</li>}
              </ul>
              <p className="pt-1 text-[11px] text-amber-900 font-medium">
                Ao eliminar esta lead, todos os registos acima serão removidos permanentemente para manter a integridade dos dados.
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-600">
              Tem a certeza de que pretende eliminar permanentemente esta lead? Esta ação não pode ser desfeita.
            </p>
          )}
        </div>

        {/* Modal Actions */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end space-x-3">
          <button
            onClick={() => setDeleteImpactModal(null)}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 bg-slate-100 rounded-lg transition"
          >
            Cancelar
          </button>
          <button
            onClick={() => confirmDeleteLead(lead.id)}
            className="flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Eliminar Lead e Registos</span>
          </button>
        </div>

      </div>
    </div>
  );
};
