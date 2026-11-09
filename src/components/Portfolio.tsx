import { useRef, useState } from "react";
import type { Media } from "@/lib/store";

export function MediaItem({ m, alt, className = "" }: { m: Media; alt: string; className?: string }) {
  return m.type === "video" ? (
    <video src={m.src} aria-label={alt} controls muted playsInline className={`object-cover ${className}`} />
  ) : (
    <img src={m.src} alt={alt} className={`object-cover ${className}`} />
  );
}

/** A portfolio shown the way its owner chose: swipeable carousel or square grid. */
export function Portfolio({ media, layout, name }: { media: Media[]; layout: "carousel" | "grid"; name: string }) {
  const track = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);
  if (!media.length) return null;
  if (layout === "grid")
    return (
      <div className="grid grid-cols-2 gap-px bg-muted">
        {media.map((m, i) => (
          <div key={i} className="aspect-square bg-muted">
            <MediaItem m={m} alt={`${name} work ${i + 1}`} className="size-full" />
          </div>
        ))}
      </div>
    );
  return (
    <div>
      <div
        ref={track}
        aria-label={`${name} portfolio`}
        className="flex aspect-square snap-x snap-mandatory overflow-x-auto bg-muted [scrollbar-width:none]"
        onScroll={(e) => setIdx(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
      >
        {media.map((m, i) => (
          <MediaItem key={i} m={m} alt={`${name} work ${i + 1} of ${media.length}`} className="size-full shrink-0 snap-center" />
        ))}
      </div>
      <div className="flex justify-center gap-1">
        {media.map((_, i) => (
          <button
            key={i}
            aria-label={`Item ${i + 1}`}
            aria-current={idx === i}
            onClick={() => track.current?.scrollTo({ left: i * track.current.clientWidth, behavior: "smooth" })}
            className="flex size-6 items-center justify-center"
          >
            <span className={`size-1.5 rounded-full ${idx === i ? "bg-foreground" : "bg-line"}`} />
          </button>
        ))}
      </div>
    </div>
  );
}

export function LayoutToggle({ value, onChange }: { value: "carousel" | "grid"; onChange: (v: "carousel" | "grid") => void }) {
  return (
    <div role="group" aria-label="Portfolio layout" className="flex gap-2">
      {(["carousel", "grid"] as const).map((v) => (
        <button key={v} type="button" className="chip" aria-pressed={value === v} onClick={() => onChange(v)}>
          {v === "carousel" ? "Carousel" : "Grid"}
        </button>
      ))}
    </div>
  );
}
