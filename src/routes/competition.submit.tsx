import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { CompHeader } from "@/components/CompetitionUI";
import { ImagePlus, X } from "@/components/PixelIcons";
import { COMP_KEY, COMPETITION, getTeam, useCompetition } from "@/lib/competition";
import { filesToMedia } from "@/lib/media";
import { writeLocal } from "@/lib/store";

export const Route = createFileRoute("/competition/submit")({
  head: () => ({
    meta: [
      { title: "Submit your idea — Get Named" },
      {
        name: "description",
        content: "Send your Get Named idea: a title, a few images and a short pitch.",
      },
    ],
  }),
  component: SubmitPage,
});

const MAX_IMAGES = 3;

function SubmitPage() {
  const [comp] = useCompetition();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState(comp.entry?.title ?? "");
  const [text, setText] = useState(comp.entry?.text ?? "");
  const [images, setImages] = useState<string[]>(comp.entry?.images ?? []);
  const teamName = comp.team?.name ?? getTeam(comp.applied[0] ?? "")?.name;
  const [asTeam, setAsTeam] = useState(
    comp.mode === "team" || (!!teamName && comp.mode !== "solo"),
  );

  const pick = async (files: FileList | null) => {
    if (!files) return;
    const { media, skipped } = await filesToMedia(files);
    const pics = media.filter((m) => m.type === "image").map((m) => m.src);
    setImages((cur) => [...cur, ...pics].slice(0, MAX_IMAGES));
    if (skipped || media.length > pics.length) toast("Only images can go in an entry");
  };

  const submit = () => {
    if (!title.trim() || !text.trim()) {
      toast("Add a title and a few lines about the idea");
      return;
    }
    const next = {
      ...comp,
      mode: asTeam && teamName ? ("team" as const) : ("solo" as const),
      entry: { title: title.trim(), text: text.trim(), images },
    };
    // writeLocal tells us when the images don't fit in storage.
    if (!writeLocal(COMP_KEY, next)) {
      toast("Couldn't save: storage is full. Try fewer or smaller images.");
      return;
    }
    toast("Entry sent. Voting is open in the app");
    navigate({ to: "/competition/vote" });
  };

  return (
    <div className="flex flex-1 flex-col gap-4 pb-8">
      <CompHeader title="Submit your idea" step="Step 3 of 3" />
      <div className="flex flex-col gap-4 px-4">
        <div className="rounded-[20px] border border-[var(--pink)]/40 bg-[var(--plum)]/45 px-4 py-3">
          <p className="text-xs font-bold uppercase text-[var(--pink)]">This round's brief</p>
          <p className="mt-1 text-sm">{COMPETITION.brief}</p>
        </div>

        {teamName && (
          <div>
            <p className="mb-1.5 text-xs text-white/65" id="as-label">
              Entering as
            </p>
            <div
              role="radiogroup"
              aria-labelledby="as-label"
              className="glass grid grid-cols-[1fr_1.6fr] gap-1 rounded-full p-1"
            >
              <button
                role="radio"
                aria-checked={!asTeam}
                onClick={() => setAsTeam(false)}
                className={`min-h-11 rounded-full text-sm ${!asTeam ? "btn-primary" : "text-white/65"}`}
              >
                Solo
              </button>
              <button
                role="radio"
                aria-checked={asTeam}
                onClick={() => setAsTeam(true)}
                className={`min-h-11 truncate rounded-full px-2 text-sm ${asTeam ? "btn-primary" : "text-white/65"}`}
              >
                {teamName}
              </button>
            </div>
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-xs text-white/65" htmlFor="idea-title">
            Idea title
          </label>
          <input
            id="idea-title"
            className="field"
            value={title}
            maxLength={40}
            placeholder="Give your idea a name"
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <p className="mb-1.5 text-xs text-white/65">Images · up to {MAX_IMAGES}</p>
          <div className="grid grid-cols-3 gap-2">
            {images.map((src, i) => (
              <div key={i} className="relative h-[84px]">
                <img
                  src={src}
                  alt={`Image ${i + 1}`}
                  className="h-full w-full rounded-2xl object-cover"
                />
                <button
                  aria-label={`Remove image ${i + 1}`}
                  onClick={() => setImages(images.filter((_, k) => k !== i))}
                  className="icon-btn absolute right-1 top-1 size-7"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            ))}
            {images.length < MAX_IMAGES && (
              <button
                onClick={() => fileRef.current?.click()}
                className="flex h-[84px] flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-[var(--pink)]/50 bg-[var(--pink)]/5 text-xs text-[var(--pink)]"
              >
                <ImagePlus className="size-5" /> Add
              </button>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              void pick(e.target.files);
              e.target.value = "";
            }}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs text-white/65" htmlFor="idea-text">
            The idea in a few lines
          </label>
          <textarea
            id="idea-text"
            className="field min-h-24 resize-none py-3"
            value={text}
            maxLength={300}
            placeholder="What is it, who is it for, how does it show NAMED?"
            onChange={(e) => setText(e.target.value)}
          />
        </div>
      </div>
      <div className="mt-auto px-4">
        <button className="btn btn-primary w-full" onClick={submit}>
          {comp.entry ? "Update entry" : "Submit entry"}
        </button>
      </div>
    </div>
  );
}
