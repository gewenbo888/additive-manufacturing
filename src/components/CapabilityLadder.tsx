"use client";

import { useEffect, useRef, useState } from "react";
import { T, useLang } from "./lang";
import { CAPABILITY_ERAS, EXTERNALIZATIONS } from "./content";

export default function CapabilityLadder() {
  const { lang } = useLang();
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  // auto-advance along the rail
  useEffect(() => {
    if (!playing) return;
    timer.current = setInterval(() => {
      setActive((a) => (a + 1) % CAPABILITY_ERAS.length);
    }, 1700);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [playing]);

  const sel = CAPABILITY_ERAS[active];

  return (
    <div className="holo rounded-2xl p-5 md:p-7">
      {/* header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="label-mono">{lang === "zh" ? "能力外化 · 时间轨" : "Externalized Capability · Timeline"}</p>
          <h3 className={`display mt-1 text-lg text-ghost-50 md:text-xl ${lang === "zh" ? "zh" : ""}`}>
            <T v={{ en: "A product is crystallized intention pushed out of the body", zh: "产品，是被推出身体之外的、结晶的意图" }} />
          </h3>
        </div>
        <button
          onClick={() => setPlaying((p) => !p)}
          className="rounded-full border border-signal-500/30 px-3 py-1 mono text-[0.7rem] text-signal-300 transition hover:border-signal-400 hover:text-signal-400"
          aria-pressed={playing}
        >
          {playing ? (lang === "zh" ? "⏸ 暂停" : "⏸ pause") : (lang === "zh" ? "▶ 自动" : "▶ auto")}
        </button>
      </div>

      <div className="mt-6 h-px rule-signal opacity-50" />

      {/* ============ THE RAIL ============ */}
      <div className="relative mt-7 overflow-x-auto pb-2">
        <div className="relative min-w-[640px] px-1">
          {/* the line */}
          <div className="absolute left-0 right-0 top-[10px] h-px bg-gradient-to-r from-amber-500/40 via-signal-500/40 to-iris-500/40" />
          <div className="relative flex justify-between">
            {CAPABILITY_ERAS.map((e, i) => {
              const on = i === active;
              return (
                <button
                  key={e.key}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => {
                    setActive(i);
                    setPlaying(false);
                  }}
                  className="group flex flex-col items-center"
                  style={{ width: `${100 / CAPABILITY_ERAS.length}%` }}
                  aria-pressed={on}
                >
                  {/* dot */}
                  <span
                    className="relative z-10 grid h-[21px] w-[21px] place-items-center rounded-full border transition-all duration-300"
                    style={{
                      borderColor: on ? e.accent : "#232a3b",
                      background: on ? e.accent : "#0a0c11",
                      boxShadow: on ? `0 0 14px ${e.accent}aa` : "none",
                    }}
                  >
                    <span
                      className="h-[7px] w-[7px] rounded-full transition-all duration-300"
                      style={{ background: on ? "#06070a" : "#596174" }}
                    />
                  </span>
                  {/* era tick */}
                  <span
                    className="mono mt-2 text-[0.58rem] tracking-tight transition-colors"
                    style={{ color: on ? e.accent : "#596174" }}
                  >
                    <T v={e.era} />
                  </span>
                  {/* name */}
                  <span
                    className={`mt-0.5 text-center text-[0.62rem] leading-tight transition-colors ${lang === "zh" ? "zh" : ""}`}
                    style={{ color: on ? "#f6f8fc" : "#8c95a8" }}
                  >
                    <T v={e.name} />
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ============ DETAIL PANEL ============ */}
      <div
        key={sel.key}
        className="rise-in mt-5 rounded-xl border bg-ink-900/60 p-5"
        style={{ borderColor: `${sel.accent}55` }}
      >
        <div className="flex flex-wrap items-center gap-3">
          <span
            className="grid h-9 w-9 place-items-center rounded-md border mono text-[0.7rem]"
            style={{ borderColor: `${sel.accent}66`, color: sel.accent }}
          >
            {String(active + 1).padStart(2, "0")}
          </span>
          <span className={`display text-xl text-ghost-50 ${lang === "zh" ? "zh" : ""}`}>
            <T v={sel.name} />
          </span>
          <span className="mono text-[0.7rem] text-ghost-500"><T v={sel.era} /></span>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-ghost-200">
          <span className="label-mono mr-2 align-middle" style={{ color: sel.accent }}>
            {lang === "zh" ? "外化了" : "externalizes"}
          </span>
          <span className={lang === "zh" ? "zh" : ""}>
            <T v={sel.externalizes} />
          </span>
        </p>
      </div>

      <div className="mt-8 h-px rule-signal opacity-40" />

      {/* ============ EXTERNALIZATION MAP ============ */}
      <p className="label-mono mt-7">{lang === "zh" ? "外化图谱 · 人 → 产品" : "Externalization Map · Human → Product"}</p>
      <h4 className={`display mt-1 text-base text-ghost-100 ${lang === "zh" ? "zh" : ""}`}>
        <T v={{ en: "Six faculties, pushed out of the body and frozen into things", zh: "六种官能，被推出身体，冻结为物" }} />
      </h4>

      <div className="mt-5 space-y-3">
        {EXTERNALIZATIONS.map((x) => (
          <div
            key={x.faculty.en}
            className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-lg border border-ink-600/60 bg-ink-900/40 p-3 transition-colors hover:border-ink-600 md:gap-5"
          >
            {/* human faculty (left) */}
            <div className="text-right">
              <span
                className={`block text-sm font-medium ${lang === "zh" ? "zh" : "display"}`}
                style={{ color: x.accent }}
              >
                <T v={x.faculty} />
              </span>
              <span className="mono text-[0.58rem] uppercase tracking-wider text-ghost-500">
                {lang === "zh" ? "人体" : "the body"}
              </span>
            </div>

            {/* the act of externalizing (middle) */}
            <div className="relative flex w-20 items-center justify-center md:w-32">
              <span
                className="absolute inset-x-0 top-1/2 h-px flow"
                style={{
                  background: `repeating-linear-gradient(to right, ${x.accent} 0 5px, transparent 5px 11px)`,
                  opacity: 0.7,
                }}
              />
              <span
                className="relative z-10 grid h-5 w-5 place-items-center rounded-full border"
                style={{ borderColor: x.accent, background: "#0a0c11", color: x.accent }}
              >
                <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M2 6h7M6 3l3 3-3 3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </div>

            {/* product (right) */}
            <div>
              <span className={`block text-sm text-ghost-50 ${lang === "zh" ? "zh" : ""}`}>
                <T v={x.product} />
              </span>
              <span className="block text-[0.68rem] leading-snug text-ghost-300">
                <T v={x.gloss} />
              </span>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-5 text-center text-[0.7rem] italic text-ghost-500">
        <T v={{ en: "Each arrow is the same gesture: a recurring problem, frozen into a transferable form.", zh: "每一支箭，都是同一个动作：一个反复出现的问题，被冻结为一种可转移的形态。" }} />
      </p>
    </div>
  );
}
