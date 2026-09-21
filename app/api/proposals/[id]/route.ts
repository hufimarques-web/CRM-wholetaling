import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const updated = await prisma.proposal.update({
      where: { id: params.id },
      data: {
        valorProposta: Number(body.valorProposta),
        valorSinal: Number(body.valorSinal),
        valorRevenda: Number(body.valorRevenda),
        margemPrevista: Number(body.margemPrevista),
        spread: Number(body.spread),
        multiploSinal: Number(body.multiploSinal),
        estado: body.estado,
        assignedUser: body.assignedUser,
        proximoFollowUp: body.proximoFollowUp,
        notas: body.notas
      }
    });
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.proposal.delete({
      where: { id: params.id }
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
