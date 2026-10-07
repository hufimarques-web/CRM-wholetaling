import { SignJWT, jwtVerify } from 'jose';

export const SESSION_COOKIE = 'wt_session';
export const SESSION_SECONDS = 3600;
export const USERS = ['Hugo', 'Queirós'] as const;
export type SessionUser = typeof USERS[number];

export function passwordFor(user: SessionUser) {
  const value = user === 'Hugo' ? process.env.CRM_PASSWORD_HUGO : process.env.CRM_PASSWORD_ANDRE;
  const minimumLength = user === 'Hugo' ? 16 : 8;
  return value && value.length >= minimumLength ? value : null;
}

async function signingKey(password: string) {
  return new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`wholetailing-session-v1:${password}`)));
}

export async function createSession(user: SessionUser) {
  const password = passwordFor(user);
  if (!password) throw new Error('Access not configured');
  return new SignJWT({}).setProtectedHeader({ alg: 'HS256' }).setSubject(user)
    .setIssuer('wholetailing-crm').setAudience('wholetailing-crm')
    .setIssuedAt().setExpirationTime(`${SESSION_SECONDS}s`).sign(await signingKey(password));
}

export async function readSession(token: string | undefined) {
  if (!token || token.length > 2048) return null;
  for (const user of USERS) {
    const password = passwordFor(user);
    if (!password) continue;
    try {
      const { payload } = await jwtVerify(token, await signingKey(password), {
        algorithms: ['HS256'], issuer: 'wholetailing-crm', audience: 'wholetailing-crm', maxTokenAge: `${SESSION_SECONDS}s`
      });
      if (payload.sub === user) return user;
    } catch { /* Try the other account key; never trust the unsigned claims. */ }
  }
  return null;
}

export function sameOrigin(request: Request) {
  return request.headers.get('origin') === new URL(request.url).origin;
}
