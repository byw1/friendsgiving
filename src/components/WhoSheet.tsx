"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useApp } from "./App";
import { Avatar, Btn, Sheet, TextInput, bouncy } from "./ui";

export type WhoRequest = { title: string; run: (guestId: number) => void | Promise<void> };

/** "Who are you?" Pick yourself from the list or add your name. No passwords, no emails. */
export function WhoSheet({ request, onClose }: { request: WhoRequest | null; onClose: () => void }) {
  const { state, api, setMeId, celebrate } = useApp();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (request) setName("");
  }, [request]);

  const pick = async (id: number) => {
    setMeId(id);
    onClose();
    await request?.run(id);
  };

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    const r = await api("/api/guests", { body: { name, status: "going" } });
    setBusy(false);
    if (r.id) {
      if (!r.existed) celebrate("happy");
      await pick(r.id);
    }
  };

  const people = state.guests.filter((g) => g.status !== "cant");

  return (
    <Sheet open={!!request} onClose={onClose} title={request?.title ?? "Who are you?"}>
      {people.length > 0 && (
        <>
          <p className="mb-3 text-[15px] font-bold text-mute">Tap your name</p>
          <div className="mb-6 flex flex-wrap gap-2">
            {people.map((g, i) => (
              <motion.button
                key={g.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ ...bouncy, delay: Math.min(i * 0.025, 0.3) }}
                onClick={() => pick(g.id)}
                className="ledge flex items-center gap-2 rounded-2xl border-2 border-line bg-paper py-1.5 pl-1.5 pr-3.5 text-[15px] font-extrabold text-ink hover:bg-snow"
              >
                <Avatar name={g.name} id={g.id} size={30} />
                {g.name}
              </motion.button>
            ))}
          </div>
        </>
      )}
      <form onSubmit={add} className="space-y-3">
        <p className="text-[15px] font-bold text-mute">{people.length ? "Not on the list yet?" : "What's your name?"}</p>
        <TextInput id="who-name" autoFocus={!people.length} placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} maxLength={40} autoComplete="name" />
        <Btn tone="leaf" className="w-full" loading={busy} disabled={!name.trim()}>
          Add me &amp; continue
        </Btn>
      </form>
    </Sheet>
  );
}
