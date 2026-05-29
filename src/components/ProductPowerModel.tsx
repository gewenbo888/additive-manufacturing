"use client";

import { T, useLang } from "./lang";
import { CAPACITIES } from "./content";

const SERIES = [
  { key: "craft" as const, label: { en: "Handmade", zh: "手工" }, color: "#f5a623" },
  { key: "industrial" as const, label: { en: "Industrial", zh: "工业" }, color: "#3d8bfd" },
  { key: "ai" as const, label: { en: "AI-native", zh: "AI 原生" }, color: "#9b6dff" },
];

export default function ProductPowerModel() {
  const { lang } = useLang();
  return (
    <div className="holo rounded-2xl p-5 md:p-8">
      {/* the formula */}
      <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-3 text-center">
        <span className="display text-xl text-ghost-50 md:text-2xl">{lang === "zh" ? "产品力" : "Product Power"}</span>
        <span className="display text-xl text-signal-400 md:text-2xl">=</span>
        {CAPACITIES.map((c, i) => (
          <span key={c.sym} className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-md border border-signal-500/30 bg-ink-900 mono text-signal-300">{c.sym}</span>
            {i < CAPACITIES.length - 1 && <span className="signal-text display text-lg">+</span>}
          </span>
        ))}
      </div>
      <p className="mx-auto mt-4 max-w-2xl text-center text-xs leading-relaxed text-ghost-300">
        <T v={{
          en: "A working definition: a product's power is not any one term but the sum of eight — how precisely it maps a need, how much useful work it does, how elegantly it meets the human, how deeply it integrates into behavior, how much leverage it commands, how far it scales, how much it compresses, and how much it lets people coordinate. Every product revolution is a jump in one or more of these terms.",
          zh: "一个可操作的定义：一个产品的力量，不在于任何单一项，而在于八项之和——它多么精确地映射需求、它做了多少有用的功、它多么优雅地与人相遇、它多么深地整合进行为、它调遣多大杠杆、它扩展多远、它压缩多少，以及它让人们协调了多少。每一次产品革命，都是其中一项或数项的跳跃。",
        }} />
      </p>

      <div className="mt-7 h-px rule-signal opacity-50" />

      {/* legend */}
      <div className="mt-6 mb-4 flex flex-wrap justify-center gap-5">
        {SERIES.map((s) => (
          <span key={s.key} className="flex items-center gap-2 text-sm text-ghost-200">
            <span className="h-3 w-3 rounded-sm" style={{ background: s.color }} /><T v={s.label} />
          </span>
        ))}
      </div>

      {/* grouped capacity bars */}
      <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
        {CAPACITIES.map((c) => (
          <div key={c.sym}>
            <div className="flex items-baseline justify-between gap-3">
              <span className={`text-sm text-ghost-100 ${lang === "zh" ? "zh" : "display"}`}>
                <span className="mono mr-2 text-signal-400">{c.sym}</span><T v={c.name} />
              </span>
              <span className="text-[0.68rem] text-ghost-300"><T v={c.gloss} /></span>
            </div>
            <div className="mt-2 space-y-1">
              {SERIES.map((s) => (
                <div key={s.key} className="flex items-center gap-2">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink-700">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${c[s.key]}%`, background: s.color, boxShadow: `0 0 8px ${s.color}66` }} />
                  </div>
                  <span className="mono tnum w-7 text-right text-[0.6rem] text-ghost-300">{c[s.key]}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
