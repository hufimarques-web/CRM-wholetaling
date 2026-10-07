import test from 'node:test';
import assert from 'node:assert/strict';
import { createSession, readSession, passwordFor, sameOrigin } from './session.ts';

test('sessions require configured credentials, reject forgery, and invalidate after rotation', async () => {
  const previousHugo = process.env.CRM_PASSWORD_HUGO;
  const previousAndre = process.env.CRM_PASSWORD_ANDRE;
  try {
    delete process.env.CRM_PASSWORD_HUGO;
    delete process.env.CRM_PASSWORD_ANDRE;
    assert.equal(await readSession('made-up-session'), null);
    await assert.rejects(createSession('Hugo'));
    process.env.CRM_PASSWORD_HUGO = 'only-a-disposable-test-fixture-2026';
    process.env.CRM_PASSWORD_ANDRE = 'another-disposable-test-fixture-2026';
    const hugo = await createSession('Hugo');
    const andre = await createSession('Queirós');
    assert.equal(await readSession(hugo), 'Hugo');
    assert.equal(await readSession(andre), 'Queirós');
    const parts = hugo.split('.');
    parts[1] = Buffer.from(JSON.stringify({ sub: 'Queirós', exp: 9999999999 })).toString('base64url');
    assert.equal(await readSession(parts.join('.')), null);
    assert.equal(await readSession(undefined), null);
    process.env.CRM_PASSWORD_HUGO = 'a-different-disposable-test-fixture';
    assert.equal(await readSession(hugo), null);
    assert.equal(await readSession(andre), 'Queirós');
    process.env.CRM_PASSWORD_HUGO = 'short';
    assert.equal(passwordFor('Hugo'), null);
  } finally {
    if (previousHugo === undefined) delete process.env.CRM_PASSWORD_HUGO; else process.env.CRM_PASSWORD_HUGO = previousHugo;
    if (previousAndre === undefined) delete process.env.CRM_PASSWORD_ANDRE; else process.env.CRM_PASSWORD_ANDRE = previousAndre;
  }
});

test('mutations reject cross-site and missing origins', () => {
  const url = 'https://crm-wholetaling.vercel.app/api/leads';
  assert.equal(sameOrigin(new Request(url, { headers: { origin: 'https://crm-wholetaling.vercel.app' } })), true);
  assert.equal(sameOrigin(new Request(url, { headers: { origin: 'https://untrusted.example' } })), false);
  assert.equal(sameOrigin(new Request(url)), false);
});

test('Andre accepts eight characters while Hugo still requires sixteen', async () => {
  const previousHugo = process.env.CRM_PASSWORD_HUGO;
  const previousAndre = process.env.CRM_PASSWORD_ANDRE;
  try {
    process.env.CRM_PASSWORD_ANDRE = 'fixture';
    assert.equal(passwordFor('Queirós'), null);
    await assert.rejects(createSession('Queirós'));
    process.env.CRM_PASSWORD_ANDRE = 'fixture8';
    assert.equal(passwordFor('Queirós'), 'fixture8');
    const token = await createSession('Queirós');
    assert.equal(await readSession(token), 'Queirós');
    process.env.CRM_PASSWORD_HUGO = 'fixture8';
    assert.equal(passwordFor('Hugo'), null);
    process.env.CRM_PASSWORD_HUGO = '123456789012345';
    assert.equal(passwordFor('Hugo'), null);
    process.env.CRM_PASSWORD_HUGO = '1234567890123456';
    assert.equal(await readSession(await createSession('Hugo')), 'Hugo');
    process.env.CRM_PASSWORD_ANDRE = 'changed8';
    assert.equal(await readSession(token), null);
  } finally {
    if (previousHugo === undefined) delete process.env.CRM_PASSWORD_HUGO; else process.env.CRM_PASSWORD_HUGO = previousHugo;
    if (previousAndre === undefined) delete process.env.CRM_PASSWORD_ANDRE; else process.env.CRM_PASSWORD_ANDRE = previousAndre;
  }
});
