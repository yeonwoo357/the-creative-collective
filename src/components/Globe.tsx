import { useEffect, useMemo, useRef, useState } from "react";
import { geoDistance, geoGraticule10, geoOrthographic, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import land110 from "world-atlas/land-110m.json";
import { Minus, Plus } from "lucide-react";

export const land = feature(land110, land110.objects.land) as any;
const graticule = geoGraticule10();

export type Pin = {
  id: string;
  lat: number;
  lng: number;
  title: string;
  subtitle: string;
  avatar: string;
};

export type View = { lambda: number; phi: number; k: number };

const MIN_K = 120;
const MAX_K = 90000;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

type Props = {
  pins: Pin[];
  highlight?: string[];
  initial: View;
  target?: View | null;
  onPin: (id: string) => void;
  reducedMotion?: boolean;
};

export function Globe({ pins, highlight, initial, target, onPin, reducedMotion }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 390, h: 700 });
  const [view, setView] = useState<View>(initial);
  const viewRef = useRef(view);
  viewRef.current = view;
  const anim = useRef<number | null>(null);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const e = entries[0];
      if (e) setSize({ w: e.contentRect.width, h: e.contentRect.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const flyTo = (to: View) => {
    if (anim.current) cancelAnimationFrame(anim.current);
    if (reducedMotion) return setView(to);
    const from = viewRef.current;
    const t0 = performance.now();
    const dur = 1100;
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / dur);
      const e = p < 0.5 ? 2 * p * p : 1 - (-2 * p + 2) ** 2 / 2;
      setView({
        lambda: from.lambda + (to.lambda - from.lambda) * e,
        phi: from.phi + (to.phi - from.phi) * e,
        k: Math.exp(Math.log(from.k) + (Math.log(to.k) - Math.log(from.k)) * e),
      });
      if (p < 1) anim.current = requestAnimationFrame(step);
    };
    anim.current = requestAnimationFrame(step);
  };

  useEffect(() => {
    if (target) flyTo(target);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  // Wheel zoom (non-passive so the page doesn't scroll).
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 100 : 1);
      setView((v) => ({ ...v, k: clamp(v.k * Math.exp(-dy * 0.0025), MIN_K, MAX_K) }));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  // Drag + pinch.
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ d: number; k: number } | null>(null);
  const pinchDist = () => {
    const [a, b] = [...pointers.current.values()];
    return a && b ? Math.max(1, Math.hypot(a.x - b.x, a.y - b.y)) : 1;
  };
  const onPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    if (anim.current) cancelAnimationFrame(anim.current);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2) {
      pinch.current = { d: pinchDist(), k: viewRef.current.k };
    }
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const prev = pointers.current.get(e.pointerId);
    if (!prev) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2 && pinch.current) {
      const d = pinchDist();
      const k = clamp((pinch.current.k * d) / pinch.current.d, MIN_K, MAX_K);
      setView((v) => ({ ...v, k }));
      return;
    }
    const dx = e.clientX - prev.x;
    const dy = e.clientY - prev.y;
    setView((v) => {
      const deg = 57.3 / v.k;
      return { ...v, lambda: v.lambda + dx * deg, phi: clamp(v.phi - dy * deg, -85, 85) };
    });
  };
  const onPointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
  };

  const cx = size.w / 2;
  const cy = size.h * 0.58;
  const projection = useMemo(
    () =>
      geoOrthographic()
        .scale(view.k)
        .translate([cx, cy])
        .rotate([view.lambda, view.phi])
        .clipAngle(90),
    [view, cx, cy],
  );
  const path = geoPath(projection);
  const center: [number, number] = [-view.lambda, -view.phi];

  const hl = highlight && highlight.length ? new Set(highlight) : null;

  // Project + collision-avoid name cards.
  const placed: { x: number; y: number; pin: Pin; card: boolean; dim: boolean }[] = [];
  const rects: { x: number; y: number }[] = [];
  const CW = 156;
  const CH = 50;
  const ordered = [...pins].sort((a, b) => Number(hl?.has(b.id) ?? 0) - Number(hl?.has(a.id) ?? 0));
  for (const pin of ordered) {
    if (geoDistance([pin.lng, pin.lat], center) > Math.PI / 2 - 0.02) continue;
    const p = projection([pin.lng, pin.lat]);
    if (!p) continue;
    const [x, y] = p;
    if (x < -20 || x > size.w + 20 || y < 60 || y > size.h + 20) continue;
    const dim = !!hl && !hl.has(pin.id);
    const card =
      !dim &&
      x > 0 &&
      x < size.w &&
      y - CH - 14 > 110 &&
      !rects.some((r) => Math.abs(r.x - x) < CW && Math.abs(r.y - y) < CH + 4);
    if (card) rects.push({ x, y });
    placed.push({ x, y, pin, card, dim });
  }

  const zoomBy = (f: number) =>
    flyTo({ ...viewRef.current, k: clamp(viewRef.current.k * f, MIN_K, MAX_K) });

  return (
    <div
      ref={wrap}
      className="relative h-full w-full touch-none select-none overflow-hidden"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      style={{ cursor: "grab" }}
    >
      <svg width={size.w} height={size.h} aria-hidden className="absolute inset-0">
        <circle cx={cx} cy={cy} r={view.k} className="fill-background stroke-foreground" strokeWidth={1.5} />
        <path d={path(graticule) ?? ""} fill="none" className="stroke-line" strokeWidth={0.75} />
        <path d={path(land) ?? ""} className="fill-muted stroke-muted-foreground" strokeWidth={1} />
      </svg>

      {placed.map(({ x, y, pin, card, dim }) => (
        <div key={pin.id}>
          {card && (
            <div
              className="absolute"
              style={{ left: x, top: y, transform: `translate(-50%, calc(-100% - 12px))` }}
            >
              <button
                onClick={() => onPin(pin.id)}
                className="flex min-h-11 items-center gap-2 rounded-md border border-foreground bg-background py-1.5 pl-1.5 pr-3 text-left shadow-[0_2px_0_0_var(--foreground)] hover:bg-muted"
              >
                <img src={pin.avatar} alt="" className="size-8 rounded-full object-cover" />
                <span className="block leading-tight">
                  <span className="block max-w-[100px] truncate text-sm font-semibold">{pin.title}</span>
                  <span className="block max-w-[100px] truncate text-[11px] text-muted-foreground">
                    {pin.subtitle}
                  </span>
                </span>
              </button>
              <span className="absolute left-1/2 top-full h-3 w-px bg-foreground" />
            </div>
          )}
          <button
            aria-label={`${pin.title}, ${pin.subtitle}`}
            onClick={() =>
              card
                ? onPin(pin.id)
                : flyTo({ lambda: -pin.lng, phi: -pin.lat, k: clamp(viewRef.current.k * 4, MIN_K, MAX_K) })
            }
            className="absolute flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center"
            style={{ left: x, top: y, opacity: dim ? 0.3 : 1 }}
          >
            <span className="size-2.5 rounded-full border border-background bg-foreground" />
          </button>
        </div>
      ))}

      <div className="absolute bottom-4 right-4 flex flex-col overflow-hidden rounded-md border border-foreground bg-background">
        <button aria-label="Zoom in" onClick={() => zoomBy(2.5)} className="flex size-11 items-center justify-center hover:bg-muted">
          <Plus className="size-4" />
        </button>
        <button aria-label="Zoom out" onClick={() => zoomBy(0.4)} className="flex size-11 items-center justify-center border-t border-foreground hover:bg-muted">
          <Minus className="size-4" />
        </button>
      </div>
    </div>
  );
}

/** Fit a set of coords: centre on their centroid, scale so the spread fits. */
export function fitView(coords: [number, number][]): View {
  if (!coords.length) return { lambda: -5, phi: -52, k: 1100 };
  const lat = coords.reduce((s, c) => s + c[0], 0) / coords.length;
  const lng = coords.reduce((s, c) => s + c[1], 0) / coords.length;
  const spread = Math.max(
    0.0006,
    ...coords.map((c) => geoDistance([c[1], c[0]], [lng, lat])),
  );
  return { lambda: -lng, phi: -lat, k: clamp(130 / spread, 300, 60000) };
}
