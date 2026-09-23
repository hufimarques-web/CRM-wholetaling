import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const dataToUpdate: any = {};

    if (body.nomeProprietario !== undefined) dataToUpdate.nomeProprietario = body.nomeProprietario;
    if (body.telefone !== undefined) dataToUpdate.telefone = body.telefone;
    if (body.email !== undefined) dataToUpdate.email = body.email;
    if (body.freguesia !== undefined) dataToUpdate.freguesia = body.freguesia;
    if (body.concelho !== undefined) dataToUpdate.concelho = body.concelho;
    if (body.moradaZona !== undefined) dataToUpdate.moradaZona = body.moradaZona;
    if (body.tipoImovel !== undefined) dataToUpdate.tipoImovel = body.tipoImovel;
    if (body.estadoImovel !== undefined) dataToUpdate.estadoImovel = body.estadoImovel;
    if (body.areaM2 !== undefined) dataToUpdate.areaM2 = body.areaM2 !== null && !isNaN(Number(body.areaM2)) ? Number(body.areaM2) : null;
    if (body.origem !== undefined) dataToUpdate.origem = body.origem;
    if (body.valorMinimoAbsoluto !== undefined && !isNaN(Number(body.valorMinimoAbsoluto))) {
      dataToUpdate.valorMinimoAbsoluto = Number(body.valorMinimoAbsoluto);
    }
    if (body.flexibilidade !== undefined) dataToUpdate.flexibilidade = body.flexibilidade;
    if (body.prazoPretendido !== undefined) dataToUpdate.prazoPretendido = body.prazoPretendido;
    if (body.margemPotencial !== undefined && !isNaN(Number(body.margemPotencial))) {
      dataToUpdate.margemPotencial = Number(body.margemPotencial);
    }
    if (body.precoM2 !== undefined) dataToUpdate.precoM2 = body.precoM2 !== null && !isNaN(Number(body.precoM2)) ? Number(body.precoM2) : null;
    if (body.mediaFreguesiaM2 !== undefined) dataToUpdate.mediaFreguesiaM2 = body.mediaFreguesiaM2 !== null && !isNaN(Number(body.mediaFreguesiaM2)) ? Number(body.mediaFreguesiaM2) : null;
    if (body.deltaMercadoPercent !== undefined) dataToUpdate.deltaMercadoPercent = body.deltaMercadoPercent !== null && !isNaN(Number(body.deltaMercadoPercent)) ? Number(body.deltaMercadoPercent) : null;
    if (body.etiquetaMercado !== undefined) dataToUpdate.etiquetaMercado = body.etiquetaMercado;
    if (body.ratingMercado !== undefined) dataToUpdate.ratingMercado = body.ratingMercado;
    if (body.contacto !== undefined) dataToUpdate.contacto = body.contacto;
    if (body.fotos !== undefined) dataToUpdate.fotos = body.fotos;
    if (body.fase !== undefined) dataToUpdate.fase = body.fase;
    if (body.prioridade !== undefined) dataToUpdate.prioridade = body.prioridade;
    if (body.assignedTo !== undefined) dataToUpdate.assignedTo = body.assignedTo;
    if (body.isDemo !== undefined) dataToUpdate.isDemo = body.isDemo || false;

    const updated = await prisma.lead.update({
      where: { id: params.id },
      data: dataToUpdate,
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
