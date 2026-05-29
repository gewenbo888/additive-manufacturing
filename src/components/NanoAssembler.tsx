"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useLang, T } from "./lang";

type AtomKind = "C" | "H" | "N" | "O" | "Si";
const ATOM_COLOR: Record<AtomKind, string> = { C:"#3a3a3a", H:"#f0f0f0", N:"#3d8bfd", O:"#e74c3c", Si:"#f5a623" };
const ATOM_RADIUS: Record<AtomKind, number> = { C:5.5, H:3.5, N:5, O:5, Si:6 };
const ATOM_LABEL: Record<AtomKind, string>  = { C:"Carbon", H:"Hydrogen", N:"Nitrogen", O:"Oxygen", Si:"Silicon" };

const FEEDSTOCK_ATOMS: { kind: AtomKind; x: number; y: number }[] = [
  { kind:"C", x:38,  y:34 }, { kind:"C", x:55,  y:28 }, { kind:"C", x:68,  y:38 },
  { kind:"C", x:48,  y:47 }, { kind:"C", x:63,  y:52 }, { kind:"C", x:78,  y:30 },
  { kind:"C", x:72,  y:46 }, { kind:"C", x:42,  y:58 }, { kind:"C", x:88,  y:44 },
  { kind:"H", x:30,  y:55 }, { kind:"H", x:55,  y:62 }, { kind:"H", x:80,  y:58 },
  { kind:"H", x:35,  y:68 }, { kind:"H", x:66,  y:68 }, { kind:"H", x:88,  y:62 },
  { kind:"N", x:100, y:30 }, { kind:"N", x:110, y:50 }, { kind:"N", x:100, y:65 },
  { kind:"O", x:120, y:34 }, { kind:"O", x:130, y:52 }, { kind:"O", x:115, y:65 },
  { kind:"Si",x:140, y:32 }, { kind:"Si",x:148, y:50 }, { kind:"Si",x:136, y:60 },
];

type StructureId = "nanotube" | "diamond" | "dna" | "gear";

interface TargetAtom { x: number; y: number; kind: AtomKind }

function buildNanotube(): TargetAtom[] {
  const atoms: TargetAtom[] = [];
  const cx = 370, cy = 220, cols = 12, hx = 14, hy = 12;
  for (let row = 0; row < 5; row++)
    for (let col = 0; col < cols; col++)
      atoms.push({ x: cx - (cols/2)*hx + col*hx + (row%2)*(hx/2), y: cy - 30 + row*hy, kind:"C" });
  return atoms.slice(0, 60);
}

function buildDiamond(): TargetAtom[] {
  const atoms: TargetAtom[] = [];
  const cx = 370, cy = 220, unit = 22;
  for (let ix = -2; ix <= 2; ix++)
    for (let iy = -2; iy <= 2; iy++) {
      const proj = (ix + iy) * 0.5;
      const x = cx + ix*unit - proj*7, y = cy + iy*unit*0.75;
      atoms.push({ x, y, kind:"C" });
      if (Math.abs(ix) < 2 && Math.abs(iy) < 2)
        atoms.push({ x: x + unit*0.5-3, y: y + unit*0.375, kind:"C" });
    }
  return atoms.slice(0, 40);
}

function buildDNA(): TargetAtom[] {
  const atoms: TargetAtom[] = [];
  const cx = 310, cy = 180, steps = 40;
  for (let i = 0; i < steps; i++) {
    const t = i/(steps-1), x = cx + i*9, amp = 28;
    const kindA: AtomKind = i%3===0?"N":i%3===1?"H":"O";
    const kindB: AtomKind = i%3===0?"O":i%3===1?"N":"H";
    atoms.push({ x, y: cy + Math.sin(t*Math.PI*4)*amp, kind:kindA });
    atoms.push({ x, y: cy + Math.sin(t*Math.PI*4+Math.PI)*amp, kind:kindB });
  }
  return atoms.slice(0, 80);
}

function buildGear(): TargetAtom[] {
  const atoms: TargetAtom[] = [];
  const cx = 370, cy = 220, r = 55, toothLen = 14;
  for (let i = 0; i < 24; i++) {
    const a = (i/24)*Math.PI*2;
    atoms.push({ x: cx+Math.cos(a)*r, y: cy+Math.sin(a)*r, kind:"C" });
  }
  for (let i = 0; i < 8; i++) {
    const a = (i/8)*Math.PI*2 + Math.PI/8;
    atoms.push({ x: cx+Math.cos(a)*(r+toothLen), y: cy+Math.sin(a)*(r+toothLen), kind:"C" });
  }
  return atoms.slice(0, 32);
}

const STRUCTURES: Record<StructureId, { label: { en: string; zh: string }; build: () => TargetAtom[]; totalLabel: number }> = {
  nanotube: { label: { en: "Carbon Nanotube", zh: "碳纳米管" },        build: buildNanotube, totalLabel: 60 },
  diamond:  { label: { en: "Diamond Crystal", zh: "金刚石晶格" },       build: buildDiamond,  totalLabel: 40 },
  dna:      { label: { en: "DNA Origami",      zh: "DNA 折纸" },        build: buildDNA,      totalLabel: 80 },
  gear:     { label: { en: "Nano-Gear",         zh: "纳米齿轮" },        build: buildGear,     totalLabel: 32 },
};

const W = 600, H = 440;
const IDLE_TIP = { x: 240, y: 60 };

type Phase = "idle" | "to-feedstock" | "to-target" | "to-idle";

interface ArmState {
  tipX: number; tipY: number;
  carriedAtom: AtomKind | null;
  carriedAtomIdx: number;
  targetIdx: number;
  phase: Phase;
  phaseT: number;
  trailPoints: { x: number; y: number }[];
}

const lerp = (a: number, b: number, t: number) => a + (b-a)*t;
const easeInOut = (t: number) => t < 0.5 ? 2*t*t : -1+(4-2*t)*t;

export default function NanoAssembler() {
  const { lang } = useLang();

  const [structureId, setStructureId] = useState<StructureId>("nanotube");
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<1|4|16>(1);
  const [placed, setPlaced] = useState(0);
  const [status, setStatus] = useState<"idle"|"picking"|"placing"|"complete">("idle");
  const [complete, setComplete] = useState(false);
  const [targetAtoms, setTargetAtoms] = useState<TargetAtom[]>(() => STRUCTURES.nanotube.build());
  const [placedFlags, setPlacedFlags] = useState<boolean[]>(() => new Array(60).fill(false));

  const rafRef = useRef<number|null>(null);
  const lastTimeRef = useRef<number>(0);
  const armRef = useRef<ArmState>({
    tipX: IDLE_TIP.x, tipY: IDLE_TIP.y,
    carriedAtom: null, carriedAtomIdx: 0,
    targetIdx: 0, phase: "idle", phaseT: 0, trailPoints: [],
  });
  const playingRef = useRef(playing);
  const speedRef = useRef(speed);
  const placedFlagsRef = useRef(placedFlags);

  useEffect(() => { playingRef.current = playing; }, [playing]);
  useEffect(() => { speedRef.current = speed; }, [speed]);
  useEffect(() => { placedFlagsRef.current = placedFlags; }, [placedFlags]);

  const armLineRef = useRef<SVGLineElement>(null);
  const armTipRef  = useRef<SVGPolygonElement>(null);
  const armDotRef  = useRef<SVGCircleElement>(null);
  const carriedRef = useRef<SVGCircleElement>(null);
  const trailRef   = useRef<SVGPolylineElement>(null);

  const resetToStructure = useCallback((id: StructureId) => {
    const atoms = STRUCTURES[id].build();
    const blank = new Array(atoms.length).fill(false);
    setStructureId(id); setTargetAtoms(atoms); setPlacedFlags(blank);
    placedFlagsRef.current = blank;
    setPlaced(0); setPlaying(false); setStatus("idle"); setComplete(false);
    armRef.current = { tipX:IDLE_TIP.x, tipY:IDLE_TIP.y, carriedAtom:null,
      carriedAtomIdx:0, targetIdx:0, phase:"idle", phaseT:0, trailPoints:[] };
  }, []);

  const tick = useCallback((ts: number) => {
    const dt = Math.min(ts - lastTimeRef.current, 100) / 1000;
    lastTimeRef.current = ts;
    const arm = armRef.current;
    const dtScaled = dt * speedRef.current;
    const DUR_TO_FEED = 0.30, DUR_TO_TARGET = 0.50, DUR_TO_IDLE = 0.30;

    if (!playingRef.current) { rafRef.current = requestAnimationFrame(tick); return; }

    const flags = placedFlagsRef.current;
    const total = flags.length;
    const nextIdx = arm.targetIdx;
    if (nextIdx >= total) { rafRef.current = requestAnimationFrame(tick); return; }

    const feed = FEEDSTOCK_ATOMS[arm.carriedAtomIdx % FEEDSTOCK_ATOMS.length];
    const tgt = { x: targetAtoms[nextIdx]?.x ?? 300, y: targetAtoms[nextIdx]?.y ?? 200 };

    if (arm.phase === "idle") {
      arm.phase = "to-feedstock";
      arm.phaseT = 0;
    }

    if (arm.phase === "to-feedstock") {
      arm.phaseT += dtScaled / DUR_TO_FEED;
      if (arm.phaseT >= 1) {
        arm.phaseT = 1;
        arm.phase = "to-target";
        arm.carriedAtom = targetAtoms[nextIdx]?.kind ?? "C";
        setStatus("picking");
      }
      const et = easeInOut(Math.min(arm.phaseT, 1));
      arm.tipX = lerp(IDLE_TIP.x, feed.x, et);
      arm.tipY = lerp(IDLE_TIP.y, feed.y, et);
    } else if (arm.phase === "to-target") {
      arm.phaseT += dtScaled / DUR_TO_TARGET;
      if (arm.phaseT >= 1) {
        arm.phaseT = 1;
        arm.phase = "to-idle";
        setStatus("placing");
      }
      const et = easeInOut(Math.min(arm.phaseT, 1));
      arm.tipX = lerp(feed.x, tgt.x, et);
      arm.tipY = lerp(feed.y, tgt.y, et);
    } else if (arm.phase === "to-idle") {
      arm.phaseT += dtScaled / DUR_TO_IDLE;
      if (arm.phaseT >= 1) {
        // atom placed
        arm.phaseT = 0;
        arm.phase = "idle";
        arm.carriedAtom = null;
        arm.carriedAtomIdx += 1;
        const newIdx = nextIdx + 1;
        arm.targetIdx = newIdx;
        const newFlags = [...placedFlagsRef.current];
        newFlags[nextIdx] = true;
        setPlacedFlags(newFlags);
        placedFlagsRef.current = newFlags;
        setPlaced(newIdx);
        if (newIdx >= total) {
          setStatus("complete"); setComplete(true);
          setPlaying(false); playingRef.current = false;
        } else { setStatus("idle"); }
      }
      const et = easeInOut(Math.min(arm.phaseT, 1));
      arm.tipX = lerp(tgt.x, IDLE_TIP.x, et);
      arm.tipY = lerp(tgt.y, IDLE_TIP.y, et);
    }

    // trail
    arm.trailPoints.push({ x: arm.tipX, y: arm.tipY });
    if (arm.trailPoints.length > 20) arm.trailPoints.shift();

    const px = arm.tipX, py = arm.tipY;
    const pivotX = W/2-30, pivotY = 35;
    if (armLineRef.current) {
      armLineRef.current.setAttribute("x1", String(pivotX));
      armLineRef.current.setAttribute("y1", String(pivotY));
      armLineRef.current.setAttribute("x2", String(px));
      armLineRef.current.setAttribute("y2", String(py));
    }
    const tipSize = 8;
    if (armTipRef.current) {
      const pts = `${px},${py} ${px - tipSize},${py - tipSize * 1.6} ${px + tipSize},${py - tipSize * 1.6}`;
      armTipRef.current.setAttribute("points", pts);
    }
    if (armDotRef.current) {
      armDotRef.current.setAttribute("cx", String(pivotX));
      armDotRef.current.setAttribute("cy", String(pivotY));
    }
    if (carriedRef.current) {
      if (arm.carriedAtom) {
        const color = ATOM_COLOR[arm.carriedAtom];
        carriedRef.current.setAttribute("cx", String(px));
        carriedRef.current.setAttribute("cy", String(py - tipSize * 2.2));
        carriedRef.current.setAttribute("r", String(ATOM_RADIUS[arm.carriedAtom]));
        carriedRef.current.setAttribute("fill", color);
        carriedRef.current.setAttribute("opacity", "1");
      } else {
        carriedRef.current.setAttribute("opacity", "0");
      }
    }
    if (trailRef.current) {
      const pts = arm.trailPoints.map(p => `${p.x},${p.y}`).join(" ");
      trailRef.current.setAttribute("points", pts);
    }

    rafRef.current = requestAnimationFrame(tick);
  }, [targetAtoms]);

  useEffect(() => {
    lastTimeRef.current = performance.now();
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current !== null) cancelAnimationFrame(rafRef.current); };
  }, [tick]);

  const total = targetAtoms.length;
  const rateAtSec = speed === 16 ? "≈14" : speed === 4 ? "≈3.5" : "≈0.9";
  const statusLabel = {
    idle:     { en: "Idle · 待机",      zh: "待机" },
    picking:  { en: "Picking · 拾取",   zh: "拾取中" },
    placing:  { en: "Placing · 放置",   zh: "放置中" },
    complete: { en: "Complete · 完成",  zh: "完成" },
  }[status];

  const statusColor = status === "complete"
    ? "text-mint-400" : status === "idle"
    ? "text-ghost-300" : "text-signal-400";

  function buildBonds(atoms: TargetAtom[], flags: boolean[]): { x1:number;y1:number;x2:number;y2:number }[] {
    const bonds: { x1:number;y1:number;x2:number;y2:number }[] = [];
    const p = atoms.filter((_, i) => flags[i]);
    for (let i = 0; i < p.length; i++)
      for (let j = i+1; j < p.length; j++) {
        const dx = p[i].x-p[j].x, dy = p[i].y-p[j].y;
        if (dx*dx+dy*dy < 576) bonds.push({ x1:p[i].x,y1:p[i].y,x2:p[j].x,y2:p[j].y });
      }
    return bonds;
  }

  const bonds = buildBonds(targetAtoms, placedFlags);

  return (
    <section className="space-y-6">
      {/* section header */}
      <div>
        <div className="label-mono text-signal-400 mb-1">System 08 · Nano-Assembly</div>
        <h2 className="display text-2xl text-ghost-50">
          <T v={{ en: "Molecular Assembler", zh: "分子装配器" }} />
        </h2>
        <div className="rule-signal h-px w-24 mt-2" />
      </div>

      {/* main grid */}
      <div className="grid lg:grid-cols-[minmax(0,1fr)_320px] gap-5">

        {/* ── left: atomic stage SVG ── */}
        <div className="holo rounded-xl p-3 overflow-hidden">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            width="100%"
            style={{ maxHeight: "440px", display: "block" }}
            aria-label="Nano-assembler atomic stage"
          >
            {/* grid backdrop */}
            <defs>
              <pattern id="nano-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(168,211,255,0.04)" strokeWidth="0.5" />
              </pattern>
              <radialGradient id="build-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#3d8bfd" stopOpacity="0.08" />
                <stop offset="100%" stopColor="transparent" stopOpacity="0" />
              </radialGradient>
              <filter id="atom-glow">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <filter id="complete-glow">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            {/* grid */}
            <rect width={W} height={H} fill="url(#nano-grid)" />

            {/* feedstock reservoir */}
            <rect x="12" y="12" width="172" height="96" rx="6"
              fill="rgba(10,14,22,0.85)" stroke="rgba(61,139,253,0.20)" strokeWidth="1" />
            <text x="18" y="26" fill="#a8d3ff" fontSize="7.5" fontFamily="JetBrains Mono" letterSpacing="1.5" textAnchor="start">
              FEEDSTOCK RESERVOIR
            </text>
            {FEEDSTOCK_ATOMS.map((a, i) => (
              <circle key={i} cx={a.x} cy={a.y} r={ATOM_RADIUS[a.kind]}
                fill={ATOM_COLOR[a.kind]}
                stroke="rgba(255,255,255,0.18)" strokeWidth="0.8"
                opacity="0.88" />
            ))}

            {/* legend */}
            {(["C", "H", "N", "O", "Si"] as AtomKind[]).map((k, i) => (
              <g key={k} transform={`translate(${196 + i * 80}, 14)`}>
                <circle r="5" fill={ATOM_COLOR[k]} stroke="rgba(255,255,255,0.15)" strokeWidth="0.7" />
                <text x="9" y="4" fill="#8c95a8" fontSize="7" fontFamily="JetBrains Mono">
                  {ATOM_LABEL[k].slice(0, 2)}
                </text>
              </g>
            ))}

            {/* build region backdrop */}
            <rect x="195" y="100" width="395" height="325" rx="8"
              fill="rgba(8,11,18,0.72)" stroke="rgba(61,139,253,0.10)" strokeWidth="1" />
            <rect x="195" y="100" width="395" height="325" rx="8" fill="url(#build-glow)" />
            <text x="203" y="116" fill="#596174" fontSize="7" fontFamily="JetBrains Mono" letterSpacing="1.5">
              BUILD REGION · 10 Å GRID
            </text>

            {/* bonds */}
            {bonds.map((b, i) => (
              <line key={i} x1={b.x1} y1={b.y1} x2={b.x2} y2={b.y2}
                stroke={complete ? "#2fd4a8" : "rgba(168,211,255,0.35)"} strokeWidth="1.2"
                opacity={complete ? 0.8 : 0.5}
              />
            ))}

            {/* placed atoms */}
            {targetAtoms.map((a, i) =>
              placedFlags[i] ? (
                <circle key={i} cx={a.x} cy={a.y} r={ATOM_RADIUS[a.kind]}
                  fill={complete ? "#2fd4a8" : ATOM_COLOR[a.kind]}
                  stroke={complete ? "#9bf0d8" : "rgba(255,255,255,0.22)"}
                  strokeWidth="0.8"
                  filter={complete ? "url(#complete-glow)" : "url(#atom-glow)"}
                />
              ) : (
                <circle key={i} cx={a.x} cy={a.y} r={ATOM_RADIUS[a.kind] * 0.55}
                  fill="none" stroke="rgba(168,211,255,0.08)" strokeWidth="0.7" strokeDasharray="2 2" />
              )
            )}

            {/* arm trail */}
            <polyline ref={trailRef} points=""
              fill="none" stroke="rgba(155,109,255,0.22)" strokeWidth="1.5"
              strokeLinecap="round" strokeLinejoin="round" />

            {/* arm: pivot → tip line */}
            <line ref={armLineRef}
              x1={W / 2 - 30} y1={35}
              x2={IDLE_TIP.x} y2={IDLE_TIP.y}
              stroke="#6fb2ff" strokeWidth="1.6" opacity="0.75" strokeLinecap="round" />

            {/* pivot dot */}
            <circle ref={armDotRef} cx={W / 2 - 30} cy={35} r="5"
              fill="#3d8bfd" stroke="#a8d3ff" strokeWidth="1" />
            <circle cx={W / 2 - 30} cy={35} r="9"
              fill="none" stroke="rgba(61,139,253,0.22)" strokeWidth="1" />

            {/* arm tip (tooltip triangle) */}
            <polygon ref={armTipRef}
              points={`${IDLE_TIP.x},${IDLE_TIP.y} ${IDLE_TIP.x - 8},${IDLE_TIP.y - 13} ${IDLE_TIP.x + 8},${IDLE_TIP.y - 13}`}
              fill="#3d8bfd" stroke="#a8d3ff" strokeWidth="0.8" opacity="0.90" />

            {/* carried atom (hidden initially) */}
            <circle ref={carriedRef} cx={IDLE_TIP.x} cy={IDLE_TIP.y - 18} r="5"
              fill="#3a3a3a" opacity="0" />

            {/* arm label */}
            <text x={W / 2 - 24} y={28} fill="#6fb2ff" fontSize="7" fontFamily="JetBrains Mono" letterSpacing="1">
              ASSEMBLER ARM
            </text>
          </svg>
        </div>

        {/* ── right: controls + readouts + caveat ── */}
        <div className="flex flex-col gap-4">

          {/* structure picker */}
          <div className="holo rounded-xl p-4 space-y-3">
            <div className="label-mono text-signal-400 mb-1">
              <T v={{ en: "Target Nanostructure", zh: "目标纳米结构" }} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(STRUCTURES) as StructureId[]).map(id => (
                <button
                  key={id}
                  onClick={() => resetToStructure(id)}
                  className={`rounded-lg px-3 py-2 text-left text-xs font-mono transition border
                    ${structureId === id
                      ? "border-signal-500/60 bg-signal-500/12 text-signal-300"
                      : "border-ghost-500/20 bg-ink-900/60 text-ghost-300 hover:border-signal-500/30 hover:text-ghost-100"
                    }`}
                >
                  <div className="font-semibold leading-snug">
                    {STRUCTURES[id].label[lang]}
                  </div>
                  <div className="text-[10px] text-ghost-500 mt-0.5">
                    {STRUCTURES[id].totalLabel} atoms
                  </div>
                </button>
              ))}
            </div>

            {/* controls row */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => setPlaying(p => !p)}
                disabled={complete}
                className="flex-1 rounded-lg py-2 text-xs font-mono font-semibold tracking-widest uppercase transition border
                  border-signal-500/40 bg-signal-500/12 text-signal-300 hover:bg-signal-500/22 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {playing
                  ? <T v={{ en: "⏸ Pause", zh: "⏸ 暂停" }} />
                  : <T v={{ en: "▶ Play",  zh: "▶ 播放" }} />
                }
              </button>
              <button
                onClick={() => resetToStructure(structureId)}
                className="rounded-lg px-3 py-2 text-xs font-mono tracking-widest uppercase transition border
                  border-ghost-500/25 bg-ink-900/70 text-ghost-300 hover:border-signal-400/40 hover:text-ghost-100"
              >
                <T v={{ en: "Reset", zh: "重置" }} />
              </button>
            </div>

            {/* speed */}
            <div className="flex items-center gap-2">
              <span className="label-mono text-ghost-500 text-[10px]">
                <T v={{ en: "Speed", zh: "速度" }} />
              </span>
              {([1, 4, 16] as (1 | 4 | 16)[]).map(s => (
                <button key={s}
                  onClick={() => setSpeed(s)}
                  className={`rounded px-2 py-1 text-[10px] font-mono transition border
                    ${speed === s
                      ? "border-iris-500/60 bg-iris-500/15 text-iris-300"
                      : "border-ghost-500/20 bg-ink-900/50 text-ghost-400 hover:text-ghost-100"
                    }`}>
                  {s}x
                </button>
              ))}
            </div>
          </div>

          {/* readouts */}
          <div className="holo rounded-xl p-4 space-y-2.5">
            <div className="label-mono text-signal-400 mb-1">
              <T v={{ en: "Live Readouts", zh: "实时读数" }} />
            </div>
            {[
              { label: { en: "Atoms Placed",  zh: "已放置原子" }, val: String(placed) },
              { label: { en: "Target Atoms",  zh: "目标原子数" }, val: String(total) },
              { label: { en: "Atom Rate",      zh: "原子速率"  }, val: `${rateAtSec} /s` },
              { label: { en: "Precision",      zh: "精度"      }, val: "Å · 埃级" },
            ].map(row => (
              <div key={row.val + row.label.en}
                className="flex items-center justify-between py-1 border-b border-ghost-500/10 last:border-0">
                <span className="text-[11px] font-mono text-ghost-400">
                  <T v={row.label} />
                </span>
                <span className="text-[11px] font-mono text-ghost-100 tnum">{row.val}</span>
              </div>
            ))}
            {/* progress bar */}
            <div className="h-1.5 rounded-full bg-ink-800 overflow-hidden mt-1">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${total > 0 ? (placed / total) * 100 : 0}%`,
                  background: complete
                    ? "linear-gradient(90deg, #2fd4a8, #9bf0d8)"
                    : "linear-gradient(90deg, #3d8bfd, #9b6dff)",
                }}
              />
            </div>
            {/* status */}
            <div className={`text-center text-xs font-mono mt-1 ${statusColor}`}>
              {statusLabel[lang]}
            </div>
          </div>

          {/* scientific caveat */}
          <div
            className="rounded-xl p-4 space-y-2 text-[11px] leading-relaxed"
            style={{
              background: "linear-gradient(145deg, rgba(30,20,6,0.88), rgba(18,12,3,0.95))",
              border: "1px solid rgba(245,166,35,0.28)",
              boxShadow: "0 0 32px -12px rgba(245,166,35,0.18)",
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span style={{ color: "#f5a623" }} className="text-base">⚠</span>
              <span className="label-mono" style={{ color: "#f5a623", letterSpacing: "0.18em" }}>
                <T v={{ en: "Speculative Technology", zh: "推测性技术" }} />
              </span>
            </div>
            <p style={{ color: "#ffd98c", opacity: 0.85 }}>
              {lang === "en"
                ? "Drexler-style atomically-precise manufacturing is speculative — proposed mechanisms exist on paper but no working assembler has been built. DNA origami, scanning-probe microscopy and self-assembly programmes show that atom-scale precision IS achievable in limited cases; general-purpose molecular manufacturing remains research-decades away."
                : "Drexler 式的原子级精确制造，是推测性的——所提议机制存在于纸面，但尚无可用的组装器被造出。DNA 折纸、扫描探针显微镜与自组装纲领表明，原子级精度在有限情况下「可达」；通用的分子制造，仍是数十年研究之外的事。"
              }
            </p>
          </div>

        </div>{/* end right column */}
      </div>
    </section>
  );
}
