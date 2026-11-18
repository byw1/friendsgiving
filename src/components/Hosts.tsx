"use client";

import { ChefHat } from "lucide-react";
import { HOSTS } from "@/lib/event";
import { Avatar, Heading } from "./ui";

export function Hosts() {
  return (
    <section id="hosts">
      <Heading sub="What we're handling">Your hosts</Heading>
      <div className="grid gap-2.5">
        {HOSTS.map((h, i) => (
          <div key={h.name} className="flex items-center gap-3 rounded-2xl border-2 border-line p-3.5">
            <Avatar name={h.name} id={i === 0 ? 1 : 3} size={46} />
            <div className="min-w-0 flex-1">
              <p className="text-[17px] font-black text-ink">{h.name}</p>
              {h.plan ? (
                <p className="text-[14px] font-bold text-mute">{h.plan}</p>
              ) : (
                <p className="flex items-center gap-1.5 text-[14px] font-bold text-faint">
                  <ChefHat className="size-4" strokeWidth={2.75} /> Cooking up a plan. Stay tuned.
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
