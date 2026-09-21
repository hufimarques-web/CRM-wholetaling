import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const createdNote = await prisma.operationNote.create({
      data: {
        id: body.id || `on-${Date.now()}`,
        operationId: params.id,
        author: body.author,
        text: body.text,
        date: body.date || new Date().toISOString()
      }
    });
    return NextResponse.json(createdNote);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
