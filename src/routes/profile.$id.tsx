import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect } from "react";
import { getCreative } from "@/lib/data";
import { pushRecent } from "@/lib/store";
import { CreativePortfolio } from "@/components/CreativePortfolio";

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

function ProfilePage() {
  const c = Route.useLoaderData();
  useEffect(() => { pushRecent(c.id); }, [c.id]);
  return <CreativePortfolio key={c.id} creative={c} embedded={false} />;
}
