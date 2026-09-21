import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Sparkles, MapPin, User, ShieldCheck } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { PropertyType, PropertyCondition, LeadOrigin, ContactStatus, PhotoStatus, LeadPhase, PriorityLevel, YesNo, DealDeadline } from '../../types/crm';
import { formatCurrency, getUserTheme } from '../../utils/formatters';
import { AVEIRO_MARKET_BENCHMARKS, analyzeLeadMarket } from '../../data/marketData';

export const LeadFormModal: React.FC = () => {
  const { isLeadFormOpen, setIsLeadFormOpen, editingLead, setEditingLead, addLead, updateLead, currentUser } = useCRM();

  // Form State
  const [nomeProprietario, setNomeProprietario] = useState('');
  const [telefone, setTelefone] = useState('');
  const [freguesia, setFreguesia] = useState('Aveiro Centro (Glória e Vera Cruz)');
  
  const [tipoImovel, setTipoImovel] = useState<PropertyType>('Moradia');
  const [estadoImovel, setEstadoImovel] = useState<PropertyCondition>('A necessitar de obras profundas');
  const [areaM2, setAreaM2] = useState<string>('');
  const [origem, setOrigem] = useState<LeadOrigin>('Meta Ads');

  const [valorMinimoAbsoluto, setValorMinimoAbsoluto] = useState<string>('');
  const [flexibilidade, setFlexibilidade] = useState<YesNo>('Sim');
  const [prazoPretendido, setPrazoPretendido] = useState<DealDeadline>('Imediatamente');

  const [contacto, setContacto] = useState<ContactStatus>('Não contactado');
  const [fotos, setFotos] = useState<PhotoStatus>('Sem fotos');
  const [fase, setFase] = useState<LeadPhase>('Nova lead');
  const [prioridade, setPrioridade] = useState<PriorityLevel>('Alta');
  const [notaInicial, setNotaInicial] = useState('');

  // Validation Error State
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Populate when editing or opening
  useEffect(() => {
    if (editingLead) {
      setNomeProprietario(editingLead.nomeProprietario || '');
      setTelefone(editingLead.telefone || '');
      setFreguesia(editingLead.freguesia || 'Aveiro Centro (Glória e Vera Cruz)');
      setTipoImovel(editingLead.tipoImovel || 'Moradia');
      setEstadoImovel(editingLead.estadoImovel || 'A necessitar de obras profundas');
      setAreaM2(editingLead.areaM2 !== undefined ? String(editingLead.areaM2) : '');
      setOrigem(editingLead.origem || 'Meta Ads');

      setValorMinimoAbsoluto(editingLead.valorMinimoAbsoluto !== undefined ? String(editingLead.valorMinimoAbsoluto) : '');
      setFlexibilidade(editingLead.flexibilidade || 'Sim');
      setPrazoPretendido(editingLead.prazoPretendido || 'Imediatamente');

      setContacto(editingLead.contacto || 'Não contactado');
      setFotos(editingLead.fotos || 'Sem fotos');
      setFase(editingLead.fase || 'Nova lead');
      setPrioridade(editingLead.prioridade || 'Alta');
      setNotaInicial('');
    } else {
      setNomeProprietario('');
      setTelefone('');
      setFreguesia('Aveiro Centro (Glória e Vera Cruz)');
      setTipoImovel('Moradia');
      setEstadoImovel('A necessitar de obras profundas');
      setAreaM2('');
      setOrigem('Meta Ads');

      setValorMinimoAbsoluto('');
      setFlexibilidade('Sim');
      setPrazoPretendido('Imediatamente');

      setContacto('Não contactado');
      setFotos('Sem fotos');
      setFase('Nova lead');
      setPrioridade('Alta');
      setNotaInicial('');
    }
    setErrors({});
  }, [editingLead, isLeadFormOpen]);

  if (!isLeadFormOpen) return null;

  // Real-time calculations
  const numMinimo = Number(valorMinimoAbsoluto) || 0;
  const numArea = Number(areaM2) || 0;

  // Live Aveiro Market Study Preview
  const liveMarket = analyzeLeadMarket(numMinimo, numArea, freguesia, tipoImovel);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!nomeProprietario.trim()) errs.nomeProprietario = 'Nome do proprietário é obrigatório';
    if (!telefone.trim()) errs.telefone = 'Telefone é obrigatório';
    if (!freguesia.trim()) errs.freguesia = 'Freguesia de Aveiro é obrigatória';
    if (!numArea || numArea <= 0) errs.areaM2 = 'Indique a área em m²';
    if (!numMinimo || numMinimo <= 0) errs.valorMinimoAbsoluto = 'Valor mínimo aceitável é obrigatório';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (editingLead) {
      updateLead({
        ...editingLead,
        nomeProprietario: nomeProprietario.trim(),
        telefone: telefone.trim(),
        freguesia: freguesia.trim(),
        tipoImovel,
        estadoImovel,
        areaM2: numArea,
        origem,
        valorMinimoAbsoluto: numMinimo,
        flexibilidade,
        prazoPretendido,
        contacto,
        fotos,
        fase,
        prioridade,
        assignedTo: editingLead.assignedTo || currentUser
      });
    } else {
      const initialNotes = notaInicial.trim()
        ? [{
            id: 'note-' + Date.now(),
            author: currentUser,
            assignedUser: currentUser,
            date: new Date().toISOString(),
            text: notaInicial.trim(),
            type: 'general' as const
          }]
        : [];

      addLead({
        nomeProprietario: nomeProprietario.trim(),
        telefone: telefone.trim(),
        freguesia: freguesia.trim(),
        tipoImovel,
        estadoImovel,
        areaM2: numArea,
        origem,
        valorMinimoAbsoluto: numMinimo,
        flexibilidade,
        prazoPretendido,
        contacto,
        fotos,
        fase,
        prioridade,
        notas: initialNotes
      });
    }

    setIsLeadFormOpen(false);
    setEditingLead(null);
  };

  const userTheme = getUserTheme(currentUser);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-[#FAF8F5] border border-stone-300 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header (Obsidian Architectural Black) */}
        <div className="bg-[#16171B] px-6 py-4 text-white flex items-center justify-between border-b border-stone-800">
          <div>
            <h3 className="font-extrabold text-base tracking-tight text-white">
              {editingLead ? 'Editar Lead de Arbitragem' : 'Nova Lead (Distrito de Aveiro)'}
            </h3>
            <p className="text-[11px] text-stone-400 mt-0.5">
              Formulário otimizado • Foco em valor mínimo aceitável e m² por freguesia
            </p>
          </div>
          <button
            onClick={() => {
              setIsLeadFormOpen(false);
              setEditingLead(null);
            }}
            className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto text-xs text-stone-800">

          {/* User Session Banner (Locked Responsável) */}
          <div className="bg-white p-3 border border-stone-200 shadow-xs flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <span className={`w-7 h-7 font-black text-xs flex items-center justify-center ${userTheme.avatarBg}`}>
                {userTheme.initial}
              </span>
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-400 block">Responsável Atribuído (Sessão)</span>
                <span className="text-xs font-black text-stone-900">{userTheme.name}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-stone-500">Prioridade:</span>
              <select
                value={prioridade}
                onChange={e => setPrioridade(e.target.value as PriorityLevel)}
                className="px-2 py-1 bg-stone-50 border border-stone-200 rounded-lg text-xs font-semibold focus:outline-none"
              >
                <option value="Urgente">🔴 Urgente</option>
                <option value="Alta">🟠 Alta</option>
                <option value="Média">🔵 Média</option>
                <option value="Baixa">⚪ Baixa</option>
              </select>
            </div>
          </div>

          {/* Section 1: Contacto & Freguesia de Aveiro (No address, no email) */}
          <div className="space-y-3">
            <h4 className="font-bold text-stone-900 uppercase tracking-wider text-[11px] border-b border-stone-200 pb-1">
              1. Contacto & Freguesia (Distrito de Aveiro)
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Nome do Proprietário *</label>
                <input
                  type="text"
                  value={nomeProprietario}
                  onChange={e => setNomeProprietario(e.target.value)}
                  placeholder="Ex: Manuel Silva"
                  className={`w-full px-3 py-2 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                    errors.nomeProprietario ? 'border-red-500 bg-red-50/20' : 'border-stone-300'
                  }`}
                />
                {errors.nomeProprietario && <span className="text-[10px] text-red-500 mt-0.5 block">{errors.nomeProprietario}</span>}
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Telefone / WhatsApp *</label>
                <input
                  type="text"
                  value={telefone}
                  onChange={e => setTelefone(e.target.value)}
                  placeholder="Ex: +351 912 345 678"
                  className={`w-full px-3 py-2 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                    errors.telefone ? 'border-red-500 bg-red-50/20' : 'border-stone-300'
                  }`}
                />
                {errors.telefone && <span className="text-[10px] text-red-500 mt-0.5 block">{errors.telefone}</span>}
              </div>
            </div>

            {/* Freguesia de Aveiro Dropdown/Search */}
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Freguesia de Aveiro (Cálculo do Preço/m²) *
              </label>
              <select
                value={freguesia}
                onChange={e => setFreguesia(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
              >
                {AVEIRO_MARKET_BENCHMARKS.map((b, idx) => (
                  <option key={idx} value={b.freguesia}>
                    {b.freguesia} ({b.concelho})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Section 2: Caraterísticas e Estado do Imóvel */}
          <div className="space-y-3">
            <h4 className="font-bold text-stone-900 uppercase tracking-wider text-[11px] border-b border-stone-200 pb-1">
              2. Caraterísticas & Estado do Imóvel
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Tipo de Imóvel *</label>
                <select
                  value={tipoImovel}
                  onChange={e => setTipoImovel(e.target.value as PropertyType)}
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="Moradia">Moradia</option>
                  <option value="Apartamento">Apartamento</option>
                  <option value="Ruína">Ruína</option>
                  <option value="Terreno">Terreno</option>
                  <option value="Prédio">Prédio</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Estado do Imóvel *</label>
                <select
                  value={estadoImovel}
                  onChange={e => setEstadoImovel(e.target.value as PropertyCondition)}
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold text-amber-900"
                >
                  <option value="Ruína total">Ruína total</option>
                  <option value="A necessitar de obras profundas">A necessitar de obras profundas</option>
                  <option value="Habitável a precisar de modernização">Habitável a modernizar</option>
                  <option value="Bom estado geral">Bom estado geral</option>
                  <option value="Terreno limpo e plano">Terreno limpo e plano</option>
                  <option value="Terreno com declive / árvores">Terreno com declive / árvores</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Área Total (m²) *</label>
                <input
                  type="number"
                  value={areaM2}
                  onChange={e => setAreaM2(e.target.value)}
                  placeholder="Ex: 180"
                  className={`w-full px-3 py-2 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                    errors.areaM2 ? 'border-red-500 bg-red-50/20' : 'border-stone-300'
                  }`}
                />
                {errors.areaM2 && <span className="text-[10px] text-red-500 mt-0.5 block">{errors.areaM2}</span>}
              </div>
            </div>
          </div>

          {/* Section 3: Valor Mínimo Aceitável & Prazo Fechado */}
          <div className="space-y-3">
            <h4 className="font-bold text-stone-900 uppercase tracking-wider text-[11px] border-b border-stone-200 pb-1">
              3. Valor Mínimo Aceitável & Prazo Pretendido
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Valor Mínimo Aceitável (€) *
                </label>
                <input
                  type="number"
                  value={valorMinimoAbsoluto}
                  onChange={e => setValorMinimoAbsoluto(e.target.value)}
                  placeholder="Ex: 85000"
                  className={`w-full px-3 py-2 bg-white border rounded-xl text-sm font-black text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                    errors.valorMinimoAbsoluto ? 'border-red-500 bg-red-50/20' : 'border-stone-300'
                  }`}
                />
                {errors.valorMinimoAbsoluto && <span className="text-[10px] text-red-500 mt-0.5 block">{errors.valorMinimoAbsoluto}</span>}
              </div>

              {/* Prazo Pretendido: 3 Closed Options */}
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Prazo Pretendido *</label>
                <select
                  value={prazoPretendido}
                  onChange={e => setPrazoPretendido(e.target.value as DealDeadline)}
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold"
                >
                  <option value="Imediatamente">⚡ Imediatamente (Urgente)</option>
                  <option value="Curto prazo">⏳ Curto prazo (15 a 30 dias)</option>
                  <option value="Sem pressa">☕ Sem pressa</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Flexibilidade no Preço?</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFlexibilidade('Sim')}
                    className={`flex-1 py-2 rounded-xl font-bold border transition ${
                      flexibilidade === 'Sim'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-white text-stone-600 border-stone-300'
                    }`}
                  >
                    Sim
                  </button>
                  <button
                    type="button"
                    onClick={() => setFlexibilidade('Não')}
                    className={`flex-1 py-2 rounded-xl font-bold border transition ${
                      flexibilidade === 'Não'
                        ? 'bg-amber-50 text-amber-800 border-amber-300'
                        : 'bg-white text-stone-600 border-stone-300'
                    }`}
                  >
                    Não
                  </button>
                </div>
              </div>
            </div>

            {/* LIVE AVEIRO MARKET BENCHMARK RESULT */}
            <div className="bg-white p-4 border border-stone-300 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  Estudo de Mercado Automático ({freguesia})
                </span>
                {liveMarket && (
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${liveMarket.badgeBg} ${liveMarket.badgeText} ${liveMarket.badgeBorder}`}>
                    {liveMarket.etiqueta}
                  </span>
                )}
              </div>

              {liveMarket ? (
                <div className="grid grid-cols-3 gap-2 pt-1 border-t border-stone-100">
                  <div>
                    <span className="text-[10px] font-semibold text-stone-400 block">Preço da Lead / m²</span>
                    <span className="text-sm font-black text-stone-900">{liveMarket.precoM2} €/m²</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-stone-400 block">Média da Freguesia</span>
                    <span className="text-sm font-black text-stone-700">{liveMarket.mediaFreguesiaM2} €/m²</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-stone-400 block">Diferença vs Mercado</span>
                    <span className={`text-sm font-black ${liveMarket.deltaPercent <= -15 ? 'text-emerald-600' : 'text-stone-800'}`}>
                      {liveMarket.deltaPercent > 0 ? '+' : ''}{liveMarket.deltaPercent}%
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-[11px] text-stone-400">
                  Insira o valor mínimo aceitável e a área em m² para visualizar o estudo de mercado instantâneo.
                </p>
              )}
            </div>
          </div>

          {/* Optional Initial Note */}
          {!editingLead && (
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Nota Inicial (Opcional)</label>
              <input
                type="text"
                value={notaInicial}
                onChange={e => setNotaInicial(e.target.value)}
                placeholder="Ex: Falou por WhatsApp, aceita sinal de 10% no CPCV."
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs focus:outline-none"
              />
            </div>
          )}

        </form>

        {/* Modal Footer */}
        <div className="bg-stone-100 px-6 py-3 border-t border-stone-200 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              setIsLeadFormOpen(false);
              setEditingLead(null);
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
            <span>{editingLead ? 'Guardar Alterações' : 'Criar Lead'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
