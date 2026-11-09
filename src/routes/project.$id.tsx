import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { BackButton } from "@/components/TopBar";
import { ContactSheet } from "@/components/ContactSheet";
import { getProject } from "@/lib/data";

export const Route = createFileRoute("/project/$id")({
  loader: ({ params }) => {
    const r = getProject(params.id);
    if (!r) throw notFound();
    return r;
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.project.title} by ${loaderData.creative.name} · NAMED` },
          { name: "description", content: loaderData.project.description },
          { property: "og:title", content: `${loaderData.project.title} · ${loaderData.creative.name}` },
          { property: "og:description", content: loaderData.project.description },
          { property: "og:image", content: loaderData.project.images[0] },
          { name: "twitter:image", content: loaderData.project.images[0] },
        ]
      : [{ title: "Unavailable — NAMED" }, { name: "robots", content: "noindex" }],
  }),
  notFoundComponent: () => (
    <div className="p-8 text-center">
      <p className="font-semibold">Project not found.</p>
      <Link to="/" className="link-u mt-2 inline-block">Back home</Link>
    </div>
  ),
  component: ProjectPage,
});

function ProjectPage() {
  const { creative, project } = Route.useLoaderData();
  const [idx, setIdx] = useState(0);
  const [open, setOpen] = useState(false);
  const track = useRef<HTMLDivElement>(null);

  const goTo = (i: number) => {
    track.current?.scrollTo({ left: i * track.current.clientWidth, behavior: "smooth" });
  };

  return (
    <div className="flex flex-1 flex-col pb-8">
      <div className="flex items-center justify-between px-4 py-3">
        <BackButton />
        <button aria-label="More" onClick={() => toast("Share coming soon")} className="flex size-11 items-center justify-center rounded-full border border-foreground">
          <MoreHorizontal className="size-5" />
        </button>
      </div>
      <div
        ref={track}
        className="flex aspect-square snap-x snap-mandatory overflow-x-auto bg-muted [scrollbar-width:none]"
        onScroll={(e) => setIdx(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
        aria-label="Project images"
      >
        {project.images.map((src, i) => (
          <img key={src} src={src} alt={`${project.title}, image ${i + 1} of ${project.images.length}`} className="size-full shrink-0 snap-center object-cover" />
        ))}
      </div>
      <div className="flex justify-center gap-1">
        {project.images.map((_, i) => (
          <button key={i} aria-label={`Image ${i + 1}`} aria-current={idx === i} onClick={() => goTo(i)} className="flex size-6 items-center justify-center">
            <span className={`size-1.5 rounded-full ${idx === i ? "bg-foreground" : "bg-line"}`} />
          </button>
        ))}
      </div>
      <div className="flex flex-1 flex-col px-4 pt-2">
        <h1 className="text-xl font-semibold">{project.title}</h1>
        <p className="text-sm text-muted-foreground">{project.year} · {project.style} · {project.placement}</p>
        <p className="mt-4 text-sm leading-relaxed">{project.description}</p>
        <Link to="/profile/$id" params={{ id: creative.id }} className="mt-4 flex min-h-11 items-center gap-2 text-sm">
          <img src={creative.avatar} alt="" className="size-8 rounded-full object-cover" />
          <span className="link-u">{creative.name}</span>
        </Link>
        <button className="btn btn-primary mt-8 w-full" onClick={() => setOpen(true)}>Contact</button>
      </div>
      <ContactSheet creative={creative} open={open} onOpenChange={setOpen} />
    </div>
  );
}
