"use client";

import { useState } from "react";
import { T, useLang } from "./lang";
import { PRODUCTION_ERAS, SUPPLY_STAGES } from "./content";

// chart geometry
const W = 720;
const H = 300;
const PAD = { t: 24, r: 24, b: 48, l: 44 };
const PLOT_W = W - PAD.l - PAD.r;
const PLOT_H = H - PAD.t - PAD.b;

const n = PRODUCTION_ERAS.length;
const x = (i: number) => PAD.l + (PLOT_W * i) / (n - 1);
const y = (v: number) => PAD.t + PLOT_H * (1 - v / 100);

function path(values: number[]) {
  return values.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
}
function area(values: number[]) {
  const top = values.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  return `${top} L${x(n - 1).toFixed(1)},${(PAD.t + PLOT_H).toFixed(1)} L${x(0).toFixed(1)},${(PAD.t + PLOT_H).toFixed(1)} Z`;
}

const COST = "#f5a623"; // falling — amber/industrial
const VOL = "#3d8bfd"; // rising — signal blue

export default function IndustrialSystem() {
  const { lang } = useLang();
  const [sel, setSel] = useState(n - 1); // start on the AI / lights-out era
  const [stage, setStage] = useState<number | null>(null);

  const costs = PRODUCTION_ERAS.map((e) => e.cost);
  const vols = PRODUCTION_ERAS.map((e) => e.volume);
  const era = PRODUCTION_ERAS[sel];

  return (
    <div className="holo rounded-2xl p-5 md:p-8">
      <div className="label-mono mb-2">{lang === "zh" ? "工业系统" : "Industrial System"}</div>
      <p className="max-w-2xl text-sm leading-relaxed text-ghost-300">
        <T v={{
          en: "From the unique object made by a master to the identical object made by a system. As production industrialized, unit cost fell and output volume rose — the great inversion that rewired civilization.",
          zh: "从大师制作的唯一之物，到系统制造的同一之物。随着生产工业化，单位成本下落，产出体量上升——这场重新接线了文明的大倒置。",
        }} />
      </p>

      {/* legend */}
      <div className="mt-5 flex flex-wrap items-center gap-5">
        <span className="flex items-center gap-2 text-xs text-ghost-200">
          <span className="h-3 w-3 rounded-sm" style={{ background: COST }} />
          <T v={{ en: "Unit cost (falling)", zh: "单位成本（下落）" }} />
        </span>
        <span className="flex items-center gap-2 text-xs text-ghost-200">
          <span className="h-3 w-3 rounded-sm" style={{ background: VOL }} />
          <T v={{ en: "Output volume (rising)", zh: "产出体量（上升）" }} />
        </span>
      </div>

      {/* dual-series chart */}
      <div className="mt-4 overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[560px]" role="img" aria-label="Production eras: cost vs volume">
          <defs>
            <linearGradient id="costFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={COST} stopOpacity="0.22" />
              <stop offset="100%" stopColor={COST} stopOpacity="0" />
            </linearGradient>
            <linearGradient id="volFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={VOL} stopOpacity="0.22" />
              <stop offset="100%" stopColor={VOL} stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* gridlines */}
          {[0, 25, 50, 75, 100].map((g) => (
            <g key={g}>
              <line x1={PAD.l} x2={W - PAD.r} y1={y(g)} y2={y(g)} stroke="#232a3b" strokeWidth={1} />
              <text x={PAD.l - 8} y={y(g) + 3} textAnchor="end" className="mono" fontSize="9" fill="#596174">{g}</text>
            </g>
          ))}

          {/* areas + lines */}
          <path d={area(vols)} fill="url(#volFill)" />
          <path d={area(costs)} fill="url(#costFill)" />
          <path d={path(vols)} fill="none" stroke={VOL} strokeWidth={2} strokeLinejoin="round" />
          <path d={path(costs)} fill="none" stroke={COST} strokeWidth={2} strokeLinejoin="round" />

          {/* selected vertical guide */}
          <line x1={x(sel)} x2={x(sel)} y1={PAD.t} y2={PAD.t + PLOT_H} stroke="#3d8bfd" strokeWidth={1} strokeDasharray="3 4" opacity={0.5} />

          {/* points + hit targets */}
          {PRODUCTION_ERAS.map((e, i) => {
            const active = i === sel;
            return (
              <g key={e.key} className="cursor-pointer" onClick={() => setSel(i)} onMouseEnter={() => setSel(i)}>
                {/* invisible wide hit column */}
                <rect x={x(i) - PLOT_W / (n - 1) / 2} y={PAD.t} width={PLOT_W / (n - 1)} height={PLOT_H} fill="transparent" />
                <circle cx={x(i)} cy={y(e.volume)} r={active ? 5 : 3} fill={VOL} stroke="#0a0c11" strokeWidth={active ? 2 : 0} />
                <circle cx={x(i)} cy={y(e.cost)} r={active ? 5 : 3} fill={COST} stroke="#0a0c11" strokeWidth={active ? 2 : 0} />
                {active && (
                  <>
                    <circle cx={x(i)} cy={y(e.volume)} r={9} fill="none" stroke={VOL} strokeWidth={1} opacity={0.5} />
                    <circle cx={x(i)} cy={y(e.cost)} r={9} fill="none" stroke={COST} strokeWidth={1} opacity={0.5} />
                  </>
                )}
                {/* x label */}
                <text
                  x={x(i)}
                  y={H - PAD.b + 18}
                  textAnchor="middle"
                  className="mono"
                  fontSize="9"
                  fill={active ? "#a8d3ff" : "#596174"}
                >
                  {i + 1}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* detail panel for selected era */}
      <div className="mt-4 rounded-xl border bg-ink-900/60 p-4" style={{ borderColor: `${era.accent}40` }}>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div className="flex items-baseline gap-3">
            <span className="mono tnum text-lg" style={{ color: era.accent }}>{String(sel + 1).padStart(2, "0")}</span>
            <span className={`text-base text-ghost-50 ${lang === "zh" ? "zh" : "display"}`}><T v={era.name} /></span>
            <span className="mono text-[0.7rem] text-ghost-300"><T v={era.era} /></span>
          </div>
          <div className="flex gap-4 text-[0.7rem]">
            <span className="amber-text">{lang === "zh" ? "成本" : "cost"} <span className="mono tnum">{era.cost}</span></span>
            <span className="signal-text">{lang === "zh" ? "体量" : "volume"} <span className="mono tnum">{era.volume}</span></span>
          </div>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-ghost-200"><T v={era.gloss} /></p>
      </div>

      <div className="mt-7 h-px rule-signal opacity-40" />

      {/* supply chain flow */}
      <div className="mt-6">
        <div className="label-mono mb-2">{lang === "zh" ? "全球供应链" : "The global supply chain"}</div>
        <p className="mb-4 max-w-2xl text-xs leading-relaxed text-ghost-300">
          <T v={{
            en: "A phone is the cooperative output of thousands of factories that will never coordinate by conversation. Hover a node to follow the chain.",
            zh: "一部手机，是数千家永不会以交谈来协调的工厂之协作产出。悬停一个节点，沿着这条链走下去。",
          }} />
        </p>

        <div className="overflow-x-auto">
          <svg viewBox="0 0 720 96" className="w-full min-w-[640px]" role="img" aria-label="Supply chain flow">
            {SUPPLY_STAGES.map((s, i) => {
              const cx = 50 + (620 * i) / (SUPPLY_STAGES.length - 1);
              const next = i < SUPPLY_STAGES.length - 1 ? 50 + (620 * (i + 1)) / (SUPPLY_STAGES.length - 1) : null;
              const active = stage === i;
              return (
                <g key={s.name.en}>
                  {next !== null && (
                    <line
                      className="flow"
                      x1={cx + 16}
                      y1={40}
                      x2={next - 16}
                      y2={40}
                      stroke={s.accent}
                      strokeWidth={2}
                      strokeDasharray="6 6"
                      opacity={0.7}
                    />
                  )}
                  <g className="cursor-pointer" onMouseEnter={() => setStage(i)} onMouseLeave={() => setStage(null)} onClick={() => setStage(active ? null : i)}>
                    <circle cx={cx} cy={40} r={active ? 15 : 12} fill="#0a0c11" stroke={s.accent} strokeWidth={active ? 2.5 : 1.5} />
                    <circle cx={cx} cy={40} r={5} fill={s.accent} opacity={active ? 1 : 0.7} />
                    {active && <circle cx={cx} cy={40} r={20} fill="none" stroke={s.accent} strokeWidth={1} opacity={0.4} />}
                    <text x={cx} y={78} textAnchor="middle" className={lang === "zh" ? "zh" : "mono"} fontSize={lang === "zh" ? "11" : "9"} fill={active ? "#e8ecf4" : "#8c95a8"}>
                      {s.name[lang]}
                    </text>
                  </g>
                </g>
              );
            })}
          </svg>
        </div>

        {/* node detail */}
        <div className="mt-2 min-h-[2.5rem] rounded-lg border border-signal-500/20 bg-ink-900/50 px-4 py-3">
          {stage === null ? (
            <p className="text-xs text-ghost-500">
              <T v={{ en: "Hover or tap a stage to reveal what happens there.", zh: "悬停或点击一个阶段，揭示那里发生了什么。" }} />
            </p>
          ) : (
            <p className="text-xs leading-relaxed text-ghost-200">
              <span className="mono mr-2" style={{ color: SUPPLY_STAGES[stage].accent }}>
                {String(stage + 1).padStart(2, "0")}
              </span>
              <span className={`mr-2 ${lang === "zh" ? "zh" : "display"} text-ghost-50`}>
                <T v={SUPPLY_STAGES[stage].name} />
              </span>
              — <T v={SUPPLY_STAGES[stage].gloss} />
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
