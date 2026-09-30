import { db, getUser } from '@/lib';
export const dynamic = 'force-dynamic';
export async function GET() {
  const u = await getUser(); if (!u) return Response.json({ error: 'auth' }, { status: 401 });
  const d = await db();
  const ig = await d.collection('ig_accounts').findOne({ user_id: u.id }, { projection: { username: 1, _id: 0 } });
  const autos = (await d.collection('automations').find({ user_id: u.id }).sort({ _id: -1 }).toArray()).map((a) => ({ id: String(a._id), media_id: a.media_id, keywords: a.keywords, message: a.message }));
  const log = (await d.collection('dm_log').find({ user_id: u.id }).sort({ created_at: -1 }).limit(10).toArray()).map((l) => ({ comment_id: l._id, status: l.status }));
  return Response.json({ user: u, ig, autos, log });
}
