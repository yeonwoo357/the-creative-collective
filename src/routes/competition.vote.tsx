import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ChevronLeft, Dice, Star } from "@/components/PixelIcons";
import {
  MAX_DAILY_VOTES,
  activeVotes,
  allTeams,
  localDayKey,
  ownTeamIdsOf,
  shuffle,
  toggleVote,
  useCompVotes,
  useMyTeam,
  useSoloEntry,
  votesLeft,
} from "@/lib/competition";
import { altOf } from "@/lib/data";

export const Route = createFileRoute("/competition/vote")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Vote — GET NAMED" },
      { name: "description", content: "Pick up to 4 teams a day in the GET NAMED competition." },
      { property: "og:title", content: "Vote — GET NAMED" },
      { property: "og:description", content: "Pick up to 4 teams a day in the GET NAMED competition." },
    ],
  }),
  component: VotePage,
});

function VotePage() {
  const [myTeam] = useMyTeam();
  const [soloEntry] = useSoloEntry();
  const [voteStore, setVoteStore] = useCompVotes();
  const [today, setToday] = useState("");
  const [order, setOrder] = useState<string[]>([]);

  const teams = useMemo(
    () => allTeams(myTeam, soloEntry).filter((t) => !!t.entry),
    [myTeam, soloEntry],
  );
  const ownIds = useMemo(() => ownTeamIdsOf(myTeam, soloEntry), [myTeam, soloEntry]);

  useEffect(() => {
    setToday(localDayKey());
  }, []);

  // Shuffle after mount so SSR and hydration match
  useEffect(() => {
    setOrder(shuffle(teams.map((t) => t.id)));
  }, [teams]);

  const orderedTeams = useMemo(() => {
    if (!order.length) return teams;
    const byId = new Map(teams.map((t) => [t.id, t]));
    const list = order.map((id) => byId.get(id)).filter((t): t is NonNullable<typeof t> => !!t);
    for (const t of teams) if (!order.includes(t.id)) list.push(t);
    return list;
  }, [order, teams]);

  const votedIds = today ? activeVotes(voteStore, today) : [];
  const left = today ? votesLeft(voteStore, today) : MAX_DAILY_VOTES;
  const used = MAX_DAILY_VOTES - left;

  function handleVote(teamId: string) {
    const day = today || localDayKey();
    const res = toggleVote(voteStore, teamId, day, ownIds);
    if (!res.ok) {
      if (res.reason === "limit") toast("All 4 votes used. Come back tomorrow");
      else toast("You can't vote for your own team");
      return;
    }
    setVoteStore(res.store);
  }

  return (
    <div className="flex flex-1 flex-col px-4 pb-8 pt-5">
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link to="/events" search={{ tab: "named" }} className="icon-btn" aria-label="Back to Get Named">
            <ChevronLeft className="size-5" />
          </Link>
          <h1 className="text-2xl font-bold uppercase tracking-wide">VOTE</h1>
        </div>
        <div className="flex items-center gap-1" aria-label={`${used} of ${MAX_DAILY_VOTES} votes used today`}>
          {Array.from({ length: MAX_DAILY_VOTES }, (_, i) => (
            <Star key={i} className="size-4" active={i < used} />
          ))}
        </div>
      </header>

      <div className="mt-4">
        <p className="text-lg font-bold">Pick up to 4 teams a day.</p>
        <p className="mt-1 text-xs text-white/65">
          {left} left today · voting only in the app · the order is random each time
        </p>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2.5">
        {orderedTeams.map((team) => {
          const isOwn = ownIds.includes(team.id);
          const voted = votedIds.includes(team.id);
          const cover = team.entry?.images[0] ?? team.boardImages[0];
          return (
            <div key={team.id} className="flex flex-col">
              <div
                className={`relative aspect-square overflow-hidden rounded-2xl border transition ${
                  voted ? "border-2 border-[var(--pink)] ring-2 ring-[var(--pink)]/40" : "border-white/15"
                }`}
              >
                <Link
                  to="/competition/entry/$id"
                  params={{ id: team.id }}
                  className="block size-full"
                >
                  <img
                    src={cover}
                    alt={altOf(cover) ?? team.entry?.title ?? team.name}
                    className="size-full object-cover"
                  />
                </Link>
                {!isOwn && (
                  <button
                    type="button"
                    aria-label={voted ? `Remove vote for ${team.name}` : `Vote for ${team.name}`}
                    aria-pressed={voted}
                    onClick={() => handleVote(team.id)}
                    className="absolute right-1 top-1 flex size-9 items-center justify-center rounded-full bg-black/75 backdrop-blur-sm"
                  >
                    <Star className="size-4" active={voted} />
                  </button>
                )}
              </div>
              <Link
                to="/competition/entry/$id"
                params={{ id: team.id }}
                className="mt-1.5 truncate text-xs text-white/85 hover:text-[var(--pink)]"
              >
                {team.name}
              </Link>
            </div>
          );
        })}
      </div>

      <div className="mt-auto pt-6">
        <button
          type="button"
          onClick={() => setOrder(shuffle(teams.map((t) => t.id)))}
          className="btn btn-primary flex w-full items-center justify-center gap-2"
        >
          <Dice className="size-4" />
          <span>Randomise</span>
        </button>
      </div>
    </div>
  );
}