'use client';
import { useEffect, useState } from 'react';
export default function Dash() {
  const [d, setD] = useState(null), [posts, setPosts] = useState([]), [f, setF] = useState({ media_id: '', keywords: '', message: '' });
  const load = async () => { const r = await fetch('/api/me'); if (r.status === 401) { location = '/'; return; } setD(await r.json()); };
  useEffect(() => { load(); }, []);
  useEffect(() => { if (d?.ig) fetch('/api/ig/posts').then((r) => r.json()).then(setPosts); }, [d?.ig?.username]);
  if (!d) return <main>Loading…</main>;
  async function add() {
    const r = await fetch('/api/automations', { method: 'POST', body: JSON.stringify(f) });
    if (r.ok) { setF({ media_id: '', keywords: '', message: '' }); load(); } else alert('Choose a post, add keywords and write the DM message');
  }
  async function del(id) { await fetch('/api/automations?id=' + id, { method: 'DELETE' }); load(); }
  return (<main>
    <h1>Dashboard</h1>
    <p>Credits left: <span className="badge">{d.user.credits}</span> Each DM sent uses 1 credit. {d.user.role === 'ADMIN' && <a href="/admin">Admin</a>}</p>
    {!d.ig ? <a className="btn" href="/api/ig/connect">Connect Instagram</a> : <p>Connected as @{d.ig.username}</p>}
    {d.ig && <>
      <h2>Turn on auto DM for a post</h2>
      <select value={f.media_id} onChange={(x) => setF({ ...f, media_id: x.target.value })}>
        <option value="">Choose a post</option>
        {posts.map((p) => <option key={p.id} value={p.id}>{(p.caption || p.id).slice(0, 60)}</option>)}
      </select>
      <input placeholder="Keywords, separated by commas (LINK, PRICE)" value={f.keywords} onChange={(x) => setF({ ...f, keywords: x.target.value })} />
      <textarea rows={3} placeholder="DM to send (paste your link here)" value={f.message} onChange={(x) => setF({ ...f, message: x.target.value })} />
      <button onClick={add}>Turn on auto DM</button>
    </>}
    <h2>Active automations</h2>
    {d.autos.length === 0 && <p>None yet. Choose a post above to start.</p>}
    {d.autos.map((a) => <div className="row" key={a.id}><span>{a.keywords.join(', ')}: {a.message.slice(0, 50)}</span><button onClick={() => del(a.id)}>Delete</button></div>)}
    <h2>Recent DMs</h2>
    {d.log.map((l) => <div className="row" key={l.comment_id}><span>Comment …{l.comment_id.slice(-6)}</span><span>{l.status}</span></div>)}
  </main>);
}
