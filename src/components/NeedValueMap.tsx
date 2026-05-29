"use client";

import { useState } from "react";
import { T, useLang } from "./lang";
import { NEED_TIERS, VALUE_TERMS } from "./content";

export default function NeedValueMap() {
  const { lang } = useLang();

  // base→top in data; render top→base so survival sits at the bottom.
  const reversed = [...NEED_TIERS].slice().reverse();
  const [active, setActive] = useState(NEED_TIERS.length - 1); // index into NEED_TIERS; default = survival (base)
  const sel = NEED_TIERS[active];

  // value sliders, keyed by symbol
  const [vals, setVals] = useState<Record<string, number>>({ B: 70, P: 30, F: 25 });
  const benefit = vals.B;
  const price = vals.P;
  const friction = vals.F;
  const value = benefit - price - friction; // -200 .. 100

  // map value to a 0..100 fill of the meter (centered at 50 = zero)
  const fill = Math.max(0, Math.min(100, 50 + value / 2));

  const readout: { en: string; zh: string } =
    value <= -40
      ? { en: "no one crosses this bridge", zh: "没有人会跨过这座桥" }
      : value < 0
      ? { en: "the cost outweighs the crossing", zh: "代价压过了跨越本身" }
      : value < 25
      ? { en: "a bridge few will bother to cross", zh: "一座少有人愿意跨越的桥" }
      : value < 55
      ? { en: "a bridge worth crossing", zh: "一座值得跨越的桥" }
      : { en: "an irresistible bridge", zh: "一座无法抗拒的桥" };

  const valColor = value < 0 ? "#f5a623" : value < 25 ? "#6fb2ff" : "#2fd4a8";

  return (
    <div className="holo rounded-2xl p-5 md:p-7">
      <div className="grid gap-8 lg:grid-cols-[1.05fr_1fr]">
        {/* ============ NEED LADDER ============ */}
        <div>
          <p className="label-mono">{lang === "zh" ? "需求阶梯 · 基础 → 顶端" : "The Ladder of Need · Base → Top"}</p>
          <h3 className={`display mt-1 text-lg text-ghost-50 md:text-xl ${lang === "zh" ? "zh" : ""}`}>
            <T v={{ en: "Every product bridges a gap between lack and fulfillment", zh: "每个产品，都架桥于「匮乏」与「满足」之间" }} />
          </h3>

          <div className="mt-5 space-y-2">
            {reversed.map((tier) => {
              const idx = NEED_TIERS.indexOf(tier);
              const on = idx === active;
              // width grows toward the base (survival widest) — a pyramid silhouette
              const tierPos = NEED_TIERS.indexOf(tier); // 0=survival .. 5=meaning
              const width = 100 - tierPos * 9;
              return (
                <button
                  key={tier.key}
                  onMouseEnter={() => setActive(idx)}
                  onClick={() => setActive(idx)}
                  className="block w-full text-left"
                  aria-pressed={on}
                  style={{ width: `${width}%`, marginLeft: `${(100 - width) / 2}%` }}
                >
                  <div
                    className="flex items-center justify-between rounded-lg border px-4 py-3 transition-all duration-300"
                    style={{
                      borderColor: on ? tier.accent : "#232a3b",
                      background: on ? `${tier.accent}1f` : "rgba(16,19,27,0.5)",
                      boxShadow: on ? `0 0 18px ${tier.accent}33` : "none",
                    }}
                  >
                    <span
                      className={`text-sm font-medium ${lang === "zh" ? "zh" : "display"}`}
                      style={{ color: on ? tier.accent : "#c2cad8" }}
                    >
                      <T v={tier.level} />
                    </span>
                    <span className="mono text-[0.58rem] text-ghost-500">
                      {tierPos === 0 ? (lang === "zh" ? "基础" : "base") : tierPos === NEED_TIERS.length - 1 ? (lang === "zh" ? "顶端" : "top") : `0${tierPos + 1}`}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* tier detail */}
          <div
            key={sel.key}
            className="rise-in mt-4 rounded-xl border bg-ink-900/60 p-4"
            style={{ borderColor: `${sel.accent}55` }}
          >
            <div className="text-sm text-ghost-100">
              <span className="label-mono mr-2" style={{ color: sel.accent }}>{lang === "zh" ? "需求" : "the need"}</span>
              <span className={lang === "zh" ? "zh" : ""}><T v={sel.need} /></span>
            </div>
            <div className="mt-2 text-sm text-ghost-200">
              <span className="label-mono mr-2 text-ghost-500">{lang === "zh" ? "它所回应的匮乏" : "the lack it answers"}</span>
              <span className={`italic ${lang === "zh" ? "zh" : ""}`}><T v={sel.lack} /></span>
            </div>
            <div className="mt-3 border-t border-ink-600/60 pt-3 text-sm">
              <span className="label-mono mr-2 text-ghost-500">{lang === "zh" ? "架桥之物" : "bridges"}</span>
              <span className="text-ghost-50"><T v={sel.products} /></span>
            </div>
          </div>
        </div>

        {/* ============ VALUE EQUATION ============ */}
        <div>
          <p className="label-mono">{lang === "zh" ? "价值方程 · 实时" : "The Value Equation · Live"}</p>

          {/* the equation */}
          <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-2 rounded-lg border border-ink-600/60 bg-ink-900/50 px-4 py-3">
            <span className="display text-sm text-ghost-50">{lang === "zh" ? "价值" : "Value"}</span>
            <span className="display text-sm text-signal-400">=</span>
            {VALUE_TERMS.map((term, i) => (
              <span key={term.sym} className="flex items-center gap-1.5">
                {i > 0 && (
                  <span className="display text-sm" style={{ color: VALUE_TERMS[i].accent }}>{term.sign}</span>
                )}
                <span
                  className="grid h-7 w-7 place-items-center rounded-md border mono text-[0.7rem]"
                  style={{ borderColor: `${term.accent}66`, color: term.accent }}
                >
                  {term.sym}
                </span>
              </span>
            ))}
          </div>

          {/* sliders */}
          <div className="mt-5 space-y-5">
            {VALUE_TERMS.map((term) => (
              <div key={term.sym}>
                <div className="flex items-baseline justify-between">
                  <label className="flex items-center gap-2 text-sm text-ghost-100">
                    <span className="mono" style={{ color: term.accent }}>{term.sym}</span>
                    <span className={lang === "zh" ? "zh" : ""}><T v={term.name} /></span>
                    <span className="mono text-[0.62rem]" style={{ color: term.accent }}>{term.sign}</span>
                  </label>
                  <span className="mono tnum text-sm" style={{ color: term.accent }}>{vals[term.sym]}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={vals[term.sym]}
                  onChange={(e) => setVals((v) => ({ ...v, [term.sym]: Number(e.target.value) }))}
                  className="mt-2 w-full cursor-pointer appearance-none"
                  style={{ accentColor: term.accent }}
                  aria-label={term.name[lang]}
                />
                <p className="mt-1 text-[0.66rem] leading-snug text-ghost-500">
                  <T v={term.gloss} />
                </p>
              </div>
            ))}
          </div>

          {/* the live value meter */}
          <div className="mt-6 rounded-xl border border-ink-600/60 bg-ink-900/60 p-4">
            <div className="flex items-baseline justify-between">
              <span className="label-mono text-ghost-500">{lang === "zh" ? "净价值" : "net value"}</span>
              <span className="display tnum text-2xl" style={{ color: valColor }}>
                {value > 0 ? "+" : ""}{value}
              </span>
            </div>
            {/* meter with a zero marker at the center */}
            <div className="relative mt-3 h-3 overflow-hidden rounded-full bg-ink-700">
              {/* zero line */}
              <span className="absolute left-1/2 top-0 z-10 h-full w-px -translate-x-1/2 bg-ghost-500/50" />
              {value >= 0 ? (
                <div
                  className="absolute left-1/2 top-0 h-full rounded-r-full transition-all duration-300"
                  style={{ width: `${fill - 50}%`, background: valColor, boxShadow: `0 0 10px ${valColor}88` }}
                />
              ) : (
                <div
                  className="absolute top-0 h-full rounded-l-full transition-all duration-300"
                  style={{ right: "50%", width: `${50 - fill}%`, background: valColor, boxShadow: `0 0 10px ${valColor}88` }}
                />
              )}
            </div>
            <p className="mt-3 text-center text-sm" style={{ color: valColor }}>
              <span className={lang === "zh" ? "zh" : ""}>
                {value >= 0
                  ? (lang === "zh" ? "净价值为正 —— " : "value is positive — ")
                  : (lang === "zh" ? "净价值为负 —— " : "value is negative — ")}
                <T v={readout} />
              </span>
            </p>
          </div>

          <p className="mt-4 text-[0.7rem] italic leading-relaxed text-ghost-500">
            <T v={{ en: "Value is the felt distance between where a person is and where they ache to be — minus everything it costs to cross.", zh: "价值，是一个人「所在之处」与「所渴望抵达之处」之间被感受到的距离——再减去跨越它所需的一切代价。" }} />
          </p>
        </div>
      </div>
    </div>
  );
}
