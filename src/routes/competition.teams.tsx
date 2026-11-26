import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CompHeader, Face } from "@/components/CompetitionUI";
import { ChevronLeft, ChevronRight } from "@/components/PixelIcons";
import {
  CRAFTS,
  MY_TEAM_ID,
  TEAMS,
  openSpots,
  useCompetition,
  type MyTeam,
} from "@/lib/competition";
import { getCreative, type Category } from "@/lib/data";

export const Route = createFileRoute("/competition/teams")({
  head: () => ({
    meta: [
      { title: "Join a team — Get Named" },
      { name: "description", content: "Find a Get Named team with an open spot for your craft." },
    ],
  }),
  component: TeamsPage,
});

type Card = { id: string; name: string; members: string[]; openRoles: Category[]; mine: boolean };

const myCard = (t: MyTeam): Card => ({
  id: MY_TEAM_ID,
  name: t.name,
  members: ["me"],
  openRoles: t.openRoles.slice(0, Math.max(0, t.size - 1)),
  mine: true,
});

function TeamsPage() {
  const [comp] = useCompetition();
  const [view, setView] = useState<"all" | "mine">("all");
  const [craft, setCraft] = useState<Category | "All">("All");
  const [i, setI] = useState(0);

  const others: Card[] = TEAMS.filter((t) => openSpots(t) > 0).map((t) => ({
    id: t.id,
    name: t.name,
    members: t.members,
    openRoles: t.openRoles,
    mine: false,
  }));
  const all = comp.team?.listed && comp.team.size > 1 ? [myCard(comp.team), ...others] : others;
  const mine: Card[] = [
    ...(comp.team ? [myCard(comp.team)] : []),
    ...TEAMS.filter((t) => comp.applied.includes(t.id)).map((t) => ({
      id: t.id,
      name: t.name,
      members: t.members,
      openRoles: t.openRoles,
      mine: false,
    })),
  ];
  const list = (view === "all" ? all : mine).filter(
    (c) => craft === "All" || c.openRoles.includes(craft),
  );
  const n = list.length;
  const at = n ? Math.min(i, n - 1) : 0;
  const card = list[at];
  const go = (d: number) => setI((at + d + n) % n);

  return (
    <div className="flex flex-1 flex-col gap-4 pb-8">
      <CompHeader title="Join a team" />
      <div
        role="tablist"
        aria-label="Teams"
        className="glass mx-4 grid grid-cols-2 gap-1 rounded-full p-1"
      >
        {(
          [
            ["all", "All teams"],
            ["mine", "My team"],
          ] as const
        ).map(([v, label]) => (
          <button
            key={v}
            role="tab"
            aria-selected={view === v}
            onClick={() => {
              setView(v);
              setI(0);
            }}
            className={`min-h-11 rounded-full text-sm ${view === v ? "btn-primary" : "text-white/65"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {card ? (
        <>
          <div className="relative h-[340px]" aria-roledescription="carousel" aria-label="Teams">
            {n > 1 && (
              <>
                <div
                  aria-hidden
                  className="glass absolute -left-10 top-6 h-[292px] w-16 rounded-3xl opacity-35"
                />
                <div
                  aria-hidden
                  className="glass absolute -right-10 top-6 h-[292px] w-16 rounded-3xl opacity-35"
                />
              </>
            )}
            <section
              aria-label={`${card.name}, team ${at + 1} of ${n}`}
              className="glass absolute inset-y-0 left-10 right-10 flex flex-col gap-2.5 rounded-[28px] border-[var(--pink)]/50 p-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-[var(--pink)]">
                  {card.openRoles.length} {card.openRoles.length === 1 ? "spot" : "spots"} open
                </span>
                {card.mine && (
                  <span className="rounded-full border border-[var(--pink)] px-2 text-xs text-[var(--pink)]">
                    Your team
                  </span>
                )}
                {!card.mine && comp.applied.includes(card.id) && (
                  <span className="rounded-full border border-[var(--pink)] px-2 text-xs text-[var(--pink)]">
                    Applied
                  </span>
                )}
              </div>
              <h2 className="text-lg">{card.name}</h2>
              <ul className="flex flex-1 flex-col gap-1.5">
                {card.members.map((m) => (
                  <li key={m} className="flex items-center gap-2.5 text-xs">
                    <Face id={m} size={30} ring={false} />
                    {m === "me"
                      ? "You · Lead"
                      : `${getCreative(m)?.role ?? ""}${m === card.members[0] ? " · Lead" : ""}`}
                  </li>
                ))}
                {card.openRoles.map((r, k) => (
                  <li
                    key={`${r}-${k}`}
                    className="flex items-center gap-2.5 text-xs text-[var(--pink)]"
                  >
                    <Face id="open" size={30} />
                    Open · {r}
                  </li>
                ))}
              </ul>
              <Link
                to="/competition/team/$id"
                params={{ id: card.id }}
                className="btn btn-primary min-h-11"
              >
                View team
              </Link>
            </section>
            {n > 1 && (
              <>
                <button
                  aria-label="Previous team"
                  onClick={() => go(-1)}
                  className="icon-btn absolute left-1 top-[152px]"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <button
                  aria-label="Next team"
                  onClick={() => go(1)}
                  className="icon-btn absolute right-1 top-[152px]"
                >
                  <ChevronRight className="size-4" />
                </button>
              </>
            )}
          </div>
          <div className="flex justify-center gap-2" aria-hidden>
            {list.map((c, k) => (
              <span
                key={c.id}
                className={`size-2 ${k === at ? "bg-[var(--pink)]" : "bg-white/30"}`}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="glass mx-4 rounded-[24px] p-5 text-sm">
          {view === "mine"
            ? "You're not in a team yet."
            : "No team is looking for that craft right now."}
          <Link to="/competition/create" className="btn btn-primary mt-4 w-full">
            Create a team
          </Link>
        </div>
      )}

      <div className="px-4">
        <p className="mb-2 text-xs text-white/65">Teams looking for</p>
        <div className="flex flex-wrap gap-2">
          {(["All", ...CRAFTS] as const).map((c) => (
            <button
              key={c}
              className="chip"
              aria-pressed={craft === c}
              onClick={() => {
                setCraft(c);
                setI(0);
              }}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
      <p className="px-4 text-xs text-white/65">
        Open a team to read its pitch, chat with the lead and apply for an open spot. The lead
        accepts or declines.
      </p>
    </div>
  );
}
