import test from 'node:test';
import assert from 'node:assert/strict';
import { validateSubmission, leadRecord, saveSubmission, PRIVACY_VERSION, REVIEW_PRIVACY_VERSION } from './landing-intake.ts';

const valid = () => ({
  requestId: '35b056a7-8f7c-4dc6-b787-49b55ebd73ba', startedAt: Date.now() - 5000,
  contactConsent: true, privacyVersion: PRIVACY_VERSION, website: '',
  nomeProprietario: 'Teste Integração', telefone: '900 000 000', telefoneConfirmacao: '+351900000000',
  localizacao: 'Aveiro', tipoImovel: 'Moradia', areaM2: '180', tipoArea: 'Área de habitação',
  situacaoAtual: 'Precisa de pequenas obras', licencaHabitacao: 'sim', numaImobiliaria: 'nao',
  tempoVenda: 'Entre 6 e 12 meses', propostasRecebidas: 'sim', melhorProposta: '100000',
  prazoPretendido: 'Entre 1 e 3 meses', motivo: 'Teste sem dados reais', precoPedido: '150000',
  valorMinimoAbsoluto: '120000', flexibilidade: 'Sim', enquadramento: 'talvez',
  horario: 'Tarde', fotosDisponiveis: 'Ainda preciso de tirar'
});

test('normalizes phone and maps the full submission without invented market data', () => {
  const submission = validateSubmission(valid());
  const record = leadRecord(submission);
  assert.equal(record.telefone, '+351900000000');
  assert.equal(record.fase, 'Nova lead');
  assert.equal(record.contacto, 'Não contactado');
  assert.equal(record.moradaZona, 'Aveiro');
  assert.equal(record.precoM2, null);
  assert.equal(record.notas.create.text, record.requalificacaoNotas);
  for (const expected of ['100000', '150000', '120000', 'Licença de habitação: Sim', 'Numa imobiliária: Não', 'Tarde', 'não verificado por SMS']) assert.ok(record.requalificacaoNotas.includes(expected));
});

test('review-only form accepts one phone and records the actual confirmation method', () => {
  const raw = { ...valid(), privacyVersion: REVIEW_PRIVACY_VERSION, contactRequested: true };
  delete raw.telefoneConfirmacao;
  delete raw.contactConsent;
  const submission = validateSubmission(raw);
  const record = leadRecord(submission);
  assert.equal(record.telefone, '+351900000000');
  assert.ok(record.requalificacaoNotas.includes('apresentado para confirmação'));
  assert.ok(!record.requalificacaoNotas.includes('dupla introdução'));
  assert.equal(validateSubmission({ ...raw, startedAt: raw.startedAt - 1000 }).id, submission.id);
  for (const patch of [{ contactRequested: false }, { contactRequested: undefined, contactConsent: true }, { telefone: 'invalid' }, { privacyVersion: 'unknown' }]) {
    assert.throws(() => validateSubmission({ ...raw, ...patch }), { status: 400 });
  }
});

test('rejects malformed or unsafe requests', () => {
  for (const patch of [
    { telefoneConfirmacao: '900000001' }, { telefone: 'abc' }, { contactConsent: false },
    { requestId: 'bad' }, { privacyVersion: 'old' }, { startedAt: Date.now() },
    { startedAt: Date.now() - 172800001 }, { website: 'spam.example' },
    { areaM2: '-1' }, { areaM2: 'Infinity' }, { nomeProprietario: 'x' },
    { localizacao: '' }, { tipoImovel: 'Outro' }, { enquadramento: 'nao' },
    { valorMinimoAbsoluto: '160000' }, { tipoImovel: 'Apartamento', situacaoAtual: 'Ruína' }
  ]) assert.throws(() => validateSubmission({ ...valid(), ...patch }), { status: 400 });
});

test('land does not require a housing licence; ruins belong only to houses', () => {
  const land = validateSubmission({ ...valid(), tipoImovel: 'Terreno', tipoArea: 'Área do terreno', situacaoAtual: 'Terreno rústico / agrícola', licencaHabitacao: undefined, propostasRecebidas: 'na', melhorProposta: 'invalid' });
  assert.equal(land.data.licencaHabitacao, 'Não aplicável (terreno)');
  assert.equal(land.data.melhorProposta, null);
  assert.equal(validateSubmission({ ...valid(), situacaoAtual: 'Ruína' }).data.situacaoAtual, 'Ruína');
});

test('retry ID is stable, includes changed answers and excludes client-only timestamps', () => {
  const data = valid();
  const original = validateSubmission(data).id;
  assert.equal(validateSubmission({ ...data, startedAt: data.startedAt - 1000 }).id, original);
  assert.notEqual(validateSubmission({ ...data, motivo: 'Changed' }).id, original);
});

function database({ phoneCount = 0, total = 0, conflict = false } = {}) {
  const rows = new Map();
  let attempts = 0;
  return { rows, async $transaction(fn, options) {
    assert.equal(options.isolationLevel, 'Serializable');
    if (conflict && attempts++ === 0) throw { code: 'P2034' };
    return fn({ lead: {
      findUnique: async ({ where }) => rows.get(where.id),
      count: async ({ where }) => where.telefone ? phoneCount : total,
      create: async ({ data }) => { rows.set(data.id, data); return { id: data.id }; }
    } });
  } };
}

test('stores once, does not overwrite subsequent CRM edits on retry', async () => {
  const db = database();
  const submission = validateSubmission(valid());
  const first = await saveSubmission(db, submission);
  assert.equal(first.accepted, true);
  db.rows.get(submission.id).fase = 'Em análise';
  assert.equal((await saveSubmission(db, submission)).repeated, true);
  assert.equal(db.rows.size, 1);
  assert.equal(db.rows.get(submission.id).fase, 'Em análise');
});

test('retries transaction conflicts and returns no success on database failure', async () => {
  assert.equal((await saveSubmission(database({ conflict: true }), validateSubmission(valid()))).accepted, true);
  await assert.rejects(saveSubmission({ $transaction: async () => { throw new Error('offline'); } }, validateSubmission(valid())));
});

test('limits new submissions but still acknowledges a previously stored request', async () => {
  for (const db of [database({ phoneCount: 3 }), database({ total: 100 })]) {
    const submission = validateSubmission(valid());
    await assert.rejects(saveSubmission(db, submission), { status: 429 });
    db.rows.set(submission.id, { id: submission.id });
    assert.equal((await saveSubmission(db, submission)).repeated, true);
  }
});
