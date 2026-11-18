import { Resend } from "resend";
import { EVENT } from "./event";

export function appUrl(req?: Request) {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, "");
  if (req) {
    const h = req.headers;
    const host = h.get("x-forwarded-host") ?? h.get("host");
    const proto = h.get("x-forwarded-proto") ?? "https";
    if (host) return `${proto}://${host}`;
  }
  return "http://localhost:3000";
}

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export async function sendLoginEmail(opts: { to: string; name: string; link: string; firstTime: boolean }) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.log(`[mail] RESEND_API_KEY missing. Login link for ${opts.to}: ${opts.link}`);
    return { ok: true, dev: true };
  }
  const resend = new Resend(key);
  const first = opts.name.split(" ")[0] || "there";
  const subject = opts.firstTime ? "You're on the Friendsgiving list" : "Your Friendsgiving sign-in link";
  const lead = opts.firstTime
    ? "Thanks for RSVPing. Keep this email: the button below signs you back in on any device so you can change your RSVP or what you're bringing."
    : "Tap the button below to sign in. From there you can change your RSVP or what you're bringing.";

  const html = `<!doctype html><html><body style="margin:0;background:#f6f1ea;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#1c1917">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px"><tr><td align="center">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:440px;background:#ffffff;border-radius:20px;padding:36px 32px;border:1px solid #ece4d8">
      <tr><td>
        <p style="margin:0 0 4px;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#c2410c;font-weight:600">${esc(EVENT.dateLabel)} · ${esc(EVENT.timeLabel)}</p>
        <h1 style="margin:0 0 20px;font-size:28px;line-height:1.15;font-weight:600">Hey ${esc(first)}</h1>
        <p style="margin:0 0 28px;font-size:15px;line-height:1.6;color:#57534e">${lead}</p>
        <a href="${opts.link}" style="display:inline-block;background:#1c1917;color:#fff;text-decoration:none;font-weight:600;font-size:15px;padding:14px 22px;border-radius:12px">Open Friendsgiving</a>
        <p style="margin:28px 0 0;font-size:12px;line-height:1.6;color:#a8a29e">This link works for 7 days. If you didn't ask for it, you can ignore this email.</p>
      </td></tr>
    </table>
  </td></tr></table></body></html>`;

  const text = `Hey ${first},\n\n${lead}\n\n${opts.link}\n\nThis link works for 7 days.`;
  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM || "Friendsgiving <friendsgiving@bywilliaml.com>",
    to: opts.to,
    subject,
    html,
    text,
  });
  if (error) {
    console.error("[mail] send failed", error);
    return { ok: false };
  }
  return { ok: true };
}
