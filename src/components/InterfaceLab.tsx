"use client";

import { useState } from "react";
import { T, useLang } from "./lang";
import { DESIGN_PRINCIPLES, DESIGN_DISCIPLINES } from "./content";

export default function InterfaceLab() {
  const { lang } = useLang();
  // true = good design (the interface disappears); false = bad design (friction)
  const [good, setGood] = useState(true);

  return (
    <div className="holo rounded-2xl p-5 md:p-8">
      {/* header + master toggle */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="label-mono mb-2">{lang === "zh" ? "界面实验台" : "Interface Lab"}</div>
          <p className="max-w-xl text-sm leading-relaxed text-ghost-300">
            <T v={{
              en: "Great design makes the interface disappear. Flip the switch and watch the same six principles turn confusion into effortlessness.",
              zh: "卓越的设计让界面消失。拨动开关，看同样的六条原则，如何把困惑变为毫不费力。",
            }} />
          </p>
        </div>

        {/* the real animated toggle */}
        <div className="flex flex-shrink-0 items-center gap-3 self-start sm:self-end">
          <button
            onClick={() => setGood(false)}
            aria-pressed={!good}
            className={`mono text-[0.7rem] uppercase tracking-wider transition ${!good ? "text-amber-400" : "text-ghost-500 hover:text-ghost-300"}`}
          >
            {lang === "zh" ? "糟糕设计" : "Bad design"}
          </button>
          <button
            onClick={() => setGood((g) => !g)}
            role="switch"
            aria-checked={good}
            aria-label="Toggle design quality"
            className="relative h-8 w-16 flex-shrink-0 rounded-full border transition-colors duration-500"
            style={{
              borderColor: good ? "rgba(47,212,168,0.5)" : "rgba(245,166,35,0.5)",
              background: good ? "rgba(47,212,168,0.15)" : "rgba(245,166,35,0.12)",
            }}
          >
            <span
              className="absolute top-1 h-6 w-6 rounded-full transition-all duration-500"
              style={{
                left: good ? "calc(100% - 1.75rem)" : "0.25rem",
                background: good ? "#5fe3c0" : "#ffbe52",
                boxShadow: `0 0 12px ${good ? "#2fd4a8aa" : "#f5a62399"}`,
              }}
            />
          </button>
          <button
            onClick={() => setGood(true)}
            aria-pressed={good}
            className={`mono text-[0.7rem] uppercase tracking-wider transition ${good ? "text-mint-400" : "text-ghost-500 hover:text-ghost-300"}`}
          >
            {lang === "zh" ? "良好设计" : "Good design"}
          </button>
        </div>
      </div>

      <div className="mt-6 h-px rule-signal opacity-50" />

      {/* status line */}
      <div className="mt-5 flex items-center gap-2 text-xs">
        <span
          className={`h-2 w-2 rounded-full ${good ? "pulse" : ""}`}
          style={{ background: good ? "#2fd4a8" : "#f5a623" }}
        />
        <span className={good ? "mint-text" : "amber-text"}>
          {good ? (
            <T v={{ en: "The seam between person and tool has vanished.", zh: "人与工具之间的那道接缝，消失了。" }} />
          ) : (
            <T v={{ en: "The human is forced to adapt to the machine.", zh: "人，被迫去适应机器。" }} />
          )}
        </span>
      </div>

      {/* the 6 principle cards */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {DESIGN_PRINCIPLES.map((p) => {
          const accent = good ? p.accent : "#f5a623";
          return (
            <div
              key={p.key}
              className={`relative overflow-hidden rounded-xl border bg-ink-900/60 p-4 transition-all duration-500 ${good ? "" : "jitter"}`}
              style={{
                borderColor: good ? `${accent}40` : "rgba(245,166,35,0.4)",
                boxShadow: good ? `inset 0 0 24px ${accent}10` : "none",
              }}
            >
              {/* accent rail */}
              <span
                className="absolute inset-y-0 left-0 w-0.5 transition-colors duration-500"
                style={{ background: accent, opacity: good ? 0.9 : 0.6 }}
              />
              <div className="flex items-baseline justify-between gap-2">
                <span className={`text-sm text-ghost-100 ${lang === "zh" ? "zh" : "display"}`}>
                  <T v={p.name} />
                </span>
                <span
                  className="mono text-[0.6rem] uppercase tracking-wider"
                  style={{ color: accent }}
                >
                  {good ? (lang === "zh" ? "无形" : "invisible") : (lang === "zh" ? "摩擦" : "friction")}
                </span>
              </div>
              <p
                className="mt-3 text-xs leading-relaxed transition-colors duration-500"
                style={{ color: good ? "#e8ecf4" : "#ffd98c" }}
              >
                {good ? "✓ " : "✕ "}
                <T v={good ? p.good : p.bad} />
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-7 h-px rule-signal opacity-40" />

      {/* the 5 disciplines */}
      <div className="mt-6">
        <div className="label-mono mb-3">{lang === "zh" ? "设计的诸学科" : "Disciplines of design"}</div>
        <div className="flex flex-wrap gap-3">
          {DESIGN_DISCIPLINES.map((d) => (
            <div
              key={d.name.en}
              className="group flex-1 basis-[160px] rounded-lg border bg-ink-900/50 p-3 transition-colors"
              style={{ borderColor: `${d.accent}33` }}
            >
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ background: d.accent }} />
                <span className={`text-xs text-ghost-100 ${lang === "zh" ? "zh" : "display"}`}>
                  <T v={d.name} />
                </span>
              </div>
              <p className="mt-2 text-[0.7rem] leading-relaxed text-ghost-300">
                <T v={d.focus} />
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
