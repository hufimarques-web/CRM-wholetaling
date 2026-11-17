export const BUYER_STAGES = ['Novo', 'A contactar', 'Qualificado', 'Visita', 'Proposta', 'CPCV', 'Vendido', 'Base de informação'];
export const PROPERTY_STAGES = ['Angariação', 'Contrato assinado', 'Em comercialização', 'Reservado', 'CPCV', 'Vendido', 'Suspenso'];
export const FINANCE_STATES = ['Por confirmar', 'Precisa de apoio', 'Em análise', 'Pré-aprovado', 'Aprovado', 'Capitais próprios'];
export const SOURCES = ['Meta Ads', 'Parceiro profissional', 'Referenciação pública', 'Direto'];
export const PROPERTY_TYPES = ['Apartamento', 'Moradia', 'Terreno', 'Prédio'];
export const QUESTIONS = [
  { key: 'intent', label: 'Pretende comprar um imóvel?', short: 'Intenção de compra' },
  { key: 'area', label: 'Procura na região de Aveiro?', short: 'Zona de atuação' },
  { key: 'budget', label: 'Tem um orçamento de compra definido?', short: 'Orçamento definido' },
  { key: 'finance', label: 'Tem crédito pré-aprovado/aprovado ou capitais próprios?', short: 'Financiamento preparado' }
];
export const EVENT_NAMES = { Qualificado: 'QualifiedLead', Visita: 'Schedule', Proposta: 'Proposal', CPCV: 'CPCV' };
export const CONSENT_VERSION = 'buyers-2026-11-17-v1';
export const OWNER_QUESTIONS = [
  { key: 'contact', label: 'Este é o seu contacto e podemos falar consigo sobre a venda?' },
  { key: 'authority', label: 'É proprietário ou está autorizado a tratar da venda?' },
  { key: 'area', label: 'O imóvel fica na região de Aveiro?' },
  { key: 'mediation', label: 'Quer conhecer um serviço de mediação para vender o imóvel?' }
];
export const OWNER_STAGES = ['Novo', 'A contactar', 'Qualificado', 'Reunião marcada', 'Contrato assinado', 'Base de informação'];
export function screenOwner(owner) {
  if (OWNER_QUESTIONS.some(q => owner.answers?.[q.key] === false)) return 'Não elegível';
  return OWNER_QUESTIONS.every(q => owner.answers?.[q.key] === true) && owner.zone && owner.propertyType ? 'Elegível' : 'Pendente';
}
export function ownerCanSend(owner) {
  return screenOwner(owner) === 'Elegível' && !!owner.callValidatedAt && !!owner.qualifiedAt && owner.stage !== 'Base de informação' && owner.marketingConsent === true && !!owner.consentAt && owner.consentVersion === CONSENT_VERSION;
}
export function routeMatches(event, campaign) {
  return !!campaign?.pixelId && campaign.enabled === true && event.campaignId === campaign.id && event.pixelId === campaign.pixelId;
}

export function screenBuyer(buyer) {
  const answers = buyer.answers || {};
  if (QUESTIONS.some(q => answers[q.key] === false)) return 'Não elegível';
  if (!QUESTIONS.every(q => answers[q.key] === true)) return 'Pendente';
  if (!(buyer.budget > 0) || !buyer.zones?.length || !buyer.propertyTypes?.length) return 'Pendente';
  return ['Pré-aprovado', 'Aprovado', 'Capitais próprios'].includes(buyer.financeStatus) ? 'Elegível' : 'Pendente';
}

export function isValidated(buyer) {
  return screenBuyer(buyer) === 'Elegível' && Boolean(buyer.callValidatedAt) && Boolean(buyer.qualifiedAt) && buyer.stage !== 'Base de informação';
}

export function canSendMeta(buyer) {
  return isValidated(buyer) && buyer.marketingConsent === true && Boolean(buyer.consentAt) && buyer.consentVersion === CONSENT_VERSION && !buyer.isDemo;
}

const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
export function matchBuyer(buyer, property) {
  if (!isValidated(buyer) || buyer.stage === 'Vendido') return false;
  if (!['Contrato assinado', 'Em comercialização', 'Reservado'].includes(property.stage)) return false;
  if (!buyer.zones.some(zone => normalize(zone) === normalize(property.zone))) return false;
  if (!buyer.propertyTypes.includes(property.propertyType)) return false;
  return buyer.budget >= property.price && (!buyer.bedrooms || property.bedrooms >= buyer.bedrooms);
}

export function rewardEligible(buyer) {
  return Boolean(buyer.cpcvAt) && buyer.depositConfirmed === true && ['CPCV', 'Vendido'].includes(buyer.stage);
}

export function eventId(buyerId, name) { return `mediation:${buyerId}:${name}:v1`; }

export function normalizePhone(value) {
  let phone = String(value || '').replace(/[\s().-]/g, '').replace(/^00/, '+');
  if (/^[29]\d{8}$/.test(phone)) phone = '+351' + phone;
  return /^\+[1-9]\d{7,14}$/.test(phone) ? phone : '';
}

export function funnelStats(buyers) {
  return SOURCES.map(source => {
    const rows = buyers.filter(b => b.source === source);
    return { source, total: rows.length, screened: rows.filter(b => screenBuyer(b) === 'Elegível').length,
      qualified: rows.filter(isValidated).length, cpcv: rows.filter(b => b.cpcvAt).length,
      sold: rows.filter(b => b.stage === 'Vendido').length };
  });
}
