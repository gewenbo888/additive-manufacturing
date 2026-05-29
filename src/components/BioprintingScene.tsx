"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { T, useLang } from "./lang";

// ─── Tissue definitions ────────────────────────────────────────────────────────

type TissueKey = "skin" | "cartilage" | "vasculature" | "kidney";

interface TissueConfig {
  key: TissueKey;
  name: { en: string; zh: string };
  use: { en: string; zh: string };
  layers: number;
  hasVasculature: boolean;
  complexity: number; // 1–4
  shape: "flat" | "disc" | "tree" | "sphere";
  color: string;
}

const TISSUES: TissueConfig[] = [
  {
    key: "skin",
    name: { en: "Skin Patch", zh: "皮肤贴片" },
    use: { en: "Burn treatment, wound healing", zh: "烧伤治疗、伤口愈合" },
    layers: 6,
    hasVasculature: false,
    complexity: 1,
    shape: "flat",
    color: "#e87aaf",
  },
  {
    key: "cartilage",
    name: { en: "Cartilage Disc", zh: "软骨圆盘" },
    use: { en: "Joint reconstruction, ear/nose prosthetics", zh: "关节重建、耳鼻假体" },
    layers: 10,
    hasVasculature: false,
    complexity: 2,
    shape: "disc",
    color: "#86e0c8",
  },
  {
    key: "vasculature",
    name: { en: "Vascular Network", zh: "血管网络" },
    use: { en: "The bottleneck for printed organs", zh: "打印器官的瓶颈" },
    layers: 14,
    hasVasculature: true,
    complexity: 3,
    shape: "tree",
    color: "#ff6b6b",
  },
  {
    key: "kidney",
    name: { en: "Kidney Organoid", zh: "肾脏类器官" },
    use: { en: "Drug-screening platform, eventual transplant", zh: "药物筛选平台，最终为移植" },
    layers: 20,
    hasVasculature: true,
    complexity: 4,
    shape: "sphere",
    color: "#9b6dff",
  },
];

// ─── Canvas drawing helpers ────────────────────────────────────────────────────

const CW = 560;
const CH = 440;
const CX = CW / 2;
const CY = CH / 2 + 30;

// Serpentine path points for a given layer
function buildPath(
  tissueKey: TissueKey,
  layer: number,
  totalLayers: number,
): Array<{ x: number; y: number }> {
  const progress = layer / totalLayers;
  const points: Array<{ x: number; y: number }> = [];

  if (tissueKey === "skin") {
    // flat rectangular patch
    const w = 160;
    const h = 90;
    const rows = 5;
    const x0 = CX - w / 2;
    const y0 = CY - h / 2 + (layer % 2) * 4;
    for (let r = 0; r < rows; r++) {
      const y = y0 + (r * h) / rows;
      const leftToRight = r % 2 === 0;
      for (let c = 0; c <= 16; c++) {
        const t = leftToRight ? c / 16 : 1 - c / 16;
        points.push({ x: x0 + t * w, y });
      }
    }
  } else if (tissueKey === "cartilage") {
    // concentric rings in a disc
    const radius = 80 + layer * 2;
    const rings = 4;
    for (let ring = 0; ring < rings; ring++) {
      const r = (radius * (ring + 1)) / rings;
      const steps = Math.max(16, Math.round(2 * Math.PI * r / 8));
      for (let i = 0; i <= steps; i++) {
        const angle = (i / steps) * 2 * Math.PI - Math.PI / 2;
        points.push({ x: CX + r * Math.cos(angle), y: CY + r * Math.sin(angle) });
      }
    }
  } else if (tissueKey === "vasculature") {
    // horizontal serpentine dense grid
    const w = 200;
    const h = 160;
    const rows = 8;
    const x0 = CX - w / 2;
    const y0 = CY - h / 2;
    for (let r = 0; r < rows; r++) {
      const y = y0 + (r * h) / rows + progress * 4;
      const ltr = r % 2 === 0;
      for (let c = 0; c <= 20; c++) {
        const t = ltr ? c / 20 : 1 - c / 20;
        points.push({ x: x0 + t * w, y });
      }
    }
  } else {
    // kidney: spherical — spiral inward from edge
    const rMax = 90 + layer;
    const turns = 5 + layer * 0.5;
    const steps = 80;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const angle = t * turns * 2 * Math.PI;
      const r = rMax * (1 - t * 0.85);
      points.push({ x: CX + r * Math.cos(angle), y: CY + r * Math.sin(angle) });
    }
  }
  return points;
}

// Vasculature branching tree
interface Branch {
  x1: number; y1: number; x2: number; y2: number; depth: number; angle: number;
}

function buildVasculature(tissueKey: TissueKey): Branch[] {
  const branches: Branch[] = [];

  function grow(x: number, y: number, angle: number, length: number, depth: number) {
    if (depth > 5 || length < 4) return;
    const x2 = x + Math.cos(angle) * length;
    const y2 = y + Math.sin(angle) * length;
    branches.push({ x1: x, y1: y, x2, y2, depth, angle });
    const spread = depth < 2 ? 0.45 : 0.6;
    grow(x2, y2, angle - spread, length * 0.68, depth + 1);
    grow(x2, y2, angle + spread, length * 0.68, depth + 1);
  }

  if (tissueKey === "vasculature") {
    grow(CX, CY + 100, -Math.PI / 2, 55, 0);
    grow(CX - 60, CY + 90, -Math.PI / 2 + 0.4, 42, 1);
    grow(CX + 60, CY + 90, -Math.PI / 2 - 0.4, 42, 1);
  } else if (tissueKey === "kidney") {
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * 2 * Math.PI;
      grow(CX + 20 * Math.cos(a), CY + 20 * Math.sin(a), a, 50, 0);
    }
  }
  return branches;
}

// ─── State types ──────────────────────────────────────────────────────────────

type Phase = "idle" | "printing" | "maturing" | "ready";

interface PrintState {
  phase: Phase;
  currentLayer: number;
  pathProgress: number; // 0–1 within current layer
  cellViability: number;
  vasculatureDensity: number;
  elapsedMs: number;
  maturationProgress: number; // 0–1 during maturing phase
}

function initialState(): PrintState {
  return {
    phase: "idle",
    currentLayer: 0,
    pathProgress: 0,
    cellViability: 99,
    vasculatureDensity: 0,
    elapsedMs: 0,
    maturationProgress: 0,
  };
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function BioprintingScene() {
  const { lang } = useLang();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const stateRef = useRef<PrintState>(initialState());
  const [displayState, setDisplayState] = useState<PrintState>(initialState());
  const [selectedTissue, setSelectedTissue] = useState<TissueKey>("skin");
  const [isPaused, setIsPaused] = useState(false);
  const isPausedRef = useRef(false);
  const selectedTissueRef = useRef<TissueKey>("skin");

  // Keep refs in sync
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);
  useEffect(() => {
    selectedTissueRef.current = selectedTissue;
  }, [selectedTissue]);

  // ── Draw frame ──────────────────────────────────────────────────────────────
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const tissue = TISSUES.find((t) => t.key === selectedTissueRef.current)!;
    const s = stateRef.current;

    ctx.clearRect(0, 0, CW, CH);

    // ── Background gradient ────────────────────────────────────────────────
    const bg = ctx.createRadialGradient(CX, CY, 40, CX, CY, 260);
    bg.addColorStop(0, "rgba(22,28,42,0.9)");
    bg.addColorStop(1, "rgba(6,7,10,0.97)");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, CW, CH);

    // ── Petri dish / bioreactor container ─────────────────────────────────
    const dishShape = tissue.shape;
    ctx.save();
    if (dishShape === "flat" || dishShape === "tree") {
      // rectangular well
      const rx = CX - 120, ry = CY - 80, rw = 240, rh = 160;
      ctx.strokeStyle = "rgba(168,211,255,0.12)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      ctx.roundRect(rx, ry, rw, rh, 12);
      ctx.stroke();
    } else {
      // circular dish
      ctx.strokeStyle = "rgba(168,211,255,0.12)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      ctx.arc(CX, CY, 110, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.restore();

    // ── Deposited cells + scaffold paths ──────────────────────────────────
    const completedLayers = s.currentLayer;
    const matAlpha = s.phase === "maturing" ? 0.6 + s.maturationProgress * 0.4 : s.phase === "ready" ? 1 : 0.7;

    for (let layer = 0; layer < completedLayers; layer++) {
      const pts = buildPath(tissue.key, layer, tissue.layers);
      if (pts.length < 2) continue;

      // scaffold path
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) {
        ctx.lineTo(pts[i].x, pts[i].y);
      }
      ctx.strokeStyle = `rgba(61,139,253,${0.15 * matAlpha})`;
      ctx.lineWidth = 2.5;
      ctx.lineJoin = "round";
      ctx.stroke();

      // cell dots — every nth point
      const step = Math.max(1, Math.floor(pts.length / 28));
      for (let i = 0; i < pts.length; i += step) {
        const p = pts[i];
        const sat = s.phase === "maturing" ? 0.4 + s.maturationProgress * 0.6 : 0.5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(232,122,175,${sat * matAlpha})`;
        ctx.fill();
      }
    }

    // ── Partial current layer ──────────────────────────────────────────────
    if (s.phase === "printing" && completedLayers < tissue.layers) {
      const pts = buildPath(tissue.key, completedLayers, tissue.layers);
      const endIdx = Math.floor(s.pathProgress * (pts.length - 1));
      if (endIdx > 0) {
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i <= endIdx; i++) ctx.lineTo(pts[i].x, pts[i].y);
        ctx.strokeStyle = "rgba(61,139,253,0.5)";
        ctx.lineWidth = 2.5;
        ctx.lineJoin = "round";
        ctx.stroke();
      }
    }

    // ── Vasculature ────────────────────────────────────────────────────────
    if (tissue.hasVasculature && s.vasculatureDensity > 0) {
      const branches = buildVasculature(tissue.key);
      const visibleCount = Math.floor((s.vasculatureDensity / 100) * branches.length);
      ctx.save();
      for (let i = 0; i < visibleCount; i++) {
        const b = branches[i];
        const alpha = Math.min(1, (visibleCount - i) / 8) * matAlpha;
        const width = Math.max(0.5, 2.5 - b.depth * 0.4);
        ctx.beginPath();
        ctx.moveTo(b.x1, b.y1);
        ctx.lineTo(b.x2, b.y2);
        const r = 255, g = Math.floor(60 + b.depth * 15), bv = Math.floor(80 + b.depth * 25);
        ctx.strokeStyle = `rgba(${r},${g},${bv},${alpha * 0.85})`;
        ctx.lineWidth = width;
        ctx.lineCap = "round";
        ctx.stroke();
      }
      ctx.restore();
    }

    // ── Print head ────────────────────────────────────────────────────────
    if (s.phase === "printing" || s.phase === "idle") {
      const pts = buildPath(tissue.key, Math.min(s.currentLayer, tissue.layers - 1), tissue.layers);
      let headX = CX;
      let headY = 48;

      if (s.phase === "printing" && pts.length > 0) {
        const idx = Math.min(Math.floor(s.pathProgress * (pts.length - 1)), pts.length - 1);
        headX = pts[idx].x;
        headY = pts[idx].y - 28;
      } else {
        // idle: hover at center top
        headX = CX;
        headY = 48;
      }

      // nozzle body
      ctx.save();
      ctx.translate(headX, headY);

      // scaffold nozzle (left)
      ctx.beginPath();
      ctx.roundRect(-18, -10, 10, 20, 2);
      ctx.fillStyle = "rgba(61,139,253,0.25)";
      ctx.strokeStyle = "#3d8bfd";
      ctx.lineWidth = 1.2;
      ctx.fill();
      ctx.stroke();
      // scaffold drip tip
      ctx.beginPath();
      ctx.moveTo(-15, 10);
      ctx.lineTo(-13, 18);
      ctx.lineTo(-11, 10);
      ctx.fillStyle = "#3d8bfd";
      ctx.fill();

      // cell nozzle (right)
      ctx.beginPath();
      ctx.roundRect(8, -10, 10, 20, 2);
      ctx.fillStyle = "rgba(232,122,175,0.25)";
      ctx.strokeStyle = "#e87aaf";
      ctx.lineWidth = 1.2;
      ctx.fill();
      ctx.stroke();
      // cell drip tip
      ctx.beginPath();
      ctx.moveTo(11, 10);
      ctx.lineTo(13, 18);
      ctx.lineTo(15, 10);
      ctx.fillStyle = "#e87aaf";
      ctx.fill();

      // connecting arm
      ctx.beginPath();
      ctx.moveTo(-22, -6);
      ctx.lineTo(22, -6);
      ctx.strokeStyle = "rgba(168,211,255,0.4)";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.restore();

      // drip animation when printing
      if (s.phase === "printing") {
        const dripY = headY + 18 + ((s.elapsedMs / 180) % 1) * 10;
        ctx.beginPath();
        ctx.arc(headX - 2, dripY, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = "#3d8bfd";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(headX + 14, dripY + 2, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = "#e87aaf";
        ctx.fill();
      }
    }

    // ── Maturation glow overlay ────────────────────────────────────────────
    if (s.phase === "maturing" || s.phase === "ready") {
      const glowAlpha = s.phase === "ready" ? 0.18 : s.maturationProgress * 0.15;
      const glow = ctx.createRadialGradient(CX, CY, 0, CX, CY, 120);
      glow.addColorStop(0, `rgba(47,212,168,${glowAlpha})`);
      glow.addColorStop(1, "rgba(47,212,168,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, CW, CH);
    }

    // ── Layer tick marks ──────────────────────────────────────────────────
    ctx.save();
    const tickX = 24;
    ctx.font = "9px 'JetBrains Mono', monospace";
    ctx.fillStyle = "rgba(168,211,255,0.3)";
    ctx.fillText("LAYERS", tickX, 28);
    for (let l = 0; l < tissue.layers; l++) {
      const ty = 38 + l * (CH - 80) / tissue.layers;
      const filled = l < s.currentLayer;
      ctx.fillStyle = filled ? "#3d8bfd" : "rgba(61,139,253,0.18)";
      ctx.fillRect(tickX, ty, 6, Math.max(1, (CH - 80) / tissue.layers - 2));
    }
    ctx.restore();
  }, []);

  // ── Animation loop ────────────────────────────────────────────────────────
  const animate = useCallback(
    (ts: number) => {
      if (lastTimeRef.current === 0) lastTimeRef.current = ts;
      const dt = Math.min(ts - lastTimeRef.current, 80); // cap at 80ms
      lastTimeRef.current = ts;

      const tissue = TISSUES.find((t) => t.key === selectedTissueRef.current)!;
      const s = stateRef.current;

      if (!isPausedRef.current && s.phase === "printing") {
        // Speed: faster for simple tissues
        const layerDurationMs = 800 + tissue.complexity * 350;
        s.elapsedMs += dt;
        s.pathProgress += dt / layerDurationMs;

        // Viability: slight decline during printing
        const viabilityDecline = (99 - (84 + tissue.complexity * 2)) / tissue.layers;
        s.cellViability = Math.max(84 + tissue.complexity, 99 - viabilityDecline * (s.currentLayer + s.pathProgress));

        // Vasculature grows if applicable
        if (tissue.hasVasculature) {
          s.vasculatureDensity = Math.min(100, (s.currentLayer / tissue.layers) * 100);
        }

        if (s.pathProgress >= 1) {
          s.pathProgress = 0;
          s.currentLayer += 1;
          if (s.currentLayer >= tissue.layers) {
            s.currentLayer = tissue.layers;
            s.phase = "maturing";
          }
        }
      } else if (!isPausedRef.current && s.phase === "maturing") {
        s.elapsedMs += dt;
        s.maturationProgress = Math.min(1, s.maturationProgress + dt / 3000);
        if (tissue.hasVasculature) {
          s.vasculatureDensity = Math.min(100, s.vasculatureDensity + (dt / 3000) * 30);
        }
        if (s.maturationProgress >= 1) {
          s.phase = "ready";
        }
      } else if (!isPausedRef.current && s.phase === "idle") {
        // just draw idle state
      } else if (s.phase === "ready") {
        // static
      }

      draw();

      // Update React state throttled (every ~100ms)
      if (Math.floor(ts / 100) !== Math.floor((ts - dt) / 100)) {
        setDisplayState({ ...stateRef.current });
      }

      rafRef.current = requestAnimationFrame(animate);
    },
    [draw],
  );

  // ── Mount / unmount ───────────────────────────────────────────────────────
  useEffect(() => {
    lastTimeRef.current = 0;
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, [animate]);

  // ── Controls ──────────────────────────────────────────────────────────────
  const handleTissueSelect = useCallback((key: TissueKey) => {
    setSelectedTissue(key);
    selectedTissueRef.current = key;
    stateRef.current = initialState();
    setDisplayState(initialState());
    lastTimeRef.current = 0;
  }, []);

  const handleReset = useCallback(() => {
    stateRef.current = initialState();
    setDisplayState(initialState());
    lastTimeRef.current = 0;
    setIsPaused(false);
    isPausedRef.current = false;
  }, []);

  const handlePlayPause = useCallback(() => {
    if (stateRef.current.phase === "idle") {
      stateRef.current.phase = "printing";
      setDisplayState({ ...stateRef.current });
    }
    setIsPaused((p) => !p);
  }, []);

  // ── Derived display ───────────────────────────────────────────────────────
  const tissue = TISSUES.find((t) => t.key === selectedTissue)!;

  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const statusLabel = (): { en: string; zh: string } => {
    switch (displayState.phase) {
      case "idle": return { en: "Ready · Waiting", zh: "就绪 · 等待" };
      case "printing": return { en: "Printing · 打印中", zh: "打印中 · Printing" };
      case "maturing": return { en: "Maturing · 成熟中", zh: "成熟中 · Maturing" };
      case "ready": return { en: "Ready · 准备就绪", zh: "准备就绪 · Ready" };
    }
  };

  const statusColor = () => {
    switch (displayState.phase) {
      case "idle": return "#a8d3ff";
      case "printing": return "#f5a623";
      case "maturing": return "#9b6dff";
      case "ready": return "#2fd4a8";
    }
  };

  const viabilityColor = (v: number) =>
    v > 95 ? "#2fd4a8" : v > 90 ? "#f5a623" : "#ff6b6b";

  return (
    <div className="holo rounded-2xl p-5 md:p-8">
      <div className="label-mono mb-1">{lang === "zh" ? "生物打印模拟" : "Bioprinting Simulator"}</div>
      <p className="mb-4 max-w-2xl text-sm leading-relaxed text-ghost-300">
        <T v={{ en: "Layer-by-layer deposition of cell-laden hydrogel bio-ink onto a scaffold. Select a tissue type and watch cells accumulate as vasculature threads through the construct.", zh: "将含细胞水凝胶生物墨水逐层沉积到支架上。选择组织类型，观察细胞积聚，血管在构造中延伸生长。" }} />
      </p>
      <div className="h-px rule-signal opacity-30" />

      {/* Main grid */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">

        {/* ── Left: Bioprint stage ─────────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-xl border border-signal-500/15 bg-ink-950">
          <canvas
            ref={canvasRef}
            width={CW}
            height={CH}
            className="w-full"
            aria-label="Bioprinting simulation canvas"
          />
          {/* Phase badge */}
          <div
            className="absolute right-3 top-3 rounded-full border px-3 py-1 text-[0.65rem] font-mono tracking-widest"
            style={{
              borderColor: `${statusColor()}40`,
              color: statusColor(),
              background: `${statusColor()}12`,
            }}
          >
            <T v={statusLabel()} />
          </div>
        </div>

        {/* ── Right: Controls + readouts ───────────────────────────────────── */}
        <div className="flex flex-col gap-4">

          {/* Tissue picker */}
          <div className="terminal rounded-xl p-4">
            <div className="label-mono mb-3">
              {lang === "zh" ? "组织类型" : "Tissue Type"}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {TISSUES.map((t) => {
                const active = t.key === selectedTissue;
                return (
                  <button
                    key={t.key}
                    onClick={() => handleTissueSelect(t.key)}
                    className={`rounded-lg border px-3 py-2.5 text-left text-xs transition-all ${
                      active
                        ? "border-signal-500/60 bg-signal-500/10"
                        : "border-ghost-100/8 bg-ink-900/60 hover:border-signal-500/30 hover:bg-ink-900"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ background: t.color }}
                      />
                      <span
                        className={`font-semibold ${active ? "text-ghost-50" : "text-ghost-300"} ${lang === "zh" ? "zh" : "display"}`}
                        style={{ fontSize: lang === "zh" ? "0.75rem" : "0.7rem" }}
                      >
                        <T v={t.name} />
                      </span>
                    </div>
                    <div className="mt-1 flex gap-0.5">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <span
                          key={i}
                          className="h-1 w-4 rounded-sm"
                          style={{
                            background: i < t.complexity ? t.color : "rgba(168,211,255,0.1)",
                          }}
                        />
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Use case description */}
            <div className="mt-3 rounded-lg bg-ink-950/60 px-3 py-2.5">
              <p
                className={`text-xs leading-relaxed text-ghost-200 ${lang === "zh" ? "zh" : ""}`}
                style={{ color: tissue.color }}
              >
                <T v={tissue.use} />
              </p>
            </div>

            {/* Controls */}
            <div className="mt-3 flex gap-2">
              <button
                onClick={handlePlayPause}
                className="flex-1 rounded-lg border border-signal-500/40 bg-signal-500/10 px-3 py-2 text-xs font-mono text-signal-300 transition hover:bg-signal-500/20 disabled:opacity-40"
                disabled={displayState.phase === "ready"}
              >
                {displayState.phase === "idle"
                  ? lang === "zh" ? "▶ 开始打印" : "▶ Start Print"
                  : isPaused
                  ? lang === "zh" ? "▶ 继续" : "▶ Resume"
                  : lang === "zh" ? "⏸ 暂停" : "⏸ Pause"}
              </button>
              <button
                onClick={handleReset}
                className="rounded-lg border border-ghost-100/15 px-3 py-2 text-xs font-mono text-ghost-300 transition hover:border-ghost-100/30 hover:text-ghost-100"
              >
                {lang === "zh" ? "重置" : "Reset"}
              </button>
            </div>
          </div>

          {/* Readouts */}
          <div className="terminal rounded-xl p-4">
            <div className="label-mono mb-3">
              {lang === "zh" ? "实时读数" : "Live Readouts"}
            </div>

            <div className="space-y-3">
              {/* Layer progress */}
              <div>
                <div className="flex items-baseline justify-between">
                  <span className="text-[0.65rem] font-mono uppercase tracking-widest text-ghost-300">
                    {lang === "zh" ? "层数" : "Layer"}
                  </span>
                  <span className="font-mono text-sm tabular-nums text-ghost-100">
                    {displayState.phase === "idle" ? "—" : displayState.currentLayer} / {tissue.layers}
                  </span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-ink-800">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${displayState.phase === "idle" ? 0 : (displayState.currentLayer / tissue.layers) * 100}%`,
                      background: "linear-gradient(90deg,#3d8bfd,#9b6dff)",
                    }}
                  />
                </div>
              </div>

              {/* Cell viability */}
              <div>
                <div className="flex items-baseline justify-between">
                  <span className="text-[0.65rem] font-mono uppercase tracking-widest text-ghost-300">
                    {lang === "zh" ? "细胞活力" : "Cell Viability"}
                  </span>
                  <span
                    className="font-mono text-sm tabular-nums"
                    style={{ color: viabilityColor(displayState.cellViability) }}
                  >
                    {displayState.phase === "idle" ? "99.0%" : `${displayState.cellViability.toFixed(1)}%`}
                  </span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-ink-800">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${displayState.phase === "idle" ? 99 : displayState.cellViability}%`,
                      background: viabilityColor(displayState.cellViability),
                    }}
                  />
                </div>
              </div>

              {/* Vasculature density */}
              <div>
                <div className="flex items-baseline justify-between">
                  <span className="text-[0.65rem] font-mono uppercase tracking-widest text-ghost-300">
                    {lang === "zh" ? "血管密度" : "Vasculature Density"}
                  </span>
                  <span
                    className="font-mono text-sm tabular-nums"
                    style={{ color: tissue.hasVasculature ? "#ff6b6b" : "rgba(168,211,255,0.3)" }}
                  >
                    {tissue.hasVasculature
                      ? `${displayState.vasculatureDensity.toFixed(0)}%`
                      : lang === "zh" ? "N/A" : "N/A"}
                  </span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-ink-800">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: tissue.hasVasculature ? `${displayState.vasculatureDensity}%` : "0%",
                      background: "#ff6b6b",
                    }}
                  />
                </div>
              </div>

              {/* Print time */}
              <div className="flex items-baseline justify-between border-t border-ghost-100/8 pt-2">
                <span className="text-[0.65rem] font-mono uppercase tracking-widest text-ghost-300">
                  {lang === "zh" ? "打印时间" : "Print Time"}
                </span>
                <span className="font-mono text-sm tabular-nums text-ghost-100">
                  {formatTime(displayState.elapsedMs)}
                </span>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between rounded-lg border px-3 py-2"
                style={{ borderColor: `${statusColor()}30`, background: `${statusColor()}08` }}>
                <span className="text-[0.65rem] font-mono uppercase tracking-widest text-ghost-300">
                  {lang === "zh" ? "状态" : "Status"}
                </span>
                <span
                  className={`text-xs font-mono ${lang === "zh" ? "zh" : ""}`}
                  style={{ color: statusColor() }}
                >
                  <T v={statusLabel()} />
                </span>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="terminal rounded-xl p-4">
            <div className="label-mono mb-2">{lang === "zh" ? "图例" : "Legend"}</div>
            <div className="space-y-1.5 text-[0.68rem]">
              {([
                ["#3d8bfd", { en: "Hydrogel scaffold ink", zh: "水凝胶支架墨水" }],
                ["#e87aaf", { en: "Cell suspension (bio-ink)", zh: "细胞悬液（生物墨水）" }],
                ["#ff6b6b", { en: "Vasculature channels", zh: "血管通道" }],
                ["#2fd4a8", { en: "Tissue maturation", zh: "组织成熟" }],
              ] as [string, { en: string; zh: string }][]).map(([color, label]) => (
                <div key={color} className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: color }} />
                  <span className={`text-ghost-300 ${lang === "zh" ? "zh" : ""}`}><T v={label} /></span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Caveat */}
      <div className="mt-6 h-px rule-signal opacity-20" />
      <p className="mt-4 text-[0.7rem] leading-relaxed text-ghost-500">
        <T
          v={{
            en: "Stylized cartoon — actual bioprinting uses cell viability metrics, scaffold materials (e.g. GelMA, alginate, collagen), and complex post-print maturation protocols. Functional printed skin patches are clinically used today; vascularized full organs remain years away.",
            zh: "风格化的卡通——实际生物打印使用细胞活力指标、支架材料（如 GelMA、藻酸盐、胶原蛋白），与复杂的打印后成熟方案。功能性打印皮肤贴片今日已用于临床；血管化的完整器官，仍数年之外。",
          }}
        />
      </p>
    </div>
  );
}
