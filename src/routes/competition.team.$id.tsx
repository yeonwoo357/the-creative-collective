import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { CompHeader, FaceStack, ProfileLink } from "@/components/CompetitionUI";
import { MessageCircle } from "@/components/PixelIcons";
import { MY_TEAM_ID, getTeam, openSpots, useCompetition } from "@/lib/competition";
import { getCreative } from "@/lib/data";

export const Route = createFileRoute("/competition/team/$id")({
  head: () => ({
    meta: [
      { title: "Team — Get Named" },
      { name: "description", content: "A Get Named team: who's in, their pitch and open spots." },
    ],
  }),
  component: TeamPage,
});

function Board({ images, label }: { images: string[]; label: string }) {
  return (
    <div className="glass flex flex-col gap-2 rounded-[20px] p-2.5">
      <div className="grid grid-cols-2 gap-1">
        {images.slice(0, 3).map((src, i) => (
          <img
            key={src}
            src={src}
            alt=""
            className={`w-full rounded-xl object-cover ${i === 0 ? "col-span-2 h-16" : "h-12"}`}
          />
        ))}
      </div>
      <span className="px-1 text-xs">{label}</span>
    </div>
  );
}

function TeamPage() {
  const { id } = Route.useParams();
  const [comp, setComp] = useCompetition();
  const mine = id === MY_TEAM_ID;
  const sample = getTeam(id);

  if (mine && !comp.team)
    return (
      <div className="flex-1 p-4">
        <CompHeader title="Your team" />
        <p className="mt-6 px-1 text-sm">You haven't made a team yet.</p>
        <Link to="/competition/create" className="btn btn-primary mt-4 w-full">
          Create a team
        </Link>
      </div>
    );
  if (!mine && !sample)
    return (
      <div className="flex-1 p-4">
        <CompHeader title="Team not found" />
      </div>
    );

  const name = mine ? comp.team!.name : sample!.name;
  const members = mine ? ["me"] : sample!.members;
  const openRoles = mine ? comp.team!.openRoles.slice(0, comp.team!.size - 1) : sample!.openRoles;
  const open = mine ? openRoles.length : openSpots(sample!);
  const pitch = mine
    ? comp.team!.pitch || "Add a pitch so people know what you're making."
    : sample!.pitch;
  const lead = members[0]!;
  const images = mine ? (comp.entry?.images ?? []) : sample!.entry.images;
  const applied = !mine && comp.applied.includes(id);

  const toggleApply = () => {
    setComp({ applied: applied ? comp.applied.filter((a) => a !== id) : [...comp.applied, id] });
    toast(
      applied ? "Application withdrawn" : `Applied to ${name}. The lead will reply in Chat (demo)`,
    );
  };

  return (
    <div className="flex flex-1 flex-col">
      <CompHeader title={name} />
      <div className="flex flex-col gap-4 px-4 pt-4">
        <FaceStack members={members} open={open} size={44} />
        <div className="glass rounded-[20px] rounded-bl-md px-4 py-3 text-sm">
          <p className="mb-1 text-xs text-[var(--pink)]">
            Team pitch · {lead === "me" ? "you, lead" : `${getCreative(lead)?.name ?? ""}, lead`}
          </p>
          {pitch}
        </div>

        {!mine && (
          <ul className="flex flex-col gap-1 text-sm">
            {members.map((m) => (
              <li key={m}>
                <ProfileLink id={m}>
                  {getCreative(m)?.name}{" "}
                  <span className="text-white/65">· {getCreative(m)?.role}</span>
                </ProfileLink>
              </li>
            ))}
          </ul>
        )}

        <div>
          <div className="mb-2 flex items-baseline justify-between">
            <h2 className="text-sm">Idea board</h2>
            <span className="text-xs text-white/65">
              {mine && !comp.entry ? "Nothing yet" : "Draft"}
            </span>
          </div>
          {images.length >= 3 ? (
            <div className="grid grid-cols-2 gap-2.5">
              <Board images={images} label="Moodboard" />
              <Board images={[...images.slice(1), images[0]!]} label="Look sketches" />
            </div>
          ) : (
            <p className="glass rounded-[20px] p-4 text-sm text-white/85">
              {mine
                ? "Add images when you submit your idea."
                : "The team hasn't shared images yet."}
            </p>
          )}
        </div>

        {openRoles.length > 0 && (
          <div>
            <p className="mb-2 text-xs text-white/65">
              Open {openRoles.length === 1 ? "spot" : "spots"}
            </p>
            <div className="flex flex-wrap gap-2">
              {openRoles.map((r, k) => (
                <span key={`${r}-${k}`} className="tag border-[var(--pink)] text-[var(--pink)]">
                  {r}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="sticky bottom-0 mt-auto flex flex-col gap-2 bg-gradient-to-b from-transparent to-black to-30% px-4 pb-7 pt-5">
        {applied && (
          <p className="text-center text-xs text-[var(--pink)]">
            Applied · waiting for the lead to accept
          </p>
        )}
        {mine ? (
          <div className="flex gap-2.5">
            <Link to="/competition/create" className="btn btn-secondary flex-1">
              Edit team
            </Link>
            <Link to="/competition/submit" className="btn btn-primary flex-[1.4]">
              {comp.entry ? "Edit entry" : "Submit idea"}
            </Link>
          </div>
        ) : (
          <div className="flex gap-2.5">
            <Link to="/chat/$id" params={{ id: lead }} className="btn btn-secondary flex-1">
              <MessageCircle className="size-4" /> Chat
            </Link>
            <button
              className="btn btn-primary flex-[1.4]"
              onClick={toggleApply}
              disabled={!applied && open === 0}
            >
              {applied ? "Withdraw" : open === 0 ? "Team full" : "Apply to join"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
