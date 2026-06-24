import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';

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

    // Seed default admin if no admin exists
    const adminCount = await db.admin.count();
    if (adminCount === 0) {
      await db.admin.create({
        data: {
          username: 'admin',
          password: 'admin123',
        },
      });
    }

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

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
