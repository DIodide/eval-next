import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

const TICKER_ITEMS = [
  "Build your college list",
  "Get noticed by coaches",
  "Master the recruiting funnel",
  "Lock in scholarship offers",
  "Join 1,000+ players on the path",
];

export function BootcampPromoStrip() {
  return (
    <Link
      href="/pricing?from=bootcamp"
      aria-label="Explore EVAL+ Bootcamp pricing"
      className="group relative block overflow-hidden border-b border-cyan-400/20 bg-[#070416]"
    >
      {/* Diagonal animated chevron rail */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.09]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(115deg, transparent 0 22px, rgba(34,211,238,0.95) 22px 24px, transparent 24px 46px, rgba(167,139,250,0.95) 46px 48px, transparent 48px 78px, rgba(251,146,60,0.85) 78px 80px)",
          backgroundSize: "200% 100%",
          animation: "promo-stripe-slide 24s linear infinite",
        }}
      />
      {/* Ambient gradient wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-cyan-500/15 via-purple-500/10 to-orange-500/15"
      />
      {/* Top hair-line */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 right-0 left-0 h-px bg-gradient-to-r from-cyan-400/0 via-cyan-400/80 to-cyan-400/0"
      />
      {/* Soft right-edge fade so the ticker breathes */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 right-0 bottom-0 hidden w-32 bg-gradient-to-l from-[#070416] to-transparent md:block"
      />

      <div className="relative container mx-auto flex flex-col items-stretch gap-3 px-6 py-3 md:flex-row md:items-center md:gap-6">
        {/* LIVE + label */}
        <div className="flex flex-shrink-0 items-center gap-3">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.9)]" />
          </span>
          <span className="font-orbitron text-[10px] font-bold tracking-[0.3em] text-cyan-300/90">
            NOW LIVE
          </span>
          <span className="hidden h-3 w-px bg-white/20 md:inline-block" />
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-orange-300" />
            <span className="font-orbitron text-[10px] font-bold tracking-[0.25em] text-orange-300/90 uppercase">
              EVAL+ Bootcamp
            </span>
          </div>
        </div>

        {/* Headline + ticker */}
        <div className="min-w-0 flex-1 md:px-2">
          <p className="font-orbitron text-sm leading-tight font-black text-white uppercase md:text-[15px]">
            5 steps to your{" "}
            <span className="text-cyan-300">college esports scholarship</span>
          </p>
          <div className="font-rajdhani relative mt-0.5 hidden h-5 overflow-hidden text-[13px] text-gray-400 md:block">
            <div
              className="flex w-max gap-x-8 whitespace-nowrap"
              style={{
                animation: "promo-ticker 28s linear infinite",
              }}
            >
              {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
                <span key={i} className="inline-flex items-center gap-2">
                  <span
                    aria-hidden
                    className="inline-block h-1 w-1 rounded-full bg-cyan-400/60"
                  />
                  {item}
                </span>
              ))}
            </div>
          </div>
          <p className="font-rajdhani mt-0.5 block text-xs text-gray-300/90 md:hidden">
            Build your list, impress coaches, land the offer.
          </p>
        </div>

        {/* CTA cluster */}
        <div className="flex flex-shrink-0 items-center justify-between gap-3 md:justify-end">
          <span className="font-rajdhani hidden text-xs text-gray-300/80 sm:inline-flex sm:items-baseline sm:gap-1.5">
            <span className="text-gray-500 line-through decoration-red-500/70">
              $10
            </span>
            <span className="font-orbitron text-base font-black text-white">
              $5
            </span>
            <span className="text-gray-400">/yr</span>
          </span>
          <span className="font-orbitron relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-cyan-400/40 bg-black/40 px-4 py-1.5 text-xs font-bold tracking-[0.18em] text-cyan-200 transition-all duration-300 group-hover:border-cyan-300 group-hover:bg-cyan-400/10 group-hover:text-white group-hover:shadow-[0_0_22px_rgba(34,211,238,0.35)]">
            <span
              aria-hidden
              className="absolute inset-0 -translate-x-full bg-gradient-to-r from-cyan-400/0 via-cyan-400/30 to-cyan-400/0 transition-transform duration-700 group-hover:translate-x-full"
            />
            <span className="relative">SEE PRICING</span>
            <ArrowRight className="relative h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
