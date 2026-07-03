"use client";

import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { GeistPixelSquare } from "geist/font/pixel";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

/* ═══════════════════════════════════════════
   UTILITIES
   ═══════════════════════════════════════════ */

function useCopy() {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = (v: string) => {
    void navigator.clipboard.writeText(v);
    setCopied(v);
    setTimeout(() => setCopied(null), 1200);
  };
  return { copied, copy };
}

/* Pixel-font label */
function Px({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`text-[10px] uppercase tracking-[0.25em] ${className}`}
      style={{ fontFamily: "var(--font-geist-pixel-square)" }}
    >
      {children}
    </span>
  );
}

/* Mono-font label */
function Mn({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`text-[11px] tracking-wide ${className}`}
      style={{ fontFamily: "var(--font-geist-mono)" }}
    >
      {children}
    </span>
  );
}

/* Glass panel */
function Glass({
  children,
  className = "",
  level = 1,
  hover = false,
}: {
  children: React.ReactNode;
  className?: string;
  level?: 1 | 2 | 3;
  hover?: boolean;
}) {
  const base = {
    1: "bg-white/[0.015] backdrop-blur-2xl border border-white/[0.06]",
    2: "bg-white/[0.03] backdrop-blur-xl border border-white/[0.08]",
    3: "bg-white/[0.05] backdrop-blur-lg border border-white/[0.1]",
  }[level];
  const hoverCls = hover
    ? "hover:bg-white/[0.06] hover:border-white/[0.14] hover:shadow-[0_8px_40px_rgba(6,182,212,0.06)] transition-all duration-300"
    : "";
  return (
    <div className={`rounded-xl ${base} ${hoverCls} ${className}`}>
      {children}
    </div>
  );
}

/* Sections */
const SECTIONS = [
  { id: "logos", num: "01", label: "Logos" },
  { id: "colors", num: "02", label: "Colors" },
  { id: "typography", num: "03", label: "Type" },
  { id: "gradients", num: "04", label: "Gradients" },
  { id: "effects", num: "05", label: "Effects" },
  { id: "buttons", num: "06", label: "Buttons" },
  { id: "spatial", num: "07", label: "Spatial" },
  { id: "motion", num: "08", label: "Motion" },
  { id: "reference", num: "09", label: "Reference" },
] as const;

/* ═══════════════════════════════════════════
   TOC
   ═══════════════════════════════════════════ */

function TOC({ activeId }: { activeId: string }) {
  return (
    <nav className="sticky top-[57px] z-40 -mx-6 sm:-mx-12 lg:-mx-24">
      <div className="border-b border-white/[0.06] bg-[#0a0a0f]/80 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center overflow-x-auto px-6 sm:px-12 lg:px-24">
          {SECTIONS.map((s) => {
            const active = activeId === s.id;
            return (
              <a
                key={s.id}
                href={`#${s.id}`}
                className={`group flex shrink-0 items-center gap-2.5 border-b-[2px] px-5 py-3.5 transition-all duration-200 ${
                  active
                    ? "border-[#06b6d4] text-white"
                    : "border-transparent text-white/25 hover:text-white/50"
                }`}
              >
                <span
                  className={active ? "text-[#06b6d4]" : "text-white/15 group-hover:text-white/30"}
                  style={{ fontFamily: "var(--font-geist-pixel-square)", fontSize: "8px", letterSpacing: "0.2em" }}
                >
                  {s.num}
                </span>
                <span
                  className="hidden text-[11px] tracking-wider sm:inline"
                  style={{ fontFamily: "var(--font-geist-mono)" }}
                >
                  {s.label}
                </span>
              </a>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

/* ═══════════════════════════════════════════
   SECTION WRAPPER
   ═══════════════════════════════════════════ */

function Section({
  id,
  num,
  title,
  subtitle,
  children,
}: {
  id: string;
  num: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-28 py-20">
      <div className="mb-12 flex items-end gap-5">
        <span
          className="leading-none text-[#06b6d4]/20"
          style={{
            fontFamily: "var(--font-geist-pixel-square)",
            fontSize: "40px",
            letterSpacing: "-0.02em",
          }}
        >
          {num}
        </span>
        <div className="pb-1">
          <h2
            className="text-lg font-medium text-white/90"
            style={{ fontFamily: "var(--font-geist-sans)" }}
          >
            {title}
          </h2>
          {subtitle && (
            <Mn className="mt-0.5 text-white/25">{subtitle}</Mn>
          )}
        </div>
        <div className="mb-2 h-px flex-1 bg-gradient-to-r from-white/[0.06] to-transparent" />
      </div>
      {children}
    </section>
  );
}

/* ═══════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════ */

export default function BrandKitPage() {
  const { copied, copy } = useCopy();
  const [activeId, setActiveId] = useState("logos");

  /* Intersection observer for TOC */
  const observerRef = useRef<IntersectionObserver | null>(null);
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        }
      },
      { rootMargin: "-25% 0px -65% 0px" },
    );
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observerRef.current?.observe(el);
    });
    return () => observerRef.current?.disconnect();
  }, []);

  const copyBtn = (value: string, label?: string) => (
    <button
      onClick={() => copy(value)}
      className="cursor-pointer transition-colors duration-150 hover:text-white/80"
      style={{ fontFamily: "var(--font-geist-mono)", fontSize: "11px", letterSpacing: "0.03em" }}
    >
      <span className={copied === value ? "text-[#06b6d4]" : "text-white/35"}>
        {copied === value ? "Copied" : (label ?? value)}
      </span>
    </button>
  );

  return (
    <div
      className={`relative min-h-screen bg-[#0a0a0f] ${GeistSans.variable} ${GeistMono.variable} ${GeistPixelSquare.variable}`}
      style={{ fontFamily: "var(--font-geist-sans)" }}
    >
      {/* ── Background layers ── */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -left-64 -top-48 h-[600px] w-[600px] rounded-full bg-[#06b6d4]/[0.05] blur-[180px]" />
        <div className="absolute -bottom-48 -right-64 h-[700px] w-[700px] rounded-full bg-[#8b5cf6]/[0.035] blur-[200px]" />
        <div className="absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[#f59e0b]/[0.015] blur-[160px]" />
      </div>
      <div
        className="pointer-events-none fixed inset-0 z-[1]"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      <div
        className="pointer-events-none fixed inset-0 z-[2] opacity-[0.012]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* ── Content ── */}
      <div className="relative z-10 px-6 sm:px-12 lg:px-24">
        <div className="mx-auto max-w-7xl">
          {/* ━━━ HERO ━━━ */}
          <header className="pb-8 pt-28">
            <div className="mb-8 flex items-center gap-3">
              <div className="h-1.5 w-1.5 bg-[#06b6d4]" />
              <Px className="text-[#06b6d4]/60">Brand Guidelines</Px>
              <div className="h-px w-12 bg-[#06b6d4]/20" />
              <Px className="text-white/15">v1.0</Px>
            </div>

            <h1 className="text-[110px] font-black leading-[0.88] tracking-[-0.04em] text-white sm:text-[140px] lg:text-[180px]">
              EVAL
            </h1>

            <div className="mt-10 flex max-w-lg flex-col gap-3">
              <p className="text-[15px] font-normal leading-relaxed text-white/35">
                Complete visual identity for the college esports recruiting
                platform. Dark-first, competition ready, built for the next
                generation of competitive gaming.
              </p>
            </div>

            <div className="mt-16 h-px bg-gradient-to-r from-white/[0.08] via-[#06b6d4]/10 to-transparent" />
          </header>

          <TOC activeId={activeId} />

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              01 — LOGOS
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          <Section id="logos" num="01" title="Logos" subtitle="Primary marks & lockups">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {[
                { src: "/eval/logos/eLOGO_white.png", label: "Primary", sub: "White / dark bg", bg: "#0f0f1a" },
                { src: "/eval/logos/eLOGO_black.png", label: "Inverted", sub: "Black / light bg", bg: "#f5f5f5" },
                { src: "/eval/logos/rainbow_eval.png", label: "Rainbow", sub: "Gradient mark", bg: "#0f0f1a" },
                { src: "/eval/logos/emblem.png", label: "Emblem", sub: "Compact mark", bg: "#0f0f1a" },
                { src: "/eval/logos/rainbow_star.png", label: "Star", sub: "Accent element", bg: "#0f0f1a" },
                { src: "/eval/logos/PU_mark.svg", label: "Partner", sub: "Purdue University", bg: "#0f0f1a" },
              ].map((logo) => (
                <Glass key={logo.label} level={1} hover className="group overflow-hidden">
                  <div
                    className="flex h-44 items-center justify-center rounded-t-xl p-8"
                    style={{ backgroundColor: logo.bg }}
                  >
                    <Image
                      src={logo.src}
                      alt={logo.label}
                      width={180}
                      height={90}
                      className="max-h-14 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex items-center justify-between px-5 py-4">
                    <div>
                      <p className="text-[13px] font-medium text-white/80">{logo.label}</p>
                      <Mn className="text-white/25">{logo.sub}</Mn>
                    </div>
                    <Px className="text-white/10">PNG</Px>
                  </div>
                </Glass>
              ))}
            </div>
          </Section>

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              02 — COLORS
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          <Section id="colors" num="02" title="Colors" subtitle="Brand palette & semantic tokens">
            {/* Primary */}
            <div className="mb-10">
              <Px className="mb-4 block text-white/20">Primary</Px>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { name: "Cyan", hex: "#06b6d4", rgb: "6 · 182 · 212", var: "--eval-cyan", text: "#000" },
                  { name: "Purple", hex: "#8b5cf6", rgb: "139 · 92 · 246", var: "--eval-purple", text: "#fff" },
                  { name: "Orange", hex: "#f59e0b", rgb: "245 · 158 · 11", var: "--eval-orange", text: "#000" },
                ].map((c) => (
                  <Glass key={c.name} level={1} hover className="overflow-hidden">
                    <div
                      className="relative flex h-40 flex-col justify-between p-5"
                      style={{
                        backgroundColor: c.hex,
                        boxShadow: `0 20px 60px ${c.hex}30, 0 0 100px ${c.hex}10`,
                      }}
                    >
                      <span className="text-base font-semibold" style={{ color: c.text }}>
                        {c.name}
                      </span>
                      <div style={{ color: c.text, opacity: 0.5 }}>
                        <Mn>{c.rgb}</Mn>
                      </div>
                    </div>
                    <div className="flex items-center justify-between px-5 py-3.5">
                      {copyBtn(c.hex)}
                      <Mn className="text-white/15">{c.var}</Mn>
                    </div>
                  </Glass>
                ))}
              </div>
            </div>

            {/* Surfaces */}
            <div className="mb-10">
              <Px className="mb-4 block text-white/20">Surfaces</Px>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { name: "Background", hex: "#0a0a0f", var: "--background" },
                  { name: "Surface", hex: "#0f0f1a", var: "--card" },
                  { name: "Elevated", hex: "#1e1e2e", var: "--secondary" },
                  { name: "Muted", hex: "#2a2a3a", var: "--muted" },
                ].map((c) => (
                  <Glass key={c.name} level={1} hover className="overflow-hidden">
                    <div
                      className="h-24 rounded-t-xl border-b border-white/[0.04]"
                      style={{ backgroundColor: c.hex }}
                    />
                    <div className="px-4 py-3">
                      <p className="text-[12px] font-medium text-white/60">{c.name}</p>
                      <div className="mt-1 flex items-center justify-between">
                        {copyBtn(c.hex)}
                        <Mn className="text-white/15">{c.var}</Mn>
                      </div>
                    </div>
                  </Glass>
                ))}
              </div>
            </div>

            {/* Semantic + Chart row */}
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <Px className="mb-4 block text-white/20">Semantic</Px>
                <Glass level={1} className="divide-y divide-white/[0.04] overflow-hidden">
                  {[
                    { name: "Primary", hex: "#06b6d4" },
                    { name: "Success", hex: "#10b981" },
                    { name: "Warning", hex: "#f59e0b" },
                    { name: "Error", hex: "#ef4444" },
                  ].map((c) => (
                    <div key={c.name} className="flex items-center gap-4 px-5 py-3">
                      <div
                        className="h-4 w-4 rounded-sm"
                        style={{
                          backgroundColor: c.hex,
                          boxShadow: `0 0 12px ${c.hex}40`,
                        }}
                      />
                      <span className="flex-1 text-[13px] text-white/60">{c.name}</span>
                      {copyBtn(c.hex)}
                    </div>
                  ))}
                </Glass>
              </div>
              <div>
                <Px className="mb-4 block text-white/20">Chart Palette</Px>
                <Glass level={1} className="overflow-hidden p-5">
                  <div className="flex gap-2">
                    {[
                      { hex: "#06b6d4", n: "1" },
                      { hex: "#8b5cf6", n: "2" },
                      { hex: "#f59e0b", n: "3" },
                      { hex: "#10b981", n: "4" },
                      { hex: "#ef4444", n: "5" },
                    ].map((c) => (
                      <button
                        key={c.n}
                        onClick={() => copy(c.hex)}
                        className="group flex flex-1 cursor-pointer flex-col items-center gap-2"
                      >
                        <div
                          className="h-16 w-full rounded-lg transition-transform duration-200 group-hover:scale-105"
                          style={{
                            backgroundColor: c.hex,
                            boxShadow: `0 8px 30px ${c.hex}25`,
                          }}
                        />
                        <Mn className="text-white/25 group-hover:text-white/50">
                          {copied === c.hex ? "Copied" : c.n}
                        </Mn>
                      </button>
                    ))}
                  </div>
                </Glass>
              </div>
            </div>
          </Section>

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              03 — TYPOGRAPHY
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          <Section id="typography" num="03" title="Typography" subtitle="Font families & type scale">
            {/* Specimens */}
            <div className="grid gap-3 md:grid-cols-3">
              {[
                {
                  name: "Rajdhani",
                  role: "Display / Default Body",
                  variable: "--font-rajdhani",
                  family: "Rajdhani, sans-serif",
                  weights: [300, 400, 500, 600, 700],
                },
                {
                  name: "Inter",
                  role: "UI / Headings",
                  variable: "--font-inter",
                  family: "var(--font-inter), sans-serif",
                  weights: [300, 400, 500, 600, 700, 800, 900],
                },
                {
                  name: "Orbitron",
                  role: "Accent Display",
                  variable: "--font-orbitron",
                  family: "var(--font-orbitron), sans-serif",
                  weights: [400, 500, 600, 700, 800, 900],
                },
              ].map((f) => (
                <Glass key={f.name} level={1} hover className="overflow-hidden p-6">
                  <div className="mb-5 flex items-center justify-between">
                    <Px className="text-[#06b6d4]/50">{f.role}</Px>
                  </div>
                  <p
                    className="mb-3 text-[44px] font-bold leading-none text-white"
                    style={{ fontFamily: f.family }}
                  >
                    {f.name}
                  </p>
                  <p
                    className="mb-5 text-sm leading-relaxed text-white/30"
                    style={{ fontFamily: f.family }}
                  >
                    ABCDEFGHIJKLMNOPQRSTUVWXYZ
                    <br />
                    abcdefghijklmnopqrstuvwxyz
                    <br />
                    0123456789 !@#$&amp;
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {f.weights.map((w) => (
                      <Glass key={w} level={3} className="px-2 py-1">
                        <span
                          className="text-[10px] text-white/40"
                          style={{ fontWeight: w, fontFamily: f.family }}
                        >
                          {w}
                        </span>
                      </Glass>
                    ))}
                  </div>
                  <Mn className="mt-4 block text-white/15">{f.variable}</Mn>
                </Glass>
              ))}
            </div>

            {/* Type scale */}
            <div className="mt-8">
              <Px className="mb-4 block text-white/20">Type Scale</Px>
              <Glass level={1} className="divide-y divide-white/[0.04] overflow-hidden">
                {[
                  {
                    demo: <span className="heading-hero text-4xl sm:text-5xl">Hero Heading</span>,
                    cls: ".heading-hero",
                    spec: "Inter 900 · gradient · animated",
                  },
                  {
                    demo: <span className="heading-section text-2xl text-white sm:text-3xl">Section Heading</span>,
                    cls: ".heading-section",
                    spec: "Inter 800 · uppercase · 0.05em",
                  },
                  {
                    demo: (
                      <span className="text-premium text-base text-white/60">
                        Premium body text for longer-form content and descriptions.
                      </span>
                    ),
                    cls: ".text-premium",
                    spec: "Inter 500 · line-height 1.6",
                  },
                  {
                    demo: <span className="stat-number">2,847</span>,
                    cls: ".stat-number",
                    spec: "Inter 900 · 2.5rem · gradient",
                  },
                ].map((row, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-8 px-6 py-6"
                  >
                    <div className="min-w-0 flex-1">{row.demo}</div>
                    <div className="shrink-0 text-right">
                      <Mn className="block text-white/30">{row.cls}</Mn>
                      <Mn className="mt-0.5 block text-white/15">{row.spec}</Mn>
                    </div>
                  </div>
                ))}
              </Glass>
            </div>

            {/* Pixel font showcase */}
            <div className="mt-8">
              <Px className="mb-4 block text-white/20">Pixel Accent — Geist Pixel</Px>
              <Glass level={2} className="p-6">
                <div className="flex items-center gap-8">
                  <span
                    className="text-5xl text-white/80"
                    style={{ fontFamily: "var(--font-geist-pixel-square)" }}
                  >
                    EVAL
                  </span>
                  <div className="h-12 w-px bg-white/[0.06]" />
                  <div className="space-y-2">
                    <p
                      className="text-sm text-white/40"
                      style={{ fontFamily: "var(--font-geist-pixel-square)" }}
                    >
                      ABCDEFGHIJKLMNOPQRSTUVWXYZ 0123456789
                    </p>
                    <Mn className="text-white/20">
                      Geist Pixel Square · Used for labels, section numbers, gaming-HUD accents
                    </Mn>
                  </div>
                </div>
              </Glass>
            </div>
          </Section>

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              04 — GRADIENTS
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          <Section id="gradients" num="04" title="Gradients" subtitle="Core gradient definitions">
            <div className="space-y-3">
              {[
                { name: "Hero Text", css: "linear-gradient(135deg, #ffffff, #06b6d4, #8b5cf6)", usage: "Animated heading gradient" },
                { name: "Rainbow Accent", css: "linear-gradient(90deg, #06b6d4, #8b5cf6, #f59e0b)", usage: "Nav, borders, scrollbar" },
                { name: "Primary CTA", css: "linear-gradient(135deg, #06b6d4, #0891b2)", usage: "Primary buttons" },
                { name: "Secondary CTA", css: "linear-gradient(135deg, #f59e0b, #d97706)", usage: "Secondary buttons" },
                { name: "Card Surface", css: "linear-gradient(135deg, rgba(15,15,26,0.9), rgba(30,30,46,0.8))", usage: "Card backgrounds" },
                { name: "Stat", css: "linear-gradient(135deg, #06b6d4, #8b5cf6)", usage: "Gradient text for metrics" },
              ].map((g) => (
                <Glass key={g.name} level={1} hover className="grid overflow-hidden md:grid-cols-[1fr_1fr]">
                  <div className="h-20 md:h-auto" style={{ background: g.css }} />
                  <div className="flex items-center justify-between px-6 py-5">
                    <div>
                      <p className="text-[13px] font-medium text-white/80">{g.name}</p>
                      <Mn className="mt-0.5 text-white/25">{g.usage}</Mn>
                    </div>
                    <button
                      onClick={() => copy(g.css)}
                      className="cursor-pointer rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 transition-all duration-200 hover:border-white/20 hover:bg-white/[0.06]"
                    >
                      <Mn className={copied === g.css ? "text-[#06b6d4]" : "text-white/30"}>
                        {copied === g.css ? "Copied" : "Copy"}
                      </Mn>
                    </button>
                  </div>
                </Glass>
              ))}
            </div>
          </Section>

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              05 — EFFECTS
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          <Section id="effects" num="05" title="Effects" subtitle="Glass, glow & surface treatments">
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {/* Glass Morphism */}
              <Glass level={1} className="p-3">
                <div className="glass-morphism flex h-48 flex-col items-center justify-center rounded-lg">
                  <p className="text-[13px] font-semibold text-white/80">Glass Morphism</p>
                  <Mn className="mt-2 text-white/25">.glass-morphism</Mn>
                  <Mn className="text-white/15">rgba(15,15,26,0.8) + blur(20px)</Mn>
                </div>
              </Glass>

              {/* Cyber Glow */}
              <Glass level={1} className="p-3">
                <div className="cyber-glow flex h-48 flex-col items-center justify-center rounded-lg border border-[#06b6d4]/20 bg-[#0f0f1a]">
                  <p className="text-[13px] font-semibold text-white/80">Cyber Glow</p>
                  <Mn className="mt-2 text-white/25">.cyber-glow</Mn>
                  <Mn className="text-white/15">Multi-layer cyan shadow</Mn>
                </div>
              </Glass>

              {/* Pulse Glow */}
              <Glass level={1} className="p-3">
                <div className="animate-pulse-glow flex h-48 flex-col items-center justify-center rounded-lg border border-[#06b6d4]/15 bg-[#0f0f1a]">
                  <p className="text-[13px] font-semibold text-white/80">Pulse Glow</p>
                  <Mn className="mt-2 text-white/25">.animate-pulse-glow</Mn>
                  <Mn className="text-white/15">2s ease-in-out infinite</Mn>
                </div>
              </Glass>

              {/* Gradient Border */}
              <Glass level={1} className="p-3">
                <div className="relative flex h-48 flex-col items-center justify-center overflow-hidden rounded-lg">
                  <div className="gradient-border absolute inset-0 rounded-lg" />
                  <div className="relative">
                    <p className="text-[13px] font-semibold text-white/80">Gradient Border</p>
                    <Mn className="mt-2 block text-center text-white/25">.gradient-border</Mn>
                  </div>
                </div>
              </Glass>

              {/* Esports Card */}
              <Glass level={1} className="p-3">
                <div className="esports-card flex h-48 flex-col items-center justify-center rounded-lg">
                  <p className="text-[13px] font-semibold text-white/80">Esports Card</p>
                  <Mn className="mt-2 text-white/25">.esports-card</Mn>
                  <Mn className="text-white/15">Hover for glow + lift</Mn>
                </div>
              </Glass>

              {/* Feature Card */}
              <Glass level={1} className="p-3">
                <div className="feature-card flex h-48 flex-col items-center justify-center !rounded-lg">
                  <p className="text-[13px] font-semibold text-white/80">Feature Card</p>
                  <Mn className="mt-2 text-white/25">.feature-card</Mn>
                  <Mn className="text-white/15">Hover for accent + lift</Mn>
                </div>
              </Glass>
            </div>
          </Section>

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              06 — BUTTONS
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          <Section id="buttons" num="06" title="Buttons" subtitle="Interactive element styles">
            {/* Brand */}
            <div className="mb-8">
              <Px className="mb-4 block text-white/20">Brand</Px>
              <Glass level={1} className="p-8">
                <div className="flex flex-wrap items-center gap-4">
                  <button className="pro-button-primary rounded-lg px-7 py-3">
                    Primary Action
                  </button>
                  <button className="pro-button-secondary rounded-lg px-7 py-3">
                    Secondary Action
                  </button>
                  <button className="button-rainbow rounded-lg bg-transparent px-7 py-3 font-bold uppercase tracking-wider text-white">
                    Rainbow Border
                  </button>
                </div>
                <Mn className="mt-4 block text-white/15">
                  .pro-button-primary · .pro-button-secondary · .button-rainbow — hover for shimmer
                </Mn>
              </Glass>
            </div>

            {/* Variants */}
            <div className="mb-8">
              <Px className="mb-4 block text-white/20">Component Variants</Px>
              <Glass level={1} className="p-8">
                <div className="flex flex-wrap items-center gap-3">
                  <button className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-xs transition-all hover:bg-primary/90">
                    Default
                  </button>
                  <button className="inline-flex h-9 items-center justify-center rounded-md bg-destructive px-4 text-sm font-medium text-white shadow-xs transition-all hover:bg-destructive/90">
                    Destructive
                  </button>
                  <button className="inline-flex h-9 items-center justify-center rounded-md border border-white/10 bg-transparent px-4 text-sm font-medium text-white shadow-xs transition-all hover:bg-accent hover:text-accent-foreground">
                    Outline
                  </button>
                  <button className="inline-flex h-9 items-center justify-center rounded-md bg-secondary px-4 text-sm font-medium text-secondary-foreground shadow-xs transition-all hover:bg-secondary/80">
                    Secondary
                  </button>
                  <button className="inline-flex h-9 items-center justify-center rounded-md px-4 text-sm font-medium text-white transition-all hover:bg-accent/50">
                    Ghost
                  </button>
                  <button className="inline-flex h-9 items-center justify-center px-4 text-sm font-medium text-primary underline-offset-4 transition-all hover:underline">
                    Link
                  </button>
                </div>
              </Glass>
            </div>

            {/* Sizes */}
            <div>
              <Px className="mb-4 block text-white/20">Sizes</Px>
              <Glass level={1} className="p-8">
                <div className="flex flex-wrap items-end gap-5">
                  {[
                    { label: "SM", h: "h-8", px: "px-3", size: "32px" },
                    { label: "Default", h: "h-9", px: "px-4", size: "36px" },
                    { label: "LG", h: "h-10", px: "px-6", size: "40px" },
                  ].map((s) => (
                    <div key={s.label} className="flex flex-col items-center gap-2">
                      <button
                        className={`inline-flex ${s.h} items-center justify-center rounded-md bg-primary ${s.px} text-sm font-medium text-primary-foreground shadow-xs`}
                      >
                        {s.label}
                      </button>
                      <Mn className="text-white/20">{s.size}</Mn>
                    </div>
                  ))}
                  <div className="flex flex-col items-center gap-2">
                    <button className="inline-flex size-9 items-center justify-center rounded-md bg-primary text-sm font-medium text-primary-foreground shadow-xs">
                      IC
                    </button>
                    <Mn className="text-white/20">Icon</Mn>
                  </div>
                </div>
              </Glass>
            </div>
          </Section>

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              07 — SPATIAL (Radius + Spacing + Shadows)
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          <Section id="spatial" num="07" title="Spatial" subtitle="Radius, spacing & shadows">
            {/* Radius */}
            <div className="mb-10">
              <Px className="mb-4 block text-white/20">Border Radius</Px>
              <Glass level={1} className="p-8">
                <div className="flex flex-wrap justify-center gap-8">
                  {[
                    { token: "SM", value: "8px", r: 8 },
                    { token: "MD", value: "10px", r: 10 },
                    { token: "LG", value: "12px", r: 12 },
                    { token: "XL", value: "16px", r: 16 },
                    { token: "Full", value: "9999px", r: 9999 },
                  ].map((r) => (
                    <div key={r.token} className="flex flex-col items-center gap-3">
                      <div
                        className="flex h-20 w-20 items-center justify-center border border-[#06b6d4]/20 bg-[#06b6d4]/[0.06]"
                        style={{
                          borderRadius: r.r,
                          boxShadow: "0 0 20px rgba(6,182,212,0.06)",
                        }}
                      >
                        <Mn className="text-[#06b6d4]/60">{r.value}</Mn>
                      </div>
                      <Px className="text-white/30">{r.token}</Px>
                    </div>
                  ))}
                </div>
              </Glass>
            </div>

            {/* Spacing */}
            <div className="mb-10">
              <Px className="mb-4 block text-white/20">Spacing Scale</Px>
              <Glass level={1} className="overflow-hidden">
                <div className="border-b border-white/[0.04] px-6 py-3">
                  <Mn className="text-white/20">4px baseline · Tailwind default</Mn>
                </div>
                <div className="p-6">
                  {[
                    { t: "1", px: 4 },
                    { t: "2", px: 8 },
                    { t: "3", px: 12 },
                    { t: "4", px: 16 },
                    { t: "6", px: 24 },
                    { t: "8", px: 32 },
                    { t: "12", px: 48 },
                    { t: "16", px: 64 },
                    { t: "20", px: 80 },
                    { t: "24", px: 96 },
                  ].map((s) => (
                    <div key={s.t} className="flex items-center gap-5 py-1.5">
                      <Mn className="w-6 text-right text-white/30">{s.t}</Mn>
                      <div
                        className="h-2 rounded-sm bg-gradient-to-r from-[#06b6d4]/50 to-[#8b5cf6]/30"
                        style={{ width: s.px }}
                      />
                      <Mn className="text-white/15">{s.px}px</Mn>
                    </div>
                  ))}
                </div>
              </Glass>
            </div>

            {/* Shadows */}
            <div>
              <Px className="mb-4 block text-white/20">Shadows & Glows</Px>
              <div className="grid gap-3 md:grid-cols-3">
                {[
                  { name: "Shadow XS", shadow: "0 1px 2px 0 rgba(0,0,0,0.05)", token: "shadow-xs" },
                  { name: "Shadow MD", shadow: "0 4px 6px -1px rgba(0,0,0,0.1)", token: "shadow-md" },
                  { name: "Cyber Glow", shadow: "0 0 20px rgba(6,182,212,0.3), 0 0 40px rgba(6,182,212,0.2), 0 0 60px rgba(6,182,212,0.1)", token: ".cyber-glow" },
                  { name: "Card Hover", shadow: "0 10px 40px rgba(6,182,212,0.2), 0 0 0 1px rgba(6,182,212,0.1)", token: "esports-card:hover" },
                  { name: "Toast", shadow: "0 25px 50px -12px rgba(0,0,0,0.8), 0 0 0 1px rgba(6,182,212,0.2)", token: "sonner" },
                  { name: "Popup", shadow: "0 10px 40px rgba(6,182,212,0.15), 0 0 0 1px rgba(6,182,212,0.1)", token: "cl-popover" },
                ].map((s) => (
                  <Glass key={s.name} level={1} className="flex flex-col items-center py-10">
                    <div
                      className="mb-5 h-14 w-28 rounded-lg border border-white/[0.06] bg-[#0f0f1a]"
                      style={{ boxShadow: s.shadow }}
                    />
                    <p className="text-[12px] font-medium text-white/60">{s.name}</p>
                    <Mn className="mt-1 text-white/20">{s.token}</Mn>
                  </Glass>
                ))}
              </div>
            </div>
          </Section>

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              08 — MOTION
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          <Section id="motion" num="08" title="Motion" subtitle="Animations & transitions">
            <div className="grid gap-3 md:grid-cols-2">
              {/* gradient-shift */}
              <Glass level={1} className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <Px className="text-[#06b6d4]/40">gradient-shift</Px>
                  <Mn className="text-white/15">3s ease-in-out infinite</Mn>
                </div>
                <div className="heading-hero text-4xl">Animated Gradient</div>
              </Glass>

              {/* rainbow-rotate */}
              <Glass level={1} className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <Px className="text-[#06b6d4]/40">rainbow-rotate</Px>
                  <Mn className="text-white/15">3s linear infinite</Mn>
                </div>
                <div className="faq-rainbow-border relative h-14 rounded-lg border border-white/[0.06] bg-white/[0.02]">
                  <div className="flex h-full items-center justify-center">
                    <Mn className="text-white/30">Rainbow border sweep</Mn>
                  </div>
                </div>
              </Glass>

              {/* pulse-glow */}
              <Glass level={1} className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <Px className="text-[#06b6d4]/40">pulse-glow</Px>
                  <Mn className="text-white/15">2s ease-in-out infinite</Mn>
                </div>
                <div className="flex justify-center py-2">
                  <div className="animate-pulse-glow h-16 w-16 rounded-xl bg-[#0f0f1a]" />
                </div>
              </Glass>

              {/* float */}
              <Glass level={1} className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <Px className="text-[#06b6d4]/40">float</Px>
                  <Mn className="text-white/15">3s ease-in-out infinite</Mn>
                </div>
                <div className="flex justify-center py-2">
                  <div className="animate-float h-16 w-16 rounded-xl bg-gradient-to-br from-[#06b6d4] to-[#8b5cf6]" />
                </div>
              </Glass>

              {/* caret */}
              <Glass level={1} className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <Px className="text-[#06b6d4]/40">caret-blink</Px>
                  <Mn className="text-white/15">steps(2, start) infinite</Mn>
                </div>
                <div className="flex items-center text-3xl font-bold text-white">
                  EVAL
                  <span className="blink-caret ml-0.5 inline-block h-8 w-[2px] bg-[#06b6d4]" />
                </div>
              </Glass>

              {/* Framer Motion */}
              <Glass level={1} className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <Px className="text-[#06b6d4]/40">framer-motion</Px>
                  <Mn className="text-white/15">spring physics</Mn>
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
                  {[
                    ["stiffness", "100"],
                    ["damping", "10"],
                    ["exit.opacity", "0"],
                    ["exit.translateY", "-40px"],
                    ["exit.scale", "2"],
                    ["exit.blur", "8px"],
                  ].map(([k, v]) => (
                    <div key={k} className="contents">
                      <Mn className="text-white/25">{k}</Mn>
                      <Mn className="text-white/50">{v}</Mn>
                    </div>
                  ))}
                </div>
              </Glass>
            </div>
          </Section>

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              09 — REFERENCE
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          <Section id="reference" num="09" title="Quick Reference" subtitle="Variables, tech stack & iconography">
            <div className="grid gap-3 md:grid-cols-2">
              {/* CSS Variables */}
              <Glass level={1} className="overflow-hidden">
                <div className="border-b border-white/[0.04] px-6 py-3">
                  <Px className="text-[#06b6d4]/40">CSS Variables</Px>
                </div>
                <div className="divide-y divide-white/[0.03] px-6">
                  {[
                    ["--eval-cyan", "#06b6d4"],
                    ["--eval-purple", "#8b5cf6"],
                    ["--eval-orange", "#f59e0b"],
                    ["--background", "#0a0a0f"],
                    ["--card", "#0f0f1a"],
                    ["--secondary", "#1e1e2e"],
                    ["--muted", "#2a2a3a"],
                    ["--primary", "#06b6d4"],
                    ["--destructive", "#ef4444"],
                    ["--radius", "0.75rem"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between py-2.5">
                      <Mn className="text-white/30">{k}</Mn>
                      {copyBtn(v!)}
                    </div>
                  ))}
                </div>
                <div className="h-3" />
              </Glass>

              {/* Stack */}
              <div className="space-y-3">
                <Glass level={1} className="overflow-hidden">
                  <div className="border-b border-white/[0.04] px-6 py-3">
                    <Px className="text-[#06b6d4]/40">Tech Stack</Px>
                  </div>
                  <div className="divide-y divide-white/[0.03] px-6">
                    {[
                      ["Framework", "Next.js 15"],
                      ["CSS", "Tailwind CSS v4"],
                      ["Components", "Radix UI"],
                      ["Animation", "Framer Motion"],
                      ["Icons", "Lucide React"],
                      ["Auth", "Clerk"],
                      ["Toasts", "Sonner"],
                    ].map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between py-2.5">
                        <Mn className="text-white/30">{k}</Mn>
                        <Mn className="text-white/50">{v}</Mn>
                      </div>
                    ))}
                  </div>
                  <div className="h-3" />
                </Glass>

                <Glass level={1} className="overflow-hidden">
                  <div className="border-b border-white/[0.04] px-6 py-3">
                    <Px className="text-[#06b6d4]/40">Scrollbar</Px>
                  </div>
                  <div className="divide-y divide-white/[0.03] px-6">
                    {[
                      ["Track", "#0a0a0f"],
                      ["Thumb", "cyan → purple gradient"],
                      ["Width", "12px"],
                    ].map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between py-2.5">
                        <Mn className="text-white/30">{k}</Mn>
                        <Mn className="text-white/50">{v}</Mn>
                      </div>
                    ))}
                  </div>
                  <div className="h-3" />
                </Glass>
              </div>
            </div>
          </Section>

          {/* ━━━ Footer ━━━ */}
          <div className="border-t border-white/[0.06] py-14">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-1.5 w-1.5 bg-[#06b6d4]/40" />
                <Px className="text-white/15">EVAL Gaming</Px>
              </div>
              <Mn className="text-white/15">evalgaming.com</Mn>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
