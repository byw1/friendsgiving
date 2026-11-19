"use client";

import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { useMemo, useState } from "react";
import clsx from "clsx";
import {
  Beer,
  CakeSlice,
  Check,
  Cherry,
  Cookie,
  CupSoda,
  Drumstick,
  GlassWater,
  Ham,
  Martini,
  Pizza,
  Plus,
  Salad,
  Soup,
  Sparkles,
  Utensils,
  Wheat,
  Wine,
  type LucideIcon,
} from "lucide-react";
import { CATEGORIES } from "@/lib/event";
import type { Claim, Item } from "@/lib/types";
import { useApp } from "./App";
import { Avatar, Btn, Heading, Sheet, TextInput, bouncy, firstName, isHost, useToast } from "./ui";

const ICONS: Record<string, [LucideIcon, string]> = {
  turkey: [Drumstick, "#ff9600"],
  pizza: [Pizza, "#ff4b4b"],
  protein: [Ham, "#ff4b4b"],
  mashed: [Soup, "#ffc800"],
  mac: [Soup, "#ff9600"],
  stuffing: [Wheat, "#c98a54"],
  veg: [Salad, "#58cc02"],
  rolls: [Wheat, "#e5a800"],
  cranberry: [Cherry, "#ff4b4b"],
  pie: [CakeSlice, "#ff9600"],
  sweets: [Cookie, "#a0612f"],
  alcohol: [Wine, "#ce82ff"],
  chasers: [Martini, "#1cb0f6"],
  soft: [CupSoda, "#ff4b4b"],
  cups: [GlassWater, "#1cb0f6"],
  plates: [Utensils, "#777777"],
  utensils: [Utensils, "#afafaf"],
};
const fallbackIcon: [LucideIcon, string] = [Beer, "#ff9600"];

export function claimLabel(c: Claim, items: Item[]) {
  const base = c.itemId ? items.find((i) => i.id === c.itemId)?.label ?? "Something" : c.label ?? "Something";
  return c.note ? `${base} (${c.note})` : base;
}

type Filter = "all" | (typeof CATEGORIES)[number]["key"];

export function BringList() {
  const { state } = useApp();
  const [filter, setFilter] = useState<Filter>("all");
  const covered = state.items.filter((i) => i.claims.length >= i.need).length;
  const total = state.items.length;

  const groups = useMemo(
    () =>
      CATEGORIES.filter((c) => filter === "all" || c.key === filter)
        .map((c) => ({ ...c, items: state.items.filter((i) => i.category === c.key) }))
        .filter((g) => g.items.length),
    [state.items, filter]
  );

  return (
    <section id="list" className="scroll-mt-20">
      <Heading sub="Hit + on anything you can bring. Change your mind any time.">What we need</Heading>

      <Progress covered={covered} total={total} />

      <LayoutGroup id="cat">
        <div className="no-scrollbar -mx-4 mb-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
          {([{ key: "all", label: "All" }, ...CATEGORIES] as { key: Filter; label: string }[]).map((c) => {
            const on = filter === c.key;
            return (
              <button
                key={c.key}
                onClick={() => setFilter(c.key)}
                className={clsx(
                  "ledge-sm relative shrink-0 rounded-xl border-2 px-4 py-2 text-[14px] font-extrabold",
                  on ? "border-sky bg-sky-soft text-sky-dark [--ledge:var(--color-sky)]" : "border-line bg-paper text-mute hover:bg-snow"
                )}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </LayoutGroup>

      <div className="space-y-5">
        <AnimatePresence mode="popLayout" initial={false}>
          {groups.map((g) => (
            <motion.div key={g.key} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              {filter === "all" && <p className="mb-2 ml-1 text-[13px] font-extrabold uppercase tracking-wider text-faint">{g.label}</p>}
              <div className="grid grid-cols-[minmax(0,1fr)] gap-2.5 sm:grid-cols-[repeat(2,minmax(0,1fr))]">
                {g.items.map((item) => (
                  <ItemTile key={item.id} item={item} />
                ))}
                {state.extras
                  .filter((c) => c.category === g.key)
                  .map((c) => (
                    <ExtraTile key={c.id} claim={c} category={g.key} />
                  ))}
                <AddAnother category={g.key} />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <SomethingElse />
    </section>
  );
}

function Progress({ covered, total }: { covered: number; total: number }) {
  const pct = total ? covered / total : 0;
  const msg =
    pct === 0 ? "Nothing claimed yet. Be the hero." : pct < 0.5 ? "Off to a good start" : pct < 1 ? "Getting close!" : "Everything's covered. Wow.";
  return (
    <div className="rounded-2xl border-2 border-line p-4">
      <div className="mb-2.5 flex items-baseline justify-between gap-3">
        <span className="text-[15px] font-extrabold text-ink">{msg}</span>
        <span className="text-[15px] font-black tabular-nums text-pumpkin">
          {covered}/{total}
        </span>
      </div>
      <div className="h-4 overflow-hidden rounded-full bg-line">
        <motion.div
          className="shine h-full rounded-full bg-pumpkin"
          initial={{ width: 0 }}
          animate={{ width: `${Math.max(pct * 100, pct ? 6 : 0)}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />
      </div>
    </div>
  );
}

function ItemTile({ item }: { item: Item }) {
  const { me, api, asSomeone, editGuest, celebrate } = useApp();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [picking, setPicking] = useState(false);
  const [Icon, color] = ICONS[item.slug ?? ""] ?? fallbackIcon;
  const mine = me ? item.claims.find((c) => c.guestId === me.id) : undefined;
  const full = item.claims.length >= item.need;

  const toggle = async () => {
    if (busy) return;
    if (mine) {
      setBusy(true);
      const r = await api(`/api/claims/${mine.id}`, { method: "DELETE" });
      setBusy(false);
      if (r.state) toast(`Took ${item.label.toLowerCase()} off your list`, "info");
      return;
    }
    if (item.options?.length) setPicking(true);
    else claim(null);
  };

  const claim = (note: string | null) => {
    setPicking(false);
    asSomeone({
      title: "What's your name?",
      run: async (guestId) => {
        setBusy(true);
        const r = await api("/api/claims", { body: { guestId, itemId: item.id, note } });
        setBusy(false);
        if (r.state) {
          celebrate("happy");
          toast(`Nice! You're on ${(note ?? item.label).toLowerCase()}.`);
        }
      },
    });
  };

  return (
    <motion.div
      layout
      className={clsx(
        "flex min-w-0 items-center gap-3 rounded-2xl border-2 p-3 transition-colors",
        mine ? "border-leaf bg-leaf-soft/40" : full ? "border-line bg-snow" : "border-line bg-paper"
      )}
    >
      <span className="relative grid size-12 shrink-0 place-items-center rounded-xl" style={{ background: `${color}22`, color }}>
        <Icon className="size-6" strokeWidth={2.5} />
        <AnimatePresence>
          {full && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={bouncy}
              className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-leaf text-white ring-2 ring-paper"
            >
              <Check className="size-3" strokeWidth={4} />
            </motion.span>
          )}
        </AnimatePresence>
      </span>

      <div className="min-w-0 flex-1">
        <p className={clsx("truncate text-[16px] font-extrabold", full && !mine ? "text-mute" : "text-ink")}>{item.label}</p>
        {item.claims.length === 0 ? (
          <p className="truncate text-[13px] font-bold text-faint">
            {item.hint ?? "Up for grabs"}
            {item.need > 1 && ` · need ${item.need}`}
          </p>
        ) : (
          <div className="mt-0.5 flex items-center gap-1.5">
            <div className="flex -space-x-1.5">
              {item.claims.slice(0, 4).map((c) => (
                <button key={c.id} onClick={() => editGuest(c.guestId)} className="rounded-full ring-2 ring-paper" aria-label={`Edit ${c.guestName}`}>
                  <Avatar name={c.guestName} id={c.guestId} size={22} />
                </button>
              ))}
            </div>
            <p className="truncate text-[13px] font-bold text-mute">
              {item.claims.slice(0, 2).map((c, i) => (
                <span key={c.id}>
                  {i > 0 && (item.options ? ", " : " & ")}
                  <Who name={c.guestName} />
                  {c.note && ` · ${c.note}`}
                </span>
              ))}
              {item.claims.length > 2 && ` +${item.claims.length - 2}`}
              {item.need > 1 &&
                (full ? (
                  <span className="text-faint"> · {item.need}/{item.need}</span>
                ) : (
                  <span className="font-extrabold text-sky"> · need {item.need - item.claims.length} more</span>
                ))}
            </p>
          </div>
        )}
      </div>

      <motion.button
        onClick={toggle}
        disabled={busy}
        whileTap={{ scale: 0.88 }}
        aria-label={mine ? `Stop bringing ${item.label}` : `Bring ${item.label}`}
        className={clsx(
          "ledge-sm grid size-11 shrink-0 place-items-center rounded-xl border-2",
          mine ? "border-leaf-dark bg-leaf text-white [--ledge:var(--color-leaf-dark)]" : "border-line bg-paper text-sky hover:bg-sky-soft"
        )}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span key={mine ? "y" : "n"} initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }} transition={bouncy}>
            {mine ? <Check className="size-5" strokeWidth={4} /> : <Plus className="size-5" strokeWidth={4} />}
          </motion.span>
        </AnimatePresence>
      </motion.button>
      {item.options && <OptionPicker item={item} open={picking} onClose={() => setPicking(false)} onPick={claim} />}
    </motion.div>
  );
}

/** "Which one?" for drinks. Tap a chip, type your own, or skip. */
function OptionPicker({ item, open, onClose, onPick }: { item: Item; open: boolean; onClose: () => void; onPick: (note: string | null) => void }) {
  const [other, setOther] = useState("");
  const taken = new Set(item.claims.map((c) => c.note?.toLowerCase()).filter(Boolean));
  return (
    <Sheet open={open} onClose={onClose} title={`What ${item.label.toLowerCase()} are you bringing?`}>
      <div className="flex flex-wrap gap-2">
        {item.options!.map((o, i) => (
          <motion.button
            key={o}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ ...bouncy, delay: Math.min(i * 0.025, 0.3) }}
            onClick={() => onPick(o)}
            className="ledge-sm rounded-2xl border-2 border-line bg-paper px-4 py-2.5 text-[15px] font-extrabold text-ink hover:bg-snow"
          >
            {o}
            {taken.has(o.toLowerCase()) && <span className="ml-1.5 text-[12px] font-bold text-faint">someone has it</span>}
          </motion.button>
        ))}
      </div>
      <form
        className="mt-5 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (other.trim()) {
            onPick(other.trim());
            setOther("");
          }
        }}
      >
        <TextInput id={`opt-${item.id}`} value={other} maxLength={40} onChange={(e) => setOther(e.target.value)} placeholder="Something else…" />
        <Btn tone="pumpkin" disabled={!other.trim()} className="shrink-0 !px-4" aria-label="Add">
          <Plus className="size-5" strokeWidth={3.5} />
        </Btn>
      </form>
      <button onClick={() => onPick(null)} className="mt-4 w-full py-2 text-[14px] font-extrabold text-mute hover:text-ink">
        Not sure yet, decide later
      </button>
    </Sheet>
  );
}

const CATEGORY_NOUN: Record<string, string> = { mains: "main", sides: "side", dessert: "dessert", drinks: "drink", supplies: "thing" };
const CATEGORY_ICON: Record<string, [LucideIcon, string]> = {
  mains: [Drumstick, "#ff9600"],
  sides: [Salad, "#58cc02"],
  dessert: [CakeSlice, "#ff9600"],
  drinks: [Beer, "#ce82ff"],
  supplies: [Utensils, "#777777"],
};

/** Something a guest typed into a category, shown right alongside the list items. */
function ExtraTile({ claim, category }: { claim: Claim; category: string }) {
  const { me, api, editGuest } = useApp();
  const [Icon, color] = CATEGORY_ICON[category] ?? fallbackIcon;
  const mine = me?.id === claim.guestId;
  return (
    <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={bouncy}
      className={clsx("flex min-w-0 items-center gap-3 rounded-2xl border-2 p-3", mine ? "border-leaf bg-leaf-soft/40" : "border-line bg-paper")}
    >
      <span className="grid size-12 shrink-0 place-items-center rounded-xl" style={{ background: `${color}22`, color }}>
        <Icon className="size-6" strokeWidth={2.5} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[16px] font-extrabold text-ink">{claim.label}</p>
        <button onClick={() => editGuest(claim.guestId)} className="mt-0.5 flex max-w-full items-center gap-1.5 text-left">
          <Avatar name={claim.guestName} id={claim.guestId} size={22} />
          <span className="truncate text-[13px] font-bold text-mute"><Who name={claim.guestName} /></span>
        </button>
      </div>
      {mine ? (
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={() => api(`/api/claims/${claim.id}`, { method: "DELETE" })}
          aria-label={`Stop bringing ${claim.label}`}
          className="ledge-sm grid size-11 shrink-0 place-items-center rounded-xl border-2 border-leaf-dark bg-leaf text-white [--ledge:var(--color-leaf-dark)]"
        >
          <Check className="size-5" strokeWidth={4} />
        </motion.button>
      ) : (
        <span className="grid size-11 shrink-0 place-items-center text-leaf"><Check className="size-5" strokeWidth={4} /></span>
      )}
    </motion.div>
  );
}

/** "+ Add another side": type it in and it lands in this category. */
function AddAnother({ category }: { category: string }) {
  const { api, asSomeone, celebrate } = useApp();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [busy, setBusy] = useState(false);
  const noun = CATEGORY_NOUN[category] ?? "thing";

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = label.trim();
    if (!v) return;
    asSomeone({
      title: "What's your name?",
      run: async (guestId) => {
        setBusy(true);
        const r = await api("/api/claims", { body: { guestId, label: v, category } });
        setBusy(false);
        if (r.state) {
          setLabel("");
          setOpen(false);
          celebrate("happy");
          toast(`Ooh, ${v}. Love it.`);
        }
      },
    });
  };

  if (!open)
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex min-h-[76px] items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-line p-3 text-[15px] font-extrabold text-mute transition hover:border-sky hover:text-sky"
      >
        <Plus className="size-5" strokeWidth={3.5} />
        Add another {noun}
      </button>
    );
  return (
    <form onSubmit={submit} className="flex items-center gap-2 rounded-2xl border-2 border-sky bg-sky-soft/50 p-3">
      <TextInput
        id={`add-${category}`}
        autoFocus
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        onBlur={() => !label.trim() && setOpen(false)}
        maxLength={60}
        placeholder={`What ${noun} are you bringing?`}
        className="!h-12 !bg-paper !text-[16px]"
      />
      <Btn tone="pumpkin" loading={busy} disabled={!label.trim()} className="shrink-0 !px-4" aria-label="Add">
        <Plus className="size-5" strokeWidth={3.5} />
      </Btn>
    </form>
  );
}

function SomethingElse() {
  const { state, api, asSomeone, editGuest } = useApp();
  const toast = useToast();
  const [label, setLabel] = useState("");
  const [busy, setBusy] = useState(false);
  const loose = state.extras.filter((c) => !c.category);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = label.trim();
    if (!v) return;
    asSomeone({
      title: "What's your name?",
      run: async (guestId) => {
        setBusy(true);
        const r = await api("/api/claims", { body: { guestId, label: v } });
        setBusy(false);
        if (r.state) {
          setLabel("");
          toast(`Ooh, ${v}. Love it.`);
        }
      },
    });
  };

  return (
    <div className="mt-6 rounded-3xl bg-corn-soft p-4 sm:p-5">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="size-5 text-corn-dark" strokeWidth={2.75} />
        <p className="text-[17px] font-black text-ink">Bringing something else?</p>
      </div>
      <form onSubmit={submit} className="flex gap-2">
        <TextInput id="extra" value={label} onChange={(e) => setLabel(e.target.value)} maxLength={60} placeholder="Lumpia, a speaker, board games…" className="!bg-paper" />
        <Btn tone="pumpkin" loading={busy} disabled={!label.trim()} className="shrink-0 !px-4" aria-label="Add">
          <Plus className="size-5" strokeWidth={3.5} />
        </Btn>
      </form>
      {loose.length > 0 && (
        <motion.div layout className="mt-4 flex flex-wrap gap-2">
          <AnimatePresence initial={false}>
            {loose.map((c) => (
              <motion.button
                layout
                key={c.id}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={bouncy}
                onClick={() => editGuest(c.guestId)}
                className="flex items-center gap-2 rounded-xl bg-paper py-1 pl-1 pr-3 text-[14px] font-extrabold text-ink"
              >
                <Avatar name={c.guestName} id={c.guestId} size={26} />
                {c.label}
                <span className="whitespace-nowrap font-bold text-faint"><Who name={c.guestName} /></span>
              </motion.button>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}

/** A name, in shiny gold if it's a host. Hosts keep their full name ("William & Marko"). */
function Who({ name }: { name: string }) {
  return isHost(name) ? <span className="host-text font-black">{name}</span> : <>{firstName(name)}</>;
}
