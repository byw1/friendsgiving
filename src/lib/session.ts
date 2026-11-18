import { createHmac, randomBytes, createHash, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { db } from "./db";

const COOKIE = "fg_session";
const MAX_AGE = 60 * 60 * 24 * 60; // 60 days

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error("SESSION_SECRET is not set");
  return s;
}

function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

export async function setSession(guestId: number) {
  const value = `${guestId}`;
  const jar = await cookies();
  jar.set(COOKIE, `${value}.${sign(value)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function sessionGuestId(): Promise<number | null> {
  const jar = await cookies();
  const raw = jar.get(COOKIE)?.value;
  if (!raw) return null;
  const [value, sig] = raw.split(".");
  if (!value || !sig) return null;
  const expected = Buffer.from(sign(value));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

/** Returns the signed-in guest's id, or null if the cookie is missing or the guest is gone. */
export async function currentGuestId(): Promise<number | null> {
  const id = await sessionGuestId();
  if (!id) return null;
  const pool = await db();
  const { rowCount } = await pool.query("select 1 from guests where id = $1", [id]);
  return rowCount ? id : null;
}

const hash = (t: string) => createHash("sha256").update(t).digest("hex");

export async function createLoginToken(guestId: number) {
  const token = randomBytes(24).toString("base64url");
  const pool = await db();
  await pool.query("delete from login_tokens where expires_at < now()");
  await pool.query(
    "insert into login_tokens (token_hash, guest_id, expires_at) values ($1, $2, now() + interval '7 days')",
    [hash(token), guestId]
  );
  return token;
}

export async function redeemLoginToken(token: string): Promise<number | null> {
  const pool = await db();
  const { rows } = await pool.query(
    "select guest_id from login_tokens where token_hash = $1 and expires_at > now()",
    [hash(token)]
  );
  return rows[0]?.guest_id ?? null;
}
