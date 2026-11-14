import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { MapPin, Ticket } from "@/components/PixelIcons";
import { BackButton } from "@/components/TopBar";
import { useRsvp } from "@/lib/store";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Events — NAMED Collective" },
      { name: "description", content: "Meet-ups, flash days and pop-ups from the collective." },
      { property: "og:title", content: "Events — NAMED Collective" },
      {
        property: "og:description",
        content: "Meet-ups, flash days and pop-ups from the collective.",
      },
    ],
  }),
  component: EventsPage,
});

// Sample events for the prototype.
const EVENTS = [
  {
    id: "flash-dalston",
    date: "SAT 5 DEC",
    title: "Flash day with the collective",
    place: "Dalston, London",
    what: "Six artists, one wall of flash, walk-ins all day.",
  },
  {
    id: "popup-soho",
    date: "THU 10 DEC",
    title: "NAMED pop-up & archive rail",
    place: "Soho, London",
    what: "Try the new drop, dig the archive, meet the makers.",
  },
  {
    id: "meetup-peckham",
    date: "SUN 13 DEC",
    title: "Creatives' meet-up",
    place: "Peckham, London",
    what: "Bring your portfolio. Swap tips, find collaborators.",
  },
];

function EventsPage() {
  const { going, toggle } = useRsvp();
  return (
    <div className="flex-1 pb-8">
      <div className="flex items-center gap-2 px-4 pt-4">
        <BackButton />
        <h1 className="text-2xl">Events</h1>
      </div>
      <ul className="mt-3 space-y-3 px-3">
        {EVENTS.map((e) => {
          const on = going.includes(e.id);
          return (
            <li key={e.id} className="glass rounded-[24px] p-4">
              <p className="flex items-center gap-2 text-xs font-bold text-[var(--pink)]">
                <Ticket className="size-4" /> {e.date}
              </p>
              <h2 className="mt-2 text-lg">{e.title}</h2>
              <p className="mt-1 flex items-center gap-1 text-sm text-white/65">
                <MapPin className="size-3.5" /> {e.place}
              </p>
              <p className="mt-2 text-sm">{e.what}</p>
              <button
                type="button"
                aria-pressed={on}
                onClick={() => {
                  toggle(e.id);
                  toast(on ? "Removed from your plans" : "You're on the list");
                }}
                className={`btn mt-4 w-full ${on ? "btn-secondary" : "btn-primary"}`}
              >
                {on ? "Going ✓" : "I'm going"}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
