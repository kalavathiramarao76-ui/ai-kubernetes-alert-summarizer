import { markUserAuthenticated } from '@/lib/rate-limit';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown';
  const { uid, email } = await request.json();
  await markUserAuthenticated(ip, uid, email);
  return Response.json({ ok: true });
}
