import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/stats/[id] - Track a click event (no auth required)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const car = await db.car.findUnique({ where: { id } });
    if (!car) {
      return NextResponse.json({ error: 'Car not found' }, { status: 404 });
    }

    const body = await request.json();
    const { type } = body;

    if (!type || (type !== 'call' && type !== 'whatsapp')) {
      return NextResponse.json(
        { error: 'Invalid type. Must be "call" or "whatsapp"' },
        { status: 400 }
      );
    }

    if (type === 'call') {
      await db.car.update({
        where: { id },
        data: { callClicks: { increment: 1 } },
      });
    } else {
      await db.car.update({
        where: { id },
        data: { whatsappClicks: { increment: 1 } },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Track click error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
