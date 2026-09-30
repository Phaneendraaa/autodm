'use client';
import { useState } from 'react';
export default function Admin() {
  const [f, setF] = useState({ email: '', amount: '', note: '' }), [msg, setMsg] = useState('');
  async function add() {
    const r = await fetch('/api/admin/credits', { method: 'POST', body: JSON.stringify(f) }); const j = await r.json();
    setMsg(r.ok ? `Credits added. New balance: ${j.credits}` : j.error);
    if (r.ok) setF({ email: '', amount: '', note: '' });
  }
  return (<main>
    <h1>Add credits</h1><p><a href="/dashboard">Back to dashboard</a></p>
    <input placeholder="User email" value={f.email} onChange={(x) => setF({ ...f, email: x.target.value })} />
    <input placeholder="Credits to add (negative to remove)" value={f.amount} onChange={(x) => setF({ ...f, amount: x.target.value })} />
    <input placeholder="Payment ID or note" value={f.note} onChange={(x) => setF({ ...f, note: x.target.value })} />
    <button onClick={add}>Add credits</button>{msg && <p>{msg}</p>}
  </main>);
}
