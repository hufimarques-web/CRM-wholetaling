import { prisma } from '@/lib/prisma';
import { IntakeError, validateSubmission, saveSubmission } from '@/lib/landing-intake';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 30;
const origins = new Set(['https://wholetalinglp.vercel.app']);

function headers(origin: string | null) {
  return {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
    'Vary': 'Origin',
    ...(origin && origins.has(origin) ? { 'Access-Control-Allow-Origin': origin } : {})
  };
}

export async function OPTIONS(req: Request) {
  const origin = req.headers.get('origin');
  if (!origin || !origins.has(origin)) return new Response(null, { status: 403 });
  return new Response(null, { status: 204, headers: {
    ...headers(origin), 'Access-Control-Allow-Methods': 'POST',
    'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Max-Age': '600'
  } });
}

export async function POST(req: Request) {
  const origin = req.headers.get('origin');
  const reply = (body: object, status: number) => new Response(JSON.stringify(body), { status, headers: headers(origin) });
  if (!origin || !origins.has(origin)) return reply({ accepted: false, message: 'Origem não permitida.' }, 403);
  if (!req.headers.get('content-type')?.toLowerCase().startsWith('application/json')) return reply({ accepted: false, message: 'Pedido inválido.' }, 415);
  if (Number(req.headers.get('content-length')) > 12000) return reply({ accepted: false, message: 'Pedido demasiado grande.' }, 413);
  try {
    const reader = req.body?.getReader();
    if (!reader) return reply({ accepted: false, message: 'Pedido vazio.' }, 400);
    let size = 0;
    const chunks: Uint8Array[] = [];
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      size += chunk.value.byteLength;
      if (size > 12000) { await reader.cancel(); return reply({ accepted: false, message: 'Pedido demasiado grande.' }, 413); }
      chunks.push(chunk.value);
    }
    let body: unknown;
    try { body = JSON.parse(Buffer.concat(chunks).toString('utf8')); }
    catch { return reply({ accepted: false, message: 'Pedido inválido.' }, 400); }
    const submission = validateSubmission(body);
    const receipt = await saveSubmission(prisma, submission);
    return reply(receipt!, 200);
  } catch (error) {
    if (error instanceof IntakeError) return reply({ accepted: false, message: error.message }, error.status);
    // Do not expose database errors or personal data in responses or logs.
    return reply({ accepted: false, message: 'Não foi possível confirmar o envio. Tente novamente.' }, 503);
  }
}
