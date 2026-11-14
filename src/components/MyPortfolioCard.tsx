import { Link } from "@tanstack/react-router";
import { User } from "@/components/PixelIcons";
import { MediaItem } from "./Portfolio";
import type { MyProfile } from "@/lib/store";

/** Compact preview of the sender's own portfolio, attached to outgoing messages. */
export function MyPortfolioCard({ profile, name, compact }: { profile: MyProfile; name: string; compact?: boolean }) {
  const thumbs = profile.media.slice(0, 3);
  return (
    <div className="rounded-md border border-dashed border-foreground bg-background p-2 text-foreground">
      {thumbs.length > 0 ? (
        <div className="grid grid-cols-3 gap-px bg-muted">
          {thumbs.map((m, i) => (
            <MediaItem key={i} m={{ ...m }} alt={`${name} work ${i + 1}`} className="aspect-square w-full" />
          ))}
        </div>
      ) : (
        <div className="flex h-16 items-center justify-center gap-2 bg-muted text-xs uppercase tracking-widest text-muted-foreground">
          <User className="size-4" /> No work added yet
        </div>
      )}
      <div className="px-1 pt-2">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Portfolio attached</p>
        <p className="font-semibold">{name}</p>
        <p className="text-xs text-muted-foreground">
          {[profile.discipline, profile.neighbourhood].filter(Boolean).join(" · ") || "Member of the collective"}
        </p>
      </div>
      {!compact && thumbs.length === 0 && (
        <Link to="/edit-profile" className="link-u mt-1 inline-flex min-h-11 items-center px-1 text-xs">
          Add some work first
        </Link>
      )}
    </div>
  );
}
