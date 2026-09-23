import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
    const id = body.id || `lead-${Date.now()}`;
    const leadData = {
      nomeProprietario: body.nomeProprietario || '',
      telefone: body.telefone || '',
      email: body.email || null,
      freguesia: body.freguesia || '',
      concelho: body.concelho || null,
      moradaZona: body.moradaZona || null,
      tipoImovel: body.tipoImovel || 'Apartamento',
      estadoImovel: body.estadoImovel || 'Habitável',
      areaM2: body.areaM2 !== null && !isNaN(Number(body.areaM2)) ? Number(body.areaM2) : null,
      origem: body.origem || 'Prospeção direta',
      valorMinimoAbsoluto: !isNaN(Number(body.valorMinimoAbsoluto)) ? Number(body.valorMinimoAbsoluto) : 0,
      flexibilidade: body.flexibilidade || 'Sim',
      prazoPretendido: body.prazoPretendido || 'Curto prazo',
      margemPotencial: !isNaN(Number(body.margemPotencial)) ? Number(body.margemPotencial) : 0,
      precoM2: body.precoM2 !== null && !isNaN(Number(body.precoM2)) ? Number(body.precoM2) : null,
      mediaFreguesiaM2: body.mediaFreguesiaM2 !== null && !isNaN(Number(body.mediaFreguesiaM2)) ? Number(body.mediaFreguesiaM2) : null,
      deltaMercadoPercent: body.deltaMercadoPercent !== null && !isNaN(Number(body.deltaMercadoPercent)) ? Number(body.deltaMercadoPercent) : null,
      etiquetaMercado: body.etiquetaMercado || null,
      ratingMercado: body.ratingMercado || null,
      contacto: body.contacto || 'Não contactado',
      fotos: body.fotos || 'Sem fotos',
      fase: body.fase || 'Nova lead',
      prioridade: body.prioridade || 'Média',
      assignedTo: body.assignedTo || 'Queirós',
      dataEntrada: body.dataEntrada || new Date().toISOString().split('T')[0],
      isDemo: body.isDemo || false
    };

    const created = await prisma.lead.upsert({
      where: { id },
      create: {
        id,
        ...leadData
      },
      update: leadData,
      include: { notas: true }
    });
    return NextResponse.json(created);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
