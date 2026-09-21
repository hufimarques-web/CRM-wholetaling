import { ContactStatus, PhotoStatus, LeadPhase, PriorityLevel, VisitState, ProposalState, Lead } from '../types/crm';

/**
 * Format numbers as Portuguese Euros (€)
 */
export const formatCurrency = (val: number | undefined | null): string => {
  if (val === undefined || val === null || isNaN(val)) return 'Valor a definir';
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(val);
};

/**
 * Format date strings (YYYY-MM-DD or ISO) into Portuguese date string
 */
export const formatDatePT = (dateStr: string | undefined): string => {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return new Intl.DateTimeFormat('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(d);
  } catch {
    return dateStr;
  }
};

/**
 * Calculate potential margin for lead: (Avaliação - Mínimo Absoluto)
 */
export const calcLeadPotentialMargin = (avaliacao?: number, minAbsoluto?: number): number => {
  if (!avaliacao || !minAbsoluto) return 0;
  return avaliacao - minAbsoluto;
};

/**
 * Calculate predicted margin for proposal: (Revenda - Proposta)
 */
export const calcProposalMargin = (revenda: number, proposta: number): number => {
  return (revenda || 0) - (proposta || 0);
};

/**
 * Calculate spread percentage with zero division protection
 */
export const calcProposalSpread = (revenda: number, proposta: number): number => {
  if (!revenda || revenda <= 0) return 0;
  const margem = calcProposalMargin(revenda, proposta);
  return Number(((margem / revenda) * 100).toFixed(1));
};

/**
 * Determine Lead Readiness Badges
 */
export const checkLeadReadiness = (lead: Lead) => {
  const readyForVisit = lead.contacto === 'Contactado' || lead.contacto === 'Reunião marcada' || lead.fotos === 'Fotos recebidas';
  const readyForProposal = lead.valorMinimoAbsoluto > 0 && lead.fotos === 'Fotos recebidas' && lead.fase !== 'Descartada';
  
  return {
    readyForVisit,
    readyForProposal
  };
};

/**
 * Color classes helper for Contact Status
 */
export const getContactStatusBadge = (status: ContactStatus) => {
  switch (status) {
    case 'Não contactado':
      return { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200', dot: 'bg-red-500' };
    case 'Sem resposta':
      return { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200', dot: 'bg-amber-500' };
    case 'Contactado':
      return { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200', dot: 'bg-blue-500' };
    case 'Reunião marcada':
      return { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-200', dot: 'bg-emerald-500' };
  }
};

/**
 * Color classes helper for Photo Status
 */
export const getPhotoStatusBadge = (status: PhotoStatus) => {
  switch (status) {
    case 'Sem fotos':
      return { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' };
    case 'Fotos pedidas':
      return { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200' };
    case 'Fotos recebidas':
      return { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-200' };
  }
};

/**
 * Color classes helper for Lead Phase
 */
export const getPhaseBadge = (fase: LeadPhase) => {
  switch (fase) {
    case 'Nova lead':
      return { bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-300' };
    case 'Em análise':
      return { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' };
    case 'Pronta para proposta':
      return { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300' };
    case 'CPCV a preparar':
      return { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300' };
    case 'Descartada':
      return { bg: 'bg-gray-100', text: 'text-gray-500', border: 'border-gray-200' };
  }
};

/**
 * Color classes helper for Priority Level
 */
export const getPriorityBadge = (priority: PriorityLevel) => {
  switch (priority) {
    case 'Urgente':
      return { bg: 'bg-red-500 text-white font-semibold', text: 'Imediatamente' };
    case 'Alta':
      return { bg: 'bg-orange-500 text-white font-medium', text: 'Curto prazo' };
    case 'Média':
      return { bg: 'bg-blue-500 text-white font-normal', text: 'Normal' };
    case 'Baixa':
      return { bg: 'bg-slate-200 text-slate-700 font-normal', text: 'Sem pressa' };
  }
};

/**
 * Color classes helper for Visit State
 */
export const getVisitStateBadge = (state: VisitState) => {
  switch (state) {
    case 'Marcada':
      return { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' };
    case 'Confirmada':
      return { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-200' };
    case 'Realizada':
      return { bg: 'bg-teal-100', text: 'text-teal-800', border: 'border-teal-200' };
    case 'Reagendar':
      return { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200' };
    case 'Cancelada':
      return { bg: 'bg-gray-100', text: 'text-gray-500', border: 'border-gray-200' };
  }
};

/**
 * Color classes helper for Proposal State
 */
export const getProposalStateBadge = (state: ProposalState) => {
  switch (state) {
    case 'Enviada':
      return { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' };
    case 'Em negociação':
      return { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200' };
    case 'Aceite':
      return { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-200' };
    case 'Recusada':
      return { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' };
    case 'Expirada':
      return { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' };
  }
};
