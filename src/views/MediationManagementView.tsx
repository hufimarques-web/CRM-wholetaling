import React, { useState, useMemo } from 'react';
import {
  Building2,
  Users,
  Eye,
  Calendar,
  CheckCircle2,
  DollarSign,
  Phone,
  MessageSquare,
  MapPin,
  TrendingUp,
  Percent,
  Search,
  Filter,
  Plus,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  Tag,
  Edit3,
  FileText,
  Info
} from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { Lead, AppUser } from '../types/crm';
import { formatCurrency, formatDatePT, getUserTheme } from '../utils/formatters';

export const MediationManagementView: React.FC = () => {
  const {
    leads,
    openPropertyMediationCRM,
    setSelectedLeadForDrawer,
    setEditingLead,
    setIsLeadFormOpen,
    setActiveTab,
    currentUser
  } = useCRM();

  const [searchQuery, setSearchQuery] = useState('');
  const [responsavelFilter, setResponsavelFilter] = useState<'Todos' | AppUser>('Todos');

  // Properties that have contract accepted/signed
  const signedProperties = useMemo(() => {
    return leads.filter(l => l.modeloNegocio === 'Mediação' && l.mediacaoFase === 'Contrato_Aceite' && l.fase !== 'Descartada');
  }, [leads]);

  // Filtered properties
  const filteredProperties = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return signedProperties.filter(l => {
      if (responsavelFilter !== 'Todos' && l.assignedTo !== responsavelFilter) return false;
      if (q) {
        const matches =
          l.nomeProprietario.toLowerCase().includes(q) ||
          l.freguesia.toLowerCase().includes(q) ||
          (l.moradaZona ? l.moradaZona.toLowerCase().includes(q) : false) ||
          l.tipoImovel.toLowerCase().includes(q) ||
          l.telefone.includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [signedProperties, responsavelFilter, searchQuery]);

  // Aggregated KPIs
  const { totalImoveis, totalInteressados, totalVisitas, totalFechados, totalComissaoPotencial } = useMemo(() => {
    let interessadosCount = 0;
    let visitasCount = 0;
    let fechadosCount = 0;
    let comissaoTot = 0;

    for (let i = 0; i < signedProperties.length; i++) {
      const p = signedProperties[i];
      const buyers = p.buyers || [];
      interessadosCount += buyers.length;
      visitasCount += buyers.filter(b => b.fase === 'Visita').length;
      fechadosCount += buyers.filter(b => b.fase === 'Fechado').length;

      const preco = p.mediacaoPrecoVenda || p.valorMinimoAbsoluto || 0;
      const comPct = p.mediacaoComissaoPercent ?? 2.8;
      comissaoTot += Math.round(preco * (comPct / 100));
    }

    return {
      totalImoveis: signedProperties.length,
      totalInteressados: interessadosCount,
      totalVisitas: visitasCount,
      totalFechados: fechadosCount,
      totalComissaoPotencial: comissaoTot
    };
  }, [signedProperties]);

  return (
    <div className="space-y-6">

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-emerald-700 text-white shadow-sm">
              <Users className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight font-display">
                Gestão de Vendas (Mediação)
              </h1>
              <p className="text-xs text-stone-500 font-medium">
                Imóveis Angariados: Clica em qualquer imóvel para abrir o Mini CRM de Compradores e Visitas
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('mediacao_pipeline')}
          className="flex items-center space-x-1.5 px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold shadow-2xs border border-stone-300 transition"
        >
          <Building2 className="w-4 h-4 text-stone-600" />
          <span>Ver Pipeline de Contratos</span>
        </button>
      </div>

      {/* KPI Highlight Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
            Imóveis em Carteira
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-stone-900">{totalImoveis}</span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Contratos Ativos
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
            Compradores Registados
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-blue-600">{totalInteressados}</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
            Visitas Realizadas / Agendadas
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-amber-700">{totalVisitas}</span>
            <Calendar className="w-4 h-4 text-amber-500" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
            Comissão em Jogo (~5%)
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-black text-emerald-600">{formatCurrency(totalComissaoPotencial)}</span>
            <Sparkles className="w-4 h-4 text-emerald-500" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-stone-200/90 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Pesquisar imóvel, freguesia, comprador..."
              className="w-full pl-9 pr-3 py-2 bg-[#FAF8F5] border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-stone-400 font-bold uppercase text-[10px]">Responsável:</span>
          {(['Todos', 'Queirós', 'Hugo'] as const).map(user => (
            <button
              key={user}
              onClick={() => setResponsavelFilter(user)}
              className={`px-3 py-1.5 rounded-xl font-bold transition text-xs ${
                responsavelFilter === user
                  ? 'bg-stone-900 text-white shadow-2xs'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
              }`}
            >
              {user}
            </button>
          ))}
        </div>
      </div>

      {/* Empty State if no signed properties */}
      {filteredProperties.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-stone-200 shadow-2xs space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
            <Building2 className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-black text-stone-900">Ainda não há imóveis com contrato assinado</h3>
            <p className="text-xs text-stone-500">
              Quando uma lead em <strong>CRM Mediação</strong> for arrastada para a coluna <strong>"Contrato Aceite / Assinado"</strong>, o imóvel aparecerá aqui automaticamente como um bloco ativo para gestão de compradores!
            </p>
          </div>
          <button
            onClick={() => setActiveTab('mediacao_pipeline')}
            className="px-4 py-2 bg-stone-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-sm transition"
          >
            Abrir Pipeline de Mediação
          </button>
        </div>
      ) : (
        /* Grid of Property Blocks */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProperties.map(lead => {
            const precoVenda = lead.mediacaoPrecoVenda || lead.valorMinimoAbsoluto;
            const comissaoPercent = lead.mediacaoComissaoPercent ?? 2.8;
            const comissaoEur = Math.round(precoVenda * (comissaoPercent / 100));
            const buyers = lead.buyers || [];
            const userTheme = getUserTheme(lead.assignedTo || 'Queirós');
            const hasClosed = buyers.some(b => b.fase === 'Fechado');

            return (
              <div
                key={lead.id}
                className="bg-white rounded-2xl border border-stone-300/80 shadow-2xs hover:shadow-lg transition-all flex flex-col justify-between overflow-hidden group hover:border-emerald-500"
              >
                {/* Block Header (Clickable to open drawer) */}
                <div className="p-5 border-b border-stone-100 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div
                      onClick={() => setSelectedLeadForDrawer(lead)}
                      className="space-y-0.5 cursor-pointer group/title"
                      title="Clica para abrir a ficha completa da lead"
                    >
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                          {lead.mediacaoTipoContrato || 'Sem Exclusividade'}
                        </span>
                        {hasClosed && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                            Vendido! 🎉
                          </span>
                        )}
                        <span className="text-[10px] text-emerald-700 font-bold group-hover/title:underline flex items-center gap-0.5">
                          <Eye className="w-3 h-3" />
                          <span>Abrir Ficha</span>
                        </span>
                      </div>

                      <h3 className="font-black text-base text-stone-900 leading-snug pt-1 group-hover/title:text-emerald-700 transition">
                        {lead.tipoImovel} em {lead.freguesia}
                      </h3>
                      <p className="text-xs text-stone-500 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>{lead.moradaZona || lead.freguesia}, {lead.concelho || 'Aveiro'}</span>
                      </p>
                    </div>

                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${userTheme.badgeBg} ${userTheme.badgeText}`}>
                      {lead.assignedTo}
                    </span>
                  </div>

                  {/* Property Specs summary */}
                  <div className="flex items-center gap-2 text-[11px] text-stone-600 pt-0.5">
                    {lead.areaM2 && <span className="font-bold text-stone-800">{lead.areaM2} m²</span>}
                    {lead.areaM2 && <span>•</span>}
                    <span className="truncate">{lead.estadoImovel || 'Estado geral bom'}</span>
                  </div>

                  {/* Pricing and Commission */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-100">
                    <div className="bg-[#FAF8F5] p-2.5 rounded-xl border border-stone-200">
                      <span className="text-[10px] text-stone-400 font-bold uppercase block">Preço de Venda</span>
                      <span className="text-sm font-black text-stone-900 block mt-0.5">
                        {formatCurrency(precoVenda)}
                      </span>
                    </div>

                    <div className="bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-200">
                      <span className="text-[10px] text-emerald-800 font-bold uppercase block">Comissão ({comissaoPercent}% IVA incl.)</span>
                      <span className="text-sm font-black text-emerald-800 block mt-0.5">
                        {formatCurrency(comissaoEur)}
                      </span>
                    </div>
                  </div>

                  {/* Owner Contact */}
                  <div className="flex items-center justify-between text-xs pt-1 text-stone-600">
                    <span className="truncate">Proprietário: <strong>{lead.nomeProprietario}</strong></span>
                    {lead.telefone && (
                      <div className="flex items-center gap-2">
                        <a
                          href={`tel:${lead.telefone}`}
                          className="text-amber-700 hover:underline font-mono text-[11px] font-semibold flex items-center gap-1"
                          title="Ligar ao Proprietário"
                        >
                          <Phone className="w-3 h-3" />
                          <span>{lead.telefone}</span>
                        </a>
                        <a
                          href={`https://wa.me/351${lead.telefone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-600 hover:text-emerald-700 text-[10px] font-bold flex items-center gap-0.5"
                          title="WhatsApp Proprietário"
                        >
                          <MessageSquare className="w-2.5 h-2.5" />
                          <span>WA</span>
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Requalification Notes snippet if present */}
                  {lead.requalificacaoNotas && (
                    <p className="text-[10px] text-stone-500 italic bg-amber-50/50 p-2 rounded-lg border border-amber-100 line-clamp-2">
                      "{lead.requalificacaoNotas}"
                    </p>
                  )}
                </div>

                {/* Traction / Buyers Pipeline Summary Strip */}
                <div className="p-4 bg-[#FAF8F5] border-b border-stone-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-stone-700 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-stone-500" />
                      <span>Pipeline de Interessados:</span>
                    </span>
                    <span className="text-[11px] font-extrabold text-stone-900 bg-white px-2 py-0.5 rounded-full border border-stone-300">
                      {buyers.length} Comprador(es)
                    </span>
                  </div>

                  {/* Phase counts pills */}
                  <div className="grid grid-cols-4 gap-1.5 text-center text-[10px]">
                    <div className="bg-white p-1.5 rounded-lg border border-stone-200">
                      <span className="text-stone-400 block">Interesse</span>
                      <strong className="text-blue-700 font-black text-xs">
                        {buyers.filter(b => b.fase === 'Interessado').length}
                      </strong>
                    </div>
                    <div className="bg-white p-1.5 rounded-lg border border-stone-200">
                      <span className="text-stone-400 block">Visitas</span>
                      <strong className="text-amber-700 font-black text-xs">
                        {buyers.filter(b => b.fase === 'Visita').length}
                      </strong>
                    </div>
                    <div className="bg-white p-1.5 rounded-lg border border-stone-200">
                      <span className="text-stone-400 block">Propostas</span>
                      <strong className="text-indigo-700 font-black text-xs">
                        {buyers.filter(b => b.fase === 'Proposta').length}
                      </strong>
                    </div>
                    <div className="bg-white p-1.5 rounded-lg border border-stone-200">
                      <span className="text-stone-400 block">Fechado</span>
                      <strong className="text-emerald-700 font-black text-xs">
                        {buyers.filter(b => b.fase === 'Fechado').length}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Block Bottom Actions */}
                <div className="p-3.5 bg-white flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedLeadForDrawer(lead)}
                      className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-semibold transition flex items-center gap-1"
                      title="Ver Ficha Geral e Histórico Completo"
                    >
                      <Eye className="w-3.5 h-3.5 text-stone-600" />
                      <span>Ficha</span>
                    </button>

                    <button
                      onClick={() => {
                        setEditingLead(lead);
                        setIsLeadFormOpen(true);
                      }}
                      className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-semibold transition flex items-center gap-1"
                      title="Editar Dados da Lead / Imóvel"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-stone-600" />
                      <span>Editar</span>
                    </button>
                  </div>

                  <button
                    onClick={() => openPropertyMediationCRM(lead)}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5 group-hover:scale-102"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Mini CRM</span>
                    <ChevronRight className="w-4 h-4 ml-0.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
