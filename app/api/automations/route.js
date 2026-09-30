import { q, getUser } from '@/lib';
export async function POST(r) {
  const u = await getUser(); if (!u) return Response.json({}, { status: 401 });
  const { media_id, keywords, message } = await r.json();
  const k = (keywords || '').split(',').map((s) => s.trim()).filter(Boolean);
  if (!media_id || !k.length || !message) return Response.json({ error: 'missing' }, { status: 400 });
  await q('insert into automations(user_id,media_id,keywords,message) values($1,$2,$3,$4)', [u.id, media_id, k, message]);
  return Response.json({ ok: 1 });
}
export async function DELETE(r) {
  const u = await getUser(); if (!u) return Response.json({}, { status: 401 });
  await q('delete from automations where id=$1 and user_id=$2', [new URL(r.url).searchParams.get('id'), u.id]);
  return Response.json({ ok: 1 });
}
