"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { ArrowUpRight, CalendarDays, Clock, MapPin } from "lucide-react";
import { EVENT } from "@/lib/event";
import { useApp } from "./App";
import { Avatar, Button } from "./ui";

const ease = [0.22, 1, 0.36, 1] as const;

export function Hero({ partifulUrl }: { partifulUrl: string }) {
  const { state, focusRsvp } = useApp();
  const going = state.guests.filter((g) => g.status === "going");
  const headcount = going.reduce((n, g) => n + 1 + g.plusOnes, 0);
  const me = state.me;

  return (
    <section className="relative pb-20 pt-12 sm:pb-24 sm:pt-20">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease }}
        className="mb-7 inline-flex items-center gap-2 rounded-full border border-line bg-white/[0.03] py-1.5 pl-2 pr-3.5 text-[13px] text-mute backdrop-blur"
      >
        <span className="relative flex size-2">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-ember opacity-60" />
          <span className="relative inline-flex size-2 rounded-full bg-ember" />
        </span>
        RSVPs open
      </motion.div>

      <h1 className="font-serif text-[64px] leading-[0.92] tracking-[-0.02em] min-[400px]:text-[76px] sm:text-[120px]">
        {["Friends", "giving"].map((w, i) => (
          <motion.span
            key={w}
            initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.9, delay: 0.1 + i * 0.12, ease }}
            className={i === 1 ? "text-shimmer italic" : "inline-block"}
            style={{ display: "inline-block" }}
          >
            {w}
          </motion.span>
        ))}
      </h1>

      <motion.p
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.35, ease }}
        className="mt-6 max-w-[520px] text-[17px] leading-relaxed text-mute sm:text-lg"
      >
        A big table, too much food, and everyone we like. Hosted by William & Marco. Grab something off the list below so
        we don’t end up with nine pies and no forks.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.45, ease }}
        className="mt-8 grid max-w-[640px] grid-cols-2 gap-2 sm:grid-cols-[1fr_1fr_1.4fr]"
      >
        <Detail icon={<CalendarDays className="size-4" />} label="Date" value={EVENT.dateLabel.replace("Saturday, ", "Sat, ")} />
        <Detail icon={<Clock className="size-4" />} label="Time" value={EVENT.timeLabel} />
        <Detail className="col-span-2 sm:col-span-1" icon={<MapPin className="size-4" />} label="Where" value={EVENT.place} sub={EVENT.placeDetail} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.55, ease }}
        className="mt-8 flex flex-wrap items-center gap-3"
      >
        <Button onClick={focusRsvp} className="min-w-[150px]">
          {me ? "Update my RSVP" : "RSVP"}
        </Button>
        {partifulUrl && (
          <a
            href={partifulUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-12 items-center gap-1.5 rounded-2xl border border-line bg-white/[0.03] px-5 text-[15px] font-semibold text-ink transition hover:bg-white/[0.07]"
          >
            Partiful <ArrowUpRight className="size-4 text-mute" />
          </a>
        )}
        <Countdown />
      </motion.div>

      <AnimatePresence>
        {going.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7, ease }}
            className="mt-10 flex items-center gap-3"
          >
            <div className="flex -space-x-2">
              {going.slice(0, 6).map((g, i) => (
                <motion.span
                  key={g.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + i * 0.05 }}
                >
                  <Avatar name={g.name} id={g.id} size={32} />
                </motion.span>
              ))}
            </div>
            <p className="text-sm text-mute">
              <span className="font-semibold text-ink">{headcount}</span> {headcount === 1 ? "person" : "people"} coming
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function Detail({ icon, label, value, sub, className }: { icon: React.ReactNode; label: string; value: string; sub?: string; className?: string }) {
  return (
    <div className={`${className ?? ""} rounded-2xl border border-line bg-white/[0.025] px-4 py-3 backdrop-blur`}>
      <div className="mb-1 flex items-center gap-1.5 text-[12px] font-medium uppercase tracking-[0.12em] text-faint">
        {icon}
        {label}
      </div>
      <p className="text-[15px] font-medium text-ink">{value}</p>
      {sub && <p className="text-[13px] text-mute">{sub}</p>}
    </div>
  );
}

function Countdown() {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  if (now === null) return <div className="h-12 w-[150px]" />;

  const diff = new Date(EVENT.startsAt).getTime() - now;
  if (diff <= 0) {
    const over = diff < -6 * 3600 * 1000;
    return <span className="px-2 text-sm font-medium text-ember">{over ? "Thanks for coming" : "It’s happening now"}</span>;
  }
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff / 3600000) % 24);
  const m = Math.floor((diff / 60000) % 60);
  const s = Math.floor((diff / 1000) % 60);
  const parts = d > 0 ? [[d, "d"], [h, "h"], [m, "m"]] : [[h, "h"], [m, "m"], [s, "s"]];

  return (
    <div className="flex h-12 items-center gap-1 px-1 text-sm tabular-nums text-mute" aria-label="Countdown">
      {parts.map(([v, u]) => (
        <span key={u as string} className="flex items-baseline">
          <span className="relative inline-flex h-5 min-w-[1.3ch] justify-end overflow-hidden font-semibold text-ink">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={v as number}
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "-100%", opacity: 0 }}
                transition={{ duration: 0.35, ease }}
              >
                {String(v).padStart(2, "0")}
              </motion.span>
            </AnimatePresence>
          </span>
          <span className="ml-0.5 mr-1.5 text-faint">{u as string}</span>
        </span>
      ))}
    </div>
  );
}
