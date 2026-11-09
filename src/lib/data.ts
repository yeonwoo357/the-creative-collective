export type Category = "Tattoo" | "Hair" | "Piercing" | "Nails" | "Photographer" | "Stylist" | "DJ";

export type Project = {
  id: string;
  title: string;
  year: number;
  style: string;
  placement: string;
  description: string;
  images: string[];
};

export type Creative = {
  id: string;
  name: string;
  category: Category;
  role: string;
  city: string;
  neighbourhood: string;
  lat: number;
  lng: number;
  tags: string[];
  bio: string;
  instagram: string;
  avatar: string;
  cover: string;
  work: string[];
  projects: Project[];
  reviews: { by: string; text: string }[];
};

const img = (seed: string, w = 600, h = 600) =>
  `https://picsum.photos/seed/named-${seed}/${w}/${h}?grayscale`;

type Seed = [string, string, Category, string, string, string, number, number, string[], string, string, string];
// id, name, category, role, city, neighbourhood, lat, lng (neighbourhood centroid, jittered), tags, bio, ig, project style/placement
const seeds: Seed[] = [
  ["mira-vale", "Mira Vale", "Tattoo", "Tattoo artist", "London", "Dalston", 51.5471, -0.0742, ["Blackwork", "Fine line", "Walk-ins"], "Fine line and blackwork out of a tiny Dalston studio. Bring a reference, leave with a feeling.", "mira.vale.ink", "Blackwork|Forearm"],
  ["jax-thorn", "Jax Thorn", "Piercing", "Piercer", "London", "Shoreditch", 51.5262, -0.0791, ["Curated ears", "Titanium", "Gentle"], "Curated ear stacks and septums. Implant-grade only, chatty by default.", "jaxthorn.pierce", "Curated ear|Helix"],
  ["onyx-reed", "Onyx Reed", "Hair", "Hair artist", "London", "Peckham", 51.4739, -0.0685, ["Mullets", "Bleach", "Colour"], "Shags, mullets and anything your mum would hate. Peckham chair, open door.", "onyx.cuts", "Bleach & tone|Shag"],
  ["sable-kin", "Sable Kin", "Nails", "Nail artist", "London", "Brixton", 51.4621, -0.1152, ["Chrome", "3D", "Gel-x"], "Tiny sculptures on your fingertips. Chrome, charms and chaos.", "sablekin.nails", "Chrome 3D|Full set"],
  ["vesper-lux", "Vesper Lux", "Photographer", "Photographer", "London", "Hackney", 51.5452, -0.0553, ["35mm", "Portraits", "Flash"], "Harsh flash, soft people. Shooting the collective since forever.", "vesper.lux.film", "35mm flash|Editorial"],
  ["rook-hale", "Rook Hale", "Tattoo", "Tattoo artist", "London", "Camden", 51.5392, -0.1426, ["Trad", "Bold", "Flash days"], "Bold traditional, flash Fridays, strong tea. Camden lifer.", "rookhale.tattoo", "Traditional|Upper arm"],
  ["nyx-calder", "Nyx Calder", "Stylist", "Stylist", "London", "Soho", 51.5134, -0.1362, ["Archive", "Editorial", "Upcycled"], "Pulling archive pieces and making them weird again. Editorial + music videos.", "nyx.styles", "Archive edit|Lookbook"],
  ["kit-ember", "Kit Ember", "DJ", "DJ", "London", "Hackney Wick", 51.5433, -0.0249, ["Techno", "Breaks", "Warehouse"], "Breaks into techno into whatever the room needs. Warehouse-raised.", "kitember.wav", "Live set|Warehouse"],
  ["lune-marrow", "Lune Marrow", "Tattoo", "Tattoo & piercing", "London", "Deptford", 51.4782, -0.0262, ["Ornamental", "Dotwork", "Piercing"], "Ornamental dotwork and the odd conch. Slow sessions, good playlists.", "lune.marrow", "Dotwork|Sternum"],
  ["ash-veil", "Ash Veil", "Hair", "Hair artist", "London", "Walthamstow", 51.5838, -0.0201, ["Locs", "Braids", "Natural"], "Locs, braids and natural hair care. Your scalp is in safe hands, bestie.", "ashveil.hair", "Loc retwist|Updo"],
  ["dove-cassidy", "Dove Cassidy", "Tattoo", "Tattoo artist", "Brighton", "North Laine", 50.8275, -0.1388, ["Fine line", "Botanical", "Micro"], "Micro botanicals by the sea. Tiny, delicate, permanent.", "dove.ink.brighton", "Botanical|Ankle"],
  ["pike-rowan", "Pike Rowan", "Piercing", "Piercer", "Brighton", "Kemptown", 50.8191, -0.1232, ["Industrial", "Stretching", "Body"], "Body piercing and safe stretching. Ask me anything, I've heard it all.", "pike.pierces", "Industrial|Ear"],
  ["vex-hollow", "Vex Hollow", "Tattoo", "Tattoo artist", "Berlin", "Kreuzberg", 52.4973, 13.4102, ["Neo-tribal", "Blackwork", "Large scale"], "Neo-tribal sleeves and big ideas. London guest spots twice a year.", "vex.hollow", "Neo-tribal|Back"],
  ["ivo-sterne", "Ivo Sterne", "DJ", "DJ", "Berlin", "Neukölln", 52.4812, 13.4351, ["Industrial", "EBM", "Late"], "EBM and industrial for people who don't sleep. Neukölln basements.", "ivosterne", "Club night|Basement"],
  ["wren-casket", "Wren Casket", "Nails", "Nail artist", "Manchester", "Northern Quarter", 53.4843, -2.2361, ["Goth", "Long", "Hand-painted"], "Long, pointy, hand-painted gothic nails. Northern Quarter, no appointments wasted.", "wren.casket.nails", "Hand-painted|Stiletto"],
  ["saint-moss", "Saint Moss", "Photographer", "Photographer", "Manchester", "Ancoats", 53.4838, -2.2241, ["Film", "Gigs", "Street"], "Gig photography and street portraits. Find me at the barrier.", "saintmoss.photo", "Gig series|Live"],
];

const descs = [
  "A slow, considered piece built over two sessions. Healed shots in the last frames.",
  "Started as a doodle on a napkin. Ended up as one of my favourite things I've made.",
];

export const creatives: Creative[] = seeds.map((s, i) => {
  const [id, name, category, role, city, neighbourhood, lat, lng, tags, bio, instagram, sp] = s;
  const [style, placement] = sp.split("|");
  const work = Array.from({ length: 4 + (i % 3) }, (_, k) => img(`${id}-w${k}`));
  const projects: Project[] = Array.from({ length: 1 + (i % 2) }, (_, k) => ({
    id: `${id}-p${k + 1}`,
    title: k === 0 ? `${style} study` : `${placement} series`,
    year: 2026 - k,
    style,
    placement,
    description: descs[k],
    images: Array.from({ length: 4 }, (_, n) => img(`${id}-p${k}-${n}`, 800, 800)),
  }));
  return {
    id,
    name,
    category,
    role,
    city,
    neighbourhood,
    lat,
    lng,
    tags,
    bio,
    instagram,
    avatar: img(`${id}-avatar`, 200, 200),
    cover: img(`${id}-cover`, 800, 400),
    work,
    projects,
    reviews: [
      { by: "A. from the collective", text: "Calm, kind, and the work healed perfectly." },
      { by: "R.", text: "Would trust with my whole body. Already booked again." },
    ],
  };
});

export const getCreative = (id: string) => creatives.find((c) => c.id === id);
export const getProject = (id: string) => {
  for (const c of creatives) {
    const p = c.projects.find((p) => p.id === id);
    if (p) return { creative: c, project: p };
  }
  return undefined;
};

export const CITY_COORDS: Record<string, [number, number]> = {
  london: [51.5074, -0.1278],
  brighton: [50.8225, -0.1372],
  berlin: [52.52, 13.405],
  manchester: [53.4808, -2.2426],
};

export function distanceKm(a: [number, number], b: [number, number]) {
  const R = 6371;
  const toR = (d: number) => (d * Math.PI) / 180;
  const dLat = toR(b[0] - a[0]);
  const dLng = toR(b[1] - a[1]);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(toR(a[0])) * Math.cos(toR(b[0])) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export const formatKm = (km: number) => (km < 10 ? `${km.toFixed(1)} km` : `${Math.round(km)} km`);

export const FILTERS = ["All", "Tattoo", "Hair", "Piercing", "Nails"] as const;
export type Filter = (typeof FILTERS)[number];

export function searchCreatives(query: string, filter: Filter) {
  const q = query.trim().toLowerCase();
  return creatives.filter((c) => {
    if (filter !== "All" && c.category !== filter && !c.tags.includes(filter)) return false;
    if (!q) return true;
    return [c.name, c.category, c.role, c.city, c.neighbourhood, ...c.tags]
      .join(" ")
      .toLowerCase()
      .includes(q);
  });
}
