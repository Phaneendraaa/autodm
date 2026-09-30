import { q, getUser } from '@/lib';
export async function POST(r) {
  const u = await getUser(); if (u?.role !== 'ADMIN') return Response.json({ error: 'forbidden' }, { status: 403 });
  const { email, amount, note } = await r.json(); const n = parseInt(amount);
  if (!n) return Response.json({ error: 'Enter a credit amount' }, { status: 400 });
  const x = await q('update users set credits=credits+$2 where email=$1 returning id,credits', [(email || '').trim().toLowerCase(), n]);
  if (!x.rowCount) return Response.json({ error: 'No user with that email' }, { status: 404 });
  await q('insert into credit_ledger(user_id,delta,reason) values($1,$2,$3)', [x.rows[0].id, n, 'ADMIN: ' + (note || '')]);
  return Response.json({ credits: x.rows[0].credits });
}
