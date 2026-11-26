import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ChevronLeft, Star } from "@/components/PixelIcons";
import {
  MAX_DAILY_VOTES,
  activeVotes,
  allTeams,
  getTeamById,
  localDayKey,
  ownTeamIdsOf,
  pickNextRandom,
  toggleVote,
  useCompVotes,
  useMyTeam,
  useSeenEntries,
  useSoloEntry,
  votesLeft,
} from "@/lib/competition";
import { altOf } from "@/lib/data";

export const Route = createFileRoute("/competition/entry/$id")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Entry — GET NAMED" },
      { name: "description", content: "View a team's GET NAMED competition entry." },
      { property: "og:title", content: "Entry — GET NAMED" },
      { property: "og:description", content: "View a team's GET NAMED competition entry." },
    ],
  }),
  component: EntryDetailPage,
});

function EntryDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [myTeam] = useMyTeam();
  const [soloEntry] = useSoloEntry();
  const [voteStore, setVoteStore] = useCompVotes();
  const [seenStore, setSeenStore, seenReady] = useSeenEntries();
  const [today, setToday] = useState("");

  const teams = useMemo(
    () => allTeams(myTeam, soloEntry).filter((t) => !!t.entry),
    [myTeam, soloEntry],
  );
  const team = getTeamById(id, myTeam, soloEntry);
  const ownIds = useMemo(() => ownTeamIdsOf(myTeam, soloEntry), [myTeam, soloEntry]);

  useEffect(() => {
    setToday(localDayKey());
  }, []);

  useEffect(() => {
    if (!seenReady || !today || !team) return;
    const seen = activeVotes(seenStore, today);
    if (!seen.includes(team.id)) {
      setSeenStore({ day: today, ids: [...seen, team.id] });
    }
  }, [seenReady, today, team, seenStore, setSeenStore]);

  if (!team || !team.entry) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
        <p className="text-lg font-bold">Entry not found.</p>
        <Link to="/competition/vote" className="btn btn-primary mt-4">
          Back to vote
        </Link>
      </div>
    );
  }

  const votedIds = today ? activeVotes(voteStore, today) : [];
  const left = today ? votesLeft(voteStore, today) : MAX_DAILY_VOTES;
  const seenCount = today ? Math.max(1, activeVotes(seenStore, today).length) : 1;
  const isOwn = ownIds.includes(team.id);
  const voted = votedIds.includes(team.id);
  const keyVisual = team.entry.images[0] ?? team.boardImages[0];
  const looks = team.entry.images.slice(1, 4);

  function handleVote() {
    const day = today || localDayKey();
    const res = toggleVote(voteStore, team!.id, day, ownIds);
    if (!res.ok) {
      if (res.reason === "limit") toast("All 4 votes used. Come back tomorrow");
      else toast("You can't vote for your own team");
      return;
    }
    setVoteStore(res.store);
  }

  function handleNext() {
    const nextId = pickNextRandom(
      teams.map((t) => t.id),
      team!.id,
    );
    if (nextId) navigate({ to: "/competition/entry/$id", params: { id: nextId } });
  }

  return (
    <div className="flex flex-1 flex-col pb-24">
      <div className="px-4 pt-5">
        <header className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <Link to="/competition/vote" className="icon-btn" aria-label="Back to vote">
              <ChevronLeft className="size-5" />
            </Link>
            <div className="flex items-center -space-x-2">
              {team.members.map((m) =>
                m.avatar ? (
                  <img
                    key={m.id}
                    src={m.avatar}
                    alt={altOf(m.avatar) ?? m.name}
                    className="size-9 rounded-full border-2 border-black object-cover"
                  />
                ) : (
                  <div
                    key={m.id}
                    className="flex size-9 items-center justify-center rounded-full border-2 border-black bg-[var(--rose)] text-xs font-bold"
                  >
                    {m.name.slice(0, 2).toUpperCase()}
                  </div>
                ),
              )}
            </div>
          </div>

          <div
            className="flex size-12 flex-col items-center justify-center rounded-full border-2 border-[var(--pink)] text-center leading-none"
            aria-label={`${left} votes left today`}
          >
            <span className="text-sm font-bold">{left}</span>
            <span className="text-[11px] text-white/75">left</span>
          </div>
        </header>

        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-white/65">
            <span>Random pick</span>
            <span>
              {Math.min(seenCount, teams.length)} of {teams.length} seen today
            </span>
          </div>
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full bg-[var(--pink)] transition-all"
              style={{ width: `${Math.min(100, (seenCount / Math.max(1, teams.length)) * 100)}%` }}
            />
          </div>
        </div>

        <div className="mt-4">
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--pink)]">
            {team.name} · random pick
          </p>
          <h1 className="mt-1 text-2xl font-bold uppercase tracking-wide">{team.entry.title}</h1>
        </div>

        {/* Key visual + 3 smaller images */}
        <div className="mt-4 space-y-2.5">
          <img
            src={keyVisual}
            alt={altOf(keyVisual) ?? team.entry.title}
            className="aspect-[16/10] w-full rounded-2xl border border-white/15 object-cover"
          />
          {looks.length > 0 && (
            <div className="grid grid-cols-3 gap-2.5">
              {looks.map((src, i) => (
                <img
                  key={`${src}-${i}`}
                  src={src}
                  alt={altOf(src) ?? `${team.entry!.title} look ${i + 1}`}
                  className="aspect-square w-full rounded-2xl border border-white/15 object-cover"
                />
              ))}
            </div>
          )}
        </div>

        <p className="mt-4 text-sm leading-relaxed text-white/90">{team.entry.text}</p>

        <p className="mt-4 text-xs text-white/70">
          By{" "}
          {team.members.map((m, i) => (
            <span key={m.id}>
              {i > 0 && ", "}
              {m.id === "me" ? (
                <span>{m.name}</span>
              ) : (
                <Link
                  to="/profile/$id"
                  params={{ id: m.id }}
                  className="underline underline-offset-4 hover:text-[var(--pink)]"
                >
                  {m.name}
                </Link>
              )}
            </span>
          ))}
        </p>
      </div>

      {/* Sticky bottom bar */}
      <div className="sticky bottom-0 z-20 mt-auto flex items-center gap-3 border-t border-white/10 bg-black/90 px-4 py-3 backdrop-blur-md">
        <button
          type="button"
          disabled={isOwn}
          aria-label={voted ? `Remove vote for ${team.name}` : `Vote for ${team.name}`}
          aria-pressed={voted}
          onClick={handleVote}
          className={`flex size-12 shrink-0 items-center justify-center rounded-full border-2 transition disabled:opacity-40 ${
            voted ? "border-[var(--pink)] bg-[var(--pink)]/20" : "border-[var(--pink)]/70 bg-black"
          }`}
        >
          <Star className="size-5" active={voted} />
        </button>
        <button type="button" onClick={handleNext} className="btn btn-secondary flex-1">
          Next random team
        </button>
      </div>
    </div>
  );
}