import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Phone,
  MessageSquare,
  Building,
  User,
  CheckCircle2,
  Calendar,
  DollarSign,
  ArrowRight,
  Archive,
  ChevronRight,
  TrendingUp,
  Percent,
  Sparkles,
  Eye,
  Edit3,
  MapPin
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { MediationBuyer, MediationBuyerStage, Lead } from '../../types/crm';
import { formatCurrency, formatDatePT, getMediationBuyerStageBadge } from '../../utils/formatters';

const BUYER_STAGES: { id: MediationBuyerStage; label: string; description: string; dot: string }[] = [
  { id: 'Interessado', label: 'Interessados', description: 'Contactos iniciais e pedidos de informação', dot: 'bg-blue-500' },
  { id: 'Visita', label: 'Visita (Marcada/Feita)', description: 'Visitas agendadas ou já realizadas', dot: 'bg-amber-500' },
  { id: 'Proposta', label: 'Proposta / Negociação', description: 'Oferta em cima da mesa para o proprietário', dot: 'bg-indigo-500' },
  { id: 'Fechado', label: 'Fechado (Vendido)', description: 'Acordo alcançado, CPCV / Escritura', dot: 'bg-emerald-500' },
  { id: 'Descartado', label: 'Descartado', description: 'Sem interesse ou proposta recusada', dot: 'bg-stone-400' }
];

export const PropertyMediationCRMModal: React.FC = () => {
  const {
    selectedPropertyForMediation,
    setSelectedPropertyForMediation,
    setSelectedLeadForDrawer,
    setEditingLead,
    setIsLeadFormOpen,
    addMediationBuyer,
    updateMediationBuyerStage,
    deleteMediationBuyer,
    leads
  } = useCRM();

  // Fresh property data from leads array
  const currentLead: Lead | null = selectedPropertyForMediation
    ? leads.find(l => l.id === selectedPropertyForMediation.id) || selectedPropertyForMediation
    : null;

  // New buyer form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [buyerNome, setBuyerNome] = useState('');
  const [buyerTelefone, setBuyerTelefone] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerOferta, setBuyerOferta] = useState('');
  const [buyerFase, setBuyerFase] = useState<MediationBuyerStage>('Interessado');
  const [buyerNotas, setBuyerNotas] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Drag and drop state
  const [draggedBuyerId, setDraggedBuyerId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<MediationBuyerStage | null>(null);

  if (!currentLead) return null;

  const buyers = currentLead.buyers || [];
  const precoVenda = currentLead.mediacaoPrecoVenda || currentLead.valorMinimoAbsoluto || 0;
  const comissaoPercent = currentLead.mediacaoComissaoPercent ?? 2.8;
  const comissaoPrevista = Math.round(precoVenda * (comissaoPercent / 100));

  const handleCreateBuyer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerNome.trim()) return;

    setIsSubmitting(true);
    try {
      await addMediationBuyer({
        leadId: currentLead.id,
        nome: buyerNome.trim(),
        telefone: buyerTelefone.trim(),
        email: buyerEmail.trim() || undefined,
        fase: buyerFase,
        valorOferta: buyerOferta ? Number(buyerOferta.replace(/[^0-9.]/g, '')) : undefined,
        notas: buyerNotas.trim() || undefined,
        dataContato: new Date().toISOString().split('T')[0]
      });

      setBuyerNome('');
      setBuyerTelefone('');
      setBuyerEmail('');
      setBuyerOferta('');
      setBuyerNotas('');
      setBuyerFase('Interessado');
      setShowAddForm(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, buyerId: string) => {
    e.dataTransfer.setData('text/plain', buyerId);
    setDraggedBuyerId(buyerId);
  };

  const handleDragOver = (e: React.DragEvent, stage: MediationBuyerStage) => {
    e.preventDefault();
    setDragOverStage(stage);
  };

  const handleDrop = (e: React.DragEvent, stage: MediationBuyerStage) => {
    e.preventDefault();
    const buyerId = e.dataTransfer.getData('text/plain') || draggedBuyerId;
    if (buyerId && currentLead) {
      updateMediationBuyerStage(buyerId, currentLead.id, stage);
    }
    setDraggedBuyerId(null);
    setDragOverStage(null);
  };

  const handleDeleteBuyer = (buyer: MediationBuyer) => {
    if (window.confirm(`Tem a certeza que deseja eliminar o interessado "${buyer.nome}"?`)) {
      deleteMediationBuyer(buyer.id, currentLead.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-6 bg-stone-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-6xl bg-[#F7F5F0] rounded-2xl shadow-2xl border border-stone-300 flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header Imóvel */}
        <div className="bg-[#141518] text-white px-6 py-4 border-b border-stone-800 flex items-start justify-between shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                Mediação Ativa
              </span>
              <h2
                onClick={() => setSelectedLeadForDrawer(currentLead)}
                className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2 cursor-pointer hover:text-emerald-400 transition"
                title="Clica para abrir a ficha completa do imóvel"
              >
                <Building className="w-5 h-5 text-amber-500" />
                <span>{currentLead.tipoImovel} em {currentLead.freguesia}</span>
              </h2>
              {currentLead.areaM2 && (
                <span className="text-stone-400 text-xs font-semibold">({currentLead.areaM2} m²)</span>
              )}
            </div>

            <div className="flex items-center gap-4 text-xs text-stone-300 pt-1 flex-wrap">
              <span className="flex items-center gap-1.5 text-stone-300">
                <User className="w-3.5 h-3.5 text-amber-500" />
                Proprietário: <strong className="text-white font-bold">{currentLead.nomeProprietario}</strong>
                {currentLead.telefone && (
                  <a
                    href={`tel:${currentLead.telefone}`}
                    className="text-amber-400 hover:underline font-mono text-[11px] ml-1 flex items-center gap-1"
                  >
                    <Phone className="w-3 h-3" />
                    {currentLead.telefone}
                  </a>
                )}
              </span>

              <span className="flex items-center gap-1 text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/80">
                Preço Venda: {formatCurrency(precoVenda)}
              </span>

              <span className="flex items-center gap-1 text-amber-300 font-bold bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/80">
                Comissão {comissaoPercent}% (IVA incl.): {formatCurrency(comissaoPrevista)}
              </span>

              <span className="text-[11px] text-stone-400">
                Responsável: <strong className="text-stone-200">{currentLead.assignedTo}</strong>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedLeadForDrawer(currentLead)}
              className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-stone-700"
              title="Ver Ficha Geral e Histórico da Lead"
            >
              <Eye className="w-3.5 h-3.5 text-emerald-400" />
              <span>Ver Ficha</span>
            </button>

            <button
              onClick={() => {
                setEditingLead(currentLead);
                setIsLeadFormOpen(true);
              }}
              className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-stone-700"
              title="Editar dados da Lead e Imóvel"
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-400" />
              <span>Editar Lead</span>
            </button>

            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Interessado</span>
            </button>

            <button
              onClick={() => setSelectedPropertyForMediation(null)}
              className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Summary Strip */}
        <div className="bg-white px-6 py-2 border-b border-stone-200 flex items-center justify-between text-xs text-stone-600 shrink-0">
          <div className="flex items-center gap-4">
            <span className="font-semibold">
              Total Interessados: <strong className="text-stone-900">{buyers.length}</strong>
            </span>
            <span className="text-stone-300">|</span>
            <span>
              Visitas Marcadas/Feitas: <strong className="text-amber-700">{buyers.filter(b => b.fase === 'Visita').length}</strong>
            </span>
            <span className="text-stone-300">|</span>
            <span>
              Propostas Apresentadas: <strong className="text-indigo-700">{buyers.filter(b => b.fase === 'Proposta').length}</strong>
            </span>
            <span className="text-stone-300">|</span>
            <span>
              Venda Concluída:{' '}
              <strong className={buyers.filter(b => b.fase === 'Fechado').length > 0 ? 'text-emerald-600 font-black' : 'text-stone-400'}>
                {buyers.filter(b => b.fase === 'Fechado').length > 0 ? 'Sim (CPCV / Escritura)' : 'Ainda não'}
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {currentLead.requalificacaoNotas && (
              <span className="text-[11px] text-stone-500 italic max-w-sm truncate" title={currentLead.requalificacaoNotas}>
                "{currentLead.requalificacaoNotas}"
              </span>
            )}
          </div>
        </div>

        {/* Form Modal Dropdown / Inline if open */}
        {showAddForm && (
          <div className="bg-white p-5 border-b border-stone-300 shadow-sm shrink-0 animate-in slide-in-from-top-4 duration-150">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-emerald-600" />
                <span>Adicionar Novo Interessado neste Imóvel</span>
              </h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-stone-400 hover:text-stone-600 text-xs"
              >
                Cancelar
              </button>
            </div>

            <form onSubmit={handleCreateBuyer} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Nome do Comprador *</label>
                  <input
                    type="text"
                    required
                    value={buyerNome}
                    onChange={e => setBuyerNome(e.target.value)}
                    placeholder="Ex: Carlos Ferreira"
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Telefone de Contacto *</label>
                  <input
                    type="tel"
                    required
                    value={buyerTelefone}
                    onChange={e => setBuyerTelefone(e.target.value)}
                    placeholder="Ex: 912 345 678"
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Oferta / Orçamento (€)</label>
                  <input
                    type="text"
                    value={buyerOferta}
                    onChange={e => setBuyerOferta(e.target.value)}
                    placeholder={`Ex: ${precoVenda}`}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Fase Inicial</label>
                  <select
                    value={buyerFase}
                    onChange={e => setBuyerFase(e.target.value as MediationBuyerStage)}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                  >
                    {BUYER_STAGES.map(s => (
                      <option key={s.id} value={s.id}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Notas / Feedback de Visita</label>
                  <input
                    type="text"
                    value={buyerNotas}
                    onChange={e => setBuyerNotas(e.target.value)}
                    placeholder="Ex: Gostou da localização, tem crédito pré-aprovado, vai decidir até sexta..."
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2 bg-stone-900 hover:bg-black text-white rounded-xl font-bold text-xs shadow-md transition disabled:opacity-50"
                  >
                    {isSubmitting ? 'A guardar...' : 'Registar Interessado'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* 5-Column Mini Kanban CRM for this Property */}
        <div className="flex-1 overflow-x-auto p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5 min-w-[980px] h-full items-start">
            {BUYER_STAGES.map(stage => {
              const stageBuyers = buyers.filter(b => b.fase === stage.id);
              const isOver = dragOverStage === stage.id;

              return (
                <div
                  key={stage.id}
                  onDragOver={e => handleDragOver(e, stage.id)}
                  onDragLeave={() => setDragOverStage(null)}
                  onDrop={e => handleDrop(e, stage.id)}
                  className={`bg-[#EFECE6]/80 rounded-2xl p-3 border transition-all flex flex-col min-h-[360px] ${
                    isOver ? 'border-emerald-500 bg-emerald-50/50 shadow-md ring-2 ring-emerald-400' : 'border-stone-300/80 shadow-2xs'
                  }`}
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-300">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${stage.dot}`}></span>
                      <h4 className="text-xs font-black text-stone-800 tracking-tight">{stage.label}</h4>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-white border border-stone-300 rounded-full text-stone-700 shadow-2xs">
                      {stageBuyers.length}
                    </span>
                  </div>

                  {/* Cards List */}
                  <div className="space-y-2.5 flex-1 overflow-y-auto pr-0.5">
                    {stageBuyers.length === 0 ? (
                      <div className="p-4 text-center text-stone-400 text-[11px] italic rounded-xl border border-dashed border-stone-300 bg-white/40">
                        Nenhum nesta fase
                      </div>
                    ) : (
                      stageBuyers.map(buyer => {
                        const badge = getMediationBuyerStageBadge(buyer.fase);
                        return (
                          <div
                            key={buyer.id}
                            draggable
                            onDragStart={e => handleDragStart(e, buyer.id)}
                            className="bg-white p-3 rounded-xl border border-stone-300/90 shadow-2xs hover:shadow-md transition cursor-grab active:cursor-grabbing space-y-2 group"
                          >
                            {/* Card Top: Nome & Delete Trash */}
                            <div className="flex items-start justify-between gap-1">
                              <span className="font-bold text-xs text-stone-900 leading-tight">
                                {buyer.nome}
                              </span>

                              {/* LIXINHO RÁPIDO */}
                              <button
                                onClick={() => handleDeleteBuyer(buyer)}
                                className="p-1 text-stone-300 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                                title="Eliminar Interessado"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Telefone & WhatsApp Actions */}
                            {buyer.telefone && (
                              <div className="flex items-center gap-2 text-xs">
                                <a
                                  href={`tel:${buyer.telefone}`}
                                  className="flex items-center gap-1 text-amber-700 hover:underline font-mono text-[11px] font-semibold"
                                >
                                  <Phone className="w-3 h-3" />
                                  <span>{buyer.telefone}</span>
                                </a>

                                <a
                                  href={`https://wa.me/351${buyer.telefone.replace(/\D/g, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-emerald-600 hover:text-emerald-700 text-[10px] font-bold flex items-center gap-0.5 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200"
                                >
                                  <MessageSquare className="w-2.5 h-2.5" />
                                  <span>WhatsApp</span>
                                </a>
                              </div>
                            )}

                            {/* Oferta / Orçamento */}
                            {buyer.valorOferta ? (
                              <div className="bg-[#FAF8F5] px-2 py-1 rounded-lg border border-stone-200 flex items-center justify-between text-[11px]">
                                <span className="text-stone-500 font-medium">Proposta / Oferta:</span>
                                <strong className="text-stone-900 font-black">{formatCurrency(buyer.valorOferta)}</strong>
                              </div>
                            ) : null}

                            {/* Notas / Feedback */}
                            {buyer.notas && (
                              <p className="text-[11px] text-stone-600 italic bg-amber-50/50 p-2 rounded-lg border border-amber-100">
                                "{buyer.notas}"
                              </p>
                            )}

                            {/* Stage Selector / Move forward quick buttons */}
                            <div className="pt-1.5 border-t border-stone-100 flex items-center justify-between">
                              <select
                                value={buyer.fase}
                                onChange={e => updateMediationBuyerStage(buyer.id, currentLead.id, e.target.value as MediationBuyerStage)}
                                className="text-[10px] font-bold bg-[#FAF8F5] border border-stone-200 rounded px-1.5 py-0.5 text-stone-700"
                              >
                                {BUYER_STAGES.map(s => (
                                  <option key={s.id} value={s.id}>{s.label}</option>
                                ))}
                              </select>

                              {/* Next stage shortcut button */}
                              {stage.id === 'Interessado' && (
                                <button
                                  onClick={() => updateMediationBuyerStage(buyer.id, currentLead.id, 'Visita')}
                                  className="text-[10px] font-bold text-amber-700 hover:underline flex items-center gap-0.5"
                                  title="Passar para Visita"
                                >
                                  <span>Visita</span>
                                  <ChevronRight className="w-3 h-3" />
                                </button>
                              )}
                              {stage.id === 'Visita' && (
                                <button
                                  onClick={() => updateMediationBuyerStage(buyer.id, currentLead.id, 'Proposta')}
                                  className="text-[10px] font-bold text-indigo-700 hover:underline flex items-center gap-0.5"
                                  title="Passar para Proposta"
                                >
                                  <span>Proposta</span>
                                  <ChevronRight className="w-3 h-3" />
                                </button>
                              )}
                              {stage.id === 'Proposta' && (
                                <button
                                  onClick={() => updateMediationBuyerStage(buyer.id, currentLead.id, 'Fechado')}
                                  className="text-[10px] font-black text-emerald-700 hover:underline flex items-center gap-0.5 bg-emerald-50 px-1 rounded"
                                  title="Fechar Venda!"
                                >
                                  <span>Fechar!</span>
                                  <CheckCircle2 className="w-3 h-3" />
                                </button>
                              )}
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
    </div>
  );
};
