"use client";

import { ReactNode } from "react";
import { LangProvider, LangToggle, T, useLang } from "./lang";
import { SECTIONS, FUTURES, BIG_QUESTIONS } from "./content";
import ProductField from "./ProductField";
import LayerByLayerSim from "./LayerByLayerSim";
import CapabilityLadder from "./CapabilityLadder";
import MaterialsLab from "./MaterialsLab";
import NeedValueMap from "./NeedValueMap";
import AIProductSim from "./AIProductSim";
import IndustrialSystem from "./IndustrialSystem";
import AttentionLoop from "./AttentionLoop";
import BioprintingScene from "./BioprintingScene";
import InterfaceLab from "./InterfaceLab";
import NanoAssembler from "./NanoAssembler";
import MergeSim from "./MergeSim";
import SoftwareStack from "./SoftwareStack";
import MarketSystems from "./MarketSystems";
import ProductPowerModel from "./ProductPowerModel";
import ProductAnalyst from "./ProductAnalyst";
import ProductRecursionSim from "./ProductRecursionSim";

const VIS: Record<string, ReactNode> = {
  layer: <LayerByLayerSim />,
  history: <CapabilityLadder />,
  materials: (
    <div className="space-y-12">
      <MaterialsLab />
      <NeedValueMap />
    </div>
  ),
  ai: <AIProductSim />,
  distributed: (
    <div className="space-y-12">
      <IndustrialSystem />
      <AttentionLoop />
    </div>
  ),
  bio: <BioprintingScene />,
  mega: <InterfaceLab />,
  nano: <NanoAssembler />,
  space: <MergeSim />,
  unified: (
    <div className="space-y-12">
      <SoftwareStack />
      <ProductPowerModel />
      <FuturesGrid />
      <QuestionsGrid />
    </div>
  ),
};

function Header() {
  return (
    <header className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between border-b border-signal-500/12 bg-ink-950/80 px-5 py-3 backdrop-blur md:px-9">
      <div className="flex items-center gap-3">
        <svg viewBox="0 0 32 32" className="h-8 w-8">
          {/* AM mark: stack of layers + extruder dot */}
          <rect x="6"  y="20" width="20" height="2.4" fill="#3d8bfd" opacity="0.9" />
          <rect x="6"  y="16" width="20" height="2.4" fill="#6fb2ff" opacity="0.85" />
          <rect x="6"  y="12" width="20" height="2.4" fill="#2fd4a8" opacity="0.85" />
          <rect x="6"  y="8"  width="20" height="2.4" fill="#f5a623" opacity="0.85" />
          <circle cx="16" cy="5" r="2.2" fill="#9b6dff" />
          <line x1="16" y1="7.2" x2="16" y2="9" stroke="#9b6dff" strokeWidth="1.2" />
        </svg>
        <div className="leading-tight">
          <div className="display text-base text-ghost-50">Additive Manufacturing Engine</div>
          <div className="zh text-[0.6rem] text-ghost-300">增材制造引擎</div>
        </div>
      </div>
      <nav className="hidden gap-5 font-mono text-[0.58rem] uppercase tracking-[0.18em] text-ghost-300 xl:flex">
        <a href="#layer" className="hover:text-signal-400">Layer</a>
        <a href="#materials" className="hover:text-signal-400">Materials</a>
        <a href="#ai" className="hover:text-signal-400">AI Design</a>
        <a href="#distributed" className="hover:text-signal-400">Distributed</a>
        <a href="#bio" className="hover:text-signal-400">Bio</a>
        <a href="#nano" className="hover:text-signal-400">Nano</a>
        <a href="#unified" className="hover:text-signal-400">Model</a>
      </nav>
      <div className="flex items-center gap-3">
        <LangToggle />
        <a href="https://psyverse.fun" className="hidden font-mono text-[0.58rem] uppercase tracking-[0.18em] text-mint-400 hover:text-signal-400 sm:block">← Psyverse</a>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden pt-24">
      <div className="absolute inset-0 z-0 opacity-90"><ProductField /></div>
      <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-b from-ink-950/30 via-transparent to-ink-950" />
      <div className="relative z-20 mx-auto w-full max-w-6xl px-6 md:px-12">
        <div className="label-mono">Psyverse · An atlas of additive manufacturing</div>
        <div className="mt-2 font-mono text-[0.6rem] uppercase tracking-[0.3em] text-ghost-300">
          EN · 中文 · stone → bronze → factory → CNC → printer → bioprinter → nano → orbit
        </div>
        <h1 className="display mt-6 text-5xl leading-[0.95] text-ghost-50 md:text-8xl">
          Additive <span className="signal-text">Manufacturing</span> Engine
        </h1>
        <h2 className="zh mt-3 text-3xl text-ghost-200 md:text-5xl">增材制造引擎</h2>

        <p className="mt-9 max-w-2xl text-lg leading-relaxed text-ghost-100 md:text-xl">
          <T v={{
            en: "Manufacturing has been organized around removing material — carving, milling, drilling — for ten thousand years. Additive manufacturing inverts that: an object grows, layer by layer, directly from a digital file. What sounds like a printer is actually a re-foundation of how civilization makes things. Bits become the master variable; atoms become the substrate; and the factory shrinks until it fits, in some form, almost anywhere.",
            zh: "一万年来，制造一直围绕「去除材料」组织——雕、铣、钻。增材制造把它颠倒：一个对象，一层接一层，直接从数字文件中生长。听起来像一台打印机的，实际上是一次对「文明如何造物」的重新奠基。比特成为主变量；原子成为基底；而工厂缩小，直到能以某种形式，几乎装进任何地方。",
          }} />
        </p>

        <div className="mt-10 max-w-2xl holo rounded-lg p-6">
          <div className="label-mono">Central thesis · 核心论点</div>
          <p className="mt-3 text-xl leading-relaxed text-ghost-50 md:text-2xl">
            <T v={{
              en: "Manufacturing is becoming a programmable function of information — and that turns civilization into a fabrication network.",
              zh: "制造，正在成为信息的一个可编程函数——而那把文明，变成一张制造网络。",
            }} />
          </p>
        </div>

        <div className="mt-12 flex flex-wrap gap-x-8 gap-y-2 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-ghost-300">
          <span>10 systems · 十大系统</span>
          <span>layer · material · AI · distributed · bio · mega · nano · orbit</span>
          <span>info → matter</span>
        </div>
      </div>
    </section>
  );
}

function SectionBlock({ num, id, title, sub, body, vis }: { num: string; id: string; title: { en: string; zh: string }; sub: { en: string; zh: string }; body: { en: string; zh: string }; vis?: ReactNode }) {
  return (
    <section id={id} className="relative border-t border-signal-500/8 px-6 py-24 md:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-baseline gap-4">
          <span className="display text-5xl text-signal-500/25">{num}</span>
          <div>
            <h2 className="display text-4xl text-ghost-50 md:text-5xl"><T v={title} /></h2>
            <h3 className="mt-1 text-lg text-mint-400"><T v={sub} /></h3>
          </div>
        </div>
        <div className="mt-5 h-px rule-signal opacity-50" />
        <p className="mt-8 max-w-3xl text-lg leading-relaxed text-ghost-200"><T v={body} /></p>
        {vis && <div className="mt-12">{vis}</div>}
      </div>
    </section>
  );
}

function sectionProps(id: string) {
  const s = SECTIONS.find((x) => x.id === id)!;
  return { num: s.num, id: s.id, title: s.title, sub: s.sub, body: s.body };
}

/* ---- Futures grid (Section 09 / closing) ---- */
function FuturesGrid() {
  const { lang } = useLang();
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {FUTURES.map((f, i) => (
        <div key={i} className="holo rounded-xl p-5" style={{ borderTopColor: f.accent, borderTopWidth: 2 }}>
          <div className="flex items-center justify-between">
            <span className={`display text-lg text-ghost-50 ${lang === "zh" ? "zh" : ""}`}><T v={f.name} /></span>
            <span className="font-mono text-[0.55rem] uppercase tracking-wider" style={{ color: f.accent }}><T v={f.horizon} /></span>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-ghost-300"><T v={f.desc} /></p>
        </div>
      ))}
    </div>
  );
}

/* ---- Open questions grid ---- */
function QuestionsGrid() {
  const { lang } = useLang();
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {BIG_QUESTIONS.map((q, i) => (
        <div key={i} className="holo flex gap-4 rounded-xl p-5">
          <span className="mono shrink-0 text-2xl text-signal-400/60">{String(i + 1).padStart(2, "0")}</span>
          <div>
            <div className={`text-base leading-snug text-ghost-50 ${lang === "zh" ? "zh" : "display"}`}><T v={q.q} /></div>
            <p className="mt-2 font-mono text-[0.68rem] leading-relaxed text-mint-400/80">{q.lens.en}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function Body() {
  const { lang } = useLang();
  return (
    <main className="relative bg-ink-950 text-ghost-100">
      <Header />
      <Hero />

      <div className="grid-bg border-y border-signal-500/12 bg-ink-900/60 py-2.5 overflow-hidden">
        <div className="whitespace-nowrap font-mono text-[0.65rem] uppercase tracking-[0.3em] text-mint-400/70 ticker inline-block">
          {(lang === "zh"
            ? "石器 · 青铜 · 铁 · 蒸汽 · 流水线 · 数控 · 机器人 · FDM · SLA · SLS · 金属增材 · 生物打印 · 混凝土打印 · 生成设计 · 分布式工厂 · 月壤打印 · 小行星采矿 · 自我复制 · "
            : "STONE · BRONZE · IRON · STEAM · ASSEMBLY · CNC · ROBOTICS · FDM · SLA · SLS · METAL AM · BIOPRINT · CONCRETE · GENERATIVE · DISTRIBUTED · LUNAR REGOLITH · ASTEROID MINING · SELF-REPLICATING · ").repeat(2)}
        </div>
      </div>

      {/* paradigms radar spotlight, between hero and sections */}
      <section className="relative border-t border-signal-500/8 px-6 py-20 md:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="label-mono">Paradigms · 范式</div>
          <h2 className="display mt-3 text-3xl text-ghost-50 md:text-4xl">
            <T v={{ en: "Six manufacturing paradigms, six shapes", zh: "六种制造范式，六种形状" }} />
          </h2>
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-ghost-200">
            <T v={{
              en: "Score craft, mass production, CNC + robotics, additive, distributed fab and self-replication across the same six axes — geometric freedom, throughput, unit cost, customization, scalability, decentralization — and a different polygon appears for each. Where two regimes overlap is where they directly compete; where they don't is where each is irreplaceable.",
              zh: "在同样六根轴上为手工、大规模生产、数控+机器人、增材、分布式制造、自我复制打分——几何自由度、产能、单件成本、定制度、可扩展性、去中心化——每一种便描出不同的多边形。两种范式重叠之处，是它们直接竞争之处；不重叠之处，是各自不可替代之处。",
            }} />
          </p>
          <div className="mt-10"><MarketSystems /></div>
        </div>
      </section>

      {/* Sections 01–10 */}
      {SECTIONS.map((s) => (
        <SectionBlock key={s.id} {...sectionProps(s.id)} vis={VIS[s.id]} />
      ))}

      {/* AI layer — the Fabrication Analyst */}
      <section id="analyst" className="relative border-t border-signal-500/8 px-6 py-24 md:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="label-mono">AI layer · 人工智能层</div>
          <h2 className="display mt-3 text-4xl text-ghost-50 md:text-5xl">
            <T v={{ en: "Ask the engine", zh: "向引擎发问" }} />
          </h2>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-ghost-200">
            <T v={{
              en: "Six disciplines, one question at a time. A manufacturing engineer, materials scientist, robotics theorist, industrial futurist, nanotechnology analyst and civilization-systems researcher each read the same question from a different angle. Where they agree is solid ground; where they diverge is the open frontier.",
              zh: "六门学科，每次一个问题。一位制造工程师、材料科学家、机器人理论家、工业未来学者、纳米技术分析者与文明系统研究者，各自从一个不同的角度阅读同一个问题。他们一致之处，是坚实的地面；他们分歧之处，是开放的前沿。",
            }} />
          </p>
          <div className="mt-12"><ProductAnalyst /></div>
        </div>
      </section>

      {/* Recursive engine */}
      <section id="recursion" className="relative border-t border-signal-500/8 px-6 py-24 md:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="label-mono">Recursive engine · 递归引擎</div>
          <h2 className="display mt-3 text-4xl text-ghost-50 md:text-5xl">
            <T v={{ en: "Run the engine, scale by scale", zh: "逐尺度地，运行这台引擎" }} />
          </h2>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-ghost-200">
            <T v={{
              en: "Same move, ten scales. Raw feedstock becomes a single machine, becomes a print farm, becomes a city-scale fab hub, becomes a planetary network, becomes a civilizational utility, becomes a bio-integrated medical infrastructure, becomes atomically precise nano, becomes orbital, becomes interplanetary. Toggle which scales the civilization has reached and watch the capability curve climb.",
              zh: "同样的动作，十种尺度。原料成为一台机器，成为一座打印农场，成为城市级制造枢纽，成为行星级网络，成为文明级公用事业，成为生物整合的医疗基础设施，成为原子级精确的纳米，成为轨道，成为行星际。切换文明已抵达的尺度，并观察能力曲线的攀升。",
            }} />
          </p>
          <div className="mt-12"><ProductRecursionSim /></div>
        </div>
      </section>

      {/* Closing */}
      <section className="relative border-t border-signal-500/8 px-6 py-32 md:px-12">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="display text-4xl leading-snug text-ghost-50 md:text-6xl">
            <T v={{ en: "Manufacturing is shrinking from continents to cities to desks — and from inert objects to living tissue, from steel beams to programmable matter.", zh: "制造正从大陆缩到城市、缩到桌面——并从无生命的对象，转向活组织；从钢梁，转向可编程物质。" }} />
          </h2>
          <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-ghost-300">
            <T v={{
              en: "Stone, bronze, iron, steam, line, CNC, robot, printer. Every era of manufacturing reduced the distance between intent and object — from days of hand-shaping to hours of automated build, from years of factory tooling to seconds of file transmission. Additive manufacturing collapses that distance further: same cost for any geometry, same logic from desk to orbit. The horizon is a civilization in which matter follows information the way a printed line follows a moving extruder — not perfectly, never freely, but reliably, locally, and increasingly under autonomous control. The question is no longer whether things will be printed. It is which things, by whom, and what survives the printing of everything.",
              zh: "石、青铜、铁、蒸汽、流水线、数控、机器人、打印机。制造的每一个时代，都缩短了「意图」与「对象」之间的距离——从数日的手塑，到数小时的自动化成形；从数年的工厂工装，到秒级的文件传输。增材制造把那道距离再次压缩：任何几何同样的成本，从桌面到轨道同样的逻辑。地平线，是一个物质追随信息的文明——其方式如同一条被打印的线追随移动的挤出头——不完美、从不自由，却可靠、本地，并越来越多地处于自主控制之下。问题不再是「东西是否会被打印」。而是：「哪些东西、由谁、以及在万物被打印之中，什么得以幸存」。",
            }} />
          </p>
          <div className="mx-auto mt-10 max-w-xl rounded-lg border border-mint-500/25 bg-ink-900/60 p-5">
            <p className="text-xs leading-relaxed text-ghost-300">
              <T v={{
                en: "An educational synthesis of additive-manufacturing process science, materials engineering, generative design, distributed-industry economics, bioprinting research, construction-scale fabrication, nanotechnology and space-manufacturing programmes. Figures are order-of-magnitude; simulations are illustrative simplifications, not forecasts. It reads fabrication by its mechanisms and trade-offs, and states open questions as open.",
                zh: "一份关于增材制造工艺科学、材料工程、生成式设计、分布式工业经济学、生物打印研究、建筑尺度制造、纳米技术与太空制造纲领的教育性综述。文中数字为数量级估计；模拟为示意性的简化，而非预测。它以机制与权衡来阅读制造，并把悬而未决的问题，如实陈述为悬而未决。",
              }} />
            </p>
          </div>
          <div className="mx-auto mt-12 h-px w-40 rule-signal" />
          <p className="mt-6 font-mono text-[0.6rem] uppercase tracking-[0.4em] text-mint-400/70">
            Additive Manufacturing Engine · 增材制造引擎 · Psyverse · 2026
          </p>
        </div>
      </section>

      <footer className="border-t border-signal-500/12 bg-ink-950 px-6 py-16 md:px-12">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 md:grid-cols-3">
          <div>
            <div className="display text-xl text-ghost-50">Additive Manufacturing Engine</div>
            <div className="zh mt-1 text-sm text-ghost-300">增材制造引擎</div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-ghost-300">
              <T v={{ en: "3D printing, materials, generative design, distributed industry, bioprinting, construction-scale fabrication, nanotechnology, space manufacturing — and the question of whether matter follows information into being a programmable civilizational substrate.", zh: "3D 打印、材料、生成式设计、分布式工业、生物打印、建筑尺度制造、纳米技术、太空制造——以及那个问题：物质是否追随信息，成为可编程的文明基底。" }} />
            </p>
          </div>
          <div>
            <div className="label-mono">Systems · 系统</div>
            <ul className="mt-4 space-y-1.5 font-mono text-[0.65rem] uppercase tracking-[0.15em] text-ghost-300">
              {SECTIONS.slice(0, 6).map((s) => (
                <li key={s.id}><a href={`#${s.id}`} className="hover:text-signal-400">{s.num} · <T v={s.title} /></a></li>
              ))}
            </ul>
          </div>
          <div>
            <div className="label-mono">Companion archives</div>
            <ul className="mt-4 space-y-1.5 text-sm text-ghost-300">
              <li><a href="https://product-engine.psyverse.fun" className="hover:text-signal-300">Product Engine · 产品引擎</a></li>
              <li><a href="https://wealth-engine.psyverse.fun" className="hover:text-signal-300">Wealth Engine · 财富引擎</a></li>
              <li><a href="https://innovation-engines.psyverse.fun" className="hover:text-signal-300">Innovation Engines · 创新引擎</a></li>
              <li><a href="https://carbon-capture-engine.psyverse.fun" className="hover:text-signal-300">Carbon Capture Engine · 碳捕获引擎</a></li>
              <li><a href="https://vertical-farming-engine.psyverse.fun" className="hover:text-signal-300">Vertical Farming Engine · 垂直农业引擎</a></li>
              <li className="pt-3"><a href="https://psyverse.fun" className="text-mint-400 hover:text-signal-300">↩ All Psyverse archives</a></li>
            </ul>
          </div>
        </div>
        <div className="mx-auto mt-12 h-px max-w-7xl rule-signal" />
        <div className="mx-auto mt-6 flex max-w-7xl items-center justify-between text-[0.58rem] uppercase tracking-[0.3em] text-ghost-300">
          <div>© 2026 Gewenbo · Psyverse</div>
          <div>EN · 中文 · educational</div>
        </div>
      </footer>
    </main>
  );
}

export default function AdditiveManufacturingEngine() {
  return (
    <LangProvider>
      <Body />
    </LangProvider>
  );
}
