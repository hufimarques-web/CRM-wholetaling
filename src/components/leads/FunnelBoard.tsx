import React, { useState, useRef } from 'react';
import { PhoneCall, Edit, Trash2, Calendar, MapPin, Sparkles, Building, ChevronLeft, ChevronRight, ArrowRightLeft } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { Lead, LeadPhase } from '../../types/crm';
import { formatCurrency, getContactStatusBadge, getUserTheme } from '../../utils/formatters';

const FUNNEL_PHASES: { id: LeadPhase; label: string }[] = [
  { id: 'Nova lead', label: 'NOVA LEAD' },
  { id: 'Em análise', label: 'EM ANÁLISE' },
  { id: 'Pronta para proposta', label: 'PRONTA P/ PROPOSTA' },
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
    openCallModal,
    openAIAnalysis,
    currentUser
  } = useCRM();

  // Drag and Drop of Cards
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<LeadPhase | null>(null);
  const [wasCardDragged, setWasCardDragged] = useState(false);

  // Horizontal Drag-to-Scroll State
  const boardContainerRef = useRef<HTMLDivElement>(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftPos, setScrollLeftPos] = useState(0);

  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    setDraggedLeadId(leadId);
    setWasCardDragged(true);
    e.dataTransfer.setData('text/plain', leadId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedLeadId(null);
    setTimeout(() => setWasCardDragged(false), 150);
  };

  const handleDragOver = (e: React.DragEvent, phase: LeadPhase) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== phase) {
      setDragOverColumn(phase);
    }
  };

  const handleDragLeave = () => {
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
    setTimeout(() => setWasCardDragged(false), 150);
  };

  // Horizontal Mouse Drag Scrolling
  const handleBoardMouseDown = (e: React.MouseEvent) => {
    // Only drag scroll if clicked outside interactive cards/buttons
    if ((e.target as HTMLElement).closest('[data-lead-card]')) return;
    setIsMouseDown(true);
    setStartX(e.pageX - (boardContainerRef.current?.offsetLeft || 0));
    setScrollLeftPos(boardContainerRef.current?.scrollLeft || 0);
  };

  const handleBoardMouseLeave = () => {
    setIsMouseDown(false);
  };

  const handleBoardMouseUp = () => {
    setIsMouseDown(false);
  };

  const handleBoardMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown || !boardContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - (boardContainerRef.current.offsetLeft || 0);
    const walk = (x - startX) * 1.5;
    boardContainerRef.current.scrollLeft = scrollLeftPos - walk;
  };

  const scrollByAmount = (offset: number) => {
    if (boardContainerRef.current) {
      boardContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-2">
      {/* Horizontal Scroll Bar Indicator & Controls */}
      <div className="flex items-center justify-between px-1 py-1 text-xs text-stone-500">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-stone-600 flex items-center gap-1">
            <ArrowRightLeft className="w-3.5 h-3.5 text-amber-600" />
            <span>Arraste os cartões ou o quadro para o lado</span>
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => scrollByAmount(-320)}
            className="p-1.5 rounded-lg bg-white hover:bg-stone-100 text-stone-600 border border-stone-200 shadow-2xs transition flex items-center gap-1 text-[10px] font-bold"
            title="Deslizar para a esquerda"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Esquerda</span>
          </button>
          <button
            onClick={() => scrollByAmount(320)}
            className="p-1.5 rounded-lg bg-white hover:bg-stone-100 text-stone-600 border border-stone-200 shadow-2xs transition flex items-center gap-1 text-[10px] font-bold"
            title="Deslizar para a direita"
          >
            <span>Direita</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Drag-to-Scroll Horizontal Container */}
      <div
        ref={boardContainerRef}
        onMouseDown={handleBoardMouseDown}
        onMouseLeave={handleBoardMouseLeave}
        onMouseUp={handleBoardMouseUp}
        onMouseMove={handleBoardMouseMove}
        className={`flex-1 overflow-x-auto pb-4 select-none cursor-default ${
          isMouseDown ? 'cursor-grabbing' : ''
        }`}
      >
        <div className="grid grid-cols-5 gap-4 min-w-[1250px] h-full items-start">
          
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
                className={`flex flex-col bg-[#EFECE6] rounded-2xl border transition-all duration-200 min-h-[550px] ${
                  isOver ? 'border-amber-500 bg-[#F5F2EB] shadow-md ring-2 ring-amber-400/30' : 'border-[#E2DDD3]'
                }`}
              >
                
                {/* Column Header */}
                <div className="p-3.5 border-b border-[#E2DDD3] bg-[#EAE6DE] rounded-t-2xl shrink-0 flex items-center justify-between">
                  <div>
                    <h3 className="text-[11px] font-black text-stone-800 tracking-wider">
                      {phase.label}
                    </h3>
                    <span className="text-[10px] text-stone-500 font-bold block">
                      {formatCurrency(colSum)}
                    </span>
                  </div>
                  <span className="w-5 h-5 rounded-full bg-white text-stone-700 text-[10px] font-black flex items-center justify-center shadow-2xs border border-stone-200">
                    {colLeads.length}
                  </span>
                </div>

                {/* Cards List Container */}
                <div className="p-3 space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-280px)]">
                  {colLeads.length === 0 ? (
                    <div className="h-32 flex items-center justify-center text-center p-4 border-2 border-dashed border-stone-300/80 rounded-xl text-stone-400 text-xs">
                      Arraste uma lead para aqui
                    </div>
                  ) : (
                    colLeads.map(lead => {
                      const contactBadge = getContactStatusBadge(lead.contacto);
                      const userTheme = getUserTheme(lead.assignedTo || 'Queirós');

                      return (
                        <div
                          key={lead.id}
                          data-lead-card="true"
                          draggable
                          onDragStart={(e) => handleDragStart(e, lead.id)}
                          onDragEnd={handleDragEnd}
                          onClick={() => {
                            if (!wasCardDragged) {
                              setSelectedLeadForDrawer(lead);
                            }
                          }}
                          className={`group bg-white rounded-xl p-3.5 border border-stone-200 shadow-2xs hover:shadow-md hover:border-amber-400 transition-all cursor-grab active:cursor-grabbing space-y-2 relative ${
                            draggedLeadId === lead.id ? 'opacity-40 border-dashed border-amber-500' : ''
                          }`}
                        >
                          
                          {/* Top Line: Owner Name & User Avatar Tag */}
                          <div className="flex items-center justify-between gap-1">
                            <div className="flex items-center space-x-2 min-w-0">
                              <span className={`w-2 h-2 rounded-full shrink-0 ${contactBadge.dot}`} />
                              <h4 className="text-xs font-black text-stone-900 truncate group-hover:text-amber-800 transition">
                                {lead.nomeProprietario}
                              </h4>
                            </div>

                            {/* Responsible User Pill */}
                            <span
                              title={`Responsável: ${userTheme.name}`}
                              className={`w-5 h-5 rounded-md text-[10px] font-black flex items-center justify-center shrink-0 ${userTheme.avatarBg} shadow-2xs`}
                            >
                              {userTheme.initial}
                            </span>
                          </div>

                          {/* Location & Property Type Line */}
                          <div className="flex items-center justify-between text-[11px] text-stone-500">
                            <span className="flex items-center gap-1 truncate font-semibold text-stone-700">
                              <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                              {lead.freguesia}
                            </span>
                            <span className="text-[10px] font-medium text-stone-400 shrink-0">
                              {lead.tipoImovel} {lead.areaM2 ? `• ${lead.areaM2}m²` : ''}
                            </span>
                          </div>

                          {/* Real Clean Property Info (No fake automated market study) */}
                          <div className="flex items-center justify-between text-[10px] bg-[#FAF8F5] px-2 py-1 rounded-lg border border-stone-100">
                            <span className="text-stone-500 font-medium truncate max-w-[120px]">
                              {lead.estadoImovel}
                            </span>
                            {lead.precoM2 && (
                              <span className="font-bold text-stone-700 shrink-0">
                                {lead.precoM2} €/m²
                              </span>
                            )}
                          </div>

                          {/* Values Line (Price & Margin) */}
                          <div className="flex items-center justify-between pt-1 border-t border-stone-100 text-xs">
                            <div>
                              <span className="text-[9px] uppercase font-bold text-stone-400 block leading-none">Mínimo</span>
                              <span className="font-extrabold text-stone-900 text-xs">
                                {formatCurrency(lead.valorMinimoAbsoluto)}
                              </span>
                            </div>

                            <div className="text-right">
                              <span className="text-[9px] uppercase font-bold text-stone-400 block leading-none">Margem</span>
                              <span className="font-extrabold text-emerald-600 text-xs">
                                {formatCurrency(lead.margemPotencial)}
                              </span>
                            </div>
                          </div>

                          {/* Action Buttons Row */}
                          <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-stone-400">
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openCallModal(lead.id);
                                }}
                                className="px-2 py-0.5 rounded-md text-[10px] bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold transition flex items-center gap-1"
                                title="Registar Chamada"
                              >
                                <PhoneCall className="w-3 h-3 text-stone-500" />
                                <span>Ligar</span>
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openAIAnalysis(lead);
                                }}
                                className="p-1 rounded-md text-amber-700 hover:bg-amber-50 transition"
                                title="Análise AI Deal"
                              >
                                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                              </button>
                            </div>

                            <div className="flex items-center space-x-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPreselectedVisitLeadId(lead.id);
                                  setIsVisitFormOpen(true);
                                }}
                                className="p-1 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
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
                                className="p-1 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
                                title="Editar Lead (100% editável)"
                              >
                                <Edit className="w-3.5 h-3.5" />
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
    </div>
  );
};
