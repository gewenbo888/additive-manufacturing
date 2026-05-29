"use client";

import { useMemo, useState } from "react";
import { T, useLang } from "./lang";
import { ECON_AXES, MARKET_MODELS } from "./content";

/* polar geometry — pentagon radar over the 5 ECON_AXES */
const CX = 200;
const CY = 195;
const R = 130;
const N = ECON_AXES.length;
const RINGS = [0.25, 0.5, 0.75, 1];

/** angle for axis i — start at top (−90°), go clockwise */
function angle(i: number) {
  return -Math.PI / 2 + (i / N) * Math.PI * 2;
}
function point(i: number, frac: number) {
  const a = angle(i);
  return { x: CX + Math.cos(a) * R * frac, y: CY + Math.sin(a) * R * frac };
}
function ringPath(frac: number) {
  return (
    ECON_AXES.map((_, i) => {
      const p = point(i, frac);
      return `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    }).join(" ") + " Z"
  );
}

export default function MarketSystems() {
  const { lang } = useLang();
  // default a couple on: industrial + decentralized (the two extremes of concentration)
  const [active, setActive] = useState<Record<string, boolean>>({
    industrial: true,
    platform: false,
    ai: false,
    decentralized: true,
  });
  const [focus, setFocus] = useState<string>("industrial");

  const toggle = (key: string) =>
    setActive((a) => ({ ...a, [key]: !a[key] }));

  const focused = MARKET_MODELS.find((m) => m.key === focus) ?? MARKET_MODELS[0];

  // precompute each model's polygon path from its scores keyed by axis.key
  const paths = useMemo(() => {
    const map: Record<string, string> = {};
    for (const m of MARKET_MODELS) {
      map[m.key] =
        ECON_AXES.map((ax, i) => {
          const v = (m.scores[ax.key] ?? 0) / 100;
          const p = point(i, v);
          return `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`;
        }).join(" ") + " Z";
    }
    return map;
  }, []);

  return (
    <div className="holo rounded-2xl p-5 md:p-7">
      <div className="flex flex-col gap-1">
        <span className="label-mono text-signal-400">SECTION 07 · MARKET RADAR</span>
        <h3 className={`text-lg text-ghost-50 ${lang === "zh" ? "zh" : "display"}`}>
          <T v={{ en: "The Systems That Select Our Products", zh: "选择我们产品的那些系统" }} />
        </h3>
        <p className="max-w-2xl text-xs leading-relaxed text-ghost-300">
          <T
            v={{
              en: "Each economic system is a different search algorithm for which products survive. Compare them by trade-offs, not ideology — toggle the overlays to see how each scores across five axes.",
              zh: "每一种经济系统，都是一套不同的、决定哪些产品得以存活的搜索算法。以权衡而非意识形态来比较它们——切换叠加层，看看每一种如何在五条轴上得分。",
            }}
          />
        </p>
      </div>

      {/* toggle chips */}
      <div className="mt-5 flex flex-wrap gap-2">
        {MARKET_MODELS.map((m) => {
          const on = active[m.key];
          return (
            <button
              key={m.key}
              onClick={() => toggle(m.key)}
              onMouseEnter={() => setFocus(m.key)}
              onFocus={() => setFocus(m.key)}
              aria-pressed={on}
              className="group flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition"
              style={{
                borderColor: on ? m.accent : "rgba(140,149,168,0.25)",
                background: on ? `${m.accent}1f` : "transparent",
                color: on ? m.accent : "#8c95a8",
              }}
            >
              <span
                className="h-2.5 w-2.5 rounded-sm transition"
                style={{
                  background: on ? m.accent : "transparent",
                  border: `1px solid ${m.accent}`,
                  boxShadow: on ? `0 0 8px ${m.accent}88` : "none",
                }}
              />
              <span className={lang === "zh" ? "zh" : ""}>
                <T v={m.name} />
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-5 grid items-center gap-6 lg:grid-cols-[400px_1fr]">
        {/* RADAR */}
        <div className="mx-auto w-full max-w-[400px]">
          <svg viewBox="0 0 400 390" className="w-full" role="img" aria-label="economic systems radar">
            {/* pentagon rings */}
            {RINGS.map((f) => (
              <path
                key={f}
                d={ringPath(f)}
                fill="none"
                stroke="#232a3b"
                strokeWidth={1}
              />
            ))}
            {/* spokes */}
            {ECON_AXES.map((_, i) => {
              const p = point(i, 1);
              return (
                <line
                  key={i}
                  x1={CX}
                  y1={CY}
                  x2={p.x}
                  y2={p.y}
                  stroke="#232a3b"
                  strokeWidth={1}
                />
              );
            })}

            {/* model polygons */}
            {MARKET_MODELS.filter((m) => active[m.key]).map((m) => {
              const isFocus = m.key === focus;
              return (
                <path
                  key={m.key}
                  d={paths[m.key]}
                  fill={`${m.accent}${isFocus ? "33" : "1f"}`}
                  stroke={m.accent}
                  strokeWidth={isFocus ? 2.4 : 1.4}
                  strokeLinejoin="round"
                  style={{
                    filter: isFocus ? `drop-shadow(0 0 6px ${m.accent}aa)` : "none",
                    transition: "all .35s ease",
                  }}
                />
              );
            })}

            {/* vertices of focused model */}
            {active[focused.key] &&
              ECON_AXES.map((ax, i) => {
                const v = (focused.scores[ax.key] ?? 0) / 100;
                const p = point(i, v);
                return (
                  <circle
                    key={ax.key}
                    cx={p.x}
                    cy={p.y}
                    r={3}
                    fill={focused.accent}
                    stroke="#06070a"
                    strokeWidth={1}
                  />
                );
              })}

            {/* axis labels */}
            {ECON_AXES.map((ax, i) => {
              const p = point(i, 1.16);
              const a = angle(i);
              const anchor =
                Math.abs(Math.cos(a)) < 0.3
                  ? "middle"
                  : Math.cos(a) > 0
                  ? "start"
                  : "end";
              const label = ax.name[lang];
              return (
                <text
                  key={ax.key}
                  x={p.x}
                  y={p.y}
                  textAnchor={anchor}
                  dominantBaseline="middle"
                  className={lang === "zh" ? "zh" : ""}
                  fill="#c2cad8"
                  fontSize={11}
                >
                  {label}
                </text>
              );
            })}
          </svg>
        </div>

        {/* focused model panel */}
        <div
          key={focused.key}
          className="rise-in terminal rounded-xl p-5"
          style={{ borderColor: `${focused.accent}55` }}
        >
          <div className="flex items-baseline justify-between gap-3">
            <h4
              className={`text-base text-ghost-50 ${lang === "zh" ? "zh" : "display"}`}
              style={{ color: focused.accent }}
            >
              <T v={focused.name} />
            </h4>
            <span className="label-mono text-ghost-300">
              <T v={focused.era} />
            </span>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-ghost-200">
            <T v={focused.gloss} />
          </p>

          <div className="my-4 h-px rule-signal opacity-40" />

          {/* per-axis score bars for focus */}
          <div className="space-y-2.5">
            {ECON_AXES.map((ax) => {
              const v = focused.scores[ax.key] ?? 0;
              return (
                <div key={ax.key} className="flex items-center gap-3">
                  <span className={`w-32 shrink-0 text-[0.7rem] text-ghost-300 ${lang === "zh" ? "zh" : ""}`}>
                    <T v={ax.name} />
                  </span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink-700">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${v}%`,
                        background: focused.accent,
                        boxShadow: `0 0 6px ${focused.accent}66`,
                      }}
                    />
                  </div>
                  <span className="mono tnum w-7 text-right text-[0.6rem] text-ghost-300">{v}</span>
                </div>
              );
            })}
          </div>

          <p className="mt-4 text-[0.65rem] leading-relaxed text-ghost-500">
            <T
              v={{
                en: "Higher is not always better: high concentration or lock-in concentrates power, high externalities hide their cost. Read the shape, not a single number.",
                zh: "更高未必更好：高集中或高锁定会集中权力，高外部性则藏起其代价。读那个形状，而非任何单一数字。",
              }}
            />
          </p>
        </div>
      </div>
    </div>
  );
}
