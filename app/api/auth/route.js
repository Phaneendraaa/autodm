import { q, bcrypt, setSession } from '@/lib';
export async function POST(r) {
  const { mode, email, password } = await r.json();
  const e = (email || '').trim().toLowerCase();
  if (!e || !password || password.length < 8) return Response.json({ error: 'Enter an email and a password of 8+ characters' }, { status: 400 });
  let u;
  if (mode === 'register') {
    const role = e === (process.env.ADMIN_EMAIL || '').toLowerCase() ? 'ADMIN' : 'USER';
    try { u = (await q('insert into users(email,pass,role) values($1,$2,$3) returning id', [e, await bcrypt.hash(password, 10), role])).rows[0]; }
    catch { return Response.json({ error: 'That email is already registered' }, { status: 409 }); }
  } else {
    const x = (await q('select id,pass from users where email=$1', [e])).rows[0];
    if (!x || !(await bcrypt.compare(password, x.pass))) return Response.json({ error: 'Wrong email or password' }, { status: 401 });
    u = x;
  }
  await setSession(u); return Response.json({ ok: 1 });
}
