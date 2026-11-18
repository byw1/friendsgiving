import { db } from "@/lib/db";
import { getState } from "@/lib/state";
import { body, clean, fail, isStatus, json } from "@/lib/http";

export async function POST(req: Request) {
  const b = await body(req);
  const name = clean(b.name, 40);
  const status = String(b.status ?? "going");
  const plusOnes = Math.max(0, Math.min(5, Number(b.plusOnes) || 0));
  if (!name) return fail("What's your name?");
  if (!isStatus(status)) return fail("Pick going, maybe or can't go.");

  const pool = await db();
  // Same name already on the list? That's probably you.
  const existing = await pool.query("select id from guests where lower(name) = lower($1) limit 1", [name]);
  if (existing.rowCount) {
    const id = existing.rows[0].id;
    await pool.query("update guests set status = $2, plus_ones = $3, updated_at = now() where id = $1", [id, status, plusOnes]);
    return json({ id, existed: true, state: await getState() });
  }
  const count = await pool.query("select count(*)::int as n from guests");
  if (count.rows[0].n >= 300) return fail("The list is full.");
  const { rows } = await pool.query("insert into guests (name, status, plus_ones) values ($1, $2, $3) returning id", [
    name,
    status,
    plusOnes,
  ]);
  return json({ id: rows[0].id, state: await getState() });
}
