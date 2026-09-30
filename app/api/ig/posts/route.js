import { db, getUser, dec } from '@/lib';
export const dynamic = 'force-dynamic';
export async function GET() {
  const u = await getUser(); if (!u) return Response.json([], { status: 401 });
  const a = await (await db()).collection('ig_accounts').findOne({ user_id: u.id }); if (!a) return Response.json([]);
  const r = await (await fetch(`https://graph.instagram.com/v21.0/me/media?fields=id,caption,permalink&limit=24&access_token=${dec(a.token)}`)).json();
  return Response.json(r.data || []);
}
