import { q, getUser, enc } from '@/lib';
export const dynamic = 'force-dynamic';
export async function GET(r) {
  const u = await getUser(); const code = new URL(r.url).searchParams.get('code');
  if (!u || !code) return Response.redirect(process.env.APP_URL + '/dashboard');
  const b = new URLSearchParams({ client_id: process.env.IG_APP_ID, client_secret: process.env.IG_APP_SECRET, grant_type: 'authorization_code', redirect_uri: process.env.APP_URL + '/api/ig/callback', code: code.replace(/#_$/, '') });
  const s = await (await fetch('https://api.instagram.com/oauth/access_token', { method: 'POST', body: b })).json();
  if (!s.access_token) return new Response('Instagram connection failed: ' + JSON.stringify(s), { status: 400 });
  const l = await (await fetch(`https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${process.env.IG_APP_SECRET}&access_token=${s.access_token}`)).json();
  const tok = l.access_token || s.access_token;
  const me = await (await fetch(`https://graph.instagram.com/v21.0/me?fields=user_id,username&access_token=${tok}`)).json();
  const igid = String(me.user_id || s.user_id);
  await q(`insert into ig_accounts(user_id,ig_id,username,token,expires_at) values($1,$2,$3,$4,now()+interval '60 days') on conflict(user_id) do update set ig_id=$2,username=$3,token=$4,expires_at=now()+interval '60 days'`, [u.id, igid, me.username, enc(tok)]);
  await fetch(`https://graph.instagram.com/v21.0/${igid}/subscribed_apps?subscribed_fields=comments&access_token=${tok}`, { method: 'POST' });
  return Response.redirect(process.env.APP_URL + '/dashboard');
}
