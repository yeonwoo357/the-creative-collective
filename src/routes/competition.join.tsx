import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, Plus, Search, User } from "@/components/PixelIcons";

export const Route = createFileRoute("/competition/join")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Join GET NAMED — NAMED Collective" },
      { name: "description", content: "Choose how to enter the GET NAMED idea competition." },
      { property: "og:title", content: "Join GET NAMED — NAMED Collective" },
      { property: "og:description", content: "Choose how to enter the GET NAMED idea competition." },
    ],
  }),
  component: JoinCompetitionPage,
});

const OPTIONS = [
  {
    to: "/competition/create" as const,
    title: "CREATE A TEAM",
    desc: "Set the size, pick the crafts you need and open the empty spots to others.",
    Icon: Plus,
  },
  {
    to: "/competition/teams" as const,
    title: "FIND A TEAM",
    desc: "Browse teams with open spots, mine or anyone's, and apply to join.",
    Icon: Search,
  },
  {
    to: "/competition/submit" as const,
    title: "GO SOLO",
    desc: "Enter as a team of one and submit your idea straight away.",
    Icon: User,
  },
] as const;

function JoinCompetitionPage() {
  return (
    <div className="flex flex-1 flex-col px-4 pb-8 pt-5">
      <header className="flex items-center gap-3">
        <Link to="/events" search={{ tab: "named" }} className="icon-btn" aria-label="Back to Get Named">
          <ChevronLeft className="size-5" />
        </Link>
        <span className="text-lg font-bold uppercase tracking-wider">GET NAMED</span>
      </header>

      <div className="mt-6">
        <p className="text-xs font-bold uppercase tracking-widest text-[var(--pink)]">Step 1 of 3</p>
        <h1 className="mt-1 text-2xl font-bold uppercase leading-tight tracking-wide">
          HOW DO YOU WANT TO JOIN?
        </h1>
        <p className="mt-2 text-sm text-white/75">
          Enter alone or as a crew of up to 4 professionals.
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-3.5">
        {OPTIONS.map(({ to, title, desc, Icon }) => (
          <Link
            key={to}
            to={to}
            className="glass flex items-start gap-4 rounded-[22px] p-5 transition hover:border-[var(--pink)]/50"
          >
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10">
              <Icon className="size-5" active />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-bold uppercase tracking-wide">{title}</h2>
              <p className="mt-1 text-sm text-white/75">{desc}</p>
            </div>
          </Link>
        ))}
      </div>

      <p className="mt-auto pt-8 text-xs text-white/60">
        Entering needs a professional profile. Voting is open to every app user.
      </p>
    </div>
  );
}