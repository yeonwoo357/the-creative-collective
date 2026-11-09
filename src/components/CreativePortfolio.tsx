import { Link } from "@tanstack/react-router";
import { Bookmark, Instagram, MapPin, Music2 } from "@/components/PixelIcons";
import { Portfolio } from "@/components/Portfolio";
import type { Creative } from "@/lib/data";
import { useSaved } from "@/lib/store";
import { toast } from "sonner";

/** A creative's full collective, embedded in chat without a Contact action. */
export function CreativePortfolio({ creative: c }: { creative: Creative }) {
  const { isSaved, toggle } = useSaved();
  const saved = isSaved(c.id);
  const media = c.work.map((src) => ({ src, type: "image" as const }));
  const firstProject = c.projects[0];

  return (
    <div className="pb-8">
      <div className="aspect-[2/1] w-full bg-muted">
        <img src={c.cover} alt={`${c.name} cover`} className="size-full object-cover" />
      </div>

      <div className="px-4">
        <img
          src={c.avatar}
          alt={c.name}
          className="relative -mt-11 size-[88px] rounded-full border-2 border-background bg-muted object-cover"
        />
        <h2 className="mt-3 text-2xl font-semibold">{c.name}</h2>
        <p className="text-sm text-muted-foreground">{c.role} · {c.neighbourhood}, {c.city}</p>
        <ul className="mt-3 flex flex-wrap gap-2" aria-label="Styles">
          {c.tags.map((tag) => <li key={tag} className="tag">{tag}</li>)}
        </ul>
        <p className="mt-4 text-sm leading-relaxed">{c.bio}</p>
        <button
          className="btn btn-secondary mt-5 w-full"
          aria-pressed={saved}
          onClick={() => {
            toggle(c.id);
            toast(saved ? "Removed from saved" : "Saved to your collective");
          }}
        >
          <Bookmark className="size-4" active={saved} /> {saved ? "Saved" : "Save"}
        </button>
      </div>

      <section className="mt-7 px-4" aria-labelledby="chat-portfolio-work">
        <div className="flex items-center justify-between gap-3">
          <h3 id="chat-portfolio-work" className="label">Portfolio</h3>
          <span className="text-xs uppercase tracking-widest text-muted-foreground">{c.layout} view</span>
        </div>
        <div className="mt-3">
          <Portfolio media={media} layout={c.layout} name={c.name} largeTargets />
        </div>
        <h3 className="label mt-6">Projects</h3>
        <ul className="mt-2">
          {c.projects.map((project) => (
            <li key={project.id}>
              <Link
                to="/project/$id"
                params={{ id: project.id }}
                className="flex min-h-14 items-center justify-between gap-3 border-b border-muted py-2 hover:bg-muted"
              >
                <span className="font-semibold">{project.title}</span>
                <span className="shrink-0 text-xs text-muted-foreground">{project.year} · {project.style}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-7 px-4" aria-labelledby="chat-portfolio-about">
        <h3 id="chat-portfolio-about" className="label">About</h3>
        <p className="mt-3 text-sm leading-relaxed">{c.bio}</p>
        <p className="mt-2 text-sm text-muted-foreground">Based in {c.neighbourhood}, {c.city}. Books via Instagram.</p>
        {firstProject && <p className="mt-1 text-sm text-muted-foreground">Signature: {firstProject.style}.</p>}
      </section>

      <section className="mt-7 px-4" aria-labelledby="chat-portfolio-socials">
        <h3 id="chat-portfolio-socials" className="label">Socials</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          <a
            className="tag min-h-11 gap-2"
            href={`https://instagram.com/${c.instagram}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open ${c.name} on Instagram`}
          >
            <Instagram className="size-4" /> @{c.instagram}
          </a>
          <a
            className="tag min-h-11 gap-2"
            href={`https://tiktok.com/@${c.tiktok}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open ${c.name} on TikTok`}
          >
            <Music2 className="size-4" /> @{c.tiktok}
          </a>
        </div>
      </section>

      <section className="mt-7 px-4" aria-labelledby="chat-portfolio-reviews">
        <h3 id="chat-portfolio-reviews" className="label">Reviews</h3>
        <ul className="mt-3 space-y-3">
          {c.reviews.map((review) => (
            <li key={review.text} className="rounded-md border border-line p-3 text-sm">
              <p>“{review.text}”</p>
              <p className="mt-1 text-xs text-muted-foreground">— {review.by}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-7 px-4" aria-labelledby="chat-portfolio-location">
        <h3 id="chat-portfolio-location" className="label">Location</h3>
        <div className="relative mt-3 flex aspect-[2/1] items-center justify-center overflow-hidden rounded-md border border-line bg-muted">
          <svg className="absolute inset-0 size-full" aria-hidden="true">
            <defs>
              <pattern id={`chat-location-grid-${c.id}`} width="24" height="24" patternUnits="userSpaceOnUse">
                <path d="M24 0H0V24" fill="none" className="stroke-line" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#chat-location-grid-${c.id})`} />
          </svg>
          <span className="absolute size-24 rounded-full border border-dashed border-foreground" />
          <span className="relative flex items-center gap-1 rounded-full border border-foreground bg-background px-3 py-1 text-xs font-semibold uppercase tracking-widest">
            <MapPin className="size-3.5" /> {c.neighbourhood}, {c.city}
          </span>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">Neighbourhood only — never an exact address.</p>
      </section>
    </div>
  );
}
