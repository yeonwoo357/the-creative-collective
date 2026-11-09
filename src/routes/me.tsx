import { createFileRoute, Link } from "@tanstack/react-router";
import { Bookmark, Globe, Instagram, Music2, Pencil, Settings, User } from "@/components/PixelIcons";
import { PageHeader } from "@/components/TopBar";
import { LayoutToggle, Portfolio } from "@/components/Portfolio";
import { ONBOARDING_KEY, PROFILE_KEY, avatarOf, useLocal, useMyProfile, useSaved, writeLocal, type Onboarding } from "@/lib/store";

export const Route = createFileRoute("/me")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Your collective — NAMED" },
      { name: "description", content: "Your NAMED Collective profile." },
      { property: "og:title", content: "Your collective — NAMED" },
      { property: "og:description", content: "Your NAMED Collective profile." },
    ],
  }),
  component: MePage,
});

function MePage() {
  const [ob] = useLocal<Onboarding | null>(ONBOARDING_KEY, null);
  const [p] = useMyProfile();
  const { saved } = useSaved();
  const name = ob?.name || "Bestie";
  const avatar = avatarOf(p);
  return (
    <div className="flex-1 pb-8">
      <PageHeader
        title="Profile"
        right={
          <Link to="/settings" aria-label="Settings" className="flex size-11 items-center justify-center rounded-full border border-foreground">
            <Settings className="size-5" />
          </Link>
        }
      />
      <div className="px-4">
        <div className="mt-4 flex items-center gap-4">
          {avatar ? (
            <img src={avatar} alt={name} className="size-20 rounded-full object-cover" />
          ) : (
            <span className="flex size-20 items-center justify-center rounded-full bg-muted"><User className="size-8" /></span>
          )}
          <div>
            <p className="text-xl font-semibold">{name}</p>
            <p className="text-sm text-muted-foreground">
              {[p.discipline, p.neighbourhood || ob?.location || "London"].filter(Boolean).join(" · ")}
            </p>
          </div>
        </div>
        {p.about && <p className="mt-4 text-sm leading-relaxed">{p.about}</p>}
        <div className="mt-3 flex flex-wrap gap-2">
          {p.instagram && <a className="tag gap-1 min-h-11" href={`https://instagram.com/${p.instagram}`} target="_blank" rel="noopener noreferrer"><Instagram className="size-3.5" /> @{p.instagram}</a>}
          {p.tiktok && <a className="tag gap-1 min-h-11" href={`https://tiktok.com/@${p.tiktok}`} target="_blank" rel="noopener noreferrer"><Music2 className="size-3.5" /> @{p.tiktok}</a>}
          {p.website && <a className="tag gap-1 min-h-11" href={p.website} target="_blank" rel="noopener noreferrer"><Globe className="size-3.5" /> Website</a>}
        </div>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <Link to="/edit-profile" className="btn btn-primary"><Pencil className="size-4" /> Edit profile</Link>
          <Link to="/saved" className="btn btn-secondary"><Bookmark className="size-4" /> {saved.length} saved</Link>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <h2 className="label">Portfolio</h2>
          <LayoutToggle value={p.layout} onChange={(layout) => writeLocal(PROFILE_KEY, { ...p, layout })} />
        </div>
        <p className="mt-1 text-xs text-muted-foreground">This is how visitors see it.</p>
        <div className="mt-3">
          {p.media.length ? (
            <Portfolio media={p.media} layout={p.layout} name={name} />
          ) : (
            <Link to="/edit-profile" className="flex aspect-[2/1] items-center justify-center rounded-md border border-dashed border-foreground text-xs uppercase tracking-widest">
              + Add your work
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
