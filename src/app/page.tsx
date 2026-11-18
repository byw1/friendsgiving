import { App } from "@/components/App";
import { currentGuestId } from "@/lib/session";
import { getState } from "@/lib/state";
import { EVENT } from "@/lib/event";

export const dynamic = "force-dynamic";

export default async function Page() {
  const state = await getState(await currentGuestId());
  return <App initial={state} partifulUrl={EVENT.partifulUrl} />;
}
