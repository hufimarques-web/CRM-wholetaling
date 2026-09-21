import React, { useState, useMemo } from 'react';
import { addDays, addWeeks, addMonths, subDays, subWeeks, subMonths, startOfWeek, format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, Filter, Calendar as CalendarIcon, Clock, User, MapPin, Check, CheckCircle } from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { VisitState, Visit } from '../types/crm';
import { formatDatePT, getVisitStateBadge, getUserTheme } from '../utils/formatters';

type CalendarViewMode = 'month' | 'week' | 'day';

export const CalendarView: React.FC = () => {
  const { visits, setIsVisitFormOpen, setEditingVisit, setPreselectedVisitLeadId, toggleVisitRealizada, currentUser } = useCRM();

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<CalendarViewMode>('month');

  // Filters
  const [responsavelFilter, setResponsavelFilter] = useState<string>('Todos');
  const [estadoFilter, setEstadoFilter] = useState<VisitState | 'Todos'>('Todos');

  // Filtered Visits
  const filteredVisits = useMemo(() => {
    return visits.filter(v => {
      if (responsavelFilter !== 'Todos' && v.responsavel !== responsavelFilter && v.assignedUser !== responsavelFilter) return false;
      if (estadoFilter !== 'Todos' && v.estado !== estadoFilter) return false;
      return true;
    });
  }, [visits, responsavelFilter, estadoFilter]);

  // Date Navigation logic
  const handlePrev = () => {
    if (viewMode === 'month') setCurrentDate(prev => subMonths(prev, 1));
    else if (viewMode === 'week') setCurrentDate(prev => subWeeks(prev, 1));
    else setCurrentDate(prev => subDays(prev, 1));
  };

  const handleNext = () => {
    if (viewMode === 'month') setCurrentDate(prev => addMonths(prev, 1));
    else if (viewMode === 'week') setCurrentDate(prev => addWeeks(prev, 1));
    else setCurrentDate(prev => addDays(prev, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Title formatting
  const titleText = useMemo(() => {
    if (viewMode === 'month') {
      return format(currentDate, 'MMMM yyyy', { locale: pt });
    }
    if (viewMode === 'day') {
      return format(currentDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: pt });
    }
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekEnd = addDays(weekStart, 6);
    return `${format(weekStart, 'd')} - ${format(weekEnd, 'd')} de ${format(weekEnd, 'MMMM yyyy', { locale: pt })}`;
  }, [currentDate, viewMode]);

  // MONTH GRID COMPUTATION
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthGridDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < firstDayIndex; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const dayDate = new Date(year, month, d);
      const dateStr = format(dayDate, 'yyyy-MM-dd');
      const dayVisits = filteredVisits.filter(v => v.data === dateStr);
      days.push({ dayNumber: d, dateStr, visits: dayVisits });
    }
    return days;
  }, [year, month, daysInMonth, firstDayIndex, filteredVisits]);

  // WEEK DAYS COMPUTATION
  const weekDays = useMemo(() => {
    const days = [];
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });

    for (let i = 0; i < 7; i++) {
      const d = addDays(weekStart, i);
      const dateStr = format(d, 'yyyy-MM-dd');
      const dayVisits = filteredVisits.filter(v => v.data === dateStr);
      days.push({
        date: d,
        dateStr,
        dayName: format(d, 'eee', { locale: pt }),
        dayNumber: d.getDate(),
        visits: dayVisits
      });
    }
    return days;
  }, [currentDate, filteredVisits]);

  // DAY VISITS COMPUTATION
  const singleDayStr = format(currentDate, 'yyyy-MM-dd');
  const singleDayVisits = useMemo(() => {
    return filteredVisits.filter(v => v.data === singleDayStr);
  }, [filteredVisits, singleDayStr]);

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  return (
    <div className="space-y-4">
      
      {/* Calendar Top Control Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-2xs border border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Navigation Controls */}
        <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center space-x-1">
            <button
              onClick={handlePrev}
              className="p-2 hover:bg-stone-100 rounded-xl text-stone-600 transition"
              title="Anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleToday}
              className="px-3 py-1.5 text-xs font-bold bg-[#FAF8F5] hover:bg-[#F3EFE6] text-stone-700 rounded-xl border border-stone-200 transition"
            >
              Hoje
            </button>
            <button
              onClick={handleNext}
              className="p-2 hover:bg-stone-100 rounded-xl text-stone-600 transition"
              title="Seguinte"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <h2 className="text-sm sm:text-base font-extrabold text-stone-900 capitalize text-center sm:text-left">
            {titleText}
          </h2>
        </div>

        {/* View Switchers & Action Button */}
        <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto justify-between sm:justify-end">
          
          <div className="flex items-center bg-[#F3EFE6] p-0.5 rounded-xl border border-[#E2DDD3] text-xs font-semibold">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 rounded-lg transition ${viewMode === 'month' ? 'bg-white text-stone-900 shadow-xs font-bold' : 'text-stone-600'}`}
            >
              Mês
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 rounded-lg transition ${viewMode === 'week' ? 'bg-white text-stone-900 shadow-xs font-bold' : 'text-stone-600'}`}
            >
              Semana
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1 rounded-lg transition ${viewMode === 'day' ? 'bg-white text-stone-900 shadow-xs font-bold' : 'text-stone-600'}`}
            >
              Dia
            </button>
          </div>

          <button
            onClick={() => {
              setEditingVisit(null);
              setPreselectedVisitLeadId(null);
              setIsVisitFormOpen(true);
            }}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-stone-900 hover:bg-black text-white rounded-xl text-xs font-bold shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>Agendar Visita</span>
          </button>
        </div>

      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3 rounded-2xl shadow-2xs border border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-3 flex-wrap gap-y-2">
          <div className="flex items-center space-x-1.5">
            <span className="font-bold text-stone-700">Utilizador:</span>
            <select
              value={responsavelFilter}
              onChange={(e) => setResponsavelFilter(e.target.value)}
              className="px-2.5 py-1 bg-[#FAF8F5] border border-stone-200 rounded-xl text-xs font-semibold focus:outline-none"
            >
              <option value="Todos">Todos (Queirós & Hugo)</option>
              <option value="Queirós">Queirós</option>
              <option value="Hugo">Hugo</option>
            </select>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="font-bold text-stone-700">Estado:</span>
            <select
              value={estadoFilter}
              onChange={(e) => setEstadoFilter(e.target.value as any)}
              className="px-2.5 py-1 bg-[#FAF8F5] border border-stone-200 rounded-xl text-xs font-semibold focus:outline-none"
            >
              <option value="Todos">Todos os Estados</option>
              <option value="Marcada">Marcada</option>
              <option value="Confirmada">Confirmada</option>
              <option value="Realizada">Realizada (Já feita)</option>
              <option value="Reagendar">Reagendar</option>
              <option value="Cancelada">Cancelada</option>
            </select>
          </div>
        </div>

        <div className="text-[11px] text-stone-500 font-medium">
          Total Visitas: <strong>{filteredVisits.length}</strong> ({filteredVisits.filter(v => v.estado === 'Realizada').length} realizadas)
        </div>
      </div>

      {/* 1. MONTH VIEW GRID */}
      {viewMode === 'month' && (
        <div className="bg-white rounded-2xl shadow-2xs border border-stone-200 overflow-hidden">
          <div className="grid grid-cols-7 bg-[#FAF8F5] border-b border-stone-200 text-center py-2.5 text-[11px] font-bold text-stone-600 uppercase tracking-wider divide-x divide-stone-200">
            <div>Seg</div>
            <div>Ter</div>
            <div>Qua</div>
            <div>Qui</div>
            <div>Sex</div>
            <div>Sáb</div>
            <div>Dom</div>
          </div>

          <div className="grid grid-cols-7 divide-x divide-y divide-stone-100 min-h-[550px]">
            {monthGridDays.map((item, idx) => {
              if (!item) {
                return <div key={`empty-${idx}`} className="bg-[#FAF8F5]/40 min-h-[90px]" />;
              }

              const isToday = item.dateStr === todayStr;

              return (
                <div
                  key={item.dateStr}
                  onClick={() => {
                    setCurrentDate(new Date(year, month, item.dayNumber));
                    setViewMode('day');
                  }}
                  className="min-h-[95px] p-1.5 hover:bg-amber-50/20 cursor-pointer transition flex flex-col justify-between"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-xs font-extrabold w-6 h-6 flex items-center justify-center rounded-full ${
                      isToday ? 'bg-amber-600 text-white' : 'text-stone-800'
                    }`}>
                      {item.dayNumber}
                    </span>
                  </div>

                  <div className="space-y-1 overflow-y-auto max-h-[75px]">
                    {item.visits.map(v => {
                      const userTheme = getUserTheme(v.assignedUser || v.responsavel);
                      const isRealizada = v.estado === 'Realizada';
                      return (
                        <div
                          key={v.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingVisit(v);
                            setIsVisitFormOpen(true);
                          }}
                          className={`px-1.5 py-0.5 rounded-lg text-[10px] font-semibold truncate border flex items-center justify-between ${
                            isRealizada
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-stone-50 text-stone-800 border-stone-200'
                          }`}
                        >
                          <span className="truncate">{v.hora} • {v.nomeProprietario}</span>
                          <span className={`w-3.5 h-3.5 rounded text-[8px] font-black flex items-center justify-center shrink-0 ml-1 ${userTheme.avatarBg}`}>
                            {userTheme.initial}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. WEEK VIEW GRID */}
      {viewMode === 'week' && (
        <div className="bg-white rounded-2xl shadow-2xs border border-stone-200 overflow-x-auto">
          <div className="min-w-[700px]">
            <div className="grid grid-cols-7 bg-[#FAF8F5] border-b border-stone-200 text-center py-2.5 divide-x divide-stone-200">
              {weekDays.map(wd => {
                const isToday = wd.dateStr === todayStr;
                return (
                  <div key={wd.dateStr} className="px-2">
                    <span className="text-[10px] uppercase font-bold text-stone-500 block">{wd.dayName}</span>
                    <span className={`text-xs font-black inline-block px-2 py-0.5 rounded-full mt-0.5 ${isToday ? 'bg-amber-600 text-white' : 'text-stone-800'}`}>
                      {wd.dayNumber}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-7 divide-x divide-stone-200 min-h-[500px]">
              {weekDays.map(wd => (
                <div key={wd.dateStr} className="p-2 space-y-2 bg-[#FAF8F5]/30">
                  {wd.visits.length === 0 ? (
                    <div className="text-[10px] text-stone-400 text-center py-8 italic">Sem visitas</div>
                  ) : (
                    wd.visits.map(v => {
                      const userTheme = getUserTheme(v.assignedUser || v.responsavel);
                      const isRealizada = v.estado === 'Realizada';
                      return (
                        <div
                          key={v.id}
                          onClick={() => {
                            setEditingVisit(v);
                            setIsVisitFormOpen(true);
                          }}
                          className={`p-2.5 rounded-xl border text-xs shadow-2xs cursor-pointer hover:shadow-md transition space-y-1.5 ${
                            isRealizada ? 'bg-emerald-50 text-emerald-900 border-emerald-200' : 'bg-white text-stone-800 border-stone-200'
                          }`}
                        >
                          <div className="font-bold flex items-center justify-between text-[11px]">
                            <span>{v.hora}</span>
                            <span className={`w-4 h-4 rounded text-[9px] font-black flex items-center justify-center ${userTheme.avatarBg}`}>
                              {userTheme.initial}
                            </span>
                          </div>
                          <p className="font-extrabold text-stone-900 leading-tight truncate">{v.nomeProprietario}</p>
                          <p className="text-[10px] text-stone-500 truncate">{v.concelhoFreguesia}</p>

                          <div className="pt-1 border-t border-stone-100 flex items-center justify-between">
                            <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${isRealizada ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-700'}`}>
                              {v.estado}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleVisitRealizada(v.id);
                              }}
                              className="text-[9px] font-bold text-stone-600 hover:text-stone-900 underline"
                            >
                              {isRealizada ? 'Reverter' : 'Marcar Feita'}
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. DAY VIEW GRID */}
      {viewMode === 'day' && (
        <div className="bg-white rounded-2xl shadow-2xs border border-stone-200 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <h3 className="font-extrabold text-stone-900 text-sm flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-amber-600" />
              Visitas para {formatDatePT(singleDayStr)} ({singleDayVisits.length})
            </h3>
            <span className="text-xs text-stone-500 font-medium">Dia Específico</span>
          </div>

          {singleDayVisits.length === 0 ? (
            <div className="text-center py-16 bg-[#FAF8F5] rounded-xl border border-stone-200 text-stone-400 text-xs">
              Nenhuma visita agendada para este dia.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {singleDayVisits.map(v => {
                const userTheme = getUserTheme(v.assignedUser || v.responsavel);
                const isRealizada = v.estado === 'Realizada';
                return (
                  <div
                    key={v.id}
                    className="p-4 bg-[#FAF8F5] rounded-xl border border-stone-200 shadow-2xs space-y-2.5"
                  >
                    <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-stone-900 text-sm">{v.nomeProprietario}</span>
                        <span className={`w-5 h-5 rounded-md text-[10px] font-black inline-flex items-center justify-center ${userTheme.avatarBg}`}>
                          {userTheme.initial}
                        </span>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold border ${isRealizada ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-white text-stone-700 border-stone-200'}`}>
                        {v.estado}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs text-stone-700">
                      <p className="flex items-center gap-1.5 font-bold text-stone-900">
                        <Clock className="w-3.5 h-3.5 text-stone-400" />
                        Hora: {v.hora}
                      </p>
                      <p className="flex items-center gap-1.5 text-stone-600">
                        <MapPin className="w-3.5 h-3.5 text-stone-400" />
                        Morada: {v.moradaZona}, {v.concelhoFreguesia}
                      </p>
                      <p className="flex items-center gap-1.5 text-stone-600">
                        <User className="w-3.5 h-3.5 text-stone-400" />
                        Responsável: {userTheme.name}
                      </p>
                    </div>

                    {v.notas && (
                      <p className="text-xs text-stone-600 italic bg-white p-2.5 rounded-lg border border-stone-200">
                        {v.notas}
                      </p>
                    )}

                    <div className="pt-2 border-t border-stone-200 flex items-center justify-between">
                      <button
                        onClick={() => toggleVisitRealizada(v.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                          isRealizada
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-white hover:bg-emerald-50 text-stone-800 border border-stone-300'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{isRealizada ? 'Visita Concluída' : 'Marcar como Feita'}</span>
                      </button>

                      <button
                        onClick={() => {
                          setEditingVisit(v);
                          setIsVisitFormOpen(true);
                        }}
                        className="text-xs font-bold text-stone-600 hover:text-stone-900 underline"
                      >
                        Editar Visita
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
