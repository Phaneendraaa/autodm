'use client';
import { useState } from 'react';
export default function Home() {
  const [m, setM] = useState('login'), [e, setE] = useState(''), [p, setP] = useState(''), [err, setErr] = useState('');
  async function go() {
    const r = await fetch('/api/auth', { method: 'POST', body: JSON.stringify({ mode: m, email: e, password: p }) });
    const j = await r.json(); if (r.ok) location = '/dashboard'; else setErr(j.error);
  }
  return (<main>
    <h1>AutoDM</h1><p>Someone comments your keyword on a post. They get your link in their DMs.</p>
    <input placeholder="Email" value={e} onChange={(x) => setE(x.target.value)} />
    <input type="password" placeholder="Password (8+ characters)" value={p} onChange={(x) => setP(x.target.value)} />
    <button onClick={go}>{m === 'login' ? 'Log in' : 'Create account'}</button>{' '}
    <a onClick={() => setM(m === 'login' ? 'register' : 'login')}>{m === 'login' ? 'Need an account? Sign up' : 'Have an account? Log in'}</a>
    {err && <p className="err">{err}</p>}
  </main>);
}
