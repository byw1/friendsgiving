"use client";

import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { useMemo, useState } from "react";
import clsx from "clsx";
import { Check, Plus, Sparkles } from "lucide-react";
import { CATEGORIES } from "@/lib/event";
import type { Claim, Item } from "@/lib/types";
import { useApp } from "./App";
import { Avatar, Button, Reveal, SectionTitle, spring, useToast } from "./ui";

type Filter = "all" | (typeof CATEGORIES)[number]["key"];

export function BringList() {
  const { state } = useApp();
  const [filter, setFilter] = useState<Filter>("all");

  const covered = state.items.filter((i) => i.claims.length >= i.need).length;
  const total = state.items.length;
  const pct = total ? covered / total : 0;

  const groups = useMemo(
    () =>
      CATEGORIES.filter((c) => filter === "all" || c.key === filter)
        .map((c) => ({ ...c, items: state.items.filter((i) => i.category === c.key) }))
        .filter((g) => g.items.length),
    [state.items, filter]
  );

  return (
    <section id="list" className="scroll-mt-24">
      <Reveal>
        <SectionTitle
          eyebrow="The list"
          title="What we need"
          right={<Progress pct={pct} label={`${covered}/${total}`} />}
        />
        <p className="-mt-2 mb-6 max-w-[520px] text-[15px] text-mute">
          Tap anything you can cover. Not seeing your thing? Add it at the bottom. Change your mind any time.
        </p>

        <LayoutGroup id="filters">
          <div className="no-scrollbar -mx-4 mb-4 flex gap-1.5 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            {([{ key: "all", label: "All" }, ...CATEGORIES] as { key: Filter; label: string }[]).map((c) => {
              const active = filter === c.key;
              return (
                <button
                  key={c.key}
                  onClick={() => setFilter(c.key)}
                  className={clsx(
                    "relative shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    active ? "text-bg" : "text-mute hover:text-ink"
                  )}
                >
                  {active && <motion.span layoutId="filter-pill" transition={spring} className="absolute inset-0 -z-0 rounded-full bg-ink" />}
                  <span className="relative">{c.label}</span>
                </button>
              );
            })}
          </div>
        </LayoutGroup>

        <motion.div layout className="overflow-hidden rounded-[24px] border border-line bg-white/[0.02]">
          <AnimatePresence mode="popLayout" initial={false}>
            {groups.map((g, gi) => (
              <motion.div
                key={g.key}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className={clsx(gi > 0 && "border-t border-line")}
              >
                {filter === "all" && (
                  <p className="px-4 pb-1 pt-4 text-[12px] font-semibold uppercase tracking-[0.14em] text-faint sm:px-5">{g.label}</p>
                )}
                <ul>
                  {g.items.map((item) => (
                    <ItemRow key={item.id} item={item} />
                  ))}
                </ul>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        <SomethingElse />
      </Reveal>
    </section>
  );
}

function Progress({ pct, label }: { pct: number; label: string }) {
  const r = 20;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative grid size-[54px] shrink-0 place-items-center">
      <svg viewBox="0 0 48 48" className="absolute inset-0 -rotate-90">
        <circle cx="24" cy="24" r={r} fill="none" stroke="rgb(255 255 255 / 0.08)" strokeWidth="3.5" />
        <motion.circle
          cx="24"
          cy="24"
          r={r}
          fill="none"
          stroke="url(#pg)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - pct) }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        />
        <defs>
          <linearGradient id="pg" x1="0" x2="1">
            <stop offset="0" stopColor="#fdba74" />
            <stop offset="1" stopColor="#ea580c" />
          </linearGradient>
        </defs>
      </svg>
      <span className="text-[12px] font-semibold tabular-nums">{label}</span>
    </div>
  );
}

function useClaim() {
  const { state, api, setPending, focusRsvp } = useApp();
  const toast = useToast();
  return async (target: { itemId?: number; label?: string }, name: string) => {
    if (!state.me) {
      setPending(target);
      focusRsvp();
      toast("RSVP real quick and we’ll lock that in");
      return false;
    }
    const r = await api("/api/claims", { body: target });
    if (r.state) {
      toast(`You’re bringing ${name.toLowerCase()}`);
      return true;
    }
    return false;
  };
}

function ItemRow({ item }: { item: Item }) {
  const { state, api, pending } = useApp();
  const claim = useClaim();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const mine = state.me ? item.claims.find((c) => c.guestId === state.me!.id) : undefined;
  const isPending = !state.me && pending?.itemId === item.id;
  const full = item.claims.length >= item.need;

  const onClick = async () => {
    setBusy(true);
    if (mine) {
      const r = await api(`/api/claims/${mine.id}`, { method: "DELETE" });
      if (r.state) toast(`Took ${item.label.toLowerCase()} off your list`);
    } else {
      await claim({ itemId: item.id }, item.label);
    }
    setBusy(false);
  };

  return (
    <motion.li layout="position" className="flex items-center gap-3 px-4 py-3.5 sm:px-5">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className={clsx("truncate text-[15px] font-medium transition-colors", full && !mine ? "text-mute" : "text-ink")}>{item.label}</p>
          <AnimatePresence>
            {full && (
              <motion.span
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={spring}
                className="grid size-[18px] shrink-0 place-items-center rounded-full bg-sage/20 text-sage"
              >
                <Check className="size-3" strokeWidth={3} />
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        <Claimers claims={item.claims} need={item.need} hint={item.hint} />
      </div>
      <motion.button
        whileTap={{ scale: 0.94 }}
        transition={spring}
        disabled={busy}
        onClick={onClick}
        className={clsx(
          "relative h-10 shrink-0 overflow-hidden rounded-xl px-3.5 text-[13px] font-semibold transition-[background,color,box-shadow] disabled:opacity-60",
          mine || isPending
            ? "bg-ember/15 text-ember ring-1 ring-ember/30"
            : full
              ? "bg-white/[0.04] text-mute hover:bg-white/[0.08] hover:text-ink"
              : "bg-ink text-bg hover:bg-white"
        )}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={mine || isPending ? "on" : full ? "full" : "off"}
            initial={{ y: 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -14, opacity: 0 }}
            transition={spring}
            className="flex items-center gap-1"
          >
            {mine || isPending ? (
              <>
                <Check className="size-3.5" strokeWidth={3} /> Yours
              </>
            ) : full ? (
              <>
                <Plus className="size-3.5" strokeWidth={2.5} /> Me too
              </>
            ) : (
              "I got it"
            )}
          </motion.span>
        </AnimatePresence>
      </motion.button>
    </motion.li>
  );
}

function Claimers({ claims, need, hint }: { claims: Claim[]; need: number; hint: string | null }) {
  if (!claims.length) {
    return (
      <p className="truncate text-[13px] text-faint">
        {hint ?? "Up for grabs"}
        {need > 1 && <span> · need {need}</span>}
      </p>
    );
  }
  const names = claims.map((c) => c.guestName.split(" ")[0]);
  const text = names.length <= 2 ? names.join(" & ") : `${names.slice(0, 2).join(", ")} +${names.length - 2}`;
  return (
    <div className="mt-1 flex items-center gap-2">
      <div className="flex -space-x-1.5">
        <AnimatePresence initial={false}>
          {claims.slice(0, 4).map((c) => (
            <motion.span key={c.id} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} transition={spring}>
              <Avatar name={c.guestName} id={c.guestId} size={20} className="ring-[1.5px]" />
            </motion.span>
          ))}
        </AnimatePresence>
      </div>
      <p className="truncate text-[13px] text-mute">
        {text}
        {need > 1 && (
          <span className="text-faint">
            {" "}
            · {Math.min(claims.length, need)}/{need}
          </span>
        )}
      </p>
    </div>
  );
}

function SomethingElse() {
  const { state, pending } = useApp();
  const claim = useClaim();
  const [label, setLabel] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = label.trim();
    if (!v) return;
    setBusy(true);
    const ok = await claim({ label: v }, v);
    setBusy(false);
    if (ok || !state.me) setLabel("");
  };

  const extras = state.extras;

  return (
    <div className="mt-4 rounded-[24px] border border-line bg-white/[0.02] p-4 sm:p-5">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="size-4 text-gold" />
        <p className="text-[15px] font-medium">Bringing something else?</p>
      </div>
      <form onSubmit={submit} className="flex gap-2">
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          maxLength={60}
          placeholder="Grandma’s lumpia, a speaker, board games…"
          className="h-12 min-w-0 flex-1 rounded-2xl border border-line bg-white/[0.03] px-4 text-[16px] text-ink outline-none transition placeholder:text-faint focus:border-ember/60 focus:ring-4 focus:ring-ember/10"
        />
        <Button loading={busy} disabled={!label.trim()} variant="soft" className="shrink-0 px-4" aria-label="Add">
          <Plus className="size-5" /> <span className="hidden sm:inline">Add</span>
        </Button>
      </form>
      {!state.me && pending?.label && (
        <p className="mt-3 text-[13px] text-mute">
          Saving <span className="text-ink">{pending.label}</span> once you RSVP.
        </p>
      )}
      <AnimatePresence initial={false}>
        {extras.length > 0 && (
          <motion.ul initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-4 flex flex-wrap gap-2">
            <AnimatePresence initial={false}>
              {extras.map((c) => (
                <motion.li
                  key={c.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={spring}
                  className="flex items-center gap-2 rounded-full border border-line bg-white/[0.03] py-1 pl-1 pr-3 text-[13px]"
                >
                  <Avatar name={c.guestName} id={c.guestId} size={22} className="ring-0" />
                  <span className="font-medium text-ink">{c.label}</span>
                  <span className="text-faint">{c.guestName.split(" ")[0]}</span>
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
