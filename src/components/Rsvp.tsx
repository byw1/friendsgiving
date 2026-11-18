"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { X } from "lucide-react";
import type { Status } from "@/lib/types";
import { useApp } from "./App";
import { Avatar, Btn, Card, STATUS, Stepper, StatusPicker, TextInput, bouncy, firstName, useToast } from "./ui";
import { claimLabel } from "./BringList";

const HEADLINE: Record<Status, (n: string) => string> = {
  going: (n) => `You're in, ${n}!`,
  maybe: (n) => `Fingers crossed, ${n}`,
  cant: (n) => `We'll miss you, ${n}`,
};

export function Rsvp() {
  const { me } = useApp();
  return (
    <section id="rsvp" className="scroll-mt-20">
      <AnimatePresence mode="wait" initial={false}>
        {me ? (
          <motion.div key="me" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={bouncy}>
            <MyCard />
          </motion.div>
        ) : (
          <motion.div key="form" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={bouncy}>
            <RsvpForm />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function RsvpForm() {
  const { api, setMeId, celebrate, asSomeone } = useApp();
  const toast = useToast();
  const [name, setName] = useState("");
  const [status, setStatus] = useState<Status | null>(null);
  const [plusOnes, setPlusOnes] = useState(0);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !status) return;
    setBusy(true);
    const r = await api("/api/guests", { body: { name, status, plusOnes } });
    setBusy(false);
    if (!r.id) return;
    setMeId(r.id);
    celebrate(status === "cant" ? "sad" : "happy");
    toast(
      r.existed
        ? "Welcome back! Updated your RSVP."
        : status === "going"
          ? "You're on the list!"
          : status === "maybe"
            ? "Got it. Hope you can make it!"
            : "Thanks for letting us know"
    );
  };

  return (
    <Card className="p-5">
      <h2 className="text-[24px] font-black leading-tight">Are you coming?</h2>
      <p className="mb-5 mt-1 text-[15px] font-semibold text-mute">No sign-up. Just your name.</p>
      <form onSubmit={submit} className="space-y-4">
        <TextInput id="rsvp-name" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} maxLength={40} autoComplete="name" />
        <StatusPicker value={status} onChange={setStatus} />
        <AnimatePresence initial={false}>
          {status && status !== "cant" && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="flex items-center justify-between rounded-2xl bg-snow px-4 py-3">
                <span className="text-[15px] font-extrabold">Bringing anyone?</span>
                <Stepper value={plusOnes} onChange={setPlusOnes} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <Btn tone="leaf" className="w-full" loading={busy} disabled={!name.trim() || !status}>
          {status === "cant" ? "Send my regrets" : "Count me in"}
        </Btn>
      </form>
      <button
        type="button"
        onClick={() => asSomeone({ title: "Who are you?", run: () => toast("Hey, welcome back!", "info") })}
        className="mt-4 w-full text-center text-[14px] font-extrabold uppercase tracking-wide text-sky"
      >
        Already on the list?
      </button>
    </Card>
  );
}

function MyCard() {
  const { me, api, setMeId, celebrate, editGuest, state } = useApp();
  const toast = useToast();
  if (!me) return null;
  const first = firstName(me.name);

  const update = async (patch: { status?: Status; plusOnes?: number }) => {
    const r = await api(`/api/guests/${me.id}`, { method: "PATCH", body: patch });
    if (r.state && patch.status) {
      celebrate(patch.status === "cant" ? "sad" : patch.status === "going" ? "happy" : "idle");
      toast(patch.status === "going" ? "Yay, you're in!" : patch.status === "maybe" ? "Marked as maybe" : "Got it. We'll miss you!");
    }
  };

  return (
    <Card className={`overflow-hidden ${STATUS[me.status].text} border-current`}>
      <div className={`flex items-center gap-3 px-5 pb-4 pt-5 ${STATUS[me.status].soft}`}>
        <Avatar name={me.name} id={me.id} size={48} />
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-[22px] font-black leading-tight">{HEADLINE[me.status](first)}</h2>
          <button onClick={() => setMeId(null)} className="text-[13px] font-extrabold opacity-70 hover:opacity-100">
            Not {first}?
          </button>
        </div>
      </div>
      <div className="space-y-4 p-5 text-ink">
        <StatusPicker value={me.status} onChange={(s) => update({ status: s })} />
        {me.status !== "cant" && (
          <div className="flex items-center justify-between rounded-2xl bg-snow px-4 py-3">
            <span className="text-[15px] font-extrabold">Plus-ones</span>
            <Stepper value={me.plusOnes} onChange={(n) => update({ plusOnes: n })} />
          </div>
        )}
        <div>
          <p className="mb-2 text-[13px] font-extrabold uppercase tracking-wider text-faint">You're bringing</p>
          {me.claims.length === 0 ? (
            <button
              onClick={() => document.getElementById("list")?.scrollIntoView({ behavior: "smooth" })}
              className="w-full rounded-2xl border-2 border-dashed border-line px-4 py-4 text-[15px] font-extrabold text-mute transition hover:border-pumpkin hover:text-pumpkin"
            >
              Nothing yet. Pick something!
            </button>
          ) : (
            <motion.div layout className="flex flex-wrap gap-2">
              <AnimatePresence initial={false}>
                {me.claims.map((c) => (
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
            </motion.div>
          )}
        </div>
        <Btn tone="white" size="md" className="w-full" onClick={() => editGuest(me.id)}>
          Edit my details
        </Btn>
      </div>
    </Card>
  );
}
