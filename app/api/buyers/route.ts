import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const leadId = searchParams.get('leadId');

    const buyers = await prisma.mediationBuyer.findMany({
      where: leadId ? { leadId } : undefined,
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(buyers);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const id = body.id || `buyer-${Date.now()}`;

    const buyerData = {
      leadId: body.leadId,
      nome: body.nome || 'Interessado',
      telefone: body.telefone || '',
      email: body.email || null,
      fase: body.fase || 'Interessado',
      valorOferta: body.valorOferta !== null && !isNaN(Number(body.valorOferta)) ? Number(body.valorOferta) : null,
      notas: body.notas || null,
      dataContato: body.dataContato || new Date().toISOString().split('T')[0]
    };

    const saved = await prisma.mediationBuyer.upsert({
      where: { id },
      create: {
        id,
        ...buyerData
      },
      update: buyerData
    });

    return NextResponse.json(saved);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Missing buyer ID' }, { status: 400 });
    }

    await prisma.mediationBuyer.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
