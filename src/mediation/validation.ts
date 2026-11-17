import { BUYER_STAGES, FINANCE_STATES, PROPERTY_STAGES, PROPERTY_TYPES, QUESTIONS, SOURCES, normalizePhone } from './domain.mjs';

export class InputError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}
export const str = (value: unknown, max = 500, required = false) => {
  if (value === undefined || value === null) { if (required) throw new InputError('Preencha os campos obrigatórios.'); return ''; }
  if (typeof value !== 'string' || value.length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value)) throw new InputError('Texto inválido ou demasiado longo.');
  const text = value.trim();
  if (required && !text) throw new InputError('Preencha os campos obrigatórios.');
  return text;
};
const choice = (value: unknown, options: readonly string[], fallback: string) => {
  if (value === undefined) return fallback;
  if (typeof value !== 'string' || !options.includes(value)) throw new InputError('Opção inválida.');
  return value;
};
const num = (value: unknown, max = 100000000, fallback = 0) => {
  if (value === undefined || value === '') return fallback;
  if (!['number', 'string'].includes(typeof value) || !Number.isFinite(Number(value)) || Number(value) < 0 || Number(value) > max) throw new InputError('Valor numérico inválido.');
  return Number(value);
};
const strings = (value: unknown, maxItems = 20): string[] => {
  if (!Array.isArray(value) || value.length > maxItems) throw new InputError('Lista inválida.');
  return Array.from(new Set(value.map(x => str(x, 100, true))));
};
export function attribution(value: unknown) {
  const raw = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  const result: Record<string, string> = {};
  for (const key of ['fbclid', 'fbc', 'fbp', 'lead_id', 'utm_source', 'utm_campaign', 'utm_medium', 'utm_content']) {
    const text = str(raw[key], 500);
    if (text) result[key] = text;
  }
  if (result.lead_id && !/^\d{5,30}$/.test(result.lead_id)) throw new InputError('ID de lead Meta inválido.');
  for (const key of ['fbc', 'fbp']) if (result[key] && !/^fb\.\d+\.\d+\.[A-Za-z0-9_-]+$/.test(result[key])) throw new InputError('Identificador Meta inválido.');
  return result;
}
export function buyerInput(raw: Record<string, any>, old: Record<string, any> = {}) {
  const b = { ...old, ...raw };
  const phone = normalizePhone(str(b.phone, 30, true));
  if (!phone) throw new InputError('Indique um telefone com indicativo válido.');
  const email = str(b.email, 254);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new InputError('Email inválido.');
  const answers: Record<string, boolean | null> = {};
  for (const q of QUESTIONS) {
    const answer = b.answers?.[q.key];
    if (answer !== undefined && answer !== null && typeof answer !== 'boolean') throw new InputError('Confirme as respostas de qualificação.');
    answers[q.key] = answer ?? null;
  }
  const propertyTypes = strings(b.propertyTypes || []);
  if (propertyTypes.some(t => !PROPERTY_TYPES.includes(t))) throw new InputError('Tipo de imóvel inválido.');
  if (b.marketingConsent !== undefined && typeof b.marketingConsent !== 'boolean') throw new InputError('Consentimento inválido.');
  if (b.depositConfirmed !== undefined && typeof b.depositConfirmed !== 'boolean') throw new InputError('Confirme o recebimento do sinal.');
  const date = b.nextContactAt ? new Date(b.nextContactAt) : null;
  if (date && !Number.isFinite(date.getTime())) throw new InputError('Data inválida.');
  const bedrooms = num(b.bedrooms, 20);
  if (!Number.isInteger(bedrooms)) throw new InputError('Número de quartos inválido.');
  return {
    name: str(b.name, 120, true), phone, email: email || null,
    source: choice(b.source, SOURCES, 'Direto'), zones: strings(b.zones || []), propertyTypes,
    budget: num(b.budget), bedrooms, timeframe: str(b.timeframe || 'Por confirmar', 100),
    financeStatus: choice(b.financeStatus, FINANCE_STATES, 'Por confirmar'), answers,
    stage: choice(b.stage, BUYER_STAGES, 'Novo'), assignedTo: choice(b.assignedTo, ['Hugo', 'Queirós'], 'Hugo'),
    notes: str(b.notes, 10000), nextContactAt: date, propertyId: str(b.propertyId, 120) || null,
    depositConfirmed: b.depositConfirmed === true, marketingConsent: b.marketingConsent === true,
    attribution: attribution(b.attribution)
  };
}
export function propertyInput(raw: Record<string, any>) {
  const price = num(raw.price);
  if (!price) throw new InputError('Indique o preço do imóvel.');
  const bedrooms = num(raw.bedrooms, 20);
  if (!Number.isInteger(bedrooms)) throw new InputError('Número de quartos inválido.');
  return {
    title: str(raw.title, 180, true), zone: str(raw.zone, 100, true),
    propertyType: choice(raw.propertyType, PROPERTY_TYPES, 'Apartamento'), bedrooms, price,
    business: choice(raw.business, ['Mediação', 'Construção de raiz'], 'Mediação'),
    stage: choice(raw.stage, PROPERTY_STAGES, 'Angariação'), ownerName: str(raw.ownerName, 120),
    ownerPhone: str(raw.ownerPhone, 30), commission: num(raw.commission, 100),
    description: str(raw.description, 10000), assignedTo: choice(raw.assignedTo, ['Hugo', 'Queirós'], 'Hugo')
  };
}
export function partnerInput(raw: Record<string, any>) {
  return { name: str(raw.name, 120, true), phone: str(raw.phone, 30), email: str(raw.email, 254) || null,
    kind: choice(raw.kind, ['Profissional', 'Público'], 'Profissional'), specialty: str(raw.specialty, 120),
    reward: num(raw.reward, 100000, 2000), active: raw.active !== false, notes: str(raw.notes, 4000) };
}
