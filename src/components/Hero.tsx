"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { ArrowUpRight, CalendarDays, Clock, MapPin } from "lucide-react";
import { EVENT } from "@/lib/event";
import { useApp } from "./App";
import { Turkey } from "./Turkey";
import { Btn, bouncy, firstName } from "./ui";

const DAY = EVENT.dateLabel.split(",")[0]; // "Saturday"

const LINES = [
  `Gobble gobble! ${EVENT.title} is ${DAY}.`,
  "Bring a dish. Or cups. Cups count.",
  "Please don't let us end up with 9 pies.",
  "I'm the guest of honor. Allegedly.",
];

export function Hero({ partifulUrl }: { partifulUrl: string }) {
  const { state, me, mood } = useApp();
  const [line, setLine] = useState(0);
  const bringers = state.guests.filter((g) => g.status !== "cant" && g.claims.length > 0).length;

  const speech =
    mood === "happy"
      ? "Yesss! Thank you!"
      : mood === "sad"
        ? "Aww, okay. Someone else will grab it."
        : me && line === 0
          ? `Hey ${firstName(me.name)}! ${DAY}'s gonna be good.`
          : LINES[line];

  return (
    <section className="flex flex-col items-center pb-12 pt-8 text-center sm:pt-12">
      <div className="relative mb-2 flex flex-col items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={speech}
            initial={{ opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={bouncy}
            className="relative mb-3 max-w-[290px] rounded-2xl border-2 border-line bg-paper px-4 py-2.5 text-[15px] font-extrabold text-ink"
          >
            {speech}
            <span className="absolute -bottom-[9px] left-1/2 size-4 -translate-x-1/2 rotate-45 border-b-2 border-r-2 border-line bg-paper" />
          </motion.div>
        </AnimatePresence>
        <Turkey mood={mood} size={150} onTap={() => setLine((l) => (l + 1) % LINES.length)} />
      </div>

      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...bouncy, delay: 0.1 }}
        className="text-[44px] font-black leading-[1] tracking-tight text-ink sm:text-[64px]"
      >
        {EVENT.title}
        <span className="mt-1 block text-[24px] text-pumpkin sm:text-[32px]">at {EVENT.place}</span>
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...bouncy, delay: 0.2 }}
        className="mt-6 flex flex-wrap justify-center gap-2"
      >
        <Chip icon={<CalendarDays className="size-4" strokeWidth={2.75} />} tone="bg-sky-soft text-sky-dark">
          {EVENT.shortDateLabel}
        </Chip>
        <Chip icon={<Clock className="size-4" strokeWidth={2.75} />} tone="bg-pumpkin-soft text-pumpkin-dark">
          {EVENT.timeLabel}
        </Chip>
        <Chip icon={<MapPin className="size-4" strokeWidth={2.75} />} tone="bg-leaf-soft text-leaf-dark">
          {EVENT.place}
        </Chip>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ ...bouncy, delay: 0.3 }} className="mt-7">
        <Countdown />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...bouncy, delay: 0.4 }}
        className="mt-7 flex w-full max-w-[360px] flex-col gap-3"
      >
        <Btn
          tone="pumpkin"
          className="w-full"
          onClick={() => document.getElementById("list")?.scrollIntoView({ behavior: "smooth", block: "start" })}
        >
          Pick what to bring
        </Btn>
        {partifulUrl && (
          <a
            href={partifulUrl}
            target="_blank"
            rel="noreferrer"
            className="ledge inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl border-2 border-line bg-paper px-6 text-[15px] font-extrabold uppercase tracking-wide text-ink hover:bg-snow"
          >
            {EVENT.rsvpName} <ArrowUpRight className="size-4" strokeWidth={3} />
          </a>
        )}
      </motion.div>

      {bringers > 0 && (
        <p className="mt-5 text-[15px] font-bold text-mute">
          <span className="font-black text-leaf-dark">{bringers}</span> {bringers === 1 ? "person has" : "people have"} picked something so far
        </p>
      )}
    </section>
  );
}

function Chip({ icon, tone, children }: { icon: React.ReactNode; tone: string; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[14px] font-extrabold ${tone}`}>
      {icon}
      {children}
    </span>
  );
}

function Countdown() {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const diff = now === null ? null : new Date(EVENT.startsAt).getTime() - now;
  if (diff !== null && diff <= 0) {
    return <p className="text-[18px] font-black text-leaf-dark">{diff < -6 * 3600e3 ? "Thanks for coming!" : "It's happening right now!"}</p>;
  }
  const d = diff === null ? 0 : Math.floor(diff / 86400000);
  const h = diff === null ? 0 : Math.floor((diff / 3600000) % 24);
  const m = diff === null ? 0 : Math.floor((diff / 60000) % 60);
  const s = diff === null ? 0 : Math.floor((diff / 1000) % 60);

  return (
    <div className="flex gap-2.5" aria-label="Countdown to the party">
      {[
        [d, "days"],
        [h, "hrs"],
        [m, "min"],
        [s, "sec"],
      ].map(([v, u]) => (
        <div key={u} className="w-[68px] rounded-2xl border-2 border-line pb-2 pt-1.5 ledge">
          <div className="relative h-9 overflow-hidden text-[28px] font-black tabular-nums text-ink">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span key={String(v)} className="block" initial={{ y: 30 }} animate={{ y: 0 }} exit={{ y: -30 }} transition={bouncy}>
                {now === null ? "–" : String(v).padStart(2, "0")}
              </motion.span>
            </AnimatePresence>
          </div>
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-faint">{u}</div>
        </div>
      ))}
    </div>
  );
}
