import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { BackButton } from "@/components/TopBar";
import { Star } from "@/components/PixelIcons";
import { getCreative } from "@/lib/data";
import { avatarOf, useMyProfile } from "@/lib/store";
import { MAX_VOTES_PER_DAY } from "@/lib/competition";

/** Header for the Get Named screens: back, optional step label, title, optional right slot. */
export function CompHeader({
  title,
  step,
  right,
}: {
  title: string;
  step?: string;
  right?: ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 px-4 pt-4">
      <BackButton />
      <div className="min-w-0 flex-1">
        {step && <p className="text-xs font-bold uppercase text-[var(--pink)]">{step}</p>}
        <h1 className="truncate text-2xl">{title}</h1>
      </div>
      {right}
    </div>
  );
}

/** One round face: a sample creative, "me", or an open spot. */
export function Face({
  id,
  size = 36,
  ring = true,
}: {
  id: string;
  size?: number;
  ring?: boolean;
}) {
  const [me] = useMyProfile();
  const style = { width: size, height: size };
  const ringCls = ring ? "border-2 border-black" : "";
  if (id === "open")
    return (
      <span
        style={style}
        className={`flex flex-none items-center justify-center rounded-full border-2 border-dashed border-[var(--pink)]/70 text-[var(--pink)]`}
        aria-label="Open spot"
      >
        ?
      </span>
    );
  const src = id === "me" ? avatarOf(me) : getCreative(id)?.avatar;
  const name = id === "me" ? "You" : (getCreative(id)?.name ?? "");
  return src ? (
    <img
      src={src}
      alt={name}
      style={style}
      className={`flex-none rounded-full object-cover ${ringCls}`}
    />
  ) : (
    <span
      style={style}
      className={`flex flex-none items-center justify-center rounded-full bg-[var(--rose)] text-xs ${ringCls}`}
      aria-label={name}
    >
      {name.slice(0, 2).toUpperCase()}
    </span>
  );
}

/** Overlapping faces, open spots shown as dashed "?" circles. */
export function FaceStack({
  members,
  open,
  size = 36,
}: {
  members: string[];
  open: number;
  size?: number;
}) {
  const all = [...members, ...Array.from({ length: open }, () => "open")];
  return (
    <div className="flex pl-2">
      {all.map((m, i) => (
        <span key={`${m}-${i}`} className="-ml-2">
          <Face id={m} size={size} />
        </span>
      ))}
    </div>
  );
}

/** Pixel stars for the day's votes: filled = used. */
export function VoteStars({ used }: { used: number }) {
  return (
    <div
      className="flex gap-1"
      role="img"
      aria-label={`${MAX_VOTES_PER_DAY - used} of ${MAX_VOTES_PER_DAY} votes left today`}
    >
      {Array.from({ length: MAX_VOTES_PER_DAY }, (_, i) => (
        <Star key={i} className={`size-[18px] ${i < used ? "" : "opacity-40"}`} active={i < used} />
      ))}
    </div>
  );
}

export function ProfileLink({ id, children }: { id: string; children: ReactNode }) {
  return (
    <Link to="/profile/$id" params={{ id }} className="hover:text-[var(--pink)]">
      {children}
    </Link>
  );
}
