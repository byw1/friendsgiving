import { db } from "./db";
import type { Claim, Guest, Item, Me, State } from "./types";

export async function getState(meId: number | null): Promise<State> {
  const pool = await db();
  const [itemsRes, claimsRes, guestsRes] = await Promise.all([
    pool.query("select id, category, label, hint, need from items order by sort, id"),
    pool.query(
      `select c.id, c.guest_id, g.name as guest_name, c.item_id, c.label, c.note
         from claims c join guests g on g.id = c.guest_id
        where g.status <> 'cant'
        order by c.created_at, c.id`
    ),
    pool.query("select id, email, name, status, plus_ones from guests order by created_at, id"),
  ]);

  const claims: Claim[] = claimsRes.rows.map((r) => ({
    id: r.id,
    guestId: r.guest_id,
    guestName: r.guest_name,
    itemId: r.item_id,
    label: r.label,
    note: r.note,
  }));

  const items: Item[] = itemsRes.rows.map((r) => ({
    id: r.id,
    category: r.category,
    label: r.label,
    hint: r.hint,
    need: r.need,
    claims: claims.filter((c) => c.itemId === r.id),
  }));
  const labelFor = (c: Claim) => (c.itemId ? items.find((i) => i.id === c.itemId)?.label ?? "" : c.label ?? "");

  const guests: Guest[] = guestsRes.rows.map((r) => ({
    id: r.id,
    name: r.name,
    status: r.status,
    plusOnes: r.plus_ones,
    bringing: claims.filter((c) => c.guestId === r.id).map((c) => (c.note ? `${labelFor(c)} (${c.note})` : labelFor(c))),
  }));

  let me: Me | null = null;
  if (meId) {
    const row = guestsRes.rows.find((r) => r.id === meId);
    if (row) {
      // Include claims even if they set "can't go", so they can see/clear them.
      const mine = await pool.query(
        "select id, guest_id, item_id, label, note from claims where guest_id = $1 order by created_at, id",
        [meId]
      );
      me = {
        id: row.id,
        name: row.name,
        email: row.email,
        status: row.status,
        plusOnes: row.plus_ones,
        claims: mine.rows.map((r) => ({
          id: r.id,
          guestId: r.guest_id,
          guestName: row.name,
          itemId: r.item_id,
          label: r.label,
          note: r.note,
        })),
      };
    }
  }

  return { me, items, extras: claims.filter((c) => c.itemId === null), guests };
}
