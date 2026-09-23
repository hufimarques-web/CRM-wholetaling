import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
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

    return NextResponse.json(operations);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const created = await prisma.dealOperation.create({
      data: {
        id: body.id,
        leadId: body.leadId,
        proposalId: body.proposalId,
        nomeProprietario: body.nomeProprietario,
        freguesia: body.freguesia,
        tipoImovel: body.tipoImovel,
        areaM2: body.areaM2 ? Number(body.areaM2) : null,
        valorCompraAcordado: Number(body.valorCompraAcordado),
        valorSinalPago: Number(body.valorSinalPago),
        valorRevendaAlvo: Number(body.valorRevendaAlvo),
        margemPrevista: Number(body.margemPrevista),
        multiploSinal: Number(body.multiploSinal),
        fase: body.fase,
        responsavel: body.responsavel,
        dataAceitacao: body.dataAceitacao,
        dataAssinaturaCPCV: body.dataAssinaturaCPCV,
        dataLimiteEscritura: body.dataLimiteEscritura,
        dataVendaFechada: body.dataVendaFechada,
        compradorNome: body.compradorNome,
        compradorTelefone: body.compradorTelefone,
        valorVendaRealizado: body.valorVendaRealizado ? Number(body.valorVendaRealizado) : null,
        lucroRealizado: body.lucroRealizado ? Number(body.lucroRealizado) : null,
        checklistJson: JSON.stringify(body.checklist || {}),
        notas: body.notas
      },
      include: { notes: true }
    });

    return NextResponse.json({
      ...created,
      checklist: JSON.parse(created.checklistJson || '{}'),
      historicoNotas: created.notes
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
