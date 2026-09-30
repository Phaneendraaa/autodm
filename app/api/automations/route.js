import { db, getUser, ObjectId } from '@/lib';
export async function POST(r) {
  const u = await getUser(); if (!u) return Response.json({}, { status: 401 });
  const { media_id, keywords, message } = await r.json();
  const k = (keywords || '').split(',').map((s) => s.trim()).filter(Boolean);
  if (!media_id || !k.length || !message) return Response.json({ error: 'missing' }, { status: 400 });
  await (await db()).collection('automations').insertOne({ user_id: u.id, media_id, keywords: k, message, active: true, created_at: new Date() });
  return Response.json({ ok: 1 });
}
export async function DELETE(r) {
  const u = await getUser(); if (!u) return Response.json({}, { status: 401 });
  try { await (await db()).collection('automations').deleteOne({ _id: new ObjectId(new URL(r.url).searchParams.get('id')), user_id: u.id }); } catch {}
  return Response.json({ ok: 1 });
}
