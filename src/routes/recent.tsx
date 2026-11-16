import { altOf } from "@/lib/data";
import { createFileRoute, Link } from "@tanstack/react-router";
import { BackButton } from "@/components/TopBar";
import { getCreative } from "@/lib/data";
import { useRecent } from "@/lib/store";

export const Route = createFileRoute("/recent")({
  head: () => ({
    meta: [
      { title: "Recently viewed — NAMED Collective" },
      { name: "description", content: "Creatives you've looked at lately." },
      { property: "og:title", content: "Recently viewed — NAMED Collective" },
      { property: "og:description", content: "Creatives you've looked at lately." },
    ],
  }),
  component: RecentPage,
});

function RecentPage() {
  const { recent, clear, ready } = useRecent();
  const list = recent.map(getCreative).filter((c) => !!c);
  return (
    <div className="flex-1">
      <div className="flex items-center gap-2 px-4 pt-4">
        <BackButton />
        <h1 className="flex-1 text-2xl">Recently viewed</h1>
        {list.length > 0 && (
          <button
            type="button"
            onClick={clear}
            className="min-h-11 px-2 text-sm text-white/70 underline underline-offset-4"
          >
            Clear
          </button>
        )}
      </div>
      {ready && list.length === 0 ? (
        <div className="px-4 py-16 text-center">
          <p className="font-bold">Nothing here yet.</p>
          <p className="mt-1 text-sm text-muted-foreground">Profiles you open will show up here.</p>
          <Link to="/" className="btn btn-primary mt-6">
            Explore the globe
          </Link>
        </div>
      ) : (
        <ul className="mt-2">
          {list.map((c) => (
            <li key={c.id}>
              <Link
                to="/profile/$id"
                params={{ id: c.id }}
                className="flex min-h-16 items-center gap-3 border-b border-white/10 px-4 py-3 hover:bg-white/5"
              >
                <img src={c.avatar} alt={altOf(c.avatar) ?? ""} className="size-11 rounded-full object-cover" />
                <span>
                  <span className="block font-bold">{c.name}</span>
                  <span className="block text-xs text-muted-foreground">
                    {c.role} · {c.neighbourhood}, {c.city}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
