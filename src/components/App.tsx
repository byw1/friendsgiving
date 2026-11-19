"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { Guest, State } from "@/lib/types";
import { ArrowUpRight } from "lucide-react";
import { Avatar, ConfettiBurst, ToastProvider, firstName, useToast } from "./ui";
import type { Mood } from "./Turkey";
import { Hero } from "./Hero";
import { MyStuff } from "./MyStuff";
import { BringList } from "./BringList";
import { People } from "./People";
import { GuestSheet } from "./GuestSheet";
import { WhoSheet, type WhoRequest } from "./WhoSheet";

type ApiResult = { state?: State; error?: string; id?: number; existed?: boolean };
type Api = (path: string, init?: { method?: string; body?: unknown }) => Promise<ApiResult>;

type Ctx = {
  state: State;
  api: Api;
  me: Guest | null;
  setMeId: (id: number | null) => void;
  /** Run something "as" a guest, asking who you are first if we don't know. */
  asSomeone: (req: WhoRequest) => void;
  editGuest: (id: number) => void;
  celebrate: (mood: Mood) => void;
  mood: Mood;
};

const AppCtx = createContext<Ctx | null>(null);
export const useApp = () => useContext(AppCtx)!;

const ME_KEY = "fg_me";

export function App({ initial, partifulUrl }: { initial: State; partifulUrl: string }) {
  return (
    <ToastProvider>
      <Inner initial={initial} partifulUrl={partifulUrl} />
    </ToastProvider>
  );
}

function Inner({ initial, partifulUrl }: { initial: State; partifulUrl: string }) {
  const [state, setState] = useState(initial);
  const [meId, setMeIdState] = useState<number | null>(null);
  const [editing, setEditing] = useState<number | null>(null);
  const [who, setWho] = useState<WhoRequest | null>(null);
  const [mood, setMood] = useState<Mood>("idle");
  const [confetti, setConfetti] = useState(0);
  const toast = useToast();
  const busy = useRef(0);

  useEffect(() => {
    try {
      const v = Number(localStorage.getItem(ME_KEY));
      if (v) setMeIdState(v);
    } catch {}
  }, []);

  const setMeId = useCallback((id: number | null) => {
    setMeIdState(id);
    try {
      if (id) localStorage.setItem(ME_KEY, String(id));
      else localStorage.removeItem(ME_KEY);
    } catch {}
  }, []);

  const me = state.guests.find((g) => g.id === meId) ?? null;

  const api: Api = useCallback(
    async (path, init) => {
      busy.current++;
      try {
        const res = await fetch(path, {
          method: init?.method ?? (init?.body ? "POST" : "GET"),
          headers: init?.body ? { "content-type": "application/json" } : undefined,
          body: init?.body ? JSON.stringify(init.body) : undefined,
        });
        const data: ApiResult = await res.json().catch(() => ({}));
        if (data.state) setState(data.state);
        if (!res.ok) toast(data.error ?? "Something went sideways. Try again?", "err");
        return res.ok ? data : { ...data, error: data.error ?? "error" };
      } catch {
        toast("Can't reach the server. Try again?", "err");
        return { error: "network" };
      } finally {
        busy.current--;
      }
    },
    [toast]
  );

  // Keep everyone's view fresh.
  useEffect(() => {
    const tick = async () => {
      if (document.hidden || busy.current > 0) return;
      try {
        const res = await fetch("/api/state", { cache: "no-store" });
        if (res.ok && busy.current === 0) setState(await res.json());
      } catch {}
    };
    const t = setInterval(tick, 10000);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(t);
      document.removeEventListener("visibilitychange", tick);
    };
  }, []);

  const celebrate = useCallback((m: Mood) => {
    setMood(m);
    if (m === "happy") setConfetti((c) => c + 1);
    setTimeout(() => setMood("idle"), 1200);
  }, []);

  const asSomeone = useCallback(
    (req: WhoRequest) => {
      if (me) req.run(me.id);
      else setWho(req);
    },
    [me]
  );

  return (
    <AppCtx.Provider value={{ state, api, me, setMeId, asSomeone, editGuest: setEditing, celebrate, mood }}>
      <TopBar partifulUrl={partifulUrl} />
      <main className="mx-auto max-w-[1040px] px-4 pb-32 sm:px-6">
        <Hero partifulUrl={partifulUrl} />
        <div className="grid grid-cols-[minmax(0,1fr)] gap-14 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start lg:gap-10">
          <div className="contents lg:block lg:space-y-14">
            <div className="order-2 min-w-0"><BringList /></div>
            <div className="order-3 min-w-0"><People /></div>
          </div>
          <div className="contents lg:sticky lg:top-20 lg:block lg:space-y-10">
            <div className="order-1 min-w-0"><MyStuff partifulUrl={partifulUrl} /></div>
          </div>
        </div>
      </main>
      <footer className="border-t-2 border-line py-8 text-center text-[14px] font-bold text-faint">
        Gobble responsibly. Made by William &amp; Marko.
        {partifulUrl && (
          <>
            {" "}
            <a href={partifulUrl} target="_blank" rel="noreferrer" className="text-plum underline-offset-2 hover:underline">
              Back to Partiful
            </a>
          </>
        )}
      </footer>

      <GuestSheet id={editing} onClose={() => setEditing(null)} />
      <WhoSheet request={who} onClose={() => setWho(null)} />
      <ConfettiBurst fire={confetti} />
    </AppCtx.Provider>
  );
}

function TopBar({ partifulUrl }: { partifulUrl: string }) {
  const { me, editGuest } = useApp();
  return (
    <header className="sticky top-0 z-40 border-b-2 border-line bg-paper/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-[1040px] items-center justify-between px-4 sm:px-6">
        <a href="#" className="shrink-0 text-[19px] font-black tracking-tight text-pumpkin">
          friendsgiving
        </a>
        <div className="flex min-w-0 items-center gap-0.5">
        {partifulUrl && (
          <a
            href={partifulUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex shrink-0 items-center gap-1 rounded-xl px-2 py-2 text-[13px] font-extrabold uppercase tracking-wide text-plum transition hover:bg-snow"
          >
            Partiful <ArrowUpRight className="size-4" strokeWidth={3} />
          </a>
        )}
        {me ? (
          <button
            onClick={() => editGuest(me.id)}
            className="flex min-w-0 items-center gap-2 rounded-full p-1 text-[14px] font-extrabold text-ink transition hover:bg-snow min-[380px]:pr-3"
          >
            <Avatar name={me.name} id={me.id} size={30} />
            <span className="hidden max-w-[110px] truncate min-[380px]:inline">{firstName(me.name)}</span>
          </button>
        ) : (
          <a href="#list" className="shrink-0 rounded-xl px-2 py-2 text-[13px] font-extrabold uppercase tracking-wide text-sky transition hover:bg-sky-soft">
            The list
          </a>
        )}
        </div>
      </div>
    </header>
  );
}
