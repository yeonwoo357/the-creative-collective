import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Bookmark, Globe2 } from "@/components/PixelIcons";
import { BackButton } from "@/components/TopBar";
import { creatives, altOf } from "@/lib/data";
import { EVENTS, whenLabel } from "@/lib/events";
import { useSaved, useSavedEvents } from "@/lib/store";

import { savedGlobeIds } from "@/lib/discovery";

type SavedTab = "profiles" | "works" | "events";

export const Route = createFileRoute("/saved")({
  validateSearch: (s: Record<string, unknown>): { tab?: SavedTab } =>
    s["tab"] === "events" || s["tab"] === "works" || s["tab"] === "profiles"
      ? { tab: s["tab"] }
      : {},
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Saved — NAMED Collective" },
      { name: "description", content: "The creatives you've saved to your collective." },
      { property: "og:title", content: "Saved — NAMED Collective" },
      { property: "og:description", content: "The creatives you've saved to your collective." },
    ],
  }),
  component: SavedPage,
});

function SavedPage() {
  const { tab = "profiles" } = Route.useSearch();
  const navigate = useNavigate({ from: "/saved" });
  const { saved, toggle, ready } = useSaved();
  const { saved: savedEvents, toggle: toggleEvent, ready: eventsReady } = useSavedEvents();
  const list = creatives.filter((c) => saved.includes(c.id));
  const eventList = EVENTS.filter((e) => savedEvents.includes(e.id));

  return (
    <div className="flex-1">
      <div className="flex items-center gap-2 px-4 pt-4"><BackButton className="border-0" /><h1 className="text-2xl font-semibold uppercase tracking-wide">Saved</h1></div>
      <div role="tablist" aria-label="Saved filter" className="mt-3 grid grid-cols-3 border-b border-white/15 px-4">
        {(["profiles", "works", "events"] as const).map((k) => (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={tab === k}
            onClick={() => navigate({ search: k === "profiles" ? {} : { tab: k }, replace: true })}
            className={`min-h-11 rounded-t-xl text-xs font-bold uppercase tracking-wider ${
              tab === k ? "profile-active-tab" : "text-white/65"
            }`}
          >
            {k}
          </button>
        ))}
      </div>

      {tab === "profiles" && (
        <>
          {list.length > 0 && <div className="px-4 py-4"><Link to="/" search={{ ids: savedGlobeIds(saved, creatives) }} className="btn btn-secondary w-full"><Globe2 className="size-4" /> View on globe</Link></div>}
          {ready && list.length === 0 ? (
            <div className="px-4 py-16 text-center">
              <p className="font-semibold">Nothing saved yet.</p>
              <p className="mt-1 text-sm text-muted-foreground">Tap Save on a profile and they'll live here.</p>
              <Link to="/search" className="btn btn-primary mt-6">Find someone</Link>
            </div>
          ) : (
            <ul>
              {list.map((c) => (
                <li key={c.id} className="flex items-center border-b border-muted pr-2">
                  <Link to="/profile/$id" params={{ id: c.id }} className="flex min-h-16 flex-1 items-center gap-3 px-4 py-3 hover:bg-muted">
                    <img src={c.avatar} alt={altOf(c.avatar) ?? ""} className="size-11 rounded-full object-cover" />
                    <span>
                      <span className="block font-semibold">{c.name}</span>
                      <span className="block text-xs text-muted-foreground">{c.role} · {c.neighbourhood}, {c.city}</span>
                    </span>
                  </Link>
                  <button aria-label={`Unsave ${c.name}`} onClick={() => toggle(c.id)} className="flex size-11 items-center justify-center">
                    <Bookmark className="size-5" fill="currentColor" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {tab === "works" && (
        <div className="px-4 py-16 text-center">
          <p className="font-semibold">No saved works yet.</p>
          <p className="mt-1 text-sm text-muted-foreground">Saved works will appear here once work saving is added.</p>
        </div>
      )}

      {tab === "events" && (
        eventsReady && eventList.length === 0 ? (
          <div className="px-4 py-16 text-center">
            <p className="font-semibold">No saved events yet.</p>
            <p className="mt-1 text-sm text-muted-foreground">Tap the star on an event to save it here.</p>
            <Link to="/events" className="btn btn-primary mt-6">Browse events</Link>
          </div>
        ) : (
          <ul>
            {eventList.map((e) => (
              <li key={e.id} className="flex items-center border-b border-muted pr-2">
                <Link to="/event/$id" params={{ id: e.id }} className="flex min-h-16 flex-1 items-center gap-3 px-4 py-3 hover:bg-muted">
                  <img src={e.thumb} alt={altOf(e.thumb) ?? e.title} className="size-12 rounded-xl object-cover" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{e.title}</span>
                    <span className="block text-xs text-muted-foreground">{whenLabel(e)}</span>
                  </span>
                </Link>
                <button aria-label={`Unsave ${e.title}`} onClick={() => toggleEvent(e.id)} className="flex size-11 items-center justify-center">
                  <Bookmark className="size-5" active />
                </button>
              </li>
            ))}
          </ul>
        )
      )}
    </div>
  );
}
