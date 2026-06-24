import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

const ALLOWED_TYPES = new Set(['test_drive', 'callback', 'general']);

/**
 * POST /api/leads — Public submission endpoint.
 * Creates a new lead (test drive request, callback request, or general enquiry).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request body.' },
        { status: 400 }
      );
    }

    const {
      type = 'test_drive',
      name,
      email = '',
      phone,
      carId = '',
      carName = '',
      message = '',
      preferredDate = '',
    } = body as Record<string, unknown>;

    // --- Validation ---
    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { error: 'Name is required.' },
        { status: 400 }
      );
    }

    if (!phone || typeof phone !== 'string' || !phone.trim()) {
      return NextResponse.json(
        { error: 'Phone number is required.' },
        { status: 400 }
      );
    }

    const normalizedType = ALLOWED_TYPES.has(type as string)
      ? (type as string)
      : 'test_drive';

    // Normalize phone — strip spaces
    const normalizedPhone = String(phone).replace(/\s+/g, '').trim();

    // Basic phone sanity check (digits, +, -, parens)
    if (!/^[0-9+\-()]{7,20}$/.test(normalizedPhone)) {
      return NextResponse.json(
        { error: 'Please enter a valid phone number.' },
        { status: 400 }
      );
    }

    const normalizedEmail =
      typeof email === 'string' ? email.trim().toLowerCase() : '';

    await db.lead.create({
      data: {
        type: normalizedType,
        name: String(name).trim(),
        email: normalizedEmail,
        phone: normalizedPhone,
        carId: typeof carId === 'string' ? carId : '',
        carName: typeof carName === 'string' ? carName : '',
        message: typeof message === 'string' ? message : '',
        preferredDate: typeof preferredDate === 'string' ? preferredDate : '',
        status: 'new',
      },
    });

    return NextResponse.json(
      {
        message: 'Request received! Our team will call you within 24 hours.',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Lead creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/leads — Admin-only. Returns all leads, newest first.
 * Supports optional `?type=` and `?status=` filters.
 */
export async function GET(request: NextRequest) {
  try {
    // --- Auth check (admin-token cookie) ---
    const token = request.cookies.get('admin-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = await db.admin.findFirst({ where: { token } });
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // --- Filters ---
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type')?.trim();
    const status = searchParams.get('status')?.trim();

    const where: { type?: string; status?: string } = {};
    if (type && ALLOWED_TYPES.has(type)) {
      where.type = type;
    }
    if (status && ['new', 'contacted', 'closed'].includes(status)) {
      where.status = status;
    }

    const leads = await db.lead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ leads, count: leads.length });
  } catch (error) {
    console.error('Lead list error:', error);
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}
