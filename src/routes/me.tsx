import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowUpRight,
  Bookmark,
  ChevronRight,
  Clock,
  ImageIcon,
  Settings,
  Ticket,
  User,
} from "@/components/PixelIcons";
import { PageHeader } from "@/components/TopBar";
import { Portfolio } from "@/components/Portfolio";
import {
  ONBOARDING_KEY,
  PROFILE_KEY,
  avatarOf,
  useLocal,
  useMyProfile,
  useRecent,
  useSaved,
  writeLocal,
  type Onboarding,
} from "@/lib/store";

export const Route = createFileRoute("/me")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Your collective — NAMED" },
      { name: "description", content: "Your NAMED Collective profile." },
      { property: "og:title", content: "Your collective — NAMED" },
      { property: "og:description", content: "Your NAMED Collective profile." },
    ],
  }),
  component: MePage,
});

const NAMED_SITE = "https://namedcollective.com";

function MePage() {
  const [ob] = useLocal<Onboarding | null>(ONBOARDING_KEY, null);
  const [p] = useMyProfile();
  const { saved } = useSaved();
  const { recent } = useRecent();
  const [preview, setPreview] = useState(false);
  const name = ob?.name || "Bestie";
  const avatar = avatarOf(p);
  const badge = p.discipline || (ob?.intent === "discovered" ? "Creative" : "Explorer");
  const place = p.neighbourhood || ob?.location || "London";
  const layout = p.layout === "carousel" ? "Carousel" : "Grid";

  return (
    <div className="flex-1 space-y-3 px-3 pb-8">
      <PageHeader
        title="Profile"
        right={
          <Link to="/settings" aria-label="Settings" className="icon-btn">
            <Settings className="size-[18px]" />
          </Link>
        }
      />

      {/* 1 · Who you are — the whole card opens Edit profile */}
      <Link
        to="/edit-profile"
        aria-label={`${name}, edit profile`}
        className="glass flex items-center gap-4 rounded-[28px] p-4 transition-transform active:scale-[0.99]"
      >
        {avatar ? (
          <img
            src={avatar}
            alt=""
            className="size-16 shrink-0 rounded-full border border-white/40 object-cover"
          />
        ) : (
          <span className="flex size-16 shrink-0 items-center justify-center rounded-full border border-white/25 bg-white/10">
            <User className="size-8" />
          </span>
        )}
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="truncate text-2xl font-bold">{name}</span>
            <span className="rounded-full bg-[var(--rose)]/25 px-2.5 py-0.5 text-xs font-bold text-[var(--pink)]">
              {badge}
            </span>
          </span>
          <span className="mt-0.5 block truncate text-sm text-white/65">{place}</span>
        </span>
        <ChevronRight className="size-5 shrink-0 text-white/60" />
      </Link>

      {/* 2 · Portfolio (in the reference's pay-card slot) */}
      <section aria-labelledby="pf-title" className="glass rounded-[28px] p-4">
        <div className="flex items-center gap-3">
          <h2 id="pf-title" className="flex items-center gap-1.5 whitespace-nowrap text-sm">
            <ImageIcon className="size-[18px] text-[var(--pink)]" /> Portfolio
          </h2>
          <Link
            to="/edit-profile"
            className="whitespace-nowrap text-sm text-white/80 hover:text-white"
          >
            Add work
          </Link>
          <span aria-hidden="true" className="h-4 w-px bg-white/20" />
          <Link to="/edit-profile" className="text-sm text-white/80 hover:text-white">
            Edit
          </Link>
          <button
            type="button"
            aria-pressed={preview}
            aria-label={preview ? "Close preview" : "Preview as a visitor"}
            onClick={() => setPreview((v) => !v)}
            className="btn btn-primary ml-auto min-h-10 px-4 text-sm"
          >
            {preview ? "Close" : "View"}
          </button>
        </div>
        <div className="mt-3 grid grid-cols-2 rounded-2xl bg-white/[0.06] py-1">
          <Link
            to="/edit-profile"
            className="flex min-h-12 items-center justify-center gap-2 text-sm"
          >
            <span className="text-white/60">Works</span>
            <b className="font-bold">{p.media.length}</b>
            <ChevronRight className="size-3.5 text-white/50" />
          </Link>
          <button
            type="button"
            onClick={() =>
              writeLocal(PROFILE_KEY, {
                ...p,
                layout: p.layout === "carousel" ? "grid" : "carousel",
              })
            }
            aria-label={`Layout: ${layout}. Switch layout`}
            className="flex min-h-12 items-center justify-center gap-2 border-l border-white/15 text-sm"
          >
            <span className="text-white/60">Layout</span>
            <b className="font-bold">{layout}</b>
            <ChevronRight className="size-3.5 text-white/50" />
          </button>
        </div>
        {preview && (
          <div className="mt-4">
            <p className="mb-2 text-xs text-white/60">This is how visitors see your work.</p>
            {p.media.length ? (
              <Portfolio media={p.media} layout={p.layout} name={name} />
            ) : (
              <Link
                to="/edit-profile"
                className="flex aspect-[2/1] items-center justify-center rounded-2xl border border-dashed border-white/40 text-xs uppercase tracking-widest"
              >
                + Add your work
              </Link>
            )}
          </div>
        )}
      </section>

      {/* 3 · Shortcuts */}
      <nav aria-label="Your lists" className="glass grid grid-cols-3 rounded-[28px] py-3">
        {[
          { to: "/saved" as const, label: "Saved", Icon: Bookmark, count: saved.length },
          { to: "/recent" as const, label: "Recently viewed", Icon: Clock, count: recent.length },
          { to: "/events" as const, label: "Events", Icon: Ticket, count: 0 },
        ].map(({ to, label, Icon, count }, i) => (
          <Link
            key={to}
            to={to}
            className={`flex min-h-20 flex-col items-center justify-start gap-2 px-1 pt-1 text-center text-sm leading-tight ${i ? "border-l border-white/15" : ""}`}
          >
            <span className="relative">
              <Icon className="size-7" />
              {count > 0 && (
                <span className="absolute -right-3 -top-1.5 min-w-5 rounded-full bg-[var(--pink)] px-1 text-center text-xs font-bold text-[var(--ink)]">
                  {count}
                </span>
              )}
            </span>
            {label}
          </Link>
        ))}
      </nav>

      {/* 4 · The brand behind the app */}
      <a
        href={NAMED_SITE}
        target="_blank"
        rel="noopener noreferrer"
        className="glass flex items-center justify-between gap-3 rounded-[28px] px-5 py-4"
      >
        <span>
          <span className="block text-sm text-white/60">Shop drops & collections</span>
          <span className="block text-lg font-bold">namedcollective.com</span>
        </span>
        <ArrowUpRight className="size-6 shrink-0" />
      </a>
    </div>
  );
}
