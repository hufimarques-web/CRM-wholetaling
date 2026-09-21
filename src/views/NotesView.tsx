import React, { useState } from 'react';
import { StickyNote, Plus, Pin, Trash2, Edit, Search, User, Filter, Check, Building } from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { Note, AppUser } from '../types/crm';
import { formatDatePT, formatDateTimePT, getUserTheme } from '../utils/formatters';

export const NotesView: React.FC = () => {
  const { notes, addNote, updateNote, deleteNote, togglePinNote, leads, setSelectedLeadForDrawer, currentUser } = useCRM();

  const [newNoteText, setNewNoteText] = useState('');
  const [selectedLeadId, setSelectedLeadId] = useState<string>('');
  const [isPinned, setIsPinned] = useState(false);

  // Filters
  const [userFilter, setUserFilter] = useState<'Todos' | AppUser>('Todos');
  const [onlyPinned, setOnlyPinned] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Inline editing note state
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    const lead = leads.find(l => l.id === selectedLeadId);

    addNote({
      text: newNoteText.trim(),
      leadId: selectedLeadId || undefined,
      leadTitle: lead ? `${lead.nomeProprietario} (${lead.freguesia})` : undefined,
      pinned: isPinned
    });

    setNewNoteText('');
    setSelectedLeadId('');
    setIsPinned(false);
  };

  const handleStartEdit = (note: Note) => {
    setEditingNoteId(note.id);
    setEditText(note.text);
  };

  const handleSaveEdit = (note: Note) => {
    if (!editText.trim()) return;
    updateNote({
      ...note,
      text: editText.trim()
    });
    setEditingNoteId(null);
  };

  const filteredNotes = notes.filter(n => {
    if (userFilter !== 'Todos' && n.author !== userFilter && n.assignedUser !== userFilter) return false;
    if (onlyPinned && !n.pinned) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText = n.text.toLowerCase().includes(q);
      const matchLead = n.leadTitle?.toLowerCase().includes(q);
      if (!matchText && !matchLead) return false;
    }
    return true;
  });

  // Sort: pinned first, then newest
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-[#16171B] text-white p-6 rounded-2xl shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-stone-800">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-white">Central de Notas & Follow-ups</h2>
          <p className="text-xs text-stone-400 mt-1">
            Espaço de registo rápido e acompanhamento contínuo de oportunidades para Queirós e Hugo.
          </p>
        </div>
      </div>

      {/* Primary Note Creator Box */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
        <h3 className="font-extrabold text-sm text-stone-900 flex items-center gap-2">
          <StickyNote className="w-4 h-4 text-amber-600" />
          <span>Criar Nova Nota</span>
        </h3>

        <form onSubmit={handleCreateNote} className="space-y-3">
          <textarea
            value={newNoteText}
            onChange={e => setNewNoteText(e.target.value)}
            placeholder="Escreva a nota, follow-up, resultado de reunião ou próximo passo..."
            rows={3}
            className="w-full p-3 bg-[#FAF8F5] border border-stone-200 rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition"
          />

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex flex-wrap items-center gap-3">
              {/* Author Locked to Session */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F3EFE6] rounded-xl border border-[#E2DDD3]">
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Autor da Sessão:</span>
                <span className="text-xs font-bold text-stone-900">{currentUser}</span>
              </div>

              {/* Optional Lead Link */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-stone-600">Associar Lead:</span>
                <select
                  value={selectedLeadId}
                  onChange={e => setSelectedLeadId(e.target.value)}
                  className="px-3 py-1.5 bg-[#FAF8F5] border border-stone-200 rounded-xl text-xs font-semibold focus:outline-none text-stone-700 max-w-[220px]"
                >
                  <option value="">Geral (Sem lead)</option>
                  {leads.map(l => (
                    <option key={l.id} value={l.id}>
                      {l.nomeProprietario} ({l.freguesia})
                    </option>
                  ))}
                </select>
              </div>

              {/* Pin Checkbox */}
              <label className="flex items-center gap-1.5 text-xs text-stone-700 font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={e => setIsPinned(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-stone-300"
                />
                <span>Fixar no topo</span>
              </label>
            </div>

            <button
              type="submit"
              className="px-5 py-2 bg-stone-900 hover:bg-black text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Guardar Nota</span>
            </button>
          </div>
        </form>
      </div>

      {/* Filter and Search Ribbon */}
      <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-3 flex-wrap gap-y-2">
          {/* User Filter */}
          <div className="flex items-center space-x-1.5">
            <span className="font-bold text-stone-700">Ver Notas de:</span>
            <select
              value={userFilter}
              onChange={e => setUserFilter(e.target.value as any)}
              className="px-2.5 py-1 bg-[#FAF8F5] border border-stone-200 rounded-xl text-xs font-semibold focus:outline-none"
            >
              <option value="Todos">Todos (Queirós & Hugo)</option>
              <option value="Queirós">Apenas Queirós</option>
              <option value="Hugo">Apenas Hugo</option>
            </select>
          </div>

          <label className="flex items-center gap-1 text-xs text-stone-700 font-semibold cursor-pointer">
            <input
              type="checkbox"
              checked={onlyPinned}
              onChange={e => setOnlyPinned(e.target.checked)}
              className="w-3.5 h-3.5 rounded text-amber-600 focus:ring-amber-500 border-stone-300"
            />
            <span>Apenas Fixadas</span>
          </label>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Pesquisar nas notas..."
            className="w-full pl-8 pr-3 py-1 bg-[#FAF8F5] border border-stone-200 rounded-xl text-xs focus:outline-none focus:bg-white"
          />
        </div>
      </div>

      {/* Notes Cards Grid */}
      {sortedNotes.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-stone-200 text-stone-400 text-xs">
          Nenhuma nota encontrada.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedNotes.map(note => {
            const userTheme = getUserTheme(note.author);
            const isEditing = editingNoteId === note.id;

            return (
              <div
                key={note.id}
                className={`bg-white rounded-2xl border p-4 shadow-2xs hover:shadow-md transition flex flex-col justify-between space-y-3 ${
                  note.pinned ? 'border-amber-300 bg-[#FAF8F4]' : 'border-stone-200'
                }`}
              >
                
                {/* Note Header */}
                <div className="flex items-start justify-between gap-2 border-b border-stone-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className={`w-6 h-6 rounded-lg text-[10px] font-black inline-flex items-center justify-center ${userTheme.avatarBg} shadow-2xs`}>
                      {userTheme.initial}
                    </span>
                    <div>
                      <span className="font-bold text-stone-900 text-xs block leading-tight">{userTheme.name}</span>
                      <span className="text-[10px] text-stone-400">{formatDateTimePT(note.date)}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => togglePinNote(note.id)}
                      className={`p-1.5 rounded-lg transition ${
                        note.pinned
                          ? 'text-amber-600 bg-amber-50 hover:bg-amber-100'
                          : 'text-stone-300 hover:text-stone-600 hover:bg-stone-100'
                      }`}
                      title={note.pinned ? 'Desafixar nota' : 'Fixar no topo'}
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleStartEdit(note)}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
                      title="Editar Nota"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition"
                      title="Eliminar Nota"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Note Content / Editing */}
                <div className="flex-1 text-xs">
                  {isEditing ? (
                    <div className="space-y-2">
                      <textarea
                        value={editText}
                        onChange={e => setEditText(e.target.value)}
                        rows={3}
                        className="w-full p-2 bg-white border border-amber-300 rounded-xl text-xs focus:outline-none"
                      />
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => setEditingNoteId(null)}
                          className="px-2.5 py-1 rounded-lg text-stone-600 text-[11px] font-semibold"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => handleSaveEdit(note)}
                          className="px-3 py-1 bg-stone-900 text-white rounded-lg text-[11px] font-bold"
                        >
                          Guardar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-stone-800 leading-relaxed whitespace-pre-line">
                      {note.text}
                    </p>
                  )}
                </div>

                {/* Associated Lead Tag */}
                {note.leadTitle && (
                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                    <button
                      onClick={() => {
                        const target = leads.find(l => l.id === note.leadId);
                        if (target) setSelectedLeadForDrawer(target);
                      }}
                      className="text-[11px] text-amber-800 hover:text-amber-900 font-bold flex items-center gap-1 bg-amber-50/80 px-2 py-0.5 rounded-md transition"
                    >
                      <Building className="w-3 h-3" />
                      <span className="truncate max-w-[180px]">{note.leadTitle}</span>
                    </button>

                    {note.pinned && (
                      <span className="text-[10px] font-extrabold uppercase text-amber-700">
                        Fixada
                      </span>
                    )}
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
