"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useEffect, useState } from "react";
import clsx from "clsx";
import { LogOut, MailCheck, X } from "lucide-react";
import { useApp } from "./App";
import { Avatar, Button, Field, spring, useToast } from "./ui";

export function Header() {
  const { state, api } = useApp();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const [signin, setSignin] = useState(false);
  const toast = useToast();
  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 12));

  useEffect(() => {
    const open = () => setSignin(true);
    window.addEventListener("fg:signin", open);
    return () => window.removeEventListener("fg:signin", open);
  }, []);

  return (
    <>
      <header
        className={clsx(
          "sticky top-0 z-40 transition-[background,border-color,backdrop-filter] duration-300",
          scrolled ? "border-b border-line bg-bg/70 backdrop-blur-xl" : "border-b border-transparent"
        )}
      >
        <div className="mx-auto flex h-16 max-w-[1080px] items-center justify-between px-4 sm:px-6">
          <a href="#" className="flex items-center gap-2.5">
            <Mark />
            <span className="text-[15px] font-semibold tracking-tight">Friendsgiving</span>
            <span className="rounded-full border border-line px-1.5 py-0.5 text-[11px] font-medium text-mute">’26</span>
          </a>

          {state.me ? (
            <div className="relative">
              <button
                onClick={() => setMenu((m) => !m)}
                className="flex items-center gap-2 rounded-full border border-line bg-white/[0.03] py-1 pl-1 pr-3 text-sm font-medium transition hover:bg-white/[0.07]"
              >
                <Avatar name={state.me.name} id={state.me.id} size={28} className="ring-0" />
                <span className="max-w-[110px] truncate">{state.me.name.split(" ")[0]}</span>
              </button>
              <AnimatePresence>
                {menu && (
                  <>
                    <div className="fixed inset-0 z-0" onClick={() => setMenu(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.97 }}
                      transition={{ duration: 0.16 }}
                      className="absolute right-0 top-12 z-10 w-60 origin-top-right rounded-2xl border border-line bg-stone-900/95 p-1.5 shadow-2xl backdrop-blur-xl"
                    >
                      <div className="px-3 py-2.5">
                        <p className="truncate text-sm font-medium">{state.me.name}</p>
                        <p className="truncate text-[13px] text-mute">{state.me.email}</p>
                      </div>
                      <button
                        onClick={async () => {
                          setMenu(false);
                          await api("/api/auth/logout", { method: "POST" });
                          const res = await fetch("/api/state");
                          if (res.ok) window.location.reload();
                          toast("Signed out");
                        }}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-mute transition hover:bg-white/[0.06] hover:text-ink"
                      >
                        <LogOut className="size-4" /> Sign out
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button
              onClick={() => setSignin(true)}
              className="rounded-full border border-line bg-white/[0.03] px-4 py-2 text-sm font-medium text-ink transition hover:bg-white/[0.07]"
            >
              Sign in
            </button>
          )}
        </div>
      </header>
      <SignInSheet open={signin} onClose={() => setSignin(false)} />
    </>
  );
}

function Mark() {
  return (
    <span className="relative grid size-8 place-items-center rounded-[10px] bg-gradient-to-b from-[#fdba74] to-ember-deep shadow-[0_4px_18px_-4px_rgb(234_88_12/0.8),inset_0_1px_0_rgb(255_255_255/0.45)]">
      <svg viewBox="0 0 24 24" className="size-[18px] text-stone-950" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 21c-4.5 0-7-3-7-6.5C5 10 9 7.5 12 3c3 4.5 7 7 7 11.5S16.5 21 12 21Z" />
        <path d="M12 21v-7" />
      </svg>
    </span>
  );
}

export function openSignIn() {
  window.dispatchEvent(new Event("fg:signin"));
}

function SignInSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { api, focusRsvp } = useApp();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [unknown, setUnknown] = useState(false);

  useEffect(() => {
    if (open) {
      setSent(false);
      setUnknown(false);
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const r = await api<{ ok?: boolean; unknown?: boolean }>("/api/auth/login", { body: { email } });
    setLoading(false);
    if (r.unknown) setUnknown(true);
    else if (r.ok) setSent(true);
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal
            initial={{ y: "100%", opacity: 0.6 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 36 }}
            className="ring-glow relative w-full max-w-md rounded-t-[28px] bg-stone-900 px-6 pb-[max(28px,env(safe-area-inset-bottom))] pt-6 sm:rounded-[28px]"
          >
            <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-white/15 sm:hidden" />
            <button onClick={onClose} aria-label="Close" className="absolute right-4 top-4 rounded-full p-2 text-mute transition hover:bg-white/5 hover:text-ink">
              <X className="size-5" />
            </button>
            <AnimatePresence mode="wait" initial={false}>
              {sent ? (
                <motion.div key="sent" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="py-4 text-center">
                  <motion.div
                    initial={{ scale: 0.5, rotate: -12 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={spring}
                    className="mx-auto mb-5 grid size-14 place-items-center rounded-2xl bg-ember/15 text-ember"
                  >
                    <MailCheck className="size-7" />
                  </motion.div>
                  <h3 className="font-serif text-3xl">Check your email</h3>
                  <p className="mx-auto mt-2 max-w-[280px] text-[15px] text-mute">
                    We sent a sign-in link to <span className="text-ink">{email}</span>. Tap it on this device.
                  </p>
                </motion.div>
              ) : (
                <motion.form key="form" onSubmit={submit} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <h3 className="font-serif text-3xl">Welcome back</h3>
                  <p className="mb-6 mt-1.5 text-[15px] text-mute">Use the email you RSVP’d with. We’ll send you a link, no password.</p>
                  <Field label="Email" type="email" required autoFocus autoComplete="email" inputMode="email" placeholder="you@email.com" value={email} onChange={(e) => { setEmail(e.target.value); setUnknown(false); }} />
                  <AnimatePresence>
                    {unknown && (
                      <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden pt-3 text-sm text-mute">
                        No RSVP with that email yet.{" "}
                        <button type="button" className="font-medium text-ember underline-offset-4 hover:underline" onClick={() => { onClose(); focusRsvp(); }}>
                          RSVP instead
                        </button>
                      </motion.p>
                    )}
                  </AnimatePresence>
                  <Button loading={loading} className="mt-5 w-full">Email me a link</Button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
