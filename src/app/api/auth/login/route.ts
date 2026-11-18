import { db } from "@/lib/db";
import { createLoginToken } from "@/lib/session";
import { sendLoginEmail, appUrl } from "@/lib/mail";
import { body, clean, fail, isEmail, json, throttled } from "@/lib/http";

export async function POST(req: Request) {
  const b = await body(req);
  const email = clean(b.email, 200).toLowerCase();
  if (!isEmail(email)) return fail("That email doesn't look right.");

  const pool = await db();
  const { rows } = await pool.query("select id, name from guests where email = $1", [email]);
  if (!rows.length) return json({ ok: false, unknown: true });

  if (!throttled(`login:${email}`)) {
    const token = await createLoginToken(rows[0].id);
    await sendLoginEmail({ to: email, name: rows[0].name, link: `${appUrl(req)}/api/auth/verify?token=${token}`, firstTime: false });
  }
  return json({ ok: true });
}
