import { db } from "@/lib/db";
import { getState } from "@/lib/state";
import { body, clean, fail, isStatus, json, toInt } from "@/lib/http";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: Ctx) {
  const id = toInt((await ctx.params).id);
  if (!id) return fail("Who?", 404);
  const b = await body(req);
  const pool = await db();

  if (b.name !== undefined) {
    const name = clean(b.name, 40);
    if (!name) return fail("Names can't be empty.");
    await pool.query("update guests set name = $2, updated_at = now() where id = $1", [id, name]);
  }
  if (b.status !== undefined) {
    if (!isStatus(b.status)) return fail("Pick going, maybe or can't go.");
    await pool.query("update guests set status = $2, updated_at = now() where id = $1", [id, String(b.status)]);
  }
  if (b.plusOnes !== undefined) {
    const n = Math.max(0, Math.min(5, Number(b.plusOnes) || 0));
    await pool.query("update guests set plus_ones = $2, updated_at = now() where id = $1", [id, n]);
  }
  return json({ ok: true, state: await getState() });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const id = toInt((await ctx.params).id);
  if (!id) return fail("Who?", 404);
  const pool = await db();
  await pool.query("delete from guests where id = $1", [id]);
  return json({ ok: true, state: await getState() });
}
