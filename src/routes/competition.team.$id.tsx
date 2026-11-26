import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { ChevronLeft, MessageCircle } from "@/components/PixelIcons";
import {
  getTeamById,
  useAppliedTeams,
  useMyTeam,
  useSoloEntry,
} from "@/lib/competition";
import { altOf } from "@/lib/data";

export const Route = createFileRoute("/competition/team/$id")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Team detail — GET NAMED" },
      { name: "description", content: "Read the team pitch, check open spots, or apply to join." },
      { property: "og:title", content: "Team detail — GET NAMED" },
      { property: "og:description", content: "Read the team pitch, check open spots, or apply to join." },
    ],
  }),
  component: TeamDetailPage,
});

function TeamDetailPage() {
  const { id } = Route.useParams();
  const [myTeam] = useMyTeam();
  const [soloEntry] = useSoloEntry();
  const { isApplied, toggle } = useAppliedTeams();

  const team = getTeamById(id, myTeam, soloEntry);

  if (!team) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
        <p className="text-lg font-bold">Team not found.</p>
        <Link to="/competition/teams" className="btn btn-primary mt-4">
          Back to teams
        </Link>
      </div>
    );
  }

  const lead = team.members.find((m) => m.lead) ?? team.members[0];
  const applied = isApplied(team.id);
  const isFull = team.openSpots.length === 0;

  return (
    <div className="flex flex-1 flex-col pb-24">
      <div className="px-4 pt-5">
        <header className="flex items-center gap-3">
          <Link to="/competition/teams" className="icon-btn" aria-label="Back to teams">
            <ChevronLeft className="size-5" />
          </Link>
          <div className="glass flex-1 truncate rounded-full px-4 py-2.5 text-center text-sm font-bold uppercase tracking-wider">
            {team.name}
          </div>
        </header>

        {/* Overlapping avatars + dashed ? open spots */}
        <div className="mt-5 flex items-center -space-x-2">
          {team.members.map((m) =>
            m.avatar ? (
              <img
                key={m.id}
                src={m.avatar}
                alt={altOf(m.avatar) ?? m.name}
                className="size-12 rounded-full border-2 border-black object-cover"
              />
            ) : (
              <div
                key={m.id}
                className="flex size-12 items-center justify-center rounded-full border-2 border-black bg-[var(--rose)] text-xs font-bold"
              >
                {m.name.slice(0, 2).toUpperCase()}
              </div>
            ),
          )}
          {team.openSpots.map((spot, i) => (
            <div
              key={`${spot}-${i}`}
              title={`Open spot: ${spot}`}
              className="flex size-12 items-center justify-center rounded-full border-2 border-dashed border-[var(--pink)]/70 bg-black text-sm text-[var(--pink)]"
            >
              ?
            </div>
          ))}
        </div>

        {/* Speech-bubble glass pitch card */}
        <section className="glass relative mt-4 rounded-[22px] p-4">
          <p className="text-xs font-bold text-[var(--pink)]">
            Team pitch · {lead?.name ?? "Lead"}, lead
          </p>
          <p className="mt-2 text-sm leading-relaxed text-white/90">{team.pitch}</p>
        </section>

        {/* Member links */}
        <div className="mt-4 flex flex-wrap gap-2">
          {team.members.map((m) =>
            m.id === "me" ? (
              <span key={m.id} className="tag text-xs">
                {m.name} ({m.role})
              </span>
            ) : (
              <Link
                key={m.id}
                to="/profile/$id"
                params={{ id: m.id }}
                className="tag text-xs underline underline-offset-4 hover:text-[var(--pink)]"
              >
                {m.name} · {m.role}
              </Link>
            ),
          )}
        </div>

        {/* Idea board */}
        <section className="mt-6">
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="text-lg font-bold uppercase tracking-wide">IDEA BOARD</h2>
            <span className="text-xs text-white/55">Draft · not public yet</span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {(["Moodboard", "Look sketches"] as const).map((label, i) => {
              const src = team.boardImages[i] ?? team.boardImages[0];
              return (
                <div key={label} className="glass overflow-hidden rounded-[20px] p-2">
                  <img
                    src={src}
                    alt={altOf(src) ?? `${team.name} ${label}`}
                    className="aspect-square w-full rounded-xl object-cover"
                  />
                  <p className="mt-2 px-1 text-xs text-white/80">{label}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Open spots */}
        <section className="mt-5">
          <p className="text-xs text-white/70">Open spots</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {isFull ? (
              <span className="tag text-xs text-white/60">Team full</span>
            ) : (
              team.openSpots.map((spot, i) => (
                <span
                  key={`${spot}-${i}`}
                  className="tag border-[var(--pink)]/50 text-xs text-[var(--pink)]"
                >
                  {spot} · 1 spot
                </span>
              ))
            )}
          </div>
          {applied && !team.isMine && (
            <p className="mt-3 text-xs text-[var(--pink)]">
              Applied · waiting for the lead to accept
            </p>
          )}
        </section>
      </div>

      {/* Sticky bottom bar */}
      <div className="sticky bottom-0 z-20 mt-auto border-t border-white/10 bg-black/90 px-4 py-3 backdrop-blur-md">
        {team.isMine ? (
          <div className="flex gap-2.5">
            <Link to="/competition/create" className="btn btn-secondary flex-1">
              Edit team
            </Link>
            <Link to="/competition/submit" className="btn btn-primary flex-1">
              Submit idea
            </Link>
          </div>
        ) : (
          <div className="flex gap-2.5">
            {lead && lead.id !== "me" ? (
              <Link
                to="/chat/$id"
                params={{ id: lead.id }}
                className="btn btn-secondary flex items-center justify-center gap-2 px-5"
              >
                <MessageCircle className="size-4" />
                <span>Chat</span>
              </Link>
            ) : (
              <Link to="/chat" className="btn btn-secondary px-5">
                Chat
              </Link>
            )}
            <button
              type="button"
              disabled={isFull && !applied}
              onClick={() => {
                toggle(team.id);
                toast(applied ? "Application withdrawn" : "Applied · waiting for the lead to accept");
              }}
              className="btn btn-primary flex-1 disabled:opacity-45"
            >
              {applied ? "Withdraw" : isFull ? "Team full" : "Apply to join"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}