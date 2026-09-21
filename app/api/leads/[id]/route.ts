import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const updated = await prisma.lead.update({
      where: { id: params.id },
      data: {
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
        isDemo: body.isDemo || false
      },
      include: { notas: true }
    });
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.lead.delete({
      where: { id: params.id }
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
