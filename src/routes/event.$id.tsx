import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  ArrowUpRight,
  Bookmark,
  Check,
  Clock,
  Copy,
  Globe2,
  Instagram,
  MapPin,
  MessageCircle,
  Music2,
  Ticket,
  User,
} from "@/components/PixelIcons";
import { BackButton } from "@/components/TopBar";
import { altOf, getCreative } from "@/lib/data";
import { downloadIcs, getEvent, goingCount, spotsLeft, whenLabel } from "@/lib/events";
import { useRsvp, useSavedEvents } from "@/lib/store";

export const Route = createFileRoute("/event/$id")({
  head: ({ params }) => {
    const e = getEvent(params.id);
    const title = e ? `${e.title} — NAMED Collective` : "Event — NAMED Collective";
    const desc = e ? `${whenLabel(e)} in ${e.neighbourhood}, ${e.city}.` : "Collective event details.";
    return {
      meta: [
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
      ],
    };
  },
  component: EventDetailPage,
});

function EventDetailPage() {
  const { id } = Route.useParams();
  const event = getEvent(id);
  const { going, toggle } = useRsvp();
  const { isSaved, toggle: toggleSave } = useSavedEvents();

  if (!event) {
    return (
      <div className="flex-1 p-4">
        <BackButton />
        <p className="mt-8 text-center font-bold">Event not found.</p>
      </div>
    );
  }

  const host = getCreative(event.hostId);
  const joined = going.includes(event.id);
  const saved = isSaved(event.id);
  const attendees = event.attendees.map(getCreative).filter((c): c is NonNullable<typeof c> => !!c);

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast("Link copied");
    } catch {
      toast("Copy the link from your browser bar");
    }
  };

  return (
    <div className="flex-1 px-4 pb-10 pt-4">
      <div className="flex items-center justify-between gap-2">
        <BackButton />
        <div className="flex gap-2">
          <button
            type="button"
            aria-pressed={saved}
            onClick={() => toggleSave(event.id)}
            className="chip min-h-11 gap-1.5 px-3"
          >
            <Bookmark className="size-4" active={saved} />
            <span>{saved ? "Saved" : "Save"}</span>
          </button>
          <button type="button" onClick={share} className="chip min-h-11 gap-1.5 px-3">
            <Copy className="size-4" />
            <span>Share</span>
          </button>
        </div>
      </div>

      <section className="glass mt-3 overflow-hidden rounded-[24px]">
        <img
          src={event.thumb}
          alt={altOf(event.thumb) ?? event.title}
          className="h-44 w-full object-cover"
        />
        <div className="p-4">
          <h1 className="text-2xl font-bold">{event.title}</h1>
          <p className="mt-1.5 flex items-center gap-1.5 text-sm text-white/80">
            <MapPin className="size-4 shrink-0" />
            <span>{event.neighbourhood}, {event.city}</span>
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-[var(--pink)]">
            <Ticket className="size-4 shrink-0" />
            <span>{event.cost}</span>
          </p>
        </div>
      </section>

      {!joined ? (
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={() => {
              toggle(event.id);
              toast("Joined event");
            }}
            className="btn btn-primary min-w-32"
          >
            Join
          </button>
        </div>
      ) : (
        <section className="glass mt-3 rounded-[22px] border border-[var(--pink)]/40 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--pink)]">Booked</p>
          <p className="mt-1 text-sm font-bold">{whenLabel(event)}</p>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-white/80">
            <MapPin className="size-4 shrink-0" />
            <span>{event.address}</span>
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => {
                downloadIcs(event);
                toast("Calendar file downloaded");
              }}
              className="btn btn-primary flex-1"
            >
              Add to calendar
            </button>
            <button
              type="button"
              onClick={() => {
                toggle(event.id);
                toast("Booking cancelled");
              }}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </section>
      )}

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-[1.35fr_1fr]">
        <div className="space-y-4">
          {host && (
            <Link
              to="/profile/$id"
              params={{ id: host.id }}
              className="glass flex min-h-14 items-center gap-3 rounded-[20px] p-3"
            >
              <img
                src={host.avatar}
                alt={altOf(host.avatar) ?? host.name}
                className="size-11 rounded-full object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs uppercase text-white/60">Hosted by</p>
                <p className="truncate font-bold">{host.name}</p>
              </div>
              <ArrowUpRight className="size-4 shrink-0 text-white/60" />
            </Link>
          )}

          <section className="glass rounded-[20px] p-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white/70">About</h2>
            <p className="mt-2 text-sm leading-relaxed">{event.about}</p>
          </section>

          <section className="glass rounded-[20px] p-4">
            <p className="text-sm font-bold">
              {goingCount(event, joined)} going · {spotsLeft(event, joined)} spots left
            </p>
            <div className="mt-2.5 flex items-center gap-2">
              <div className="flex -space-x-2">
                {attendees.map((p) => (
                  <img
                    key={p.id}
                    src={p.avatar}
                    alt={altOf(p.avatar) ?? p.name}
                    className="size-8 rounded-full border border-black object-cover"
                  />
                ))}
              </div>
              <span className="text-xs text-white/65">
                {attendees.map((p) => p.name.split(" ")[0]).join(", ")}
                {joined ? " + you" : ""}
              </span>
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <section className="glass space-y-2.5 rounded-[20px] p-4 text-sm">
            <p className="flex items-center gap-2">
              <MapPin className="size-4 shrink-0 text-[var(--pink)]" />
              <span>{event.neighbourhood}, {event.city}</span>
            </p>
            <p className="flex items-center gap-2">
              <Ticket className="size-4 shrink-0 text-[var(--pink)]" />
              <span>{event.cost}</span>
            </p>
            <p className="flex items-center gap-2">
              <User className="size-4 shrink-0 text-[var(--pink)]" />
              <span>{event.capacity} max ({spotsLeft(event, joined)} left)</span>
            </p>
            <p className="flex items-center gap-2">
              <Clock className="size-4 shrink-0 text-[var(--pink)]" />
              <span>{whenLabel(event)}</span>
            </p>
          </section>

          <section className="glass rounded-[20px] p-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-white/70">Requirements</h2>
            <ul className="mt-2 space-y-1.5 text-sm">
              {event.requirements.map((r) => (
                <li key={r} className="flex items-start gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-[var(--pink)]" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="glass rounded-[20px] p-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-white/70">Please bring</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
              {event.bring.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </section>

          <div className="flex flex-col gap-2">
            <Link to="/chat/$id" params={{ id: event.hostId }} className="btn btn-secondary w-full">
              <MessageCircle className="size-4" /> Inquire
            </Link>
            <Link to="/" search={{ ids: `event:${event.id}` }} className="btn btn-secondary w-full">
              <Globe2 className="size-4" /> View on globe
            </Link>
          </div>
        </aside>
      </div>

      {host && (
        <footer className="glass mt-5 flex flex-wrap gap-2 rounded-[20px] p-3">
          <Link to="/profile/$id" params={{ id: host.id }} className="chip min-h-11 gap-1.5">
            <User className="size-4" />
            <span>Profile</span>
          </Link>
          <a
            href={`https://instagram.com/${host.instagram.replace(/^@/, "")}`}
            target="_blank"
            rel="noreferrer"
            className="chip min-h-11 gap-1.5"
          >
            <Instagram className="size-4" />
            <span>Instagram</span>
          </a>
          <a
            href={`https://tiktok.com/@${host.tiktok.replace(/^@/, "")}`}
            target="_blank"
            rel="noreferrer"
            className="chip min-h-11 gap-1.5"
          >
            <Music2 className="size-4" />
            <span>TikTok</span>
          </a>
        </footer>
      )}
    </div>
  );
}