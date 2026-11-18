"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import clsx from "clsx";
import { Check, MailCheck, Minus, Plus, Trash2 } from "lucide-react";
import type { Claim, State, Status } from "@/lib/types";
import { useApp } from "./App";
import { openSignIn } from "./Header";
import { Button, Field, Reveal, Segmented, SectionTitle, spring, useToast } from "./ui";

export const STATUS_OPTIONS: { value: Status; label: string; tone: string }[] = [
  { value: "going", label: "Going", tone: "bg-gradient-to-b from-[#fdba74] to-ember" },
  { value: "maybe", label: "Maybe", tone: "bg-gold" },
  { value: "cant", label: "Can’t go", tone: "bg-stone-300" },
];

export function Rsvp() {
  const { state } = useApp();
  return (
    <section id="rsvp" className="scroll-mt-24">
      <Reveal>
        <SectionTitle eyebrow="RSVP" title={state.me ? "You’re on the list" : "Are you in?"} />
        <div className="ring-glow rounded-[28px] bg-white/[0.025] p-5 shadow-[0_30px_80px_-40px_rgb(234_88_12/0.35)] sm:p-6">
          <AnimatePresence mode="wait" initial={false}>
            {state.me ? (
              <motion.div key="me" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                <MyRsvp />
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                <RsvpForm />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Reveal>
    </section>
  );
}

function RsvpForm() {
  const { api, pending, setPending, state } = useApp();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("going");
  const [plusOnes, setPlusOnes] = useState(0);
  const [loading, setLoading] = useState(false);
  const [verify, setVerify] = useState(false);
  const toast = useToast();

  const pendingLabel = pending?.itemId ? state.items.find((i) => i.id === pending.itemId)?.label : pending?.label;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const r = await api<{ ok?: boolean; verify?: boolean; state?: State }>("/api/rsvp", {
      body: { name, email, status, plusOnes },
    });
    if (r.verify) {
      setVerify(true);
    } else if (r.ok) {
      if (pending && status !== "cant") {
        await api("/api/claims", { body: pending.itemId ? { itemId: pending.itemId } : { label: pending.label } });
      }
      setPending(null);
      toast(status === "going" ? "See you there!" : status === "maybe" ? "Got it, hope you can make it" : "We’ll miss you");
    }
    setLoading(false);
  };

  if (verify) {
    return (
      <div className="py-6 text-center">
        <div className="mx-auto mb-4 grid size-12 place-items-center rounded-2xl bg-ember/15 text-ember">
          <MailCheck className="size-6" />
        </div>
        <h3 className="font-serif text-2xl">You’ve already RSVP’d</h3>
        <p className="mx-auto mt-2 max-w-[280px] text-[15px] text-mute">
          We emailed a sign-in link to <span className="text-ink">{email}</span>. Tap it to make changes.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Segmented value={status} onChange={setStatus} options={STATUS_OPTIONS} />
      <Field label="Your name" required autoComplete="name" placeholder="First and last" value={name} onChange={(e) => setName(e.target.value)} />
      <Field
        label="Email"
        type="email"
        required
        autoComplete="email"
        inputMode="email"
        placeholder="So you can edit later"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <AnimatePresence initial={false}>
        {status !== "cant" && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <PlusOnes value={plusOnes} onChange={setPlusOnes} />
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {pendingLabel && status !== "cant" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="flex items-center justify-between rounded-2xl border border-ember/30 bg-ember/10 px-4 py-3 text-sm"
          >
            <span>
              <span className="text-mute">Bringing </span>
              <span className="font-medium text-ink">{pendingLabel}</span>
            </span>
            <button type="button" onClick={() => setPending(null)} className="text-mute transition hover:text-ink">
              Remove
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <Button loading={loading} className="w-full">
        {status === "cant" ? "Send my regrets" : "Count me in"}
      </Button>
      <p className="text-center text-[13px] text-faint">
        Already RSVP’d?{" "}
        <button type="button" onClick={openSignIn} className="font-medium text-mute underline-offset-4 transition hover:text-ink hover:underline">
          Sign in
        </button>
      </p>
    </form>
  );
}

function PlusOnes({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-line bg-white/[0.02] py-2 pl-4 pr-2">
      <div>
        <p className="text-sm font-medium">Bringing anyone?</p>
        <p className="text-[13px] text-faint">Plus-ones</p>
      </div>
      <div className="flex items-center gap-1">
        <StepBtn disabled={value <= 0} onClick={() => onChange(value - 1)} label="Fewer">
          <Minus className="size-4" />
        </StepBtn>
        <span className="relative w-8 overflow-hidden text-center text-lg font-semibold tabular-nums">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span key={value} className="inline-block" initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -12, opacity: 0 }} transition={spring}>
              {value}
            </motion.span>
          </AnimatePresence>
        </span>
        <StepBtn disabled={value >= 5} onClick={() => onChange(value + 1)} label="More">
          <Plus className="size-4" />
        </StepBtn>
      </div>
    </div>
  );
}

function StepBtn({ children, onClick, disabled, label }: { children: React.ReactNode; onClick: () => void; disabled?: boolean; label: string }) {
  return (
    <motion.button
      type="button"
      aria-label={label}
      whileTap={{ scale: 0.9 }}
      disabled={disabled}
      onClick={onClick}
      className="grid size-10 place-items-center rounded-xl bg-white/[0.05] text-ink transition hover:bg-white/[0.1] disabled:opacity-30"
    >
      {children}
    </motion.button>
  );
}

function MyRsvp() {
  const { state, api } = useApp();
  const me = state.me!;
  const toast = useToast();
  const [burst, setBurst] = useState(0);

  const save = async (patch: { status?: Status; plusOnes?: number }) => {
    const next = { name: me.name, status: me.status, plusOnes: me.plusOnes, ...patch };
    const r = await api("/api/rsvp", { body: next });
    if (r.state) {
      if (patch.status === "going") setBurst((b) => b + 1);
      if (patch.status) toast(patch.status === "cant" ? "Updated. We’ll miss you" : "RSVP updated");
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Segmented value={me.status} onChange={(s) => save({ status: s })} options={STATUS_OPTIONS} />
        <Confetti trigger={burst} />
      </div>

      <AnimatePresence initial={false}>
        {me.status !== "cant" && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <PlusOnes value={me.plusOnes} onChange={(n) => save({ plusOnes: n })} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pt-2">
        <p className="mb-2.5 text-[13px] font-medium text-mute">You’re bringing</p>
        {me.status === "cant" && me.claims.length > 0 && (
          <p className="mb-2.5 text-[13px] text-faint">Since you can’t make it, these are hidden from the list. Remove them to free them up.</p>
        )}
        <motion.ul layout className="space-y-2">
          <AnimatePresence initial={false}>
            {me.claims.map((c) => (
              <MyClaim key={c.id} claim={c} />
            ))}
          </AnimatePresence>
        </motion.ul>
        {me.claims.length === 0 && (
          <button
            onClick={() => document.getElementById("list")?.scrollIntoView({ behavior: "smooth" })}
            className="flex w-full items-center justify-center rounded-2xl border border-dashed border-white/15 px-4 py-5 text-sm text-mute transition hover:border-ember/40 hover:text-ink"
          >
            Nothing yet. Pick something from the list
          </button>
        )}
      </div>
    </div>
  );
}

function MyClaim({ claim }: { claim: Claim }) {
  const { state, api } = useApp();
  const item = claim.itemId ? state.items.find((i) => i.id === claim.itemId) : null;
  const [note, setNote] = useState(claim.note ?? "");
  const [saved, setSaved] = useState(false);
  useEffect(() => setNote(claim.note ?? ""), [claim.note]);

  const commit = async () => {
    if ((claim.note ?? "") === note.trim()) return;
    const r = await api(`/api/claims/${claim.id}`, { method: "PATCH", body: { note } });
    if (r.state) {
      setSaved(true);
      setTimeout(() => setSaved(false), 1400);
    }
  };

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 30, transition: { duration: 0.18 } }}
      transition={spring}
      className="group flex items-center gap-3 rounded-2xl border border-line bg-white/[0.03] py-2 pl-4 pr-2"
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-medium">{item?.label ?? claim.label}</p>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
          maxLength={80}
          placeholder="Add a detail (optional)"
          className="w-full bg-transparent text-[13px] text-mute outline-none placeholder:text-faint focus:text-ink"
        />
      </div>
      <AnimatePresence>
        {saved && (
          <motion.span initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="text-sage">
            <Check className="size-4" />
          </motion.span>
        )}
      </AnimatePresence>
      <motion.button
        whileTap={{ scale: 0.9 }}
        aria-label="Remove"
        onClick={() => api(`/api/claims/${claim.id}`, { method: "DELETE" })}
        className="grid size-10 shrink-0 place-items-center rounded-xl text-faint transition hover:bg-white/[0.06] hover:text-red-300"
      >
        <Trash2 className="size-4" />
      </motion.button>
    </motion.li>
  );
}

const confettiColors = ["#fb923c", "#fcd34d", "#fdba74", "#a3b18a", "#f5f0e8"];

function Confetti({ trigger }: { trigger: number }) {
  const [pieces, setPieces] = useState<{ id: number; x: number; y: number; r: number; c: string; w: number }[]>([]);
  useEffect(() => {
    if (!trigger) return;
    const ps = Array.from({ length: 22 }, (_, i) => {
      const a = (Math.PI * 2 * i) / 22 + Math.random() * 0.4;
      const d = 60 + Math.random() * 70;
      return {
        id: trigger * 100 + i,
        x: Math.cos(a) * d,
        y: Math.sin(a) * d - 30,
        r: Math.random() * 360,
        c: confettiColors[i % confettiColors.length],
        w: 4 + Math.random() * 4,
      };
    });
    setPieces(ps);
    const t = setTimeout(() => setPieces([]), 1100);
    return () => clearTimeout(t);
  }, [trigger]);

  return (
    <div className="pointer-events-none absolute left-[16%] top-1/2">
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          className={clsx("absolute block rounded-[2px]")}
          style={{ background: p.c, width: p.w, height: p.w * 1.6 }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 0.6 }}
          animate={{ x: p.x, y: [0, p.y, p.y + 50], opacity: [1, 1, 0], rotate: p.r, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}
