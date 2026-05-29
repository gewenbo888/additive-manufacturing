"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { T, useLang } from "./lang";

// ─── Shape definitions ────────────────────────────────────────────────────────

type ShapeId = "cylinder" | "cube" | "bracket" | "vase";

interface LayerSlice {
  /** SVG path or circle descriptors drawn in the isometric bed plane */
  type: "circle" | "rect" | "path";
  cx?: number; cy?: number; r?: number;
  x?: number; y?: number; w?: number; h?: number;
  d?: string;
}

function getLayerSlice(shape: ShapeId, idx: number, total: number): LayerSlice {
  const t = idx / (total - 1); // 0→1 bottom to top

  if (shape === "cylinder") {
    // Constant radius cylinder
    return { type: "circle", cx: 0, cy: 0, r: 58 };
  }

  if (shape === "cube") {
    const side = 110;
    const notch = idx % 8 === 4; // every 8th layer has a notch slot for variety
    if (notch) {
      const s = side;
      const ns = 28;
      return {
        type: "path",
        d: `M${-s/2},${-s/2} H${-ns/2} V${-s/2-12} H${ns/2} V${-s/2} H${s/2} V${s/2} H${-s/2} Z`,
      };
    }
    return { type: "rect", x: -55, y: -55, w: 110, h: 110 };
  }

  if (shape === "vase") {
    const r = (Math.sin(t * Math.PI) + 0.38) * 62;
    return { type: "circle", cx: 0, cy: 0, r: Math.max(r, 10) };
  }

  if (shape === "bracket") {
    // Seeded deterministic lattice: pick from 4 bracket templates cycling
    const pat = idx % 4;
    if (pat === 0) return { type: "path", d: "M-56,-56 H56 V56 H-56 Z M-32,-32 H32 V32 H-32 Z" };
    if (pat === 1) return { type: "path", d: "M-56,-56 H56 V10 H12 V56 H-12 V10 H-56 Z M-32,-32 H32 V-4 H-32 Z" };
    if (pat === 2) return { type: "path", d: "M-56,-20 H-12 V-56 H12 V-20 H56 V20 H12 V56 H-12 V20 H-56 Z" };
    return { type: "path", d: "M-56,-56 H-20 V-12 H20 V-56 H56 V56 H20 V12 H-20 V56 H-56 Z" };
  }

  return { type: "rect", x: -50, y: -50, w: 100, h: 100 };
}

// Return the bounding radius of a slice (for head trace orbit)
function sliceRadius(shape: ShapeId, idx: number, total: number): number {
  if (shape === "cylinder") return 58;
  if (shape === "cube") return 78;
  if (shape === "vase") {
    const t = idx / (total - 1);
    return (Math.sin(t * Math.PI) + 0.38) * 62 + 8;
  }
  return 78;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TOTAL_LAYERS = 120;
const LAYER_HEIGHT_MM = 0.2; // mm per layer
const LAYER_DURATION_MS = 600; // at 1x speed

const SHAPE_LABELS: Record<ShapeId, { en: string; zh: string }> = {
  cylinder: { en: "Cylinder", zh: "圆柱" },
  cube: { en: "Cube", zh: "立方体" },
  bracket: { en: "Bracket", zh: "支架" },
  vase: { en: "Vase", zh: "花瓶" },
};

// Isometric projection helpers (oblique perspective for print bed)
const ISO_SCALE_X = 0.55;
const ISO_SCALE_Y = 0.28;

function iso(wx: number, wy: number, wz: number) {
  // Simple cabinet oblique: x→right, y→depth (scaled), z→up
  return {
    sx: wx + wy * ISO_SCALE_X,
    sy: -wz + wy * ISO_SCALE_Y,
  };
}

// ─── Layer colors ─────────────────────────────────────────────────────────────

function layerColor(idx: number, total: number): string {
  const t = idx / total;
  // Blend from deep mint to signal-blue up the build
  const r = Math.round(47 + (61 - 47) * t);
  const g = Math.round(212 - (212 - 139) * t);
  const b = Math.round(168 + (253 - 168) * t);
  return `rgb(${r},${g},${b})`;
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function LayerByLayerSim() {
  const { lang } = useLang();

  const [shape, setShape] = useState<ShapeId>("cylinder");
  const [currentLayer, setCurrentLayer] = useState(0);
  const [headAngle, setHeadAngle] = useState(0);   // radians, for perimeter trace
  const [headFill, setHeadFill] = useState(0);     // 0→1 fill pass fraction
  const [phase, setPhase] = useState<"perimeter" | "fill">("perimeter");
  const [running, setRunning] = useState(true);
  const [speed, setSpeed] = useState(2);
  const [elapsed, setElapsed] = useState(0); // seconds at 1x
  const [material, setMaterial] = useState(0); // grams

  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  // Phase progress within current layer (0→1)
  const phaseProgressRef = useRef(0);

  const reset = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    lastTimeRef.current = null;
    phaseProgressRef.current = 0;
    setCurrentLayer(0);
    setHeadAngle(0);
    setHeadFill(0);
    setPhase("perimeter");
    setElapsed(0);
    setMaterial(0);
    setRunning(true);
  }, []);

  // When shape changes, reset
  useEffect(() => {
    reset();
  }, [shape, reset]);

  useEffect(() => {
    if (!running || currentLayer >= TOTAL_LAYERS) return;

    const tick = (ts: number) => {
      if (lastTimeRef.current === null) lastTimeRef.current = ts;
      const dt = (ts - lastTimeRef.current) / 1000; // seconds
      lastTimeRef.current = ts;

      const scaledDt = dt * speed;
      const layerDuration = LAYER_DURATION_MS / 1000;
      const half = layerDuration / 2;

      phaseProgressRef.current += scaledDt;

      if (phase === "perimeter") {
        const p = Math.min(phaseProgressRef.current / half, 1);
        setHeadAngle(p * 2 * Math.PI);
        setHeadFill(0);
        if (phaseProgressRef.current >= half) {
          phaseProgressRef.current -= half;
          setPhase("fill");
        }
      } else {
        const p = Math.min(phaseProgressRef.current / half, 1);
        setHeadFill(p);
        setHeadAngle(0);
        if (phaseProgressRef.current >= half) {
          phaseProgressRef.current -= half;
          const nextLayer = currentLayer + 1;
          if (nextLayer >= TOTAL_LAYERS) {
            setCurrentLayer(TOTAL_LAYERS);
            setRunning(false);
            return;
          }
          setCurrentLayer(nextLayer);
          setPhase("perimeter");
          setElapsed(e => e + layerDuration / speed);
          setMaterial(m => m + 0.012 + Math.random() * 0.004);
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTimeRef.current = null;
    };
  }, [running, currentLayer, phase, speed]);

  // ── Derived display values ────────────────────────────────────────────────

  const progress = currentLayer / TOTAL_LAYERS;
  const buildHeightMm = (currentLayer * LAYER_HEIGHT_MM).toFixed(1);
  const hh = String(Math.floor(elapsed / 3600)).padStart(2, "0");
  const mm = String(Math.floor((elapsed % 3600) / 60)).padStart(2, "0");
  const ss = String(Math.floor(elapsed % 60)).padStart(2, "0");
  const timeStr = `${hh}:${mm}:${ss}`;
  const materialStr = material.toFixed(2);

  // Print head world position (for readout, mocked plausibly)
  const r = sliceRadius(shape, currentLayer, TOTAL_LAYERS);
  const headX = (phase === "perimeter" ? Math.cos(headAngle) * r : (headFill - 0.5) * r * 1.8).toFixed(1);
  const headY = (phase === "perimeter" ? Math.sin(headAngle) * r : (headFill - 0.5) * r * 0.6).toFixed(1);
  const headZ = (currentLayer * LAYER_HEIGHT_MM).toFixed(1);

  // Process callout text
  const callout = progress < 0.25
    ? { en: "First-layer adhesion is everything. Bed leveling, temperature, speed.", zh: "首层附着力至关重要。调平床面、温度与速度。" }
    : progress < 0.75
    ? { en: "Infill + perimeters. The lattice you don't see does most of the work.", zh: "内填充与外轮廓。看不见的晶格结构承担了大部分负载。" }
    : { en: "Top solid layers seal the print. Cooling matters.", zh: "顶层实心层封闭打印件。冷却至关重要。" };

  // ── SVG geometry ─────────────────────────────────────────────────────────

  // SVG viewport: 520×420, origin at (260, 350) for the bed surface
  const SX = 260; // svg origin x
  const SY = 310; // svg origin y (bed level)
  const WORLD_SCALE = 1.3;

  function worldToSvg(wx: number, wy: number, wz: number) {
    const { sx, sy } = iso(wx * WORLD_SCALE, wy * WORLD_SCALE, wz * WORLD_SCALE);
    return { x: SX + sx, y: SY + sy };
  }

  // Build layers to draw (isometric stacks)
  const layersToDraw = Math.min(currentLayer, TOTAL_LAYERS);
  const layerThicknessPx = 2.6;

  // Compute SVG path for a layer outline given LayerSlice
  function sliceToSvgPath(slice: LayerSlice, layerIdx: number): string {
    const zBase = layerIdx * layerThicknessPx;

    if (slice.type === "circle") {
      const cx = slice.cx ?? 0;
      const cy = slice.cy ?? 0;
      const rr = slice.r ?? 50;
      // Approximate ellipse for isometric view: sample 24 points
      const pts: string[] = [];
      const N = 28;
      for (let i = 0; i <= N; i++) {
        const a = (i / N) * 2 * Math.PI;
        const wx = cx + Math.cos(a) * rr;
        const wy = cy + Math.sin(a) * rr;
        const p = worldToSvg(wx, wy, zBase);
        pts.push(`${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`);
      }
      return pts.join(" ") + " Z";
    }

    if (slice.type === "rect") {
      const x = slice.x ?? -50; const y = slice.y ?? -50;
      const w = slice.w ?? 100; const h = slice.h ?? 100;
      const corners = [
        [x, y], [x + w, y], [x + w, y + h], [x, y + h],
      ] as [number, number][];
      return corners.map(([wx, wy], i) => {
        const p = worldToSvg(wx, wy, zBase);
        return `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`;
      }).join(" ") + " Z";
    }

    if (slice.type === "path") {
      // Parse simple SVG path (only M/H/V/Z commands from our templates)
      const d = slice.d ?? "";
      let cx2 = 0; let cy2 = 0;
      const result: string[] = [];
      const tokens = d.match(/[MHVLZ][^MHVLZ]*/g) ?? [];
      for (const tok of tokens) {
        const cmd = tok[0];
        const nums = tok.slice(1).trim().split(/[\s,]+/).filter(Boolean).map(Number);
        if (cmd === "M" || cmd === "L") {
          cx2 = nums[0]; cy2 = nums[1];
          const p = worldToSvg(cx2, cy2, zBase);
          result.push(`${cmd}${p.x.toFixed(1)},${p.y.toFixed(1)}`);
        } else if (cmd === "H") {
          cx2 = nums[0];
          const p = worldToSvg(cx2, cy2, zBase);
          result.push(`L${p.x.toFixed(1)},${p.y.toFixed(1)}`);
        } else if (cmd === "V") {
          cy2 = nums[0];
          const p = worldToSvg(cx2, cy2, zBase);
          result.push(`L${p.x.toFixed(1)},${p.y.toFixed(1)}`);
        } else if (cmd === "Z") {
          result.push("Z");
        }
      }
      return result.join(" ");
    }

    return "";
  }

  // Active layer: the current-printing layer shows partial fill (fill pass)
  const activeSlice = getLayerSlice(shape, currentLayer, TOTAL_LAYERS);
  const activeR = sliceRadius(shape, currentLayer, TOTAL_LAYERS);

  // Print head SVG position
  const headWX = phase === "perimeter"
    ? Math.cos(headAngle) * (activeR - 4)
    : (headFill - 0.5) * activeR * 1.6;
  const headWY = phase === "perimeter"
    ? Math.sin(headAngle) * (activeR - 4)
    : (headFill - 0.3) * activeR * 0.5;
  const headPos = worldToSvg(headWX, headWY, layersToDraw * layerThicknessPx);

  // Next slice ghost (one layer ahead)
  const nextLayerIdx = Math.min(currentLayer + 1, TOTAL_LAYERS - 1);
  const nextSlice = getLayerSlice(shape, nextLayerIdx, TOTAL_LAYERS);
  const nextSlicePath = sliceToSvgPath(nextSlice, layersToDraw + 1);

  // Gantry rail positions
  const rail1 = worldToSvg(-90, -90, 0);
  const rail2 = worldToSvg(90, -90, 0);
  const rail1Top = worldToSvg(-90, -90, TOTAL_LAYERS * layerThicknessPx + 30);
  const rail2Top = worldToSvg(90, -90, TOTAL_LAYERS * layerThicknessPx + 30);

  // Bed plate corners (parallelogram in iso)
  const bedCorners = [[-110, -110], [110, -110], [110, 110], [-110, 110]] as [number, number][];
  const bedPath = bedCorners.map(([wx, wy], i) => {
    const p = worldToSvg(wx, wy, 0);
    return `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`;
  }).join(" ") + " Z";

  return (
    <section className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-baseline gap-3">
        <h2 className="display text-2xl text-ghost-50">
          <T v={{ en: "Layer-by-Layer Construction", zh: "层叠构造" }} />
        </h2>
        <span className="label-mono opacity-60">SIM</span>
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-[minmax(0,1fr)_320px] gap-4">

        {/* ── Left: Print stage ──────────────────────────────────────────── */}
        <div className="holo rounded-xl p-3 flex items-center justify-center min-h-[420px]">
          <svg viewBox="0 0 520 420" width="100%" height="420"
            style={{ maxWidth: 520 }} aria-label="3D print simulation">
            {/* Gantry rails */}
            <line x1={rail1.x} y1={rail1.y} x2={rail1Top.x} y2={rail1Top.y}
              stroke="rgba(168,211,255,0.15)" strokeWidth="1.5" />
            <line x1={rail2.x} y1={rail2.y} x2={rail2Top.x} y2={rail2Top.y}
              stroke="rgba(168,211,255,0.15)" strokeWidth="1.5" />
            {/* Cross gantry at head height */}
            {running && (
              <line
                x1={worldToSvg(-90, -90, layersToDraw * layerThicknessPx + 12).x}
                y1={worldToSvg(-90, -90, layersToDraw * layerThicknessPx + 12).y}
                x2={worldToSvg(90, -90, layersToDraw * layerThicknessPx + 12).x}
                y2={worldToSvg(90, -90, layersToDraw * layerThicknessPx + 12).y}
                stroke="rgba(168,211,255,0.22)" strokeWidth="1" />
            )}
            {/* Bed plate */}
            <path d={bedPath} fill="rgba(30,36,52,0.9)"
              stroke="rgba(61,139,253,0.35)" strokeWidth="1.5" />
            {/* Bed grid lines */}
            {[-60, -20, 20, 60].map(v => {
              const a = worldToSvg(v, -110, 0);
              const b = worldToSvg(v, 110, 0);
              const c = worldToSvg(-110, v, 0);
              const d2 = worldToSvg(110, v, 0);
              return (
                <g key={v}>
                  <line x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                    stroke="rgba(61,139,253,0.12)" strokeWidth="0.7" />
                  <line x1={c.x} y1={c.y} x2={d2.x} y2={d2.y}
                    stroke="rgba(61,139,253,0.12)" strokeWidth="0.7" />
                </g>
              );
            })}

            {/* Completed layers — draw as filled isometric slabs */}
            {Array.from({ length: layersToDraw }).map((_, i) => {
              const slice = getLayerSlice(shape, i, TOTAL_LAYERS);
              const pathD = sliceToSvgPath(slice, i);
              const fill = layerColor(i, TOTAL_LAYERS);
              const opacity = 0.72 + (i / TOTAL_LAYERS) * 0.22;
              return (
                <path key={i} d={pathD}
                  fill={fill} fillOpacity={opacity}
                  stroke="rgba(0,0,0,0.18)" strokeWidth="0.4" />
              );
            })}

            {/* Active (currently printing) layer — fill hatch */}
            {currentLayer < TOTAL_LAYERS && (
              <>
                <path d={sliceToSvgPath(activeSlice, layersToDraw)}
                  fill="#3d8bfd" fillOpacity={0.18}
                  stroke="#3d8bfd" strokeWidth="1" strokeOpacity={0.5} />
                {/* Partial fill progress overlay */}
                {phase === "fill" && (
                  <path d={sliceToSvgPath(activeSlice, layersToDraw)}
                    fill="#2fd4a8" fillOpacity={headFill * 0.55}
                    stroke="none" />
                )}
              </>
            )}

            {/* Next-slice ghost */}
            {currentLayer < TOTAL_LAYERS - 1 && (
              <path d={nextSlicePath}
                fill="none"
                stroke="#3d8bfd" strokeWidth="1"
                strokeOpacity={0.25} strokeDasharray="4 3" />
            )}

            {/* Print head */}
            {currentLayer < TOTAL_LAYERS && (
              <g>
                {/* Glow */}
                <circle cx={headPos.x} cy={headPos.y} r="9"
                  fill="#3d8bfd" fillOpacity="0.18" />
                {/* Core */}
                <circle cx={headPos.x} cy={headPos.y} r="4.5"
                  fill="#3d8bfd" fillOpacity="0.95" />
                {/* Hot tip spark */}
                <circle cx={headPos.x} cy={headPos.y} r="2"
                  fill="white" fillOpacity="0.85" />
                {/* Extrusion trail */}
                <circle cx={headPos.x} cy={headPos.y + 3} r="1.5"
                  fill="#2fd4a8" fillOpacity="0.6" />
              </g>
            )}

            {/* Done indicator */}
            {currentLayer >= TOTAL_LAYERS && (
              <text x={SX} y={SY - (TOTAL_LAYERS * layerThicknessPx) - 18}
                textAnchor="middle" fill="#2fd4a8" fontSize="11"
                fontFamily="JetBrains Mono, monospace" letterSpacing="2">
                PRINT COMPLETE
              </text>
            )}
          </svg>
        </div>

        {/* ── Right column ───────────────────────────────────────────────── */}
        <div className="flex flex-col gap-3">

          {/* Shape picker */}
          <div className="holo rounded-xl p-4 space-y-2">
            <p className="label-mono mb-2">
              <T v={{ en: "Shape", zh: "形状" }} />
            </p>
            <div className="grid grid-cols-2 gap-2">
              {(["cylinder", "cube", "bracket", "vase"] as ShapeId[]).map(s => (
                <button
                  key={s}
                  onClick={() => setShape(s)}
                  className={`rounded-lg px-3 py-2 text-xs mono transition-all border ${
                    shape === s
                      ? "border-signal-400/70 bg-signal-500/20 text-ghost-50 signal-text"
                      : "border-ghost-200/10 bg-ink-900/40 text-ghost-300 hover:border-signal-400/40 hover:text-ghost-100"
                  }`}
                >
                  <T v={SHAPE_LABELS[s]} />
                </button>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="holo rounded-xl p-4 space-y-3">
            <p className="label-mono mb-1">
              <T v={{ en: "Controls", zh: "控制" }} />
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setRunning(r => !r)}
                className="flex-1 rounded-lg py-2 text-xs mono border border-signal-400/40 bg-signal-500/15 text-ghost-100 hover:bg-signal-500/25 transition-all"
              >
                {running
                  ? <T v={{ en: "Pause", zh: "暂停" }} />
                  : <T v={{ en: "Play", zh: "播放" }} />}
              </button>
              <button
                onClick={reset}
                className="flex-1 rounded-lg py-2 text-xs mono border border-ghost-200/15 bg-ink-900/40 text-ghost-300 hover:border-signal-400/40 hover:text-ghost-100 transition-all"
              >
                <T v={{ en: "Reset", zh: "重置" }} />
              </button>
            </div>
            {/* Speed */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="label-mono text-[0.58rem]">
                  <T v={{ en: "Speed", zh: "速度" }} />
                </span>
                <span className="mono text-xs text-signal-400">{speed}×</span>
              </div>
              <input
                type="range" min={1} max={8} step={1} value={speed}
                onChange={e => setSpeed(Number(e.target.value))}
                className="w-full accent-signal-400 h-1.5 rounded-full cursor-pointer"
              />
            </div>
          </div>

          {/* Readouts */}
          <div className="holo rounded-xl p-4 space-y-2">
            <p className="label-mono mb-2">
              <T v={{ en: "Readouts", zh: "读数" }} />
            </p>
            <div className="grid grid-cols-2 gap-x-3 gap-y-2">
              {[
                { label: { en: "Layer", zh: "层" }, val: `${currentLayer} / ${TOTAL_LAYERS}` },
                { label: { en: "Time", zh: "时间" }, val: timeStr },
                { label: { en: "Material", zh: "材料" }, val: `${materialStr} g` },
                { label: { en: "Height", zh: "高度" }, val: `${buildHeightMm} mm` },
              ].map(({ label, val }) => (
                <div key={val + String(label.en)} className="space-y-0.5">
                  <p className="label-mono text-[0.55rem] opacity-60">
                    <T v={label} />
                  </p>
                  <p className="mono text-sm text-ghost-50 tnum">{val}</p>
                </div>
              ))}
            </div>

            {/* Head position */}
            <div className="mt-1 pt-2 border-t border-ghost-200/8 space-y-0.5">
              <p className="label-mono text-[0.55rem] opacity-60">
                <T v={{ en: "Head position", zh: "打印头位置" }} />
              </p>
              <p className="mono text-xs text-signal-400 tnum">
                ({headX}, {headY}, {headZ}) mm
              </p>
            </div>

            {/* Progress bar */}
            <div className="mt-1 pt-2 border-t border-ghost-200/8 space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="label-mono text-[0.55rem] opacity-60">
                  <T v={{ en: "Progress", zh: "进度" }} />
                </span>
                <span className="mono text-xs text-mint-400 tnum">
                  {(progress * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-ink-800/60 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${progress * 100}%`,
                    background: "linear-gradient(90deg, #2fd4a8, #3d8bfd)",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Process callout */}
          <div className="holo rounded-xl p-4 space-y-2 flex-1">
            <p className="label-mono text-[0.6rem]">
              <T v={{ en: "What's happening", zh: "发生了什么" }} />
            </p>
            <div
              className="h-1 w-12 rounded-full mb-2 rule-signal"
              style={{ opacity: 0.6 }}
            />
            <p className="text-xs text-ghost-200 leading-relaxed">
              <T v={callout} />
            </p>
            <p className="mono text-[0.6rem] text-signal-400 opacity-50 pt-1">
              {phase === "perimeter"
                ? <T v={{ en: "Tracing perimeter…", zh: "描绘轮廓…" }} />
                : <T v={{ en: "Filling infill…", zh: "填充内部…" }} />
              }
            </p>
          </div>

        </div>
      </div>

      {/* Caveat */}
      <p className="text-[0.7rem] text-ghost-300/50 leading-relaxed border-t border-ghost-200/8 pt-4">
        <T v={{
          en: "A stylized visualization. Real printers vary in head type (extruder, laser, jetted droplets), motion system (Cartesian, Delta, robotic arm) and material — but the slice-and-deposit logic is universal.",
          zh: "一种风格化的可视化。真实打印机在打印头类型（挤出、激光、喷射液滴）、运动系统（笛卡尔、Delta、机械臂）与材料上各不相同——但「切片-沉积」的逻辑是普适的。"
        }} />
      </p>
    </section>
  );
}
