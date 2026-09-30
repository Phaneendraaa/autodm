export const metadata = { title: 'AutoDM', description: 'Reply to Instagram comments with a DM automatically' };
export default function L({ children }) {
  return (<html lang="en"><body>{children}<style>{`
:root{--bg:#f5f6f8;--ink:#14213d;--acc:#fca311}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.5 system-ui,sans-serif}
main{max-width:640px;margin:0 auto;padding:32px 20px}h1{font-size:2rem;margin:0 0 4px}h2{margin:28px 0 8px;font-size:1.1rem}
input,select,textarea{display:block;width:100%;padding:10px;margin:8px 0;border:1px solid #c9cedb;border-radius:6px;font:inherit;background:#fff}
button,.btn{background:var(--ink);color:#fff;border:0;padding:10px 16px;border-radius:6px;font:inherit;cursor:pointer;text-decoration:none;display:inline-block}
button:focus-visible,input:focus-visible,select:focus-visible,textarea:focus-visible,a:focus-visible{outline:3px solid var(--acc);outline-offset:2px}
a{color:var(--ink);cursor:pointer}.row{display:flex;justify-content:space-between;gap:12px;padding:8px 0;border-bottom:1px solid #dde1ea}
.err{color:#b00020}.badge{background:var(--acc);padding:2px 10px;border-radius:99px;font-weight:700}
`}</style></body></html>);
}
