export type Category = "Tattoo" | "Hair" | "Piercing" | "Nails" | "Photographer" | "Stylist" | "DJ" | "Art & Illustration" | "Fashion" | "Modelling";

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
  tiktok: string;
  avatar: string;
  cover: string;
  work: string[];
  layout: "carousel" | "grid";
  projects: Project[];
  reviews: { by: string; text: string }[];
};

const photo = (id: string, part: string) => `/images/${id}-${part}.jpg`;

/** Local photos per creative: [avatar, cover, work 1, work 2, work 3] with alt text. */
const PHOTO_ALTS: Record<string, [string, string, string, string, string]> = {
  "mira-vale": [
    "Tattoo artist with tattooed arms in a dim studio",
    "Dark tattoo studio with ink bottles and a tattoo machine",
    "Fine-line moth tattoo under a blackwork moon on a forearm",
    "Fine-line tattoo flash sheet pinned to a studio wall",
    "Fresh blackwork geometric tattoo on a shoulder"
  ],
  "jax-thorn": [
    "Side profile showing a curated ear stack",
    "Tray of titanium body jewellery in a piercing studio",
    "Seven-piece titanium ear stack from helix to lobe",
    "Septum ring piercing close-up",
    "Titanium piercing jewellery on black velvet"
  ],
  "onyx-reed": [
    "Bleached choppy mullet from behind",
    "Dim hair salon with a barber chair and bleach bowls",
    "Icy platinum shag haircut, back and side",
    "Black and red dyed mullet in profile",
    "Bleach being painted onto foiled hair"
  ],
  "sable-kin": [
    "Hands with chrome drip nails",
    "Nail desk with gel polish, charms and a UV lamp",
    "Liquid chrome Gel-X nails with 3D drips and charms",
    "Purple chrome almond nails with 3D flowers",
    "Gel nails curing under a UV lamp"
  ],
  "vesper-lux": [
    "Photographer behind a film camera with the flash up",
    "Darkroom with film negatives under red safelight",
    "Direct-flash 35mm portrait in black leather",
    "Flash snapshot of two goth friends on a sofa",
    "Backstage flash photo of ringed hands on a mic stand"
  ],
  "rook-hale": [
    "Traditional-tattooed hands holding a tattoo machine",
    "Wall of traditional tattoo flash in an old-school shop",
    "Traditional swallow and dagger tattoo on an upper arm",
    "Fresh traditional panther head tattoo on a calf",
    "Traditional rose and skull hand tattoo"
  ],
  "nyx-calder": [
    "Stylist sorting a rail of black archive clothes",
    "Styling studio with rails of archive denim and leather",
    "Flat-lay of reworked denim jacket with chains and boots",
    "Archive denim look in a concrete stairwell",
    "Corset and sheer layers with safety pins on a mannequin"
  ],
  "kit-ember": [
    "DJ silhouetted at the decks under red club light",
    "Warehouse rave crowd under strobe lights",
    "Hands on a DJ mixer and turntable",
    "Crowd's raised hands under green lasers",
    "Crate of vinyl records under red light"
  ],
  "lune-marrow": [
    "Gloved hands tattooing dotwork by candlelight",
    "Tattoo studio with ornamental mandala artwork",
    "Ornamental dotwork mandala tattoo on a hand",
    "Conch and lobe piercings linked by a titanium chain",
    "Ornamental dotwork band tattoo on a thigh"
  ],
  "ash-veil": [
    "Long locs tied up, seen from behind",
    "Natural hair salon station with combs and oils",
    "Sculpted loc updo with silver cuffs",
    "Long black and burgundy box braids",
    "Hands retwisting locs at the root"
  ],
  "dove-cassidy": [
    "Tattooed hands sketching botanical designs by a sea window",
    "Seaside pier and pebble beach at dusk",
    "Fine-line wildflower tattoo wrapping an ankle",
    "Micro fine-line fern tattoo on a wrist",
    "Pressed flowers beside a botanical flash sheet"
  ],
  "pike-rowan": [
    "Gloved hands holding a sterile needle and clamp",
    "Piercing studio with sterile tray and bench",
    "Industrial piercing with a curved titanium bar",
    "Stretched lobe with a black stone plug",
    "Eyebrow and bridge piercings close-up"
  ],
  "vex-hollow": [
    "Neo-tribal blackwork tattoo across neck and shoulders",
    "Concrete Berlin tattoo studio with blackwork art",
    "Neo-tribal blackwork back piece",
    "Large-scale blackwork sleeve tattoo",
    "Freehand neo-tribal design drawn on a leg"
  ],
  "ivo-sterne": [
    "DJ silhouetted in a basement booth under blue light",
    "Basement techno club under red strobe and fog",
    "Hands patching a modular synth and drum machine",
    "Dancers in a smoky basement under strobe",
    "Concrete stairs down to a red-lit club door"
  ],
  "wren-casket": [
    "Hand with long black stiletto nails on lace",
    "Gothic nail desk with candles and polish",
    "Stained-glass cathedral window stiletto nails",
    "Hand-painted bat wing press-on nails",
    "Blood-red spiderweb stiletto nails"
  ],
  "saint-moss": [
    "Gig photographer at the barrier facing the stage",
    "Rainy night street lined with red-brick warehouses",
    "Film gig photo of a guitarist mid-jump",
    "Night street portrait under a streetlight",
    "Crowd surfer at a sweaty gig"
  ],
  "rue-sorrel": [
    "Illustrator's hand inking a gothic botanical drawing in a sketchbook",
    "Studio wall covered in pinned-up black ink illustrations",
    "Sketchbook spread of pen-and-ink moths, skulls and thorned roses",
    "Etching-style ink illustration of a raven on a branch under a crescent moon",
    "Sketchbook page of thorny vines and a crescent moon with a fountain pen"
  ],
  "cass-quill": [
    "Hands pulling a red and black screen print off the frame",
    "Print studio wall lined with red, pink and black illustrated posters",
    "Pink and black screen-printed poster of a snake coiled around a skull",
    "Risograph zine spread with collaged hands, eyes and flames",
    "Gothic flaming heart with daggers illustrated on a drawing tablet"
  ]
};

const ALT_BY_SRC = new Map<string, string>();
for (const [id, alts] of Object.entries(PHOTO_ALTS))
  ["avatar", "cover", "w0", "w1", "w2"].forEach((part, i) => ALT_BY_SRC.set(photo(id, part), alts[i]!));

/** Descriptive alt text for a seeded creative photo, if known. */
export const altOf = (src: string) => ALT_BY_SRC.get(src);

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
  ["rue-sorrel", "Rue Sorrel", "Art & Illustration", "Illustrator", "London", "Bethnal Green", 51.5268, -0.0561, ["Ink", "Gothic", "Sketchbook"], "Gothic pen-and-ink drawings, prints and the odd book cover. Sketchbook always open.", "rue.sorrel.draws", "Ink illustration|Print"],
  ["cass-quill", "Cass Quill", "Art & Illustration", "Illustrator & printmaker", "London", "Clapton", 51.5615, -0.0552, ["Posters", "Screen print", "Zines"], "Gig posters, zines and screen prints in two colours max. Dark, loud and hand-pulled.", "cassquill.print", "Gig poster|Screen print"],
  ["fern-voss", "Fern Voss", "Fashion", "Fashion designer", "London", "Soho", 51.5134, -0.1362, ["Upcycled", "Denim", "Archive"], "Reworked denim and offbeat layers, stitched in Soho. Small runs, big silhouettes.", "fern.voss.studio", "Reworked denim|Lookbook"],
  ["eden-rune", "Eden Rune", "Modelling", "Model", "London", "Hackney", 51.5452, -0.0553, ["Editorial", "Portraits", "Flash"], "Editorial faces and movement for independent shoots. Hackney-based, always up for something a little odd.", "eden.rune", "Flash portraits|Editorial"],
];

// Latest projects, written for each creative's own trade: [title, style, detail, description]
type ProjectSeed = [string, string, string, string];
const projectSeeds: Record<string, ProjectSeed[]> = {
  "mira-vale": [
    [
      "Moth & moon forearm",
      "Blackwork",
      "Forearm",
      "A fine-line moth under a blackwork moon, built over two sessions. Healed shots in the last frames.",
    ],
    [
      "Walk-in flash sheet",
      "Fine line",
      "Flash",
      "Thirty tiny designs drawn for one walk-in Saturday. First come, first inked.",
    ],
  ],
  "jax-thorn": [
    [
      "Constellation ear stack",
      "Curated ear",
      "Helix to lobe",
      "Seven implant-grade titanium pieces mapped to one ear, placed across three visits so everything healed clean.",
    ],
  ],
  "onyx-reed": [
    [
      "Bleached shag transformation",
      "Bleach & tone",
      "Cut & colour",
      "Waist-length brown to an icy shag in one long Peckham afternoon. Bond builder at every step.",
    ],
    [
      "Mullet week",
      "Mullets",
      "Cut",
      "Seven mullets in seven days, each one cut to the face in the chair, not to a picture.",
    ],
  ],
  "sable-kin": [
    [
      "Liquid chrome charm set",
      "Chrome 3D",
      "Full set",
      "Mirror chrome with hand-sculpted 3D drips and charms on Gel-X extensions. Three hours, zero regrets.",
    ],
  ],
  "vesper-lux": [
    [
      "Collective portraits on 35mm",
      "35mm flash",
      "Editorial",
      "Twelve members shot on direct flash at home, one roll each. No retouching, all grain.",
    ],
    [
      "Backstage zine",
      "Portraits",
      "Zine",
      "A night behind the curtain at a Hackney show, printed as a 24-page risograph zine.",
    ],
  ],
  "rook-hale": [
    [
      "Swallow & dagger upper arm",
      "Traditional",
      "Upper arm",
      "Bold lines, a limited palette and plenty of skin breaks. Tattooed in a single sitting.",
    ],
  ],
  "nyx-calder": [
    [
      "Archive denim lookbook",
      "Archive edit",
      "Lookbook",
      "Eight looks pulled from 90s archive denim and reworked with upcycled hardware. Shot in a Soho stairwell.",
    ],
    [
      "Music video wardrobe",
      "Editorial",
      "Music video",
      "Styling for a three-day shoot: twelve looks, one sewing machine, no sleep.",
    ],
  ],
  "kit-ember": [
    [
      "Warehouse closing set",
      "Live set",
      "Warehouse",
      "Three hours from breaks into techno to close a Hackney Wick all-nighter. Full recording inside.",
    ],
  ],
  "lune-marrow": [
    [
      "Ornamental sternum piece",
      "Dotwork",
      "Sternum",
      "A symmetrical ornamental piece in pure dotwork, built slowly over three sessions.",
    ],
    [
      "Conch & chain pairing",
      "Piercing",
      "Ear",
      "A conch piercing linked to a lobe with a custom titanium chain, done alongside the tattoo work.",
    ],
  ],
  "ash-veil": [
    [
      "Loc retwist & sculpted updo",
      "Loc retwist",
      "Updo",
      "A full retwist finished in a sculpted updo for a wedding weekend. Scalp care first, always.",
    ],
  ],
  "dove-cassidy": [
    [
      "Wildflower ankle wrap",
      "Botanical",
      "Ankle",
      "Six micro wildflowers from the South Downs wrapped around one ankle in single-needle fine line.",
    ],
    [
      "Pressed-flower minis",
      "Micro",
      "Flash",
      "A flash day of thumbnail-sized botanicals drawn from real pressed flowers.",
    ],
  ],
  "pike-rowan": [
    [
      "Industrial with custom bar",
      "Industrial",
      "Ear",
      "An industrial placed to the ear's own anatomy, with a hand-bent titanium bar instead of a straight one.",
    ],
  ],
  "vex-hollow": [
    [
      "Neo-tribal back piece",
      "Neo-tribal",
      "Back",
      "A full back in flowing blackwork, freehanded on skin and tattooed over five day sessions.",
    ],
    [
      "London guest spot",
      "Blackwork",
      "Guest spot",
      "A week of large-scale pieces during the spring guest spot in Dalston.",
    ],
  ],
  "ivo-sterne": [
    [
      "Basement residency",
      "Club night",
      "Basement",
      "A monthly EBM and industrial night in a Neukölln basement. Doors at midnight, done by nine.",
    ],
  ],
  "wren-casket": [
    [
      "Cathedral window stilettos",
      "Hand-painted",
      "Stiletto",
      "Long stiletto nails hand-painted as stained-glass windows, each one outlined in black gel.",
    ],
    [
      "Bat wing press-ons",
      "Goth",
      "Press-on set",
      "A reusable hand-painted set made to order and posted out from the Northern Quarter.",
    ],
  ],
  "rue-sorrel": [
    ["Moth & rose sketchbook", "Ink illustration", "Sketchbook", "A month of gothic botanicals drawn in one sketchbook, every page in fine-nib black ink."],
    ["Raven etching print", "Gothic", "Print", "A raven under a crescent moon, drawn as an etching-style print in a run of 30."],
  ],
  "cass-quill": [
    ["Snake & skull gig poster", "Gig poster", "Screen print", "A two-colour poster for a Clapton show, hand-pulled in a run of 50."],
    ["Burn zine", "Zines", "Risograph", "A 20-page collage zine of hands, eyes and flames, printed on a riso in pink and black."],
  ],
  "fern-voss": [["Reworked denim layers", "Upcycled", "Lookbook", "Sample fashion portfolio using archive styling imagery."]],
  "eden-rune": [["Flash portrait study", "Editorial", "Portraits", "Sample modelling portfolio using existing flash portrait imagery."]],
  "saint-moss": [
    [
      "From the barrier",
      "Gig series",
      "Live",
      "A year of Manchester gigs shot on film from the front row. Sweat, flash and feedback.",
    ],
  ],
};

export const creatives: Creative[] = seeds.map((s, i) => {
  const [id, name, category, role, city, neighbourhood, lat, lng, tags, bio, instagram, sp] = s;
  const [style = "", placement = ""] = sp.split("|");
  // Launch samples reuse existing local imagery; no new assets.
  const photoId = id === "fern-voss" ? "nyx-calder" : id === "eden-rune" ? "vesper-lux" : id;
  const shots = [photo(photoId, "w0"), photo(photoId, "w1"), photo(photoId, "w2"), photo(photoId, "cover")];
  const work = shots.slice(0, 3);
  const projects: Project[] = (projectSeeds[id] ?? [[`${style} work`, style, placement, ""]]).map(
    ([title, pStyle, pDetail, description], k) => ({
      id: `${id}-p${k + 1}`,
      title,
      year: 2026 - k,
      style: pStyle,
      placement: pDetail,
      description,
      images: Array.from({ length: 4 }, (_, n) => shots[(n + k) % shots.length]!),
    }),
  );
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
    tiktok: instagram,
    avatar: photo(photoId, "avatar"),
    cover: photo(photoId, "cover"),
    work,
    layout: i % 3 === 0 ? "carousel" : "grid",
    projects,
    reviews: [
      { by: "A. from the collective", text: "Calm, kind, and the work healed perfectly." },
      { by: "R.", text: "Would trust with my whole body. Already booked again." },
    ],
  };
});

/** Mock "Verified" badge (prototype only, no real checks). */
export const VERIFIED = new Set(["mira-vale", "vesper-lux", "jax-thorn", "kit-ember", "wren-casket", "rue-sorrel"]);
export const isVerified = (id: string) => VERIFIED.has(id);

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

export const FILTERS = ["All", "Tattoo", "Hair", "Piercing", "Nails", "Art & Illustration", "Photographer", "DJ", "Stylist", "Fashion", "Modelling"] as const;
export const CATEGORY_LABELS: Partial<Record<Category, string>> = { Photographer: "Photography", DJ: "Music/DJ" };
export const categoryLabel = (category: Category | "All") => category === "All" ? "All" : CATEGORY_LABELS[category] ?? category;
export type Filter = (typeof FILTERS)[number];

/** Tiny synonym list so loose words still find the right people (no AI, prototype only). */
export const SYNONYMS: Record<string, string[]> = {
  dark: ["blackwork", "goth", "gothic", "industrial", "ebm", "dark"],
  goth: ["goth", "gothic", "dark"],
  poster: ["poster", "posters", "illustration", "print"],
  art: ["art", "illustration", "illustrator", "drawing"],
  drawing: ["drawing", "illustration", "ink", "sketchbook"],
  ink: ["ink", "tattoo", "illustration"],
  tattoo: ["tattoo", "ink"],
  haircut: ["hair", "cut", "mullet", "shag"],
  music: ["dj", "techno", "breaks", "gig"],
  photography: ["photographer", "photography"],
  "music/dj": ["dj", "music"],
  photo: ["photo", "photographer", "35mm", "film", "flash"],
};

const haystack = (c: Creative) =>
  [c.name, c.category, c.role, c.city, c.neighbourhood, c.bio, ...c.tags].join(" ").toLowerCase();

/** Every word in the query (or one of its synonyms) must appear somewhere on the profile. */
export function matchesQuery(text: string, query: string) {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  return words.every((w) => [w, ...(SYNONYMS[w] ?? [])].some((v) => text.includes(v)));
}

export function searchCreatives(query: string, filter: Filter) {
  return creatives.filter((c) => {
    if (filter !== "All" && c.category !== filter && !c.tags.includes(filter)) return false;
    return matchesQuery(haystack(c), query);
  });
}

/** "For you": score by discipline + shared tags with saved / recently viewed profiles. */
export function interestOf(c: Creative, savedIds: string[], recentIds: string[]) {
  let best: { score: number; label: string } = { score: 0, label: "" };
  const consider = (ids: string[], verb: string, weight: number) => {
    for (const id of ids) {
      const o = getCreative(id);
      if (!o || o.id === c.id) continue;
      const score = ((o.category === c.category ? 2 : 0) + c.tags.filter((t) => o.tags.includes(t)).length) * weight;
      if (score > best.score) best = { score, label: `Because you ${verb} ${o.name}` };
    }
  };
  consider(savedIds, "saved", 2);
  consider(recentIds, "viewed", 1);
  return best;
}

/** Neighbourhood centroid for a place name (falls back to the city centre). Never exact. */
export function hoodCoords(hood: string | undefined, city = "London"): [number, number] {
  const p = PLACES.find((x) => x.name.toLowerCase() === (hood ?? "").trim().toLowerCase());
  return p ? [p.lat, p.lng] : (CITY_COORDS[city.toLowerCase()] ?? CITY_COORDS["london"]!);
}

/** Neighbourhood labels drawn on the globe (centroids only, never addresses). */
export const PLACES: { name: string; lat: number; lng: number }[] = [
  ...Array.from(
    new Map(creatives.map((c) => [c.neighbourhood, { name: c.neighbourhood, lat: c.lat, lng: c.lng }])).values(),
  ),
  { name: "Islington", lat: 51.5362, lng: -0.1033 },
  { name: "Bermondsey", lat: 51.4979, lng: -0.0637 },
  { name: "Stoke Newington", lat: 51.5624, lng: -0.0739 },
  { name: "Bethnal Green", lat: 51.527, lng: -0.0549 },
  { name: "Clapton", lat: 51.5612, lng: -0.0557 },
  { name: "New Cross", lat: 51.4752, lng: -0.0405 },
];

export const NEIGHBOURHOODS = Array.from(new Set(PLACES.filter((p) => p.lat > 51.3 && p.lat < 51.7).map((p) => p.name))).sort();
export const DISCIPLINES = ["Tattoo", "Hair", "Piercing", "Nails", "Photographer", "Stylist", "DJ", "Art & Illustration", "Fashion", "Modelling", "Designer", "Model", "Other"];

/** Search work: every project from creatives that match, plus projects whose own title/style matches. */
export function searchWork(query: string, filter: Filter) {
  const people = new Set(searchCreatives(query, filter).map((c) => c.id));
  const q = query.trim().toLowerCase();
  const out: { creative: Creative; project: Project }[] = [];
  for (const c of creatives)
    for (const p of c.projects) {
      const own = q && (filter === "All" || c.category === filter) && matchesQuery([p.title, p.style, p.placement].join(" ").toLowerCase(), q);
      if (people.has(c.id) || own) out.push({ creative: c, project: p });
    }
  return out;
}
