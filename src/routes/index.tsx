import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Bookmark, Search, Settings, User, X } from "@/components/PixelIcons";
import { Globe, HOME_VIEW, fitView, type Pin } from "@/components/Globe";
import { SpaceBackground } from "@/components/SpaceBackground";
import { FILTERS, categoryLabel, NEIGHBOURHOODS, PLACES, altOf, creatives, searchCreatives } from "@/lib/data";
import { EVENTS, whenLabel } from "@/lib/events";
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
  avatarAlt: altOf(c.avatar),
  work: c.work.slice(0, 3).map((src, i) => ({ src, alt: altOf(src) ?? `${c.name} work ${i + 1}` })),
}));

const eventPins: Pin[] = EVENTS.map((e) => ({
  id: `event:${e.id}`,
  lat: e.lat,
  lng: e.lng,
  title: e.title,
  subtitle: whenLabel(e),
  place: `${e.neighbourhood}, ${e.city}`,
  avatar: e.thumb,
  avatarAlt: altOf(e.thumb) ?? e.title,
  cta: "View event",
}));

const allPins: Pin[] = [...pins, ...eventPins];

const DISC = FILTERS.filter((d) => d !== "All");

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
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const term = q.trim().toLowerCase();
  const sugPeople = useMemo(() => (term ? searchCreatives(q, "All") : creatives).slice(0, 4), [q, term]);
  const sugDisc = DISC.filter((d) => !term || categoryLabel(d).toLowerCase().includes(term) || d.toLowerCase().includes(term)).slice(0, 4);
  const sugHoods = NEIGHBOURHOODS.filter((n) => !term || n.toLowerCase().includes(term)).slice(0, 4);
  const goSearch = (value = q) => navigate({ to: "/search", search: value.trim() ? { q: value.trim() } : {} });
  const openPin = (id: string) =>
    id.startsWith("event:")
      ? navigate({ to: "/event/$id", params: { id: id.slice(6) } })
      : navigate({ to: "/profile/$id", params: { id } });

  const highlight = useMemo(() => (ids ? ids.split(",") : []), [ids]);
  const visiblePins = useMemo(
    () => (highlight.some((id) => id.startsWith("event:")) ? allPins : pins),
    [highlight],
  );
  const target = useMemo(() => {
    if (!highlight.length) return null;
    return fitView(
      allPins
        .filter((p) => highlight.includes(p.id))
        .map((p) => [p.lat, p.lng] as [number, number]),
    );
  }, [highlight]);

  return (
    <div className="night relative flex-1 overflow-hidden">
      <SpaceBackground reducedMotion={reduced} />
      <div className="absolute inset-0">
        <Globe
          pins={visiblePins}
          highlight={highlight}
          initial={HOME_VIEW}
          target={target}
          reducedMotion={reduced}
          onPin={openPin}
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
      <div className="pointer-events-none absolute inset-x-0 top-[30%] z-10 -translate-y-1/2 px-4">
        <form
          role="search"
          className="pointer-events-auto relative"
          onSubmit={(e) => {
            e.preventDefault();
            goSearch();
          }}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false);
          }}
        >
          <label className="glass-bar text-sm">
            <span className="orb">
              <Search className="size-5" strokeWidth={2} />
            </span>
            <span className="sr-only">Search creatives, places</span>
            <input
              type="search"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
              placeholder="Find your people, places…"
              aria-expanded={open}
              aria-controls="home-suggest"
              className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-white/70"
            />
          </label>
          {open && (
            <div
              id="home-suggest"
              className="glass absolute inset-x-0 top-full z-30 mt-2 max-h-[52vh] overflow-y-auto rounded-[22px] p-2"
            >
              {sugPeople.length > 0 && (
                <>
                  <p className="label px-2 pb-1 pt-1 text-white/60">Creatives</p>
                  {sugPeople.map((c) => (
                    <Link
                      key={c.id}
                      to="/profile/$id"
                      params={{ id: c.id }}
                      className="flex min-h-11 items-center gap-3 rounded-2xl px-2 hover:bg-white/10"
                    >
                      <img src={c.avatar} alt={altOf(c.avatar) ?? c.name} className="size-8 rounded-full object-cover" />
                      <span className="min-w-0 flex-1 truncate">
                        {c.name} <span className="text-xs text-white/60">· {c.role}</span>
                      </span>
                    </Link>
                  ))}
                </>
              )}
              {sugDisc.length > 0 && (
                <>
                  <p className="label px-2 pb-1 pt-2 text-white/60">Disciplines</p>
                  <div className="flex flex-wrap gap-2 px-1 pb-1">
                    {sugDisc.map((d) => (
                      <button key={d} type="button" className="chip" onClick={() => goSearch(categoryLabel(d))}>
                        {categoryLabel(d)}
                      </button>
                    ))}
                  </div>
                </>
              )}
              {sugHoods.length > 0 && (
                <>
                  <p className="label px-2 pb-1 pt-2 text-white/60">Neighbourhoods</p>
                  <div className="flex flex-wrap gap-2 px-1 pb-1">
                    {sugHoods.map((n) => (
                      <button key={n} type="button" className="chip" onClick={() => goSearch(n)}>
                        {n}
                      </button>
                    ))}
                  </div>
                </>
              )}
              <button type="submit" className="btn btn-primary mt-2 w-full">
                See all
              </button>
            </div>
          )}
        </form>
        <p className="mt-2 text-center text-xs text-white/70">
          Give it a spin · tap a pin · double-tap to recentre
        </p>
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
