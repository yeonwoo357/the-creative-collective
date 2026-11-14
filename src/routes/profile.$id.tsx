import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Bookmark, MapPin, MoreHorizontal, Send } from "@/components/PixelIcons";
import { toast } from "sonner";
import { BackButton } from "@/components/TopBar";
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
          { property: "og:type", content: "website" },
          { name: "twitter:card", content: "summary_large_image" },
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
      <Link to="/search" className="link-u mt-2 inline-block">
        Back to search
      </Link>
    </div>
  ),
  component: ProfilePage,
});

type Tab = "Work" | "About" | "Reviews";

/* Liquid-glass bento tile, tinted with the app's pink → plum accent */
const SILVER =
  "glass rounded-[28px] bg-[radial-gradient(140%_80%_at_15%_0%,rgb(248_188_255/0.18),transparent_60%),linear-gradient(160deg,rgb(255_255_255/0.12),rgb(173_93_132/0.12))]";

function ProfilePage() {
  const c = Route.useLoaderData();
  const { isSaved, toggle } = useSaved();
  const saved = isSaved(c.id);
  const [tab, setTab] = useState<Tab>("Work");
  const navigate = useNavigate();
  const firstProject = c.projects[0];
  const contact = () => navigate({ to: "/compose/$id", params: { id: c.id } });

  return (
    <div className="space-y-2 bg-[radial-gradient(120%_60%_at_50%_0%,#2a1426_0%,#0c070c_55%,#000_100%)] px-2 pb-8 pt-2">
      {/* Header card */}
      <section className="relative overflow-hidden rounded-[36px] border border-white/12 bg-[linear-gradient(180deg,#2a1a28_0%,#140c14_70%,#0a060a_100%)] px-5 pb-5 pt-4 shadow-[inset_0_1px_0_rgb(255_255_255/0.12)]">
        <div className="flex items-center justify-between">
          <BackButton />
          <button
            aria-label="More"
            onClick={() => toast("Report & share coming soon")}
            className="icon-btn"
          >
            <MoreHorizontal className="size-[18px]" />
          </button>
        </div>
        <div className="-mt-2 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <p className="text-center">
            <span className="block text-2xl">{c.work.length}</span>
            <span className="text-xs text-white/60">works</span>
          </p>
          <div className="rounded-full p-[3px] shadow-[0_0_0_1px_rgb(255_255_255/0.5),0_0_30px_rgb(255_255_255/0.08)]">
            <img
              src={c.avatar}
              alt={c.name}
              className="size-28 rounded-full border-2 border-white/80 bg-muted object-cover"
            />
          </div>
          <p className="text-center">
            <span className="block text-2xl">{c.reviews.length}</span>
            <span className="text-xs text-white/60">reviews</span>
          </p>
        </div>
        <h1 className="mt-4 text-center text-2xl font-normal">{c.name}</h1>
        <p className="mt-1 text-center text-sm text-white/70">
          {c.role} · {c.neighbourhood}, {c.city}
        </p>
        <ul
          className="mt-2 flex flex-wrap justify-center gap-x-2 text-xs text-white/60"
          aria-label="Styles"
        >
          {c.tags.map((t, i) => (
            <li key={t} className="flex items-center gap-2">
              {i > 0 && <span aria-hidden="true">|</span>}
              {t}
            </li>
          ))}
        </ul>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <button className="btn btn-secondary" onClick={contact}>
            <Send className="size-4" /> Contact
          </button>
          <button
            className="btn btn-secondary"
            aria-pressed={saved}
            onClick={() => {
              toggle(c.id);
              toast(saved ? "Removed from saved" : "Saved to your collective");
            }}
          >
            <Bookmark className="size-4" fill={saved ? "currentColor" : "none"} />{" "}
            {saved ? "Saved" : "Save"}
          </button>
        </div>
      </section>

      {/* Bento: bio + cover/location */}
      <div className="grid grid-cols-2 gap-2">
        <section className={`${SILVER} flex flex-col items-center p-4 text-center`}>
          <img
            src={c.avatar}
            alt=""
            className="size-12 rounded-full border-2 border-white/80 object-cover"
          />
          <p className="mt-2 text-sm">{c.name}</p>
          <p className="mt-1 line-clamp-4 text-xs text-white/75">{c.bio}</p>
          <button onClick={contact} className="btn btn-primary mt-3 min-h-11 w-full text-xs">
            Contact
          </button>
        </section>
        <section className="relative min-h-[220px] overflow-hidden rounded-[28px] border border-white/40">
          <img
            src={c.cover}
            alt={`${c.name} cover`}
            className="absolute inset-0 size-full object-cover"
          />
          <span className="glass absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1 whitespace-nowrap rounded-full bg-black/40 px-3 py-1 text-xs">
            <MapPin className="size-3.5" /> {c.neighbourhood}
          </span>
        </section>
      </div>

      {/* Wide card: latest project */}
      {firstProject && (
        <Link
          to="/project/$id"
          params={{ id: firstProject.id }}
          className={`${SILVER} flex items-stretch gap-3 overflow-hidden p-3`}
        >
          <div className="flex flex-1 flex-col justify-center pl-2">
            <span className="text-xs text-white/65">✦ Latest project</span>
            <span className="mt-1 text-lg">{firstProject.title}</span>
            <span className="mt-1 text-xs text-white/65">
              {firstProject.year} · {firstProject.style}
            </span>
          </div>
          {c.work[0] && (
            <img src={c.work[0]} alt="" className="size-28 rounded-[20px] object-cover" />
          )}
        </Link>
      )}

      {/* Tabs */}
      <div role="tablist" className="glass mt-3 grid grid-cols-3 gap-1 rounded-full p-1">
        {(["Work", "About", "Reviews"] as Tab[]).map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={`min-h-10 rounded-full text-sm ${tab === t ? "bg-white text-black" : "text-white/70 hover:text-white"}`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Work" && (
        <div className="pt-1">
          {/* Instagram-style feed */}
          <div className="grid grid-cols-3 gap-0.5 overflow-hidden rounded-[22px]">
            {c.work.map((src, i) => (
              <Link
                key={src}
                to="/project/$id"
                params={{ id: c.projects[i % c.projects.length]?.id ?? "" }}
                className="aspect-square bg-muted"
              >
                <img
                  src={src}
                  alt={`${c.name} work ${i + 1}`}
                  loading="lazy"
                  className="size-full object-cover transition-opacity hover:opacity-85"
                />
              </Link>
            ))}
          </div>
          <h2 className="label mt-6 px-2 text-white/70">Projects</h2>
          <ul className="mt-2 space-y-2">
            {c.projects.map((p) => (
              <li key={p.id}>
                <Link
                  to="/project/$id"
                  params={{ id: p.id }}
                  className="glass flex min-h-14 items-center justify-between rounded-[20px] px-4 py-2 hover:bg-white/12"
                >
                  <span>{p.title}</span>
                  <span className="text-xs text-white/60">
                    {p.year} · {p.style}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
      {tab === "About" && (
        <div className="glass space-y-2 rounded-[24px] p-4 text-sm">
          <p>{c.bio}</p>
          <p className="text-white/65">
            Based in {c.neighbourhood}, {c.city}. Books via Instagram.
          </p>
          {firstProject && <p className="text-white/65">Signature: {firstProject.style}.</p>}
        </div>
      )}
      {tab === "Reviews" && (
        <ul className="space-y-2">
          {c.reviews.map((r) => (
            <li key={r.text} className="glass rounded-[24px] p-4 text-sm">
              <p>“{r.text}”</p>
              <p className="mt-1 text-xs text-white/60">— {r.by}</p>
            </li>
          ))}
        </ul>
      )}

      <section className="glass mt-4 rounded-[28px] p-4">
        <h2 className="label text-white/70">Location</h2>
        <div className="relative mt-3 flex aspect-[2/1] items-center justify-center overflow-hidden rounded-[20px] border border-white/15 bg-black/40">
          <svg className="absolute inset-0 size-full" aria-hidden>
            <defs>
              <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
                <path d="M24 0H0V24" fill="none" stroke="rgb(255 255 255 / 0.12)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
          <span className="absolute size-24 rounded-full border border-dashed border-[var(--pink)] shadow-[0_0_30px_rgb(248_188_255/0.25)]" />
          <span className="glass relative flex items-center gap-1 rounded-full px-3 py-1 text-xs">
            <MapPin className="size-3.5" /> {c.neighbourhood}, {c.city}
          </span>
        </div>
        <p className="mt-2 text-xs text-white/60">Neighbourhood only — never an exact address.</p>
      </section>
    </div>
  );
}
