import { App } from "@/components/App";
import { getState } from "@/lib/state";
import { EVENT } from "@/lib/event";

export const dynamic = "force-dynamic";

export default async function Page() {
  return <App initial={await getState()} partifulUrl={EVENT.rsvpUrl} />;
}
