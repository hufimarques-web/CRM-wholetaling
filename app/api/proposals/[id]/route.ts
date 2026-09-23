import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const dataToUpdate: any = {};

    if (body.nomeProprietario !== undefined) dataToUpdate.nomeProprietario = body.nomeProprietario;
    if (body.moradaConcelhoFreguesia !== undefined) dataToUpdate.moradaConcelhoFreguesia = body.moradaConcelhoFreguesia;
    if (body.valorMinimoAbsoluto !== undefined && !isNaN(Number(body.valorMinimoAbsoluto))) {
      dataToUpdate.valorMinimoAbsoluto = Number(body.valorMinimoAbsoluto);
    }
    if (body.valorProposta !== undefined && !isNaN(Number(body.valorProposta))) {
      dataToUpdate.valorProposta = Number(body.valorProposta);
    }
    if (body.valorSinal !== undefined && !isNaN(Number(body.valorSinal))) {
      dataToUpdate.valorSinal = Number(body.valorSinal);
    }
    if (body.valorRevenda !== undefined && !isNaN(Number(body.valorRevenda))) {
      dataToUpdate.valorRevenda = Number(body.valorRevenda);
    }
    if (body.margemPrevista !== undefined && !isNaN(Number(body.margemPrevista))) {
      dataToUpdate.margemPrevista = Number(body.margemPrevista);
    }
    if (body.spread !== undefined && !isNaN(Number(body.spread))) {
      dataToUpdate.spread = Number(body.spread);
    }
    if (body.multiploSinal !== undefined && !isNaN(Number(body.multiploSinal))) {
      dataToUpdate.multiploSinal = Number(body.multiploSinal);
    }
    if (body.estado !== undefined) dataToUpdate.estado = body.estado;
    if (body.assignedUser !== undefined) dataToUpdate.assignedUser = body.assignedUser;
    if (body.proximoFollowUp !== undefined) dataToUpdate.proximoFollowUp = body.proximoFollowUp;
    if (body.notas !== undefined) dataToUpdate.notas = body.notas;

    const updated = await prisma.proposal.update({
      where: { id: params.id },
      data: dataToUpdate
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
