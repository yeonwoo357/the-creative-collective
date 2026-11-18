import { useId } from "react";
import { MapPin } from "@/components/PixelIcons";

/** Stylised neighbourhood-only backdrop, not a navigable map or an exact location. */
export function NeighbourhoodMap({ neighbourhood, city }: { neighbourhood: string; city: string }) {
  const gridId = useId();
  return <div className="absolute inset-0 overflow-hidden" role="img" aria-label={`Stylised neighbourhood map of ${neighbourhood}, ${city}; not an exact location`}>
    <svg className="absolute inset-0 size-full text-muted-foreground" viewBox="0 0 400 320" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <pattern id={gridId} width="42" height="42" patternUnits="userSpaceOnUse" patternTransform="rotate(-12)">
          <path d="M42 0H0V42" fill="none" stroke="currentColor" strokeOpacity=".35" strokeWidth="2" />
          <path d="M10 10H32V32H10Z" fill="currentColor" fillOpacity=".04" />
        </pattern>
      </defs>
      <rect width="400" height="320" fill={`url(#${gridId})`} />
      <path d="M-40 240L120 175L215 180L440 55M60 -30L135 100L220 140L320 350" fill="none" stroke="currentColor" strokeOpacity=".45" strokeWidth="9" />
      <path d="M-40 240L120 175L215 180L440 55M60 -30L135 100L220 140L320 350" fill="none" className="stroke-background" strokeWidth="5" />
      <path d="M300 -20Q255 75 345 160T370 350" fill="none" className="stroke-[var(--pink)]" strokeOpacity=".25" strokeWidth="14" />
    </svg>
    <span className="absolute bottom-2 right-3 flex max-w-[90%] items-center gap-1 rounded-full border border-border bg-background px-2 py-1 text-xs text-[var(--pink)]"><MapPin className="size-4 shrink-0" /><span className="truncate">{neighbourhood}</span></span>
  </div>;
}
