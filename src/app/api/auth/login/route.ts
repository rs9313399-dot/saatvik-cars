import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';

const DEFAULT_ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const DEFAULT_ADMIN_PASSWORD =
  process.env.ADMIN_PASSWORD ||
  (process.env.NODE_ENV === 'production' ? '' : 'admin123');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    if (!DEFAULT_ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: 'Admin login is not configured.' },
        { status: 503 }
      );
    }

    // Keep the configured admin login available in production even if an older
    // database already has a stale admin password.
    await db.admin.upsert({
      where: { username: DEFAULT_ADMIN_USERNAME },
      update: { password: DEFAULT_ADMIN_PASSWORD },
      create: {
        username: DEFAULT_ADMIN_USERNAME,
        password: DEFAULT_ADMIN_PASSWORD,
      },
    });

    // Find admin with matching credentials
    const admin = await db.admin.findFirst({
      where: { username, password },
    });

    if (!admin) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Reuse the existing token if it's still valid — this prevents invalidating
    // other active sessions/tabs when the same admin logs in again.
    // Only generate a new token if the admin doesn't have one yet.
    const token = admin.token || crypto.randomUUID();
    if (!admin.token) {
      await db.admin.update({
        where: { id: admin.id },
        data: { token },
      });
    }

    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      token, // Return token in response body for Bearer auth
      admin: { id: admin.id, username: admin.username },
    });

    // Also set cookie as fallback
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    response.cookies.set('admin-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
