import pg from 'pg';
import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { cookies } from 'next/headers';
export { bcrypt };
export const pool = global._p || (global._p = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false }, max: 3 }));
export const q = (t, p) => pool.query(t, p);
const jk = () => new TextEncoder().encode(process.env.JWT_SECRET);
export async function setSession(u) {
  const t = await new SignJWT({ id: u.id }).setProtectedHeader({ alg: 'HS256' }).setExpirationTime('7d').sign(jk());
  cookies().set('s', t, { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 604800 });
}
export async function getUser() {
  try {
    const { payload } = await jwtVerify(cookies().get('s')?.value, jk());
    return (await q('select id,email,role,credits from users where id=$1', [payload.id])).rows[0] || null;
  } catch { return null; }
}
const ek = () => crypto.createHash('sha256').update(process.env.ENC_KEY).digest();
export const enc = (t) => { const iv = crypto.randomBytes(12), c = crypto.createCipheriv('aes-256-gcm', ek(), iv), b = Buffer.concat([c.update(t, 'utf8'), c.final()]); return Buffer.concat([iv, c.getAuthTag(), b]).toString('base64'); };
export const dec = (s) => { const b = Buffer.from(s, 'base64'), d = crypto.createDecipheriv('aes-256-gcm', ek(), b.subarray(0, 12)); d.setAuthTag(b.subarray(12, 28)); return Buffer.concat([d.update(b.subarray(28)), d.final()]).toString('utf8'); };
export const SCHEMA = `
create table if not exists users(id serial primary key,email text unique not null,pass text not null,role text default 'USER',credits int default 0);
create table if not exists ig_accounts(user_id int primary key references users(id),ig_id text unique not null,username text,token text not null,expires_at timestamptz);
create table if not exists automations(id serial primary key,user_id int references users(id),media_id text not null,keywords text[] not null,message text not null,active bool default true);
create table if not exists dm_log(comment_id text primary key,automation_id int,status text,error text,created_at timestamptz default now());
create table if not exists credit_ledger(id serial primary key,user_id int,delta int,reason text,created_at timestamptz default now());`;
