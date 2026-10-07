import { NextRequest, NextResponse } from 'next/server';
import { createHash, timingSafeEqual } from 'node:crypto';
import { createSession, passwordFor, readSession, sameOrigin, SESSION_COOKIE, SESSION_SECONDS, USERS } from '@/lib/session';

export const dynamic = 'force-dynamic';
const attempts = new Map<string, { count: number; until: number }>();
const cookieOptions = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' as const, path: '/' };
const reply = (body: object, status = 200) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

export async function GET(request: NextRequest) {
  const user = await readSession(request.cookies.get(SESSION_COOKIE)?.value);
  return user ? reply({ user }) : reply({ error: 'Inicie sessão.' }, 401);
}

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return reply({ error: 'Origem não permitida.' }, 403);
  if (!request.headers.get('content-type')?.startsWith('application/json')) return reply({ error: 'Pedido inválido.' }, 415);
  if (Number(request.headers.get('content-length')) > 2048) return reply({ error: 'Pedido inválido.' }, 413);
  const now = Date.now();
  attempts.forEach((value, key) => { if (value.until <= now) attempts.delete(key); });
  const ip = request.headers.get('x-vercel-forwarded-for') || request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
  const bucket = attempts.get(ip) || { count: 0, until: now + 15 * 60000 };
  if (bucket.count >= 8 || attempts.size >= 10000) return reply({ error: 'Demasiadas tentativas. Aguarde 15 minutos.' }, 429);
  bucket.count++;
  attempts.set(ip, bucket);
  try {
    const text = await request.text();
    if (text.length > 2048) return reply({ error: 'Pedido inválido.' }, 413);
    const { user, password } = JSON.parse(text);
    if (!USERS.includes(user) || typeof password !== 'string' || password.length > 256) return reply({ error: 'Dados de acesso incorretos.' }, 401);
    const expected = passwordFor(user);
    if (!expected) return reply({ error: 'Este acesso ainda precisa de ser configurado pelo administrador.' }, 503);
    const hash = (value: string) => createHash('sha256').update(value).digest();
    if (!timingSafeEqual(hash(password), hash(expected))) return reply({ error: 'Dados de acesso incorretos.' }, 401);
    const response = reply({ user });
    response.cookies.set(SESSION_COOKIE, await createSession(user), { ...cookieOptions, maxAge: SESSION_SECONDS });
    attempts.delete(ip);
    return response;
  } catch {
    return reply({ error: 'Não foi possível iniciar sessão.' }, 400);
  }
}

export async function DELETE(request: NextRequest) {
  if (!sameOrigin(request)) return reply({ error: 'Origem não permitida.' }, 403);
  const response = reply({ signedOut: true });
  response.cookies.set(SESSION_COOKIE, '', { ...cookieOptions, maxAge: 0 });
  return response;
}
