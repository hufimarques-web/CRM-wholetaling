import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Calculator, Info } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { Lead, PropertyType, LeadOrigin, ContactStatus, PhotoStatus, LeadPhase, PriorityLevel, YesNo } from '../../types/crm';
import { formatCurrency, calcLeadPotentialMargin } from '../../utils/formatters';

export const LeadFormModal: React.FC = () => {
  const { isLeadFormOpen, setIsLeadFormOpen, editingLead, setEditingLead, addLead, updateLead } = useCRM();

  // Form State
  const [nomeProprietario, setNomeProprietario] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [moradaZona, setMoradaZona] = useState('');
  const [concelho, setConcelho] = useState('');
  const [freguesia, setFreguesia] = useState('');
  
  const [tipoImovel, setTipoImovel] = useState<PropertyType>('Moradia');
  const [situacaoAtual, setSituacaoAtual] = useState('');
  const [areaM2, setAreaM2] = useState<string>('');
  const [origem, setOrigem] = useState<LeadOrigin>('Meta Ads');

  const [precoPedido, setPrecoPedido] = useState<string>('');
  const [valorMinimoAbsoluto, setValorMinimoAbsoluto] = useState<string>('');
  const [flexibilidade, setFlexibilidade] = useState<YesNo>('Sim');
  const [prazoPretendido, setPrazoPretendido] = useState('');
  const [valorEstimadoAvaliacao, setValorEstimadoAvaliacao] = useState<string>('');

  const [contacto, setContacto] = useState<ContactStatus>('Não contactado');
  const [fotos, setFotos] = useState<PhotoStatus>('Sem fotos');
  const [fase, setFase] = useState<LeadPhase>('Nova lead');
  const [prioridade, setPrioridade] = useState<PriorityLevel>('Alta');
  const [notaInicial, setNotaInicial] = useState('');

  // Validation Error State
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Phase-dependent visibility rule
  const isInitialPhase = fase === 'Nova lead' || fase === 'Em análise';

  // Populate when editing
  useEffect(() => {
    if (editingLead) {
      setNomeProprietario(editingLead.nomeProprietario || '');
      setTelefone(editingLead.telefone || '');
      setEmail(editingLead.email || '');
      setMoradaZona(editingLead.moradaZona || '');
      setConcelho(editingLead.concelho || '');
      setFreguesia(editingLead.freguesia || '');

      setTipoImovel(editingLead.tipoImovel || 'Moradia');
      setSituacaoAtual(editingLead.situacaoAtual || '');
      setAreaM2(editingLead.areaM2 !== undefined ? String(editingLead.areaM2) : '');
      setOrigem(editingLead.origem || 'Meta Ads');

      setPrecoPedido(editingLead.precoPedido !== undefined ? String(editingLead.precoPedido) : '');
      setValorMinimoAbsoluto(editingLead.valorMinimoAbsoluto !== undefined ? String(editingLead.valorMinimoAbsoluto) : '');
      setFlexibilidade(editingLead.flexibilidade || 'Sim');
      setPrazoPretendido(editingLead.prazoPretendido || '');
      setValorEstimadoAvaliacao(editingLead.valorEstimadoAvaliacao !== undefined ? String(editingLead.valorEstimadoAvaliacao) : '');

      setContacto(editingLead.contacto || 'Não contactado');
      setFotos(editingLead.fotos || 'Sem fotos');
      setFase(editingLead.fase || 'Nova lead');
      setPrioridade(editingLead.prioridade || 'Alta');
      setNotaInicial('');
    } else {
      // Reset form
      setNomeProprietario('');
      setTelefone('');
      setEmail('');
      setMoradaZona('');
      setConcelho('');
      setFreguesia('');

      setTipoImovel('Moradia');
      setSituacaoAtual('');
      setAreaM2('');
      setOrigem('Meta Ads');

      setPrecoPedido('');
      setValorMinimoAbsoluto('');
      setFlexibilidade('Sim');
      setPrazoPretendido('');
      setValorEstimadoAvaliacao('');

      setContacto('Não contactado');
      setFotos('Sem fotos');
      setFase('Nova lead');
      setPrioridade('Alta');
      setNotaInicial('');
    }
    setErrors({});
  }, [editingLead, isLeadFormOpen]);

  if (!isLeadFormOpen) return null;

  // Real-time automatic margin calculation
  const numAvaliacao = Number(valorEstimadoAvaliacao) || 0;
  const numMinimo = Number(valorMinimoAbsoluto) || 0;
  const margemCalculada = calcLeadPotentialMargin(numAvaliacao, numMinimo);

  // Validate Mandatory Form Questions
  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!nomeProprietario.trim()) {
      errs.nomeProprietario = 'O nome do proprietário/contacto é obrigatório.';
    }
    if (!telefone.trim()) {
      errs.telefone = 'O telefone de contacto é obrigatório.';
    }
    if (!moradaZona.trim()) {
      errs.moradaZona = 'A morada ou zona aproximada é obrigatória.';
    }

    // MANDATORY QUESTION 1: Situação atual
    if (!situacaoAtual.trim()) {
      errs.situacaoAtual = 'Indique a situação atual do imóvel ou terreno.';
    }

    // MANDATORY QUESTION 2: Prazo pretendido
    if (!prazoPretendido.trim()) {
      errs.prazoPretendido = 'Indique quando gostaria de ter o negócio fechado e o dinheiro na conta.';
    }

    // MANDATORY QUESTION 3: Concelho e Freguesia
    if (!concelho.trim()) {
      errs.concelho = 'O concelho é obrigatório.';
    }
    if (!freguesia.trim()) {
      errs.freguesia = 'A freguesia é obrigatória.';
    }

    // MANDATORY QUESTION 4: Área total em m2
    if (!areaM2.trim() || isNaN(Number(areaM2)) || Number(areaM2) <= 0) {
      errs.areaM2 = 'A área total aproximada em m² deve ser um número superior a 0.';
    }

    // MANDATORY QUESTION 5: Valor mínimo absoluto
    if (!valorMinimoAbsoluto.trim() || isNaN(Number(valorMinimoAbsoluto)) || Number(valorMinimoAbsoluto) <= 0) {
      errs.valorMinimoAbsoluto = 'Indique o valor mínimo absoluto pelo qual estaria disposto a entregar o imóvel hoje.';
    }

    // MANDATORY QUESTION 6: Flexibilidade
    if (!flexibilidade) {
      errs.flexibilidade = 'Selecione Sim ou Não para a flexibilidade de negociação.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const leadPayload = {
      nomeProprietario: nomeProprietario.trim(),
      telefone: telefone.trim(),
      email: email.trim() || undefined,
      moradaZona: moradaZona.trim(),
      concelho: concelho.trim(),
      freguesia: freguesia.trim(),

      tipoImovel,
      situacaoAtual: situacaoAtual.trim(),
      areaM2: Number(areaM2),
      origem,

      precoPedido: precoPedido ? Number(precoPedido) : undefined,
      valorMinimoAbsoluto: Number(valorMinimoAbsoluto),
      flexibilidade,
      prazoPretendido: prazoPretendido.trim(),
      valorEstimadoAvaliacao: valorEstimadoAvaliacao ? Number(valorEstimadoAvaliacao) : undefined,

      contacto,
      fotos,
      fase,
      prioridade
    };

    if (editingLead) {
      updateLead({
        ...editingLead,
        ...leadPayload,
        margemPotencial: calcLeadPotentialMargin(leadPayload.valorEstimadoAvaliacao, leadPayload.valorMinimoAbsoluto)
      });
    } else {
      const initialNotes = notaInicial.trim() ? [
        {
          id: 'note-' + Date.now(),
          author: 'Gestor CRM',
          date: new Date().toISOString(),
          text: notaInicial.trim()
        }
      ] : [];

      addLead({
        ...leadPayload,
        notas: initialNotes
      });
    }

    setIsLeadFormOpen(false);
    setEditingLead(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-[#0B132B] px-6 py-4 text-white flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-base font-bold">
              {editingLead ? 'Editar Lead Imobiliária' : 'Adicionar Nova Lead (Wholetailing)'}
            </h2>
            <p className="text-xs text-slate-300">
              Formulário Oficial de Qualificação e Arbitragem Imobiliária
            </p>
          </div>
          <button
            onClick={() => {
              setIsLeadFormOpen(false);
              setEditingLead(null);
            }}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 text-xs text-slate-800">

          {/* Validation Summary Warning */}
          {Object.keys(errors).length > 0 && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-xs">Por favor preencha os campos obrigatórios assinalados:</p>
                <ul className="list-disc list-inside mt-1 space-y-0.5 text-[11px]">
                  {Object.values(errors).map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* SECTION 4: Fase & Estados */}
          <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-100 space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-blue-200/80 pb-1 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              Fase no Funil e Estados da Lead
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block font-bold text-slate-900 mb-1">Fase no Funil *</label>
                <select
                  value={fase}
                  onChange={e => setFase(e.target.value as LeadPhase)}
                  className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-extrabold text-blue-900 shadow-xs"
                >
                  <option value="Nova lead">Nova lead</option>
                  <option value="Em análise">Em análise</option>
                  <option value="Pronta para proposta">Pronta para proposta</option>
                  <option value="CPCV a preparar">CPCV a preparar</option>
                  <option value="Descartada">Descartada</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Contacto</label>
                <select
                  value={contacto}
                  onChange={e => setContacto(e.target.value as ContactStatus)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="Não contactado">Não contactado</option>
                  <option value="Contactado">Contactado</option>
                  <option value="Sem resposta">Sem resposta</option>
                  <option value="Reunião marcada">Reunião marcada</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Fotos</label>
                <select
                  value={fotos}
                  onChange={e => setFotos(e.target.value as PhotoStatus)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="Sem fotos">Sem fotos</option>
                  <option value="Fotos pedidas">Fotos pedidas</option>
                  <option value="Fotos recebidas">Fotos recebidas</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Prioridade</label>
                <select
                  value={prioridade}
                  onChange={e => setPrioridade(e.target.value as PriorityLevel)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="Baixa">Baixa (Sem pressa)</option>
                  <option value="Média">Média (Normal)</option>
                  <option value="Alta">Alta (Curto prazo)</option>
                  <option value="Urgente">Urgente (Imediatamente)</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 1: Identificação do Proprietário e Contacto */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 pb-1 border-b border-slate-200 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-700"></span>
              Identificação do Proprietário e Contacto
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nome do Proprietário / Contacto *
                </label>
                <input
                  type="text"
                  value={nomeProprietario}
                  onChange={e => setNomeProprietario(e.target.value)}
                  placeholder="Ex: Fátima Pinheiro"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.nomeProprietario ? 'border-red-500 bg-red-50 focus:ring-red-400' : 'border-slate-300 focus:ring-blue-500'
                  }`}
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Telefone de Contacto *
                </label>
                <input
                  type="text"
                  value={telefone}
                  onChange={e => setTelefone(e.target.value)}
                  placeholder="Ex: 912 345 678"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.telefone ? 'border-red-500 bg-red-50 focus:ring-red-400' : 'border-slate-300 focus:ring-blue-500'
                  }`}
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Email (Opcional)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Ex: contacto@exemplo.pt"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block font-semibold text-slate-700 mb-1">
                Morada ou Zona Aproximada do Imóvel/Terreno *
              </label>
              <input
                type="text"
                value={moradaZona}
                onChange={e => setMoradaZona(e.target.value)}
                placeholder="Ex: Rua Principal, São Bernardo"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.moradaZona ? 'border-red-500 bg-red-50 focus:ring-red-400' : 'border-slate-300 focus:ring-blue-500'
                }`}
              />
            </div>
          </div>

          {/* SECTION 2: PERGUNTAS POR EXTENSO (MANDATORY QUALIFICATION QUESTIONS) */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-1 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span>Perguntas Obrigatórias de Qualificação (Por Extenso)</span>
              </div>
              <span className="text-[10px] text-amber-800 font-bold bg-amber-100 px-2.5 py-0.5 rounded-md border border-amber-200">
                Campos Obrigatórios
              </span>
            </h3>

            {/* MANDATORY Q1 POR EXTENSO */}
            <div>
              <label className="block font-bold text-slate-900 mb-1 flex items-center justify-between">
                <span>Qual é a situação atual do imóvel ou terreno? *</span>
                {errors.situacaoAtual && <span className="text-red-600 text-[10px]">{errors.situacaoAtual}</span>}
              </label>
              <textarea
                rows={2}
                value={situacaoAtual}
                onChange={e => setSituacaoAtual(e.target.value)}
                placeholder="Descreva o estado de conservação, ruína, herança, partilha, dívidas, inquilinos, etc."
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.situacaoAtual ? 'border-red-500 bg-red-50 focus:ring-red-400' : 'border-slate-300 focus:ring-blue-500'
                }`}
              />
            </div>

            {/* MANDATORY Q2 POR EXTENSO */}
            <div>
              <label className="block font-bold text-slate-900 mb-1 flex items-center justify-between">
                <span>Quando gostaria de ter o negócio fechado e o dinheiro na conta? *</span>
                {errors.prazoPretendido && <span className="text-red-600 text-[10px]">{errors.prazoPretendido}</span>}
              </label>
              <input
                type="text"
                value={prazoPretendido}
                onChange={e => setPrazoPretendido(e.target.value)}
                placeholder="Ex: Imediatamente, dentro de 15 dias, este mês..."
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.prazoPretendido ? 'border-red-500 bg-red-50 focus:ring-red-400' : 'border-slate-300 focus:ring-blue-500'
                }`}
              />
            </div>

            {/* MANDATORY Q3 POR EXTENSO: Concelho e Freguesia */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-900 mb-1">
                  Em que concelho se localiza o imóvel/terreno? *
                </label>
                <input
                  type="text"
                  value={concelho}
                  onChange={e => setConcelho(e.target.value)}
                  placeholder="Ex: Aveiro, Coimbra, Viseu, Ílhavo..."
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.concelho ? 'border-red-500 bg-red-50 focus:ring-red-400' : 'border-slate-300 focus:ring-blue-500'
                  }`}
                />
              </div>

              <div>
                <label className="block font-bold text-slate-900 mb-1">
                  Em que freguesia se localiza o imóvel/terreno? *
                </label>
                <input
                  type="text"
                  value={freguesia}
                  onChange={e => setFreguesia(e.target.value)}
                  placeholder="Ex: São Bernardo, Esgueira, Olivais, Celas..."
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.freguesia ? 'border-red-500 bg-red-50 focus:ring-red-400' : 'border-slate-300 focus:ring-blue-500'
                  }`}
                />
              </div>
            </div>

            {/* MANDATORY Q4 POR EXTENSO & Tipo / Origem */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-slate-900 mb-1">
                  Qual é a área total aproximada em m²? *
                </label>
                <input
                  type="number"
                  min="1"
                  value={areaM2}
                  onChange={e => setAreaM2(e.target.value)}
                  placeholder="Ex: 450"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.areaM2 ? 'border-red-500 bg-red-50 focus:ring-red-400' : 'border-slate-300 focus:ring-blue-500'
                  }`}
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tipo de Imóvel
                </label>
                <select
                  value={tipoImovel}
                  onChange={e => setTipoImovel(e.target.value as PropertyType)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="Terreno">Terreno</option>
                  <option value="Ruína">Ruína</option>
                  <option value="Apartamento">Apartamento</option>
                  <option value="Moradia">Moradia</option>
                  <option value="Prédio">Prédio</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Origem da Lead
                </label>
                <select
                  value={origem}
                  onChange={e => setOrigem(e.target.value as LeadOrigin)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="Meta Ads">Meta Ads</option>
                  <option value="Marketplace">Marketplace</option>
                  <option value="Grupo Facebook">Grupo Facebook</option>
                  <option value="Prospeção direta">Prospeção direta</option>
                  <option value="Referência">Referência</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 3: VALORES (DYNAMICALLY ADAPTS BASED ON PHASE) */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 pb-1 border-b border-slate-200 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
              <span>Valores de Arbitragem & Negociação</span>
            </h3>

            {/* Initial Phase Layout (Nova lead / Em análise): ONLY Minimum Price & Flexibility */}
            {isInitialPhase ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-900 mb-1">
                    Sabendo que compramos no estado atual e de forma rápida, qual é o valor MÍNIMO absoluto pelo qual estaria disposto a entregar o imóvel hoje? (€) *
                  </label>
                  <input
                    type="number"
                    value={valorMinimoAbsoluto}
                    onChange={e => setValorMinimoAbsoluto(e.target.value)}
                    placeholder="Ex: 85000"
                    className={`w-full px-3.5 py-2.5 border rounded-lg font-extrabold text-sm ${
                      errors.valorMinimoAbsoluto ? 'border-red-500 bg-red-50 focus:ring-red-400' : 'border-slate-300 focus:ring-blue-500'
                    }`}
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-900 mb-1">
                    Tem flexibilidade de negociação no preço final para garantirmos um fecho rápido? (Sim ou Não) *
                  </label>
                  <select
                    value={flexibilidade}
                    onChange={e => setFlexibilidade(e.target.value as YesNo)}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-bold text-xs"
                  >
                    <option value="Sim">Sim (Aberto a propostas de pronto pagamento)</option>
                    <option value="Não">Não (Preço fixo intransigente)</option>
                  </select>
                </div>
              </div>
            ) : (
              /* Advanced Phases Layout: Show Preço Pedido, Mínimo Absoluto, Flexibilidade, Avaliação Revenda and Calculated Margin */
              <div className="space-y-4">
                <div className="mb-4">
                  <label className="block font-bold text-slate-900 mb-1">
                    Sabendo que compramos no estado atual e de forma rápida, qual é o valor MÍNIMO absoluto pelo qual estaria disposto a entregar o imóvel hoje? (€) *
                  </label>
                  <input
                    type="number"
                    value={valorMinimoAbsoluto}
                    onChange={e => setValorMinimoAbsoluto(e.target.value)}
                    placeholder="Ex: 85000"
                    className={`w-full px-3.5 py-2.5 border rounded-lg font-extrabold text-sm ${
                      errors.valorMinimoAbsoluto ? 'border-red-500 bg-red-50 focus:ring-red-400' : 'border-slate-300 focus:ring-blue-500'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-900 mb-1">
                      Tem flexibilidade de negociação no preço final para garantirmos um fecho rápido? (Sim ou Não) *
                    </label>
                    <select
                      value={flexibilidade}
                      onChange={e => setFlexibilidade(e.target.value as YesNo)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-bold text-xs"
                    >
                      <option value="Sim">Sim (Aberto a propostas de pronto pagamento)</option>
                      <option value="Não">Não (Preço fixo intransigente)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Preço Pedido Inicial (€)
                    </label>
                    <input
                      type="number"
                      value={precoPedido}
                      onChange={e => setPrecoPedido(e.target.value)}
                      placeholder="Ex: 110000"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Valor Estimado de Revenda / Avaliação (€)
                    </label>
                    <input
                      type="number"
                      value={valorEstimadoAvaliacao}
                      onChange={e => setValorEstimadoAvaliacao(e.target.value)}
                      placeholder="Ex: 155000"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Automatic Margin Display */}
                  <div className="bg-emerald-50 p-3.5 rounded-lg border border-emerald-200 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wide flex items-center gap-1">
                        <Calculator className="w-3.5 h-3.5" />
                        Margem Potencial Automática
                      </span>
                      <p className="text-[10px] text-emerald-600">Avaliação - Mínimo Absoluto</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-base font-extrabold ${margemCalculada >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                        {formatCurrency(margemCalculada)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Initial Note */}
          {!editingLead && (
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nota Inicial da Lead (Opcional)
              </label>
              <textarea
                rows={2}
                value={notaInicial}
                onChange={e => setNotaInicial(e.target.value)}
                placeholder="Ex: Proprietário disponível para visita esta semana..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-1.5 text-slate-500 text-[11px]">
              <Info className="w-3.5 h-3.5 text-blue-500" />
              <span>* Perguntas obrigatórias do negócio de Wholetailing.</span>
            </div>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => {
                  setIsLeadFormOpen(false);
                  setEditingLead(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-300 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex items-center space-x-1.5 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition"
              >
                <Save className="w-4 h-4" />
                <span>{editingLead ? 'Guardar Alterações' : 'Criar Lead'}</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
