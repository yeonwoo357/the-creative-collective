import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { Search, Settings, User, X } from "lucide-react";
import { Globe, fitView, type Pin } from "@/components/Globe";
import { creatives } from "@/lib/data";
import { ONBOARDING_KEY, useLocal, useReducedMotion, type Onboarding } from "@/lib/store";

export const Route = createFileRoute("/")({
  // Globe geometry is measured in the browser; skip server render to avoid float mismatches.
  ssr: false,
  validateSearch: (s: Record<string, unknown>): { ids?: string } =>
    typeof s["ids"] === "string" && s["ids"] ? { ids: s["ids"] } : {},
  head: () => ({
    meta: [
      { title: "Discover — NAMED Collective" },
      { name: "description", content: "Spin the globe and find tattoo artists, piercers, hair, nails and more near you." },
      { property: "og:title", content: "Discover — NAMED Collective" },
      { property: "og:description", content: "Spin the globe and find alternative creatives near you." },
    ],
  }),
  component: Home,
});

const pins: Pin[] = creatives.map((c) => ({
  id: c.id,
  lat: c.lat,
  lng: c.lng,
  title: c.name,
  subtitle: `${c.role} · ${c.city}`,
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

  const highlight = useMemo(() => (ids ? ids.split(",") : []), [ids]);
  const target = useMemo(() => {
    if (!highlight.length) return null;
    return fitView(
      creatives.filter((c) => highlight.includes(c.id)).map((c) => [c.lat, c.lng] as [number, number]),
    );
  }, [highlight]);

  return (
    <div className="relative flex-1">
      <div className="absolute inset-0">
        <Globe
          pins={pins}
          highlight={highlight}
          initial={{ lambda: -5, phi: -52, k: 1100 }}
          target={target}
          reducedMotion={reduced}
          onPin={(id) => navigate({ to: "/profile/$id", params: { id } })}
        />
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 px-4 pt-4">
        <div className="pointer-events-auto flex items-center justify-between">
          <Link to="/me" aria-label="Your profile" className="flex size-11 items-center justify-center rounded-full border border-foreground bg-background">
            <User className="size-5" />
          </Link>
          <span className="text-sm font-bold tracking-[0.35em]">NAMED</span>
          <Link to="/settings" aria-label="Settings" className="flex size-11 items-center justify-center rounded-full border border-foreground bg-background">
            <Settings className="size-5" />
          </Link>
        </div>
        <Link
          to="/search"
          className="pointer-events-auto mt-6 flex min-h-12 items-center gap-2 rounded-full border border-foreground bg-background px-4 text-sm text-muted-foreground"
        >
          <Search className="size-4 text-foreground" /> Search creatives, places…
        </Link>
        <p className="mt-2 text-center text-xs text-muted-foreground">Drag to spin · tap a pop-up to view</p>
        {highlight.length > 0 && (
          <div className="pointer-events-auto mt-3 flex justify-center">
            <Link to="/" className="chip gap-1.5" aria-pressed="true">
              {highlight.length} pinned <X className="size-3.5" aria-label="Clear" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
