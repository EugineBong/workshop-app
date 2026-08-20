import Link from "next/link";
import BrandHeader from "@/components/BrandHeader";
import { brand } from "@/lib/config/brand";

// ─────────────────────────────────────────────────────────────
// HOMEPAGE CONTENT — safe to customize in Module 4.
// Edit the words below, or reorder the sections in SECTION_ORDER.
// ─────────────────────────────────────────────────────────────

const headline = "Life's too short for someday.";
const subcopy =
  "Wanderlist is a private bucket list for the dreams you keep meaning to chase. Log 'em. Plan 'em. Tick 'em off.";

const howItWorks = [
  { title: "1. Dream it up", text: "Add anything — a country, a skill, a wild night out." },
  { title: "2. Give it a category", text: "Travel, creative, career… so you can spot patterns." },
  { title: "3. Chase it. Log it.", text: "Mark it done and it earns a stamp on your list." },
];

// Reorder these to change the page layout (Module 4 layout edit).
const SECTION_ORDER = ["hero", "divider-wave", "how-it-works", "cta"] as const;

// ─────────────────────────────────────────────────────────────

type SectionId = (typeof SECTION_ORDER)[number];

const sections: Record<SectionId, React.ReactNode> = {
  hero: (
    <section key="hero" className="px-4 pt-20 pb-12 text-center">
      {brand.showWorkshopBadge && (
        <span className="mb-5 inline-block rounded-full border border-gray-300 bg-white/70 px-3 py-1 text-xs tracking-wide text-gray-600 uppercase">
          Built at the TimeTec AI Workshop
        </span>
      )}
      <h1 className="mx-auto max-w-3xl font-[family-name:var(--font-playfair)] text-5xl leading-tight font-bold tracking-tight text-gray-900 sm:text-6xl">
        {headline}
      </h1>
      <div
        className="mx-auto mt-5 h-1.5 w-28 rounded-full"
        style={{ backgroundColor: brand.accentColor }}
      />
      <p className="mx-auto mt-6 max-w-xl text-lg text-gray-700">{subcopy}</p>
      <p
        className="mt-3 text-sm font-semibold tracking-wide uppercase"
        style={{ color: brand.primaryColor }}
      >
        {brand.tagline}
      </p>
    </section>
  ),
  "divider-wave": (
    <div key="divider-wave" className="flex justify-center px-4">
      <svg viewBox="0 0 200 36" className="h-20 w-full" fill="none" preserveAspectRatio="none">
        <path
          d="M0 18 Q25 -4 50 18 T100 18 T150 18 T200 18"
          stroke={brand.accentColor}
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  ),
  "how-it-works": (
    <section key="how-it-works" className="px-4 py-14">
      <h2 className="text-center font-[family-name:var(--font-playfair)] text-3xl font-semibold">
        How it works
      </h2>
      <div className="mx-auto mt-10 grid max-w-4xl gap-6 sm:grid-cols-3">
        {howItWorks.map((step) => (
          <div
            key={step.title}
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <h3 className="font-[family-name:var(--font-playfair)] text-xl font-semibold">
              {step.title}
            </h3>
            <p className="mt-2 text-sm text-gray-600">{step.text}</p>
          </div>
        ))}
      </div>
    </section>
  ),
  cta: (
    <section key="cta" className="px-4 pt-10 pb-20 text-center">
      <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-semibold">
        Ready to start chasing?
      </h2>
      <p className="mx-auto mt-3 max-w-md text-gray-600">
        Free, private, and takes about ten seconds to set up.
      </p>
      <div className="mt-7 flex justify-center gap-4">
        <Link
          href="/signup"
          className="rounded-full px-6 py-3 font-semibold text-white shadow-sm transition hover:brightness-110"
          style={{ backgroundColor: brand.primaryColor }}
        >
          Start your list
        </Link>
        <Link
          href="/login"
          className="rounded-full border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50"
        >
          Sign in
        </Link>
      </div>
    </section>
  ),
};

export default function HomePage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: brand.backgroundColor }}>
      <BrandHeader />
      <main>{SECTION_ORDER.map((id) => sections[id])}</main>
      <footer className="border-t border-gray-200 px-4 py-6 text-center text-sm text-gray-500">
        {brand.name} — {brand.tagline}
      </footer>
    </div>
  );
}
