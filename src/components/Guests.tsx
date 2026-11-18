"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import clsx from "clsx";
import type { Status } from "@/lib/types";
import { useApp } from "./App";
import { Avatar, Reveal, SectionTitle, spring } from "./ui";

const TABS: { key: Status; label: string }[] = [
  { key: "going", label: "Going" },
  { key: "maybe", label: "Maybe" },
  { key: "cant", label: "Can’t go" },
];

export function Guests() {
  const { state } = useApp();
  const [tab, setTab] = useState<Status>("going");
  const list = state.guests.filter((g) => g.status === tab);
  const count = (s: Status) => state.guests.filter((g) => g.status === s).length;

  return (
    <section id="guests" className="scroll-mt-24">
      <Reveal>
        <SectionTitle eyebrow="Guest list" title="Who’s coming" />
        <div className="mb-4 flex gap-1 rounded-2xl border border-line bg-white/[0.02] p-1">
          {TABS.map((t) => {
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={clsx(
                  "relative flex h-10 flex-1 items-center justify-center gap-2 rounded-xl text-sm font-medium transition-colors",
                  active ? "text-ink" : "text-mute hover:text-ink"
                )}
              >
                {active && <motion.span layoutId="guest-tab" transition={spring} className="absolute inset-0 rounded-xl bg-white/[0.08]" />}
                <span className="relative">{t.label}</span>
                <span className={clsx("relative rounded-md px-1.5 text-[12px] tabular-nums", active ? "bg-ember/20 text-ember" : "bg-white/[0.05] text-faint")}>
                  {count(t.key)}
                </span>
              </button>
            );
          })}
        </div>

        <div className="min-h-[120px]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.ul
              key={tab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="grid gap-2 sm:grid-cols-2"
            >
              {list.length === 0 && (
                <li className="col-span-full rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-faint">
                  {tab === "going" ? "Nobody yet. Be the first." : tab === "maybe" ? "No maybes." : "Nobody’s bailed. Love that."}
                </li>
              )}
              {list.map((g, i) => (
                <motion.li
                  key={g.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.035, 0.4), duration: 0.35 }}
                  className={clsx(
                    "flex items-start gap-3 rounded-2xl border border-line bg-white/[0.025] p-3.5",
                    state.me?.id === g.id && "border-ember/30 bg-ember/[0.06]"
                  )}
                >
                  <Avatar name={g.name} id={g.id} size={38} className={clsx(tab === "cant" && "opacity-50 grayscale")} />
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1.5 truncate text-[15px] font-medium">
                      {g.name}
                      {g.plusOnes > 0 && <span className="rounded-md bg-white/[0.06] px-1.5 text-[12px] font-medium text-mute">+{g.plusOnes}</span>}
                      {state.me?.id === g.id && <span className="text-[12px] font-medium text-ember">you</span>}
                    </p>
                    {tab !== "cant" && (
                      <p className="mt-0.5 line-clamp-2 text-[13px] text-mute">
                        {g.bringing.length ? g.bringing.join(", ") : <span className="text-faint">Hasn’t picked yet</span>}
                      </p>
                    )}
                  </div>
                </motion.li>
              ))}
            </motion.ul>
          </AnimatePresence>
        </div>
      </Reveal>
    </section>
  );
}
