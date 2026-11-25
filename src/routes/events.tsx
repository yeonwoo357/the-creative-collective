import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Bookmark, MapPin } from "@/components/PixelIcons";
import { altOf, getCreative } from "@/lib/data";
import {
  EVENTS,
  WEEK,
  dayParts,
  defaultDay,
  downloadIcs,
  goingCount,
  spotsLeft,
  whenLabel,
} from "@/lib/events";
import { useRsvp, useSavedEvents } from "@/lib/store";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Events — NAMED Collective" },
      { name: "description", content: "Meet-ups, flash days and pop-ups from the collective." },
      { property: "og:title", content: "Events — NAMED Collective" },
      {
        property: "og:description",
        content: "Meet-ups, flash days and pop-ups from the collective.",
      },
    ],
  }),
  component: EventsPage,
});

function EventsPage() {
  const { going, toggle, ready } = useRsvp();
  const { isSaved, toggle: toggleSave } = useSavedEvents();
  const [tab, setTab] = useState<"available" | "booked">("available");
  const [day, setDay] = useState<string>(() => defaultDay([]));
  const [dayPicked, setDayPicked] = useState(false);

  useEffect(() => {
    if (ready && !dayPicked) setDay(defaultDay(going));
  }, [ready, dayPicked, going]);

  const available = EVENTS.filter((e) => !going.includes(e.id) && e.date === day);
  const booked = EVENTS.filter((e) => going.includes(e.id));

  return (
    <div className="flex-1 px-4 pb-8 pt-5">
      <div className="flex items-center justify-between gap-2">
        <h1
          className="text-3xl font-bold uppercase tracking-wider text-transparent"
          style={{ WebkitTextStroke: "1.5px var(--foreground)" }}
        >
          EVENTS
        </h1>
        <Link
          to="/saved"
          search={{ tab: "events" }}
          className="chip min-h-11 gap-1.5 px-3"
          aria-label="Saved events"
        >
          <Bookmark className="size-4" />
          <span>Saved</span>
        </Link>
      </div>

      <div role="tablist" aria-label="Events filter" className="mt-4 grid grid-cols-2 border-b border-white/15">
        {(["available", "booked"] as const).map((k) => (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={tab === k}
            onClick={() => setTab(k)}
            className={`min-h-11 rounded-t-xl text-sm font-bold uppercase tracking-wider ${
              tab === k ? "profile-active-tab" : "text-white/65"
            }`}
          >
            {k === "available" ? "Available" : `Booked (${booked.length})`}
          </button>
        ))}
      </div>

      {tab === "available" && (
        <>
          <div className="mt-4 grid grid-cols-6 gap-1.5" role="group" aria-label="Select day">
            {WEEK.map((d) => {
              const p = dayParts(d);
              const selected = d === day;
              const has = EVENTS.some((e) => e.date === d && !going.includes(e.id));
              return (
                <button
                  key={d}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => {
                    setDay(d);
                    setDayPicked(true);
                  }}
                  className={`flex min-h-[58px] flex-col items-center justify-center rounded-xl border text-xs transition ${
                    selected
                      ? "border-[var(--pink)] bg-[var(--pink)]/20 text-[var(--pink)]"
                      : "border-white/15 bg-white/5 text-white/80"
                  }`}
                >
                  <span className="uppercase">{p.dow}</span>
                  <span className="text-lg font-bold leading-tight">{p.day}</span>
                  {has && <span className="mt-0.5 size-1.5 rounded-full bg-[var(--pink)]" aria-hidden="true" />}
                </button>
              );
            })}
          </div>

          {available.length === 0 ? (
            <div className="glass mt-4 rounded-[22px] p-6 text-center">
              <p className="font-bold">No events on {dayParts(day).dow} {dayParts(day).day} {dayParts(day).month}.</p>
              <p className="mt-1 text-sm text-white/65">Pick another day above to see what's on.</p>
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {available.map((e) => {
                const saved = isSaved(e.id);
                const people = e.attendees.map(getCreative).filter((c): c is NonNullable<typeof c> => !!c);
                return (
                  <li key={e.id} className="glass relative rounded-[22px] p-3">
                    <button
                      type="button"
                      aria-label={saved ? `Unsave ${e.title}` : `Save ${e.title}`}
                      aria-pressed={saved}
                      onClick={() => toggleSave(e.id)}
                      className="absolute right-2 top-2 flex size-11 items-center justify-center rounded-full"
                    >
                      <Bookmark className="size-5" active={saved} />
                    </button>
                    <Link to="/event/$id" params={{ id: e.id }} className="flex gap-3 pr-9">
                      <img
                        src={e.thumb}
                        alt={altOf(e.thumb) ?? e.title}
                        className="size-24 shrink-0 rounded-2xl object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <h2 className="truncate text-lg font-bold">{e.title}</h2>
                        <p className="mt-0.5 text-xs text-[var(--pink)]">{whenLabel(e)}</p>
                        <p className="mt-1 flex items-center gap-1 text-xs text-white/70">
                          <MapPin className="size-3.5 shrink-0" />
                          <span className="truncate">{e.neighbourhood}, {e.city}</span>
                        </p>
                      </div>
                    </Link>
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <div className="flex items-center -space-x-2">
                        {people.slice(0, 4).map((p) => (
                          <img
                            key={p.id}
                            src={p.avatar}
                            alt={altOf(p.avatar) ?? p.name}
                            className="size-7 rounded-full border border-black object-cover"
                          />
                        ))}
                      </div>
                      <span className="tag text-xs">
                        {spotsLeft(e, false)} spots left · {goingCount(e, false)} going
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}

      {tab === "booked" && (
        booked.length === 0 ? (
          <div className="glass mt-4 rounded-[22px] p-6 text-center">
            <p className="font-bold">No booked events yet.</p>
            <p className="mt-1 text-sm text-white/65">Join an event from Available and it will show here.</p>
          </div>
        ) : (
          <ul className="mt-4 space-y-3">
            {booked.map((e) => {
              const saved = isSaved(e.id);
              return (
                <li key={e.id} className="glass relative rounded-[22px] p-4">
                  <button
                    type="button"
                    aria-label={saved ? `Unsave ${e.title}` : `Save ${e.title}`}
                    aria-pressed={saved}
                    onClick={() => toggleSave(e.id)}
                    className="absolute right-2 top-2 flex size-11 items-center justify-center rounded-full"
                  >
                    <Bookmark className="size-5" active={saved} />
                  </button>
                  <Link to="/event/$id" params={{ id: e.id }} className="flex gap-3 pr-9">
                    <img
                      src={e.thumb}
                      alt={altOf(e.thumb) ?? e.title}
                      className="size-20 shrink-0 rounded-2xl object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <h2 className="truncate text-lg font-bold">{e.title}</h2>
                      <p className="mt-0.5 text-xs text-[var(--pink)]">{whenLabel(e)}</p>
                      <p className="mt-1 flex items-center gap-1 text-xs text-white/75">
                        <MapPin className="size-3.5 shrink-0" />
                        <span>{e.address}</span>
                      </p>
                    </div>
                  </Link>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-white/70">
                    <span>{goingCount(e, true)} going · {spotsLeft(e, true)} spots left</span>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        downloadIcs(e);
                        toast("Calendar file downloaded");
                      }}
                      className="btn btn-primary flex-1"
                    >
                      Add to calendar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        toggle(e.id);
                        toast("Booking cancelled");
                      }}
                      className="btn btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )
      )}
    </div>
  );
}
