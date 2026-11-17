import { randomUUID } from 'node:crypto';
import { buyerInput, InputError, str } from './validation';
import { screenBuyer, isValidated, CONSENT_VERSION, EVENT_NAMES, eventId, canSendMeta } from './domain.mjs';
import { queueBuyerEvents, recordAcquisition } from './campaigns';

export async function saveBuyer(db: any, raw: Record<string, any>, actor: string, options: { public?: boolean } = {}) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await db.$transaction(async (tx: any) => {
        const old = !options.public && raw.id ? await tx.buyerProfile.findUnique({ where: { id: str(raw.id, 120, true) } }) : null;
        if (raw.id && !options.public && !old) throw new InputError('Comprador não encontrado.', 404);
        if (old && raw.updatedAt !== old.updatedAt.toISOString()) throw new InputError('Este contacto foi atualizado. Atualize a lista antes de guardar.', 409);
        const input = buyerInput(options.public ? { ...raw, stage: 'Novo', assignedTo: 'Hugo', notes: '', depositConfirmed: false, propertyId: null } : raw, old || {});
        const duplicate = await tx.buyerProfile.findUnique({ where: { phone: input.phone } });
        if (duplicate && duplicate.id !== old?.id) {
          if (options.public) {
            await recordAcquisition(tx, duplicate, { ...raw, ...input, screening: screenBuyer(input) });
            return { accepted: true };
          }
          throw new InputError('Este telefone já está na lista. Atualize o contacto existente.', 409);
        }
        const now = new Date();
        const screening = screenBuyer(input);
        const criteriaChanged = old && (Object.keys(input.answers).some(key => old.answers[key] !== input.answers[key]) || old.financeStatus !== input.financeStatus || old.budget !== input.budget || JSON.stringify(old.zones) !== JSON.stringify(input.zones) || JSON.stringify(old.propertyTypes) !== JSON.stringify(input.propertyTypes));
        let callValidatedAt = criteriaChanged ? null : old?.callValidatedAt || null;
        let callValidatedBy = criteriaChanged ? null : old?.callValidatedBy || null;
        if (!options.public && raw.validateCall === true) {
          if (screening !== 'Elegível') throw new InputError('Confirme todas as perguntas, critérios de compra e financiamento antes de validar a chamada.');
          callValidatedAt = now; callValidatedBy = actor;
        }
        if (screening !== 'Elegível' || raw.revokeValidation === true) { callValidatedAt = null; callValidatedBy = null; }
        let stage = input.stage;
        if (screening === 'Não elegível') stage = 'Base de informação';
        else if (!callValidatedAt) stage = screening === 'Elegível' ? 'A contactar' : 'Novo';
        else if (['Novo', 'A contactar', 'Base de informação'].includes(stage)) stage = 'Qualificado';
        if ((raw.archive === true || raw.stage === 'Base de informação') && !options.public) stage = 'Base de informação';
        if (!options.public && ['Visita', 'Proposta', 'CPCV', 'Vendido'].includes(raw.stage) && !callValidatedAt) throw new InputError('Valide a chamada antes de avançar no funil.');
        if (input.propertyId && !await tx.brokerageProperty.findUnique({ where: { id: input.propertyId }, select: { id: true } })) throw new InputError('Imóvel não encontrado.');
        if (['Visita', 'Proposta', 'CPCV', 'Vendido'].includes(stage) && !input.propertyId) throw new InputError('Associe o imóvel a esta etapa.');
        if (stage === 'Vendido' && (!old?.cpcvAt || !input.depositConfirmed)) throw new InputError('Registe primeiro o CPCV e confirme o sinal recebido.');
        if (old?.stage === 'Vendido' && stage !== 'Vendido') throw new InputError('Esta venda já foi concluída. O registo da venda deve ser preservado.');
        if (stage === 'Vendido') {
          const previousSale = await tx.buyerProfile.findFirst({ where: { propertyId: input.propertyId, stage: 'Vendido' } });
          if (previousSale && previousSale.id !== old?.id) throw new InputError('Este imóvel já tem uma venda concluída.');
          await tx.brokerageProperty.update({ where: { id: input.propertyId }, data: { stage: 'Vendido' } });
        }
        const consentAt = input.marketingConsent ? old?.consentAt || now : null;
        const qualifiedAt = callValidatedAt ? old?.qualifiedAt || now : old?.qualifiedAt || null;
        const saved = await tx.buyerProfile[old ? 'update' : 'create']({ ...(old ? { where: { id: old.id } } : {}), data: {
          ...input, ...(!old ? { id: randomUUID() } : {}), screening, stage, callValidatedAt, callValidatedBy, qualifiedAt,
          consentAt, consentVersion: consentAt ? CONSENT_VERSION : null,
          attribution: input.marketingConsent ? input.attribution : {},
          cpcvAt: stage === 'CPCV' ? old?.cpcvAt || now : old?.cpcvAt || null,
          soldAt: stage === 'Vendido' ? old?.soldAt || now : old?.soldAt || null
        } });
        if (options.public) await recordAcquisition(tx, saved, { ...raw, ...input, screening });
        if (raw.referralCode && !old) {
          const partner = await tx.referralPartner.findUnique({ where: { code: str(raw.referralCode, 60) } });
          if (partner?.active) {
            await tx.referral.create({ data: { buyerId: saved.id, partnerId: partner.id, reward: partner.reward } });
            saved.source = partner.kind === 'Profissional' ? 'Parceiro profissional' : 'Referenciação pública';
            await tx.buyerProfile.update({ where: { id: saved.id }, data: { source: saved.source } });
          }
        }
        if (!canSendMeta(saved)) {
          await tx.metaConversion.updateMany({ where: { buyerId: saved.id, status: { in: ['pending', 'failed', 'processing'] } }, data: { status: 'cancelled', lockedUntil: null, lastError: 'Qualificação ou autorização retirada.' } });
        } else if (!options.public) await queueBuyerEvents(tx, saved, now);
        await tx.mediationAudit.create({ data: { entityId: saved.id, actor, action: old ? `Comprador atualizado: ${stage}${raw.validateCall ? '; chamada validada' : ''}` : `Contacto recebido: ${screening}` } });
        return options.public ? { accepted: true } : saved;
      }, { isolationLevel: 'Serializable', timeout: 15000 });
    } catch (error: any) {
      if (['P2034', 'P2002'].includes(error?.code) && attempt < 2) continue;
      throw error;
    }
  }
}
