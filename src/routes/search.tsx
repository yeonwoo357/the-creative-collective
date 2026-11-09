import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Globe2, Search as SearchIcon } from "lucide-react";
import { BackButton } from "@/components/TopBar";
import { CITY_COORDS, FILTERS, distanceKm, formatKm, searchCreatives, type Filter } from "@/lib/data";
import { ONBOARDING_KEY, useLocal, type Onboarding } from "@/lib/store";

export const Route = createFileRoute("/search")({
  head: () => ({
    meta: [
      { title: "Search the collective — NAMED" },
      { name: "description", content: "Filter tattoo artists, hair, piercing and nails by name, style or place." },
      { property: "og:title", content: "Search the collective — NAMED" },
      { property: "og:description", content: "Filter alternative creatives by name, style or place." },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("All");
  const input = useRef<HTMLInputElement>(null);
  const [ob] = useLocal<Onboarding | null>(ONBOARDING_KEY, null);
  const city = ob?.location || "London";
  const origin: [number, number] = CITY_COORDS[city.toLowerCase()] ?? [51.5074, -0.1278];

  useEffect(() => input.current?.focus(), []);

  const results = useMemo(
    () =>
      searchCreatives(q, filter)
        .map((c) => ({ c, km: distanceKm(origin, [c.lat, c.lng]) }))
        .sort((a, b) => a.km - b.km),
    [q, filter, origin],
  );

  return (
    <div className="flex flex-1 flex-col">
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
          <button key={f} className="chip shrink-0" aria-pressed={filter === f} onClick={() => setFilter(f)}>
            {f}
          </button>
        ))}
      </div>
      <p className="px-4 pb-2 text-xs text-muted-foreground" aria-live="polite">
        {results.length} {results.length === 1 ? "result" : "results"} near {city}
      </p>

      {results.length === 0 ? (
        <div className="px-4 py-16 text-center">
          <p className="font-semibold">Nobody here yet.</p>
          <p className="mt-1 text-sm text-muted-foreground">Try another word or tap “All” — the collective is growing.</p>
        </div>
      ) : (
        <ul className="flex-1 pb-24">
          {results.map(({ c, km }) => (
            <li key={c.id} className="border-b border-muted">
              <Link to="/profile/$id" params={{ id: c.id }} className="flex min-h-16 items-center gap-3 px-4 py-3 hover:bg-muted">
                <img src={c.avatar} alt="" className="size-11 rounded-full object-cover" />
                <span className="flex-1">
                  <span className="block font-semibold">{c.name}</span>
                  <span className="block text-xs text-muted-foreground">{c.role} · {c.neighbourhood}, {c.city}</span>
                </span>
                <span className="text-xs text-muted-foreground">{formatKm(km)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {results.length > 0 && (
        <div className="pointer-events-none sticky bottom-16 flex justify-center pb-4">
          <button
            className="btn btn-secondary pointer-events-auto rounded-full"
            onClick={() => navigate({ to: "/", search: { ids: results.map((r) => r.c.id).join(",") } })}
          >
            <Globe2 className="size-4" /> View on globe
          </button>
        </div>
      )}
    </div>
  );
}
