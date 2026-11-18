"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { useApp } from "./App";
import { Avatar, Btn, Sheet, TextInput, bouncy, firstName, useToast } from "./ui";
import { claimLabel } from "./BringList";

/** Edit anyone. We trust our friends. */
export function GuestSheet({ id, onClose }: { id: number | null; onClose: () => void }) {
  const { state, api, me, setMeId } = useApp();
  const toast = useToast();
  const guest = state.guests.find((g) => g.id === id) ?? null;
  const [name, setName] = useState("");
  const [extra, setExtra] = useState("");
  const [confirm, setConfirm] = useState(false);

  useEffect(() => {
    setName(guest?.name ?? "");
    setConfirm(false);
    setExtra("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // If someone else deleted them while open, close.
  useEffect(() => {
    if (id && !guest) onClose();
  }, [id, guest, onClose]);

  if (!guest) return <Sheet open={false} onClose={onClose}>{null}</Sheet>;
  const isMe = me?.id === guest.id;
  const first = firstName(guest.name);

  const patch = (body: { name?: string }) => api(`/api/guests/${guest.id}`, { method: "PATCH", body });

  const saveName = async () => {
    if (name.trim() && name.trim() !== guest.name) {
      const r = await patch({ name });
      if (r.state) toast("Name updated");
    }
  };

  const needed = state.items.filter((i) => i.claims.length < i.need && !guest.claims.some((c) => c.itemId === i.id));

  return (
    <Sheet
      open={!!id}
      onClose={onClose}
      title={
        <span className="flex items-center gap-3">
          <Avatar name={guest.name} id={guest.id} size={40} />
          <span className="truncate">{isMe ? "You" : first}</span>
        </span>
      }
    >
      <div className="space-y-5">
        <div>
          <label htmlFor="guest-name" className="mb-1.5 block text-[13px] font-extrabold uppercase tracking-wider text-faint">
            Name
          </label>
          <TextInput id="guest-name" value={name} maxLength={40} onChange={(e) => setName(e.target.value)} onBlur={saveName} onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()} />
        </div>

        <div>
          <p className="mb-2 text-[13px] font-extrabold uppercase tracking-wider text-faint">{isMe ? "You're bringing" : `${first} is bringing`}</p>
          <motion.div layout className="flex flex-wrap gap-2">
            <AnimatePresence initial={false}>
              {guest.claims.map((c) => (
                <motion.span
                  layout
                  key={c.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={bouncy}
                  className="inline-flex items-center gap-1 rounded-xl bg-pumpkin-soft py-1.5 pl-3 pr-1.5 text-[14px] font-extrabold text-pumpkin-dark"
                >
                  {claimLabel(c, state.items)}
                  <button aria-label="Remove" onClick={() => api(`/api/claims/${c.id}`, { method: "DELETE" })} className="grid size-6 place-items-center rounded-lg hover:bg-white/60">
                    <X className="size-3.5" strokeWidth={3.5} />
                  </button>
                </motion.span>
              ))}
            </AnimatePresence>
            {guest.claims.length === 0 && <p className="text-[15px] font-bold text-faint">Nothing yet</p>}
          </motion.div>

          {needed.length > 0 && (
            <>
              <p className="mb-2 mt-4 text-[13px] font-extrabold uppercase tracking-wider text-faint">Still needed</p>
              <div className="flex flex-wrap gap-2">
                {needed.slice(0, 10).map((i) => (
                  <button
                    key={i.id}
                    onClick={() => api("/api/claims", { body: { guestId: guest.id, itemId: i.id } })}
                    className="ledge-sm inline-flex items-center gap-1 rounded-xl border-2 border-line bg-paper px-3 py-1.5 text-[14px] font-extrabold text-ink hover:bg-snow"
                  >
                    <Plus className="size-3.5 text-sky" strokeWidth={4} />
                    {i.label}
                  </button>
                ))}
              </div>
            </>
          )}

          <form
            className="mt-3 flex gap-2"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!extra.trim()) return;
              const r = await api("/api/claims", { body: { guestId: guest.id, label: extra } });
              if (r.state) setExtra("");
            }}
          >
            <TextInput id="guest-extra" value={extra} maxLength={60} onChange={(e) => setExtra(e.target.value)} placeholder="Something else…" className="!h-11 !text-[15px]" />
            <Btn tone="white" size="md" disabled={!extra.trim()} aria-label="Add">
              <Plus className="size-4" strokeWidth={3.5} />
            </Btn>
          </form>
        </div>

        <div className="flex flex-col gap-2 border-t-2 border-line pt-5">
          {isMe ? (
            <Btn tone="white" size="md" onClick={() => { setMeId(null); onClose(); }}>
              This isn't me
            </Btn>
          ) : (
            <Btn tone="white" size="md" onClick={() => { setMeId(guest.id); onClose(); toast(`Hey ${first}!`, "info"); }}>
              This is me
            </Btn>
          )}
          <Btn
            tone={confirm ? "berry" : "white"}
            size="md"
            className={confirm ? "" : "!text-berry"}
            onClick={async () => {
              if (!confirm) return setConfirm(true);
              const r = await api(`/api/guests/${guest.id}`, { method: "DELETE" });
              if (r.state) {
                if (isMe) setMeId(null);
                toast(`Removed ${first} from the list`, "info");
                onClose();
              }
            }}
          >
            <Trash2 className="size-4" strokeWidth={3} />
            {confirm ? "Tap again to remove" : "Remove them and their stuff"}
          </Btn>
        </div>
      </div>
    </Sheet>
  );
}
