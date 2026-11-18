import { db } from "@/lib/db";
import { getState } from "@/lib/state";
import { body, clean, fail, json, toInt } from "@/lib/http";

export async function POST(req: Request) {
  const b = await body(req);
  const guestId = toInt(b.guestId);
  if (!guestId) return fail("Who's bringing it?");
  const note = clean(b.note, 80) || null;
  const pool = await db();

  const guest = await pool.query("select 1 from guests where id = $1", [guestId]);
  if (!guest.rowCount) return fail("That person isn't on the list anymore.", 404);
  const mine = await pool.query("select count(*)::int as n from claims where guest_id = $1", [guestId]);
  if (mine.rows[0].n >= 10) return fail("That's a lot of stuff for one person.");

  if (b.itemId != null) {
    const itemId = toInt(b.itemId);
    const item = itemId ? await pool.query("select 1 from items where id = $1", [itemId]) : null;
    if (!item?.rowCount) return fail("That item is gone.", 404);
    const dupe = await pool.query("select 1 from claims where guest_id = $1 and item_id = $2", [guestId, itemId]);
    if (!dupe.rowCount) {
      await pool.query("insert into claims (guest_id, item_id, note) values ($1, $2, $3)", [guestId, itemId, note]);
    }
  } else {
    const label = clean(b.label, 60);
    if (!label) return fail("What are you bringing?");
    await pool.query("insert into claims (guest_id, label, note) values ($1, $2, $3)", [guestId, label, note]);
  }
  return json({ ok: true, state: await getState() });
}
