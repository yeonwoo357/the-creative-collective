import { getCreative, type Category } from "@/lib/data";
import { useLocal } from "@/lib/store";

/**
 * GET NAMED: an in-app idea competition for professionals.
 * Enter solo or as a team of up to 4; app users vote for up to 4 teams a day, in the app only.
 * Prototype only: teams, entries and votes are sample data plus localStorage.
 */
export const MAX_TEAM = 4;
export const MAX_VOTES_PER_DAY = 4;

export const COMPETITION = {
  name: "Get Named",
  tagline: "The professional idea competition",
  pitch:
    "Pitch an idea for NAMED Collective with your crew, or go solo. App users pick the winners.",
  brief: "An idea that brings NAMED Collective and your craft together: a drop, a night, a collab.",
  dates: "Dates TBC",
  prize: "Prize TBC",
};

export const CRAFTS: Category[] = [
  "Tattoo",
  "Piercing",
  "Hair",
  "Nails",
  "DJ",
  "Photographer",
  "Stylist",
];

export type Entry = { title: string; text: string; images: string[] };
export type Team = {
  id: string;
  name: string;
  /** Creative ids; the first is the lead. */
  members: string[];
  size: number;
  openRoles: Category[];
  pitch: string;
  entry: Entry;
};

const pics = (id: string, n = 4) =>
  Array.from(
    { length: n },
    (_, i) => `https://picsum.photos/seed/named-getnamed-${id}-${i}/600/600`,
  );

// Sample teams for the prototype (members are the app's sample creatives).
export const TEAMS: Team[] = [
  {
    id: "hollow-bloom",
    name: "Hollow Bloom",
    members: ["sable-kin", "onyx-reed", "jax-thorn"],
    size: 4,
    openRoles: ["Tattoo"],
    pitch: "Nails, hair and piercing as one look. We want a tattoo artist to finish it.",
    entry: {
      title: "Fitting night",
      text: "One night in store: nails, hair and piercing styled around a NAMED outfit, shot and posted as a lookbook.",
      images: pics("hollow-bloom"),
    },
  },
  {
    id: "static-club",
    name: "Static Club",
    members: ["kit-ember"],
    size: 3,
    openRoles: ["Piercing", "Nails"],
    pitch: "A DJ looking for two hands-on crafts to turn a launch into a party.",
    entry: {
      title: "Sound of the drop",
      text: "Every new collection launches with a live set, recorded and pinned to the drop on the globe.",
      images: pics("static-club"),
    },
  },
  {
    id: "velvet-needle",
    name: "Velvet Needle",
    members: ["mira-vale", "rook-hale", "vesper-lux"],
    size: 3,
    openRoles: [],
    pitch: "Two tattooers and a photographer. Flash on fabric, flash on skin.",
    entry: {
      title: "Wear your flash",
      text: "Each NAMED tee carries a flash design from the crew, and the buyer can book the same design as a tattoo.",
      images: pics("velvet-needle"),
    },
  },
  {
    id: "soft-riot",
    name: "Soft Riot",
    members: ["ash-veil", "nyx-calder"],
    size: 4,
    openRoles: ["Photographer", "Nails"],
    pitch: "Locs, braids and archive styling. Looking for a photographer and a nail artist.",
    entry: {
      title: "Archive braids",
      text: "Archive NAMED pieces re-styled with braided details, worn by the people who made them.",
      images: pics("soft-riot"),
    },
  },
  {
    id: "lowlight",
    name: "Lowlight",
    members: ["ivo-sterne", "vex-hollow"],
    size: 2,
    openRoles: [],
    pitch: "Berlin basements and big blackwork.",
    entry: {
      title: "Basement fitting",
      text: "A late fitting room in a club: try the drop, get a blackwork flash, stay for the set.",
      images: pics("lowlight"),
    },
  },
  {
    id: "chrome-halo",
    name: "Chrome Halo",
    members: ["wren-casket", "saint-moss"],
    size: 4,
    openRoles: ["Hair", "Tattoo"],
    pitch: "Gothic nails and gig photos from Manchester.",
    entry: {
      title: "Barrier nails",
      text: "Hand-painted nail sets inspired by NAMED graphics, shot at the front of real gigs.",
      images: pics("chrome-halo"),
    },
  },
  {
    id: "north-laine",
    name: "North Laine",
    members: ["dove-cassidy"],
    size: 1,
    openRoles: [],
    pitch: "Solo entry.",
    entry: {
      title: "Tiny botanicals",
      text: "A micro-botanical print for the next drop, with a matching fine-line flash sheet.",
      images: pics("north-laine"),
    },
  },
  {
    id: "kemptown-crew",
    name: "Kemptown Crew",
    members: ["pike-rowan", "lune-marrow"],
    size: 2,
    openRoles: [],
    pitch: "Piercing and dotwork by the sea.",
    entry: {
      title: "Hardware",
      text: "NAMED-branded titanium jewellery, designed with the crew and fitted at a pop-up.",
      images: pics("kemptown-crew"),
    },
  },
];

export const getTeam = (id: string) => TEAMS.find((t) => t.id === id);
export const openSpots = (t: Pick<Team, "size" | "members">) =>
  Math.max(0, t.size - t.members.length);
export const memberCraft = (id: string) => getCreative(id)?.category ?? "";

// ---------- votes (pure, so they can be tested) ----------
export type Votes = { day: string; ids: string[] };
export const NO_VOTES: Votes = { day: "", ids: [] };

/** Local calendar day, so the 4 votes reset at the user's midnight. */
export function dayKey(now: Date) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}`;
}
export function votesToday(v: Votes, day: string) {
  return v.day === day ? v.ids : [];
}
/** Adds or removes a vote. A 5th vote on the same day is refused (returns the same object). */
export function toggleVote(v: Votes, id: string, day: string): Votes {
  const ids = votesToday(v, day);
  if (ids.includes(id)) return { day, ids: ids.filter((x) => x !== id) };
  if (ids.length >= MAX_VOTES_PER_DAY) return v;
  return { day, ids: [...ids, id] };
}
/** Fisher–Yates with an injectable random source. */
export function shuffled<T>(items: readonly T[], rand: () => number = Math.random): T[] {
  const a = items.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

// ---------- the current user's part ----------
export type MyTeam = {
  name: string;
  size: number;
  openRoles: Category[];
  pitch: string;
  listed: boolean;
};
export type MyCompetition = {
  mode: "" | "solo" | "team";
  team: MyTeam | null;
  applied: string[];
  entry: Entry | null;
  popupSeen: boolean;
};
export const MY_TEAM_ID = "my-team";
export const EMPTY_COMP: MyCompetition = {
  mode: "",
  team: null,
  applied: [],
  entry: null,
  popupSeen: false,
};

export const COMP_KEY = "named.competition";
export const VOTES_KEY = "named.votes";

export function useCompetition() {
  const [c, set, ready] = useLocal<MyCompetition>(COMP_KEY, EMPTY_COMP);
  const me = { ...EMPTY_COMP, ...c };
  return [me, (patch: Partial<MyCompetition>) => set({ ...me, ...patch }), ready] as const;
}

export function useVotes() {
  const [v, set, ready] = useLocal<Votes>(VOTES_KEY, NO_VOTES);
  const day = dayKey(new Date());
  const ids = votesToday(v, day);
  return {
    ids,
    left: MAX_VOTES_PER_DAY - ids.length,
    ready,
    has: (id: string) => ids.includes(id),
    /** false when the daily limit stopped the vote */
    toggle: (id: string) => {
      const next = toggleVote(v, id, day);
      if (next === v) return false;
      set(next);
      return true;
    },
  };
}
