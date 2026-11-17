import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Globe2, Search as SearchIcon } from "@/components/PixelIcons";
import { BackButton } from "@/components/TopBar";
import { FILTERS, hoodCoords, formatKm, searchCreatives, searchWork, type Filter, altOf } from "@/lib/data";
import { ONBOARDING_KEY, useLocal, useMyProfile, useSaved, useRecent, type Onboarding } from "@/lib/store";

import { SwipeRow } from "@/components/SwipeRow";
import { Button } from "@/components/ui/button";
import { rankCreatives, type DiscoverySort } from "@/lib/discovery";

export const Route = createFileRoute("/search")({
  validateSearch: (s: Record<string, unknown>): { q?: string } =>
    typeof s["q"] === "string" && s["q"] ? { q: s["q"] } : {},
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Discover the collective — NAMED" },
      { name: "description", content: "Filter tattoo artists, hair, piercing and nails by name, style or place." },
      { property: "og:title", content: "Discover the collective — NAMED" },
      { property: "og:description", content: "Filter alternative creatives by name, style or place." },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const navigate = useNavigate();
  const initial = Route.useSearch().q ?? "";
  const [q, setQ] = useState(initial);
  const [filter, setFilter] = useState<Filter>("All");
  const input = useRef<HTMLInputElement>(null);
  const [ob] = useLocal<Onboarding | null>(ONBOARDING_KEY, null);
  const city = ob?.location || "London";
  const [mine] = useMyProfile();
  const { saved } = useSaved();
  const { recent } = useRecent();
  const [sort, setSort] = useState<DiscoverySort>("For you");
  const origin = hoodCoords(mine.neighbourhood, city);

  useEffect(() => {
    input.current?.focus();
  }, []);

  const results = useMemo(() => rankCreatives(searchCreatives(q, filter), sort, saved, recent, origin), [q, filter, sort, saved, recent, origin[0], origin[1]]);
  const work = useMemo(() => {
    const matches = searchWork(q, filter);
    const ranked = rankCreatives(matches.map((w) => w.creative), sort, saved, recent, origin);
    const order = new Map(ranked.map((r, i) => [r.c.id, i]));
    return matches.sort((a, b) => (order.get(a.creative.id) ?? 0) - (order.get(b.creative.id) ?? 0));
  }, [q, filter, sort, saved, recent, origin[0], origin[1]]);
  const disciplines = Array.from(new Set(work.map((w) => w.creative.category)));

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <h1 className="px-4 pt-4 text-2xl font-bold uppercase">Discover</h1>
      <div className="flex items-center gap-2 px-4 pt-4">
        <BackButton className="border-0" />
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2" />
          <label htmlFor="q" className="sr-only">Search creatives, places</label>
          <input
            id="q"
            ref={input}
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search creatives, places…"
            className="field rounded-full border-foreground pl-10"
          />
        </div>
      </div>
      <div className="flex gap-2 overflow-x-auto px-4 py-4" role="group" aria-label="Category">
        {FILTERS.map((f) => (
          <Button variant="ghost" key={f} className="chip shrink-0" aria-pressed={filter === f} onClick={() => setFilter(f)}>
            {f}
          </Button>
        ))}
      </div>
      <div role="group" aria-label="Sort creatives" className="flex gap-2 px-4 pb-4">
        {(["For you", "Nearest"] as const).map((value) => <Button key={value} variant="ghost" className="chip min-h-11" aria-pressed={sort === value} onClick={() => setSort(value)}>{value}</Button>)}
      </div>
      <p className="px-4 pb-2 text-xs text-muted-foreground" aria-live="polite">
        {work.length} {work.length === 1 ? "piece" : "pieces"} of work · {results.length} {results.length === 1 ? "profile" : "profiles"} near {city}
      </p>

      {results.length === 0 ? (
        <div className="px-4 py-16 text-center">
          <p className="font-semibold">Nobody here yet.</p>
          <p className="mt-1 text-sm text-muted-foreground">Try another word or tap “All” — the collective is growing.</p>
        </div>
      ) : (
        <>
        {disciplines.map((discipline) => (
          <section key={discipline} aria-label={`${discipline} work`}>
            <h2 className="label px-4 pb-2 pt-3">{discipline}</h2>
            <SwipeRow label={`${discipline} work`}>
              {work.filter((w) => w.creative.category === discipline).map(({ creative, project }) => {
                const reason = results.find((r) => r.c.id === creative.id)?.interest.label;
                return <Link key={project.id} to="/project/$id" params={{ id: project.id }} className="swipe-card glass overflow-hidden rounded-lg">
                  <img src={project.images[0]} alt={altOf(project.images[0] ?? "") ?? project.title} loading="lazy" className="aspect-square w-full object-cover" />
                  <div className="p-3"><p className="font-bold">{project.title}</p><p className="text-xs text-muted-foreground">{creative.name}</p>{sort === "For you" && reason && <p className="mt-2 text-xs text-muted-foreground">{reason}</p>}</div>
                </Link>;
              })}
            </SwipeRow>
          </section>
        ))}
        <h2 className="label px-4 pb-1 pt-6">Profiles</h2>
        <ul className="flex-1 pb-24">
          {results.map(({ c, km, interest }) => (
            <li key={c.id} className="border-b border-muted">
              <Link to="/profile/$id" params={{ id: c.id }} className="flex min-h-16 items-center gap-3 px-4 py-3 hover:bg-muted">
                <img src={c.avatar} alt={altOf(c.avatar) ?? ""} className="size-11 rounded-full object-cover" />
                <span className="flex-1">
                  <span className="block font-semibold">{c.name}</span>
                  <span className="block text-xs text-muted-foreground">{c.role} · {c.neighbourhood}, {c.city}</span>
                  {sort === "For you" && interest.label && <span className="block text-xs text-muted-foreground">{interest.label}</span>}
                </span>
                <span className="text-xs text-muted-foreground">{formatKm(km)}</span>
              </Link>
            </li>
          ))}
        </ul>
        </>
      )}

      {results.length > 0 && (
        <div className="pointer-events-none sticky bottom-16 flex justify-center pb-4">
          <Button variant="ghost"
            className="btn btn-secondary pointer-events-auto rounded-full"
            onClick={() => navigate({ to: "/", search: { ids: results.map((r) => r.c.id).join(",") } })}
          >
            <Globe2 className="size-4" /> View on globe
          </Button>
        </div>
      )}
    </div>
  );
}
