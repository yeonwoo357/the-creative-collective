import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Bookmark, Search, Settings, User, X } from "@/components/PixelIcons";
import { Globe, HOME_VIEW, fitView, type Pin } from "@/components/Globe";
import { SpaceBackground } from "@/components/SpaceBackground";
import { PLACES, creatives, getCreative } from "@/lib/data";
import namedLogo from "@/assets/named-logo-white.png";
import {
  ONBOARDING_KEY,
  avatarOf,
  useLocal,
  useMyProfile,
  useReducedMotion,
  type Onboarding,
} from "@/lib/store";

export const Route = createFileRoute("/")({
  // Globe geometry is measured in the browser; skip server render to avoid float mismatches.
  ssr: false,
  validateSearch: (s: Record<string, unknown>): { ids?: string } =>
    typeof s["ids"] === "string" && s["ids"] ? { ids: s["ids"] } : {},
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Discover — NAMED Collective" },
      {
        name: "description",
        content: "Spin the globe and find tattoo artists, piercers, hair, nails and more near you.",
      },
      { property: "og:title", content: "Discover — NAMED Collective" },
      {
        property: "og:description",
        content: "Spin the globe and find alternative creatives near you.",
      },
    ],
  }),
  component: Home,
});

const pins: Pin[] = creatives.map((c) => ({
  id: c.id,
  lat: c.lat,
  lng: c.lng,
  title: c.name,
  subtitle: c.role,
  place: `${c.neighbourhood}, ${c.city}`,
  avatar: c.avatar,
}));

function Home() {
  const { ids } = Route.useSearch();
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const [ob, , ready] = useLocal<Onboarding | null>(ONBOARDING_KEY, null);
  const [mine] = useMyProfile();
  const pic = avatarOf(mine);

  useEffect(() => {
    if (ready && !ob?.done) navigate({ to: "/onboarding", replace: true });
  }, [ready, ob, navigate]);

  const [preview, setPreview] = useState<string | null>(null);
  const hideT = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const pc = preview ? getCreative(preview) : undefined;
  const openProfile = (id: string) => navigate({ to: "/profile/$id", params: { id } });

  const highlight = useMemo(() => (ids ? ids.split(",") : []), [ids]);
  const target = useMemo(() => {
    if (!highlight.length) return null;
    return fitView(
      creatives
        .filter((c) => highlight.includes(c.id))
        .map((c) => [c.lat, c.lng] as [number, number]),
    );
  }, [highlight]);

  return (
    <div className="night relative flex-1 overflow-hidden">
      <SpaceBackground reducedMotion={reduced} />
      <div className="absolute inset-0">
        <Globe
          pins={pins}
          highlight={highlight}
          initial={HOME_VIEW}
          target={target}
          reducedMotion={reduced}
          onPin={openProfile}
          places={PLACES}
          previewId={preview}
          onPreview={(id) => {
            clearTimeout(hideT.current);
            setPreview(id);
          }}
        />
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 px-4 pt-5">
        <div className="pointer-events-auto relative flex items-center justify-between">
          <Link to="/me" aria-label="Your profile" className="icon-btn overflow-hidden">
            {pic ? (
              <img src={pic} alt="" className="size-full rounded-full object-cover" />
            ) : (
              <User className="size-[18px]" />
            )}
          </Link>
          <img
            src={namedLogo}
            alt="NAMED Collective"
            className="pointer-events-none absolute left-1/2 top-1/2 h-[68px] w-auto -translate-x-1/2 -translate-y-1/2 object-contain drop-shadow-[0_0_12px_rgb(248_188_255/0.35)]"
          />
          <div className="flex gap-2">
            <Link to="/saved" aria-label="Saved profiles" className="icon-btn">
              <Bookmark className="size-[18px]" />
            </Link>
            <Link to="/settings" aria-label="Settings" className="icon-btn">
              <Settings className="size-[18px]" />
            </Link>
          </div>
        </div>
      </div>

      {/* Search sits a little above the middle of the screen, with the globe below it. */}
      <div className="pointer-events-none absolute inset-x-0 top-[37%] z-10 -translate-y-1/2 px-4">
        <Link to="/search" className="glass-bar pointer-events-auto text-sm">
          <span className="orb">
            <Search className="size-5" strokeWidth={2} />
          </span>
          Search creatives, places…
        </Link>
        <p className="mt-2 text-center text-xs text-white/70">
          Drag to spin · tap a pin to preview · double-tap to recentre
        </p>
        {highlight.length > 0 && (
          <div className="pointer-events-auto mt-3 flex justify-center">
            <Link to="/" className="chip gap-1.5" aria-pressed="true">
              {highlight.length} pinned <X className="size-3.5" aria-label="Clear" />
            </Link>
          </div>
        )}
      </div>

      {pc && (
        <div
          className="absolute bottom-4 left-3 right-16 z-20"
          onMouseEnter={() => clearTimeout(hideT.current)}
          onMouseLeave={() => (hideT.current = setTimeout(() => setPreview(null), 400))}
        >
          <div className="glass relative rounded-[22px] p-2" aria-live="polite">
            <button
              type="button"
              onClick={() => openProfile(pc.id)}
              className="block w-full text-left"
              aria-label={`Open ${pc.name}'s profile`}
            >
              <div className="grid grid-cols-3 gap-1 overflow-hidden rounded-2xl">
                {pc.work.slice(0, 3).map((src, i) => (
                  <img
                    key={src}
                    src={src}
                    alt={`${pc.name} work ${i + 1}`}
                    className="aspect-square w-full object-cover"
                  />
                ))}
              </div>
              <div className="flex items-end justify-between gap-2 px-1 pb-1 pt-2">
                <span>
                  <span className="block font-semibold">{pc.name}</span>
                  <span className="block text-xs text-muted-foreground">
                    {pc.role} · {pc.neighbourhood}
                  </span>
                </span>
                <span className="btn btn-primary min-h-9 px-4 text-xs">View</span>
              </div>
            </button>
            <button
              type="button"
              aria-label="Close preview"
              onClick={() => setPreview(null)}
              className="absolute -right-2 -top-5 flex size-11 items-center justify-center"
            >
              <span className="glass flex size-7 items-center justify-center rounded-full">
                <X className="size-3.5" />
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
