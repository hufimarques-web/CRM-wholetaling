import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
    const id = body.id || `prop-${Date.now()}`;
    const proposalData = {
      leadId: body.leadId,
      nomeProprietario: body.nomeProprietario || '',
      moradaConcelhoFreguesia: body.moradaConcelhoFreguesia || '',
      valorMinimoAbsoluto: !isNaN(Number(body.valorMinimoAbsoluto)) ? Number(body.valorMinimoAbsoluto) : 0,
      valorProposta: !isNaN(Number(body.valorProposta)) ? Number(body.valorProposta) : 0,
      valorSinal: !isNaN(Number(body.valorSinal)) ? Number(body.valorSinal) : 0,
      valorRevenda: !isNaN(Number(body.valorRevenda)) ? Number(body.valorRevenda) : 0,
      margemPrevista: !isNaN(Number(body.margemPrevista)) ? Number(body.margemPrevista) : 0,
      spread: !isNaN(Number(body.spread)) ? Number(body.spread) : 0,
      multiploSinal: !isNaN(Number(body.multiploSinal)) ? Number(body.multiploSinal) : 0,
      dataEnvio: body.dataEnvio || new Date().toISOString().split('T')[0],
      estado: body.estado || 'Enviada',
      assignedUser: body.assignedUser || 'Queirós',
      proximoFollowUp: body.proximoFollowUp || null,
      notas: body.notas || null
    };

    const created = await prisma.proposal.upsert({
      where: { id },
      create: {
        id,
        ...proposalData
      },
      update: proposalData
    });
    return NextResponse.json(created);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
