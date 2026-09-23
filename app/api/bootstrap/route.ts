import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
  'Pragma': 'no-cache',
  'Expires': '0'
};

async function fetchFullBootstrapData() {
  const rawLeads = await prisma.lead.findMany({
    include: { notas: { orderBy: { createdAt: 'desc' } } },
    orderBy: { createdAt: 'desc' }
  });

  const rawVisits = await prisma.visit.findMany({
    orderBy: { data: 'desc' }
  });

  const rawProposals = await prisma.proposal.findMany({
    orderBy: { dataEnvio: 'desc' }
  });

  const rawNotes = await prisma.note.findMany({
    orderBy: { date: 'desc' }
  });

  const rawOperations = await prisma.dealOperation.findMany({
    include: { notes: { orderBy: { date: 'desc' } } },
    orderBy: { createdAt: 'desc' }
  });

  const operations = rawOperations.map(op => ({
    ...op,
    checklist: JSON.parse(op.checklistJson || '{}'),
    historicoNotas: op.notes.map(n => ({
      id: n.id,
      author: n.author as any,
      text: n.text,
      date: n.date
    }))
  }));

  return {
    leads: rawLeads,
    visits: rawVisits,
    proposals: rawProposals,
    notes: rawNotes,
    operations
  };
}

export async function GET() {
  try {
    const data = await fetchFullBootstrapData();
    return NextResponse.json(data, { headers: NO_CACHE_HEADERS });
  } catch (error: any) {
    console.error('Bootstrap API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. Sync Proposals from client if server has none or client has extra proposals
    if (Array.isArray(body.proposals) && body.proposals.length > 0) {
      for (const p of body.proposals) {
        if (!p.id || !p.leadId) continue;
        const exists = await prisma.proposal.findUnique({ where: { id: p.id } });
        if (!exists) {
          await prisma.proposal.create({
            data: {
              id: p.id,
              leadId: p.leadId,
              nomeProprietario: p.nomeProprietario || '',
              moradaConcelhoFreguesia: p.moradaConcelhoFreguesia || '',
              valorMinimoAbsoluto: !isNaN(Number(p.valorMinimoAbsoluto)) ? Number(p.valorMinimoAbsoluto) : 0,
              valorProposta: !isNaN(Number(p.valorProposta)) ? Number(p.valorProposta) : 0,
              valorSinal: !isNaN(Number(p.valorSinal)) ? Number(p.valorSinal) : 0,
              valorRevenda: !isNaN(Number(p.valorRevenda)) ? Number(p.valorRevenda) : 0,
              margemPrevista: !isNaN(Number(p.margemPrevista)) ? Number(p.margemPrevista) : 0,
              spread: !isNaN(Number(p.spread)) ? Number(p.spread) : 0,
              multiploSinal: !isNaN(Number(p.multiploSinal)) ? Number(p.multiploSinal) : 0,
              dataEnvio: p.dataEnvio || new Date().toISOString().split('T')[0],
              estado: p.estado || 'Enviada',
              assignedUser: p.assignedUser || 'Queirós',
              proximoFollowUp: p.proximoFollowUp || null,
              notas: p.notas || null
            }
          }).catch(e => console.warn('Sync proposal insert warn:', e));
        }
      }
    }

    // 2. Sync Leads phases and statuses if client has more advanced phases
    if (Array.isArray(body.leads) && body.leads.length > 0) {
      for (const l of body.leads) {
        if (!l.id) continue;
        const dbLead = await prisma.lead.findUnique({ where: { id: l.id } });
        if (dbLead) {
          if (l.fase && l.fase !== dbLead.fase && dbLead.fase === 'Nova lead') {
            await prisma.lead.update({
              where: { id: l.id },
              data: { fase: l.fase, contacto: l.contacto || dbLead.contacto }
            }).catch(e => console.warn('Sync lead phase update warn:', e));
          }
        }
      }
    }

    const freshData = await fetchFullBootstrapData();
    return NextResponse.json(freshData, { headers: NO_CACHE_HEADERS });
  } catch (error: any) {
    console.error('Bootstrap POST sync error:', error);
    return NextResponse.json({ error: error.message }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}
