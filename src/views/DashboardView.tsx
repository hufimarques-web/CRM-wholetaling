import React from 'react';
import {
  Building2, PhoneCall, Search, Camera, Calendar, FileText, CheckCircle2, XCircle,
  AlertTriangle, Clock, TrendingUp, ArrowRight, MapPin, ExternalLink
} from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { formatCurrency, formatDatePT, getContactStatusBadge, getPhaseBadge, getVisitStateBadge, getProposalStateBadge } from '../utils/formatters';

export const DashboardView: React.FC = () => {
  const { leads, visits, proposals, setActiveTab, setSelectedLeadForDrawer, setLeadViewMode } = useCRM();

  // Metrics
  const totalLeads = leads.length;
  const porContactar = leads.filter(l => l.contacto === 'Não contactado').length;
  const emAnalise = leads.filter(l => l.fase === 'Em análise').length;
  const fotosRecebidas = leads.filter(l => l.fotos === 'Fotos recebidas').length;

  const visitasMarcadas = visits.filter(v => v.estado === 'Marcada' || v.estado === 'Confirmada').length;
  const propostasEnviadas = proposals.filter(p => p.estado === 'Enviada' || p.estado === 'Em negociação').length;
  const propostasAceites = proposals.filter(p => p.estado === 'Aceite').length;
  const propostasRecusadas = proposals.filter(p => p.estado === 'Recusada').length;

  // Upcoming Visits (sorted by date/time)
  const upcomingVisits = [...visits]
    .filter(v => v.estado === 'Marcada' || v.estado === 'Confirmada')
    .sort((a, b) => new Date(`${a.data}T${a.hora}`).getTime() - new Date(`${b.data}T${b.hora}`).getTime())
    .slice(0, 5);

  // Urgent Leads (Priority: Urgente or Alta)
  const urgentLeads = leads
    .filter(l => l.prioridade === 'Urgente' || l.prioridade === 'Alta')
    .slice(0, 5);

  // Proposals Pending Follow-up
  const pendingProposals = proposals
    .filter(p => p.estado === 'Enviada' || p.estado === 'Em negociação')
    .slice(0, 5);

  const kpiCards = [
    { title: 'Total de Leads', value: totalLeads, icon: Building2, color: 'text-blue-600 bg-blue-50 border-blue-200' },
    { title: 'Por Contactar', value: porContactar, icon: PhoneCall, color: 'text-red-600 bg-red-50 border-red-200' },
    { title: 'Em Análise', value: emAnalise, icon: Search, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
    { title: 'Fotos Recebidas', value: fotosRecebidas, icon: Camera, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    { title: 'Visitas Marcadas', value: visitasMarcadas, icon: Calendar, color: 'text-sky-600 bg-sky-50 border-sky-200' },
    { title: 'Propostas Enviadas', value: propostasEnviadas, icon: FileText, color: 'text-purple-600 bg-purple-50 border-purple-200' },
    { title: 'Propostas Aceites', value: propostasAceites, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    { title: 'Propostas Recusadas', value: propostasRecusadas, icon: XCircle, color: 'text-gray-500 bg-gray-50 border-gray-200' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-[#0B132B] text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Painel Operacional — Wholetailing CRM</h2>
          <p className="text-xs text-slate-300 mt-1">
            Resumo global do pipeline de arbitragem imobiliária em Aveiro, Coimbra e Viseu.
          </p>
        </div>
        <button
          onClick={() => {
            setLeadViewMode('funnel');
            setActiveTab('leads');
          }}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-2 shrink-0"
        >
          <span>Ver Funil Completo</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Grid of 8 Metric KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {kpiCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition flex items-center justify-between"
            >
              <div>
                <span className="text-[11px] font-semibold text-slate-500 block leading-tight">{card.title}</span>
                <span className="text-2xl font-extrabold text-slate-900 mt-1 block">{card.value}</span>
              </div>
              <div className={`p-3 rounded-xl border ${card.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Pipeline Summary & Action Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Upcoming Visits */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              Próximas Visitas ({upcomingVisits.length})
            </h3>
            <button
              onClick={() => setActiveTab('calendar')}
              className="text-xs text-blue-600 hover:underline font-semibold"
            >
              Ver Calendário
            </button>
          </div>

          {upcomingVisits.length === 0 ? (
            <p className="text-slate-400 text-xs text-center py-6">Sem visitas agendadas em breve.</p>
          ) : (
            <div className="space-y-3">
              {upcomingVisits.map(v => {
                const st = getVisitStateBadge(v.estado);
                return (
                  <div key={v.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{v.nomeProprietario}</span>
                      <span className={`px-2 py-0.5 text-[9px] rounded font-semibold border ${st.bg} ${st.text} ${st.border}`}>
                        {v.estado}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {v.moradaZona}, {v.concelhoFreguesia}
                    </p>
                    <p className="text-[10px] text-blue-600 font-semibold flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDatePT(v.data)} às {v.hora} • Agente: {v.responsavel}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Urgent Leads */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              Leads Urgentes ({urgentLeads.length})
            </h3>
            <button
              onClick={() => {
                setLeadViewMode('table');
                setActiveTab('leads');
              }}
              className="text-xs text-blue-600 hover:underline font-semibold"
            >
              Ver Todas
            </button>
          </div>

          {urgentLeads.length === 0 ? (
            <p className="text-slate-400 text-xs text-center py-6">Nenhuma lead urgente pendente.</p>
          ) : (
            <div className="space-y-3">
              {urgentLeads.map(l => (
                <div
                  key={l.id}
                  onClick={() => setSelectedLeadForDrawer(l)}
                  className="p-3 bg-slate-50 hover:bg-blue-50/50 rounded-xl border border-slate-200 text-xs space-y-1 cursor-pointer transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{l.nomeProprietario}</span>
                    <span className="px-2 py-0.5 bg-red-500 text-white rounded text-[9px] font-bold">
                      {l.prazoPretendido}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600">{l.concelho} ({l.freguesia}) • {l.tipoImovel}</p>
                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span className="text-slate-500">Mín: <strong>{formatCurrency(l.valorMinimoAbsoluto)}</strong></span>
                    <span className="text-emerald-600 font-bold">Margem: {formatCurrency(l.margemPotencial)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Proposals Pending Follow-up */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-600" />
              Propostas Pendentes ({pendingProposals.length})
            </h3>
            <button
              onClick={() => setActiveTab('proposals')}
              className="text-xs text-blue-600 hover:underline font-semibold"
            >
              Ir para Propostas
            </button>
          </div>

          {pendingProposals.length === 0 ? (
            <p className="text-slate-400 text-xs text-center py-6">Nenhuma proposta pendente.</p>
          ) : (
            <div className="space-y-3">
              {pendingProposals.map(p => {
                const st = getProposalStateBadge(p.estado);
                return (
                  <div key={p.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{p.nomeProprietario}</span>
                      <span className={`px-2 py-0.5 text-[9px] rounded font-semibold border ${st.bg} ${st.text} ${st.border}`}>
                        {p.estado}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-600">Proposta: <strong className="text-blue-600">{formatCurrency(p.valorProposta)}</strong></span>
                      <span className="text-slate-600">Margem: <strong className="text-emerald-600">{formatCurrency(p.margemPrevista)}</strong></span>
                    </div>
                    {p.proximoFollowUp && (
                      <p className="text-[10px] text-purple-700 font-medium">
                        Follow-Up Agendado: {formatDatePT(p.proximoFollowUp)}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
