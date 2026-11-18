"use client";

import { motion } from "motion/react";
import clsx from "clsx";
import { ChevronRight } from "lucide-react";
import { useApp } from "./App";
import { Avatar, HostBadge, Heading, bouncy, isHost } from "./ui";
import { claimLabel } from "./BringList";

/** Everyone who's put their name on something, and what they've got. Tap anyone to fix their stuff. */
export function People() {
  const { state, me, editGuest } = useApp();
  // Hosts first, always on the list (even before they've picked anything).
  const people = state.guests
    .filter((g) => g.status !== "cant" && (g.claims.length > 0 || isHost(g.name)))
    .sort((a, b) => Number(isHost(b.name)) - Number(isHost(a.name)));

  return (
    <section id="people" className="scroll-mt-20">
      <Heading sub="Tap anyone to change what they're bringing.">Who's bringing what</Heading>
      {people.length === 0 ? (
        <p className="rounded-2xl border-2 border-dashed border-line px-4 py-8 text-center text-[15px] font-extrabold text-faint">
          Nobody's picked anything yet. Be the first!
        </p>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          {people.map((g, i) => {
            const host = isHost(g.name);
            return (
            <motion.button
              key={g.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...bouncy, delay: Math.min(i * 0.03, 0.3) }}
              onClick={() => editGuest(g.id)}
              className={clsx(
                "ledge-sm flex items-center gap-3 rounded-2xl border-2 p-3 text-left",
                host
                  ? "host-card mt-2 border-corn bg-corn-soft [--ledge:var(--color-corn-dark)] sm:col-span-2"
                  : me?.id === g.id
                    ? "border-pumpkin bg-paper hover:bg-snow [--ledge:var(--color-pumpkin)]"
                    : "border-line bg-paper hover:bg-snow"
              )}
            >
              <Avatar name={g.name} id={g.id} size={42} />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 truncate text-[16px] font-extrabold text-ink">
                  <span className={clsx("truncate", host && "host-text text-[18px] font-black")}>{g.name}</span>
                  {host && <HostBadge />}
                  {me?.id === g.id && <span className="shrink-0 text-[12px] font-black uppercase text-pumpkin">you</span>}
                </p>
                <p className={clsx("truncate text-[13px] font-bold", host ? "text-ink" : "text-mute")}>
                  {g.claims.length ? g.claims.map((c) => claimLabel(c, state.items)).join(", ") : "Hosting! Plans coming soon."}
                </p>
              </div>
              <ChevronRight className="size-5 shrink-0 text-faint" strokeWidth={3} />
            </motion.button>
            );
          })}
        </div>
      )}
    </section>
  );
}
