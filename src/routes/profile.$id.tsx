import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Heart, MapPin, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { BackButton } from "@/components/TopBar";
import { ContactSheet } from "@/components/ContactSheet";
import { getCreative } from "@/lib/data";
import { useSaved } from "@/lib/store";

export const Route = createFileRoute("/profile/$id")({
  loader: ({ params }) => {
    const c = getCreative(params.id);
    if (!c) throw notFound();
    return c;
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.name} — ${loaderData.role}, ${loaderData.city} · NAMED` },
          { name: "description", content: loaderData.bio },
          { property: "og:title", content: `${loaderData.name} · NAMED Collective` },
          { property: "og:description", content: loaderData.bio },
          { property: "og:image", content: loaderData.cover },
          { name: "twitter:image", content: loaderData.cover },
        ]
      : [{ title: "Unavailable — NAMED" }, { name: "robots", content: "noindex" }],
  }),
  notFoundComponent: () => (
    <div className="p-8 text-center">
      <p className="font-semibold">This creative has wandered off.</p>
      <Link to="/search" className="link-u mt-2 inline-block">Back to search</Link>
    </div>
  ),
  component: ProfilePage,
});

type Tab = "Work" | "About" | "Reviews";

function ProfilePage() {
  const c = Route.useLoaderData();
  const { isSaved, toggle } = useSaved();
  const saved = isSaved(c.id);
  const [tab, setTab] = useState<Tab>("Work");
  const [open, setOpen] = useState(false);
  const firstProject = c.projects[0];

  return (
    <div className="pb-8">
      <div className="relative aspect-[2/1] w-full bg-muted">
        <img src={c.cover} alt={`${c.name} cover`} className="size-full object-cover" />
        <BackButton className="absolute left-4 top-4" />
        <button aria-label="More" onClick={() => toast("Report & share coming soon")} className="absolute right-4 top-4 flex size-11 items-center justify-center rounded-full border border-foreground bg-background">
          <MoreHorizontal className="size-5" />
        </button>
      </div>
      <div className="px-4">
        <img src={c.avatar} alt={c.name} className="-mt-11 size-[88px] rounded-full border-2 border-background bg-muted object-cover" />
        <h1 className="mt-3 text-2xl font-semibold">{c.name}</h1>
        <p className="text-sm text-muted-foreground">{c.role} · {c.city}</p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {c.tags.map((t) => <li key={t} className="tag">{t}</li>)}
        </ul>
        <p className="mt-4 text-sm leading-relaxed">{c.bio}</p>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <button className="btn btn-primary" onClick={() => setOpen(true)}>Contact</button>
          <button
            className="btn btn-secondary"
            aria-pressed={saved}
            onClick={() => { toggle(c.id); toast(saved ? "Removed from saved" : "Saved to your collective"); }}
          >
            <Heart className="size-4" fill={saved ? "currentColor" : "none"} /> {saved ? "Saved" : "Save"}
          </button>
        </div>
      </div>

      <div role="tablist" className="mt-6 flex gap-6 border-b border-muted px-4">
        {(["Work", "About", "Reviews"] as Tab[]).map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={`min-h-11 border-b-2 text-sm uppercase tracking-widest ${tab === t ? "border-foreground font-semibold" : "border-transparent text-muted-foreground"}`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Work" && (
        <div className="mt-4 px-4">
          <div className="grid grid-cols-2 gap-px bg-muted">
            {c.work.map((src, i) => (
              <Link key={src} to="/project/$id" params={{ id: c.projects[i % c.projects.length].id }} className="aspect-square bg-muted">
                <img src={src} alt={`${c.name} work ${i + 1}`} loading="lazy" className="size-full object-cover transition-opacity hover:opacity-85" />
              </Link>
            ))}
          </div>
          <h2 className="mt-6 text-sm font-semibold uppercase tracking-widest">Projects</h2>
          <ul className="mt-2">
            {c.projects.map((p) => (
              <li key={p.id}>
                <Link to="/project/$id" params={{ id: p.id }} className="flex min-h-14 items-center justify-between border-b border-muted py-2 hover:bg-muted">
                  <span className="font-semibold">{p.title}</span>
                  <span className="text-xs text-muted-foreground">{p.year} · {p.style}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
      {tab === "About" && (
        <div className="mt-4 space-y-2 px-4 text-sm">
          <p>{c.bio}</p>
          <p className="text-muted-foreground">Based in {c.neighbourhood}, {c.city}. Books via Instagram.</p>
          {firstProject && <p className="text-muted-foreground">Signature: {firstProject.style}.</p>}
        </div>
      )}
      {tab === "Reviews" && (
        <ul className="mt-4 space-y-3 px-4">
          {c.reviews.map((r) => (
            <li key={r.text} className="rounded-md border border-line p-3 text-sm">
              <p>“{r.text}”</p>
              <p className="mt-1 text-xs text-muted-foreground">— {r.by}</p>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-8 px-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest">Location</h2>
        <div className="relative mt-2 flex aspect-[2/1] items-center justify-center overflow-hidden rounded-md border border-line bg-muted">
          <svg className="absolute inset-0 size-full" aria-hidden>
            <defs>
              <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
                <path d="M24 0H0V24" fill="none" className="stroke-line" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
          <span className="absolute size-24 rounded-full border border-dashed border-foreground" />
          <span className="relative flex items-center gap-1 rounded-full border border-foreground bg-background px-3 py-1 text-xs font-semibold uppercase tracking-widest">
            <MapPin className="size-3.5" /> {c.neighbourhood}, {c.city}
          </span>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">Neighbourhood only — never an exact address.</p>
      </div>

      <ContactSheet creative={c} open={open} onOpenChange={setOpen} />
    </div>
  );
}
