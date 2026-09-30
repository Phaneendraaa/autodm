import crypto from 'crypto';
import { q, dec } from '@/lib';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;
export async function GET(r) {
  const p = new URL(r.url).searchParams;
  return p.get('hub.verify_token') === process.env.VERIFY_TOKEN ? new Response(p.get('hub.challenge')) : new Response('forbidden', { status: 403 });
}
export async function POST(r) {
  const raw = await r.text();
  const sig = r.headers.get('x-hub-signature-256') || '';
  const exp = 'sha256=' + crypto.createHmac('sha256', process.env.IG_APP_SECRET).update(raw).digest('hex');
  if (sig.length !== exp.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(exp))) return new Response('bad signature', { status: 401 });
  for (const e of JSON.parse(raw).entry || []) for (const c of e.changes || []) {
    if (c.field !== 'comments') continue;
    const v = c.value; if (!v?.id || v.from?.id === e.id) continue;
    const rules = (await q('select a.id,a.keywords,a.message,a.user_id,i.token from automations a join ig_accounts i on i.user_id=a.user_id where i.ig_id=$1 and a.media_id=$2 and a.active', [e.id, v.media?.id])).rows;
    const text = (v.text || '').toLowerCase();
    const m = rules.find((x) => x.keywords.some((k) => text.includes(k.toLowerCase()))); if (!m) continue;
    const ins = await q("insert into dm_log(comment_id,automation_id,status) values($1,$2,'PENDING') on conflict do nothing", [v.id, m.id]);
    if (!ins.rowCount) continue; // already handled: no double DM, no double charge
    const d = await q('update users set credits=credits-1 where id=$1 and credits>0', [m.user_id]);
    if (!d.rowCount) { await q("update dm_log set status='NO_CREDITS' where comment_id=$1", [v.id]); continue; }
    try {
      const res = await fetch(`https://graph.instagram.com/v21.0/${e.id}/messages`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + dec(m.token) }, body: JSON.stringify({ recipient: { comment_id: v.id }, message: { text: m.message } }) });
      if (!res.ok) throw new Error(await res.text());
      await q("update dm_log set status='SENT' where comment_id=$1", [v.id]);
      await q('insert into credit_ledger(user_id,delta,reason) values($1,-1,$2)', [m.user_id, 'DM ' + v.id]);
    } catch (err) {
      await q('update users set credits=credits+1 where id=$1', [m.user_id]);
      await q("update dm_log set status='FAILED',error=$2 where comment_id=$1", [v.id, String(err).slice(0, 500)]);
    }
  }
  return new Response('ok');
}
