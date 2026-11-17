import { prisma } from '@/lib/prisma';
import { dispatchMeta } from '@/mediation/meta';
import { timingSafeEqual } from 'node:crypto';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;
export async function GET(req: Request) {
  const supplied = Buffer.from(req.headers.get('authorization') || ''), expected = Buffer.from(`Bearer ${process.env.CRON_SECRET || ''}`);
  if (!process.env.CRON_SECRET || supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) return Response.json({ error: 'Não autorizado.' }, { status: 401 });
  return Response.json(await dispatchMeta(prisma, 5), { headers: { 'Cache-Control': 'no-store' } });
}
