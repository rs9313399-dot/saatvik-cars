import { cookies } from 'next/headers';
import { db } from '@/lib/db';

export async function checkAuth(request?: Request): Promise<boolean> {
  const cookieHeader = request?.headers.get('cookie') || '';
  const requestToken = cookieHeader
    .split(';')
    .map((part) => part.trim())
    .map((part) => {
      const [name, ...valueParts] = part.split('=');
      return { name, value: valueParts.join('=') };
    })
    .find((cookie) => cookie.name === 'admin_token' || cookie.name === 'admin-token')
    ?.value;

  const cookieStore = request ? null : await cookies();
  const token =
    requestToken ||
    cookieStore?.get('admin_token')?.value ||
    cookieStore?.get('admin-token')?.value;

  if (!token) return false;
  const admin = await db.admin.findFirst({ where: { token } });
  return !!admin;
}
