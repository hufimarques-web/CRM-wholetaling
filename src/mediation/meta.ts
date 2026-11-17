import { createHash } from 'node:crypto';
import { canSendMeta, ownerCanSend, routeMatches } from './domain.mjs';
import { campaignStatus } from './campaigns';

export function metaStatus(campaigns: any[] = [], env = process.env) {
  const statuses = campaigns.map(c => campaignStatus(c, env));
  return { configured: statuses.some(c => c.configured), enabled: statuses.some(c => c.configured && c.enabled),
    testMode: statuses.some(c => c.testMode), pixelId: null, missing: statuses.some(c => c.configured) ? [] : ['Configure os destinos em Páginas e anúncios.'] };
}
const hash = (value: string) => createHash('sha256').update(value).digest('hex');
export function metaPayload(event: any, contact: any, origin: any, campaign: any) {
  if (!(event.ownerId ? ownerCanSend(contact) : canSendMeta(contact))) throw new Error('not_eligible');
  const user_data: Record<string, any> = { ph: [hash(contact.phone.replace(/\D/g, ''))], external_id: [hash(contact.id)] };
  if (contact.email) user_data.em = [hash(contact.email.trim().toLowerCase())];
  for (const key of ['fbc', 'fbp', 'lead_id']) if (origin.attribution?.[key]) user_data[key] = origin.attribution[key];
  return { data: [{ event_name: event.eventName, event_id: event.id,
    event_time: Math.floor(new Date(event.eventTime).getTime() / 1000),
    action_source: ['QualifiedLead', 'QualifiedOwner'].includes(event.eventName) ? 'phone_call' : 'other', user_data,
    custom_data: { event_source: 'crm', lead_event_source: 'AH Mediacao' } }],
    ...(campaign.testCode ? { test_event_code: campaign.testCode } : {}) };
}

export async function dispatchMeta(db: any, limit = 10, fetcher = fetch, env = process.env) {
  const now = new Date();
  const campaigns = await db.adCampaign.findMany();
  const ready = campaigns.filter((c: any) => c.enabled && campaignStatus(c, env).configured).map((c: any) => c.id);
  if (!ready.length) return { processed: 0, sent: 0 };
  const rows = await db.metaConversion.findMany({ where: { status: { in: ['pending', 'failed', 'processing'] },
    campaignId: { in: ready },
    nextAttempt: { lte: now }, attempts: { lt: 5 }, OR: [{ lockedUntil: null }, { lockedUntil: { lt: now } }] },
    include: { campaign: true }, take: Math.max(limit * 5, 50), orderBy: { eventTime: 'asc' } });
  let sent = 0, processed = 0;
  for (const event of rows) {
    if (processed >= limit) break;
    const campaign = event.campaign, config = campaignStatus(campaign, env);
    // Never substitute a global/default Pixel, even when a page is missing its configuration.
    if (!config.configured || !routeMatches(event, campaign)) continue;
    const lease = new Date(Date.now() + 60000);
    const claim = await db.metaConversion.updateMany({ where: { id: event.id, status: { in: ['pending', 'failed', 'processing'] },
      OR: [{ lockedUntil: null }, { lockedUntil: { lt: now } }] }, data: { status: 'processing', lockedUntil: lease, attempts: { increment: 1 } } });
    if (!claim.count) continue;
    processed++;
    const finish = (data: any) => db.metaConversion.updateMany({ where: { id: event.id, status: 'processing', lockedUntil: lease }, data: { ...data, lockedUntil: null } });
    const contact = event.ownerId ? await db.ownerLead.findUnique({ where: { id: event.ownerId } }) : await db.buyerProfile.findUnique({ where: { id: event.buyerId } });
    const origin = event.ownerId ? contact : await db.buyerAcquisition.findUnique({ where: { id: event.acquisitionId } });
    const eligible = event.ownerId ? contact && ownerCanSend(contact) && contact.campaignId === campaign.id
      : contact && canSendMeta(contact) && origin && origin.buyerId === contact.id && origin.campaignId === campaign.id && origin.screening === 'Elegível' && origin.consentAt && origin.consentVersion === contact.consentVersion && new Date(contact.callValidatedAt) >= new Date(origin.createdAt);
    if (!eligible) { await finish({ status: 'cancelled', lastError: 'Sem qualificação ou autorização válida para esta página.' }); continue; }
    if (Date.now() - new Date(event.eventTime).getTime() > 7 * 86400000) { await finish({ status: 'expired', lastError: 'Evento com mais de 7 dias. A data original foi preservada.' }); continue; }
    try {
      const response = await fetcher(`https://graph.facebook.com/${env.META_API_VERSION || 'v25.0'}/${event.pixelId}/events`, {
        method: 'POST', headers: { Authorization: `Bearer ${env[campaign.tokenEnv]}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(metaPayload(event, contact, origin, campaign)), signal: AbortSignal.timeout(8000)
      });
      const result = await response.json();
      if (!response.ok || result.events_received !== 1 || result.error) throw new Error(`Meta HTTP ${response.status}${Number.isInteger(result.error?.code) ? ` / código ${result.error.code}` : ''}`);
      await finish({ status: config.testMode ? 'test_sent' : 'sent', sentAt: new Date(), lastError: null }); sent++;
    } catch (error) {
      const message = error instanceof Error && /^Meta HTTP/.test(error.message) ? error.message : 'Falha de comunicação. A próxima tentativa mantém a mesma referência.';
      await finish({ status: 'failed', lastError: message, nextAttempt: new Date(Date.now() + Math.min(3600, 60 * 2 ** event.attempts) * 1000) });
    }
  }
  return { processed, sent };
}
