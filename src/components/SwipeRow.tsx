import { useRef, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "@/components/PixelIcons";
import { Button } from "@/components/ui/button";

export function SwipeRow({ label, children, centred = false }: { label: string; children: ReactNode; centred?: boolean }) {
  const row = useRef<HTMLDivElement>(null);
  const move = (direction: number) => {
    const el = row.current;
    if (!el) return;
    const card = el.firstElementChild;
    el.scrollBy({ left: direction * ((card?.getBoundingClientRect().width ?? el.clientWidth * .76) + 12), behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  };
  return <div className="min-w-0">
    <div ref={row} className={`swipe-row ${centred ? "swipe-row-centred" : ""}`} role="region" aria-label={label} tabIndex={0}>{children}</div>
    <div className="flex justify-end gap-1 px-4">
      <Button variant="ghost" className="size-11 p-0" aria-label={`Previous ${label}`} onClick={() => move(-1)}><ChevronLeft /></Button>
      <Button variant="ghost" className="size-11 p-0" aria-label={`Next ${label}`} onClick={() => move(1)}><ChevronRight /></Button>
    </div>
  </div>;
}