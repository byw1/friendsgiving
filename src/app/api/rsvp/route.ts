import { db } from "@/lib/db";
import { currentGuestId, setSession, createLoginToken } from "@/lib/session";
import { getState } from "@/lib/state";
import { sendLoginEmail, appUrl } from "@/lib/mail";
import { body, clean, fail, isEmail, json, throttled } from "@/lib/http";

const STATUSES = ["going", "maybe", "cant"];

export async function POST(req: Request) {
  const b = await body(req);
  const name = clean(b.name, 60);
  const status = String(b.status ?? "");
  const plusOnes = Math.max(0, Math.min(5, Number(b.plusOnes) || 0));
  if (!STATUSES.includes(status)) return fail("Pick going, maybe or can't go.");

  const pool = await db();
  const meId = await currentGuestId();

  // Already signed in: just update.
  if (meId) {
    await pool.query(
      `update guests set name = coalesce(nullif($2, ''), name), status = $3, plus_ones = $4, updated_at = now() where id = $1`,
      [meId, name, status, plusOnes]
    );
    return json({ ok: true, state: await getState(meId) });
  }

  const email = clean(b.email, 200).toLowerCase();
  if (!name) return fail("Add your name.");
  if (!isEmail(email)) return fail("That email doesn't look right.");

  const existing = await pool.query("select id, name from guests where email = $1", [email]);
  if (existing.rowCount) {
    // Someone already RSVP'd with this email. Make them prove it's theirs.
    const g = existing.rows[0];
    if (!throttled(`login:${email}`)) {
      const token = await createLoginToken(g.id);
      await sendLoginEmail({ to: email, name: g.name, link: `${appUrl(req)}/api/auth/verify?token=${token}`, firstTime: false });
    }
    return json({ ok: true, verify: true });
  }

  const { rows } = await pool.query(
    "insert into guests (email, name, status, plus_ones) values ($1,$2,$3,$4) returning id",
    [email, name, status, plusOnes]
  );
  const id = rows[0].id as number;
  await setSession(id);

  // Send a "keep this to edit later" link. Failure here shouldn't block the RSVP.
  try {
    const token = await createLoginToken(id);
    throttled(`login:${email}`);
    await sendLoginEmail({ to: email, name, link: `${appUrl(req)}/api/auth/verify?token=${token}`, firstTime: true });
  } catch (e) {
    console.error("[rsvp] welcome email failed", e);
  }

  return json({ ok: true, state: await getState(id) });
}
