import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const proposals = await prisma.proposal.findMany({
      orderBy: { dataEnvio: 'desc' }
    });
    return NextResponse.json(proposals);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const created = await prisma.proposal.create({
      data: {
        id: body.id,
        leadId: body.leadId,
        nomeProprietario: body.nomeProprietario,
        moradaConcelhoFreguesia: body.moradaConcelhoFreguesia,
        valorMinimoAbsoluto: Number(body.valorMinimoAbsoluto),
        valorProposta: Number(body.valorProposta),
        valorSinal: Number(body.valorSinal),
        valorRevenda: Number(body.valorRevenda),
        margemPrevista: Number(body.margemPrevista),
        spread: Number(body.spread),
        multiploSinal: Number(body.multiploSinal),
        dataEnvio: body.dataEnvio,
        estado: body.estado,
        assignedUser: body.assignedUser,
        proximoFollowUp: body.proximoFollowUp,
        notas: body.notas
      }
    });
    return NextResponse.json(created);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
