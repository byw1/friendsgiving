import { NextResponse } from "next/server";

export const json = (data: unknown, status = 200) => NextResponse.json(data, { status });
export const fail = (error: string, status = 400) => NextResponse.json({ error }, { status });

export async function body<T = Record<string, unknown>>(req: Request): Promise<Partial<T>> {
  try {
    return (await req.json()) as Partial<T>;
  } catch {
    return {};
  }
}

export const clean = (v: unknown, max: number) =>
  typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) : "";

export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) && v.length <= 200;

const recent = new Map<string, number>();
/** Very small in-memory throttle so nobody can spam login emails. */
export function throttled(key: string, ms = 30_000) {
  const now = Date.now();
  const last = recent.get(key) ?? 0;
  if (now - last < ms) return true;
  recent.set(key, now);
  return false;
}
