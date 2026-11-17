import { prisma } from '@/lib/prisma';
import { saveOwner } from '@/mediation/owners';
import { CONSENT_VERSION, OWNER_QUESTIONS } from '@/mediation/domain.mjs';
import { InputError, str } from '@/mediation/validation';
import { resolveQuestions, validateQuestionAnswers } from '@/mediation/questions';
export const runtime = 'nodejs';
const reply = (body: any, status = 200) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
export async function POST(req: Request) {
  if (req.headers.get('origin') !== new URL(req.url).origin) return reply({ error: 'Origem não permitida.' }, 403);
  if (!req.headers.get('content-type')?.startsWith('application/json')) return reply({ error: 'Pedido inválido.' }, 415);
  try {
    const reader = req.body?.getReader(); if (!reader) throw new InputError('Pedido vazio.');
    const chunks: Uint8Array[] = []; let size = 0;
    while (true) { const c = await reader.read(); if (c.done) break; size += c.value.byteLength; if (size > 16000) { await reader.cancel(); throw new InputError('Pedido demasiado grande.', 413); } chunks.push(c.value); }
    const raw = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    if (raw.website || typeof raw.startedAt !== 'number' || Date.now() - raw.startedAt < 2500 || Date.now() - raw.startedAt > 86400000) throw new InputError('Atualize o formulário e tente novamente.');
    if (raw.contactRequested !== true || raw.privacyVersion !== CONSENT_VERSION) throw new InputError('Confirme o pedido de contacto.');
    const page = raw.campaignSlug ? await prisma.adCampaign.findUnique({ where: { slug: str(raw.campaignSlug, 80) } }) : null;
    if (raw.campaignSlug && (!page?.published || page.kind !== 'Angariação')) throw new InputError('Esta página não está disponível.');
    const questions = await resolveQuestions(prisma, 'Angariação', page?.questionVersionId);
    if (raw.questionVersionId !== questions.questionVersionId) throw new InputError('As perguntas desta página mudaram. Atualize o formulário antes de enviar.', 409);
    const answers = validateQuestionAnswers(raw.answers, questions.questionSnapshot, true);
    if (await prisma.ownerLead.count({ where: { createdAt: { gte: new Date(Date.now() - 3600000) } } }) >= 100) return reply({ error: 'Tente novamente mais tarde.' }, 429);
    return reply(await saveOwner(prisma, { name: raw.name, phone: raw.phone, email: raw.email, zone: raw.zone, propertyType: raw.propertyType,
      askingPrice: raw.askingPrice, answers, questionVersionId: questions.questionVersionId, marketingConsent: raw.marketingConsent === true, attribution: raw.attribution, campaignId: page?.id }, 'Formulário de angariação', true));
  } catch (e) { return reply({ error: e instanceof InputError ? e.message : 'Não foi possível confirmar o pedido. Tente novamente.' }, e instanceof InputError ? e.status : 503); }
}
