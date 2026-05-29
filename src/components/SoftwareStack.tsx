"use client";

import { useEffect, useRef, useState } from "react";
import { T, useLang } from "./lang";
import { SOFT_LAYERS } from "./content";

/**
 * Software as the operating layer of civilization. Seven slabs, silicon at the
 * BOTTOM and agents at the TOP — everything runs on the layer beneath it. Hover
 * or click a slab to expand its examples + gloss. "Send signal" fires a glowing
 * pulse that rises from the bottom slab to the top, lighting each layer in turn,
 * to make literal the claim that the whole stack runs on what is below it.
 */
export default function SoftwareStack() {
  const { lang } = useLang();
  const n = SOFT_LAYERS.length;
  // render top-to-bottom: agents (index n-1) first, silicon (index 0) last.
  const ordered = [...SOFT_LAYERS].slice().reverse();

  const [open, setOpen] = useState<number | null>(n - 1); // open the top (agents) by default
  // the pulse lights layer indices 0..n-1 (silicon→agents). -1 = no pulse.
  const [pulse, setPulse] = useState(-1);
  const [firing, setFiring] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const sendSignal = () => {
    if (firing) return;
    setFiring(true);
    setPulse(0);
  };

  // advance the pulse up the stack: 0 (silicon) → n-1 (agents) → off.
  useEffect(() => {
    if (!firing) return;
    timer.current = setInterval(() => {
      setPulse((p) => {
        if (p >= n - 1) {
          if (timer.current) clearInterval(timer.current);
          setFiring(false);
          return -1;
        }
        return p + 1;
      });
    }, 360);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [firing, n]);

  return (
    <div className="holo rounded-2xl p-5 md:p-7">
      {/* header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="label-mono">{lang === "zh" ? "软件栈 · 文明的操作层" : "Software Stack · The Operating Layer"}</p>
          <h3 className={`display mt-1 text-lg text-ghost-50 md:text-xl ${lang === "zh" ? "zh" : ""}`}>
            <T v={{ en: "Everything you do runs on the layer beneath it", zh: "你所做的一切，都运行在它下面的那一层之上" }} />
          </h3>
        </div>
        <button
          onClick={sendSignal}
          disabled={firing}
          className="rounded-full border border-signal-500/30 px-3.5 py-1.5 mono text-[0.7rem] text-signal-300 transition hover:border-signal-400 hover:text-signal-400 disabled:opacity-50"
          aria-pressed={firing}
        >
          {firing ? (lang === "zh" ? "信号上行…" : "signal rising…") : (lang === "zh" ? "▲ 发送信号" : "▲ send signal")}
        </button>
      </div>

      <div className="mt-6 h-px rule-signal opacity-50" />

      {/* ============ THE STACK ============ */}
      <div className="relative mt-7">
        {/* the spine the pulse travels up — sits behind the slabs */}
        <div className="pointer-events-none absolute left-1/2 top-2 bottom-2 z-0 w-px -translate-x-1/2 bg-gradient-to-t from-amber-500/30 via-signal-500/30 to-iris-500/40" />

        <div className="relative z-10 space-y-2.5">
          {ordered.map((layer, vis) => {
            // vis 0 = top (agents). map back to the data index (silicon=0).
            const idx = n - 1 - vis;
            const isOpen = open === idx;
            const lit = pulse === idx; // pulse currently passing through this layer
            const passed = firing && pulse > idx; // pulse has already lit + risen past
            const tierLabel =
              idx === 0
                ? lang === "zh" ? "基底 · 物理" : "base · physics"
                : idx === n - 1
                ? lang === "zh" ? "顶层 · 智能" : "top · intelligence"
                : `${lang === "zh" ? "层" : "layer"} ${String(idx + 1).padStart(2, "0")}`;

            return (
              <button
                key={layer.key}
                onMouseEnter={() => setOpen(idx)}
                onClick={() => setOpen(isOpen ? null : idx)}
                className="group block w-full rounded-xl border px-4 py-3 text-left transition-all duration-300"
                style={{
                  borderColor: lit ? layer.accent : isOpen ? `${layer.accent}66` : "rgba(168,211,255,0.10)",
                  background: lit
                    ? `${layer.accent}26`
                    : isOpen
                    ? `${layer.accent}12`
                    : passed
                    ? "rgba(168,211,255,0.04)"
                    : "rgba(10,12,17,0.55)",
                  boxShadow: lit ? `0 0 26px ${layer.accent}99, inset 0 0 18px ${layer.accent}33` : "none",
                  transform: lit ? "translateY(-2px) scale(1.012)" : "none",
                }}
                aria-expanded={isOpen}
              >
                <div className="flex items-center gap-3">
                  {/* accent node */}
                  <span
                    className="grid h-7 w-7 shrink-0 place-items-center rounded-md border transition-all duration-300"
                    style={{
                      borderColor: layer.accent,
                      background: lit || isOpen ? layer.accent : "#0a0c11",
                      boxShadow: lit ? `0 0 16px ${layer.accent}` : "none",
                    }}
                  >
                    <span
                      className="h-2 w-2 rounded-full transition-colors"
                      style={{ background: lit || isOpen ? "#06070a" : layer.accent }}
                    />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span
                      className={`block text-sm font-medium leading-tight ${lang === "zh" ? "zh" : "display"}`}
                      style={{ color: lit ? "#f6f8fc" : isOpen ? layer.accent : "#e8ecf4" }}
                    >
                      <T v={layer.name} />
                    </span>
                  </span>

                  <span className="mono shrink-0 text-[0.58rem] uppercase tracking-wider" style={{ color: lit ? layer.accent : "#596174" }}>
                    {tierLabel}
                  </span>
                </div>

                {/* expanded detail: examples + gloss */}
                <div
                  className="grid overflow-hidden transition-all duration-300"
                  style={{ gridTemplateRows: isOpen ? "1fr" : "0fr", opacity: isOpen ? 1 : 0 }}
                >
                  <div className="min-h-0">
                    <div className="mt-3 grid gap-1.5 border-t pt-3" style={{ borderColor: `${layer.accent}33` }}>
                      <div className="flex items-baseline gap-2">
                        <span className="label-mono shrink-0" style={{ color: layer.accent }}>
                          {lang === "zh" ? "例如" : "e.g."}
                        </span>
                        <span className={`text-[0.78rem] leading-snug text-ghost-100 ${lang === "zh" ? "zh" : ""}`}>
                          <T v={layer.examples} />
                        </span>
                      </div>
                      <p className={`text-[0.78rem] italic leading-snug text-ghost-300 ${lang === "zh" ? "zh" : ""}`}>
                        <T v={layer.gloss} />
                      </p>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* base label */}
      <p className="mt-5 text-center text-[0.7rem] italic text-ghost-500">
        <T
          v={{
            en: "Silicon at the base, autonomous agents at the top — software has quietly become the ground civilization stands on.",
            zh: "硅在基底，自主代理在顶层——软件已悄然成为文明赖以站立的地面。",
          }}
        />
      </p>
    </div>
  );
}
