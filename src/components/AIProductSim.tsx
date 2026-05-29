"use client";

import { useEffect, useRef, useState } from "react";
import { T, useLang } from "./lang";
import { AUTONOMY_LEVELS } from "./content";

const MAX = AUTONOMY_LEVELS.length - 1; // 5

/** blend signal-blue → iris-violet as autonomy rises (0..1) */
function climbColor(frac: number) {
  const a = [61, 139, 253]; // signal-500 #3d8bfd
  const b = [155, 109, 255]; // iris-500 #9b6dff
  const m = a.map((c, i) => Math.round(c + (b[i] - c) * frac));
  return `rgb(${m[0]},${m[1]},${m[2]})`;
}

export default function AIProductSim() {
  const { lang } = useLang();
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cur = AUTONOMY_LEVELS[idx];
  const frac = idx / MAX;
  // "It decides" share grows with autonomy: L0≈5%, L5≈95%
  const itShare = Math.round(5 + frac * 90);
  const youShare = 100 - itShare;
  const blend = climbColor(frac);

  // auto-play: advance every 1.6s, stop at the top
  useEffect(() => {
    if (!playing) return;
    if (idx >= MAX) {
      setPlaying(false);
      return;
    }
    timer.current = setTimeout(() => setIdx((i) => Math.min(MAX, i + 1)), 1600);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [playing, idx]);

  const go = (n: number) => {
    setPlaying(false);
    setIdx(Math.max(0, Math.min(MAX, n)));
  };

  return (
    <div className="holo rounded-2xl p-5 md:p-7">
      <div className="flex flex-col gap-1">
        <span className="label-mono text-iris-400">SECTION 08 · AUTONOMY LADDER</span>
        <h3 className={`text-lg text-ghost-50 ${lang === "zh" ? "zh" : "display"}`}>
          <T v={{ en: "From Object to Actor", zh: "从物件到行动者" }} />
        </h3>
        <p className="max-w-2xl text-xs leading-relaxed text-ghost-300">
          <T
            v={{
              en: "Climb the ladder and the interface dissolves: you stop operating the product and start delegating to it. Control shifts from your hands to its judgment.",
              zh: "攀上这道阶梯，界面便溶解了：你不再操作产品，而开始把事情委托给它。控制权，从你的双手，转移到它的判断。",
            }}
          />
        </p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* LEFT: current level detail + control balance */}
        <div className="order-2 lg:order-1">
          {/* control balance — split bar that crossfades */}
          <div className="mb-5">
            <div className="mb-1.5 flex items-baseline justify-between text-[0.7rem]">
              <span className="mint-text mono">
                <T v={{ en: "You operate", zh: "你操作" }} /> · {youShare}%
              </span>
              <span className="iris-text mono">
                {itShare}% · <T v={{ en: "It decides", zh: "它决定" }} />
              </span>
            </div>
            <div className="flex h-6 overflow-hidden rounded-full bg-ink-800 ring-1 ring-ink-600">
              <div
                className="flex items-center justify-start pl-2 transition-all duration-700 ease-out"
                style={{
                  width: `${youShare}%`,
                  background: "linear-gradient(90deg,#2fd4a8,#5fe3c0)",
                }}
              >
                {youShare > 18 && (
                  <span className="mono text-[0.6rem] text-ink-950">HUMAN</span>
                )}
              </div>
              <div
                className="flex items-center justify-end pr-2 transition-all duration-700 ease-out"
                style={{
                  width: `${itShare}%`,
                  background: "linear-gradient(90deg,#6fb2ff,#9b6dff)",
                }}
              >
                {itShare > 18 && (
                  <span className="mono text-[0.6rem] text-ink-950">PRODUCT</span>
                )}
              </div>
            </div>
            <p className="mt-2 text-[0.65rem] leading-relaxed text-ghost-500">
              <T
                v={{
                  en: "The seam between person and tool fades as the bar tips right. At the top, the product perceives, decides, and acts with you out of the loop.",
                  zh: "当横条向右倾斜，人与工具之间的接缝渐渐消退。在顶端，产品自行感知、决策、行动，而你不在回路之中。",
                }}
              />
            </p>
          </div>

          {/* current level card */}
          <div
            key={cur.key}
            className="rise-in terminal rounded-xl p-5"
            style={{ borderColor: `${cur.accent}66` }}
          >
            <div className="flex items-center gap-3">
              <span
                className="grid h-10 w-10 place-items-center rounded-lg mono text-sm font-semibold"
                style={{
                  background: `${cur.accent}1f`,
                  color: cur.accent,
                  border: `1px solid ${cur.accent}66`,
                  boxShadow: `0 0 12px ${cur.accent}44`,
                }}
              >
                {cur.level}
              </span>
              <h4
                className={`text-xl text-ghost-50 ${lang === "zh" ? "zh" : "display"}`}
                style={{ color: cur.accent }}
              >
                <T v={cur.name} />
              </h4>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-ghost-100">
              <T v={cur.gloss} />
            </p>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="label-mono shrink-0 text-ghost-500">
                <T v={{ en: "e.g.", zh: "例如" }} />
              </span>
              <span className={`text-xs text-ghost-300 ${lang === "zh" ? "zh" : "mono"}`}>
                <T v={cur.example} />
              </span>
            </div>
          </div>

          {/* slider + controls */}
          <div className="mt-5">
            <input
              type="range"
              min={0}
              max={MAX}
              step={1}
              value={idx}
              onChange={(e) => go(Number(e.target.value))}
              aria-label="autonomy level"
              className="w-full cursor-pointer appearance-none rounded-full"
              style={{
                height: 6,
                background: `linear-gradient(90deg, ${blend} ${frac * 100}%, #181d29 ${frac * 100}%)`,
              }}
            />
            <div className="mt-3 flex items-center justify-between gap-2">
              <button
                onClick={() => go(idx - 1)}
                disabled={idx === 0}
                className="rounded-md border border-ink-600 px-3 py-1.5 text-xs text-ghost-200 transition hover:border-signal-500/50 hover:text-signal-300 disabled:opacity-30"
              >
                ‹ <T v={{ en: "Prev", zh: "上一级" }} />
              </button>
              <button
                onClick={() => {
                  if (idx >= MAX) {
                    setIdx(0);
                    setPlaying(true);
                  } else {
                    setPlaying((p) => !p);
                  }
                }}
                className="rounded-md border px-4 py-1.5 text-xs transition"
                style={{ borderColor: `${blend}88`, color: blend, background: `${blend}14` }}
              >
                {playing ? (
                  <T v={{ en: "❙❙ Pause", zh: "❙❙ 暂停" }} />
                ) : idx >= MAX ? (
                  <T v={{ en: "↻ Replay climb", zh: "↻ 重新攀登" }} />
                ) : (
                  <T v={{ en: "▶ Auto-climb", zh: "▶ 自动攀登" }} />
                )}
              </button>
              <button
                onClick={() => go(idx + 1)}
                disabled={idx === MAX}
                className="rounded-md border border-ink-600 px-3 py-1.5 text-xs text-ghost-200 transition hover:border-iris-500/50 hover:text-iris-300 disabled:opacity-30"
              >
                <T v={{ en: "Next", zh: "下一级" }} /> ›
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: vertical ladder (top = L5, climbed rungs lit below current) */}
        <div className="order-1 flex flex-col gap-1.5 lg:order-2">
          {[...AUTONOMY_LEVELS].reverse().map((lvl) => {
            const lvlIdx = AUTONOMY_LEVELS.indexOf(lvl);
            const isCur = lvlIdx === idx;
            const climbed = lvlIdx < idx; // rungs already passed
            const reachable = lvlIdx <= idx;
            return (
              <button
                key={lvl.key}
                onClick={() => go(lvlIdx)}
                aria-current={isCur}
                className="group flex items-center gap-3 rounded-lg border px-3 py-2 text-left transition"
                style={{
                  borderColor: isCur ? lvl.accent : reachable ? `${lvl.accent}40` : "rgba(35,42,59,0.8)",
                  background: isCur ? `${lvl.accent}1f` : climbed ? `${lvl.accent}0d` : "transparent",
                  opacity: reachable ? 1 : 0.45,
                }}
              >
                <span
                  className="mono text-xs font-semibold transition"
                  style={{ color: reachable ? lvl.accent : "#596174", width: 22 }}
                >
                  {lvl.level}
                </span>
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full transition"
                  style={{
                    background: isCur ? lvl.accent : climbed ? `${lvl.accent}88` : "transparent",
                    border: `1px solid ${reachable ? lvl.accent : "#596174"}`,
                    boxShadow: isCur ? `0 0 10px ${lvl.accent}` : "none",
                  }}
                />
                <span
                  className={`text-xs ${lang === "zh" ? "zh" : ""}`}
                  style={{ color: isCur ? "#f6f8fc" : reachable ? "#c2cad8" : "#596174" }}
                >
                  <T v={lvl.name} />
                </span>
              </button>
            );
          })}
          <p className="mt-2 px-1 text-[0.6rem] leading-relaxed text-ghost-500">
            <T
              v={{
                en: "Each lit rung is a step the product has climbed away from being a passive object.",
                zh: "每一格被点亮的横档，都是产品离「被动物件」更远的一步。",
              }}
            />
          </p>
        </div>
      </div>
    </div>
  );
}
