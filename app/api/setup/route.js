import { q, SCHEMA } from '@/lib';
export const dynamic = 'force-dynamic';
export async function GET(r) {
  if (new URL(r.url).searchParams.get('key') !== process.env.SETUP_KEY) return new Response('forbidden', { status: 403 });
  await q(SCHEMA); return new Response('Database ready');
}
