import React, { useState } from 'react';
import { PhoneCall, Edit, Trash2, Calendar, Sparkles, ArrowUpDown } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { Lead, LeadPhase } from '../../types/crm';
import { formatCurrency, formatDatePT, getContactStatusBadge, getPhaseBadge, getUserTheme } from '../../utils/formatters';

interface LeadsTableProps {
  filteredLeads: Lead[];
  faseFilter?: LeadPhase | 'Todas';
}

type SortField = 'nomeProprietario' | 'freguesia' | 'valorMinimoAbsoluto' | 'margemPotencial' | 'dataEntrada';

export const LeadsTable: React.FC<LeadsTableProps> = ({ filteredLeads, faseFilter }) => {
  const {
    setSelectedLeadForDrawer,
    setEditingLead,
    setIsLeadFormOpen,
    setPreselectedVisitLeadId,
    setIsVisitFormOpen,
    requestDeleteLead,
    openCallModal,
    openAIAnalysis
  } = useCRM();

  const [sortField, setSortField] = useState<SortField>('dataEntrada');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const sortedLeads = [...filteredLeads].sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];

    if (valA === undefined) return 1;
    if (valB === undefined) return -1;

    if (typeof valA === 'string') {
      return sortDir === 'asc'
        ? (valA as string).localeCompare(valB as string)
        : (valB as string).localeCompare(valA as string);
    }

    if (typeof valA === 'number') {
      return sortDir === 'asc'
        ? (valA as number) - (valB as number)
        : (valB as number) - (valA as number);
    }

    return 0;
  });

  return (
    <div className="bg-white rounded-2xl shadow-2xs border border-stone-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          
          {/* Table Header */}
          <thead>
            <tr className="bg-[#FAF8F5] border-b border-stone-200 text-stone-700 font-bold uppercase tracking-wider text-[10px]">
              <th className="py-3 px-4 w-12 text-center">User</th>
              <th
                onClick={() => handleSort('nomeProprietario')}
                className="py-3 px-4 cursor-pointer hover:bg-stone-100 transition"
              >
                <div className="flex items-center gap-1">
                  <span>Proprietário</span>
                  <ArrowUpDown className="w-3 h-3 text-stone-400" />
                </div>
              </th>

              <th
                onClick={() => handleSort('freguesia')}
                className="py-3 px-4 cursor-pointer hover:bg-stone-100 transition"
              >
                <div className="flex items-center gap-1">
                  <span>Freguesia</span>
                  <ArrowUpDown className="w-3 h-3 text-stone-400" />
                </div>
              </th>

              <th className="py-3 px-4">Preço / m² & Estado</th>

              <th
                onClick={() => handleSort('valorMinimoAbsoluto')}
                className="py-3 px-4 cursor-pointer hover:bg-stone-100 transition text-right"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Mínimo Absoluto</span>
                  <ArrowUpDown className="w-3 h-3 text-stone-400" />
                </div>
              </th>

              <th
                onClick={() => handleSort('margemPotencial')}
                className="py-3 px-4 cursor-pointer hover:bg-stone-100 transition text-right"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Margem Estimada</span>
                  <ArrowUpDown className="w-3 h-3 text-stone-400" />
                </div>
              </th>

              <th className="py-3 px-4">Contacto</th>
              <th className="py-3 px-4">Fase</th>
              <th className="py-3 px-4 text-center">Ações</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-stone-100">
            {sortedLeads.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-stone-400">
                  Nenhuma lead encontrada com os filtros selecionados.
                </td>
              </tr>
            ) : (
              sortedLeads.map(lead => {
                const contactBadge = getContactStatusBadge(lead.contacto);
                const phaseBadge = getPhaseBadge(lead.fase);
                const userTheme = getUserTheme(lead.assignedTo || 'Queirós');
                const isGoodDeal = lead.deltaMercadoPercent !== undefined && lead.deltaMercadoPercent <= -15;

                return (
                  <tr
                    key={lead.id}
                    onClick={() => setSelectedLeadForDrawer(lead)}
                    className="hover:bg-[#FAF8F5] cursor-pointer transition"
                  >
                    {/* User Avatar */}
                    <td className="py-3 px-3 text-center">
                      <span
                        title={`Responsável: ${userTheme.name}`}
                        className={`w-6 h-6 rounded-lg text-[10px] font-black inline-flex items-center justify-center ${userTheme.avatarBg} shadow-2xs`}
                      >
                        {userTheme.initial}
                      </span>
                    </td>

                    {/* Owner & Phone */}
                    <td className="py-3 px-4 font-bold text-stone-900">
                      <div>
                        <span className="block hover:text-amber-800 transition">{lead.nomeProprietario}</span>
                        <span className="text-[11px] text-stone-400 font-normal">{lead.telefone}</span>
                      </div>
                    </td>

                    {/* Freguesia & Type */}
                    <td className="py-3 px-4 text-stone-700">
                      <span className="font-semibold block text-stone-800">{lead.freguesia}</span>
                      <span className="text-[10px] text-stone-400">{lead.tipoImovel} • {lead.areaM2} m²</span>
                    </td>

                    {/* Price / m2 & Property Condition */}
                    <td className="py-3 px-4">
                      {lead.precoM2 ? (
                        <div>
                          <span className="font-extrabold text-stone-900 block">{lead.precoM2} €/m²</span>
                          <span className="text-[10px] text-stone-500 font-medium">{lead.estadoImovel}</span>
                        </div>
                      ) : (
                        <span className="text-stone-400 text-xs">{lead.estadoImovel || '-'}</span>
                      )}
                    </td>

                    {/* Min Abs Value */}
                    <td className="py-3 px-4 text-right font-extrabold text-stone-900">
                      {formatCurrency(lead.valorMinimoAbsoluto)}
                    </td>

                    {/* Potential Margin Column */}
                    <td className="py-3 px-4 text-right font-black text-emerald-600">
                      {formatCurrency(lead.margemPotencial)}
                    </td>

                    {/* Contact Badge */}
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${contactBadge.bg} ${contactBadge.text} ${contactBadge.border}`}>
                        {lead.contacto}
                      </span>
                    </td>

                    {/* Phase Badge */}
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${phaseBadge.bg} ${phaseBadge.text} ${phaseBadge.border}`}>
                        {lead.fase}
                      </span>
                    </td>

                    {/* Actions (100% Editable) */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center space-x-1" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => openAIAnalysis(lead)}
                          className="p-1 text-amber-700 hover:bg-amber-50 rounded-lg transition"
                          title="Análise AI Deal"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openCallModal(lead.id)}
                          className="p-1 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition"
                          title="Registar Chamada"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingLead(lead);
                            setIsLeadFormOpen(true);
                          }}
                          className="p-1 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition"
                          title="Editar Lead (100% editável)"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => requestDeleteLead(lead.id)}
                          className="p-1 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Eliminar Lead"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>

        </table>
      </div>
    </div>
  );
};
