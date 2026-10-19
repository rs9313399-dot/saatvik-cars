import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const token =
      request.cookies.get('admin_token')?.value ||
      request.cookies.get('admin-token')?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false });
    }

    const admin = await db.admin.findFirst({ where: { token } });
    if (!admin) {
      return NextResponse.json({ authenticated: false });
    }

    return NextResponse.json({
      authenticated: true,
      admin: { id: admin.id, username: admin.username },
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { authenticated: false },
      { status: 500 },
    );
  }
}
