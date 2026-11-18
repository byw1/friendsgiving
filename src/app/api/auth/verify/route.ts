import { NextResponse } from "next/server";
import { redeemLoginToken, setSession } from "@/lib/session";
import { appUrl } from "@/lib/mail";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token") ?? "";
  const base = appUrl(req);
  const id = token ? await redeemLoginToken(token) : null;
  if (!id) return NextResponse.redirect(`${base}/?signin=expired`);
  await setSession(id);
  return NextResponse.redirect(`${base}/?signin=ok`);
}
