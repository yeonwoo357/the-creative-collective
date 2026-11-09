import { createFileRoute, Link } from "@tanstack/react-router";
import { Bookmark } from "@/components/PixelIcons";
import { BackButton } from "@/components/TopBar";
import { creatives } from "@/lib/data";
import { useSaved } from "@/lib/store";

export const Route = createFileRoute("/saved")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Saved — NAMED Collective" },
      { name: "description", content: "The creatives you've saved to your collective." },
      { property: "og:title", content: "Saved — NAMED Collective" },
      { property: "og:description", content: "The creatives you've saved to your collective." },
    ],
  }),
  component: SavedPage,
});

function SavedPage() {
  const { saved, toggle, ready } = useSaved();
  const list = creatives.filter((c) => saved.includes(c.id));
  return (
    <div className="flex-1">
      <div className="flex items-center gap-2 px-4 pt-4"><BackButton className="border-0" /><h1 className="text-2xl font-semibold uppercase tracking-wide">Saved</h1></div>
      {ready && list.length === 0 ? (
        <div className="px-4 py-16 text-center">
          <p className="font-semibold">Nothing saved yet.</p>
          <p className="mt-1 text-sm text-muted-foreground">Tap Save on a profile and they'll live here.</p>
          <Link to="/search" className="btn btn-primary mt-6">Find someone</Link>
        </div>
      ) : (
        <ul>
          {list.map((c) => (
            <li key={c.id} className="flex items-center border-b border-muted pr-2">
              <Link to="/profile/$id" params={{ id: c.id }} className="flex min-h-16 flex-1 items-center gap-3 px-4 py-3 hover:bg-muted">
                <img src={c.avatar} alt="" className="size-11 rounded-full object-cover" />
                <span>
                  <span className="block font-semibold">{c.name}</span>
                  <span className="block text-xs text-muted-foreground">{c.role} · {c.neighbourhood}, {c.city}</span>
                </span>
              </Link>
              <button aria-label={`Unsave ${c.name}`} onClick={() => toggle(c.id)} className="flex size-11 items-center justify-center">
                <Bookmark className="size-5" fill="currentColor" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
