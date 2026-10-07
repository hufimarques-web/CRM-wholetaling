import { NextRequest, NextResponse } from 'next/server';
import { readSession, sameOrigin, SESSION_COOKIE } from './src/lib/session';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname.replace(/\/$/, '');
  if (path === '/api/auth/session' || path === '/api/landing-leads') return NextResponse.next();
  const user = await readSession(request.cookies.get(SESSION_COOKIE)?.value);
  if (!user) return NextResponse.json({ error: 'Inicie sessão para continuar.' }, { status: 401, headers: { 'Cache-Control': 'no-store' } });
  if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method) && !sameOrigin(request)) {
    return NextResponse.json({ error: 'Origem não permitida.' }, { status: 403 });
  }
  const response = NextResponse.next();
  response.headers.set('Cache-Control', 'private, no-store');
  return response;
}

export const config = { matcher: ['/api/:path*'] };
