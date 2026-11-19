"use client";

import { motion, useAnimationControls } from "motion/react";
import { useEffect, useState } from "react";

export type Mood = "idle" | "happy" | "sad";

const FEATHERS = ["#ff4b4b", "#ff9600", "#ffc800", "#58cc02", "#1cb0f6", "#ffc800", "#ff9600", "#ff4b4b"];

/** Gobbles, the party turkey. Bobs while idle, jumps when someone says they're in. */
export function Turkey({ mood = "idle", size = 150, onTap }: { mood?: Mood; size?: number; onTap?: () => void }) {
  const body = useAnimationControls();
  const fan = useAnimationControls();
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    let alive = true;
    const loop = () => {
      if (!alive) return;
      setBlink(true);
      setTimeout(() => setBlink(false), 130);
      setTimeout(loop, 2400 + Math.random() * 2600);
    };
    const t = setTimeout(loop, 1800);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, []);

  useEffect(() => {
    if (mood === "happy") {
      body.start({ y: [0, -34, 0, -14, 0], rotate: [0, -6, 6, -3, 0], transition: { duration: 0.9, ease: "easeOut" } });
      fan.start({ scale: [1, 1.18, 1], rotate: [0, -8, 8, 0], transition: { duration: 0.9 } });
    } else if (mood === "sad") {
      body.start({ y: [0, 6, 0], rotate: [0, -4, 0], transition: { duration: 0.8 } });
      fan.start({ scale: [1, 0.86, 0.95], transition: { duration: 0.8 } });
    }
  }, [mood, body, fan]);

  return (
    <motion.button
      type="button"
      aria-label="Gobbles the turkey"
      onClick={() => {
        onTap?.();
        body.start({ y: [0, -18, 0], transition: { duration: 0.45 } });
        fan.start({ rotate: [0, -10, 10, 0], transition: { duration: 0.5 } });
      }}
      className="relative block cursor-pointer select-none outline-none"
      style={{ width: size, height: size }}
      whileTap={{ scale: 0.94 }}
    >
      <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }} className="absolute inset-0">
        <motion.svg viewBox="0 0 160 160" width={size} height={size} animate={body} style={{ overflow: "visible" }}>
          {/* shadow */}
          <ellipse cx="80" cy="150" rx="38" ry="6" fill="#000" opacity="0.08" />
          {/* tail fan */}
          <motion.g animate={fan} style={{ originX: "80px", originY: "92px" }}>
            {FEATHERS.map((c, i) => {
              const a = -160 + (i * 140) / (FEATHERS.length - 1);
              return (
                <g key={i} transform={`rotate(${a + 90} 80 92)`}>
                  <rect x="69" y="18" width="22" height="78" rx="11" fill={c} />
                  <rect x="74" y="24" width="12" height="30" rx="6" fill="#fff" opacity="0.28" />
                </g>
              );
            })}
          </motion.g>
          {/* feet */}
          <path d="M66 136v10m0 0-6 4m6-4 6 4M94 136v10m0 0-6 4m6-4 6 4" stroke="#ff9600" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          {/* body */}
          <ellipse cx="80" cy="108" rx="40" ry="36" fill="#a0612f" />
          <ellipse cx="80" cy="118" rx="25" ry="22" fill="#c98a54" />
          {/* wings */}
          <motion.path
            d="M43 104c-8 6-10 18-4 24 6-1 12-8 13-18z"
            fill="#8a4f22"
            animate={mood === "happy" ? { rotate: [0, -30, 0, -30, 0] } : { rotate: 0 }}
            transition={{ duration: 0.8 }}
            style={{ originX: "50px", originY: "104px" }}
          />
          <motion.path
            d="M117 104c8 6 10 18 4 24-6-1-12-8-13-18z"
            fill="#8a4f22"
            animate={mood === "happy" ? { rotate: [0, 30, 0, 30, 0] } : { rotate: 0 }}
            transition={{ duration: 0.8 }}
            style={{ originX: "110px", originY: "104px" }}
          />
          {/* head */}
          <circle cx="80" cy="70" r="24" fill="#a0612f" />
          {/* eyes */}
          {blink ? (
            <>
              <path d="M66 66h9M85 66h9" stroke="#3c3c3c" strokeWidth="3.5" strokeLinecap="round" />
            </>
          ) : (
            <>
              <circle cx="70.5" cy="65" r="8" fill="#fff" />
              <circle cx="89.5" cy="65" r="8" fill="#fff" />
              <circle cx={mood === "sad" ? 70 : 72} cy={mood === "sad" ? 68 : 66} r="4.2" fill="#3c3c3c" />
              <circle cx={mood === "sad" ? 89 : 91} cy={mood === "sad" ? 68 : 66} r="4.2" fill="#3c3c3c" />
              <circle cx="73.5" cy="64" r="1.4" fill="#fff" />
              <circle cx="92.5" cy="64" r="1.4" fill="#fff" />
            </>
          )}
          {mood === "sad" && <path d="M63 56l12 4M97 56l-12 4" stroke="#6b3a17" strokeWidth="3" strokeLinecap="round" />}
          {/* beak + wattle */}
          <path d="M74 75l6 9 6-9z" fill="#ffc800" stroke="#e5a800" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M84 80c4 2 5 8 2 13-3 3-6 1-5-3 1-3 0-6 3-10z" fill="#ff4b4b" />
          {/* cheeks */}
          <circle cx="62" cy="76" r="4" fill="#ff86a0" opacity="0.55" />
          <circle cx="98" cy="76" r="4" fill="#ff86a0" opacity="0.55" />
        </motion.svg>
      </motion.div>
    </motion.button>
  );
}
