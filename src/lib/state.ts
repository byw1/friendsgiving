import { db } from "./db";
import { SEED_ITEMS } from "./event";
import type { Claim, Guest, Item, State } from "./types";

export async function getState(): Promise<State> {
  const pool = await db();
  const [itemsRes, claimsRes, guestsRes] = await Promise.all([
    pool.query("select id, slug, category, label, hint, need from items order by sort, id"),
    pool.query(
      `select c.id, c.guest_id, g.name as guest_name, g.status, c.item_id, c.label, c.note, c.category
         from claims c join guests g on g.id = c.guest_id
        order by c.created_at, c.id`
    ),
    pool.query("select id, name, status, plus_ones from guests order by created_at, id"),
  ]);

  const all = claimsRes.rows.map((r) => ({
    claim: { id: r.id, guestId: r.guest_id, guestName: r.guest_name, itemId: r.item_id, label: r.label, note: r.note, category: r.category } as Claim,
    out: r.status === "cant",
  }));
  // Stuff from people who can't come doesn't count toward the list.
  const live = all.filter((c) => !c.out).map((c) => c.claim);

  const items: Item[] = itemsRes.rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    category: r.category,
    label: r.label,
    hint: r.hint,
    need: r.need,
    options: SEED_ITEMS.find((s) => s.slug === r.slug)?.options,
    claims: live.filter((c) => c.itemId === r.id),
  }));

  const guests: Guest[] = guestsRes.rows.map((r) => ({
    id: r.id,
    name: r.name,
    status: r.status,
    plusOnes: r.plus_ones,
    claims: all.filter((c) => c.claim.guestId === r.id).map((c) => c.claim),
  }));

  return { items, extras: live.filter((c) => c.itemId === null), guests };
}
