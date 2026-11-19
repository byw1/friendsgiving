"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, X } from "lucide-react";
import { useApp } from "./App";
import { Avatar, Btn, Card, bouncy, firstName } from "./ui";
import { claimLabel } from "./BringList";

/** Your corner: what you've signed up to bring. Shows up once you've put your name on something. */
export function MyStuff({ partifulUrl }: { partifulUrl: string }) {
  const { me, api, setMeId, editGuest, state } = useApp();

  return (
    <section id="mine" className="scroll-mt-20">
      <AnimatePresence mode="wait" initial={false}>
        {me ? (
          <motion.div key="me" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={bouncy}>
            <Card className="overflow-hidden border-pumpkin">
              <div className="flex items-center gap-3 bg-pumpkin-soft px-5 pb-4 pt-5">
                <Avatar name={me.name} id={me.id} size={48} />
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-[22px] font-black leading-tight text-pumpkin-dark">Hey {firstName(me.name)}!</h2>
                  <button onClick={() => setMeId(null)} className="text-[13px] font-extrabold text-pumpkin-dark/70 hover:text-pumpkin-dark">
                    Not {firstName(me.name)}?
                  </button>
                </div>
              </div>
              <div className="space-y-4 p-5">
                <p className="text-[13px] font-extrabold uppercase tracking-wider text-faint">You're bringing</p>
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
                <Btn tone="white" size="md" className="w-full" onClick={() => editGuest(me.id)}>
                  Add a note or edit
                </Btn>
              </div>
            </Card>
          </motion.div>
        ) : (
          <motion.div key="hi" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={bouncy}>
            <Card className="border-sky bg-sky-soft p-5">
              <h2 className="text-[20px] font-black leading-tight text-sky-dark">How this works</h2>
              <ol className="mt-3 space-y-2.5 text-[15px] font-bold text-ink">
                <Step n={1}>RSVP on Partiful like normal.</Step>
                <Step n={2}>Hit + on something below and add your name.</Step>
                <Step n={3}>Changed your mind? Tap it again. No big deal.</Step>
              </ol>
              {partifulUrl && (
                <a
                  href={partifulUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="ledge mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-sky px-4 text-[13px] font-extrabold uppercase tracking-wide text-white [--ledge:var(--color-sky-dark)]"
                >
                  RSVP on Partiful <ArrowUpRight className="size-4" strokeWidth={3} />
                </a>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="grid size-6 shrink-0 place-items-center rounded-full bg-sky text-[13px] font-black text-white">{n}</span>
      <span className="pt-0.5">{children}</span>
    </li>
  );
}
