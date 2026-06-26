import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkAuth } from '@/lib/auth';

// Allowed service inquiry types per C7/C8/C9 + C6 finance
const ALLOWED_TYPES = new Set([
  'insurance',
  'rc_transfer',
  'exchange',
  'warranty',
  'rsa',
  'finance',
]);

/**
 * POST /api/service-inquiry — Public submission endpoint.
 * Used by the Finance eligibility form (type: "finance") and other service inquiry forms.
 * Creates a new ServiceInquiry record and returns 201 on success.
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
      type,
      name,
      phone,
      email = '',
      carDetail = '',
      message = '',
    } = body as Record<string, unknown>;

    // --- Validation: type ---
    if (!type || typeof type !== 'string' || !ALLOWED_TYPES.has(type)) {
      return NextResponse.json(
        {
          error:
            'Type is required and must be one of: insurance, rc_transfer, exchange, warranty, rsa, finance.',
        },
        { status: 400 }
      );
    }

    // --- Validation: name ---
    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { error: 'Name is required.' },
        { status: 400 }
      );
    }

    // --- Validation: phone ---
    if (!phone || typeof phone !== 'string' || !phone.trim()) {
      return NextResponse.json(
        { error: 'Phone number is required.' },
        { status: 400 }
      );
    }

    const normalizedPhone = String(phone).replace(/\s+/g, '').trim();
    if (!/^[0-9+\-()]{7,20}$/.test(normalizedPhone)) {
      return NextResponse.json(
        { error: 'Please enter a valid phone number.' },
        { status: 400 }
      );
    }

    const normalizedEmail =
      typeof email === 'string' ? email.trim().toLowerCase() : '';

    const inquiry = await db.serviceInquiry.create({
      data: {
        type: type as string,
        name: String(name).trim(),
        phone: normalizedPhone,
        email: normalizedEmail,
        carDetail: typeof carDetail === 'string' ? carDetail : '',
        message: typeof message === 'string' ? message : '',
        status: 'new',
      },
    });

    return NextResponse.json(
      {
        message:
          'Your finance request has been received! Our team will call you within 24 hours.',
        id: inquiry.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Service inquiry creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/service-inquiry — Admin-only. Returns all service inquiries, newest first.
 * Supports optional `?type=` filter (insurance, rc_transfer, exchange, warranty, rsa, finance).
 */
export async function GET(request: NextRequest) {
  try {
    const authenticated = await checkAuth(request);
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // --- Filters ---
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type')?.trim();

    const where: { type?: string } = {};
    if (type && ALLOWED_TYPES.has(type)) {
      where.type = type;
    }

    const inquiries = await db.serviceInquiry.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      inquiries,
      count: inquiries.length,
    });
  } catch (error) {
    console.error('Service inquiry list error:', error);
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}
