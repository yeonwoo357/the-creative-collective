import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Bookmark, Search, Settings, User, X } from "lucide-react";
import { Globe, HOME_VIEW, fitView, type Pin } from "@/components/Globe";
import { PLACES, creatives, getCreative } from "@/lib/data";
import { ONBOARDING_KEY, useLocal, useReducedMotion, type Onboarding } from "@/lib/store";

export const Route = createFileRoute("/")({
  // Globe geometry is measured in the browser; skip server render to avoid float mismatches.
  ssr: false,
  validateSearch: (s: Record<string, unknown>): { ids?: string } =>
    typeof s["ids"] === "string" && s["ids"] ? { ids: s["ids"] } : {},
  head: () => ({
    meta: [
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
    <div className="night relative flex-1">
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

      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 px-4 pt-4">
        <div className="pointer-events-auto flex items-center justify-between">
          <Link
            to="/me"
            aria-label="Your profile"
            className="flex size-11 items-center justify-center rounded-full border border-foreground bg-background"
          >
            <User className="size-5" />
          </Link>
          <span className="pl-12 text-sm font-bold tracking-[0.35em]">NAMED</span>
          <div className="flex gap-2">
            <Link
              to="/saved"
              aria-label="Saved profiles"
              className="flex size-11 items-center justify-center rounded-full border border-foreground bg-background"
            >
              <Bookmark className="size-5" />
            </Link>
            <Link
              to="/settings"
              aria-label="Settings"
              className="flex size-11 items-center justify-center rounded-full border border-foreground bg-background"
            >
              <Settings className="size-5" />
            </Link>
          </div>
        </div>
        <Link
          to="/search"
          className="pointer-events-auto mt-6 flex min-h-12 items-center gap-2 rounded-full border border-foreground bg-background px-4 text-sm text-muted-foreground"
        >
          <Search className="size-4 text-foreground" /> Search creatives, places…
        </Link>
        <p className="mt-2 text-center text-xs text-muted-foreground">
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
          className="absolute inset-x-3 bottom-4 right-16 z-20"
          onMouseEnter={() => clearTimeout(hideT.current)}
          onMouseLeave={() => (hideT.current = setTimeout(() => setPreview(null), 400))}
        >
          <div className="relative rounded-md border border-dashed border-foreground bg-background p-2" aria-live="polite">
            <button
              type="button"
              onClick={() => openProfile(pc.id)}
              className="block w-full text-left"
              aria-label={`Open ${pc.name}'s profile`}
            >
              <div className="grid grid-cols-3 gap-px bg-muted">
                {pc.work.slice(0, 3).map((src, i) => (
                  <img key={src} src={src} alt={`${pc.name} work ${i + 1}`} className="aspect-square w-full object-cover" />
                ))}
              </div>
              <div className="flex items-end justify-between gap-2 px-1 pb-1 pt-2">
                <span>
                  <span className="block font-semibold">{pc.name}</span>
                  <span className="block text-xs text-muted-foreground">
                    {pc.role} · {pc.neighbourhood}
                  </span>
                </span>
                <span className="text-[11px] uppercase tracking-widest underline underline-offset-4">View</span>
              </div>
            </button>
            <button
              type="button"
              aria-label="Close preview"
              onClick={() => setPreview(null)}
              className="absolute -right-2 -top-5 flex size-11 items-center justify-center"
            >
              <span className="flex size-7 items-center justify-center rounded-full border border-foreground bg-background">
                <X className="size-3.5" />
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
