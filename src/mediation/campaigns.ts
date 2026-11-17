import { InputError, str } from './validation';
import { canSendMeta, EVENT_NAMES, CONSENT_VERSION } from './domain.mjs';

export function campaignInput(raw: any) {
  const kind = str(raw.kind || 'Imóvel', 30);
  if (!['Imóvel', 'Angariação'].includes(kind)) throw new InputError('Tipo de página inválido.');
  const slug = str(raw.slug, 80, true);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new InputError('Use apenas letras minúsculas, números e hífen na ligação.');
  const pixelId = str(raw.pixelId, 30), tokenEnv = str(raw.tokenEnv, 80);
  if (pixelId && !/^\d{5,30}$/.test(pixelId)) throw new InputError('ID de Pixel inválido.');
  if (tokenEnv && !/^META_TOKEN_[A-Z0-9_]+$/.test(tokenEnv)) throw new InputError('Indique o nome da variável privada, por exemplo META_TOKEN_ANGARIACAO. Não introduza o token.');
  const imageUrl = str(raw.imageUrl, 1500);
  if (imageUrl && !/^https:\/\//.test(imageUrl)) throw new InputError('A fotografia deve usar uma ligação HTTPS.');
  const propertyId = kind === 'Imóvel' ? str(raw.propertyId, 120, true) : null;
  return { name: str(raw.name, 140, true), slug, kind, propertyId, headline: str(raw.headline, 220, true),
    description: str(raw.description, 3000), imageUrl, pixelId, tokenEnv, testCode: str(raw.testCode, 100),
    published: raw.published === true, enabled: raw.enabled === true };
}

export function campaignStatus(campaign: any, env = process.env) {
  const missing = [];
  if (!campaign.pixelId) missing.push('ID do Pixel');
  if (!/^META_TOKEN_[A-Z0-9_]+$/.test(campaign.tokenEnv || '') || !env[campaign.tokenEnv]) missing.push('Token privado na Vercel');
  if (env.META_API_VERSION && !/^v\d+\.\d+$/.test(env.META_API_VERSION)) missing.push('Versão da API inválida');
  return { configured: !missing.length, enabled: campaign.enabled, testMode: !!campaign.testCode, pixelId: campaign.pixelId || null, missing };
}

export async function recordAcquisition(tx: any, buyer: any, raw: any) {
  if (!raw.campaignId) return;
  const campaign = await tx.adCampaign.findUnique({ where: { id: raw.campaignId } });
  if (!campaign || campaign.kind !== 'Imóvel' || !campaign.published) throw new InputError('Esta página já não está disponível.');
  // First contact with each campaign is immutable; repeated submissions cannot rewrite attribution or consent.
  await tx.buyerAcquisition.upsert({ where: { buyerId_campaignId: { buyerId: buyer.id, campaignId: campaign.id } },
    create: { buyerId: buyer.id, campaignId: campaign.id, screening: raw.screening,
      submission: { answers: raw.answers, budget: raw.budget, zones: raw.zones, propertyTypes: raw.propertyTypes, financeStatus: raw.financeStatus },
      attribution: raw.marketingConsent ? raw.attribution : {}, consentAt: raw.marketingConsent ? new Date() : null,
      consentVersion: raw.marketingConsent ? CONSENT_VERSION : null }, update: {} });
}

export async function queueBuyerEvents(tx: any, buyer: any, now: Date) {
  if (!canSendMeta(buyer)) return;
  const origins = await tx.buyerAcquisition.findMany({ where: { buyerId: buyer.id }, include: { campaign: true } });
  for (const origin of origins) {
    if (origin.screening !== 'Elegível' || !origin.consentAt || origin.consentVersion !== buyer.consentVersion || new Date(buyer.callValidatedAt) < origin.createdAt) continue;
    const campaign = origin.campaign;
    if (!campaign.pixelId) continue;
    const stages = ['Qualificado', ...(EVENT_NAMES[buyer.stage] && buyer.stage !== 'Qualificado' && campaign.propertyId === buyer.propertyId ? [buyer.stage] : [])];
    for (const stage of stages) {
      const eventName = EVENT_NAMES[stage];
      const id = `buyer:${origin.id}:${eventName}:v1`;
      await tx.metaConversion.upsert({ where: { id }, create: { id, buyerId: buyer.id, acquisitionId: origin.id, campaignId: campaign.id,
        pixelId: campaign.pixelId, eventName, eventTime: stage === 'Qualificado' ? new Date(Math.max(+new Date(buyer.qualifiedAt), +origin.createdAt, +new Date(buyer.callValidatedAt))) : now }, update: {} });
    }
  }
}
