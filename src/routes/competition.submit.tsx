import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ChevronLeft, ImagePlus, X } from "@/components/PixelIcons";
import {
  COMP_BRIEF,
  type CompTeam,
  useMyTeam,
  useSoloEntry,
} from "@/lib/competition";
import { CREATIVES } from "@/lib/data";
import { filesToMedia } from "@/lib/media";
import { ONBOARDING_KEY, avatarOf, useLocal, useMyProfile, type Onboarding } from "@/lib/store";

export const Route = createFileRoute("/competition/submit")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Submit your idea — GET NAMED" },
      { name: "description", content: "Submit your GET NAMED competition entry." },
      { property: "og:title", content: "Submit your idea — GET NAMED" },
      { property: "og:description", content: "Submit your GET NAMED competition entry." },
    ],
  }),
  component: SubmitIdeaPage,
});

function SubmitIdeaPage() {
  const navigate = useNavigate();
  const [myTeam, setMyTeam, teamReady] = useMyTeam();
  const [soloEntry, setSoloEntry] = useSoloEntry();
  const [profile] = useMyProfile();
  const [onboarding] = useLocal<Onboarding>(ONBOARDING_KEY, {
    name: "",
    email: "",
    location: "",
    intent: "",
    done: false,
  });

  const [mode, setMode] = useState<"solo" | "team">("solo");
  const [title, setTitle] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [text, setText] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (teamReady && myTeam) setMode("team");
  }, [teamReady, myTeam]);

  async function handleFiles(files: FileList | null) {
    if (!files || !files.length) return;
    const remaining = Math.max(0, 3 - images.length);
    if (remaining === 0) return;
    const { media, skipped } = await filesToMedia(Array.from(files).slice(0, remaining));
    const imgs = media.filter((m) => m.type === "image").map((m) => m.src);
    if (skipped > 0) toast("Some files were skipped (images only)");
    if (imgs.length) setImages((prev) => [...prev, ...imgs].slice(0, 3));
    if (fileRef.current) fileRef.current.value = "";
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cleanTitle = title.trim();
    const cleanText = text.trim();
    if (!cleanTitle) {
      toast("Give your idea a title");
      return;
    }
    if (!cleanText) {
      toast("Describe your idea in a few lines");
      return;
    }
    const fallback = CREATIVES[0]!;
    const finalImages = images.length
      ? images
      : [fallback.cover, fallback.work[0] ?? fallback.cover, fallback.work[1] ?? fallback.cover];

    if (mode === "team" && myTeam) {
      const updated: CompTeam = {
        ...myTeam,
        entry: { title: cleanTitle, text: cleanText, images: finalImages },
      };
      if (!setMyTeam(updated)) {
        toast("Storage full — try removing an image or using smaller photos");
        return;
      }
    } else {
      const myName = onboarding.name.trim() || "You";
      const myRole = profile.discipline.trim() || "Creative";
      const solo: CompTeam = {
        id: soloEntry?.id ?? "my-solo",
        name: `${myName} (Solo)`,
        size: 1,
        members: [{ id: "me", name: myName, role: myRole, avatar: avatarOf(profile), lead: true }],
        openSpots: [],
        pitch: cleanText,
        listed: false,
        isMine: true,
        isSolo: true,
        boardImages: [finalImages[0] ?? fallback.cover, finalImages[1] ?? fallback.cover],
        entry: { title: cleanTitle, text: cleanText, images: finalImages },
      };
      if (!setSoloEntry(solo)) {
        toast("Storage full — try removing an image or using smaller photos");
        return;
      }
    }

    toast("Entry submitted! Now cast your daily votes.");
    navigate({ to: "/competition/vote" });
  }

  return (
    <div className="flex flex-1 flex-col px-4 pb-8 pt-5">
      <header className="flex items-center gap-3">
        <Link to="/competition/join" className="icon-btn" aria-label="Back to join options">
          <ChevronLeft className="size-5" />
        </Link>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--pink)]">Step 3 of 3</p>
          <h1 className="text-2xl font-bold uppercase tracking-wide">SUBMIT YOUR IDEA</h1>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="mt-5 flex flex-1 flex-col gap-5">
        <div
          className="rounded-2xl border border-[var(--pink)]/30 p-4"
          style={{ background: "rgba(74, 33, 64, 0.35)" }}
        >
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--pink)]">
            This round&apos;s brief
          </p>
          <p className="mt-1.5 text-sm text-white/90">{COMP_BRIEF}</p>
        </div>

        <div>
          <span className="block text-xs text-white/75">Entering as</span>
          <div className="glass mt-1.5 grid grid-cols-2 rounded-full p-1" role="group" aria-label="Entering as">
            <button
              type="button"
              aria-pressed={mode === "solo"}
              onClick={() => setMode("solo")}
              className={`min-h-11 rounded-full text-sm transition ${
                mode === "solo"
                  ? "bg-[var(--pink)] font-bold text-black"
                  : "text-white/75 hover:text-foreground"
              }`}
            >
              Solo
            </button>
            <button
              type="button"
              disabled={!myTeam}
              aria-pressed={mode === "team"}
              onClick={() => myTeam && setMode("team")}
              className={`min-h-11 truncate rounded-full px-3 text-sm transition disabled:opacity-40 ${
                mode === "team"
                  ? "bg-[var(--pink)] font-bold text-black"
                  : "text-white/75 hover:text-foreground"
              }`}
            >
              {myTeam ? myTeam.name : "No team yet"}
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="idea-title" className="block text-xs text-white/75">
            Idea title
          </label>
          <input
            id="idea-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Give your idea a name"
            maxLength={60}
            className="field mt-1.5 w-full"
          />
        </div>

        <div>
          <span className="block text-xs text-white/75">Images (up to 3)</span>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => void handleFiles(e.target.files)}
            className="hidden"
          />
          <div className="mt-2 grid grid-cols-3 gap-2.5">
            {[0, 1, 2].map((slot) => {
              const src = images[slot];
              if (src) {
                return (
                  <div key={slot} className="relative aspect-square overflow-hidden rounded-2xl border border-white/20">
                    <img src={src} alt={`Idea upload ${slot + 1}`} className="size-full object-cover" />
                    <button
                      type="button"
                      aria-label={`Remove image ${slot + 1}`}
                      onClick={() => setImages((prev) => prev.filter((_, i) => i !== slot))}
                      className="absolute right-1 top-1 flex size-7 items-center justify-center rounded-full bg-black/80 text-white"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                );
              }
              return (
                <button
                  key={slot}
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-2xl border border-dashed border-white/25 bg-white/[0.03] text-xs text-[var(--pink)] transition hover:border-[var(--pink)]/60"
                >
                  {slot === 0 && <ImagePlus className="size-5" active />}
                  <span>Add</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label htmlFor="idea-text" className="block text-xs text-white/75">
            The idea in a few lines
          </label>
          <textarea
            id="idea-text"
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What is it, who is it for, how does it show NAMED?"
            maxLength={320}
            className="field mt-1.5 w-full resize-none"
          />
        </div>

        <div className="mt-auto pt-4">
          <button type="submit" className="btn btn-primary w-full">
            Submit entry
          </button>
        </div>
      </form>
    </div>
  );
}