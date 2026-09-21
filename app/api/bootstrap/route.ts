import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const rawLeads = await prisma.lead.findMany({
      include: { notas: true },
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

    return NextResponse.json({
      leads: rawLeads,
      visits: rawVisits,
      proposals: rawProposals,
      notes: rawNotes,
      operations
    });
  } catch (error: any) {
    console.error('Bootstrap API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
