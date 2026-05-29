"use client";

import { useMemo, useState } from "react";
import { T, useLang } from "./lang";
import {
  ANALYST_LENSES,
  ANALYST_TOPICS,
  type AnalystLens,
  type AnalystTopic,
} from "./content";

/** Lens lookup by key, built once. */
const LENS_BY_KEY: Record<string, AnalystLens> = ANALYST_LENSES.reduce(
  (acc, l) => {
    acc[l.key] = l;
    return acc;
  },
  {} as Record<string, AnalystLens>
);

export default function ProductAnalyst() {
  const { lang } = useLang();
  const [topicKey, setTopicKey] = useState<string>(ANALYST_TOPICS[0].key);
  const [focusLens, setFocusLens] = useState<string | null>(null);

  const topic: AnalystTopic = useMemo(
    () => ANALYST_TOPICS.find((t) => t.key === topicKey) ?? ANALYST_TOPICS[0],
    [topicKey]
  );

  const lensesInTopic = useMemo(() => {
    const seen = new Set<string>();
    const out: AnalystLens[] = [];
    for (const v of topic.views) {
      if (!seen.has(v.lens) && LENS_BY_KEY[v.lens]) {
        seen.add(v.lens);
        out.push(LENS_BY_KEY[v.lens]);
      }
    }
    return out;
  }, [topic]);

  const visibleViews = useMemo(
    () =>
      focusLens ? topic.views.filter((v) => v.lens === focusLens) : topic.views,
    [topic, focusLens]
  );

  function askTopic(key: string) {
    setTopicKey(key);
    setFocusLens(null);
  }

  return (
    <div className="terminal rounded-xl p-4 md:p-6">
      {/* TITLE BAR */}
      <div className="flex flex-col gap-3 border-b border-signal-500/15 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex gap-1.5" aria-hidden>
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-signal-500/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-mint-500/70" />
          </span>
          <span className="mono text-xs tracking-[0.18em] text-signal-300">
            PRODUCT ANALYST · 产品分析引擎
          </span>
        </div>
        <span className="mono text-[0.62rem] tracking-[0.2em] text-ghost-300">
          <span className="pulse">●</span> 6 DISCIPLINES ONLINE
        </span>
      </div>

      {/* PERSONAS */}
      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2.5">
        {ANALYST_LENSES.map((l) => (
          <span key={l.key} className="flex items-center gap-2">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: l.accent, boxShadow: `0 0 6px ${l.accent}aa` }}
            />
            <span className="mono text-[0.7rem] tracking-wide" style={{ color: l.accent }}>
              <T v={l.role} />
            </span>
          </span>
        ))}
      </div>

      <p className="mt-4 max-w-3xl text-sm leading-relaxed text-ghost-300">
        <T
          v={{
            en: "A single engine reasoning across six disciplines at once. It reads products structurally — as crystallized intention and externalized capability, not features and slogans — and traces how need, design, behavior and scale are one circuit. Ask it a deep question; it answers in many voices.",
            zh: "一台同时跨越六个学科推理的引擎。它结构性地阅读产品——把它读作被结晶的意图与被外化的能力，而非功能与口号——并追溯需求、设计、行为与规模如何同为一条回路。向它提一个深问题，它将以众多声音作答。",
          }}
        />
      </p>

      {/* QUESTION TABS */}
      <div className="mt-5">
        <p className="label-mono mb-2.5">
          <T v={{ en: "Ask the analyst", zh: "向分析引擎提问" }} />
        </p>
        <div className="flex flex-col gap-2">
          {ANALYST_TOPICS.map((tp) => {
            const on = tp.key === topic.key;
            return (
              <button
                key={tp.key}
                onClick={() => askTopic(tp.key)}
                aria-pressed={on}
                className={`group flex items-center gap-2.5 rounded-md border px-3 py-2 text-left transition ${
                  on
                    ? "border-signal-500/40 bg-ink-800"
                    : "border-ink-700 bg-ink-900/40 hover:border-ink-600"
                }`}
              >
                <span
                  className={`mono shrink-0 text-sm ${
                    on ? "text-signal-400" : "text-ghost-300 group-hover:text-signal-400/70"
                  }`}
                >
                  ›
                </span>
                <span className={`text-sm ${on ? "text-ghost-50" : "text-ghost-200"}`}>
                  <T v={tp.q} />
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* PROMPT LINE */}
      <div className="mt-5 rounded-md border border-signal-500/20 bg-ink-950/70 px-3.5 py-3">
        <p className="mono flex flex-wrap items-baseline gap-x-2 text-sm">
          <span className="text-signal-500">analyst@product:~$</span>
          <span className="text-mint-400">›</span>
          <span className="text-ghost-50">
            <T v={topic.q} />
          </span>
          <span className="caret text-signal-300">▍</span>
        </p>
      </div>

      {/* LENS FILTER */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="mono mr-1 text-[0.62rem] tracking-[0.18em] text-ghost-300">
          <T v={{ en: "LENS", zh: "镜头" }} />
        </span>
        <button
          onClick={() => setFocusLens(null)}
          aria-pressed={focusLens === null}
          className={`mono rounded-full border px-2.5 py-1 text-[0.68rem] transition ${
            focusLens === null
              ? "border-signal-500/50 bg-signal-500/15 text-signal-300"
              : "border-ink-700 text-ghost-300 hover:border-ink-600 hover:text-ghost-200"
          }`}
        >
          <T v={{ en: "All", zh: "全部" }} />
        </button>
        {lensesInTopic.map((l) => {
          const on = focusLens === l.key;
          return (
            <button
              key={l.key}
              onClick={() => setFocusLens(on ? null : l.key)}
              aria-pressed={on}
              className="mono flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.68rem] transition"
              style={{
                borderColor: on ? l.accent : "rgba(89,97,116,0.4)",
                color: on ? l.accent : "#8c95a8",
                backgroundColor: on ? `${l.accent}1f` : "transparent",
              }}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: l.accent }} />
              <T v={l.role} />
            </button>
          );
        })}
      </div>

      {/* RESPONSE STACK */}
      <div className="mt-4 flex flex-col gap-3">
        {visibleViews.map((v, i) => {
          const lens = LENS_BY_KEY[v.lens];
          if (!lens) return null;
          return (
            <article
              key={`${topic.key}-${v.lens}-${i}`}
              className="rise-in rounded-md border-l-2 bg-ink-900/50 py-3 pl-4 pr-4"
              style={{ borderLeftColor: lens.accent, animationDelay: `${i * 0.12}s` }}
            >
              <header className="mb-1.5 flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                <span className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: lens.accent, boxShadow: `0 0 6px ${lens.accent}aa` }}
                  />
                  <span className={`display text-base ${lang === "zh" ? "zh" : ""}`} style={{ color: lens.accent }}>
                    <T v={lens.role} />
                  </span>
                </span>
                <span className="mono text-[0.62rem] tracking-wide text-ghost-300">
                  <T v={lens.blurb} />
                </span>
              </header>
              <p className="max-w-2xl text-sm leading-relaxed text-ghost-200">
                <T v={v.text} />
              </p>
            </article>
          );
        })}
      </div>

      {/* FOOTER NOTE */}
      <p className="mono mt-5 border-t border-signal-500/10 pt-3 text-[0.62rem] leading-relaxed text-ghost-300">
        <T
          v={{
            en: "// The analyst describes mechanisms, not verdicts. Every product here is read by its trade-offs.",
            zh: "// 分析引擎描述机制，而非裁决。此处每一个产品，都由其取舍来阅读。",
          }}
        />
      </p>
    </div>
  );
}
