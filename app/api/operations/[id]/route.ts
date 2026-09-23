import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const dataToUpdate: any = {};

    if (body.fase !== undefined) dataToUpdate.fase = body.fase;
    if (body.compradorNome !== undefined) dataToUpdate.compradorNome = body.compradorNome;
    if (body.compradorTelefone !== undefined) dataToUpdate.compradorTelefone = body.compradorTelefone;
    if (body.valorVendaRealizado !== undefined) dataToUpdate.valorVendaRealizado = Number(body.valorVendaRealizado);
    if (body.lucroRealizado !== undefined) dataToUpdate.lucroRealizado = Number(body.lucroRealizado);
    if (body.dataAssinaturaCPCV !== undefined) dataToUpdate.dataAssinaturaCPCV = body.dataAssinaturaCPCV;
    if (body.dataLimiteEscritura !== undefined) dataToUpdate.dataLimiteEscritura = body.dataLimiteEscritura;
    if (body.dataVendaFechada !== undefined) dataToUpdate.dataVendaFechada = body.dataVendaFechada;
    if (body.notas !== undefined) dataToUpdate.notas = body.notas;
    if (body.checklist !== undefined) dataToUpdate.checklistJson = JSON.stringify(body.checklist);

    const updated = await prisma.dealOperation.update({
      where: { id: params.id },
      data: dataToUpdate,
      include: { notes: { orderBy: { date: 'desc' } } }
    });

    return NextResponse.json({
      ...updated,
      checklist: JSON.parse(updated.checklistJson || '{}'),
      historicoNotas: updated.notes
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.dealOperation.delete({
      where: { id: params.id }
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
