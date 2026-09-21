import React, { useState } from 'react';
import { PhoneCall, Edit, Trash2, Calendar, FileText, ArrowUpDown, ChevronDown, ChevronUp } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { Lead, LeadPhase } from '../../types/crm';
import { formatCurrency, formatDatePT, getContactStatusBadge, getPhotoStatusBadge, getPhaseBadge, getPriorityBadge } from '../../utils/formatters';

interface LeadsTableProps {
  filteredLeads: Lead[];
  faseFilter?: LeadPhase | 'Todas';
}

type SortField = 'nomeProprietario' | 'concelho' | 'valorMinimoAbsoluto' | 'margemPotencial' | 'dataEntrada';

export const LeadsTable: React.FC<LeadsTableProps> = ({ filteredLeads, faseFilter }) => {
  const {
    setSelectedLeadForDrawer,
    setEditingLead,
    setIsLeadFormOpen,
    setPreselectedVisitLeadId,
    setIsVisitFormOpen,
    setPreselectedProposalLeadId,
    setIsProposalFormOpen,
    requestDeleteLead,
    openCallModal
  } = useCRM();

  const [sortField, setSortField] = useState<SortField>('dataEntrada');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const isOnlyInitialPhases = faseFilter === 'Nova lead' || faseFilter === 'Em análise';

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
    <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          
          {/* Table Header */}
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
              <th
                onClick={() => handleSort('nomeProprietario')}
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition"
              >
                <div className="flex items-center gap-1">
                  <span>Proprietário</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              <th
                onClick={() => handleSort('concelho')}
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition"
              >
                <div className="flex items-center gap-1">
                  <span>Concelho / Freguesia</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              <th className="py-3 px-4">Tipo & Área</th>

              <th
                onClick={() => handleSort('valorMinimoAbsoluto')}
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition text-right"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Mínimo Absoluto</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              {!isOnlyInitialPhases && (
                <th
                  onClick={() => handleSort('margemPotencial')}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition text-right"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Margem Pot.</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
              )}

              <th className="py-3 px-4">Contacto</th>
              <th className="py-3 px-4">Fotos</th>
              <th className="py-3 px-4">Fase</th>
              <th className="py-3 px-4">Prioridade</th>
              <th className="py-3 px-4 text-center">Ações</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-100">
            {sortedLeads.length === 0 ? (
              <tr>
                <td colSpan={isOnlyInitialPhases ? 9 : 10} className="py-8 text-center text-slate-400">
                  Nenhuma lead encontrada com os filtros selecionados.
                </td>
              </tr>
            ) : (
              sortedLeads.map(lead => {
                const contactBadge = getContactStatusBadge(lead.contacto);
                const photoBadge = getPhotoStatusBadge(lead.fotos);
                const phaseBadge = getPhaseBadge(lead.fase);
                const priorityBadge = getPriorityBadge(lead.prioridade);

                const isRowInitialPhase = lead.fase === 'Nova lead' || lead.fase === 'Em análise';

                return (
                  <tr
                    key={lead.id}
                    onClick={() => setSelectedLeadForDrawer(lead)}
                    className="hover:bg-blue-50/40 cursor-pointer transition"
                  >
                    {/* Owner & Phone */}
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      <div>
                        <span className="block hover:text-blue-600 transition">{lead.nomeProprietario}</span>
                        <span className="text-[11px] text-slate-500 font-normal">{lead.telefone}</span>
                      </div>
                    </td>

                    {/* Location */}
                    <td className="py-3 px-4 text-slate-700">
                      <span className="font-medium block">{lead.concelho}</span>
                      <span className="text-[11px] text-slate-500">{lead.freguesia}</span>
                    </td>

                    {/* Type & Area */}
                    <td className="py-3 px-4 text-slate-700">
                      <span className="font-semibold block">{lead.tipoImovel}</span>
                      <span className="text-[11px] text-slate-500">{lead.areaM2} m²</span>
                    </td>

                    {/* Min Abs Value */}
                    <td className="py-3 px-4 text-right font-extrabold text-slate-900">
                      {formatCurrency(lead.valorMinimoAbsoluto)}
                    </td>

                    {/* Potential Margin Column (Hidden if only initial phases filtered) */}
                    {!isOnlyInitialPhases && (
                      <td className="py-3 px-4 text-right font-bold text-emerald-600">
                        {isRowInitialPhase ? (
                          <span className="text-slate-400 font-normal">-</span>
                        ) : (
                          formatCurrency(lead.margemPotencial)
                        )}
                      </td>
                    )}

                    {/* Contact Badge */}
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${contactBadge.bg} ${contactBadge.text} ${contactBadge.border}`}>
                        {lead.contacto}
                      </span>
                    </td>

                    {/* Photo Badge */}
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${photoBadge.bg} ${photoBadge.text} ${photoBadge.border}`}>
                        {lead.fotos}
                      </span>
                    </td>

                    {/* Phase Badge */}
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${phaseBadge.bg} ${phaseBadge.text} ${phaseBadge.border}`}>
                        {lead.fase}
                      </span>
                    </td>

                    {/* Priority Badge */}
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 text-[9px] rounded uppercase font-semibold ${priorityBadge.bg}`}>
                        {priorityBadge.text}
                      </span>
                    </td>

                    {/* Row Actions */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center space-x-1" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => openCallModal(lead.id)}
                          className="p-1.5 rounded text-blue-600 bg-blue-50 hover:bg-blue-100 font-semibold transition"
                          title="Registar chamada com esta lead"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            setPreselectedVisitLeadId(lead.id);
                            setIsVisitFormOpen(true);
                          }}
                          className="p-1.5 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"
                          title="Marcar Visita"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            setEditingLead(lead);
                            setIsLeadFormOpen(true);
                          }}
                          className="p-1.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                          title="Editar"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => requestDeleteLead(lead.id)}
                          className="p-1.5 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                          title="Eliminar"
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
