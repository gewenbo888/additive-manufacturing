"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useLang, T } from "./lang";
import { NEED_TIERS, VALUE_TERMS } from "./content";

/* ── scores table ─────────────────────────────────────────────────────────── */
const SCORES: Record<string, Record<string, number>> = {
  polymer:   { "Sₛ": 0.30, "T": 0.25, "ε": 0.45, "C": 0.20, "v": 0.85, "η": 0.30 },
  metal:     { "Sₛ": 0.90, "T": 0.95, "ε": 0.75, "C": 0.85, "v": 0.25, "η": 0.50 },
  ceramic:   { "Sₛ": 0.65, "T": 0.95, "ε": 0.25, "C": 0.70, "v": 0.40, "η": 0.60 },
  concrete:  { "Sₛ": 0.40, "T": 0.85, "ε": 0.55, "C": 0.10, "v": 0.95, "η": 0.45 },
  composite: { "Sₛ": 0.95, "T": 0.65, "ε": 0.85, "C": 0.75, "v": 0.35, "η": 0.40 },
  bio:       { "Sₛ": 0.10, "T": 0.20, "ε": 0.40, "C": 0.95, "v": 0.20, "η": 0.85 },
};

/* ── bilingual label pairs ───────────────────────────────────────────────── */
const LBL = {
  microstructure: { en: "Microstructure", zh: "微观结构" },
  scorecard:      { en: "Value scorecard", zh: "价值评分" },
  without:        { en: "Without this", zh: "没有它" },
  products:       { en: "Products", zh: "产品" },
  lower:          { en: "lower is better", zh: "越低越好" },
  caveat:         {
    en: "Stylized microstructures. Actual material behavior depends on alloy / blend, print parameters, and post-processing.",
    zh: "风格化的微观结构。实际材料行为取决于合金 / 混合、打印参数与后处理。",
  },
};

/* ── canvas drawing ─────────────────────────────────────────────────────── */
type DrawFn = (
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  accent: string,
) => void;

/* helpers */
function hex2rgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function rgba(hex: string, a: number) {
  const [r, g, b] = hex2rgb(hex);
  return `rgba(${r},${g},${b},${a})`;
}

/* polymer — entangled wavy chains drifting slowly */
const drawPolymer: DrawFn = (ctx, w, h, t, accent) => {
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#080a12";
  ctx.fillRect(0, 0, w, h);
  const chains = 18;
  for (let i = 0; i < chains; i++) {
    const phase = (i / chains) * Math.PI * 2;
    const yBase = (i / chains) * h * 1.1 - h * 0.05;
    const drift = Math.sin(t * 0.4 + phase) * 12;
    const freq = 0.018 + (i % 3) * 0.006;
    const amp = 18 + (i % 4) * 8;
    const alpha = 0.3 + 0.4 * ((i % 5) / 4);
    ctx.beginPath();
    ctx.moveTo(0, yBase + drift);
    for (let x = 0; x <= w; x += 4) {
      const y = yBase + drift + Math.sin(x * freq + t * 0.6 + phase) * amp
                + Math.sin(x * freq * 2.1 - t * 0.3 + phase) * amp * 0.4;
      ctx.lineTo(x, y);
    }
    ctx.strokeStyle = rgba(accent, alpha);
    ctx.lineWidth = 1.5 + (i % 3) * 0.5;
    ctx.stroke();
    /* side chains */
    if (i % 3 === 0) {
      for (let x = 30; x < w - 30; x += 60) {
        const y = yBase + drift + Math.sin(x * freq + t * 0.6 + phase) * amp;
        const angle = Math.cos(x * freq + t * 0.6 + phase) + 0.5;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.cos(angle) * 14, y + Math.sin(angle) * 14);
        ctx.strokeStyle = rgba(accent, 0.25);
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  }
};

/* metal — Voronoi-like grain polygons with slow recrystallization shimmer */
const METAL_GRAINS = Array.from({ length: 28 }, (_, i) => ({
  cx: 40 + (i % 7) * 72 + (Math.sin(i * 1.9) * 20),
  cy: 30 + Math.floor(i / 7) * 92 + (Math.cos(i * 2.3) * 18),
  r:  28 + (i % 4) * 9,
  sides: 5 + (i % 3),
  rot: (i * 0.71) % (Math.PI * 2),
}));
const drawMetal: DrawFn = (ctx, w, h, t, accent) => {
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#090b10";
  ctx.fillRect(0, 0, w, h);
  METAL_GRAINS.forEach((g, i) => {
    const recryst = (Math.sin(t * 0.25 + i * 0.8) + 1) / 2;
    const fillAlpha = 0.06 + recryst * 0.14;
    ctx.beginPath();
    for (let s = 0; s <= g.sides; s++) {
      const angle = g.rot + (s / g.sides) * Math.PI * 2 + t * 0.01 * (i % 2 === 0 ? 1 : -1);
      const rx = g.cx + Math.cos(angle) * g.r * (1 + 0.1 * recryst);
      const ry = g.cy + Math.sin(angle) * g.r * (1 + 0.1 * recryst);
      s === 0 ? ctx.moveTo(rx, ry) : ctx.lineTo(rx, ry);
    }
    ctx.closePath();
    ctx.fillStyle = rgba(accent, fillAlpha);
    ctx.fill();
    ctx.strokeStyle = rgba(accent, 0.25 + recryst * 0.45);
    ctx.lineWidth = 0.8 + recryst * 1.2;
    ctx.stroke();
    /* grain interior scatter */
    if (i % 4 === 0) {
      const grd = ctx.createRadialGradient(g.cx, g.cy, 0, g.cx, g.cy, g.r * 0.7);
      grd.addColorStop(0, rgba(accent, 0.18 * recryst));
      grd.addColorStop(1, "transparent");
      ctx.beginPath();
      ctx.arc(g.cx, g.cy, g.r * 0.7, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();
    }
  });
};

/* ceramic — dense angular crystals with micro-crack lines */
const drawCeramic: DrawFn = (ctx, w, h, t, accent) => {
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#08080e";
  ctx.fillRect(0, 0, w, h);
  const cols = 10, rows = 8;
  const cw = w / cols, ch = h / rows;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c;
      const offX = (Math.sin(idx * 2.3) * 0.3 + (c % 2 === 0 ? 0.25 : -0.25)) * cw;
      const offY = Math.cos(idx * 1.7) * 0.2 * ch;
      const cx = c * cw + cw / 2 + offX;
      const cy = r * ch + ch / 2 + offY;
      const size = cw * (0.35 + (idx % 3) * 0.08);
      const angle = (idx * 0.44) % (Math.PI * 2);
      /* crystal polygon */
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle + Math.sin(t * 0.08 + idx * 0.2) * 0.03);
      ctx.beginPath();
      const sides = 4 + (idx % 2);
      for (let s = 0; s < sides; s++) {
        const a = (s / sides) * Math.PI * 2 - Math.PI / 4;
        const px = Math.cos(a) * size;
        const py = Math.sin(a) * size * (s % 2 === 0 ? 1 : 0.72);
        s === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fillStyle = rgba(accent, 0.07 + (idx % 5) * 0.025);
      ctx.fill();
      ctx.strokeStyle = rgba(accent, 0.3 + (idx % 3) * 0.12);
      ctx.lineWidth = 0.6;
      ctx.stroke();
      ctx.restore();
    }
  }
  /* micro-crack overlay */
  for (let k = 0; k < 6; k++) {
    const sx = (k / 5) * w * 0.8 + w * 0.1;
    const sy = Math.sin(k * 1.4) * h * 0.3 + h * 0.35;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    for (let seg = 0; seg < 8; seg++) {
      ctx.lineTo(
        sx + seg * 18 + Math.sin(seg * 2.1 + k) * 8,
        sy + seg * 7 + Math.cos(seg * 1.8 + k) * 12,
      );
    }
    ctx.strokeStyle = rgba(accent, 0.18);
    ctx.lineWidth = 0.7;
    ctx.stroke();
  }
};

/* concrete — aggregate pebbles in matrix, gently settling */
const PEBBLES = Array.from({ length: 38 }, (_, i) => ({
  x: 30 + (i * 137.5) % (480),
  y: 20 + (i * 97.3) % (360),
  r: 10 + (i % 5) * 7,
  shape: i % 3,
}));
const drawConcrete: DrawFn = (ctx, w, h, t, accent) => {
  ctx.clearRect(0, 0, w, h);
  /* matrix */
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, "#0b0e12");
  grad.addColorStop(1, "#070a0d");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
  /* fine aggregate speckle */
  for (let i = 0; i < 200; i++) {
    const fx = ((i * 73.1) % w);
    const fy = ((i * 53.7) % h);
    ctx.beginPath();
    ctx.arc(fx, fy, 0.8, 0, Math.PI * 2);
    ctx.fillStyle = rgba(accent, 0.08);
    ctx.fill();
  }
  /* coarse pebbles */
  PEBBLES.forEach((p, i) => {
    const settle = Math.sin(t * 0.15 + i * 0.6) * 1.2;
    const py = Math.min(h - p.r - 4, p.y + settle);
    ctx.beginPath();
    if (p.shape === 0) {
      ctx.arc(p.x, py, p.r, 0, Math.PI * 2);
    } else if (p.shape === 1) {
      ctx.ellipse(p.x, py, p.r * 1.4, p.r * 0.7, i * 0.5, 0, Math.PI * 2);
    } else {
      const sides = 5 + (i % 3);
      for (let s = 0; s < sides; s++) {
        const a = (s / sides) * Math.PI * 2;
        const px2 = p.x + Math.cos(a) * p.r;
        const py2 = py + Math.sin(a) * p.r;
        s === 0 ? ctx.moveTo(px2, py2) : ctx.lineTo(px2, py2);
      }
      ctx.closePath();
    }
    ctx.fillStyle = rgba(accent, 0.10 + (i % 5) * 0.04);
    ctx.fill();
    ctx.strokeStyle = rgba(accent, 0.28 + (i % 3) * 0.08);
    ctx.lineWidth = 1;
    ctx.stroke();
  });
};

/* composite — aligned fibers in a dark matrix */
const drawComposite: DrawFn = (ctx, w, h, t, accent) => {
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#07090e";
  ctx.fillRect(0, 0, w, h);
  const fiberCount = 24;
  const spacing = h / fiberCount;
  for (let i = 0; i < fiberCount; i++) {
    const y = (i + 0.5) * spacing;
    /* matrix band between fibers */
    ctx.fillStyle = rgba(accent, 0.03);
    ctx.fillRect(0, y - spacing * 0.35, w, spacing * 0.3);
    /* fiber cylinder */
    const r = spacing * 0.28;
    const grd = ctx.createLinearGradient(0, y - r, 0, y + r);
    grd.addColorStop(0, rgba(accent, 0.18));
    grd.addColorStop(0.35, rgba(accent, 0.65));
    grd.addColorStop(0.65, rgba(accent, 0.45));
    grd.addColorStop(1, rgba(accent, 0.10));
    ctx.fillStyle = grd;
    ctx.fillRect(0, y - r, w, r * 2);
    /* specular highlight */
    const shimmer = (Math.sin(t * 0.5 + i * 0.4) + 1) / 2;
    ctx.fillStyle = rgba("#ffffff", 0.04 + shimmer * 0.06);
    ctx.fillRect(0, y - r * 0.45, w, r * 0.3);
    /* resin pockets */
    if (i % 4 === 0) {
      for (let px = 60; px < w - 60; px += 120) {
        const ox = Math.sin(t * 0.3 + i * 0.7 + px * 0.01) * 4;
        ctx.beginPath();
        ctx.arc(px + ox, y, r * 0.55, 0, Math.PI * 2);
        ctx.fillStyle = rgba(accent, 0.08);
        ctx.fill();
        ctx.strokeStyle = rgba(accent, 0.18);
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  }
};

/* bio — cells with nuclei, pulsing vasculature */
const BIO_CELLS = Array.from({ length: 32 }, (_, i) => ({
  x: 40 + (i * 151.3) % 440,
  y: 30 + (i * 113.7) % 340,
  r: 16 + (i % 5) * 7,
  phase: i * 0.8,
}));
const drawBio: DrawFn = (ctx, w, h, t, accent) => {
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#060b0a";
  ctx.fillRect(0, 0, w, h);
  /* vasculature lines */
  const vessels = [
    [0.1, 0.2, 0.5, 0.8, 0.9, 0.5],
    [0.3, 0.0, 0.4, 0.5, 0.6, 1.0],
    [0.7, 0.1, 0.5, 0.45, 0.2, 0.9],
  ];
  vessels.forEach((v, vi) => {
    const pulse = (Math.sin(t * 1.8 + vi * 1.2) + 1) / 2;
    ctx.beginPath();
    ctx.moveTo(v[0] * w, v[1] * h);
    ctx.bezierCurveTo(
      v[2] * w, v[3] * h * 0.6,
      v[4] * w * 0.8, v[5] * h * 0.5,
      v[4] * w, v[5] * h,
    );
    ctx.strokeStyle = rgba(accent, 0.18 + pulse * 0.22);
    ctx.lineWidth = 2 + pulse * 2;
    ctx.stroke();
    /* pulse glow */
    ctx.strokeStyle = rgba(accent, 0.06 + pulse * 0.10);
    ctx.lineWidth = 6 + pulse * 6;
    ctx.stroke();
  });
  /* cells */
  BIO_CELLS.forEach((c, i) => {
    const pulse = (Math.sin(t * 1.6 + c.phase) + 1) / 2;
    const cr = c.r * (1 + pulse * 0.06);
    /* cell membrane */
    const grd = ctx.createRadialGradient(c.x, c.y, cr * 0.1, c.x, c.y, cr);
    grd.addColorStop(0, rgba(accent, 0.12 + pulse * 0.06));
    grd.addColorStop(0.6, rgba(accent, 0.07));
    grd.addColorStop(1, rgba(accent, 0.02));
    ctx.beginPath();
    ctx.ellipse(c.x, c.y, cr, cr * (0.82 + (i % 3) * 0.06), i * 0.3, 0, Math.PI * 2);
    ctx.fillStyle = grd;
    ctx.fill();
    ctx.strokeStyle = rgba(accent, 0.30 + pulse * 0.25);
    ctx.lineWidth = 1.2;
    ctx.stroke();
    /* nucleus */
    const nr = cr * 0.35;
    const ng = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, nr);
    ng.addColorStop(0, rgba(accent, 0.55 + pulse * 0.2));
    ng.addColorStop(1, rgba(accent, 0.20));
    ctx.beginPath();
    ctx.arc(c.x, c.y, nr, 0, Math.PI * 2);
    ctx.fillStyle = ng;
    ctx.fill();
  });
};

const DRAW_FNS: Record<string, DrawFn> = {
  polymer:   drawPolymer,
  metal:     drawMetal,
  ceramic:   drawCeramic,
  concrete:  drawConcrete,
  composite: drawComposite,
  bio:       drawBio,
};

/* ── MicrostructureViz ──────────────────────────────────────────────────── */
function MicrostructureViz({ materialKey, accent }: { materialKey: string; accent: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);
  const startRef  = useRef<number>(0);
  const drawFn    = DRAW_FNS[materialKey] ?? drawPolymer;

  const animate = useCallback((ts: number) => {
    if (!startRef.current) startRef.current = ts;
    const t = (ts - startRef.current) / 1000;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawFn(ctx, canvas.width, canvas.height, t, accent);
    rafRef.current = requestAnimationFrame(animate);
  }, [drawFn, accent]);

  useEffect(() => {
    startRef.current = 0;
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [animate]);

  return (
    <canvas
      ref={canvasRef}
      width={520}
      height={400}
      className="w-full h-full rounded-lg"
      style={{ display: "block" }}
      aria-label={`${materialKey} microstructure visualization`}
    />
  );
}

/* ── ScoreBar ───────────────────────────────────────────────────────────── */
function ScoreBar({
  term,
  score,
  materialAccent,
}: {
  term: (typeof VALUE_TERMS)[0];
  score: number;
  materialAccent: string;
}) {
  const { lang } = useLang();
  const isBad = term.sign === "−";
  const barColor = isBad ? "#596174" : term.accent;
  const barWidth  = `${Math.round(score * 100)}%`;

  return (
    <div className="flex flex-col gap-0.5 py-1.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="label-mono shrink-0"
            style={{ color: isBad ? "#596174" : term.accent }}
          >
            {term.sym}
          </span>
          <span className="text-ghost-200 text-xs truncate">
            {term.name[lang]}
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {isBad && (
            <span className="text-[0.58rem] text-ghost-500 font-mono">
              ↓ {lang === "zh" ? "越低越好" : "lower is better"}
            </span>
          )}
          <span
            className="label-mono text-[0.62rem]"
            style={{ color: isBad ? "#596174" : term.accent }}
          >
            {Math.round(score * 100)}
          </span>
        </div>
      </div>
      <div className="h-1.5 w-full rounded-full bg-ink-800 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: barWidth,
            background: isBad
              ? `linear-gradient(90deg, #333c52, #596174)`
              : `linear-gradient(90deg, ${barColor}80, ${barColor})`,
          }}
        />
      </div>
    </div>
  );
}

/* ── main component ─────────────────────────────────────────────────────── */
export default function MaterialsLab() {
  const { lang } = useLang();
  const [activeIdx, setActiveIdx] = useState(0);
  const mat = NEED_TIERS[activeIdx];

  return (
    <section className="w-full flex flex-col gap-4">
      {/* tab row */}
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Material tabs">
        {NEED_TIERS.map((m, i) => {
          const isActive = i === activeIdx;
          return (
            <button
              key={m.key}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveIdx(i)}
              className={`px-3 py-1.5 rounded text-xs font-mono transition-all duration-200 border ${
                isActive
                  ? "text-ghost-50"
                  : "border-transparent text-ghost-300 hover:text-ghost-100 hover:border-ghost-500/30"
              }`}
              style={
                isActive
                  ? {
                      borderColor: m.accent,
                      color: m.accent,
                      backgroundColor: `${m.accent}18`,
                      boxShadow: `0 0 14px -4px ${m.accent}55`,
                    }
                  : {}
              }
            >
              <span className={lang === "zh" ? "zh" : "display"}>
                {m.level[lang]}
              </span>
            </button>
          );
        })}
      </div>

      {/* rule */}
      <div className="h-px rule-signal opacity-60" />

      {/* body grid */}
      <div className="grid lg:grid-cols-[minmax(0,1fr)_360px] gap-6 items-start">
        {/* left — microstructure */}
        <div className="flex flex-col gap-2">
          <p className="label-mono" style={{ color: mat.accent }}>
            <T v={LBL.microstructure} />
            <span className="text-ghost-500 mx-1">·</span>
            <span className="zh text-ghost-300">{LBL.microstructure.zh}</span>
          </p>
          <div
            className="relative w-full rounded-xl overflow-hidden border"
            style={{
              borderColor: `${mat.accent}30`,
              boxShadow: `0 0 40px -16px ${mat.accent}40`,
              aspectRatio: "520 / 400",
            }}
          >
            <MicrostructureViz
              key={mat.key}
              materialKey={mat.key}
              accent={mat.accent}
            />
            {/* corner label */}
            <span
              className="absolute bottom-2 right-3 label-mono text-[0.58rem] opacity-60"
              style={{ color: mat.accent }}
            >
              {mat.level.en.toUpperCase()} · MAGNIFIED
            </span>
          </div>
          {/* caveat */}
          <p className="text-ghost-500 text-[0.65rem] leading-relaxed mt-1">
            {lang === "zh" ? LBL.caveat.zh : LBL.caveat.en}
          </p>
        </div>

        {/* right — sidebar */}
        <div className="flex flex-col gap-4">
          {/* title block */}
          <div
            className="holo rounded-xl p-4"
            style={{ borderColor: `${mat.accent}25` }}
          >
            <h3
              className="display text-xl leading-snug"
              style={{ color: mat.accent }}
            >
              {mat.level.en}
            </h3>
            <p className="zh text-ghost-300 text-base leading-snug mt-0.5">
              {mat.level.zh}
            </p>
            <div className="h-px my-3" style={{ background: `${mat.accent}30` }} />
            <p className="text-ghost-100 text-sm leading-relaxed">
              {mat.need[lang]}
            </p>
          </div>

          {/* without block */}
          <div className="terminal rounded-xl p-4">
            <p className="label-mono mb-2" style={{ color: mat.accent }}>
              <T v={LBL.without} />
            </p>
            <p className="text-ghost-300 text-xs leading-relaxed">
              {mat.lack[lang]}
            </p>
          </div>

          {/* products */}
          <div className="terminal rounded-xl p-4">
            <p className="label-mono mb-2" style={{ color: mat.accent }}>
              <T v={LBL.products} />
            </p>
            <p className="text-ghost-300 text-xs leading-relaxed">
              {mat.products[lang]}
            </p>
          </div>

          {/* value scorecard */}
          <div
            className="holo rounded-xl p-4"
            style={{ borderColor: `${mat.accent}20` }}
          >
            <p className="label-mono mb-3" style={{ color: mat.accent }}>
              <T v={LBL.scorecard} />
            </p>
            <div className="divide-y divide-ink-700">
              {VALUE_TERMS.map((term) => (
                <ScoreBar
                  key={term.sym}
                  term={term}
                  score={SCORES[mat.key]?.[term.sym] ?? 0}
                  materialAccent={mat.accent}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
