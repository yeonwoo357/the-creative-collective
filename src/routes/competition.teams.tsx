import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "@/components/PixelIcons";
import {
  CRAFTS,
  allTeams,
  useAppliedTeams,
  useMyTeam,
  useSoloEntry,
  type Craft,
} from "@/lib/competition";
import { altOf } from "@/lib/data";

export const Route = createFileRoute("/competition/teams")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Find a team — GET NAMED" },
      { name: "description", content: "Browse crews with open spots for GET NAMED." },
      { property: "og:title", content: "Find a team — GET NAMED" },
      { property: "og:description", content: "Browse crews with open spots for GET NAMED." },
    ],
  }),
  component: FindTeamPage,
});

function FindTeamPage() {
  const [myTeam] = useMyTeam();
  const [soloEntry] = useSoloEntry();
  const { applied, isApplied } = useAppliedTeams();
  const [tab, setTab] = useState<"all" | "mine">("all");
  const [craft, setCraft] = useState<"All" | Craft>("All");
  const [index, setIndex] = useState(0);

  const teams = useMemo(() => {
    const list = allTeams(myTeam, soloEntry).filter((t) => !t.isSolo);
    if (tab === "mine") {
      return list.filter((t) => t.isMine || applied.includes(t.id));
    }
    const visible = list.filter((t) => t.listed || t.isMine);
    if (craft === "All") return visible;
    return visible.filter((t) => t.openSpots.includes(craft));
  }, [myTeam, soloEntry, tab, applied, craft]);

  const safeIdx = teams.length ? Math.min(index, teams.length - 1) : 0;
  const active = teams[safeIdx];
  const prevTeam = safeIdx > 0 ? teams[safeIdx - 1] : undefined;
  const nextTeam = safeIdx < teams.length - 1 ? teams[safeIdx + 1] : undefined;

  return (
    <div className="flex flex-1 flex-col overflow-x-hidden px-4 pb-8 pt-5">
      <header className="flex items-center gap-3">
        <Link to="/competition/join" className="icon-btn" aria-label="Back to join options">
          <ChevronLeft className="size-5" />
        </Link>
        <h1 className="text-2xl font-bold uppercase tracking-wide">JOIN A TEAM</h1>
      </header>

      <div
        role="tablist"
        aria-label="Teams filter"
        className="glass mt-4 grid grid-cols-2 rounded-full p-1"
      >
        {(
          [
            ["all", "All teams"],
            ["mine", "My team"],
          ] as const
        ).map(([k, label]) => (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={tab === k}
            onClick={() => {
              setTab(k);
              setIndex(0);
            }}
            className={`min-h-11 rounded-full text-sm transition ${
              tab === k
                ? "bg-[var(--pink)] font-bold text-black"
                : "text-white/75 hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {!active ? (
        <div className="glass mt-6 rounded-[24px] p-6 text-center">
          <p className="font-bold">
            {tab === "mine" ? "No team yet." : `No teams looking for ${craft} right now.`}
          </p>
          <p className="mt-1 text-sm text-white/65">
            {tab === "mine"
              ? "Create your own crew or apply to one in All teams."
              : "Try another craft filter or start your own team."}
          </p>
          <Link to="/competition/create" className="btn btn-primary mt-4 w-full">
            Create a team
          </Link>
        </div>
      ) : (
        <div className="mt-5">
          <div className="relative flex items-center justify-center">
            {/* Faded peeking side cards */}
            {prevTeam && (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -left-24 h-[86%] w-28 rounded-[24px] border border-white/10 bg-white/[0.04] opacity-40"
              />
            )}
            {nextTeam && (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-24 h-[86%] w-28 rounded-[24px] border border-white/10 bg-white/[0.04] opacity-40"
              />
            )}

            <button
              type="button"
              aria-label="Previous team"
              disabled={safeIdx === 0}
              onClick={() => setIndex((i) => Math.max(0, i - 1))}
              className="icon-btn absolute left-0 z-10 disabled:opacity-30"
            >
              <ChevronLeft className="size-4" />
            </button>

            <article className="glass mx-7 w-full rounded-[26px] p-5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold uppercase tracking-widest text-[var(--pink)]">
                  {active.openSpots.length > 0
                    ? `${active.openSpots.length} ${active.openSpots.length === 1 ? "spot" : "spots"} open`
                    : "Team full"}
                </span>
                {active.isMine && <span className="tag text-xs text-[var(--pink)]">Your team</span>}
                {!active.isMine && isApplied(active.id) && (
                  <span className="tag text-xs text-[var(--pink)]">Applied</span>
                )}
              </div>

              <h2 className="mt-1.5 text-2xl font-bold uppercase tracking-wide">{active.name}</h2>

              <ul className="mt-4 space-y-2.5">
                {active.members.map((m) => (
                  <li key={m.id} className="flex items-center gap-3 text-sm">
                    {m.avatar ? (
                      <img
                        src={m.avatar}
                        alt={altOf(m.avatar) ?? m.name}
                        className="size-9 shrink-0 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--rose)] text-xs font-bold">
                        {m.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <span className="truncate">
                      {m.role}
                      {m.lead ? " · Lead" : ""}
                    </span>
                  </li>
                ))}
                {active.openSpots.map((spot, i) => (
                  <li key={`${spot}-${i}`} className="flex items-center gap-3 text-sm text-[var(--pink)]">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-dashed border-white/35 text-xs text-white/75">
                      ?
                    </div>
                    <span>Open · {spot}</span>
                  </li>
                ))}
              </ul>

              <Link
                to="/competition/team/$id"
                params={{ id: active.id }}
                className="btn btn-primary mt-5 w-full"
              >
                View team
              </Link>
            </article>

            <button
              type="button"
              aria-label="Next team"
              disabled={safeIdx >= teams.length - 1}
              onClick={() => setIndex((i) => Math.min(teams.length - 1, i + 1))}
              className="icon-btn absolute right-0 z-10 disabled:opacity-30"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>

          {/* Square pagination dots */}
          <div className="mt-4 flex items-center justify-center gap-2" role="tablist" aria-label="Team slides">
            {teams.map((t, i) => (
              <button
                key={t.id}
                type="button"
                aria-label={`Show ${t.name}`}
                aria-selected={i === safeIdx}
                onClick={() => setIndex(i)}
                className={`size-2.5 transition ${
                  i === safeIdx ? "bg-[var(--pink)]" : "bg-white/25 hover:bg-white/50"
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {tab === "all" && (
        <div className="mt-6">
          <p className="text-xs text-white/70">Teams looking for</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {(["All", ...CRAFTS] as const).map((c) => {
              const activeChip = craft === c;
              return (
                <button
                  key={c}
                  type="button"
                  aria-pressed={activeChip}
                  onClick={() => {
                    setCraft(c);
                    setIndex(0);
                  }}
                  className={`chip min-h-11 px-3.5 text-xs ${
                    activeChip ? "border-[var(--pink)] text-[var(--pink)]" : ""
                  }`}
                >
                  {c}
                </button>
              );
            })}
          </div>
          <p className="mt-4 text-xs text-white/60">
            Open a team to read its pitch, chat with the lead and apply for an open spot. The lead accepts or declines.
          </p>
        </div>
      )}
    </div>
  );
}