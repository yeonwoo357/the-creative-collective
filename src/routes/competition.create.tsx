import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { CompHeader, Face } from "@/components/CompetitionUI";
import { CRAFTS, MAX_TEAM, MY_TEAM_ID, useCompetition } from "@/lib/competition";
import type { Category } from "@/lib/data";
import { useMyProfile } from "@/lib/store";

export const Route = createFileRoute("/competition/create")({
  head: () => ({
    meta: [
      { title: "Create a team — Get Named" },
      {
        name: "description",
        content: "Start a Get Named team and open spots for other professionals.",
      },
    ],
  }),
  component: CreateTeamPage,
});

const SIZES = [2, 3, MAX_TEAM];
const DEFAULT_ROLES: Category[] = ["Piercing", "DJ", "Hair"];

function CreateTeamPage() {
  const [comp, setComp] = useCompetition();
  const [me] = useMyProfile();
  const navigate = useNavigate();
  const [name, setName] = useState(comp.team?.name ?? "");
  const [size, setSize] = useState(comp.team?.size ?? MAX_TEAM);
  const [roles, setRoles] = useState<Category[]>(comp.team?.openRoles ?? DEFAULT_ROLES);
  const [pitch, setPitch] = useState(comp.team?.pitch ?? "");
  const [listed, setListed] = useState(comp.team?.listed ?? true);
  const open = size - 1;
  const roleAt = (i: number) => roles[i] ?? CRAFTS[i % CRAFTS.length]!;

  const save = () => {
    if (!name.trim()) {
      toast("Give your team a name first");
      return;
    }
    const openRoles = Array.from({ length: open }, (_, i) => roleAt(i));
    setComp({
      mode: "team",
      team: { name: name.trim(), size, openRoles, pitch: pitch.trim(), listed },
    });
    toast(listed ? "Team created. Open spots are now in Find a team" : "Team created");
    navigate({ to: "/competition/team/$id", params: { id: MY_TEAM_ID } });
  };

  return (
    <div className="flex flex-1 flex-col gap-4 pb-8">
      <CompHeader title={comp.team ? "Edit team" : "Create a team"} step="Step 2 of 3" />
      <div className="flex flex-col gap-4 px-4">
        <div>
          <label className="mb-1.5 block text-xs text-white/65" htmlFor="team-name">
            Team name
          </label>
          <input
            id="team-name"
            className="field"
            value={name}
            maxLength={30}
            placeholder="e.g. Night Shift Studio"
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <p className="mb-1.5 text-xs text-white/65" id="size-label">
            Team size
          </p>
          <div
            role="radiogroup"
            aria-labelledby="size-label"
            className="glass grid grid-cols-3 gap-1 rounded-full p-1"
          >
            {SIZES.map((n) => (
              <button
                key={n}
                role="radio"
                aria-checked={size === n}
                onClick={() => setSize(n)}
                className={`min-h-11 rounded-full text-sm ${size === n ? "btn-primary" : "text-white/65"}`}
              >
                {n} people
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-1.5 text-xs text-white/65">Spots · {open} open</p>
          <ul className="flex flex-col gap-1.5">
            <li className="glass flex min-h-11 items-center gap-3 rounded-2xl px-3">
              <Face id="me" size={28} ring={false} />
              <span className="flex-1 text-sm">
                You{me.discipline ? ` · ${me.discipline}` : ""}
              </span>
              <span className="text-xs text-[var(--pink)]">Lead</span>
            </li>
            {Array.from({ length: open }, (_, i) => (
              <li
                key={i}
                className="flex min-h-11 items-center gap-3 rounded-2xl border border-dashed border-[var(--pink)]/45 px-3"
              >
                <Face id="open" size={28} />
                <label className="flex-1 text-sm text-white/85" htmlFor={`role-${i}`}>
                  Looking for
                </label>
                <select
                  id={`role-${i}`}
                  className="tag bg-transparent text-xs"
                  value={roleAt(i)}
                  onChange={(e) => {
                    const next = Array.from({ length: open }, (_, k) => roleAt(k));
                    next[i] = e.target.value as Category;
                    setRoles(next);
                  }}
                >
                  {CRAFTS.map((c) => (
                    <option key={c} value={c} className="bg-black">
                      {c}
                    </option>
                  ))}
                </select>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <label className="mb-1.5 block text-xs text-white/65" htmlFor="team-pitch">
            Team pitch
          </label>
          <textarea
            id="team-pitch"
            className="field min-h-20 resize-none py-3"
            value={pitch}
            maxLength={200}
            placeholder="Who you are and the idea you're chasing"
            onChange={(e) => setPitch(e.target.value)}
          />
        </div>

        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={listed}
            onChange={(e) => setListed(e.target.checked)}
            className="size-5 accent-[var(--pink)]"
          />
          Show open spots in Find a team
        </label>
      </div>
      <div className="mt-auto px-4">
        <button className="btn btn-primary w-full" onClick={save}>
          {comp.team ? "Save team" : "Create team"}
        </button>
      </div>
    </div>
  );
}
