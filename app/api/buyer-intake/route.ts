import { prisma } from '@/lib/prisma';
import { saveBuyer } from '@/mediation/service';
import { attribution, InputError, str } from '@/mediation/validation';
import { CONSENT_VERSION } from '@/mediation/domain.mjs';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
const reply = (data: any, status = 200) => Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
export async function POST(req: Request) {
  if (req.headers.get('origin') !== new URL(req.url).origin) return reply({ error: 'Origem não permitida.' }, 403);
  if (!req.headers.get('content-type')?.startsWith('application/json')) return reply({ error: 'Pedido inválido.' }, 415);
  try {
    let size = 0;
    const chunks: Uint8Array[] = [];
    const reader = req.body?.getReader();
    if (!reader) throw new InputError('Pedido vazio.');
    while (true) { const chunk = await reader.read(); if (chunk.done) break; size += chunk.value.byteLength;
      if (size > 16000) { await reader.cancel(); throw new InputError('Pedido demasiado grande.', 413); } chunks.push(chunk.value); }
    const raw = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    if (raw.website || typeof raw.startedAt !== 'number' || Date.now() - raw.startedAt < 2500 || Date.now() - raw.startedAt > 86400000) throw new InputError('Atualize o formulário e tente novamente.');
    if (raw.contactRequested !== true || raw.privacyVersion !== CONSENT_VERSION) throw new InputError('Confirme o pedido de contacto.');
    if (!raw.answers || ['intent', 'area', 'budget', 'finance'].some(key => typeof raw.answers[key] !== 'boolean')) throw new InputError('Responda às quatro perguntas.');
    const campaign = raw.marketingConsent === true ? attribution(raw.attribution) : {};
    const page = raw.campaignSlug ? await prisma.adCampaign.findUnique({ where: { slug: str(raw.campaignSlug, 80) } }) : null;
    if (raw.campaignSlug && (!page || !page.published || page.kind !== 'Imóvel')) throw new InputError('Esta página não está disponível.');
    const recent = await prisma.buyerProfile.count({ where: { createdAt: { gte: new Date(Date.now() - 3600000) } } });
    if (recent >= 100) return reply({ error: 'Recebemos muitos pedidos. Tente novamente mais tarde.' }, 429);
    // Public answers cannot validate a call, select a stage or overwrite an existing buyer.
    const data = { name: raw.name, phone: raw.phone, email: raw.email, zones: raw.zones,
      propertyTypes: raw.propertyTypes, budget: raw.budget, bedrooms: raw.bedrooms, timeframe: raw.timeframe,
      financeStatus: raw.financeStatus, answers: raw.answers, marketingConsent: raw.marketingConsent === true,
      attribution: campaign, referralCode: str(raw.referralCode, 60), campaignId: page?.id,
      source: raw.source === 'Meta Ads' || campaign.fbclid || campaign.lead_id || /facebook|instagram|meta/i.test(campaign.utm_source || '') ? 'Meta Ads' : 'Direto' };
    return reply(await saveBuyer(prisma, data, 'Formulário de compradores', { public: true }));
  } catch (error) {
    if (error instanceof InputError) return reply({ error: error.message }, error.status);
    return reply({ error: 'Não foi possível confirmar o pedido. Tente novamente.' }, 503);
  }
}
