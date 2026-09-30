import { db, bcrypt, setSession } from '@/lib';
export async function POST(r) {
  const { mode, email, password } = await r.json();
  const e = (email || '').trim().toLowerCase();
  if (!e || !password || password.length < 8) return Response.json({ error: 'Enter an email and a password of 8+ characters' }, { status: 400 });
  const users = (await db()).collection('users'); let u;
  if (mode === 'register') {
    if (await users.findOne({ email: e })) return Response.json({ error: 'That email is already registered' }, { status: 409 });
    const role = e === (process.env.ADMIN_EMAIL || '').toLowerCase() ? 'ADMIN' : 'USER';
    try { const x = await users.insertOne({ email: e, pass: await bcrypt.hash(password, 10), role, credits: 0, created_at: new Date() }); u = { id: String(x.insertedId) }; }
    catch { return Response.json({ error: 'That email is already registered' }, { status: 409 }); }
  } else {
    const x = await users.findOne({ email: e });
    if (!x || !(await bcrypt.compare(password, x.pass))) return Response.json({ error: 'Wrong email or password' }, { status: 401 });
    u = { id: String(x._id) };
  }
  await setSession(u); return Response.json({ ok: 1 });
}
