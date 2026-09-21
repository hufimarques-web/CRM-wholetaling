import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const leads = await prisma.lead.findMany({
      include: { notas: true },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(leads);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const created = await prisma.lead.create({
      data: {
        id: body.id,
        nomeProprietario: body.nomeProprietario,
        telefone: body.telefone,
        email: body.email,
        freguesia: body.freguesia,
        concelho: body.concelho,
        moradaZona: body.moradaZona,
        tipoImovel: body.tipoImovel,
        estadoImovel: body.estadoImovel,
        areaM2: body.areaM2 ? Number(body.areaM2) : null,
        origem: body.origem,
        valorMinimoAbsoluto: Number(body.valorMinimoAbsoluto),
        flexibilidade: body.flexibilidade,
        prazoPretendido: body.prazoPretendido,
        margemPotencial: Number(body.margemPotencial || 0),
        precoM2: body.precoM2 ? Number(body.precoM2) : null,
        mediaFreguesiaM2: body.mediaFreguesiaM2 ? Number(body.mediaFreguesiaM2) : null,
        deltaMercadoPercent: body.deltaMercadoPercent ? Number(body.deltaMercadoPercent) : null,
        etiquetaMercado: body.etiquetaMercado,
        ratingMercado: body.ratingMercado,
        contacto: body.contacto,
        fotos: body.fotos,
        fase: body.fase,
        prioridade: body.prioridade,
        assignedTo: body.assignedTo,
        dataEntrada: body.dataEntrada,
        isDemo: body.isDemo || false
      },
      include: { notas: true }
    });
    return NextResponse.json(created);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
