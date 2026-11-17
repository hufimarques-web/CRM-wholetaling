import { randomUUID } from 'node:crypto';
import { InputError, str } from './validation';
import { DEFAULT_QUESTION_IDS, defaultQuestionSnapshot, questionSnapshot } from './domain.mjs';

export function questionSetInput(raw: any) {
  const name = str(raw.name, 120, true), kind = str(raw.kind, 30, true);
  if (!['Compradores', 'Angariação'].includes(kind)) throw new InputError('Escolha Compradores ou Angariação.');
  if (!Array.isArray(raw.questions) || raw.questions.length < 1 || raw.questions.length > 20) throw new InputError('Use entre 1 e 20 perguntas.');
  const questions = raw.questions.map((q: any) => {
    const key = str(q.key, 80, true);
    if (!/^[a-zA-Z0-9_-]+$/.test(key) || ['__proto__', 'constructor', 'prototype'].includes(key)) throw new InputError('Identificador de pergunta inválido.');
    if (typeof q.eliminatory !== 'boolean' || typeof q.passValue !== 'boolean') throw new InputError('Defina a regra de cada pergunta.');
    return { key, label: str(q.label, 500, true), eliminatory: q.eliminatory, passValue: q.passValue };
  });
  if (new Set(questions.map(q => q.key)).size !== questions.length) throw new InputError('Cada pergunta precisa de uma referência diferente.');
  if (!questions.some(q => q.eliminatory)) throw new InputError('Defina pelo menos uma pergunta eliminatória.');
  return { name, kind, questions, requireBudget: kind === 'Compradores' && raw.requireBudget === true, requireFinance: kind === 'Compradores' && raw.requireFinance === true };
}

export async function saveQuestionSet(db: any, raw: any, actor: string) {
  const input = questionSetInput(raw), id = str(raw.id, 120);
  return db.$transaction(async (tx: any) => {
    const old = id ? await tx.questionSet.findUnique({ where: { id }, include: { versions: { orderBy: { version: 'desc' }, take: 1 } } }) : null;
    if (id && !old) throw new InputError('Conjunto não encontrado.', 404);
    if (old && old.kind !== input.kind) throw new InputError('Crie outro conjunto para mudar o tipo.');
    if (old && old.versions[0]?.id !== raw.baseVersionId) throw new InputError('Este conjunto mudou. Atualize antes de guardar.', 409);
    const setId = old?.id || randomUUID(), version = (old?.versions[0]?.version || 0) + 1;
    if (!old) await tx.questionSet.create({ data: { id: setId, name: input.name, kind: input.kind, active: true } });
    else await tx.questionSet.update({ where: { id }, data: { name: input.name } });
    const saved = await tx.questionVersion.create({ data: { setId, version, snapshot: { ...input, version } } });
    await tx.mediationAudit.create({ data: { entityId: setId, actor, action: `Conjunto de perguntas: ${input.name} · versão ${version}` } });
    return saved;
  }, { isolationLevel: 'Serializable' });
}

export async function resolveQuestions(db: any, kind: string, versionId?: string, existing?: any) {
  // Contacts retain the exact saved version; selecting another version is an explicit reassessment.
  if (existing && (!versionId || versionId === existing.questionVersionId)) return {
    questionVersionId: existing.questionVersionId || DEFAULT_QUESTION_IDS[kind], questionSnapshot: questionSnapshot(existing, kind)
  };
  const id = str(versionId, 120);
  const version = id ? await db.questionVersion.findUnique({ where: { id }, include: { set: true } })
    : await db.questionVersion.findFirst({ where: { setId: DEFAULT_QUESTION_IDS[kind].replace('-v1', '') }, orderBy: { version: 'desc' }, include: { set: true } });
  if (!version || version.set.kind !== kind || !version.set.active) throw new InputError('Escolha um conjunto de perguntas ativo e adequado a este contacto.');
  return { questionVersionId: version.id, questionSnapshot: version.snapshot };
}

export function validateQuestionAnswers(raw: any, snapshot: any, complete = false) {
  const answers: Record<string, boolean | null> = {};
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) { if (complete) throw new InputError('Responda a todas as perguntas.'); raw = {}; }
  if (Object.keys(raw).some(key => !snapshot.questions.some(q => q.key === key))) throw new InputError('As respostas não correspondem ao conjunto selecionado. Atualize o formulário.');
  for (const q of snapshot.questions) {
    const value = raw[q.key];
    if (value != null && typeof value !== 'boolean') throw new InputError('Resposta inválida.');
    if (complete && typeof value !== 'boolean') throw new InputError('Responda a todas as perguntas.');
    answers[q.key] = value ?? null;
  }
  return answers;
}

export function publicQuestions(resolved: any) {
  return { versionId: resolved.questionVersionId, name: resolved.questionSnapshot.name, version: resolved.questionSnapshot.version,
    requireBudget: resolved.questionSnapshot.requireBudget,
    questions: resolved.questionSnapshot.questions.map((q: any) => ({ key: q.key, label: q.label })) };
}

export async function recordQuestionResponse(tx: any, saved: any, old: any, kind: string, actor: string) {
  const last = await tx.questionResponse.findFirst({ where: { contactId: saved.id, kind }, orderBy: { createdAt: 'desc' } });
  const canonical = (v: any) => JSON.stringify(Object.entries(v || {}).sort(([a], [b]) => a.localeCompare(b)));
  const previous = old ? { questionVersionId: old.questionVersionId || DEFAULT_QUESTION_IDS[kind], snapshot: questionSnapshot(old, kind), answers: old.answers } : last;
  if (!last && old) await tx.questionResponse.create({ data: { contactId: saved.id, kind, questionVersionId: previous.questionVersionId, snapshot: previous.snapshot, answers: previous.answers, actor: 'Histórico preservado' } });
  if (previous?.questionVersionId === saved.questionVersionId && canonical(previous.answers) === canonical(saved.answers)) return;
  await tx.questionResponse.create({ data: { contactId: saved.id, kind, questionVersionId: saved.questionVersionId, snapshot: saved.questionSnapshot, answers: saved.answers, actor } });
}
