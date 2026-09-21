import React, { useState, useMemo, useEffect } from 'react';
import { addDays, addWeeks, addMonths, subDays, subWeeks, subMonths, startOfWeek, format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, Filter, Calendar as CalendarIcon, Clock, User, MapPin } from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { VisitState, Visit } from '../types/crm';
import { formatDatePT, getVisitStateBadge } from '../utils/formatters';

type CalendarViewMode = 'month' | 'week' | 'day';

export const CalendarView: React.FC = () => {
  const { visits, setIsVisitFormOpen, setEditingVisit, setPreselectedVisitLeadId } = useCRM();

  // Initialize to CURRENT DATE dynamically
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  
  // Default to 'day' on narrow mobile screens (< 640px), else 'month'
  const [viewMode, setViewMode] = useState<CalendarViewMode>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 640) {
      return 'day';
    }
    return 'month';
  });

  // Dynamic Responsáveis list
  const uniqueResponsaveis = useMemo(() => {
    const defaultAgents = ['Carlos Silva', 'Ana Martins', 'Pedro Ramos', 'Hugo Marques'];
    const set = new Set<string>(defaultAgents);
    visits.forEach(v => { if (v.responsavel) set.add(v.responsavel); });
    return Array.from(set);
  }, [visits]);

  // Filters
  const [responsavelFilter, setResponsavelFilter] = useState<string>('Todos');
  const [estadoFilter, setEstadoFilter] = useState<VisitState | 'Todos'>('Todos');

  // Filtered Visits
  const filteredVisits = useMemo(() => {
    return visits.filter(v => {
      if (responsavelFilter !== 'Todos' && v.responsavel !== responsavelFilter) return false;
      if (estadoFilter !== 'Todos' && v.estado !== estadoFilter) return false;
      return true;
    });
  }, [visits, responsavelFilter, estadoFilter]);

  // Date Navigation logic with date-fns
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
    // Week title range
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekEnd = addDays(weekStart, 6);
    return `${format(weekStart, 'd')} - ${format(weekEnd, 'd')} de ${format(weekEnd, 'MMMM yyyy', { locale: pt })}`;
  }, [currentDate, viewMode]);

  // MONTH GRID COMPUTATION
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7; // Monday = 0
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

  // WEEK DAYS COMPUTATION using startOfWeek
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
      
      {/* Calendar Control Bar */}
      <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Navigation Controls */}
        <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center space-x-1">
            <button
              onClick={handlePrev}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition"
              title="Anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleToday}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
            >
              Hoje
            </button>
            <button
              onClick={handleNext}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition"
              title="Seguinte"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <h2 className="text-sm sm:text-base font-bold text-slate-900 capitalize text-center sm:text-left">
            {titleText}
          </h2>
        </div>

        {/* View Switchers & Action Button */}
        <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto justify-between sm:justify-end">
          
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setViewMode('month')}
              className={`px-2.5 sm:px-3 py-1 rounded-md transition ${viewMode === 'month' ? 'bg-white text-blue-600 shadow-xs font-bold' : 'text-slate-600'}`}
            >
              Mês
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-2.5 sm:px-3 py-1 rounded-md transition ${viewMode === 'week' ? 'bg-white text-blue-600 shadow-xs font-bold' : 'text-slate-600'}`}
            >
              Semana
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`px-2.5 sm:px-3 py-1 rounded-md transition ${viewMode === 'day' ? 'bg-white text-blue-600 shadow-xs font-bold' : 'text-slate-600'}`}
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
            className="flex items-center space-x-1 px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm transition shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Marcar Visita</span>
          </button>

        </div>

      </div>

      {/* Responsive Filter Toolbar with Flex Wrap */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 font-bold text-slate-700">
            <Filter className="w-3.5 h-3.5 text-blue-600" />
            <span>Filtrar Visitas:</span>
          </div>

          <div className="flex items-center space-x-1.5">
            <label className="text-[10px] font-semibold text-slate-500">Agente:</label>
            <select
              value={responsavelFilter}
              onChange={e => setResponsavelFilter(e.target.value)}
              className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none text-xs font-medium"
            >
              <option value="Todos">Todos os Agentes</option>
              {uniqueResponsaveis.map(ag => (
                <option key={ag} value={ag}>{ag}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-1.5">
            <label className="text-[10px] font-semibold text-slate-500">Estado:</label>
            <select
              value={estadoFilter}
              onChange={e => setEstadoFilter(e.target.value as any)}
              className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none text-xs font-medium"
            >
              <option value="Todos">Todos os Estados</option>
              <option value="Marcada">Marcada</option>
              <option value="Confirmada">Confirmada</option>
              <option value="Realizada">Realizada</option>
              <option value="Reagendar">Reagendar</option>
              <option value="Cancelada">Cancelada</option>
            </select>
          </div>
        </div>

        {/* State Color Legend (wraps cleanly) */}
        <div className="flex flex-wrap items-center gap-2.5 text-[10px] font-semibold text-slate-600 pt-1 sm:pt-0">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>Marcada</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>Confirmada</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-teal-600"></span>Realizada</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>Reagendar</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-gray-500"></span>Cancelada</span>
        </div>
      </div>

      {/* 1. MÊS VIEW GRID (with horizontal scroll on narrow mobile) */}
      {viewMode === 'month' && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-x-auto">
          <div className="min-w-[700px]">
            <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200 text-center text-[11px] font-bold text-slate-600 uppercase py-2.5">
              <div>Segunda</div>
              <div>Terça</div>
              <div>Quarta</div>
              <div>Quinta</div>
              <div>Sexta</div>
              <div>Sábado</div>
              <div>Domingo</div>
            </div>

            <div className="grid grid-cols-7 divide-x divide-y divide-slate-200 min-h-[500px]">
              {monthGridDays.map((cell, idx) => {
                if (!cell) return <div key={idx} className="bg-slate-50/50 p-2 min-h-[110px]" />;
                const isToday = cell.dateStr === todayStr;

                return (
                  <div
                    key={idx}
                    className={`p-2 min-h-[110px] space-y-1.5 hover:bg-slate-50 transition ${
                      isToday ? 'bg-blue-50/30' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${isToday ? 'bg-blue-600 text-white' : 'text-slate-700'}`}>
                        {cell.dayNumber}
                      </span>
                      {cell.visits.length > 0 && (
                        <span className="text-[10px] text-slate-400 font-medium">
                          {cell.visits.length} {cell.visits.length === 1 ? 'visita' : 'visitas'}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      {cell.visits.map(v => {
                        const st = getVisitStateBadge(v.estado);
                        return (
                          <div
                            key={v.id}
                            onClick={() => {
                              setEditingVisit(v);
                              setIsVisitFormOpen(true);
                            }}
                            className={`p-1.5 rounded-md border text-[10px] shadow-2xs cursor-pointer hover:scale-[1.02] transition space-y-0.5 ${st.bg} ${st.text} ${st.border}`}
                          >
                            <div className="font-bold truncate">{v.hora} — {v.nomeProprietario}</div>
                            <p className="truncate text-[9px] opacity-80">{v.concelhoFreguesia}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 2. SEMANA VIEW GRID (with horizontal scroll on narrow mobile: min-w-[700px]) */}
      {viewMode === 'week' && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-x-auto">
          <div className="min-w-[700px]">
            {/* Week Headers */}
            <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200 text-center py-2.5 divide-x divide-slate-200">
              {weekDays.map(wd => {
                const isToday = wd.dateStr === todayStr;
                return (
                  <div key={wd.dateStr} className="px-2">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">{wd.dayName}</span>
                    <span className={`text-sm font-extrabold inline-block px-2 py-0.5 rounded-full mt-0.5 ${isToday ? 'bg-blue-600 text-white' : 'text-slate-800'}`}>
                      {wd.dayNumber}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Week Columns Grid */}
            <div className="grid grid-cols-7 divide-x divide-slate-200 min-h-[500px]">
              {weekDays.map(wd => (
                <div key={wd.dateStr} className="p-2 space-y-2 bg-slate-50/30">
                  {wd.visits.length === 0 ? (
                    <div className="text-[10px] text-slate-400 text-center py-8 italic">Sem visitas</div>
                  ) : (
                    wd.visits.map(v => {
                      const st = getVisitStateBadge(v.estado);
                      return (
                        <div
                          key={v.id}
                          onClick={() => {
                            setEditingVisit(v);
                            setIsVisitFormOpen(true);
                          }}
                          className={`p-2 rounded-lg border text-xs shadow-2xs cursor-pointer hover:shadow-md transition space-y-1 ${st.bg} ${st.text} ${st.border}`}
                        >
                          <div className="font-bold flex items-center justify-between">
                            <span>{v.hora}</span>
                            <span className="text-[9px] uppercase font-semibold">{v.estado}</span>
                          </div>
                          <p className="font-extrabold text-slate-900 leading-tight">{v.nomeProprietario}</p>
                          <p className="text-[10px] text-slate-600 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{v.concelhoFreguesia}</span>
                          </p>
                          <p className="text-[10px] text-slate-500 flex items-center gap-1">
                            <User className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{v.responsavel}</span>
                          </p>
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

      {/* 3. DIA VIEW GRID (Optimized for Mobile) */}
      {viewMode === 'day' && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-blue-600" />
              Visitas para {formatDatePT(singleDayStr)} ({singleDayVisits.length})
            </h3>
            <span className="text-xs text-slate-500">Dia Específico</span>
          </div>

          {singleDayVisits.length === 0 ? (
            <div className="text-center py-16 bg-slate-50 rounded-xl border border-slate-200 text-slate-400 text-xs">
              Nenhuma visita agendada para este dia.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {singleDayVisits.map(v => {
                const st = getVisitStateBadge(v.estado);
                return (
                  <div
                    key={v.id}
                    onClick={() => {
                      setEditingVisit(v);
                      setIsVisitFormOpen(true);
                    }}
                    className="p-4 bg-slate-50 hover:bg-blue-50/50 rounded-xl border border-slate-200 shadow-xs cursor-pointer transition space-y-2"
                  >
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <span className="font-extrabold text-slate-900 text-sm">{v.nomeProprietario}</span>
                      <span className={`px-2.5 py-0.5 rounded text-xs font-semibold border ${st.bg} ${st.text} ${st.border}`}>
                        {v.estado}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs text-slate-700">
                      <p className="flex items-center gap-1.5 font-bold text-blue-600">
                        <Clock className="w-3.5 h-3.5" />
                        Hora: {v.hora}
                      </p>
                      <p className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        Morada: {v.moradaZona}, {v.concelhoFreguesia}
                      </p>
                      <p className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        Responsável: {v.responsavel}
                      </p>
                    </div>

                    {v.notas && (
                      <p className="text-[11px] text-slate-600 italic bg-white p-2 rounded border border-slate-200">
                        {v.notas}
                      </p>
                    )}
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
