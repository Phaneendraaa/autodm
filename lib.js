import { MongoClient, ObjectId } from 'mongodb';
import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { cookies } from 'next/headers';
export { bcrypt, ObjectId };
const client = global._m || (global._m = new MongoClient(process.env.MONGODB_URI, { maxPoolSize: 5 }).connect());
export const db = async () => (await client).db('autodm');
const jk = () => new TextEncoder().encode(process.env.JWT_SECRET);
export async function setSession(u) {
  const t = await new SignJWT({ id: u.id }).setProtectedHeader({ alg: 'HS256' }).setExpirationTime('7d').sign(jk());
  cookies().set('s', t, { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 604800 });
}
export async function getUser() {
  try {
    const { payload } = await jwtVerify(cookies().get('s')?.value, jk());
    const u = await (await db()).collection('users').findOne({ _id: new ObjectId(payload.id) });
    return u ? { id: String(u._id), email: u.email, role: u.role, credits: u.credits } : null;
  } catch { return null; }
}
const ek = () => crypto.createHash('sha256').update(process.env.ENC_KEY).digest();
export const enc = (t) => { const iv = crypto.randomBytes(12), c = crypto.createCipheriv('aes-256-gcm', ek(), iv), b = Buffer.concat([c.update(t, 'utf8'), c.final()]); return Buffer.concat([iv, c.getAuthTag(), b]).toString('base64'); };
export const dec = (s) => { const b = Buffer.from(s, 'base64'), d = crypto.createDecipheriv('aes-256-gcm', ek(), b.subarray(0, 12)); d.setAuthTag(b.subarray(12, 28)); return Buffer.concat([d.update(b.subarray(28)), d.final()]).toString('utf8'); };
