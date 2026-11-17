import { randomUUID } from 'node:crypto';
import { InputError, str, attribution } from './validation';
import { normalizePhone, OWNER_QUESTIONS, OWNER_STAGES, PROPERTY_TYPES, screenOwner, ownerCanSend, CONSENT_VERSION } from './domain.mjs';

export async function saveOwner(db: any, raw: any, actor: string, isPublic = false) {
  for (let attempt = 0; attempt < 3; attempt++) try {
    return await db.$transaction(async (tx: any) => {
      const old = !isPublic && raw.id ? await tx.ownerLead.findUnique({ where: { id: str(raw.id, 120, true) } }) : null;
      if (raw.id && !isPublic && !old) throw new InputError('Angariação não encontrada.', 404);
      if (old && raw.updatedAt !== old.updatedAt.toISOString()) throw new InputError('Esta angariação mudou. Atualize a lista.', 409);
      const b = { ...old, ...raw }, phone = normalizePhone(str(b.phone, 30, true));
      if (!phone) throw new InputError('Indique um telefone válido.');
      const answers: Record<string, boolean | null> = {};
      for (const q of OWNER_QUESTIONS) { const v = b.answers?.[q.key]; if (v != null && typeof v !== 'boolean') throw new InputError('Resposta inválida.'); answers[q.key] = v ?? null; }
      if (!PROPERTY_TYPES.includes(b.propertyType)) throw new InputError('Escolha o tipo de imóvel.');
      const price = Number(b.askingPrice || 0);
      if (!Number.isFinite(price) || price < 0 || price > 100000000) throw new InputError('Preço inválido.');
      const campaignId = old?.campaignId || str(raw.campaignId, 120) || null;
      const campaign = campaignId ? await tx.adCampaign.findUnique({ where: { id: campaignId } }) : null;
      if (campaignId && (!campaign || campaign.kind !== 'Angariação' || (isPublic && !campaign.published))) throw new InputError('Página de angariação indisponível.');
      if (isPublic && await tx.ownerLead.findFirst({ where: { phone, campaignId } })) return { accepted: true };
      const email = str(b.email, 254);
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new InputError('Email inválido.');
      const values = { name: str(b.name, 120, true), phone, email, zone: str(b.zone, 100, true), propertyType: b.propertyType, askingPrice: price, answers,
        notes: isPublic ? '' : str(b.notes, 10000), assignedTo: !isPublic && b.assignedTo === 'Queirós' ? 'Queirós' : 'Hugo',
        campaignId, marketingConsent: b.marketingConsent === true, attribution: b.marketingConsent === true ? attribution(b.attribution) : {} };
      const screening = screenOwner(values), now = new Date();
      const changed = old && (OWNER_QUESTIONS.some(q => old.answers[q.key] !== answers[q.key]) || old.zone !== values.zone || old.propertyType !== values.propertyType);
      let callValidatedAt = changed ? null : old?.callValidatedAt || null;
      if (!isPublic && raw.validateCall === true) { if (screening !== 'Elegível') throw new InputError('Confirme todas as perguntas antes de validar a chamada.'); callValidatedAt = now; }
      if (screening !== 'Elegível' || raw.revokeValidation === true) callValidatedAt = null;
      let stage = !isPublic && OWNER_STAGES.includes(b.stage) ? b.stage : 'Novo';
      if (screening === 'Não elegível' || (!isPublic && (raw.archive || stage === 'Base de informação'))) stage = 'Base de informação';
      else if (!callValidatedAt) stage = screening === 'Elegível' ? 'A contactar' : 'Novo';
      else if (['Novo', 'A contactar'].includes(stage)) stage = 'Qualificado';
      if (!isPublic && ['Reunião marcada', 'Contrato assinado'].includes(raw.stage) && !callValidatedAt) throw new InputError('Valide primeiro a chamada.');
      const saved = await tx.ownerLead[old ? 'update' : 'create']({ ...(old ? { where: { id: old.id } } : {}), data: { ...values, ...(!old ? { id: randomUUID() } : {}), screening, stage, callValidatedAt,
        qualifiedAt: callValidatedAt ? old?.qualifiedAt || now : old?.qualifiedAt || null,
        consentAt: values.marketingConsent ? old?.consentAt || now : null, consentVersion: values.marketingConsent ? CONSENT_VERSION : null } });
      if (!ownerCanSend(saved)) await tx.metaConversion.updateMany({ where: { ownerId: saved.id, status: { in: ['pending', 'failed', 'processing'] } }, data: { status: 'cancelled', lockedUntil: null } });
      else if (campaign?.pixelId && !isPublic) {
        const stages = ['QualifiedOwner', ...(stage === 'Reunião marcada' ? ['OwnerMeeting'] : stage === 'Contrato assinado' ? ['ListingAgreement'] : [])];
        for (const name of stages) { const id = `owner:${saved.id}:${name}:v1`; await tx.metaConversion.upsert({ where: { id }, create: { id, ownerId: saved.id, campaignId: campaign.id, pixelId: campaign.pixelId, eventName: name, eventTime: name === 'QualifiedOwner' ? saved.qualifiedAt : now }, update: {} }); }
      }
      await tx.mediationAudit.create({ data: { entityId: saved.id, actor, action: `Angariação: ${stage}${raw.validateCall ? '; chamada validada' : ''}` } });
      return isPublic ? { accepted: true } : saved;
    }, { isolationLevel: 'Serializable', timeout: 15000 });
  } catch (e: any) { if (e.code === 'P2034' && attempt < 2) continue; throw e; }
}
