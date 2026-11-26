import { createFileRoute, Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { CompHeader } from "@/components/CompetitionUI";
import { Plus, Search, User } from "@/components/PixelIcons";
import { MAX_TEAM, useCompetition } from "@/lib/competition";

export const Route = createFileRoute("/competition/join")({
  head: () => ({
    meta: [
      { title: "Join Get Named — NAMED Collective" },
      { name: "description", content: "Enter the Get Named idea competition solo or as a team." },
    ],
  }),
  component: JoinPage,
});

function Option({
  to,
  icon,
  title,
  text,
  onClick,
  lead,
}: {
  to: "/competition/create" | "/competition/teams" | "/competition/submit";
  icon: ReactNode;
  title: string;
  text: string;
  onClick?: () => void;
  lead?: boolean;
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`glass flex items-start gap-4 rounded-[24px] p-5 ${lead ? "border-[var(--pink)]/60" : ""}`}
    >
      <span className="flex size-12 flex-none items-center justify-center rounded-2xl border border-[var(--pink)]/40 bg-[var(--pink)]/10 text-[var(--pink)]">
        {icon}
      </span>
      <span className="flex flex-col gap-1">
        <span className="text-lg font-bold uppercase">{title}</span>
        <span className="text-sm text-white/85">{text}</span>
      </span>
    </Link>
  );
}

function JoinPage() {
  const [, setComp] = useCompetition();
  return (
    <div className="flex flex-1 flex-col pb-8">
      <CompHeader title="Get Named" />
      <div className="px-4 pt-5">
        <p className="text-xs font-bold uppercase text-[var(--pink)]">Step 1 of 3</p>
        <h2 className="mt-1 text-2xl">How do you want to join?</h2>
        <p className="mt-1 text-sm text-white/65">
          Enter alone or as a crew of up to {MAX_TEAM} professionals.
        </p>
      </div>
      <div className="mt-5 flex flex-col gap-3 px-3">
        <Option
          lead
          to="/competition/create"
          icon={<Plus className="size-6" />}
          title="Create a team"
          text="Set the size, pick the crafts you need and open the empty spots to others."
        />
        <Option
          to="/competition/teams"
          icon={<Search className="size-6" />}
          title="Find a team"
          text="Browse teams with open spots, yours or anyone's, and apply to join."
        />
        <Option
          to="/competition/submit"
          onClick={() => setComp({ mode: "solo" })}
          icon={<User className="size-6" />}
          title="Go solo"
          text="Enter as a team of one and submit your idea straight away."
        />
      </div>
      <p className="mt-auto px-4 pt-6 text-xs text-white/65">
        Entering needs a professional profile. Voting is open to every app user.
      </p>
    </div>
  );
}
