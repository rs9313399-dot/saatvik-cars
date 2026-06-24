import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if already subscribed (even if unsubscribed earlier, reactivate)
    const existing = await db.newsletterSubscriber.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      if (!existing.active) {
        await db.newsletterSubscriber.update({
          where: { id: existing.id },
          data: { active: true },
        });
        return NextResponse.json(
          { message: 'Welcome back! You have been re-subscribed.', subscribed: true },
          { status: 200 }
        );
      }
      return NextResponse.json(
        { message: 'Already subscribed', subscribed: true },
        { status: 200 }
      );
    }

    await db.newsletterSubscriber.create({
      data: { email: normalizedEmail },
    });

    return NextResponse.json(
      { message: 'Subscribed successfully', subscribed: true },
      { status: 201 }
    );
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET — list subscribers (admin only)
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('admin-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = await db.admin.findFirst({ where: { token } });
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const subscribers = await db.newsletterSubscriber.findMany({
      where: { active: true },
      orderBy: { createdAt: 'desc' },
      select: { id: true, email: true, createdAt: true },
    });

    return NextResponse.json({ subscribers, count: subscribers.length });
  } catch (error) {
    console.error('Newsletter list error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
