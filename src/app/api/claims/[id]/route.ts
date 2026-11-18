import { db } from "@/lib/db";
import { getState } from "@/lib/state";
import { body, clean, fail, json, toInt } from "@/lib/http";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: Ctx) {
  const id = toInt((await ctx.params).id);
  if (!id) return fail("Not found", 404);
  const b = await body(req);
  const pool = await db();
  if (b.note !== undefined) {
    await pool.query("update claims set note = $2 where id = $1", [id, clean(b.note, 80) || null]);
  }
  if (b.label !== undefined) {
    const label = clean(b.label, 60);
    if (!label) return fail("What are you bringing?");
    await pool.query("update claims set label = $2 where id = $1 and item_id is null", [id, label]);
  }
  return json({ ok: true, state: await getState() });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const id = toInt((await ctx.params).id);
  if (!id) return fail("Not found", 404);
  const pool = await db();
  await pool.query("delete from claims where id = $1", [id]);
  return json({ ok: true, state: await getState() });
}
