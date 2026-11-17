import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Bookmark, MapPin, Check, Send } from "@/components/PixelIcons";
import { toast } from "sonner";
import { BackButton } from "@/components/TopBar";
import { getCreative, creatives, altOf, hoodCoords, distanceKm, isVerified } from "@/lib/data";
import { useSaved, pushRecent, useMyProfile, useLocal, ONBOARDING_KEY, type Onboarding } from "@/lib/store";

import { Button } from "@/components/ui/button";
import { SwipeRow } from "@/components/SwipeRow";
import { NeighbourhoodMap } from "@/components/NeighbourhoodMap";
import { SAMPLE_SERVICES, SAMPLE_COLLABS } from "@/lib/discovery";

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

type Tab = "Works" | "Reviews";

function ProfilePage() {
  const c = Route.useLoaderData();
  const { isSaved, toggle } = useSaved();
  const saved = isSaved(c.id);
  const [tab, setTab] = useState<Tab>("Works");
  const [details, setDetails] = useState<"Collabs" | "Services" | null>(null);
  const [mine] = useMyProfile();
  const [ob] = useLocal<Onboarding | null>(ONBOARDING_KEY, null);
  const km = Math.round(distanceKm(hoodCoords(mine.neighbourhood, ob?.location || "London"), hoodCoords(c.neighbourhood, c.city)));
  useEffect(() => { pushRecent(c.id); }, [c.id]);

  return <div className="min-w-0 flex-1 pb-8">
    <header className="profile-map-header">
      <NeighbourhoodMap neighbourhood={c.neighbourhood} city={c.city} />
      <div className="relative z-10 flex items-start justify-between p-3">
        <BackButton />
        <div className="flex gap-2">
          <Button variant="ghost" className="glass size-11 rounded-full p-0" aria-label={saved ? `Unsave ${c.name}` : `Save ${c.name}`} aria-pressed={saved} onClick={() => { toggle(c.id); toast(saved ? "Removed from saved" : "Saved to your collective"); }}><Bookmark active={saved} /></Button>
          <Button asChild variant="ghost" className="glass size-11 rounded-full p-0"><Link to="/compose/$id" params={{ id: c.id }} aria-label={`Message ${c.name}`}><Send /></Link></Button>
        </div>
      </div>
      <section className="profile-identity relative z-10 mx-4 mb-5 mt-4 w-[82%] rounded-lg border p-4">
        <div className="flex items-start gap-3">
          <img src={c.avatar} alt={altOf(c.avatar) ?? c.name} className="size-12 shrink-0 rounded-full object-cover" />
          <div className="min-w-0">
            <h1 className="text-lg font-bold uppercase break-words">{c.name}</h1>
            <p className="break-all text-sm">@{c.instagram}</p>
            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="size-4 shrink-0" /><span>{c.neighbourhood} · ~{km} km away</span></p>
            <p className="text-xs text-muted-foreground">{c.city}</p>
          </div>
        </div>
        <p className="mt-4 break-words text-2xl font-bold uppercase">{c.role}</p>
        {isVerified(c.id) && <span className="mt-2 inline-flex items-center gap-1 text-xs" aria-label="Verified — mock badge"><Check className="size-4" /> Verified</span>}
      </section>
    </header>
    <div role="tablist" aria-label="Creative portfolio" className="grid grid-cols-2 border-y border-border">
      {(["Works", "Reviews"] as const).map((t) => <Button key={t} variant="ghost" id={`tab-${t}`} role="tab" aria-selected={tab === t} aria-controls="profile-panel" onClick={() => setTab(t)} className={`min-h-16 rounded-none text-2xl font-bold uppercase ${tab === t ? "profile-active-tab" : "text-muted-foreground"}`}>{t}</Button>)}
    </div>
    <div id="profile-panel" role="tabpanel" aria-labelledby={`tab-${tab}`} className="pt-4">
      {tab === "Works" ? <SwipeRow label="Works" centred>
        {c.work.map((src, i) => {
          const project = c.projects[i % c.projects.length];
          if (!project) return null;
          return <Link key={src} to="/project/$id" params={{ id: project.id }} className="swipe-card glass overflow-hidden rounded-lg">
            <div className="flex min-h-16 items-center gap-2 p-3"><img src={c.avatar} alt={altOf(c.avatar) ?? c.name} className="size-8 shrink-0 rounded-full object-cover" /><span className="text-sm font-bold">{project.title}</span></div>
            <img src={src} alt={altOf(src) ?? project.title} className="aspect-square w-full object-cover" />
          </Link>;
        })}
      </SwipeRow> : <SwipeRow label="Reviews" centred>
        {c.reviews.map((review, i) => {
          // Existing local creative photos stand in for fictional reviewers in this demo.
          const reviewer = creatives[(creatives.findIndex((person) => person.id === c.id) + i + 1) % creatives.length];
          return <article key={review.text} className="swipe-card glass min-h-72 rounded-lg p-4">
            <div className="flex items-center gap-3">{reviewer && <img src={reviewer.avatar} alt={altOf(reviewer.avatar) ?? "Reviewer avatar"} className="size-10 rounded-full object-cover" />}<h2 className="text-sm font-bold">{review.by}</h2></div>
            <p className="mt-6 text-lg">“{review.text}”</p>
          </article>;
        })}
      </SwipeRow>}
    </div>
    <div className="flex gap-2 px-4 pb-3" role="group" aria-label="Creative offers">
      {(["Collabs", "Services"] as const).map((value) => <Button key={value} variant="ghost" className="chip min-h-11" aria-pressed={details === value} aria-expanded={details === value} onClick={() => setDetails(details === value ? null : value)}>{value}</Button>)}
    </div>
    {details && <section aria-label={details} className="px-4 pb-4"><h2 className="label mb-2">{details}</h2><ul className="divide-y divide-border">{(details === "Services" ? SAMPLE_SERVICES[c.category] : SAMPLE_COLLABS[c.category]).map((item) => <li key={item} className="py-3 text-sm">{item}</li>)}</ul></section>}
    <p className="px-4 text-sm text-muted-foreground">{c.bio}</p>
  </div>;
}
