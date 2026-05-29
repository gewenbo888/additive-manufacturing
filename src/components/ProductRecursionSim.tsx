"use client";

import { useEffect, useState } from "react";
import { RECURSION_LAYERS } from "./content";
import { T, useLang } from "./lang";

/**
 * The recursive engine. The same product-move — find a recurring problem, freeze
 * a solution into a transferable form, drive its cost and friction toward zero,
 * let it scale — re-emerges at every layer, from a stripped twig in one animal's
 * hand to a planet-spanning intelligence infrastructure. A rising signal lights
 * each layer in turn. The claim: a product is not many things. It is one
 * transformation, iterated.
 */
export default function ProductRecursionSim() {
  const { lang } = useLang();
  const n = RECURSION_LAYERS.length;
  const [step, setStep] = useState(n);
  const [play, setPlay] = useState(false);

  useEffect(() => {
    if (!play) return;
    const id = setInterval(() => setStep((s) => (s + 1) % (n + 1)), 850);
    return () => clearInterval(id);
  }, [play, n]);

  return (
    <div className="holo rounded-2xl p-5 md:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="label-mono">{lang === "zh" ? "递归产品引擎" : "recursive product engine"}</div>
          <h3 className={`mt-1 display text-2xl text-signal-300 ${lang === "zh" ? "zh" : ""}`}>
            <T v={{ en: "One move, every scale", zh: "同一个动作，每一种尺度" }} />
          </h3>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setPlay((p) => !p)} className="rounded-full border border-signal-500/40 px-3.5 py-1.5 mono text-[0.62rem] uppercase tracking-wider text-signal-300 transition hover:border-signal-400">
            {play ? (lang === "zh" ? "暂停" : "pause") : (lang === "zh" ? "运行模拟" : "run sim")}
          </button>
          <button onClick={() => { setPlay(false); setStep((s) => (s >= n ? 1 : s + 1)); }} className="rounded-full border border-mint-500/30 px-3.5 py-1.5 mono text-[0.62rem] uppercase tracking-wider text-mint-300 transition hover:border-mint-400">
            {lang === "zh" ? "单步 ▸" : "step ▸"}
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-2.5">
        {RECURSION_LAYERS.map((l, i) => {
          const lit = i < step;
          const cur = i === step - 1;
          return (
            <div
              key={l.k}
              className="grid grid-cols-[150px_1fr] items-center gap-3 rounded-lg border px-3 py-2.5 transition-all duration-500 sm:grid-cols-[210px_1fr_1.6fr]"
              style={{
                borderColor: lit ? l.color + "66" : "rgba(168,211,255,0.08)",
                background: cur ? l.color + "16" : lit ? "rgba(168,211,255,0.03)" : "transparent",
                opacity: lit ? 1 : 0.32,
              }}
            >
              <div className="flex items-center gap-2.5">
                <span className="mono text-[0.62rem] text-ghost-300">{String(i + 1).padStart(2, "0")}</span>
                <span className="h-2.5 w-2.5 shrink-0 rounded-full transition" style={{ background: lit ? l.color : "transparent", border: `2px solid ${l.color}`, boxShadow: cur ? `0 0 14px ${l.color}` : "none" }} />
                <span className={`display text-sm ${lang === "zh" ? "zh" : ""}`} style={{ color: lit ? l.color : "#596174" }}><T v={l.name} /></span>
              </div>
              <div className="mono text-[0.66rem] text-ghost-200"><T v={l.scale} /></div>
              <div className="text-sm leading-snug text-ghost-200">
                <span className="text-ghost-300">{lang === "zh" ? "产品在此：" : "product here: "}</span><T v={l.move} />
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-5 text-sm leading-relaxed text-ghost-300">
        <T v={{
          en: "Run it bottom to top. At each layer the object changes — a twig, a flint, a wheel-thrown jar, a stamped part, a branded good, an app, a platform, a feed, an adaptive interface, an agent, a planetary mesh — but the move is identical: find a recurring problem, freeze a solution into a transferable form, drive its cost and friction toward zero, and let it scale to everyone who shares the problem. A product is not eleven things. It is one transformation, recursing from a single clever gesture all the way up to a civilization that perceives and acts through the things it has made.",
          zh: "从下往上运行它。在每一层，物件都在变化——一根树枝、一块燧石、一只轮制的陶罐、一个冲压的零件、一件品牌商品、一个应用、一个平台、一条信息流、一个自适应界面、一个代理、一张行星级的网——但那个动作始终如一：找到一个反复出现的问题，把一个解法冻结为可转移的形态，把它的成本与摩擦推向零，再让它扩展到每一个共享这问题的人。产品，不是十一样东西。它是同一种转化，从一个聪明的手势，一路递归到一个借由它所造之物来感知、来行动的文明。",
        }} />
      </p>
    </div>
  );
}
