import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { fallback, zodValidator } from "@tanstack/zod-adapter";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Bookmark, MapPin, Star, X } from "@/components/PixelIcons";
import {
  COMP_BRIEF,
  MAX_DAILY_VOTES,
  localDayKey,
  useAppliedTeams,
  useCompPopupSeen,
  useCompVotes,
  useMyTeam,
  useSoloEntry,
  votesLeft,
} from "@/lib/competition";
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

const eventsSearchSchema = z.object({
  tab: fallback(z.string(), "all").default("all"),
});

export const Route = createFileRoute("/events")({
  validateSearch: zodValidator(eventsSearchSchema),
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
  const { tab: urlTab } = Route.useSearch();
  const navigate = useNavigate({ from: "/events" });
  const section: "all" | "named" = urlTab === "named" ? "named" : "all";

  const { going, toggle, ready } = useRsvp();
  const { isSaved, toggle: toggleSave } = useSavedEvents();
  const [tab, setTab] = useState<"available" | "booked">("available");
  const [day, setDay] = useState<string>(() => defaultDay([]));
  const [dayPicked, setDayPicked] = useState(false);

  const [popupSeen, setPopupSeen, popupReady] = useCompPopupSeen();
  const [showPopup, setShowPopup] = useState(false);
  const [myTeam] = useMyTeam();
  const [soloEntry] = useSoloEntry();
  const { applied } = useAppliedTeams();
  const [voteStore] = useCompVotes();
  const [today, setToday] = useState("");

  useEffect(() => {
    setToday(localDayKey());
  }, []);

  useEffect(() => {
    if (popupReady && !popupSeen) {
      setShowPopup(true);
      setPopupSeen(true);
    }
  }, [popupReady, popupSeen, setPopupSeen]);

  useEffect(() => {
    if (ready && !dayPicked) setDay(defaultDay(going));
  }, [ready, dayPicked, going]);

  const available = EVENTS.filter((e) => !going.includes(e.id) && e.date === day);
  const booked = EVENTS.filter((e) => going.includes(e.id));
  const leftToday = today ? votesLeft(voteStore, today) : MAX_DAILY_VOTES;

  const statusText = (() => {
    if (myTeam?.entry || soloEntry?.entry) return "Entry sent";
    if (myTeam) return `Team: ${myTeam.name}`;
    if (soloEntry) return "Going solo";
    if (applied.length > 0) return `Applied to ${applied.length} team${applied.length > 1 ? "s" : ""}`;
    return "Not entered yet";
  })();

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

      <div
        role="tablist"
        aria-label="Events section"
        className="glass mt-4 grid grid-cols-2 rounded-full p-1"
      >
        {(
          [
            ["all", "All events"],
            ["named", "Get Named"],
          ] as const
        ).map(([k, label]) => {
          const active = section === k;
          return (
            <button
              key={k}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => navigate({ search: { tab: k }, replace: true })}
              className={`min-h-11 rounded-full text-sm font-bold transition ${
                active
                  ? "bg-white/20 text-foreground shadow-[inset_0_1px_0_rgb(255_255_255/0.25)]"
                  : "text-white/65 hover:text-foreground"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {section === "named" ? (
        <div className="mt-4 space-y-4">
          <section
            className="glass rounded-[24px] p-5"
            style={{
              background:
                "linear-gradient(160deg, rgba(173,93,132,0.28) 0%, rgba(74,33,64,0.35) 55%, rgba(0,0,0,0.75) 100%)",
            }}
          >
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[var(--pink)]">
              <Star className="size-4" active />
              <span>New competition</span>
            </div>
            <h2 className="mt-2 text-3xl font-bold uppercase tracking-wider">GET NAMED</h2>
            <p className="mt-1 text-lg">The professional idea competition</p>
            <p className="mt-3 text-sm text-white/80">
              Pitch an idea for NAMED Collective with your crew, or go solo. App users pick the winners.
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2.5 text-xs">
              <div className="rounded-2xl border border-white/15 bg-black/35 p-3">
                <div className="text-white/60">Brief</div>
                <div className="mt-0.5 font-bold">Set by NAMED</div>
              </div>
              <div className="rounded-2xl border border-white/15 bg-black/35 p-3">
                <div className="text-white/60">Dates</div>
                <div className="mt-0.5 font-bold">TBC</div>
              </div>
              <div className="rounded-2xl border border-white/15 bg-black/35 p-3">
                <div className="text-white/60">Teams</div>
                <div className="mt-0.5 font-bold">Solo or up to 4</div>
              </div>
              <div className="rounded-2xl border border-white/15 bg-black/35 p-3">
                <div className="text-white/60">Prize</div>
                <div className="mt-0.5 font-bold">TBC</div>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-[var(--pink)]/30 bg-black/40 p-3.5">
              <div className="text-xs font-bold uppercase tracking-wider text-[var(--pink)]">
                This round&apos;s brief
              </div>
              <p className="mt-1 text-sm text-white/90">{COMP_BRIEF}</p>
            </div>

            <div className="mt-4 flex items-center justify-between gap-2 rounded-2xl border border-white/15 bg-black/35 px-3.5 py-2.5 text-xs">
              <span className="text-white/65">Your status</span>
              <span className="font-bold text-[var(--pink)]">{statusText}</span>
            </div>

            <div className="mt-5 flex flex-col gap-2.5">
              <Link to="/competition/join" className="btn btn-primary w-full">
                Join the competition
              </Link>
              <Link to="/competition/vote" className="btn btn-secondary w-full">
                Vote · {leftToday} of {MAX_DAILY_VOTES} left today
              </Link>
            </div>
          </section>
        </div>
      ) : (
        <>
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
        </>
      )}

      {showPopup && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="get-named-dialog-title"
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 p-4 sm:items-center"
        >
          <div
            className="glass relative w-full max-w-[365px] rounded-[28px] p-5"
            style={{
              background:
                "linear-gradient(165deg, rgba(173,93,132,0.42) 0%, rgba(74,33,64,0.72) 45%, rgba(12,6,14,0.96) 100%)",
            }}
          >
            <button
              type="button"
              aria-label="Close competition announcement"
              onClick={() => setShowPopup(false)}
              className="icon-btn absolute right-4 top-4"
            >
              <X className="size-4" />
            </button>

            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[var(--pink)]">
              <Star className="size-4" active />
              <span>New competition</span>
            </div>
            <h2 id="get-named-dialog-title" className="mt-3 text-3xl font-bold uppercase tracking-wider">
              GET NAMED
            </h2>
            <p className="mt-1 text-lg">The professional idea competition</p>
            <p className="mt-3 text-sm text-white/85">
              Pitch an idea for NAMED Collective with your crew, or go solo. App users pick the winners.
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2.5 text-xs">
              <div className="rounded-2xl border border-white/15 bg-black/35 p-3">
                <div className="text-white/60">Brief</div>
                <div className="mt-0.5 font-bold">Set by NAMED</div>
              </div>
              <div className="rounded-2xl border border-white/15 bg-black/35 p-3">
                <div className="text-white/60">Dates</div>
                <div className="mt-0.5 font-bold">TBC</div>
              </div>
              <div className="rounded-2xl border border-white/15 bg-black/35 p-3">
                <div className="text-white/60">Teams</div>
                <div className="mt-0.5 font-bold">Solo or up to 4</div>
              </div>
              <div className="rounded-2xl border border-white/15 bg-black/35 p-3">
                <div className="text-white/60">Prize</div>
                <div className="mt-0.5 font-bold">TBC</div>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-2.5">
              <Link
                to="/competition/join"
                onClick={() => setShowPopup(false)}
                className="btn btn-primary w-full"
              >
                Join the competition
              </Link>
              <Link
                to="/competition/vote"
                onClick={() => setShowPopup(false)}
                className="btn btn-secondary w-full"
              >
                Vote for teams
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
