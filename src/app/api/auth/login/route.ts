import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, isPasswordHash, verifyPassword } from '@/lib/password';
import crypto from 'crypto';

const DEFAULT_ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const DEFAULT_ADMIN_PASSWORD =
  process.env.ADMIN_PASSWORD ||
  (process.env.NODE_ENV === 'production' ? '' : 'admin123');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const username = typeof body?.username === 'string' ? body.username.trim() : '';
    const password = typeof body?.password === 'string' ? body.password : '';

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 },
      );
    }

    let admin = await db.admin.findUnique({ where: { username } });
    const configuredCredentialsMatch =
      username === DEFAULT_ADMIN_USERNAME &&
      DEFAULT_ADMIN_PASSWORD !== '' &&
      password === DEFAULT_ADMIN_PASSWORD;

    if (!admin && !DEFAULT_ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: 'Admin login is not configured.' },
        { status: 503 },
      );
    }

    if (!admin && !configuredCredentialsMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    if (!admin) {
      try {
        admin = await db.admin.create({
          data: {
            username,
            password: await hashPassword(password),
          },
        });
      } catch (error) {
        if (
          typeof error !== 'object' ||
          error === null ||
          !('code' in error) ||
          error.code !== 'P2002'
        ) {
          throw error;
        }
        admin = await db.admin.findUnique({ where: { username } });
      }
    }

    if (!admin) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 },
      );
    }

    let validPassword = await verifyPassword(password, admin.password);
    if (!validPassword && configuredCredentialsMatch) {
      admin = await db.admin.update({
        where: { id: admin.id },
        data: { password: await hashPassword(password) },
      });
      validPassword = true;
    } else if (validPassword && !isPasswordHash(admin.password)) {
      admin = await db.admin.update({
        where: { id: admin.id },
        data: { password: await hashPassword(password) },
      });
    }

    if (!validPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 },
      );
    }

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
      admin: { id: admin.id, username: admin.username },
    });

    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    response.cookies.set('admin-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
