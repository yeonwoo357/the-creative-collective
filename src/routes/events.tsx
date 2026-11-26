import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { MapPin, Star, Ticket } from "@/components/PixelIcons";
import { BackButton } from "@/components/TopBar";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useRsvp } from "@/lib/store";
import { COMPETITION, MAX_VOTES_PER_DAY, useCompetition, useVotes } from "@/lib/competition";

type Tab = "all" | "named";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Events — NAMED Collective" },
      { name: "description", content: "Meet-ups, flash days and pop-ups from the collective." },
      { property: "og:title", content: "Events — NAMED Collective" },
      {
        property: "og:description",
        content: "Meet-ups, flash days and pop-ups from the collective.",
      },
    ],
  }),
  validateSearch: (s: Record<string, unknown>): { tab?: Tab } =>
    s["tab"] === "named" ? { tab: "named" } : {},
  component: EventsPage,
});

// Sample events for the prototype.
const EVENTS = [
  {
    id: "flash-dalston",
    date: "SAT 5 DEC",
    title: "Flash day with the collective",
    place: "Dalston, London",
    what: "Six artists, one wall of flash, walk-ins all day.",
  },
  {
    id: "popup-soho",
    date: "THU 10 DEC",
    title: "NAMED pop-up & archive rail",
    place: "Soho, London",
    what: "Try the new drop, dig the archive, meet the makers.",
  },
  {
    id: "meetup-peckham",
    date: "SUN 13 DEC",
    title: "Creatives' meet-up",
    place: "Peckham, London",
    what: "Bring your portfolio. Swap tips, find collaborators.",
  },
];

function EventsPage() {
  const { tab = "all" } = Route.useSearch();
  const navigate = useNavigate({ from: "/events" });
  const [comp, setComp, ready] = useCompetition();
  const [popup, setPopup] = useState(false);
  // The competition pops up once, the first time someone opens Events.
  useEffect(() => {
    if (ready && !comp.popupSeen) setPopup(true);
  }, [ready, comp.popupSeen]);
  const closePopup = () => {
    setPopup(false);
    if (!comp.popupSeen) setComp({ popupSeen: true });
  };
  const setTab = (t: Tab) =>
    navigate({ search: t === "named" ? { tab: "named" } : {}, replace: true });

  return (
    <div className="flex-1 pb-8">
      <div className="flex items-center gap-2 px-4 pt-4">
        <BackButton />
        <h1 className="text-2xl">Events</h1>
      </div>
      <div
        role="tablist"
        aria-label="Events"
        className="glass mx-3 mt-3 grid grid-cols-2 gap-1 rounded-full p-1"
      >
        {(
          [
            ["all", "All events"],
            ["named", "Get Named"],
          ] as const
        ).map(([t, label]) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={`min-h-11 rounded-full text-sm ${tab === t ? "btn-primary" : "text-white/65"}`}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === "all" ? <EventList /> : <CompetitionTab />}

      <Dialog open={popup} onOpenChange={(o) => (o ? setPopup(true) : closePopup())}>
        <DialogContent className="max-w-[360px] gap-4 rounded-[28px] border-[var(--pink)]/40 bg-[linear-gradient(160deg,rgb(74_33_64/0.97),rgb(20_11_19/0.98))] p-6 font-mono">
          <p className="flex items-center gap-2 text-xs font-bold uppercase text-[var(--pink)]">
            <Star className="size-4" active /> New competition
          </p>
          <div>
            <DialogTitle className="text-3xl uppercase">{COMPETITION.name}</DialogTitle>
            <p className="mt-1 text-lg">{COMPETITION.tagline}</p>
          </div>
          <DialogDescription className="text-sm text-white/85">
            {COMPETITION.pitch}
          </DialogDescription>
          <Facts />
          <div className="flex flex-col gap-2">
            <Link to="/competition/join" className="btn btn-primary" onClick={closePopup}>
              Join the competition
            </Link>
            <Link to="/competition/vote" className="btn btn-secondary" onClick={closePopup}>
              Vote for teams
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Facts() {
  const facts = [
    ["Brief", "Set by NAMED"],
    ["Dates", COMPETITION.dates],
    ["Teams", "Solo or up to 4"],
    ["Prize", COMPETITION.prize],
  ];
  return (
    <dl className="grid grid-cols-2 gap-2 text-xs">
      {facts.map(([k, v]) => (
        <div key={k} className="rounded-2xl border border-white/20 px-3 py-2">
          <dt className="text-white/65">{k}</dt>
          <dd>{v}</dd>
        </div>
      ))}
    </dl>
  );
}

function CompetitionTab() {
  const [comp] = useCompetition();
  const votes = useVotes();
  const status = comp.entry
    ? `Entry sent: ${comp.entry.title}`
    : comp.team
      ? `Your team: ${comp.team.name}`
      : comp.mode === "solo"
        ? "Entering solo"
        : comp.applied.length
          ? `Applied to ${comp.applied.length} team${comp.applied.length > 1 ? "s" : ""}`
          : "";
  return (
    <div className="mt-3 space-y-3 px-3">
      <section className="glass rounded-[24px] p-4">
        <p className="flex items-center gap-2 text-xs font-bold uppercase text-[var(--pink)]">
          <Star className="size-4" active /> Competition
        </p>
        <h2 className="mt-2 text-2xl">{COMPETITION.name}</h2>
        <p className="mt-1 text-sm">{COMPETITION.pitch}</p>
        <p className="mt-3 text-xs text-white/65">This round's brief</p>
        <p className="text-sm">{COMPETITION.brief}</p>
        <div className="mt-3">
          <Facts />
        </div>
        {status && <p className="mt-3 text-sm text-[var(--pink)]">{status}</p>}
        <div className="mt-4 flex flex-col gap-2">
          <Link
            to={comp.mode ? "/competition/teams" : "/competition/join"}
            className="btn btn-primary"
          >
            {comp.mode ? "Teams & my entry" : "Join the competition"}
          </Link>
          <Link to="/competition/vote" className="btn btn-secondary">
            Vote · {votes.left} of {MAX_VOTES_PER_DAY} left today
          </Link>
        </div>
      </section>
      <p className="px-1 text-xs text-white/65">
        Voting is open to every app user, in the app only. Entering needs a professional profile.
      </p>
    </div>
  );
}

function EventList() {
  const { going, toggle } = useRsvp();
  return (
    <ul className="mt-3 space-y-3 px-3">
      {EVENTS.map((e) => {
        const on = going.includes(e.id);
        return (
          <li key={e.id} className="glass rounded-[24px] p-4">
            <p className="flex items-center gap-2 text-xs font-bold text-[var(--pink)]">
              <Ticket className="size-4" /> {e.date}
            </p>
            <h2 className="mt-2 text-lg">{e.title}</h2>
            <p className="mt-1 flex items-center gap-1 text-sm text-white/65">
              <MapPin className="size-3.5" /> {e.place}
            </p>
            <p className="mt-2 text-sm">{e.what}</p>
            <button
              type="button"
              aria-pressed={on}
              onClick={() => {
                toggle(e.id);
                toast(on ? "Removed from your plans" : "You're on the list");
              }}
              className={`btn mt-4 w-full ${on ? "btn-secondary" : "btn-primary"}`}
            >
              {on ? "Going ✓" : "I'm going"}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
