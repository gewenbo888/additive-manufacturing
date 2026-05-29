"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { T, useLang } from "./lang";
import { MERGE_STAGES } from "./content";

/* Future Human–Product Merging — the interface collapsing toward, then into, the person.
   A slider/stepper (with auto-play) walks the 6 MERGE_STAGES; the product marker migrates
   from "in the hand" (far, amber) to "inside the mind" (fused, iris) and finally merges
   with the central core. The thesis: the product moving from something you use to
   something you are. */

export default function MergeSim() {
  const { lang } = useLang();
  const [stage, setStage] = useState(0);
  const [playing, setPlaying] = useState(false);

  // animated position 0..(N-1); eases toward the target stage
  const posRef = useRef(0);
  const [pos, setPos] = useState(0);
  const rafRef = useRef<number | null>(null);

  const N = MERGE_STAGES.length;
  const cur = MERGE_STAGES[stage];

  // ease the animated position toward the selected stage
  useEffect(() => {
    const tick = () => {
      const target = stage;
      const p = posRef.current;
      const next = p + (target - p) * 0.12;
      const settled = Math.abs(next - target) < 0.001;
      posRef.current = settled ? target : next;
      setPos(posRef.current);
      if (!settled) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        rafRef.current = null;
      }
    };
    if (rafRef.current === null) rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [stage]);

  // auto-play stepper
  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => {
      setStage((s) => {
        if (s >= N - 1) {
          setPlaying(false);
          return s;
        }
        return s + 1;
      });
    }, 1600);
    return () => window.clearInterval(id);
  }, [playing, N]);

  const go = useCallback(
    (s: number) => {
      setPlaying(false);
      setStage(Math.max(0, Math.min(N - 1, s)));
    },
    [N]
  );

  // ---- geometry ----------------------------------------------------------
  const W = 560;
  const H = 300;
  const cx = W * 0.34; // person core center
  const cy = H * 0.5;
  const farX = W * 0.9; // "held, in the hand" — far right
  // progress 0..1 across the collapse
  const prog = pos / (N - 1);
  // distance from far point to the core, eased to 0 at the final stage
  const markerX = farX - (farX - cx) * prog;
  const markerY = cy;
  // last stage fuses into the core
  const fused = pos > N - 1.4;
  const fuseAmt = Math.max(0, Math.min(1, (pos - (N - 2)) / 1)); // 0..1 over final step

  // accent for the currently-animated stage (interpolated index → nearest)
  const accent = MERGE_STAGES[Math.round(pos)].accent;

  // ambient ring appears around the "Ambient" stage (index 3)
  const ringAmt = Math.max(0, 1 - Math.abs(pos - 3) * 1.2);
  // core glow grows as the product nears / fuses
  const coreGlow = 0.25 + prog * 0.75;
  const coreR = 26 + prog * 10 + fuseAmt * 8;

  return (
    <div className="holo rounded-2xl p-5 sm:p-7">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="label-mono text-ghost-300">
            <T v={{ en: "DISTANCE COLLAPSE", zh: "距离塌缩" }} />
          </div>
          <h3 className="display mt-1 text-xl text-ghost-50 sm:text-2xl">
            <T v={{ en: "Human – Product Merging", zh: "人与产品的融合" }} />
          </h3>
          <p className="mt-1 max-w-md text-sm text-ghost-300">
            <T
              v={{
                en: "The interface keeps moving closer to the body, then inside it, then into the mind.",
                zh: "界面不断向身体靠近，然后进入身体，再进入心智。",
              }}
            />
          </p>
        </div>
        <div className="label-mono tnum text-right text-ghost-500">
          <span style={{ color: accent }}>{String(stage + 1).padStart(2, "0")}</span>
          <span className="text-ghost-500/60"> / {String(N).padStart(2, "0")}</span>
        </div>
      </div>

      <div className="rule-signal my-4" />

      {/* ---- stage diagram ---- */}
      <div className="grid-fine relative overflow-hidden rounded-xl border border-signal-500/20 bg-ink-950">
        <svg viewBox={`0 0 ${W} ${H}`} className="block w-full" role="img" aria-label="merging diagram">
          <defs>
            <radialGradient id="coreGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={accent} stopOpacity={0.95} />
              <stop offset="60%" stopColor={accent} stopOpacity={0.35} />
              <stop offset="100%" stopColor={accent} stopOpacity={0} />
            </radialGradient>
            <radialGradient id="haloGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={accent} stopOpacity={0.18} />
              <stop offset="100%" stopColor={accent} stopOpacity={0} />
            </radialGradient>
          </defs>

          {/* travel rail from far point to core */}
          <line
            x1={cx}
            y1={cy}
            x2={farX}
            y2={cy}
            stroke="#232a3b"
            strokeWidth={1}
            strokeDasharray="3 5"
          />

          {/* outer ambient halo (peaks at the Ambient stage) */}
          <circle cx={cx} cy={cy} r={72} fill="url(#haloGrad)" opacity={ringAmt} />
          {ringAmt > 0.02 && (
            <circle
              cx={cx}
              cy={cy}
              r={66}
              fill="none"
              stroke={accent}
              strokeWidth={1.25}
              strokeDasharray="2 6"
              opacity={ringAmt * 0.8}
              className="spin-slow"
              style={{ transformOrigin: `${cx}px ${cy}px` }}
            />
          )}

          {/* the person — head + torso silhouette as a glowing core */}
          <g>
            {/* glow field */}
            <circle cx={cx} cy={cy} r={coreR + 28} fill="url(#coreGrad)" opacity={coreGlow * 0.9} />
            {/* torso */}
            <path
              d={`M ${cx - 26} ${cy + 52}
                  Q ${cx - 30} ${cy + 6} ${cx} ${cy + 2}
                  Q ${cx + 30} ${cy + 6} ${cx + 26} ${cy + 52} Z`}
              fill="#10131b"
              stroke={accent}
              strokeOpacity={0.55 + prog * 0.4}
              strokeWidth={1.5}
            />
            {/* head */}
            <circle
              cx={cx}
              cy={cy - 26}
              r={18}
              fill="#0a0c11"
              stroke={accent}
              strokeOpacity={0.6 + prog * 0.4}
              strokeWidth={1.5}
            />
            {/* inner core pulse — brightens as merging completes */}
            <circle
              cx={cx}
              cy={cy - 26}
              r={6 + fuseAmt * 6}
              fill={accent}
              opacity={0.4 + prog * 0.6}
              className="pulse"
            />
          </g>

          {/* the product marker — migrates inward, fuses at the end */}
          {!fused && (
            <g opacity={1 - fuseAmt * 0.85} style={{ transition: "opacity .2s" }}>
              <circle cx={markerX} cy={markerY} r={11} fill={accent} opacity={0.9} />
              <circle cx={markerX} cy={markerY} r={11} fill="none" stroke={accent} strokeWidth={1.5} opacity={0.5} />
              {/* a tiny "product" notch */}
              <rect
                x={markerX - 3.5}
                y={markerY - 3.5}
                width={7}
                height={7}
                rx={1.4}
                fill="#06070a"
                opacity={0.85}
              />
              {/* connection beam to the body, intensifies as it nears */}
              <line
                x1={markerX}
                y1={markerY}
                x2={cx}
                y2={cy}
                stroke={accent}
                strokeWidth={1 + prog * 2}
                opacity={0.15 + prog * 0.5}
              />
            </g>
          )}

          {/* burst when fully neural / fused */}
          {fuseAmt > 0.5 && (
            <circle
              cx={cx}
              cy={cy - 26}
              r={20 + (fuseAmt - 0.5) * 30}
              fill="none"
              stroke={accent}
              strokeWidth={1.5}
              opacity={(1 - fuseAmt) * 1.6}
            />
          )}

          {/* far/near axis labels */}
          <text x={farX} y={cy + 30} textAnchor="middle" fontSize="9" fill="#596174" className="mono">
            {lang === "zh" ? "你所用之物" : "something you USE"}
          </text>
          <text x={cx} y={cy + 78} textAnchor="middle" fontSize="9" fill="#596174" className="mono">
            {lang === "zh" ? "你所是之物" : "something you ARE"}
          </text>
        </svg>
      </div>

      {/* ---- current stage readout ---- */}
      <div
        key={cur.key}
        className="rise-in mt-4 rounded-xl border bg-ink-900 p-4"
        style={{ borderColor: `${cur.accent}40` }}
      >
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span
            className="label-mono"
            style={{ color: cur.accent }}
          >
            {String(stage + 1).padStart(2, "0")}
          </span>
          <span className={`display text-lg text-ghost-50 ${lang === "zh" ? "zh" : ""}`}>
            <T v={cur.name} />
          </span>
          <span className="text-sm text-ghost-300">
            · <T v={cur.distance} />
          </span>
        </div>
        <p className={`mt-1.5 text-sm text-ghost-200 ${lang === "zh" ? "zh" : ""}`}>
          <T v={cur.gloss} />
        </p>
      </div>

      {/* ---- stepper dots ---- */}
      <div className="mt-4 flex items-center gap-1.5">
        {MERGE_STAGES.map((s, i) => {
          const active = i === stage;
          const passed = i < stage;
          return (
            <button
              key={s.key}
              onClick={() => go(i)}
              className="group relative flex-1"
              aria-label={s.name[lang]}
              aria-pressed={active}
            >
              <span
                className="block h-1.5 w-full rounded-full transition-all"
                style={{
                  background: active || passed ? s.accent : "#232a3b",
                  opacity: active ? 1 : passed ? 0.55 : 1,
                  boxShadow: active ? `0 0 10px ${s.accent}88` : "none",
                }}
              />
              <span
                className={`mt-1.5 block truncate text-center text-[0.62rem] font-mono transition ${
                  active ? "" : "text-ghost-500 group-hover:text-ghost-300"
                }`}
                style={active ? { color: s.accent } : undefined}
              >
                {s.distance[lang]}
              </span>
            </button>
          );
        })}
      </div>

      {/* ---- slider ---- */}
      <input
        type="range"
        min={0}
        max={N - 1}
        step={1}
        value={stage}
        onChange={(e) => go(Number(e.target.value))}
        className="mt-4 w-full accent-signal-500"
        style={{ accentColor: cur.accent }}
        aria-label="merging stage"
      />

      {/* ---- transport controls ---- */}
      <div className="mt-3 flex items-center justify-between">
        <button
          onClick={() => go(stage - 1)}
          disabled={stage === 0}
          className="label-mono rounded-md border border-signal-500/30 px-3 py-1.5 text-ghost-200 transition hover:border-signal-400/60 hover:text-signal-300 disabled:opacity-30"
        >
          ‹ <T v={{ en: "Prev", zh: "上一步" }} />
        </button>

        <button
          onClick={() => {
            if (stage >= N - 1) {
              go(0);
              setTimeout(() => setPlaying(true), 0);
            } else {
              setPlaying((p) => !p);
            }
          }}
          className="label-mono rounded-md px-4 py-1.5 font-medium text-ink-950 transition"
          style={{ background: cur.accent, boxShadow: `0 0 16px ${cur.accent}55` }}
        >
          {playing ? (
            <T v={{ en: "❚❚ Pause", zh: "❚❚ 暂停" }} />
          ) : stage >= N - 1 ? (
            <T v={{ en: "↺ Replay", zh: "↺ 重放" }} />
          ) : (
            <T v={{ en: "▶ Play collapse", zh: "▶ 播放塌缩" }} />
          )}
        </button>

        <button
          onClick={() => go(stage + 1)}
          disabled={stage === N - 1}
          className="label-mono rounded-md border border-signal-500/30 px-3 py-1.5 text-ghost-200 transition hover:border-signal-400/60 hover:text-signal-300 disabled:opacity-30"
        >
          <T v={{ en: "Next", zh: "下一步" }} /> ›
        </button>
      </div>

      <p className="mt-4 text-center text-xs text-ghost-500">
        <T
          v={{
            en: "Each step the product gets harder to put down — and harder to tell apart from the self.",
            zh: "每一步，产品都更难被放下——也更难与自我区分。",
          }}
        />
      </p>
    </div>
  );
}
