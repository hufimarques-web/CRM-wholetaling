import React, { useState, useMemo } from 'react';
import {
  Archive,
  RotateCcw,
  Trash2,
  ExternalLink,
  Search,
  Building,
  MapPin,
  Phone,
  Calendar,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { formatCurrency, formatDatePT, getUserTheme } from '../utils/formatters';
import { AppUser } from '../types/crm';

export const DiscardedView: React.FC = () => {
  const {
    leads,
    restoreLead,
    requestDeleteLead,
    setSelectedLeadForDrawer,
    setActiveTab,
    currentUser
  } = useCRM();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserFilter, setSelectedUserFilter] = useState<'Todos' | AppUser>('Todos');
  const [selectedFreguesiaFilter, setSelectedFreguesiaFilter] = useState('Todas');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Filter only discarded leads (Wholetailing, Mediação descartada ou Desativada)
  const discardedLeads = useMemo(() => {
    return leads
      .filter(l => l.fase === 'Descartada' || l.modeloNegocio === 'Desativada' || l.mediacaoFase === 'Descartado')
      .sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        if (timeA !== timeB) return timeB - timeA;
        return a.id.localeCompare(b.id);
      });
  }, [leads]);

  // Unique freguesias
  const uniqueFreguesias = useMemo(() => {
    const set = new Set<string>();
    discardedLeads.forEach(l => { if (l.freguesia) set.add(l.freguesia); });
    return Array.from(set);
  }, [discardedLeads]);

  // Apply search and dropdown filters
  const filteredDiscardedLeads = useMemo(() => {
    return discardedLeads.filter(l => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const match =
          l.nomeProprietario.toLowerCase().includes(q) ||
          l.freguesia.toLowerCase().includes(q) ||
          l.telefone.includes(q) ||
          (l.notas && l.notas.some(n => n.text.toLowerCase().includes(q)));
        if (!match) return false;
      }

      if (selectedUserFilter !== 'Todos' && l.assignedTo !== selectedUserFilter) {
        return false;
      }

      if (selectedFreguesiaFilter !== 'Todas' && l.freguesia !== selectedFreguesiaFilter) {
        return false;
      }

      return true;
    });
  }, [discardedLeads, searchQuery, selectedUserFilter, selectedFreguesiaFilter]);

  const handleRestore = (leadId: string, leadName: string) => {
    restoreLead(leadId, 'Nova lead');
    setActionNotice(`Lead "${leadName}" foi reativada com sucesso e regressou à coluna "Nova lead"!`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Banner de Aviso de Ação / Notificação */}
      {actionNotice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900 flex items-center justify-between shadow-xs animate-fade-in">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionNotice}</span>
          </div>
          <button
            onClick={() => setActiveTab('leads')}
            className="font-bold underline hover:text-emerald-950 ml-3 shrink-0"
          >
            Ver no Funil &rarr;
          </button>
        </div>
      )}

      {/* Header Banner (Obsidian luxury theme) */}
      <div className="bg-[#141518] text-white p-6 rounded-2xl shadow-md border border-stone-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-950/60 text-rose-300 border border-rose-800/40 uppercase tracking-wider">
              <Archive className="w-3 h-3" />
              Arquivo Separado
            </span>
            <span className="text-stone-600">•</span>
            <span className="text-xs text-stone-400">
              {discardedLeads.length} {discardedLeads.length === 1 ? 'lead arquivada' : 'leads arquivadas'}
            </span>
          </div>
          <h2 className="text-xl font-black tracking-tight text-white font-display">
            Leads Descartadas
          </h2>
          <p className="text-xs text-stone-400 mt-1 max-w-2xl leading-relaxed">
            As oportunidades descartadas saem automaticamente do painel e do funil principal para manter a pipeline limpa. Pode consultar o histórico, rever motivos de descarte ou reativar qualquer oportunidade a qualquer momento.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('leads')}
          className="flex items-center gap-2 px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white rounded-xl text-xs font-semibold border border-stone-700 transition shrink-0"
        >
          <span>Regressar ao Funil Principal</span>
          &rarr;
        </button>
      </div>

      {/* Barra de Filtros e Pesquisa */}
      <div className="bg-white rounded-xl shadow-2xs border border-stone-200 p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Pesquisar por proprietário, telefone, notas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-900 transition"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          {/* User Filter */}
          <select
            value={selectedUserFilter}
            onChange={(e) => setSelectedUserFilter(e.target.value as any)}
            className="text-xs bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 focus:outline-none focus:border-stone-900 font-medium"
          >
            <option value="Todos">Todos os Utilizadores</option>
            <option value="Queirós">Queirós</option>
            <option value="Hugo">Hugo</option>
          </select>

          {/* Freguesia Filter */}
          <select
            value={selectedFreguesiaFilter}
            onChange={(e) => setSelectedFreguesiaFilter(e.target.value)}
            className="text-xs bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 focus:outline-none focus:border-stone-900 font-medium max-w-[200px]"
          >
            <option value="Todas">Todas as Freguesias</option>
            {uniqueFreguesias.map(f => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Lista de Leads Descartadas */}
      {filteredDiscardedLeads.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center shadow-2xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-center mx-auto text-stone-400">
            <Archive className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-stone-900 font-display">
            {discardedLeads.length === 0
              ? 'Nenhuma lead descartada de momento'
              : 'Nenhuma lead corresponde aos filtros'}
          </h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
            {discardedLeads.length === 0
              ? 'Quando mover uma lead para "Descartada" no funil ou na ficha, ela desaparecerá da página principal e surgirá aqui organizada para histórico e reativação.'
              : 'Tente limpar a pesquisa ou os filtros selecionados para visualizar todas as leads arquivadas.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAF8F5] border-b border-stone-200 text-[10px] font-black uppercase tracking-wider text-stone-500">
                  <th className="py-3.5 px-4">Proprietário & Contacto</th>
                  <th className="py-3.5 px-4">Imóvel & Localização</th>
                  <th className="py-3.5 px-4">Valor Mínimo</th>
                  <th className="py-3.5 px-4">Origem / Modelo</th>
                  <th className="py-3.5 px-4">Responsável</th>
                  <th className="py-3.5 px-4">Data Entrada</th>
                  <th className="py-3.5 px-4">Motivo / Última Nota</th>
                  <th className="py-3.5 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredDiscardedLeads.map(lead => {
                  const userTheme = getUserTheme(lead.assignedTo);
                  const latestNote = lead.notas && lead.notas.length > 0 ? lead.notas[0] : null;
                  const valor = lead.mediacaoPrecoVenda || lead.valorMinimoAbsoluto;

                  return (
                    <tr
                      key={lead.id}
                      className="hover:bg-amber-50/40 transition group"
                    >
                      {/* Proprietário & Contacto */}
                      <td className="py-3.5 px-4 align-middle">
                        <div
                          onClick={() => setSelectedLeadForDrawer(lead)}
                          className="font-bold text-stone-900 cursor-pointer hover:text-emerald-700 transition"
                        >
                          {lead.nomeProprietario}
                        </div>
                        {lead.telefone ? (
                          <div className="flex items-center gap-2 mt-0.5 text-[11px]">
                            <a
                              href={`tel:${lead.telefone}`}
                              className="text-stone-500 hover:text-amber-800 flex items-center gap-1 font-mono"
                            >
                              <Phone className="w-3 h-3 text-amber-600" />
                              <span>{lead.telefone}</span>
                            </a>
                            <a
                              href={`https://wa.me/351${lead.telefone.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-600 hover:text-emerald-700 font-bold text-[10px]"
                            >
                              WA
                            </a>
                          </div>
                        ) : (
                          <span className="text-[10px] text-stone-400 italic">Sem contacto</span>
                        )}
                      </td>

                      {/* Imóvel & Localização */}
                      <td className="py-3.5 px-4 align-middle">
                        <div className="font-semibold text-stone-800 flex items-center gap-1">
                          <Building className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                          <span>{lead.tipoImovel}</span>
                          {lead.areaM2 && <span className="text-stone-500 font-normal">({lead.areaM2} m²)</span>}
                        </div>
                        <div className="text-[11px] text-stone-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-amber-600 shrink-0" />
                          <span className="truncate max-w-[160px]">{lead.freguesia}</span>
                        </div>
                      </td>

                      {/* Valor Mínimo */}
                      <td className="py-3.5 px-4 align-middle whitespace-nowrap">
                        <span className="font-black text-stone-900">
                          {formatCurrency(valor)}
                        </span>
                      </td>

                      {/* Origem / Modelo */}
                      <td className="py-3.5 px-4 align-middle whitespace-nowrap">
                        <div className="flex flex-col gap-1 items-start">
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-50 text-rose-700 border border-rose-200 uppercase tracking-wider">
                            Descartada
                          </span>
                          {lead.modeloNegocio === 'Mediação' && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-50 text-amber-900 border border-amber-300 uppercase tracking-wider">
                              Mediação
                            </span>
                          )}
                          {lead.modeloNegocio === 'Desativada' && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-stone-100 text-stone-700 border border-stone-300 uppercase tracking-wider">
                              Desativada
                            </span>
                          )}
                          {(lead.modeloNegocio === 'Wholetailing' || !lead.modeloNegocio) && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-stone-50 text-stone-600 border border-stone-200 uppercase tracking-wider">
                              Wholetailing
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Responsável */}
                      <td className="py-3.5 px-4 align-middle whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${userTheme.badgeBg} ${userTheme.badgeText} ${userTheme.badgeBorder}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${userTheme.dot}`}></span>
                          <span>{lead.assignedTo}</span>
                        </span>
                      </td>

                      {/* Data Entrada */}
                      <td className="py-3.5 px-4 align-middle whitespace-nowrap text-stone-500 text-[11px]">
                        {formatDatePT(lead.dataEntrada)}
                      </td>

                      {/* Motivo / Última Nota */}
                      <td className="py-3.5 px-4 align-middle max-w-xs">
                        {lead.requalificacaoNotas ? (
                          <p className="text-[11px] text-amber-900 italic line-clamp-2 bg-amber-50/60 p-1.5 rounded border border-amber-100">
                            "{lead.requalificacaoNotas}"
                          </p>
                        ) : latestNote ? (
                          <p className="text-[11px] text-stone-600 italic line-clamp-2" title={latestNote.text}>
                            "{latestNote.text}"
                          </p>
                        ) : (
                          <span className="text-[10px] text-stone-400 italic">Sem notas</span>
                        )}
                      </td>

                      {/* Ações */}
                      <td className="py-3.5 px-4 align-middle text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedLeadForDrawer(lead)}
                            className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-semibold transition"
                            title="Ver Ficha Completa"
                          >
                            Ficha
                          </button>

                          <button
                            onClick={() => handleRestore(lead.id, lead.nomeProprietario)}
                            className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-2xs transition flex items-center gap-1"
                            title="Reativar Lead e colocar no funil ativo"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Reativar</span>
                          </button>

                          <button
                            onClick={() => requestDeleteLead(lead.id)}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition"
                            title="Eliminar definitivamente"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
