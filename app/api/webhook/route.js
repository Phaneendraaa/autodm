import crypto from 'crypto';
import { db, dec, ObjectId } from '@/lib';
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
  const d = await db(), users = d.collection('users'), log = d.collection('dm_log');
  for (const e of JSON.parse(raw).entry || []) for (const c of e.changes || []) {
    if (c.field !== 'comments') continue;
    const v = c.value; if (!v?.id || v.from?.id === e.id) continue;
    const acc = await d.collection('ig_accounts').findOne({ ig_id: e.id }); if (!acc) continue;
    const rules = await d.collection('automations').find({ user_id: acc.user_id, media_id: v.media?.id, active: true }).toArray();
    const text = (v.text || '').toLowerCase();
    const m = rules.find((x) => x.keywords.some((k) => text.includes(k.toLowerCase()))); if (!m) continue;
    try { await log.insertOne({ _id: v.id, automation_id: String(m._id), user_id: acc.user_id, status: 'PENDING', created_at: new Date() }); }
    catch { continue; } // already handled: no double DM, no double charge
    const uid = new ObjectId(acc.user_id);
    const dd = await users.updateOne({ _id: uid, credits: { $gt: 0 } }, { $inc: { credits: -1 } });
    if (!dd.modifiedCount) { await log.updateOne({ _id: v.id }, { $set: { status: 'NO_CREDITS' } }); continue; }
    try {
      const res = await fetch(`https://graph.instagram.com/v21.0/${e.id}/messages`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + dec(acc.token) }, body: JSON.stringify({ recipient: { comment_id: v.id }, message: { text: m.message } }) });
      if (!res.ok) throw new Error(await res.text());
      await log.updateOne({ _id: v.id }, { $set: { status: 'SENT' } });
      await d.collection('credit_ledger').insertOne({ user_id: acc.user_id, delta: -1, reason: 'DM ' + v.id, created_at: new Date() });
    } catch (err) {
      await users.updateOne({ _id: uid }, { $inc: { credits: 1 } });
      await log.updateOne({ _id: v.id }, { $set: { status: 'FAILED', error: String(err).slice(0, 500) } });
    }
  }
  return new Response('ok');
}
