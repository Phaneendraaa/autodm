import { q, getUser } from '@/lib';
export const dynamic = 'force-dynamic';
export async function GET() {
  const u = await getUser(); if (!u) return Response.json({ error: 'auth' }, { status: 401 });
  const ig = (await q('select username from ig_accounts where user_id=$1', [u.id])).rows[0] || null;
  const autos = (await q('select id,media_id,keywords,message from automations where user_id=$1 order by id desc', [u.id])).rows;
  const log = (await q('select l.comment_id,l.status,l.created_at from dm_log l join automations a on a.id=l.automation_id where a.user_id=$1 order by l.created_at desc limit 10', [u.id])).rows;
  return Response.json({ user: u, ig, autos, log });
}
