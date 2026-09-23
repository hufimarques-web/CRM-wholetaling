import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const visits = await prisma.visit.findMany({
      orderBy: { data: 'desc' }
    });
    return NextResponse.json(visits);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const created = await prisma.visit.create({
      data: {
        id: body.id,
        leadId: body.leadId,
        nomeProprietario: body.nomeProprietario,
        moradaZona: body.moradaZona,
        concelhoFreguesia: body.concelhoFreguesia,
        data: body.data,
        hora: body.hora,
        responsavel: body.responsavel,
        assignedUser: body.assignedUser,
        estado: body.estado,
        notas: body.notas,
        resultado: body.resultado,
        realizadaEm: body.realizadaEm
      }
    });
    return NextResponse.json(created);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
