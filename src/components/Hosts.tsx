"use client";

import { motion } from "motion/react";
import { HOSTS } from "@/lib/event";
import { Avatar, Reveal, SectionTitle } from "./ui";

export function Hosts() {
  return (
    <section id="hosts" className="scroll-mt-24">
      <Reveal>
        <SectionTitle eyebrow="Your hosts" title="From the hosts" />
        <div className="space-y-2">
          {HOSTS.map((h, i) => (
            <motion.div
              key={h.name}
              whileHover={{ y: -2 }}
              className="flex items-start gap-3.5 rounded-2xl border border-line bg-white/[0.025] p-4"
            >
              <Avatar name={h.name} id={i + 2} size={42} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[15px] font-semibold">{h.name}</p>
                  <span className="text-[12px] font-medium uppercase tracking-[0.12em] text-faint">{h.role}</span>
                </div>
                {h.plan ? (
                  <p className="mt-1 text-sm text-mute">{h.plan}</p>
                ) : (
                  <div className="mt-2 space-y-1.5">
                    <p className="text-[13px] text-faint">Menu’s being figured out</p>
                    <div className="skeleton h-2 w-4/5 rounded-full" />
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
