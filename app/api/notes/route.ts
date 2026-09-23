import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const notes = await prisma.note.findMany({
      orderBy: { date: 'desc' }
    });
    return NextResponse.json(notes);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const created = await prisma.note.create({
      data: {
        id: body.id,
        author: body.author,
        assignedUser: body.assignedUser,
        date: body.date,
        text: body.text,
        type: body.type || 'general',
        callResult: body.callResult,
        nextContactDate: body.nextContactDate,
        leadId: body.leadId,
        leadTitle: body.leadTitle,
        pinned: body.pinned || false
      }
    });
    return NextResponse.json(created);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
