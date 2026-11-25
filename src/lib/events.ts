import { getCreative, hoodCoords } from "@/lib/data";

/** Sample events for the prototype (week of Thu 19 – Tue 24 Nov 2026). Hosts and attendees are existing creatives. */
export type NamedEvent = {
  id: string;
  title: string;
  hostId: string;
  neighbourhood: string;
  city: string;
  /** Sample address only. */
  address: string;
  /** Local date, YYYY-MM-DD. */
  date: string;
  start: string;
  end: string;
  cost: string;
  capacity: number;
  attendees: string[];
  about: string;
  requirements: string[];
  bring: string[];
  thumb: string;
  lat: number;
  lng: number;
};

const img = (id: string, i: number) => {
  const c = getCreative(id);
  return (i < 0 ? c?.cover : c?.work[i]) ?? "";
};
const at = (hood: string, dLat: number, dLng: number) => {
  const [lat, lng] = hoodCoords(hood);
  return { lat: lat + dLat, lng: lng + dLng };
};

export const EVENTS: NamedEvent[] = [
  {
    id: "tattoo-popup-dalston",
    title: "Tattoo pop-up",
    hostId: "mira-vale",
    neighbourhood: "Dalston",
    city: "London",
    address: "Unit 4, 12 Ashwin St, E8 (sample)",
    date: "2026-11-20",
    start: "12:00",
    end: "19:00",
    cost: "Flash from £80",
    capacity: 8,
    attendees: ["rook-hale", "lune-marrow", "jax-thorn"],
    about: "A day of fine-line and blackwork flash. Pick a design off the wall, sit in a slot, leave with fresh ink.",
    requirements: ["18+ with photo ID", "Licensed artist", "Step-free access: no (one step at the door)"],
    bring: ["Photo ID", "A reference, if you have one"],
    thumb: img("mira-vale", 0),
    ...at("Dalston", 0.0012, 0.0015),
  },
  {
    id: "picnic-hackney",
    title: "Collective picnic",
    hostId: "vesper-lux",
    neighbourhood: "Hackney",
    city: "London",
    address: "London Fields, by the lido (sample)",
    date: "2026-11-21",
    start: "13:00",
    end: "16:00",
    cost: "Free",
    capacity: 30,
    attendees: ["eden-rune", "kit-ember", "rue-sorrel", "cass-quill"],
    about: "Bring snacks, meet the collective, swap portfolios. Vesper will shoot a few flash portraits.",
    requirements: ["All ages (under 16s with an adult)", "Step-free access: yes"],
    bring: ["A blanket"],
    thumb: img("vesper-lux", -1),
    ...at("Hackney", 0.0012, 0.0015),
  },
  {
    id: "alt-haircuts-peckham",
    title: "Alt-haircuts",
    hostId: "onyx-reed",
    neighbourhood: "Peckham",
    city: "London",
    address: "Studio 2, 133 Rye Ln, SE15 (sample)",
    date: "2026-11-22",
    start: "11:00",
    end: "17:00",
    cost: "£45",
    capacity: 6,
    attendees: ["ash-veil", "sable-kin"],
    about: "Mullets, shags and bleach jobs in 45-minute slots. Tell Onyx the vibe and let them cook.",
    requirements: ["16+ (photo ID if asked)", "Step-free access: yes"],
    bring: ["Hair washed the day before", "Reference photos"],
    thumb: img("onyx-reed", 0),
    ...at("Peckham", 0.0012, 0.0015),
  },
];

/** The prototype week shown on the date strip. */
export const WEEK = ["2026-11-19", "2026-11-20", "2026-11-21", "2026-11-22", "2026-11-23", "2026-11-24"];

export const getEvent = (id: string) => EVENTS.find((e) => e.id === id);

/** Sample attendees plus the user once they've joined. */
export const goingCount = (e: NamedEvent, joined: boolean) => e.attendees.length + (joined ? 1 : 0);
export const spotsLeft = (e: NamedEvent, joined: boolean) => Math.max(0, e.capacity - goingCount(e, joined));

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export function dayParts(date: string) {
  const [y = 0, m = 1, d = 1] = date.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return { dow: DAYS[dt.getUTCDay()] ?? "", day: d, month: MONTHS[m - 1] ?? "" };
}
export const whenLabel = (e: NamedEvent) => {
  const p = dayParts(e.date);
  return `${p.dow} ${p.day} ${p.month} · ${e.start}–${e.end}`;
};

/** First day of the week with an event not yet joined (falls back to the first day). */
export function defaultDay(joined: string[]) {
  return WEEK.find((d) => EVENTS.some((e) => e.date === d && !joined.includes(e.id))) ?? WEEK[0]!;
}

export function icsFor(e: NamedEvent) {
  const stamp = (t: string) => `${e.date.replace(/-/g, "")}T${t.replace(":", "")}00`;
  return [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//NAMED Collective//Prototype//EN", "BEGIN:VEVENT",
    `UID:${e.id}@named-prototype`, `DTSTAMP:20261119T000000Z`,
    `DTSTART;TZID=Europe/London:${stamp(e.start)}`, `DTEND;TZID=Europe/London:${stamp(e.end)}`,
    `SUMMARY:${e.title}`, `LOCATION:${e.address}, ${e.neighbourhood}, ${e.city}`,
    "END:VEVENT", "END:VCALENDAR",
  ].join("\r\n");
}

export function downloadIcs(e: NamedEvent) {
  const url = URL.createObjectURL(new Blob([icsFor(e)], { type: "text/calendar;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `${e.id}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}
