import { db } from "@/lib/db";
import { currentGuestId } from "@/lib/session";
import { getState } from "@/lib/state";
import { body, clean, fail, json } from "@/lib/http";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: Ctx) {
  const meId = await currentGuestId();
  if (!meId) return fail("Sign in first.", 401);
  const { id } = await ctx.params;
  const b = await body(req);
  const pool = await db();
  const note = clean(b.note, 80) || null;
  const label = b.label !== undefined ? clean(b.label, 60) : undefined;
  if (label !== undefined && !label) return fail("What are you bringing?");
  await pool.query(
    `update claims set note = $3, label = case when item_id is null and $4::text is not null then $4 else label end
      where id = $1 and guest_id = $2`,
    [Number(id), meId, note, label ?? null]
  );
  return json({ ok: true, state: await getState(meId) });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const meId = await currentGuestId();
  if (!meId) return fail("Sign in first.", 401);
  const { id } = await ctx.params;
  const pool = await db();
  await pool.query("delete from claims where id = $1 and guest_id = $2", [Number(id), meId]);
  return json({ ok: true, state: await getState(meId) });
}
