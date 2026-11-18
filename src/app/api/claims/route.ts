import { db } from "@/lib/db";
import { currentGuestId } from "@/lib/session";
import { getState } from "@/lib/state";
import { body, clean, fail, json } from "@/lib/http";

export async function POST(req: Request) {
  const meId = await currentGuestId();
  if (!meId) return fail("Sign in first.", 401);
  const b = await body(req);
  const note = clean(b.note, 80) || null;
  const pool = await db();

  const mine = await pool.query("select count(*)::int as n from claims where guest_id = $1", [meId]);
  if (mine.rows[0].n >= 8) return fail("That's a lot of stuff. Remove something first.");

  if (b.itemId != null) {
    const itemId = Number(b.itemId);
    const item = await pool.query("select id from items where id = $1", [itemId]);
    if (!item.rowCount) return fail("That item is gone.", 404);
    const dupe = await pool.query("select 1 from claims where guest_id = $1 and item_id = $2", [meId, itemId]);
    if (!dupe.rowCount) {
      await pool.query("insert into claims (guest_id, item_id, note) values ($1,$2,$3)", [meId, itemId, note]);
    }
  } else {
    const label = clean(b.label, 60);
    if (!label) return fail("What are you bringing?");
    await pool.query("insert into claims (guest_id, label, note) values ($1,$2,$3)", [meId, label, note]);
  }
  return json({ ok: true, state: await getState(meId) });
}
