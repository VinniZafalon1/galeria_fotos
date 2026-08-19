import { addUser, clearSession, getSession, getUser, setSession, type StoredUser } from './database';

export interface User { name: string; email: string }

async function hash(value: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function register(user: User & { password: string }): Promise<{ ok: boolean; message?: string }> {
  const email = user.email.trim().toLowerCase();
  if (await getUser(email)) return { ok: false, message: 'Já existe uma conta com este e-mail.' };
  const stored: StoredUser = { name: user.name.trim(), email, passwordHash: await hash(user.password), createdAt: new Date().toISOString() };
  await addUser(stored);
  return { ok: true };
}

export async function login(email: string, password: string) {
  const user = await getUser(email.trim().toLowerCase());
  if (!user || user.passwordHash !== await hash(password)) return false;
  await setSession(user.email);
  return true;
}
export async function logout() { await clearSession(); }
export async function isAuthenticated() { return Boolean(await getSession()); }
export async function currentUser(): Promise<User | undefined> {
  const email = await getSession(); if (!email) return undefined;
  const user = await getUser(email); return user && { name: user.name, email: user.email };
}
