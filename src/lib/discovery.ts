import { hoodCoords, distanceKm, interestOf, type Creative, type Category } from "@/lib/data";

export type DiscoverySort = "For you" | "Nearest";

export function rankCreatives(list: Creative[], sort: DiscoverySort, saved: string[], recent: string[], origin: [number, number]) {
  return list.map((c) => ({
    c,
    km: distanceKm(origin, hoodCoords(c.neighbourhood, c.city)),
    interest: interestOf(c, saved, recent),
  })).sort((a, b) => (sort === "For you" ? b.interest.score - a.interest.score : 0) || a.km - b.km || a.c.name.localeCompare(b.c.name));
}

export function savedGlobeIds(saved: string[], list: Creative[]) {
  return list.filter((c) => saved.includes(c.id)).map((c) => c.id).join(",");
}

export const VERIFICATION_NOTICE = "Prototype: verification not active";

// Sample content only: illustrative services and prices, not live offers or bookings.
export const SAMPLE_SERVICES: Record<Category, string[]> = {
  Tattoo: ["Fine-line piece · from £80", "Custom blackwork · £150–£400", "Flash piece · £80–£180", "Consultation · £0–£30"],
  Piercing: ["Ear piercing · £30–£60", "Septum piercing · £40–£70", "Ear curation · £60–£150", "Jewellery fitting · £15–£30"],
  Hair: ["Alternative cut · £45–£80", "Bleach & tone · £100–£220", "Creative colour · £90–£200", "Locs & braids · £60–£180"],
  Nails: ["Gel art set · £45–£75", "Chrome set · £55–£90", "3D nail art · £65–£110", "Custom press-ons · £30–£65"],
  Photographer: ["Flash portrait session · £80–£180", "Editorial shoot · £200–£500", "Live event coverage · £150–£350", "Film portraits · £100–£220"],
  DJ: ["Club set · £100–£300", "Private event set · £200–£500", "Guest mix · £50–£150", "Vinyl session · £100–£250"],
  Stylist: ["Personal styling · £80–£180", "Editorial wardrobe · £200–£450", "Music video looks · £250–£600", "Archive sourcing · £50–£150"],
  "Art & Illustration": ["Custom ink illustration · £60–£180", "Gig poster · £100–£250", "Print commission · £80–£220", "Zine artwork · £100–£300"],
};

// Sample content only: example collaboration interests for each discipline.
export const SAMPLE_COLLABS: Record<Category, string[]> = {
  Tattoo: ["Guest spots", "Shared flash days", "Illustration collaborations"],
  Piercing: ["Jewellery makers", "Studio guest days", "Ear-stack editorials"],
  Hair: ["Editorial shoots", "Music video hair", "Creative colour sessions"],
  Nails: ["Editorial nail art", "Jewellery collaborations", "Custom press-on drops"],
  Photographer: ["Fashion editorials", "Artist portraits", "Live music projects"],
  DJ: ["Collective club nights", "Guest mixes", "Live artist sets"],
  Stylist: ["Fashion editorials", "Music video wardrobe", "Independent designers"],
  "Art & Illustration": ["Gig posters", "Zines & small presses", "Tattoo flash collaborations"],
};