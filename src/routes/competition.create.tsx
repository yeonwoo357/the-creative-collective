import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ChevronLeft } from "@/components/PixelIcons";
import { CRAFTS, type Craft, type CompTeam, useMyTeam } from "@/lib/competition";
import { creatives } from "@/lib/data";
import { ONBOARDING_KEY, avatarOf, useLocal, useMyProfile, type Onboarding } from "@/lib/store";

export const Route = createFileRoute("/competition/create")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Create a team — GET NAMED" },
      { name: "description", content: "Create your crew for the GET NAMED competition." },
      { property: "og:title", content: "Create a team — GET NAMED" },
      { property: "og:description", content: "Create your crew for the GET NAMED competition." },
    ],
  }),
  component: CreateTeamPage,
});

const DEFAULT_SPOTS: Craft[] = ["Piercing", "DJ", "Hair"];

function CreateTeamPage() {
  const navigate = useNavigate();
  const [myTeam, setMyTeam, ready] = useMyTeam();
  const [profile] = useMyProfile();
  const [onboarding] = useLocal<Onboarding>(ONBOARDING_KEY, {
    name: "",
    email: "",
    location: "",
    intent: "",
    done: false,
  });

  const [name, setName] = useState("");
  const [size, setSize] = useState<2 | 3 | 4>(4);
  const [spots, setSpots] = useState<Craft[]>(DEFAULT_SPOTS);
  const [pitch, setPitch] = useState("");
  const [listed, setListed] = useState(true);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!ready || hydrated) return;
    if (myTeam) {
      setName(myTeam.name);
      setSize(myTeam.size === 2 || myTeam.size === 3 || myTeam.size === 4 ? myTeam.size : 4);
      setSpots(myTeam.openSpots.length ? myTeam.openSpots : DEFAULT_SPOTS.slice(0, Math.max(1, myTeam.size - 1)));
      setPitch(myTeam.pitch);
      setListed(myTeam.listed);
    }
    setHydrated(true);
  }, [ready, myTeam, hydrated]);

  const openCount = size - 1;
  const visibleSpots: Craft[] = Array.from({ length: openCount }, (_, i) => spots[i] ?? CRAFTS[i % CRAFTS.length]!);

  const myName = onboarding.name.trim() || "You";
  const myRole = profile.discipline.trim() || "Creative";
  const myAvatar = avatarOf(profile);
  const initials = myName
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      toast("Give your team a name first");
      return;
    }
    const trimmedPitch = pitch.trim();
    if (!trimmedPitch) {
      toast("Add a short team pitch");
      return;
    }
    const fallbackImgs = creatives[0]!;
    const team: CompTeam = {
      id: myTeam?.id ?? "my-team",
      name: trimmedName,
      size,
      members: [{ id: "me", name: myName, role: myRole, avatar: myAvatar, lead: true }],
      openSpots: visibleSpots,
      pitch: trimmedPitch,
      listed,
      isMine: true,
      boardImages: myTeam?.boardImages ?? [fallbackImgs.work[0] ?? fallbackImgs.cover, fallbackImgs.work[1] ?? fallbackImgs.cover],
      ...(myTeam?.entry ? { entry: myTeam.entry } : {}),
    };
    if (!setMyTeam(team)) {
      toast("Could not save team — browser storage is full");
      return;
    }
    toast(myTeam ? "Team updated" : "Team created");
    navigate({ to: "/competition/team/$id", params: { id: team.id } });
  }

  return (
    <div className="flex flex-1 flex-col px-4 pb-8 pt-5">
      <header className="flex items-center gap-3">
        <Link to="/competition/join" className="icon-btn" aria-label="Back to join options">
          <ChevronLeft className="size-5" />
        </Link>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--pink)]">Step 2 of 3</p>
          <h1 className="text-2xl font-bold uppercase tracking-wide">
            {myTeam ? "EDIT TEAM" : "CREATE A TEAM"}
          </h1>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="mt-5 flex flex-1 flex-col gap-5">
        <div>
          <label htmlFor="team-name" className="block text-xs text-white/75">
            Team name
          </label>
          <input
            id="team-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Night Shift Studio"
            maxLength={40}
            className="field mt-1.5 w-full"
          />
        </div>

        <div>
          <span className="block text-xs text-white/75">Team size</span>
          <div className="glass mt-1.5 grid grid-cols-3 rounded-full p-1" role="group" aria-label="Team size">
            {([2, 3, 4] as const).map((n) => (
              <button
                key={n}
                type="button"
                aria-pressed={size === n}
                onClick={() => setSize(n)}
                className={`min-h-11 rounded-full text-sm transition ${
                  size === n
                    ? "bg-[var(--pink)] font-bold text-black"
                    : "text-white/75 hover:text-foreground"
                }`}
              >
                {n} people
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="block text-xs text-white/75">Spots · {openCount} open</span>
          <div className="mt-2 space-y-2">
            <div className="glass flex items-center justify-between gap-3 rounded-2xl px-3.5 py-2.5">
              <div className="flex items-center gap-3">
                {myAvatar ? (
                  <img src={myAvatar} alt={myName} className="size-9 rounded-full object-cover" />
                ) : (
                  <div className="flex size-9 items-center justify-center rounded-full bg-[var(--rose)] text-xs font-bold text-white">
                    {initials || "ME"}
                  </div>
                )}
                <span className="text-sm">You · {myRole}</span>
              </div>
              <span className="text-xs font-bold text-[var(--pink)]">Lead</span>
            </div>

            {visibleSpots.map((craft, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between gap-3 rounded-2xl border border-dashed border-white/25 bg-white/[0.03] px-3.5 py-2.5"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-full border border-dashed border-white/35 text-xs text-white/75">
                    ?
                  </div>
                  <span className="text-sm text-white/85">Looking for</span>
                </div>
                <select
                  aria-label={`Open spot ${idx + 1} craft`}
                  value={craft}
                  onChange={(e) => {
                    const next = [...visibleSpots];
                    next[idx] = e.target.value as Craft;
                    setSpots(next);
                  }}
                  className="rounded-full border border-white/25 bg-black px-3 py-1.5 text-xs text-white"
                >
                  {CRAFTS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="team-pitch" className="block text-xs text-white/75">
            Team pitch
          </label>
          <textarea
            id="team-pitch"
            rows={3}
            value={pitch}
            onChange={(e) => setPitch(e.target.value)}
            placeholder="Tattoo, piercing and sound. We want to turn a NAMED drop into a night."
            maxLength={240}
            className="field mt-1.5 w-full resize-none"
          />
        </div>

        <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={listed}
            onChange={(e) => setListed(e.target.checked)}
            className="size-5 accent-[var(--pink)]"
          />
          <span>Show open spots in Find a team</span>
        </label>

        <div className="mt-auto pt-4">
          <button type="submit" className="btn btn-primary w-full">
            {myTeam ? "Save team" : "Create team"}
          </button>
        </div>
      </form>
    </div>
  );
}