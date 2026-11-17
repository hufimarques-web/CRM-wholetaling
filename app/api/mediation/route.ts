import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'node:crypto';
import { prisma } from '@/lib/prisma';
import { readSession, sameOrigin, SESSION_COOKIE } from '@/lib/session';
import { metaStatus, dispatchMeta } from '@/mediation/meta';
import { saveBuyer } from '@/mediation/service';
import { InputError, partnerInput, propertyInput, str } from '@/mediation/validation';
import { matchBuyer, rewardEligible } from '@/mediation/domain.mjs';
import { campaignInput, campaignStatus } from '@/mediation/campaigns';
import { saveOwner } from '@/mediation/owners';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;
const reply = (data: any, status = 200) => NextResponse.json(data, { status, headers: { 'Cache-Control': 'private, no-store' } });
function failure(error: any) {
  if (error instanceof InputError) return reply({ error: error.message }, error.status);
  if (error?.code === 'P2021' || error?.code === 'P2022') return reply({ error: 'A atualização da base de dados de mediação ainda não está instalada.' }, 503);
  if (error?.code === 'P2002') return reply({ error: 'Já existe um registo com estes dados.' }, 409);
  return reply({ error: 'Não foi possível guardar ou carregar os dados. Tente novamente.' }, 503);
}
export async function GET(req: NextRequest) {
  if (!await readSession(req.cookies.get(SESSION_COOKIE)?.value)) return reply({ error: 'Inicie sessão.' }, 401);
  try {
    const buyers = await prisma.buyerProfile.findMany({ orderBy: { updatedAt: 'desc' } });
    const properties = await prisma.brokerageProperty.findMany({ orderBy: { createdAt: 'desc' } });
    const partners = await prisma.referralPartner.findMany({ orderBy: { name: 'asc' } });
    const referrals = await prisma.referral.findMany({ orderBy: { createdAt: 'desc' } });
    const launches = await prisma.propertyLaunch.findMany({ orderBy: { scheduledAt: 'asc' } });
    const events = await prisma.metaConversion.findMany({ orderBy: { createdAt: 'desc' }, take: 500 });
    const campaigns = await prisma.adCampaign.findMany({ orderBy: { createdAt: 'desc' } });
    const owners = await prisma.ownerLead.findMany({ orderBy: { updatedAt: 'desc' } });
    const acquisitions = await prisma.buyerAcquisition.findMany({ orderBy: { createdAt: 'desc' } });
    const legacyBuyers = await prisma.mediationBuyer.findMany({ select: { id: true, nome: true, telefone: true, email: true, fase: true, leadId: true }, orderBy: { createdAt: 'desc' } });
    const legacyOwners = await prisma.lead.findMany({ where: { isDemo: false, id: { notIn: properties.map(p => p.legacyLeadId).filter(Boolean) as string[] } },
      select: { id: true, nomeProprietario: true, telefone: true, tipoImovel: true, moradaZona: true, freguesia: true, mediacaoPrecoVenda: true, valorMinimoAbsoluto: true }, orderBy: { createdAt: 'desc' } });
    return reply({ buyers, properties, partners, referrals, launches, events, legacyOwners, legacyBuyers, owners, acquisitions,
      campaigns: campaigns.map(c => ({ ...c, integration: campaignStatus(c) })), meta: metaStatus(campaigns) });
  } catch (error) { return failure(error); }
}
export async function POST(req: NextRequest) {
  const actor = await readSession(req.cookies.get(SESSION_COOKIE)?.value);
  if (!actor) return reply({ error: 'Inicie sessão.' }, 401);
  if (!sameOrigin(req)) return reply({ error: 'Origem não permitida.' }, 403);
  try {
    const text = await req.text();
    if (text.length > 25000) throw new InputError('Pedido demasiado grande.', 413);
    const { action, data = {} } = JSON.parse(text);
    if (action === 'saveCampaign') {
      const values = campaignInput(data), id = str(data.id, 120);
      if (values.propertyId && !await prisma.brokerageProperty.findUnique({ where: { id: values.propertyId } })) throw new InputError('Selecione um imóvel existente.');
      if (id) {
        const old = await prisma.adCampaign.findUnique({ where: { id } });
        if (!old) throw new InputError('Página não encontrada.', 404);
        if ((old.pixelId && old.pixelId !== values.pixelId) || old.kind !== values.kind || old.propertyId !== values.propertyId) throw new InputError('Crie outra página para mudar o Pixel, o tipo ou o imóvel. A origem dos contactos existentes deve ser preservada.');
      }
      const campaign = id ? await prisma.adCampaign.update({ where: { id }, data: values }) : await prisma.adCampaign.create({ data: values });
      return reply({ campaign });
    }
    if (action === 'saveOwner') { const owner = await saveOwner(prisma, data, actor); await dispatchMeta(prisma, 3).catch(() => {}); return reply({ owner }); }
    if (action === 'convertOwner') {
      const result = await prisma.$transaction(async tx => {
        const owner = await tx.ownerLead.findUnique({ where: { id: str(data.id, 120, true) } });
        if (!owner || owner.stage !== 'Contrato assinado' || !owner.callValidatedAt) throw new InputError('Registe o contrato de mediação antes de criar o imóvel.');
        if (owner.propertyId) return { id: owner.propertyId };
        const property = await tx.brokerageProperty.create({ data: { title: `${owner.propertyType} · ${owner.zone}`, zone: owner.zone, propertyType: owner.propertyType,
          price: owner.askingPrice, ownerName: owner.name, ownerPhone: owner.phone, stage: 'Contrato assinado', description: 'Confirme o preço de comercialização e as condições acordadas.' } });
        await tx.ownerLead.update({ where: { id: owner.id }, data: { propertyId: property.id } });
        return property;
      }, { isolationLevel: 'Serializable' });
      return reply({ property: result });
    }
    if (action === 'saveBuyer') {
      const buyer = await saveBuyer(prisma, data, actor);
      // Database commit is authoritative even if Meta is unavailable.
      await dispatchMeta(prisma, 3).catch(() => {});
      return reply({ buyer });
    }
    if (action === 'saveProperty') {
      const values = propertyInput(data);
      const id = str(data.id, 120);
      const legacyLeadId = str(data.legacyLeadId, 120) || null;
      if (legacyLeadId && !await prisma.lead.findUnique({ where: { id: legacyLeadId }, select: { id: true } })) throw new InputError('Contacto de origem não encontrado.');
      const property = id ? await prisma.brokerageProperty.update({ where: { id }, data: values })
        : await prisma.brokerageProperty.create({ data: { ...values, legacyLeadId } });
      return reply({ property });
    }
    if (action === 'savePartner') {
      const values = partnerInput(data);
      const id = str(data.id, 120);
      const partner = id ? await prisma.referralPartner.update({ where: { id }, data: values })
        : await prisma.referralPartner.create({ data: { ...values, code: randomBytes(8).toString('hex') } });
      return reply({ partner });
    }
    if (action === 'saveLaunch') {
      const id = str(data.id, 120);
      const propertyId = str(data.propertyId, 120, true);
      const property = await prisma.brokerageProperty.findUnique({ where: { id: propertyId } });
      if (!property) throw new InputError('Imóvel não encontrado.');
      const scheduledAt = new Date(data.scheduledAt);
      if (!Number.isFinite(scheduledAt.getTime())) throw new InputError('Indique a data do lançamento.');
      const status = str(data.status || 'Planeado', 40);
      if (!['Planeado', 'Em curso', 'Concluído', 'Cancelado'].includes(status)) throw new InputError('Estado inválido.');
      const values = { propertyId, scheduledAt, status, notes: str(data.notes, 4000) };
      const launch = id ? await prisma.propertyLaunch.update({ where: { id }, data: values }) : await prisma.propertyLaunch.create({ data: values });
      return reply({ launch });
    }
    if (action === 'recordLaunchContact') {
      const id = str(data.id, 120, true), buyerId = str(data.buyerId, 120, true);
      await prisma.$transaction(async tx => {
        const launch = await tx.propertyLaunch.findUnique({ where: { id }, include: { property: true } });
        const buyer = await tx.buyerProfile.findUnique({ where: { id: buyerId } });
        if (!launch || !buyer || !matchBuyer(buyer, launch.property)) throw new InputError('O comprador não corresponde aos critérios deste lançamento.');
        if (!launch.contactedIds.includes(buyerId)) await tx.propertyLaunch.update({ where: { id }, data: { contactedIds: { push: buyerId } } });
      }, { isolationLevel: 'Serializable' });
      return reply({ saved: true });
    }
    if (action === 'markRewardPaid') {
      const id = str(data.id, 120, true);
      if (data.confirm !== true) throw new InputError('Confirme que o pagamento já foi efetuado fora do CRM.');
      await prisma.$transaction(async tx => {
        const referral = await tx.referral.findUnique({ where: { id }, include: { buyer: true } });
        if (!referral || !rewardEligible(referral.buyer)) throw new InputError('O prémio só fica elegível após CPCV e confirmação do sinal recebido.');
        if (!referral.paidAt) {
          await tx.referral.update({ where: { id }, data: { paidAt: new Date(), paidBy: actor } });
          await tx.mediationAudit.create({ data: { entityId: id, actor, action: 'Pagamento de prémio registado manualmente; não foi efetuada transferência pelo CRM.' } });
        }
      }, { isolationLevel: 'Serializable' });
      return reply({ saved: true });
    }
    if (action === 'processMeta') return reply(await dispatchMeta(prisma, 5));
    if (action === 'audit') return reply({ history: await prisma.mediationAudit.findMany({ where: { entityId: str(data.id, 120, true) }, orderBy: { createdAt: 'desc' }, take: 50 }) });
    throw new InputError('Ação inválida.');
  } catch (error) { return failure(error); }
}
