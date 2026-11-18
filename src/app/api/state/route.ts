import { currentGuestId } from "@/lib/session";
import { getState } from "@/lib/state";
import { json } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET() {
  return json(await getState(await currentGuestId()));
}
