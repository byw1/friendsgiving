"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { State } from "@/lib/types";
import { ToastProvider, useToast } from "./ui";
import { Header } from "./Header";
import { Hero } from "./Hero";
import { Rsvp } from "./Rsvp";
import { BringList } from "./BringList";
import { Guests } from "./Guests";
import { Hosts } from "./Hosts";

type Api = <T = { state?: State; error?: string } & Record<string, unknown>>(
  path: string,
  init?: { method?: string; body?: unknown }
) => Promise<T>;

type Ctx = {
  state: State;
  api: Api;
  /** Item the visitor tapped before RSVPing; claimed automatically once they do. */
  pending: { itemId?: number; label?: string } | null;
  setPending: (p: Ctx["pending"]) => void;
  focusRsvp: () => void;
};

const AppCtx = createContext<Ctx | null>(null);
export const useApp = () => useContext(AppCtx)!;

export function App({ initial, partifulUrl }: { initial: State; partifulUrl: string }) {
  return (
    <ToastProvider>
      <Inner initial={initial} partifulUrl={partifulUrl} />
    </ToastProvider>
  );
}

function Inner({ initial, partifulUrl }: { initial: State; partifulUrl: string }) {
  const [state, setState] = useState(initial);
  const [pending, setPending] = useState<Ctx["pending"]>(null);
  const toast = useToast();
  const busy = useRef(0);

  const api: Api = useCallback(
    async (path, init) => {
      busy.current++;
      try {
        const res = await fetch(path, {
          method: init?.method ?? (init?.body ? "POST" : "GET"),
          headers: init?.body ? { "content-type": "application/json" } : undefined,
          body: init?.body ? JSON.stringify(init.body) : undefined,
        });
        const data = await res.json().catch(() => ({}));
        if (data?.state) setState(data.state);
        if (!res.ok && data?.error) toast(data.error, "err");
        return data;
      } catch {
        toast("Couldn't reach the server. Try again?", "err");
        return { error: "network" } as never;
      } finally {
        busy.current--;
      }
    },
    [toast]
  );

  // Keep everyone's view fresh without a refresh.
  useEffect(() => {
    const tick = async () => {
      if (document.hidden || busy.current > 0) return;
      try {
        const res = await fetch("/api/state", { cache: "no-store" });
        if (res.ok && busy.current === 0) setState(await res.json());
      } catch {}
    };
    const t = setInterval(tick, 12000);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(t);
      document.removeEventListener("visibilitychange", tick);
    };
  }, []);

  // Feedback after following an email link.
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const s = p.get("signin");
    if (!s) return;
    if (s === "ok") toast("You're signed in");
    if (s === "expired") toast("That link expired. Grab a fresh one.", "err");
    window.history.replaceState(null, "", window.location.pathname);
  }, [toast]);

  const focusRsvp = useCallback(() => {
    document.getElementById("rsvp")?.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => document.querySelector<HTMLInputElement>("#rsvp input")?.focus({ preventScroll: true }), 500);
  }, []);

  return (
    <AppCtx.Provider value={{ state, api, pending, setPending, focusRsvp }}>
      <div className="grain relative">
        <Backdrop />
        <Header />
        <main className="relative mx-auto max-w-[1080px] px-4 pb-28 sm:px-6">
          <Hero partifulUrl={partifulUrl} />
          <div className="grid grid-cols-[minmax(0,1fr)] gap-y-20 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start lg:gap-x-12">
            {/* On phones everything stacks: RSVP, list, guests, hosts. On desktop the RSVP card rides along on the right. */}
            <div className="contents lg:block lg:space-y-20">
              <div className="order-2 min-w-0"><BringList /></div>
              <div className="order-3 min-w-0"><Guests /></div>
            </div>
            <div className="contents lg:sticky lg:top-24 lg:block lg:space-y-16">
              <div className="order-1 min-w-0"><Rsvp /></div>
              <div className="order-4 min-w-0"><Hosts /></div>
            </div>
          </div>
        </main>
        <footer className="relative border-t border-line py-10 text-center text-[13px] text-faint">
          Made with love (and a lot of carbs) by William & Marco
        </footer>
      </div>
    </AppCtx.Provider>
  );
}

function Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[900px] overflow-hidden">
      <div className="absolute left-1/2 top-[-380px] h-[760px] w-[1100px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(234_88_12/0.30),rgb(234_88_12/0.06)_60%,transparent)] blur-2xl" />
      <div className="absolute left-[8%] top-[160px] h-[300px] w-[300px] rounded-full bg-[radial-gradient(closest-side,rgb(252_211_77/0.10),transparent)] blur-2xl" />
      <div
        className="absolute inset-0 opacity-[0.35] [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_70%)]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgb(255 255 255 / 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgb(255 255 255 / 0.05) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />
    </div>
  );
}
