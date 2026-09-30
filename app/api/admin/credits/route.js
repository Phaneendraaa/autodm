import { db, getUser } from '@/lib';
export async function POST(r) {
  const u = await getUser(); if (u?.role !== 'ADMIN') return Response.json({ error: 'forbidden' }, { status: 403 });
  const { email, amount, note } = await r.json(); const n = parseInt(amount);
  if (!n) return Response.json({ error: 'Enter a credit amount' }, { status: 400 });
  const d = await db();
  const x = await d.collection('users').findOneAndUpdate({ email: (email || '').trim().toLowerCase() }, { $inc: { credits: n } }, { returnDocument: 'after' });
  if (!x) return Response.json({ error: 'No user with that email' }, { status: 404 });
  await d.collection('credit_ledger').insertOne({ user_id: String(x._id), delta: n, reason: 'ADMIN: ' + (note || ''), created_at: new Date() });
  return Response.json({ credits: x.credits });
}
