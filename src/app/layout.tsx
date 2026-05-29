import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";

const TITLE_EN =
  "Additive Manufacturing Engine · 3D Printing, Generative Design, Bioprinting & Programmable-Matter Civilization";
const TITLE_ZH =
  "增材制造引擎 · 3D 打印、生成式设计、生物打印与可编程物质文明";
const DESC =
  "A civilisation-scale, bilingual exploration of additive manufacturing — FDM, SLA, SLS, metal AM, bioprinting, construction-scale printing, generative design, distributed fabrication, nanotechnology and space manufacturing — and the question of whether matter becomes a programmable function of information.";

export const metadata: Metadata = {
  metadataBase: new URL("https://additive-manufacturing.psyverse.fun"),
  title: `${TITLE_EN} | ${TITLE_ZH}`,
  description: DESC,
  keywords: [
    "additive manufacturing", "3D printing", "AM", "FDM", "SLA", "SLS", "DMLS", "metal printing",
    "bioprinting", "printed organs", "3D printed concrete", "construction 3D printing", "ICON",
    "generative design", "topology optimization", "DfAM", "nTopology", "Autodesk generative",
    "distributed manufacturing", "fab lab", "decentralized industry", "digital fabrication",
    "nanotechnology", "atomically precise manufacturing", "molecular assembly", "programmable matter",
    "self-replicating fabricator", "von Neumann probe", "lunar regolith printing", "asteroid mining",
    "space manufacturing", "in-space additive manufacturing", "OSAM", "Made in Space",
    "Stratasys", "EOS", "GE Aviation 3D printing", "Relativity Space", "stainless concrete",
    "post-scarcity", "Kardashev", "industrial automation", "robotics",
    "增材制造", "3D 打印", "FDM", "SLA", "SLS", "金属打印", "生物打印", "打印器官",
    "混凝土打印", "建筑 3D 打印", "生成式设计", "拓扑优化", "DfAM", "分布式制造",
    "去中心化工业", "数字制造", "纳米技术", "原子级精确制造", "分子组装", "可编程物质",
    "自我复制制造机", "冯·诺依曼探测器", "月壤打印", "小行星采矿", "太空制造",
    "在轨增材制造", "Stratasys", "EOS", "GE 航空", "Relativity Space", "后稀缺",
    "卡尔达肖夫", "工业自动化", "机器人",
  ],
  authors: [{ name: "Gewenbo", url: "https://psyverse.fun" }],
  alternates: { canonical: "/", languages: { en: "/", "zh-CN": "/", "x-default": "/" } },
  openGraph: {
    title: TITLE_EN,
    description:
      "3D printing · generative design · bioprinting · distributed industry · nanotechnology · space manufacturing. A bilingual atlas of how matter becomes a programmable function of information.",
    url: "https://additive-manufacturing.psyverse.fun/",
    siteName: "Psyverse",
    type: "website",
    locale: "en_US",
    alternateLocale: ["zh_CN"],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE_EN,
    description: "FDM · SLA · SLS · metal AM · bioprint · construction-scale · nano · orbit. A bilingual atlas of additive manufacturing as the next civilizational substrate.",
  },
  robots: { index: true, follow: true },
  other: { "theme-color": "#0a0e1a" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@300;400;500&family=Noto+Serif+SC:wght@400;500;600;700&family=Noto+Sans+SC:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: TITLE_EN,
              alternateName: TITLE_ZH,
              description: DESC,
              url: "https://additive-manufacturing.psyverse.fun/",
              inLanguage: ["en", "zh-CN"],
              author: { "@type": "Person", name: "Gewenbo", url: "https://psyverse.fun/" },
              publisher: { "@type": "Organization", name: "Psyverse", url: "https://psyverse.fun/" },
            }),
          }}
        />
      </head>
      <body className="bg-ink-950 text-ghost-100 antialiased">
        {children}
        <Script src="https://analytics-dashboard-two-blue.vercel.app/tracker.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
