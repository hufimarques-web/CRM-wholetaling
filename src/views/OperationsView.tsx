import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  Calendar,
  DollarSign,
  User,
  ArrowRight,
  ChevronRight,
  FileCheck,
  MapPin,
  Edit,
  TrendingUp,
  Download,
  StickyNote,
  Plus,
  Send,
  Share2,
  GripVertical
} from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { DealOperation, OperationStage, AppUser, DocumentChecklist } from '../types/crm';
import { formatCurrency, formatDatePT, formatDateTimePT, getUserTheme } from '../utils/formatters';

// 3 STREAMLINED LEAN STAGES (Oriented, minimal fields)
const STAGES: { id: OperationStage; label: string; description: string; stepNumber: number }[] = [
  {
    id: 'Validacao_Facebook',
    stepNumber: 1,
    label: '1. VALIDAÇÃO DE INTERESSE',
    description: 'Teste de tração e interesse no Facebook antes de avançar'
  },
  {
    id: 'CPCV_Assinado',
    stepNumber: 2,
    label: '2. CPCV ASSINADO & SINAL',
    description: 'CPCV assinado, sinal de 10% pago e prazo de escritura'
  },
  {
    id: 'Venda_Fechada',
    stepNumber: 3,
    label: '3. VENDA / CESSÃO FECHADA',
    description: 'Cessão de posição ou escritura concluída com lucro liquidado'
  }
];

export const OperationsView: React.FC = () => {
  const {
    operations,
    updateOperation,
    updateOperationStage,
    toggleChecklistDoc,
    addOperationNote,
    currentUser
  } = useCRM();

  const [responsavelFilter, setResponsavelFilter] = useState<'Todos' | AppUser>('Todos');
  const [selectedOperationForModal, setSelectedOperationForModal] = useState<DealOperation | null>(null);

  // Per-card quick note inputs
  const [noteInputs, setNoteInputs] = useState<Record<string, string>>({});

  // Drag and drop between operational stages
  const [draggedOpId, setDraggedOpId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<OperationStage | null>(null);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [compradorNome, setCompradorNome] = useState('');
  const [compradorTelefone, setCompradorTelefone] = useState('');
  const [valorVendaRealizado, setValorVendaRealizado] = useState<string>('');
  const [dataAssinaturaCPCV, setDataAssinaturaCPCV] = useState('');
  const [dataLimiteEscritura, setDataLimiteEscritura] = useState('');
  const [notasOperacao, setNotasOperacao] = useState('');

  const filteredOperations = operations.filter(o => {
    if (responsavelFilter !== 'Todos' && o.responsavel !== responsavelFilter) return false;
    return true;
  });

  // KPI Metrics
  const totalOperations = operations.length;
  const sinaisTotaisPagos = operations.reduce((acc, curr) => acc + (curr.valorSinalPago || 0), 0);
  const margemTotalProjetada = operations.reduce((acc, curr) => acc + (curr.margemPrevista || 0), 0);
  const vendasFechadas = operations.filter(o => o.fase === 'Venda_Fechada');
  const lucroTotalRealizado = vendasFechadas.reduce((acc, curr) => acc + (curr.lucroRealizado || curr.margemPrevista || 0), 0);

  const handleOpenEditModal = (op: DealOperation) => {
    setSelectedOperationForModal(op);
    setCompradorNome(op.compradorNome || '');
    setCompradorTelefone(op.compradorTelefone || '');
    setValorVendaRealizado(op.valorVendaRealizado ? String(op.valorVendaRealizado) : String(op.valorRevendaAlvo));
    setDataAssinaturaCPCV(op.dataAssinaturaCPCV || '');
    setDataLimiteEscritura(op.dataLimiteEscritura || '');
    setNotasOperacao(op.notas || '');
    setIsEditModalOpen(true);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOperationForModal) return;

    const numVenda = Number(valorVendaRealizado) || selectedOperationForModal.valorRevendaAlvo;
    const lucro = numVenda - selectedOperationForModal.valorCompraAcordado;

    updateOperation({
      ...selectedOperationForModal,
      compradorNome: compradorNome.trim() || undefined,
      compradorTelefone: compradorTelefone.trim() || undefined,
      valorVendaRealizado: numVenda,
      lucroRealizado: lucro,
      dataAssinaturaCPCV: dataAssinaturaCPCV || undefined,
      dataLimiteEscritura: dataLimiteEscritura || undefined,
      notas: notasOperacao.trim() || undefined
    });

    setIsEditModalOpen(false);
    setSelectedOperationForModal(null);
  };

  const handleAddCardNote = (opId: string) => {
    const text = noteInputs[opId];
    if (text && text.trim()) {
      addOperationNote(opId, text.trim());
      setNoteInputs(prev => ({ ...prev, [opId]: '' }));
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner (Architectural Obsidian Black) */}
      <div className="bg-[#141518] text-white p-6 border border-stone-800 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase font-black tracking-widest text-amber-500">Módulo Operacional</span>
            <span className="text-stone-600">•</span>
            <span className="text-xs text-stone-300">Validação Facebook • CPCV • Venda</span>
          </div>
          <h2 className="text-xl font-black tracking-tight text-white">Controlo de Operações & CPCV</h2>
          <p className="text-xs text-stone-400 mt-0.5">
            Fluxo simplificado pós-aceitação: teste de interesse no Facebook, assinatura de CPCV com sinal e fecho de venda com lucro líquido.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Filter by User */}
          <div className="flex items-center bg-[#1E2024] p-1 border border-stone-800 rounded-xl">
            <button
              onClick={() => setResponsavelFilter('Todos')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                responsavelFilter === 'Todos' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-400 hover:text-white'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setResponsavelFilter('Queirós')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                responsavelFilter === 'Queirós' ? 'bg-emerald-600 text-white shadow-xs' : 'text-stone-400 hover:text-white'
              }`}
            >
              Queirós
            </button>
            <button
              onClick={() => setResponsavelFilter('Hugo')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                responsavelFilter === 'Hugo' ? 'bg-amber-600 text-white shadow-xs' : 'text-stone-400 hover:text-white'
              }`}
            >
              Hugo
            </button>
          </div>
        </div>
      </div>

      {/* 4 Clean Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 border border-stone-300 shadow-xs">
          <span className="text-[10px] font-black uppercase tracking-wider text-stone-400 block">Deals Pós-Aceitação</span>
          <span className="text-2xl font-black text-stone-900 mt-1 block">{totalOperations}</span>
          <span className="text-[10px] text-stone-500 font-semibold">{vendasFechadas.length} vendas concluídas</span>
        </div>

        <div className="bg-white p-4 border border-stone-300 shadow-xs">
          <span className="text-[10px] font-black uppercase tracking-wider text-stone-400 block">Sinais Totais (10%)</span>
          <span className="text-xl font-black text-amber-800 mt-1 block">{formatCurrency(sinaisTotaisPagos)}</span>
          <span className="text-[10px] text-stone-500 font-semibold">Sinal entregue no CPCV</span>
        </div>

        <div className="bg-white p-4 border border-stone-300 shadow-xs">
          <span className="text-[10px] font-black uppercase tracking-wider text-stone-400 block">Margem Projetada</span>
          <span className="text-xl font-black text-emerald-700 mt-1 block">{formatCurrency(margemTotalProjetada)}</span>
          <span className="text-[10px] text-stone-500 font-semibold">Spread total previsto</span>
        </div>

        <div className="bg-white p-4 border border-stone-300 shadow-xs bg-emerald-950 text-white">
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300 block">Lucro Realizado Fechado</span>
          <span className="text-xl font-black text-emerald-400 mt-1 block">{formatCurrency(lucroTotalRealizado)}</span>
          <span className="text-[10px] text-emerald-200 font-bold">Liquidado em escritura</span>
        </div>
      </div>

      {/* 3 Lean Pipeline Columns: Validação Facebook -> CPCV Assinado -> Venda Fechada */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {STAGES.map((stage, sIdx) => {
          const stageOps = filteredOperations.filter(o => o.fase === stage.id);
          const totalStageSinais = stageOps.reduce((acc, curr) => acc + (curr.valorSinalPago || 0), 0);

          return (
            <div
              key={stage.id}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                if (dragOverStage !== stage.id) setDragOverStage(stage.id);
              }}
              onDragLeave={(e) => {
                if (e.currentTarget.contains(e.relatedTarget as Node)) return;
                setDragOverStage(null);
              }}
              onDrop={(e) => {
                e.preventDefault();
                const opId = e.dataTransfer.getData('text/plain') || draggedOpId;
                if (opId && opId !== '') {
                  updateOperationStage(opId, stage.id);
                }
                setDraggedOpId(null);
                setDragOverStage(null);
              }}
              className={`flex flex-col border min-h-[580px] transition-all duration-200 rounded-xl overflow-hidden ${
                dragOverStage === stage.id
                  ? 'bg-amber-50/80 border-amber-500 ring-2 ring-amber-400 shadow-md'
                  : 'bg-[#EFECE6] border-[#E2DDD3]'
              }`}
            >
              
              {/* Column Header */}
              <div className="p-4 border-b border-[#E2DDD3] bg-[#EAE6DE] flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-stone-900 text-white text-[10px] font-black flex items-center justify-center font-display">
                      {stage.stepNumber}
                    </span>
                    <h3 className="text-xs font-black text-stone-900 tracking-wider font-display">
                      {stage.label}
                    </h3>
                  </div>
                  <span className="w-6 h-6 bg-white text-stone-800 text-xs font-black flex items-center justify-center border border-stone-300 rounded-md shadow-2xs font-display">
                    {stageOps.length}
                  </span>
                </div>
                <p className="text-[10px] text-stone-500 mt-1 leading-tight">{stage.description}</p>
              </div>

              {/* Operations Cards Container */}
              <div className="p-3 space-y-3.5 flex-1 overflow-y-auto max-h-[calc(100vh-260px)]">
                {stageOps.length === 0 ? (
                  <div className="h-36 flex items-center justify-center text-center p-4 border border-dashed border-stone-300 text-stone-400 text-xs rounded-xl">
                    Nenhum deal nesta fase (arraste um deal para aqui)
                  </div>
                ) : (
                  stageOps.map(op => {
                    const userTheme = getUserTheme(op.responsavel);

                    return (
                      <div
                        key={op.id}
                        draggable={true}
                        onDragStart={(e) => {
                          setDraggedOpId(op.id);
                          e.dataTransfer.setData('text/plain', op.id);
                          e.dataTransfer.effectAllowed = 'move';
                        }}
                        onDragEnd={() => {
                          setDraggedOpId(null);
                          setDragOverStage(null);
                        }}
                        className={`bg-white p-4 border rounded-xl shadow-2xs space-y-3 relative transition-all duration-150 cursor-grab active:cursor-grabbing ${
                          draggedOpId === op.id
                            ? 'opacity-40 scale-[0.98] border-dashed border-amber-500 bg-amber-50/40 ring-2 ring-amber-400'
                            : 'border-stone-200 hover:border-amber-400 hover:shadow-sm'
                        }`}
                      >
                        
                        {/* Card Top: Grip handle, Title & Responsible User Badge */}
                        <div className="flex items-start justify-between gap-1 border-b border-stone-100 pb-2.5">
                          <div className="flex items-start gap-1.5 min-w-0">
                            <span title="Arrastar deal para outra etapa">
                              <GripVertical className="w-4 h-4 text-stone-300 hover:text-stone-600 cursor-grab shrink-0 mt-0.5" />
                            </span>
                            <div className="min-w-0">
                              <h4 className="text-xs font-black text-stone-900 leading-tight font-display truncate">
                                {op.nomeProprietario}
                              </h4>
                              <span className="text-[11px] text-stone-500 flex items-center gap-1 mt-0.5 font-semibold truncate">
                                <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                                {op.freguesia} • {op.tipoImovel} {op.areaM2 ? `(${op.areaM2}m²)` : ''}
                              </span>
                            </div>
                          </div>

                          <span className={`w-6 h-6 text-[10px] font-black flex items-center justify-center ${userTheme.avatarBg} rounded-md shadow-2xs shrink-0 font-display`} title={`Responsável: ${userTheme.name}`}>
                            {userTheme.initial}
                          </span>
                        </div>

                        {/* Financial terms breakdown */}
                        <div className="grid grid-cols-2 gap-2 bg-[#FAF8F5] p-2.5 text-xs border border-stone-200/80">
                          <div>
                            <span className="text-[9px] uppercase font-bold text-stone-400 block">Compra</span>
                            <span className="font-extrabold text-stone-900">{formatCurrency(op.valorCompraAcordado)}</span>
                          </div>
                          <div>
                            <span className="text-[9px] uppercase font-bold text-stone-400 block">Sinal 10%</span>
                            <span className="font-extrabold text-amber-800">{formatCurrency(op.valorSinalPago)}</span>
                          </div>
                          <div>
                            <span className="text-[9px] uppercase font-bold text-stone-400 block">Revenda Alvo</span>
                            <span className="font-extrabold text-stone-800">{formatCurrency(op.valorRevendaAlvo)}</span>
                          </div>
                          <div>
                            <span className="text-[9px] uppercase font-bold text-stone-400 block">Margem</span>
                            <span className="font-black text-emerald-600">{formatCurrency(op.margemPrevista)}</span>
                          </div>
                        </div>

                        {/* Lean Validation Checklist (Focus on Facebook Interest, Buyer & CPCV) */}
                        <div className="space-y-1.5 pt-1">
                          <div className="flex items-center justify-between text-[10px] font-bold text-stone-700">
                            <span className="flex items-center gap-1">
                              <Share2 className="w-3 h-3 text-amber-600" />
                              Validação Facebook & Acordo:
                            </span>
                          </div>

                          <div className="space-y-1.5 text-[10px] bg-stone-50 p-2.5 border border-stone-200">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={!!op.checklist.anuncioCriadoFacebook}
                                onChange={() => toggleChecklistDoc(op.id, 'anuncioCriadoFacebook')}
                                className="w-3.5 h-3.5 text-amber-600 rounded"
                              />
                              <span className={op.checklist.anuncioCriadoFacebook ? 'line-through text-stone-400' : 'text-stone-800 font-medium'}>
                                Anúncio publicado no Facebook
                              </span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={!!op.checklist.leadsInteresseRecebidas}
                                onChange={() => toggleChecklistDoc(op.id, 'leadsInteresseRecebidas')}
                                className="w-3.5 h-3.5 text-amber-600 rounded"
                              />
                              <span className={op.checklist.leadsInteresseRecebidas ? 'line-through text-stone-400' : 'text-stone-800 font-medium'}>
                                Mensagens / Pedidos de contacto recebidos
                              </span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={!!op.checklist.compradorIdentificado}
                                onChange={() => toggleChecklistDoc(op.id, 'compradorIdentificado')}
                                className="w-3.5 h-3.5 text-amber-600 rounded"
                              />
                              <span className={op.checklist.compradorIdentificado ? 'line-through text-stone-400' : 'text-stone-800 font-medium'}>
                                Investidor / Comprador qualificado
                              </span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={!!op.checklist.sinalPago10}
                                onChange={() => toggleChecklistDoc(op.id, 'sinalPago10')}
                                className="w-3.5 h-3.5 text-amber-600 rounded"
                              />
                              <span className={op.checklist.sinalPago10 ? 'line-through text-stone-400' : 'text-stone-800 font-medium'}>
                                Sinal de 10% entregue no CPCV
                              </span>
                            </label>
                          </div>
                        </div>

                        {/* REQUIREMENT: INTERACTIVE OPERATIONAL NOTES SECTION */}
                        <div className="pt-2 border-t border-stone-200 space-y-2">
                          <div className="flex items-center justify-between text-[10px] font-bold text-stone-700">
                            <span className="flex items-center gap-1">
                              <StickyNote className="w-3 h-3 text-amber-600" />
                              Notas da Operação ({op.historicoNotas?.length || 0}):
                            </span>
                          </div>

                          {/* Notes list */}
                          {op.historicoNotas && op.historicoNotas.length > 0 ? (
                            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                              {op.historicoNotas.map(n => {
                                const noteTheme = getUserTheme(n.author);
                                return (
                                  <div key={n.id} className="p-2 bg-[#FAF8F5] border border-stone-200 text-[10px] space-y-0.5">
                                    <div className="flex items-center justify-between text-stone-400">
                                      <span className="font-bold text-stone-800 flex items-center gap-1">
                                        <span className={`w-3.5 h-3.5 rounded text-[8px] flex items-center justify-center font-black ${noteTheme.avatarBg}`}>
                                          {noteTheme.initial}
                                        </span>
                                        {n.author}
                                      </span>
                                      <span className="text-[9px]">{formatDateTimePT(n.date)}</span>
                                    </div>
                                    <p className="text-stone-700 leading-tight pt-0.5">{n.text}</p>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-[10px] text-stone-400 italic">Sem notas registadas nesta operação.</p>
                          )}

                          {/* Quick note input on card */}
                          <div className="flex gap-1 pt-1">
                            <input
                              type="text"
                              placeholder={`Adicionar nota por ${currentUser}...`}
                              value={noteInputs[op.id] || ''}
                              onChange={(e) => setNoteInputs(prev => ({ ...prev, [op.id]: e.target.value }))}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddCardNote(op.id);
                                }
                              }}
                              className="flex-1 px-2.5 py-1 bg-white border border-stone-300 text-[11px] focus:outline-none focus:ring-1 focus:ring-amber-500 rounded-lg"
                            />
                            <button
                              onClick={() => handleAddCardNote(op.id)}
                              className="px-2.5 py-1 bg-stone-900 hover:bg-black text-white text-[10px] font-bold rounded-lg transition flex items-center gap-1 shrink-0"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Gravar</span>
                            </button>
                          </div>
                        </div>

                        {/* Dates / Deadlines / Buyer Info */}
                        <div className="text-[10px] text-stone-500 space-y-0.5 pt-1">
                          {op.dataAssinaturaCPCV && (
                            <p className="flex items-center gap-1 font-semibold text-stone-700">
                              <Clock className="w-3 h-3 text-emerald-600" />
                              CPCV Assinado: <strong>{formatDatePT(op.dataAssinaturaCPCV)}</strong>
                            </p>
                          )}
                          {op.dataLimiteEscritura && (
                            <p className="flex items-center gap-1 font-bold text-amber-800">
                              <Calendar className="w-3 h-3 text-amber-600" />
                              Limite Escritura: {formatDatePT(op.dataLimiteEscritura)}
                            </p>
                          )}
                          {op.compradorNome && (
                            <p className="text-emerald-700 font-bold">
                              Comprador: {op.compradorNome} {op.compradorTelefone ? `(${op.compradorTelefone})` : ''}
                            </p>
                          )}
                          {op.lucroRealizado && (
                            <p className="text-emerald-700 font-black text-[11px] pt-1 border-t border-emerald-100">
                              Lucro Realizado: {formatCurrency(op.lucroRealizado)}
                            </p>
                          )}
                        </div>

                        {/* Stage Progression & Edit */}
                        <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                          <button
                            onClick={() => handleOpenEditModal(op)}
                            className="text-[10px] font-bold text-stone-600 hover:text-stone-900 underline flex items-center gap-1"
                          >
                            <Edit className="w-3 h-3" />
                            <span>Editar Detalhes</span>
                          </button>

                          {/* Stage progression button */}
                          {stage.id === 'Validacao_Facebook' && (
                            <button
                              onClick={() => updateOperationStage(op.id, 'CPCV_Assinado')}
                              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold rounded-lg transition flex items-center gap-1"
                            >
                              <span>Avançar p/ CPCV</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          )}

                          {stage.id === 'CPCV_Assinado' && (
                            <button
                              onClick={() => updateOperationStage(op.id, 'Venda_Fechada')}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-lg transition flex items-center gap-1"
                            >
                              <span>Concluir Venda</span>
                              <CheckCircle2 className="w-3 h-3" />
                            </button>
                          )}

                          {stage.id === 'Venda_Fechada' && (
                            <span className="text-[10px] font-black text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Fechado!
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                {dragOverStage === stage.id && (
                  <div className="p-3.5 border-2 border-dashed border-amber-500 bg-amber-100/60 text-amber-900 text-xs font-bold text-center rounded-xl animate-pulse flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-600" />
                    <span>Largar para mover para {stage.label}</span>
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* EDIT OPERATION MODAL */}
      {isEditModalOpen && selectedOperationForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white border border-stone-300 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div>
                <h3 className="font-extrabold text-sm text-stone-900">
                  Editar Operação: {selectedOperationForModal.nomeProprietario}
                </h3>
                <p className="text-[11px] text-stone-500">
                  {selectedOperationForModal.freguesia} • Compra: {formatCurrency(selectedOperationForModal.valorCompraAcordado)}
                </p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-stone-400 hover:text-stone-800 font-bold text-base"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-3 text-xs text-stone-800">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Data Assinatura CPCV</label>
                  <input
                    type="date"
                    value={dataAssinaturaCPCV}
                    onChange={e => setDataAssinaturaCPCV(e.target.value)}
                    className="w-full px-3 py-1.5 border border-stone-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Data Limite de Escritura</label>
                  <input
                    type="date"
                    value={dataLimiteEscritura}
                    onChange={e => setDataLimiteEscritura(e.target.value)}
                    className="w-full px-3 py-1.5 border border-stone-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Nome do Investidor / Comprador</label>
                  <input
                    type="text"
                    value={compradorNome}
                    onChange={e => setCompradorNome(e.target.value)}
                    placeholder="Ex: Pedro Alentejano Investimentos"
                    className="w-full px-3 py-1.5 border border-stone-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Contacto do Comprador</label>
                  <input
                    type="text"
                    value={compradorTelefone}
                    onChange={e => setCompradorTelefone(e.target.value)}
                    placeholder="Ex: +351 910 000 000"
                    className="w-full px-3 py-1.5 border border-stone-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Valor de Venda Final / Saída (€)</label>
                <input
                  type="number"
                  value={valorVendaRealizado}
                  onChange={e => setValorVendaRealizado(e.target.value)}
                  placeholder="Ex: 235000"
                  className="w-full px-3 py-1.5 border border-stone-300 rounded-lg text-xs font-bold text-emerald-700"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Notas Gerais da Transação</label>
                <textarea
                  value={notasOperacao}
                  onChange={e => setNotasOperacao(e.target.value)}
                  rows={2}
                  placeholder="Informações adicionais sobre o CPCV, prazos ou advogado..."
                  className="w-full px-3 py-1.5 border border-stone-300 rounded-lg text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-stone-300 rounded-lg text-stone-600 hover:bg-stone-50 font-semibold text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-stone-900 hover:bg-black text-white rounded-lg font-bold text-xs shadow-xs"
                >
                  Guardar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
