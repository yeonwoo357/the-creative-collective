import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { FaceStack, ProfileLink } from "@/components/CompetitionUI";
import { Star } from "@/components/PixelIcons";
import { BackButton } from "@/components/TopBar";
import { MAX_VOTES_PER_DAY, TEAMS, getTeam, useVotes } from "@/lib/competition";
import { getCreative } from "@/lib/data";

export const Route = createFileRoute("/competition/entry/$id")({
  head: () => ({
    meta: [
      { title: "Entry — Get Named" },
      {
        name: "description",
        content: "A Get Named team's idea. Vote or see another team at random.",
      },
    ],
  }),
  component: EntryPage,
});

function EntryPage() {
  const { id } = Route.useParams();
  const team = getTeam(id);
  const votes = useVotes();
  const navigate = useNavigate();

  if (!team)
    return (
      <div className="flex-1 p-4">
        <BackButton />
        <p className="mt-6 text-sm">This entry isn't here any more.</p>
        <Link to="/competition/vote" className="btn btn-primary mt-4 w-full">
          See all teams
        </Link>
      </div>
    );

  const on = votes.has(id);
  const vote = () => {
    if (!votes.toggle(id)) toast(`All ${MAX_VOTES_PER_DAY} votes used. Come back tomorrow`);
    else toast(on ? "Vote removed" : `Voted for ${team.name}`);
  };
  const nextRandom = () => {
    const others = TEAMS.filter((t) => t.id !== id);
    const pick = others[Math.floor(Math.random() * others.length)]!;
    navigate({ to: "/competition/entry/$id", params: { id: pick.id }, replace: true });
  };
  const [hero, ...rest] = team.entry.images;

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center gap-3 px-4 pt-4">
        <BackButton />
        <FaceStack members={team.members} open={0} size={36} />
        <div className="flex-1" />
        <div
          className="flex size-14 flex-col items-center justify-center rounded-full border-2 border-[var(--pink)] leading-tight"
          role="img"
          aria-label={`${votes.left} votes left today`}
        >
          <span className="text-lg font-bold">{votes.left}</span>
          <span className="text-xs text-white/65">left</span>
        </div>
      </div>

      <div className="flex flex-col gap-4 px-4 pt-4">
        <div>
          <p className="text-xs font-bold uppercase text-[var(--pink)]">
            {team.name} · random pick
          </p>
          <h1 className="mt-1 text-2xl">{team.entry.title}</h1>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {hero && (
            <img
              src={hero}
              alt={`${team.entry.title}, key visual`}
              className="col-span-3 h-44 w-full rounded-2xl object-cover"
            />
          )}
          {rest.slice(0, 3).map((src, i) => (
            <img
              key={src}
              src={src}
              alt={`Look ${i + 1}`}
              className="h-24 w-full rounded-2xl object-cover"
            />
          ))}
        </div>
        <p className="text-sm text-white/90">{team.entry.text}</p>
        <p className="text-xs text-white/65">
          By{" "}
          {team.members.map((m, i) => (
            <span key={m}>
              {i > 0 && ", "}
              <ProfileLink id={m}>{getCreative(m)?.name}</ProfileLink>
            </span>
          ))}
        </p>
      </div>

      <div className="sticky bottom-0 mt-auto flex items-center gap-3 bg-gradient-to-b from-transparent to-black to-30% px-4 pb-7 pt-5">
        <button
          aria-label={on ? "Remove vote" : `Vote for ${team.name}`}
          aria-pressed={on}
          onClick={vote}
          className={`flex size-16 flex-none items-center justify-center rounded-full border-2 border-[var(--pink)] ${on ? "bg-[var(--pink)] text-[var(--ink)]" : "text-[var(--pink)]"}`}
        >
          <Star className="size-7" fill={on ? "currentColor" : undefined} />
        </button>
        <button className="btn btn-secondary flex-1" onClick={nextRandom}>
          Next random team
        </button>
      </div>
    </div>
  );
}
