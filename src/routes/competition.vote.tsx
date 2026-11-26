import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CompHeader, VoteStars } from "@/components/CompetitionUI";
import { Dice, Star } from "@/components/PixelIcons";
import { MAX_VOTES_PER_DAY, TEAMS, shuffled, useCompetition, useVotes } from "@/lib/competition";

export const Route = createFileRoute("/competition/vote")({
  head: () => ({
    meta: [
      { title: "Vote — Get Named" },
      { name: "description", content: "Pick up to 4 Get Named teams a day, in random order." },
    ],
  }),
  component: VotePage,
});

function VotePage() {
  const votes = useVotes();
  const [comp] = useCompetition();
  const [order, setOrder] = useState(() => TEAMS.map((t) => t.id));
  // Random order on every visit, so no team is always first. Shuffled after mount to keep SSR in sync.
  useEffect(() => setOrder((o) => shuffled(o)), []);
  const vote = (id: string, name: string) => {
    const had = votes.has(id);
    if (!votes.toggle(id)) toast(`All ${MAX_VOTES_PER_DAY} votes used. Come back tomorrow`);
    else toast(had ? `Vote for ${name} removed` : `Voted for ${name}`);
  };

  return (
    <div className="flex flex-1 flex-col gap-4 pb-8">
      <CompHeader title="Vote" right={<VoteStars used={votes.ids.length} />} />
      <div className="px-4">
        <p className="text-lg">Pick up to {MAX_VOTES_PER_DAY} teams a day.</p>
        <p className="mt-1 text-xs text-white/65">
          {votes.left} left today · voting only in the app · the order is random each time
        </p>
      </div>
      {comp.entry && (
        <p className="mx-4 rounded-2xl border border-[var(--pink)]/40 px-3 py-2 text-xs text-[var(--pink)]">
          Your entry “{comp.entry.title}” is in. You can't vote for your own team.
        </p>
      )}

      <ul className="grid grid-cols-3 gap-x-2 gap-y-3 px-4">
        {order.map((id) => {
          const t = TEAMS.find((x) => x.id === id)!;
          const on = votes.has(id);
          const blocked = !on && votes.left === 0;
          return (
            <li key={id} className="relative flex min-w-0 flex-col gap-1.5">
              <Link
                to="/competition/entry/$id"
                params={{ id }}
                aria-label={`Open ${t.name}: ${t.entry.title}`}
                className={`block h-24 overflow-hidden rounded-2xl ${on ? "ring-2 ring-[var(--pink)]" : ""}`}
              >
                <img src={t.entry.images[0]} alt="" className="h-full w-full object-cover" />
              </Link>
              <button
                aria-label={on ? `Remove vote for ${t.name}` : `Vote for ${t.name}`}
                aria-pressed={on}
                onClick={() => vote(id, t.name)}
                className={`absolute right-1 top-1 flex size-11 items-center justify-center rounded-full bg-black/55 ${blocked ? "opacity-40" : ""}`}
              >
                <Star className="size-5" active={on} />
              </button>
              <span className={`truncate text-xs ${on ? "text-[var(--pink)]" : ""}`}>{t.name}</span>
            </li>
          );
        })}
      </ul>

      {votes.left === 0 && (
        <p className="text-center text-xs text-[var(--pink)]">
          All {MAX_VOTES_PER_DAY} votes used. Come back tomorrow.
        </p>
      )}
      <div className="mt-auto px-4">
        <button className="btn btn-primary w-full" onClick={() => setOrder((o) => shuffled(o))}>
          <Dice className="size-[18px]" /> Randomise
        </button>
      </div>
    </div>
  );
}
