import React, { useState } from 'react';
import { PhoneCall, Edit, Trash2, Calendar, MessageSquarePlus, MapPin, Tag, CheckCircle2, AlertCircle } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { Lead, LeadPhase } from '../../types/crm';
import { formatCurrency, getContactStatusBadge, getPhotoStatusBadge, getPriorityBadge, checkLeadReadiness } from '../../utils/formatters';

const FUNNEL_PHASES: { id: LeadPhase; label: string }[] = [
  { id: 'Nova lead', label: 'NOVA LEAD' },
  { id: 'Em análise', label: 'EM ANÁLISE' },
  { id: 'Pronta para proposta', label: 'PRONTA PARA PROPOSTA' },
  { id: 'CPCV a preparar', label: 'CPCV A PREPARAR' },
  { id: 'Descartada', label: 'DESCARTADA' }
];

interface FunnelBoardProps {
  filteredLeads: Lead[];
}

export const FunnelBoard: React.FC<FunnelBoardProps> = ({ filteredLeads }) => {
  const {
    updateLeadPhase,
    setSelectedLeadForDrawer,
    setEditingLead,
    setIsLeadFormOpen,
    setPreselectedVisitLeadId,
    setIsVisitFormOpen,
    requestDeleteLead,
    addNoteToLead,
    openCallModal
  } = useCRM();

  // HTML5 Drag and Drop State
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<LeadPhase | null>(null);

  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    setDraggedLeadId(leadId);
    e.dataTransfer.setData('text/plain', leadId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, phase: LeadPhase) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== phase) {
      setDragOverColumn(phase);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, phase: LeadPhase) => {
    e.preventDefault();
    setDragOverColumn(null);
    const leadId = e.dataTransfer.getData('text/plain') || draggedLeadId;
    if (leadId) {
      updateLeadPhase(leadId, phase);
    }
    setDraggedLeadId(null);
  };

  const handleQuickAddNote = (e: React.MouseEvent, leadId: string) => {
    e.stopPropagation();
    const text = window.prompt('Adicionar Nota Rápida à Lead:');
    if (text && text.trim()) {
      addNoteToLead(leadId, text.trim(), 'Gestor CRM');
    }
  };

  return (
    <div className="flex-1 overflow-x-auto pb-4">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 min-w-[1100px] h-full items-start">
        
        {FUNNEL_PHASES.map(phase => {
          const colLeads = filteredLeads.filter(l => l.fase === phase.id);
          const colSum = colLeads.reduce((acc, curr) => acc + (curr.valorMinimoAbsoluto || 0), 0);
          const isOver = dragOverColumn === phase.id;

          return (
            <div
              key={phase.id}
              onDragOver={(e) => handleDragOver(e, phase.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, phase.id)}
              className={`flex flex-col bg-slate-200/60 rounded-xl border transition-all duration-200 min-h-[500px] ${
                isOver ? 'border-blue-500 bg-blue-50/50 shadow-md ring-2 ring-blue-400/30' : 'border-slate-300/70'
              }`}
            >
              
              {/* Column Header */}
              <div className="p-3 text-center border-b border-slate-300/80 bg-slate-100/90 rounded-t-xl shrink-0">
                <h3 className="text-xs font-bold text-slate-800 tracking-wider">
                  {phase.label}
                </h3>
                <div className="mt-0.5">
                  <span className="text-sm font-extrabold text-slate-900 block">
                    {formatCurrency(colSum)}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    ({colLeads.length} {colLeads.length === 1 ? 'negócio' : 'negócios'})
                  </span>
                </div>
              </div>

              {/* Cards List Container */}
              <div className="p-2.5 space-y-2.5 flex-1 overflow-y-auto max-h-[calc(100vh-280px)]">
                {colLeads.length === 0 ? (
                  <div className="h-32 flex items-center justify-center text-center p-4 border-2 border-dashed border-slate-300 rounded-lg text-slate-400 text-xs">
                    Nenhum negócio nesta fase
                  </div>
                ) : (
                  colLeads.map(lead => {
                    const contactBadge = getContactStatusBadge(lead.contacto);
                    const photoBadge = getPhotoStatusBadge(lead.fotos);
                    const priorityBadge = getPriorityBadge(lead.prioridade);

                    return (
                      <div
                        key={lead.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, lead.id)}
                        onClick={() => setSelectedLeadForDrawer(lead)}
                        className="group bg-white rounded-lg p-3 border border-slate-200 shadow-xs hover:shadow-md hover:border-blue-300 transition-all cursor-pointer space-y-2 relative"
                      >
                        
                        {/* Top Line: Contact Dot + Owner Name + Priority Badge */}
                        <div className="flex items-center justify-between gap-1">
                          <div className="flex items-center space-x-2 min-w-0">
                            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${contactBadge.dot}`} />
                            <h4 className="text-xs font-bold text-slate-900 truncate group-hover:text-blue-600 transition">
                              {lead.nomeProprietario}
                            </h4>
                          </div>

                          <span className={`px-2 py-0.5 text-[9px] rounded-md uppercase font-semibold shrink-0 ${priorityBadge.bg}`}>
                            {priorityBadge.text}
                          </span>
                        </div>

                        {/* Location Line */}
                        <div className="flex items-center text-[11px] text-slate-500">
                          <MapPin className="w-3 h-3 text-slate-400 mr-1 shrink-0" />
                          <span className="truncate">{lead.freguesia}, {lead.concelho}</span>
                        </div>

                        {/* Values Line & Origin Badge */}
                        <div className="flex items-center justify-between pt-1 text-xs">
                          <div>
                            <span className="text-[10px] text-slate-400 block leading-none">Min. Absoluto</span>
                            <span className="font-extrabold text-slate-900">
                              {formatCurrency(lead.valorMinimoAbsoluto)}
                            </span>
                          </div>

                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 rounded text-[10px] font-medium">
                            {lead.origem}
                          </span>
                        </div>

                        {/* Independent Status Badges */}
                        <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-slate-100">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium border ${contactBadge.bg} ${contactBadge.text} ${contactBadge.border}`}>
                            {lead.contacto}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium border ${photoBadge.bg} ${photoBadge.text} ${photoBadge.border}`}>
                            {lead.fotos}
                          </span>
                        </div>

                        {/* Action Buttons Row with Registar Chamada */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-slate-400">
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openCallModal(lead.id);
                              }}
                              className="flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold transition"
                              title="Registar chamada com esta lead (não faz ligação)"
                            >
                              <PhoneCall className="w-3.5 h-3.5 text-blue-600" />
                              <span>Registar Chamada</span>
                            </button>

                            <button
                              onClick={(e) => handleQuickAddNote(e, lead.id)}
                              className="flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition"
                              title="Adicionar nota geral"
                            >
                              <MessageSquarePlus className="w-3.5 h-3.5" />
                              <span className="font-medium">+ Nota</span>
                            </button>
                          </div>

                          <div className="flex items-center space-x-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setPreselectedVisitLeadId(lead.id);
                                setIsVisitFormOpen(true);
                              }}
                              className="p-1 rounded hover:text-blue-600 hover:bg-blue-50 transition"
                              title="Marcar Visita"
                            >
                              <Calendar className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingLead(lead);
                                setIsLeadFormOpen(true);
                              }}
                              className="p-1 rounded hover:text-slate-700 hover:bg-slate-100 transition"
                              title="Editar Lead"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                requestDeleteLead(lead.id);
                              }}
                              className="p-1 rounded hover:text-red-600 hover:bg-red-50 transition"
                              title="Eliminar Lead"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                      </div>
                    );
                  })
                )}
              </div>

            </div>
          );
        })}

      </div>
    </div>
  );
};
