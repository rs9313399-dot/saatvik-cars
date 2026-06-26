import { cookies } from 'next/headers';
import { db } from '@/lib/db';

/**
 * Check if the request is authenticated.
 * Supports both cookie-based and Bearer token auth.
 * If the Bearer token is invalid/stale, falls back to the cookie.
 */
export async function checkAuth(request?: Request): Promise<boolean> {
  // 1. Check Authorization header first (Bearer token)
  if (request) {
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      if (token) {
        const admin = await db.admin.findFirst({ where: { token } });
        if (admin) return true;
        // Bearer token was present but invalid — fall through to cookie check
      }
    }
  }

  // 2. Check cookies from the incoming request. Support both names used by
  // older and newer admin routes.
  if (request) {
    const cookieHeader = request.headers.get('cookie') || '';
    const requestToken = cookieHeader
      .split(';')
      .map((part) => part.trim())
      .map((part) => {
        const [name, ...valueParts] = part.split('=');
        return { name, value: valueParts.join('=') };
      })
      .find((cookie) => cookie.name === 'admin_token' || cookie.name === 'admin-token')
      ?.value;

    if (requestToken) {
      const admin = await db.admin.findFirst({ where: { token: requestToken } });
      if (admin) return true;
    }
  }

  // 3. Fallback to framework cookie store.
  try {
    const cookieStore = await cookies();
    const token =
      cookieStore.get('admin_token')?.value ||
      cookieStore.get('admin-token')?.value;
    if (!token) return false;
    const admin = await db.admin.findFirst({ where: { token } });
    return !!admin;
  } catch {
    return false;
  }
}
