"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import clsx from "clsx";
import { ChevronRight, UserPlus } from "lucide-react";
import type { Status } from "@/lib/types";
import { useApp } from "./App";
import { Avatar, Btn, Heading, STATUS, Sheet, StatusFace, StatusPicker, TextInput, bouncy, useToast } from "./ui";
import { claimLabel } from "./BringList";

const TABS: Status[] = ["going", "maybe", "cant"];

export function Crew() {
  const { state, me, editGuest } = useApp();
  const [tab, setTab] = useState<Status>("going");
  const [adding, setAdding] = useState(false);
  const list = state.guests.filter((g) => g.status === tab);
  const count = (s: Status) => state.guests.filter((g) => g.status === s).length;

  return (
    <section id="crew" className="scroll-mt-20">
      <Heading
        sub="Tap anyone to update them."
        right={
          <Btn tone="white" size="sm" onClick={() => setAdding(true)}>
            <UserPlus className="size-4" strokeWidth={3} /> Add
          </Btn>
        }
      >
        The crew
      </Heading>

      <div className="mb-4 grid grid-cols-3 gap-2">
        {TABS.map((s) => {
          const on = tab === s;
          return (
            <button
              key={s}
              onClick={() => setTab(s)}
              style={{ ["--ledge" as string]: on ? STATUS[s].ledge : "var(--color-line)" }}
              className={clsx(
                "ledge-sm flex h-12 items-center justify-center gap-2 rounded-xl border-2 text-[14px] font-extrabold",
                on ? `${STATUS[s].soft} ${STATUS[s].text} border-current` : "border-line bg-paper text-mute hover:bg-snow"
              )}
            >
              <StatusFace status={s} on={on} size={20} />
              {STATUS[s].short}
              <span className="tabular-nums opacity-70">{count(s)}</span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={tab} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.18 }} className="grid gap-2 sm:grid-cols-2">
          {list.length === 0 && (
            <p className="col-span-full rounded-2xl border-2 border-dashed border-line px-4 py-8 text-center text-[15px] font-extrabold text-faint">
              {tab === "going" ? "Nobody yet. Be the first!" : tab === "maybe" ? "No maybes. Decisive bunch." : "Nobody's bailed. Love that."}
            </p>
          )}
          {list.map((g, i) => (
            <motion.button
              key={g.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...bouncy, delay: Math.min(i * 0.03, 0.3) }}
              onClick={() => editGuest(g.id)}
              className={clsx(
                "ledge-sm flex items-center gap-3 rounded-2xl border-2 bg-paper p-3 text-left hover:bg-snow",
                me?.id === g.id ? "border-sky [--ledge:var(--color-sky)]" : "border-line"
              )}
            >
              <Avatar name={g.name} id={g.id} size={42} className={tab === "cant" ? "opacity-50 grayscale" : ""} />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 truncate text-[16px] font-extrabold text-ink">
                  <span className="truncate">{g.name}</span>
                  {g.plusOnes > 0 && <span className="shrink-0 rounded-md bg-sky-soft px-1.5 text-[12px] font-black text-sky-dark">+{g.plusOnes}</span>}
                  {me?.id === g.id && <span className="shrink-0 text-[12px] font-black uppercase text-sky">you</span>}
                </p>
                {tab !== "cant" && (
                  <p className="truncate text-[13px] font-bold text-mute">
                    {g.claims.length ? g.claims.map((c) => claimLabel(c, state.items)).join(", ") : <span className="text-faint">Hasn't picked yet</span>}
                  </p>
                )}
              </div>
              <ChevronRight className="size-5 shrink-0 text-faint" strokeWidth={3} />
            </motion.button>
          ))}
        </motion.div>
      </AnimatePresence>

      <AddFriend open={adding} onClose={() => setAdding(false)} />
    </section>
  );
}

function AddFriend({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { api } = useApp();
  const toast = useToast();
  const [name, setName] = useState("");
  const [status, setStatus] = useState<Status>("going");
  const [busy, setBusy] = useState(false);

  return (
    <Sheet open={open} onClose={onClose} title="Add a friend">
      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!name.trim()) return;
          setBusy(true);
          const r = await api("/api/guests", { body: { name, status } });
          setBusy(false);
          if (r.id) {
            toast(`Added ${name.trim().split(" ")[0]}`);
            setName("");
            onClose();
          }
        }}
      >
        <p className="text-[15px] font-bold text-mute">RSVPing for someone who texted you instead? Add them here.</p>
        <TextInput id="friend-name" placeholder="Their name" value={name} maxLength={40} onChange={(e) => setName(e.target.value)} />
        <StatusPicker value={status} onChange={setStatus} />
        <Btn tone="leaf" className="w-full" loading={busy} disabled={!name.trim()}>
          Add to the list
        </Btn>
      </form>
    </Sheet>
  );
}
