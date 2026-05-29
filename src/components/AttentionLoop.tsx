"use client";

import { useEffect, useRef, useState } from "react";
import { T, useLang } from "./lang";
import { LOOP_STAGES, PERSUASIVE_PATTERNS } from "./content";

/**
 * The engagement loop, drawn honestly. Four stages — Trigger → Action →
 * Variable reward → Investment → back to Trigger — arranged in a ring with a
 * token that circles continuously. Speed (1×/2×/3×) tightens the loop to make
 * the compounding visible. Below, the six persuasive patterns are listed as
 * "mechanisms of capture": named, described by their effect, framed critically.
 * Tone is clear-eyed, not endorsing.
 */
export default function AttentionLoop() {
  const { lang } = useLang();
  const n = LOOP_STAGES.length;

  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1); // 1 | 2 | 3
  const [active, setActive] = useState(0); // selected stage
  const [theta, setTheta] = useState(-Math.PI / 2); // token angle; start at top
  const raf = useRef<number | null>(null);
  const last = useRef<number | null>(null);

  // animate the token around the ring; speed scales angular velocity
  useEffect(() => {
    if (!playing) {
      last.current = null;
      return;
    }
    const tick = (ts: number) => {
      if (last.current == null) last.current = ts;
      const dt = (ts - last.current) / 1000;
      last.current = ts;
      // base ~0.55 rad/s, multiplied by speed
      setTheta((a) => a + dt * 0.55 * speed);
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [playing, speed]);

  // geometry
  const C = 140; // viewbox center
  const R = 96; // ring radius
  const stagePos = (i: number) => {
    const ang = -Math.PI / 2 + (i / n) * Math.PI * 2; // stage 0 at top, clockwise
    return { x: C + R * Math.cos(ang), y: C + R * Math.sin(ang), ang };
  };
  const tok = { x: C + R * Math.cos(theta), y: C + R * Math.sin(theta) };

  const sel = LOOP_STAGES[active];

  // arc arrow path between consecutive stages
  const arc = (i: number) => {
    const a = stagePos(i);
    const b = stagePos((i + 1) % n);
    // pull endpoints toward the node centers but stop short of the dots
    const trim = 0.34; // radians of gap on each side
    const a1 = a.ang + trim;
    const b1 = b.ang - trim;
    const ax = C + R * Math.cos(a1);
    const ay = C + R * Math.sin(a1);
    const bx = C + R * Math.cos(b1);
    const by = C + R * Math.sin(b1);
    return `M ${ax.toFixed(1)} ${ay.toFixed(1)} A ${R} ${R} 0 0 1 ${bx.toFixed(1)} ${by.toFixed(1)}`;
  };

  return (
    <div className="holo rounded-2xl p-5 md:p-7">
      {/* header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="label-mono" style={{ color: "#b794ff" }}>
            {lang === "zh" ? "参与回路 · 留住你，而非服务你" : "Engagement Loop · Built to keep you, not serve you"}
          </p>
          <h3 className={`display mt-1 text-lg text-ghost-50 md:text-xl ${lang === "zh" ? "zh" : ""}`}>
            <T v={{ en: "The loop that optimizes for your time, not your goals", zh: "那个为你的时间、而非你的目标而优化的回路" }} />
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPlaying((p) => !p)}
            className="rounded-full border border-iris-500/40 px-3 py-1.5 mono text-[0.62rem] uppercase tracking-wider text-iris-300 transition hover:border-iris-400"
            aria-pressed={playing}
          >
            {playing ? (lang === "zh" ? "暂停" : "pause") : (lang === "zh" ? "运行" : "play")}
          </button>
          <div className="flex overflow-hidden rounded-full border border-iris-500/30 mono text-[0.62rem]">
            {[1, 2, 3].map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-2.5 py-1.5 transition ${speed === s ? "bg-iris-500/25 text-iris-300" : "text-ghost-400 hover:text-iris-400"}`}
                aria-pressed={speed === s}
              >
                {s}×
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 h-px rule-signal opacity-50" />

      {/* ============ THE RING + CENTER PANEL ============ */}
      <div className="mt-6 grid items-center gap-5 md:grid-cols-[280px_1fr]">
        <div className="relative mx-auto w-full max-w-[280px]">
          <svg viewBox="0 0 280 280" className="w-full">
            <defs>
              <marker id="al-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M0 0 L10 5 L0 10 z" fill="#b794ff" />
              </marker>
            </defs>

            {/* faint guide ring */}
            <circle cx={C} cy={C} r={R} fill="none" stroke="#232a3b" strokeWidth="1" strokeDasharray="2 5" />

            {/* arrows between stages */}
            {LOOP_STAGES.map((_, i) => (
              <path
                key={`arc-${i}`}
                d={arc(i)}
                fill="none"
                stroke="#9b6dff"
                strokeOpacity={0.5}
                strokeWidth="1.6"
                markerEnd="url(#al-arrow)"
              />
            ))}

            {/* the traveling token */}
            <circle cx={tok.x} cy={tok.y} r="7" fill="#ffbe52" opacity="0.25" />
            <circle cx={tok.x} cy={tok.y} r="4" fill="#ffd98c">
              <animate attributeName="r" values="4;5;4" dur="0.9s" repeatCount="indefinite" />
            </circle>

            {/* stage nodes */}
            {LOOP_STAGES.map((st, i) => {
              const p = stagePos(i);
              const on = i === active;
              return (
                <g
                  key={st.key}
                  className="cursor-pointer"
                  onClick={() => setActive(i)}
                  role="button"
                  aria-pressed={on}
                >
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={on ? 16 : 13}
                    fill={on ? st.accent : "#0a0c11"}
                    stroke={st.accent}
                    strokeWidth={on ? 2.2 : 1.6}
                    style={{ filter: on ? `drop-shadow(0 0 8px ${st.accent})` : "none", transition: "all .25s" }}
                  />
                  <text
                    x={p.x}
                    y={p.y + 3.5}
                    textAnchor="middle"
                    className="mono"
                    fontSize="10"
                    fontWeight="600"
                    fill={on ? "#06070a" : st.accent}
                  >
                    {i + 1}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* selected-stage panel */}
        <div
          key={sel.key}
          className="rise-in rounded-xl border bg-ink-900/60 p-5"
          style={{ borderColor: `${sel.accent}55` }}
        >
          <div className="flex items-center gap-2.5">
            <span className="grid h-7 w-7 place-items-center rounded-md border mono text-[0.7rem]" style={{ borderColor: `${sel.accent}66`, color: sel.accent }}>
              {active + 1}
            </span>
            <span className={`display text-lg text-ghost-50 ${lang === "zh" ? "zh" : ""}`}>
              <T v={sel.name} />
            </span>
          </div>
          <p className={`mt-3 text-sm leading-relaxed text-ghost-200 ${lang === "zh" ? "zh" : ""}`}>
            <T v={sel.gloss} />
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {LOOP_STAGES.map((s, i) => (
              <span key={s.key} className="flex items-center gap-2">
                <button
                  onClick={() => setActive(i)}
                  className={`text-[0.7rem] transition ${i === active ? "" : "text-ghost-500 hover:text-ghost-200"} ${lang === "zh" ? "zh" : "mono"}`}
                  style={{ color: i === active ? s.accent : undefined }}
                >
                  <T v={s.name} />
                </button>
                {i < n - 1 && <span className="text-ghost-500/50">→</span>}
              </span>
            ))}
            <span className="text-[0.7rem] text-iris-400/70">↺</span>
          </div>
          <p className="mt-3 text-[0.7rem] italic text-ghost-500">
            <T
              v={{
                en: "Four stages, closed into a cycle. Each turn loads the next; faster turns compound the pull.",
                zh: "四个阶段，闭合为一个循环。每一圈都为下一圈上膛；转得越快，拉力越是复利。",
              }}
            />
          </p>
        </div>
      </div>

      <div className="mt-8 h-px rule-signal opacity-40" />

      {/* ============ MECHANISMS OF CAPTURE ============ */}
      <p className="mono mt-7 text-[0.72rem] tracking-wide text-amber-400">
        {lang === "zh" ? "// 捕获机制" : "// mechanisms of capture"}
      </p>
      <h4 className={`display mt-1 text-base text-ghost-100 ${lang === "zh" ? "zh" : ""}`}>
        <T v={{ en: "Not accidents — behavioral science applied to the soft machinery of dopamine", zh: "并非意外——行为科学，被施加于多巴胺这套柔软的机械之上" }} />
      </h4>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {PERSUASIVE_PATTERNS.map((pat) => (
          <div
            key={pat.name.en}
            className="group rounded-xl border border-ink-600/60 bg-ink-900/40 p-4 transition-colors hover:border-ink-600"
            style={{ borderTop: `2px solid ${pat.accent}` }}
          >
            <div className="flex items-start justify-between gap-2">
              <span className={`text-sm font-medium ${lang === "zh" ? "zh" : "display"}`} style={{ color: pat.accent }}>
                <T v={pat.name} />
              </span>
              {/* a small warning glyph keeps the framing critical */}
              <svg viewBox="0 0 16 16" className="mt-0.5 h-3.5 w-3.5 shrink-0 opacity-50 transition-opacity group-hover:opacity-90" fill="none" stroke="#ffbe52" strokeWidth="1.5">
                <path d="M8 1.5 L15 14 H1 Z" strokeLinejoin="round" />
                <path d="M8 6v4" strokeLinecap="round" />
                <circle cx="8" cy="12" r="0.4" fill="#ffbe52" stroke="none" />
              </svg>
            </div>
            <p className={`mt-2 text-[0.8rem] leading-snug text-ghost-300 ${lang === "zh" ? "zh" : ""}`}>
              <T v={pat.effect} />
            </p>
          </div>
        ))}
      </div>

      <p className="mt-6 text-center text-[0.72rem] italic text-ghost-500">
        <T
          v={{
            en: "When the product is free, you are not the customer — your attention is the product, harvested by the hour.",
            zh: "当产品免费，你便不是顾客——你的注意力才是产品，按小时被收割。",
          }}
        />
      </p>
    </div>
  );
}
