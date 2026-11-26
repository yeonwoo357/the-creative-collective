import { creatives, getCreative } from "./data";
import { useLocal } from "./store";

export const CRAFTS = [
  "Tattoo",
  "Piercing",
  "Hair",
  "Nails",
  "DJ",
  "Photographer",
  "Stylist",
] as const;

export type Craft = (typeof CRAFTS)[number];

export const COMP_BRIEF =
  "An idea that brings NAMED Collective and your craft together: a drop, a night, a collab.";

export const MAX_DAILY_VOTES = 4;

export type TeamMember = {
  id: string; // creativeId or "me"
  name: string;
  role: string;
  avatar: string;
  lead?: boolean;
};

export type CompEntry = {
  title: string;
  text: string;
  images: string[]; // up to 4: [key visual, look 1, look 2, look 3]
};

export type CompTeam = {
  id: string;
  name: string;
  size: 1 | 2 | 3 | 4;
  members: TeamMember[];
  openSpots: Craft[];
  pitch: string;
  listed: boolean;
  isMine?: boolean;
  isSolo?: boolean;
  boardImages: [string, string];
  entry?: CompEntry;
};

function member(id: string, lead = false): TeamMember {
  const c = getCreative(id) ?? creatives[0]!;
  return { id: c.id, name: c.name, role: c.role, avatar: c.avatar, lead };
}

function imgs(id: string): [string, string, string, string] {
  const c = getCreative(id) ?? creatives[0]!;
  return [c.cover, c.work[0] ?? c.cover, c.work[1] ?? c.cover, c.work[2] ?? c.cover];
}

export const SAMPLE_TEAMS: CompTeam[] = [
  {
    id: "velvet-needle",
    name: "Velvet Needle",
    size: 4,
    members: [member("mira-vale", true), member("vesper-lux"), member("nyx-calder")],
    openSpots: ["DJ"],
    pitch: "A drop where each NAMED tee carries a flash design from the crew, and the buyer can book that same design as a tattoo.",
    listed: true,
    boardImages: [imgs("mira-vale")[1], imgs("nyx-calder")[1]],
    entry: {
      title: "Wear Your Flash",
      text: "A drop where each NAMED tee carries a flash design from the crew, and the buyer can book that same design as a tattoo.",
      images: [imgs("mira-vale")[1], imgs("mira-vale")[2], imgs("nyx-calder")[1], imgs("vesper-lux")[1]],
    },
  },
  {
    id: "hollow-bloom",
    name: "Hollow Bloom",
    size: 4,
    members: [member("sable-kin", true), member("onyx-reed"), member("jax-thorn")],
    openSpots: ["Tattoo"],
    pitch: "Nails, hair and piercing as one look. Our idea: a NAMED fitting night where every outfit gets a full style.",
    listed: true,
    boardImages: [imgs("sable-kin")[1], imgs("onyx-reed")[1]],
    entry: {
      title: "Full Look Fitting Night",
      text: "A late-night showroom where every NAMED hoodie comes with matching chrome nails, a fresh cut and ear stack styling.",
      images: [imgs("sable-kin")[1], imgs("onyx-reed")[1], imgs("jax-thorn")[1], imgs("sable-kin")[2]],
    },
  },
  {
    id: "chrome-halo",
    name: "Chrome Halo",
    size: 3,
    members: [member("wren-casket", true), member("pike-rowan")],
    openSpots: ["Photographer"],
    pitch: "Silver hardware, stiletto nails and industrial piercings shot on harsh 35mm flash for a limited NAMED zine.",
    listed: true,
    boardImages: [imgs("wren-casket")[1], imgs("pike-rowan")[1]],
    entry: {
      title: "Heavy Metal Zine",
      text: "A 32-page flash-lit lookbook pairing NAMED outerwear with custom gothic nails and titanium hardware.",
      images: [imgs("wren-casket")[1], imgs("pike-rowan")[1], imgs("wren-casket")[2], imgs("pike-rowan")[2]],
    },
  },
  {
    id: "soft-riot",
    name: "Soft Riot",
    size: 4,
    members: [member("kit-ember", true), member("saint-moss"), member("ash-veil")],
    openSpots: ["Stylist"],
    pitch: "An underground warehouse rave in Dalston with a live hair-sculpting booth and a 35mm pit zine printed by morning.",
    listed: true,
    boardImages: [imgs("kit-ember")[0], imgs("saint-moss")[1]],
    entry: {
      title: "Afterhours Collective",
      text: "A 4am warehouse takeover hosted by NAMED with live sets, sculpted loc styling and instant film portraits.",
      images: [imgs("kit-ember")[0], imgs("saint-moss")[1], imgs("ash-veil")[1], imgs("kit-ember")[1]],
    },
  },
  {
    id: "sunday-fade",
    name: "Sunday Fade",
    size: 2,
    members: [member("dove-cassidy", true), member("rue-sorrel")],
    openSpots: [],
    pitch: "Botanical fine-line tattoos and gothic ink illustrations pressed onto heavyweight washed NAMED sweats.",
    listed: true,
    boardImages: [imgs("dove-cassidy")[1], imgs("rue-sorrel")[1]],
    entry: {
      title: "Thorn & Thread",
      text: "Hand-inked botanical flash sheets screen-printed onto distressed NAMED sets, with a Sunday flash pop-up.",
      images: [imgs("rue-sorrel")[1], imgs("dove-cassidy")[1], imgs("rue-sorrel")[2], imgs("dove-cassidy")[2]],
    },
  },
  {
    id: "static-club",
    name: "Static Club",
    size: 4,
    members: [member("ivo-sterne", true), member("vex-hollow"), member("rook-hale"), member("lune-marrow")],
    openSpots: [],
    pitch: "A London-to-Berlin sound and ink exchange: modular techno sets while four tattooists run a 12-hour flash marathon.",
    listed: true,
    boardImages: [imgs("ivo-sterne")[0], imgs("vex-hollow")[1]],
    entry: {
      title: "12-Hour Static Marathon",
      text: "Live modular techno and a four-chair flash marathon under red strobe lights, streamed straight to the collective.",
      images: [imgs("ivo-sterne")[0], imgs("vex-hollow")[1], imgs("rook-hale")[1], imgs("lune-marrow")[1]],
    },
  },
  {
    id: "lowlight",
    name: "Lowlight",
    size: 3,
    members: [member("cass-quill", true)],
    openSpots: ["Hair", "Nails"],
    pitch: "Screen-printed gig posters and riso patches made live in-store while people try on the new NAMED drop.",
    listed: true,
    boardImages: [imgs("cass-quill")[1], imgs("cass-quill")[2]],
    entry: {
      title: "Live Print Parlour",
      text: "Bring any NAMED piece and pull a custom two-colour screen print onto it live at the collective print table.",
      images: [imgs("cass-quill")[1], imgs("cass-quill")[2], imgs("cass-quill")[0], imgs("cass-quill")[3]],
    },
  },
  {
    id: "ink-and-ivy",
    name: "Ink & Ivy (Solo)",
    size: 1,
    members: [member("lune-marrow", true)],
    openSpots: [],
    pitch: "Solo ornamental dotwork capsule: candlelit studio sessions paired with embroidered NAMED mesh tops.",
    listed: true,
    isSolo: true,
    boardImages: [imgs("lune-marrow")[1], imgs("lune-marrow")[2]],
    entry: {
      title: "Candlelit Dotwork Capsule",
      text: "Ornamental mandala motifs stitched onto sheer NAMED mesh layers, launched with a quiet candlelit studio evening.",
      images: [imgs("lune-marrow")[1], imgs("lune-marrow")[2], imgs("lune-marrow")[0], imgs("lune-marrow")[3]],
    },
  },
];

export type VoteStore = {
  day: string; // YYYY-MM-DD local date
  ids: string[];
};

/** Local YYYY-MM-DD key so votes reset at local midnight. */
export function localDayKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Return today's active vote IDs, clearing yesterday's votes automatically. */
export function activeVotes(store: VoteStore | null | undefined, day: string): string[] {
  if (!store || store.day !== day) return [];
  return store.ids;
}

export function votesLeft(store: VoteStore | null | undefined, day: string): number {
  return Math.max(0, MAX_DAILY_VOTES - activeVotes(store, day).length);
}

export type VoteResult =
  | { ok: true; added: boolean; store: VoteStore }
  | { ok: false; reason: "own-team" | "limit"; store: VoteStore };

/** Pure vote toggle: max 4/day, local midnight reset, removing frees a slot, own team blocked. */
export function toggleVote(
  store: VoteStore | null | undefined,
  teamId: string,
  day: string,
  ownTeamIds: readonly string[] = [],
): VoteResult {
  const current = activeVotes(store, day);
  const base: VoteStore = { day, ids: current };
  if (ownTeamIds.includes(teamId)) {
    return { ok: false, reason: "own-team", store: base };
  }
  if (current.includes(teamId)) {
    return { ok: true, added: false, store: { day, ids: current.filter((id) => id !== teamId) } };
  }
  if (current.length >= MAX_DAILY_VOTES) {
    return { ok: false, reason: "limit", store: base };
  }
  return { ok: true, added: true, store: { day, ids: [...current, teamId] } };
}

/** Fisher-Yates shuffle returning a new array. Accepts rng for deterministic tests. */
export function shuffle<T>(items: readonly T[], rng: () => number = Math.random): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = out[i]!;
    out[i] = out[j]!;
    out[j] = tmp;
  }
  return out;
}

/** Pick another random team ID different from currentId when possible. */
export function pickNextRandom(
  ids: readonly string[],
  currentId: string,
  rng: () => number = Math.random,
): string | undefined {
  const others = ids.filter((id) => id !== currentId);
  if (others.length === 0) return ids[0];
  return others[Math.floor(rng() * others.length)];
}

// ---------- localStorage hooks ----------
export const COMP_POPUP_SEEN_KEY = "named.comp.popup-seen";
export const COMP_MY_TEAM_KEY = "named.comp.my-team";
export const COMP_APPLIED_KEY = "named.comp.applied";
export const COMP_SOLO_ENTRY_KEY = "named.comp.solo-entry";
export const COMP_VOTES_KEY = "named.comp.votes";
export const COMP_SEEN_ENTRIES_KEY = "named.comp.seen-entries";

export function useCompPopupSeen() {
  return useLocal<boolean>(COMP_POPUP_SEEN_KEY, false);
}

export function useMyTeam() {
  return useLocal<CompTeam | null>(COMP_MY_TEAM_KEY, null);
}

export function useAppliedTeams() {
  const [applied, setApplied, ready] = useLocal<string[]>(COMP_APPLIED_KEY, []);
  const toggle = (id: string) =>
    setApplied(applied.includes(id) ? applied.filter((x) => x !== id) : [...applied, id]);
  return { applied, toggle, ready, isApplied: (id: string) => applied.includes(id) };
}

export function useSoloEntry() {
  return useLocal<CompTeam | null>(COMP_SOLO_ENTRY_KEY, null);
}

export function useCompVotes() {
  const [store, setStore, ready] = useLocal<VoteStore>(COMP_VOTES_KEY, { day: "", ids: [] });
  return [store, setStore, ready] as const;
}

export function useSeenEntries() {
  return useLocal<VoteStore>(COMP_SEEN_ENTRIES_KEY, { day: "", ids: [] });
}

/** Combine sample teams with user's created team and/or solo entry. */
export function allTeams(myTeam: CompTeam | null, soloEntry: CompTeam | null): CompTeam[] {
  const list: CompTeam[] = [];
  if (myTeam) list.push(myTeam);
  if (soloEntry) list.push(soloEntry);
  return [...list, ...SAMPLE_TEAMS];
}

export function getTeamById(
  id: string,
  myTeam: CompTeam | null,
  soloEntry: CompTeam | null,
): CompTeam | undefined {
  return allTeams(myTeam, soloEntry).find((t) => t.id === id);
}

export function ownTeamIdsOf(myTeam: CompTeam | null, soloEntry: CompTeam | null): string[] {
  const ids: string[] = [];
  if (myTeam) ids.push(myTeam.id);
  if (soloEntry) ids.push(soloEntry.id);
  return ids;
}