"use client";

import { AnimatePresence, motion } from "motion/react";
import clsx from "clsx";
import { Check, Crown, Loader2, Minus, Plus, X } from "lucide-react";
import { HOSTS } from "@/lib/event";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { Status } from "@/lib/types";

export const bouncy = { type: "spring" as const, stiffness: 500, damping: 22 };
export const soft = { type: "spring" as const, stiffness: 380, damping: 30 };

/* ---------- Buttons ---------- */

const tones = {
  pumpkin: "bg-pumpkin text-white [--ledge:var(--color-pumpkin-dark)] hover:brightness-105",
  leaf: "bg-leaf text-white [--ledge:var(--color-leaf-dark)] hover:brightness-105",
  sky: "bg-sky text-white [--ledge:var(--color-sky-dark)] hover:brightness-105",
  berry: "bg-berry text-white [--ledge:var(--color-berry-dark)] hover:brightness-105",
  white: "bg-paper text-ink border-2 border-line [--ledge:var(--color-line)] hover:bg-snow",
  ghost: "bg-transparent text-sky hover:bg-sky-soft",
};

export function Btn({
  children,
  tone = "pumpkin",
  loading,
  className,
  size = "lg",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: keyof typeof tones;
  loading?: boolean;
  size?: "lg" | "md" | "sm";
}) {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={clsx(
        "inline-flex select-none items-center justify-center gap-2 rounded-2xl font-extrabold uppercase tracking-wide disabled:cursor-not-allowed",
        tone !== "ghost" && (size === "sm" ? "ledge-sm" : "ledge"),
        size === "lg" && "h-[52px] px-6 text-[15px]",
        size === "md" && "h-11 px-4 text-[13px]",
        size === "sm" && "h-9 rounded-xl px-3 text-[12px]",
        tones[tone],
        props.disabled && !loading && "!bg-line !text-faint ![--ledge:#d6d6d6]",
        className
      )}
    >
      {loading ? <Loader2 className="size-5 animate-spin" /> : children}
    </button>
  );
}

/* ---------- Status ---------- */

export const STATUS: Record<Status, { label: string; short: string; bg: string; soft: string; text: string; ledge: string }> = {
  going: { label: "I'm in!", short: "Going", bg: "bg-leaf", soft: "bg-leaf-soft", text: "text-leaf-dark", ledge: "var(--color-leaf-dark)" },
  maybe: { label: "Maybe", short: "Maybe", bg: "bg-corn", soft: "bg-corn-soft", text: "text-corn-dark", ledge: "var(--color-corn-dark)" },
  cant: { label: "Can't make it", short: "Can't go", bg: "bg-berry", soft: "bg-berry-soft", text: "text-berry-dark", ledge: "var(--color-berry-dark)" },
};

export function StatusPicker({ value, onChange }: { value: Status | null; onChange: (s: Status) => void }) {
  return (
    <div className="grid grid-cols-3 gap-2.5" role="radiogroup" aria-label="Are you coming?">
      {(Object.keys(STATUS) as Status[]).map((s) => {
        const on = value === s;
        const meta = STATUS[s];
        return (
          <motion.button
            key={s}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(s)}
            whileTap={{ scale: 0.95 }}
            animate={on ? { scale: [1, 1.06, 1] } : { scale: 1 }}
            transition={{ duration: 0.3 }}
            style={{ ["--ledge" as string]: on ? meta.ledge : "var(--color-line)" }}
            className={clsx(
              "ledge flex h-[86px] flex-col items-center justify-center gap-1.5 rounded-2xl border-2 px-1 text-[13px] font-extrabold",
              on ? `${meta.soft} ${meta.text} border-current` : "border-line bg-paper text-mute hover:bg-snow"
            )}
          >
            <StatusFace status={s} on={on} />
            {meta.short}
          </motion.button>
        );
      })}
    </div>
  );
}

/** Tiny drawn faces so the choice reads at a glance */
export function StatusFace({ status, on = true, size = 30 }: { status: Status; on?: boolean; size?: number }) {
  const fill = on ? (status === "going" ? "#58cc02" : status === "maybe" ? "#ffc800" : "#ff4b4b") : "#e5e5e5";
  const eye = on ? "#3c3c3c" : "#afafaf";
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      <circle cx="16" cy="16" r="14" fill={fill} />
      <circle cx="11.5" cy="13.5" r="2" fill={eye} />
      <circle cx="20.5" cy="13.5" r="2" fill={eye} />
      {status === "going" && <path d="M10 18.5c1.6 3 3.6 4.2 6 4.2s4.4-1.2 6-4.2" stroke={eye} strokeWidth="2.4" fill="none" strokeLinecap="round" />}
      {status === "maybe" && <path d="M11 21h10" stroke={eye} strokeWidth="2.4" strokeLinecap="round" />}
      {status === "cant" && <path d="M10.5 22.5c1.6-2.6 3.5-3.6 5.5-3.6s3.9 1 5.5 3.6" stroke={eye} strokeWidth="2.4" fill="none" strokeLinecap="round" />}
    </svg>
  );
}

/* ---------- People ---------- */

const avatarColors = ["#ff9600", "#1cb0f6", "#58cc02", "#ce82ff", "#ff4b4b", "#ffc800", "#2b70c9", "#ff86d0"];

export function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase() || "?";
}

/** The hosts: any name made only of host first names, e.g. "William", "Marko", "William & Marko". */
const HOST_NAMES = new Set(HOSTS.map((h) => h.name.toLowerCase()));
export function isHost(name: string) {
  const words = name.toLowerCase().split(/[^a-z]+/).filter((w) => w && w !== "and");
  return words.length > 0 && words.every((w) => HOST_NAMES.has(w));
}

export function Avatar({ name, id, size = 36, className }: { name: string; id: number; size?: number; className?: string }) {
  const host = isHost(name);
  const c = host ? "linear-gradient(135deg,#ffc800,#ff9600)" : avatarColors[id % avatarColors.length];
  const face = (
    <span
      title={host ? `${name} (host)` : name}
      className={clsx("inline-flex shrink-0 select-none items-center justify-center rounded-full font-black text-white", !host && className)}
      style={{ width: size, height: size, fontSize: size * (host && initials(name).length > 1 ? 0.36 : 0.4), background: c, boxShadow: `inset 0 -${Math.max(2, size * 0.08)}px 0 rgb(0 0 0 / 0.15)` }}
    >
      {initials(name)}
    </span>
  );
  if (!host) return face;
  return (
    <span className={clsx("host-ring relative inline-flex shrink-0 rounded-full p-[2px]", className)}>
      {face}
      {size >= 28 && (
        <Crown
          className="absolute -top-[38%] left-1/2 -translate-x-1/2 -rotate-12 fill-corn text-corn-dark drop-shadow-sm"
          style={{ width: size * 0.5, height: size * 0.5 }}
          strokeWidth={2.5}
        />
      )}
    </span>
  );
}

/** Shiny little "HOST" pill. */
export function HostBadge() {
  return (
    <span className="host-shimmer inline-flex shrink-0 items-center gap-1 rounded-lg px-1.5 py-0.5 text-[11px] font-black uppercase tracking-wider text-white">
      <Crown className="size-3 fill-white" strokeWidth={3} />
      Host
    </span>
  );
}

export const firstName = (n: string) => n.trim().split(/\s+/)[0] ?? n;

/* ---------- Inputs ---------- */

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={clsx(
        "h-[52px] w-full rounded-2xl border-2 border-line bg-snow px-4 text-[17px] font-bold text-ink outline-none transition placeholder:font-semibold placeholder:text-faint focus:border-sky focus:bg-paper",
        props.className
      )}
    />
  );
}

export function Stepper({ value, onChange, max = 5 }: { value: number; onChange: (n: number) => void; max?: number }) {
  return (
    <div className="flex items-center gap-2">
      <Btn tone="white" size="sm" className="!w-9 !px-0" aria-label="Fewer" disabled={value <= 0} onClick={() => onChange(value - 1)}>
        <Minus className="size-4" strokeWidth={3} />
      </Btn>
      <span className="relative w-7 overflow-hidden text-center text-xl font-black tabular-nums">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span key={value} className="inline-block" initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -14, opacity: 0 }} transition={bouncy}>
            {value}
          </motion.span>
        </AnimatePresence>
      </span>
      <Btn tone="white" size="sm" className="!w-9 !px-0" aria-label="More" disabled={value >= max} onClick={() => onChange(value + 1)}>
        <Plus className="size-4" strokeWidth={3} />
      </Btn>
    </div>
  );
}

/* ---------- Layout bits ---------- */

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={clsx("rounded-3xl border-2 border-line bg-paper", className)}>{children}</div>;
}

export function Heading({ children, sub, right }: { children: ReactNode; sub?: ReactNode; right?: ReactNode }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-3">
      <div className="min-w-0">
        <h2 className="text-[26px] font-black leading-tight tracking-tight text-ink">{children}</h2>
        {sub && <p className="mt-0.5 text-[15px] font-semibold text-mute">{sub}</p>}
      </div>
      {right}
    </div>
  );
}

/* ---------- Sheet ---------- */

export function Sheet({ open, onClose, children, title }: { open: boolean; onClose: () => void; children: ReactNode; title?: ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
          <motion.div className="absolute inset-0 bg-black/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            role="dialog"
            aria-modal
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 420, damping: 38 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, info) => info.offset.y > 120 && onClose()}
            className="relative max-h-[88dvh] w-full max-w-lg overflow-y-auto rounded-t-[28px] bg-paper px-5 pb-[max(24px,env(safe-area-inset-bottom))] pt-3 sm:rounded-[28px] sm:pt-5"
          >
            <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-line sm:hidden" />
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="min-w-0 text-[22px] font-black">{title}</div>
              <button onClick={onClose} aria-label="Close" className="grid size-10 shrink-0 place-items-center rounded-full text-faint transition hover:bg-snow hover:text-ink">
                <X className="size-6" strokeWidth={3} />
              </button>
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ---------- Toasts (bottom banner, like a correct-answer bar) ---------- */

type Toast = { id: number; text: string; tone: "ok" | "err" | "info" };
const ToastCtx = createContext<(text: string, tone?: Toast["tone"]) => void>(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null);
  const push = useCallback((text: string, tone: Toast["tone"] = "ok") => {
    const id = Date.now() + Math.random();
    setToast({ id, text, tone });
    setTimeout(() => setToast((t) => (t?.id === id ? null : t)), 2600);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex justify-center px-3 pb-[max(12px,env(safe-area-inset-bottom))]">
        <AnimatePresence>
          {toast && (
            <motion.div
              key={toast.id}
              initial={{ y: 120 }}
              animate={{ y: 0 }}
              exit={{ y: 140 }}
              transition={{ type: "spring", stiffness: 500, damping: 34 }}
              className={clsx(
                "flex w-full max-w-lg items-center gap-3 rounded-2xl px-4 py-3.5 text-[16px] font-extrabold shadow-[0_8px_30px_rgb(0_0_0/0.12)]",
                toast.tone === "ok" && "bg-leaf-soft text-leaf-dark",
                toast.tone === "err" && "bg-berry-soft text-berry-dark",
                toast.tone === "info" && "bg-sky-soft text-sky-dark"
              )}
            >
              <motion.span
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ ...bouncy, delay: 0.08 }}
                className={clsx(
                  "grid size-8 shrink-0 place-items-center rounded-full text-white",
                  toast.tone === "ok" ? "bg-leaf" : toast.tone === "err" ? "bg-berry" : "bg-sky"
                )}
              >
                {toast.tone === "err" ? <X className="size-5" strokeWidth={3.5} /> : <Check className="size-5" strokeWidth={3.5} />}
              </motion.span>
              {toast.text}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  );
}

/* ---------- Confetti ---------- */

const confettiColors = ["#ff9600", "#58cc02", "#1cb0f6", "#ffc800", "#ff4b4b", "#ce82ff"];

export function ConfettiBurst({ fire }: { fire: number }) {
  const [pieces, setPieces] = useState<{ id: number; x: number; y: number; r: number; c: string; d: number; round: boolean }[]>([]);
  useEffect(() => {
    if (!fire) return;
    setPieces(
      Array.from({ length: 70 }, (_, i) => ({
        id: fire * 1000 + i,
        x: (Math.random() - 0.5) * (typeof window !== "undefined" ? Math.min(window.innerWidth, 700) : 400),
        y: -(180 + Math.random() * 320),
        r: (Math.random() - 0.5) * 720,
        c: confettiColors[i % confettiColors.length],
        d: Math.random() * 0.15,
        round: Math.random() > 0.6,
      }))
    );
    const t = setTimeout(() => setPieces([]), 2200);
    return () => clearTimeout(t);
  }, [fire]);
  return (
    <div className="pointer-events-none fixed bottom-24 left-1/2 z-[70]" aria-hidden>
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          className="absolute block"
          style={{ background: p.c, width: p.round ? 9 : 8, height: p.round ? 9 : 14, borderRadius: p.round ? 99 : 2 }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
          animate={{ x: p.x, y: [0, p.y, p.y + 520], rotate: p.r, opacity: [1, 1, 0] }}
          transition={{ duration: 1.9, delay: p.d, ease: [0.15, 0.6, 0.4, 1], times: [0, 0.35, 1] }}
        />
      ))}
    </div>
  );
}
