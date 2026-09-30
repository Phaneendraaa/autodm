import { db } from '@/lib';
export const dynamic = 'force-dynamic';
export async function GET(r) {
  if (new URL(r.url).searchParams.get('key') !== process.env.SETUP_KEY) return new Response('forbidden', { status: 403 });
  const d = await db();
  await d.collection('users').createIndex({ email: 1 }, { unique: true });
  await d.collection('ig_accounts').createIndex({ user_id: 1 }, { unique: true });
  await d.collection('ig_accounts').createIndex({ ig_id: 1 }, { unique: true });
  await d.collection('automations').createIndex({ user_id: 1, media_id: 1 });
  return new Response('Database ready');
}
