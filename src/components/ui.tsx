"use client";

import { AnimatePresence, motion } from "motion/react";
import clsx from "clsx";
import { Loader2 } from "lucide-react";
import { createContext, useCallback, useContext, useId, useState, type ReactNode } from "react";

export const spring = { type: "spring" as const, stiffness: 420, damping: 34 };

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  size = "md",
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: ReactNode; tone?: string }[];
  size?: "sm" | "md";
}) {
  const id = useId();
  return (
    <div
      role="radiogroup"
      className={clsx(
        "relative grid rounded-2xl border border-line bg-white/[0.02] p-1",
        size === "sm" ? "text-[13px]" : "text-sm"
      )}
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={clsx(
              "relative z-0 flex items-center justify-center gap-1.5 rounded-xl font-medium transition-colors",
              size === "sm" ? "h-9 px-2" : "h-11 px-3",
              active ? "text-bg" : "text-mute hover:text-ink"
            )}
          >
            {active && (
              <motion.span
                layoutId={`seg-${id}`}
                transition={spring}
                className={clsx("absolute inset-0 -z-10 rounded-xl shadow-[0_1px_12px_-2px_rgb(0_0_0/0.5)]", o.tone ?? "bg-ink")}
              />
            )}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

const avatarTones = [
  "from-orange-300 to-amber-500",
  "from-rose-300 to-orange-400",
  "from-amber-200 to-yellow-500",
  "from-lime-200 to-emerald-400",
  "from-stone-200 to-stone-400",
  "from-orange-200 to-red-400",
];

export function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase() || "?";
}

export function Avatar({ name, id, size = 32, className }: { name: string; id: number; size?: number; className?: string }) {
  return (
    <span
      title={name}
      className={clsx(
        "inline-flex shrink-0 select-none items-center justify-center rounded-full bg-gradient-to-br font-semibold text-stone-900 ring-2 ring-bg",
        avatarTones[id % avatarTones.length],
        className
      )}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {initials(name)}
    </span>
  );
}

export function Button({
  children,
  loading,
  variant = "primary",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean; variant?: "primary" | "ghost" | "soft" }) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      transition={spring}
      disabled={loading || props.disabled}
      className={clsx(
        "relative inline-flex h-12 items-center justify-center gap-2 rounded-2xl px-5 text-[15px] font-semibold transition-[background,color,opacity,box-shadow] disabled:opacity-60",
        variant === "primary" &&
          "bg-gradient-to-b from-[#fdba74] to-ember-deep text-stone-950 shadow-[0_8px_30px_-8px_rgb(234_88_12/0.7),inset_0_1px_0_rgb(255_255_255/0.4)] hover:brightness-105",
        variant === "ghost" && "border border-line bg-white/[0.03] text-ink hover:bg-white/[0.07]",
        variant === "soft" && "bg-white/[0.06] text-ink hover:bg-white/[0.1]",
        className
      )}
      {...(props as React.ComponentProps<typeof motion.button>)}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {loading ? (
          <motion.span key="l" initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
            <Loader2 className="size-5 animate-spin" />
          </motion.span>
        ) : (
          <motion.span
            key="c"
            className="inline-flex items-center gap-2"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {children}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

export function Field({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="group block">
      <span className="mb-1.5 block text-[13px] font-medium text-mute">{label}</span>
      <input
        {...props}
        className={clsx(
          "h-12 w-full rounded-2xl border border-line bg-white/[0.03] px-4 text-[16px] text-ink placeholder:text-faint outline-none transition",
          "focus:border-ember/60 focus:bg-white/[0.05] focus:ring-4 focus:ring-ember/10",
          props.className
        )}
      />
    </label>
  );
}

export function SectionTitle({ eyebrow, title, right }: { eyebrow: string; title: ReactNode; right?: ReactNode }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        <p className="mb-1.5 text-[12px] font-semibold uppercase tracking-[0.16em] text-ember">{eyebrow}</p>
        <h2 className="font-serif text-[34px] leading-none tracking-tight text-ink sm:text-[40px]">{title}</h2>
      </div>
      {right}
    </div>
  );
}

export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ---------- Toasts ---------- */

type Toast = { id: number; text: string; tone: "ok" | "err" };
const ToastCtx = createContext<(text: string, tone?: Toast["tone"]) => void>(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((text: string, tone: Toast["tone"] = "ok") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t.slice(-2), { id, text, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-[max(16px,env(safe-area-inset-bottom))] z-50 flex flex-col items-center gap-2 px-4">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95, transition: { duration: 0.15 } }}
              transition={spring}
              className={clsx(
                "rounded-full border px-4 py-2.5 text-sm font-medium shadow-2xl backdrop-blur-xl",
                t.tone === "ok" ? "border-white/10 bg-stone-900/90 text-ink" : "border-red-400/30 bg-red-950/90 text-red-100"
              )}
            >
              {t.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  );
}
