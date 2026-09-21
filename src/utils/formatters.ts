import { ContactStatus, PhotoStatus, LeadPhase, PriorityLevel, VisitState, ProposalState, Lead, AppUser, MarketDealRating } from '../types/crm';

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
 * Format date strings into short readable time e.g. "Hoje às 14:30"
 */
export const formatDateTimePT = (dateStr: string | undefined): string => {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return new Intl.DateTimeFormat('pt-PT', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
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
 * Calculate default down payment (sinal) at 10%
 */
export const calcDefaultSinal = (valorProposta: number): number => {
  if (!valorProposta || valorProposta <= 0) return 0;
  return Math.round(valorProposta * 0.10);
};

/**
 * Calculate multiple: Margem Prevista / Valor do Sinal (e.g. 30.000 / 10.000 = 3.0x)
 */
export const calcProposalMultiple = (margemPrevista: number, valorSinal: number): number => {
  if (!valorSinal || valorSinal <= 0) return 0;
  return Number((margemPrevista / valorSinal).toFixed(1));
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
 * User Identity & Theme styling
 */
export const getUserTheme = (user?: AppUser | string) => {
  if (user === 'Queirós') {
    return {
      name: 'Queirós',
      initial: 'Q',
      badgeBg: 'bg-emerald-50',
      badgeText: 'text-emerald-800',
      badgeBorder: 'border-emerald-200',
      avatarBg: 'bg-emerald-600 text-white',
      ringColor: 'ring-emerald-500',
      dot: 'bg-emerald-500'
    };
  }
  if (user === 'Hugo') {
    return {
      name: 'Hugo',
      initial: 'H',
      badgeBg: 'bg-amber-50',
      badgeText: 'text-amber-800',
      badgeBorder: 'border-amber-200',
      avatarBg: 'bg-amber-600 text-white',
      ringColor: 'ring-amber-500',
      dot: 'bg-amber-500'
    };
  }
  return {
    name: user || 'Geral',
    initial: (user && user[0]) ? user[0].toUpperCase() : 'CRM',
    badgeBg: 'bg-stone-100',
    badgeText: 'text-stone-700',
    badgeBorder: 'border-stone-200',
    avatarBg: 'bg-stone-600 text-white',
    ringColor: 'ring-stone-400',
    dot: 'bg-stone-400'
  };
};

/**
 * Market rating badge styling
 */
export const getMarketRatingBadge = (rating?: MarketDealRating) => {
  switch (rating) {
    case 'ouro':
      return {
        bg: 'bg-emerald-50',
        text: 'text-emerald-800',
        border: 'border-emerald-300',
        label: '🔥 Oportunidade Incrível'
      };
    case 'bom':
      return {
        bg: 'bg-teal-50',
        text: 'text-teal-800',
        border: 'border-teal-300',
        label: '🟢 Bom Negócio'
      };
    case 'medio':
      return {
        bg: 'bg-stone-100',
        text: 'text-stone-700',
        border: 'border-stone-300',
        label: '🟡 Na Média'
      };
    case 'fraco':
      return {
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-300',
        label: '🔴 Fraco / Caro'
      };
    default:
      return {
        bg: 'bg-stone-100',
        text: 'text-stone-600',
        border: 'border-stone-200',
        label: 'Estudo de Mercado'
      };
  }
};

/**
 * Color classes helper for Contact Status
 */
export const getContactStatusBadge = (status: ContactStatus) => {
  switch (status) {
    case 'Não contactado':
      return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500' };
    case 'Sem resposta':
      return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' };
    case 'Contactado':
      return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' };
    case 'Reunião marcada':
      return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' };
  }
};

/**
 * Color classes helper for Photo Status
 */
export const getPhotoStatusBadge = (status: PhotoStatus) => {
  switch (status) {
    case 'Sem fotos':
      return { bg: 'bg-stone-100', text: 'text-stone-600', border: 'border-stone-200' };
    case 'Fotos pedidas':
      return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
    case 'Fotos recebidas':
      return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
  }
};

/**
 * Color classes helper for Lead Phase
 */
export const getPhaseBadge = (fase: LeadPhase) => {
  switch (fase) {
    case 'Nova lead':
      return { bg: 'bg-stone-100', text: 'text-stone-700', border: 'border-stone-200' };
    case 'Em análise':
      return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
    case 'Pronta para proposta':
      return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
    case 'CPCV a preparar':
      return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
    case 'Descartada':
      return { bg: 'bg-stone-100', text: 'text-stone-400', border: 'border-stone-200' };
  }
};

/**
 * Color classes helper for Priority Level
 */
export const getPriorityBadge = (priority: PriorityLevel) => {
  switch (priority) {
    case 'Urgente':
      return { bg: 'bg-red-600 text-white font-semibold', text: 'Imediatamente' };
    case 'Alta':
      return { bg: 'bg-amber-600 text-white font-medium', text: 'Curto prazo' };
    case 'Média':
      return { bg: 'bg-blue-600 text-white font-normal', text: 'Normal' };
    case 'Baixa':
      return { bg: 'bg-stone-200 text-stone-700 font-normal', text: 'Sem pressa' };
  }
};

/**
 * Color classes helper for Visit State
 */
export const getVisitStateBadge = (state: VisitState) => {
  switch (state) {
    case 'Marcada':
      return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
    case 'Confirmada':
      return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
    case 'Realizada':
      return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-300' };
    case 'Reagendar':
      return { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' };
    case 'Cancelada':
      return { bg: 'bg-stone-100', text: 'text-stone-400', border: 'border-stone-200' };
  }
};

/**
 * Color classes helper for Proposal State
 */
export const getProposalStateBadge = (state: ProposalState) => {
  switch (state) {
    case 'Enviada':
      return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
    case 'Em negociação':
      return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
    case 'Aceite':
      return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-300' };
    case 'Recusada':
      return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' };
    case 'Expirada':
      return { bg: 'bg-stone-100', text: 'text-stone-500', border: 'border-stone-200' };
  }
};
