import { useEffect, useRef } from "react";
import { geoDistance } from "d3-geo";
import { feature } from "topojson-client";
import land110 from "world-atlas/land-110m.json";
import { LocateFixed, Minus, Plus } from "@/components/PixelIcons";
import type { GlobeInstance } from "globe.gl";

const topo = land110 as any;
export const land = feature(topo, topo.objects.land) as any;

/**
 * The land outline split into one feature per polygon, for the dotted (hex) globe.
 * Antarctica and polygons that wrap the antimeridian are dropped: h3 cannot fill them.
 */
const landDots = (land.features as { geometry: { coordinates: number[][][][] } }[])
  .flatMap((f) => f.geometry.coordinates)
  .filter((poly) => {
    const ring = poly[0] ?? [];
    const lngs = ring.map((c) => c[0] ?? 0);
    const lats = ring.map((c) => c[1] ?? 0);
    return Math.min(...lats) > -60 && Math.max(...lngs) - Math.min(...lngs) < 180;
  })
  .map((coordinates) => ({
    type: "Feature" as const,
    properties: {},
    geometry: { type: "Polygon" as const, coordinates },
  }));

export type Pin = {
  id: string;
  lat: number;
  lng: number;
  title: string;
  subtitle: string;
  avatar: string;
  /** Neighbourhood tag shown on the pin (never an address). */
  place?: string;
};

/**
 * Camera view. lambda/phi follow d3's rotate() convention (lambda = -lng, phi = -lat).
 * k is the d3-style zoom (px per globe radius); `altitude` (globe radii above the surface)
 * overrides k when set.
 */
export type View = { lambda: number; phi: number; k: number; altitude?: number };

/** Where the home screen rests, and where the intro animation lands. */
export const HOME_VIEW: View = { lambda: 0.1, phi: -51.6, k: 0, altitude: 1.2 };

const FOV_HALF = Math.tan((25 * Math.PI) / 180); // three.js default fov 50°
const DOWN = 0.4; // push the globe down the screen so only its top arc shows (wireframe ⑤-3)
const MIN_ALT = 0.005;
const DOTS_HIDE_BELOW = 0.12; // hex dots get blobby up close: show only the coastline there
const MAX_ALT = 4.5;
const MAX_CARDS = 3;
const CYCLE_MS = 1800;
const RESUME_MS = 3500;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

type Props = {
  pins?: Pin[];
  highlight?: string[];
  initial?: View;
  target?: View | null;
  onPin?: (id: string) => void;
  reducedMotion?: boolean;
  /** "intro": small fast spin, then zoom down to HOME_VIEW and call onIntroDone. */
  mode?: "home" | "intro";
  onIntroDone?: () => void;
  /** Neighbourhood labels drawn on the map. */
  places?: { name: string; lat: number; lng: number }[];
  /** Hover (mouse), focus or first tap on a pin: show its preview. null = hide. */
  onPreview?: (id: string | null) => void;
  previewId?: string | null;
};

type PinEl = HTMLDivElement & { __pin?: Pin; __vis?: boolean; __shownAt?: number };

export function Globe({
  pins = [],
  highlight,
  initial = HOME_VIEW,
  target,
  onPin,
  reducedMotion,
  mode = "home",
  onIntroDone,
  places = [],
  onPreview,
  previewId = null,
}: Props) {
  const onPreviewRef = useRef(onPreview);
  onPreviewRef.current = onPreview;
  const previewRef = useRef(previewId);
  previewRef.current = previewId;
  const wrap = useRef<HTMLDivElement>(null);
  const host = useRef<HTMLDivElement>(null);
  const worldRef = useRef<GlobeInstance | null>(null);
  const offRef = useRef(mode === "intro" ? 0 : DOWN);
  const els = useRef(new Map<string, PinEl>());
  const hlRef = useRef<Set<string> | null>(null);
  const onPinRef = useRef(onPin);
  onPinRef.current = onPin;
  const onDoneRef = useRef(onIntroDone);
  onDoneRef.current = onIntroDone;
  const resumeT = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const size = () => ({
    w: wrap.current?.clientWidth ?? 390,
    h: wrap.current?.clientHeight ?? 700,
  });

  /** Convert a View into a globe.gl point of view, nudging the focus up into the visible arc. */
  const toPov = (v: View) => {
    const { h } = size();
    // Zooms from fitView() stop at street-cluster level so neighbouring pins still separate.
    const altitude = clamp(
      v.altitude ?? Math.max(0.01, (2 * h) / (2 * Math.max(1, v.k) * FOV_HALF)),
      MIN_ALT,
      MAX_ALT,
    );
    // The globe's centre sits low on screen (view offset), so tilt the camera south a little
    // so the focus point lands in the upper, visible part of the globe.
    const tilt = offRef.current ? clamp(12.5 * altitude, 0, 16) : 0;
    return { lat: clamp(-v.phi - tilt, -80, 80), lng: -v.lambda, altitude };
  };

  const setOffset = (o: number) => {
    const w = worldRef.current;
    if (!w) return;
    offRef.current = o;
    w.globeOffset([0, o * size().h]);
  };

  const tweenOffset = (to: number, ms: number) => {
    const from = offRef.current;
    const t0 = performance.now();
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / ms);
      const e = k < 0.5 ? 4 * k * k * k : 1 - (-2 * k + 2) ** 3 / 2;
      setOffset(from + (to - from) * e);
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const spin = (on: boolean) => {
    const w = worldRef.current;
    if (!w) return;
    w.controls().autoRotate = on && !reducedMotion && !hlRef.current;
  };

  // ---------- create the WebGL globe (browser only) ----------
  useEffect(() => {
    let disposed = false;
    const hostEl = host.current!;
    const pinEls = els.current;
    let cycleT: ReturnType<typeof setTimeout> | undefined;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const ro = new ResizeObserver(() => {
      const w = worldRef.current;
      if (!w) return;
      const { w: cw, h: ch } = size();
      w.width(cw).height(ch);
      setOffset(offRef.current);
    });

    (async () => {
      const { default: GlobeGL } = await import("globe.gl");
      if (disposed || !host.current) return;
      const { w: cw, h: ch } = size();
      const world = new GlobeGL(host.current, { animateIn: false })
        .width(cw)
        .height(ch)
        .backgroundColor("rgba(0,0,0,0)")
        .showAtmosphere(true)
        .atmosphereColor("#ffffff")
        .atmosphereAltitude(0.14)
        .hexPolygonsData(landDots)
        .hexPolygonResolution(3)
        .hexPolygonMargin(0.42)
        .hexPolygonUseDots(true)
        .hexPolygonColor(() => "rgba(240,240,240,0.9)")
        // Faint land fill + coastline so close-ups (search results) still read as a map.
        .polygonsData(landDots)
        .polygonCapColor(() => "rgba(255,255,255,0.05)")
        .polygonSideColor(() => "rgba(0,0,0,0)")
        .polygonStrokeColor(() => "rgba(255,255,255,0.28)")
        .polygonAltitude(0.0008);
      worldRef.current = world;

      const mat = world.globeMaterial() as unknown as {
        color?: { set: (c: string) => void };
        shininess?: number;
      };
      mat.color?.set?.("#141414");
      mat.shininess = 4;

      const ctl = world.controls();
      ctl.enablePan = false;
      ctl.enableZoom = mode === "home";
      ctl.enableRotate = mode === "home";
      ctl.addEventListener("start", () => {
        clearTimeout(resumeT.current);
        spin(false);
      });
      ctl.addEventListener("end", () => {
        clearTimeout(resumeT.current);
        resumeT.current = setTimeout(() => spin(true), RESUME_MS);
      });

      let dotsHidden = false;
      world.onZoom(({ altitude }) => {
        const hide = altitude < DOTS_HIDE_BELOW;
        if (hide !== dotsHidden) {
          dotsHidden = hide;
          world.hexPolygonsData(hide ? [] : landDots);
        }
      });

      setOffset(offRef.current);
      ro.observe(wrap.current!);

      if (mode === "intro") {
        ctl.autoRotate = !reducedMotion;
        ctl.autoRotateSpeed = 7;
        world.pointOfView({ lat: 20, lng: -HOME_VIEW.lambda - 120, altitude: 4.2 }, 0);
        timers.push(
          setTimeout(() => {
            ctl.autoRotate = false;
            offRef.current = DOWN; // so toPov() applies the home tilt
            const home = toPov(HOME_VIEW);
            offRef.current = 0;
            world.pointOfView(home, 1700);
            tweenOffset(DOWN, 1700);
            timers.push(setTimeout(() => onDoneRef.current?.(), 1800));
          }, 2200),
        );
        return;
      }

      // ----- home -----
      world.pointOfView(toPov(initial), 0);

      // Neighbourhood names: tiny labels that only become legible when zoomed in on a city.
      world
        .labelsData(places)
        .labelLat((d: object) => (d as { lat: number }).lat)
        .labelLng((d: object) => (d as { lng: number }).lng)
        .labelText((d: object) => (d as { name: string }).name.toUpperCase())
        .labelSize(0.012)
        .labelDotRadius(0)
        .labelAltitude(0.0012)
        .labelResolution(2)
        .labelColor(() => "rgba(200,200,200,0.85)");

      // Double-tap / double-click on empty map: back to the default view. Taps on pins don't count.
      let last = { t: 0, x: 0, y: 0 };
      let down = { x: 0, y: 0 };
      hostEl.addEventListener("pointerdown", (e) => (down = { x: e.clientX, y: e.clientY }));
      hostEl.addEventListener("pointerup", (e) => {
        if ((e.target as HTMLElement).closest(".globe-pin")) return;
        if (Math.hypot(e.clientX - down.x, e.clientY - down.y) > 10) return; // a drag, not a tap
        const now = performance.now();
        if (now - last.t < 350 && Math.hypot(e.clientX - last.x, e.clientY - last.y) < 40) {
          last = { t: 0, x: 0, y: 0 };
          recentre();
        } else {
          last = { t: now, x: e.clientX, y: e.clientY };
          onPreviewRef.current?.(null);
        }
      });
      ctl.autoRotateSpeed = 0.25;
      spin(true);

      world
        .htmlElementsData(pins)
        .htmlLat((d: object) => (d as Pin).lat)
        .htmlLng((d: object) => (d as Pin).lng)
        .htmlAltitude(0.004)
        .htmlElement((d: object) => makePinEl(d as Pin))
        .htmlElementVisibilityModifier((el: HTMLElement, vis: boolean) => {
          const p = el as PinEl;
          p.__vis = vis;
          p.style.opacity = vis ? "" : "0";
          p.style.pointerEvents = vis ? "" : "none";
          if (!vis) p.dataset["show"] = "false";
        });

      // Pop-ups appear one by one as the globe turns.
      const inView = (p: PinEl) => {
        if (!p.__vis || !p.__pin) return null;
        const s = world.getScreenCoords(p.__pin.lat, p.__pin.lng, 0.004);
        const { w, h } = size();
        const top = hlRef.current ? 230 : h * 0.42; // search results may sit higher, under the chip
        if (!s || s.x < 84 || s.x > w - 84 || s.y < top || s.y > h - 24) return null;
        return s;
      };
      const cycle = () => {
        if (disposed) return;
        const all = [...els.current.values()];
        const hl = hlRef.current;
        if (hl) {
          // Search results: keep their cards up (without overlapping), dim everyone else.
          const placed: { x: number; y: number }[] = [];
          for (const p of all) {
            const on = hl.has(p.__pin!.id);
            p.dataset["dim"] = String(!on);
            const s = on ? inView(p) : null;
            const fits =
              !!s && !placed.some((t) => Math.abs(t.x - s.x) < 170 && Math.abs(t.y - s.y) < 64);
            if (fits) placed.push(s!);
            p.dataset["show"] = String(fits);
          }
        } else {
          const shown = all.filter((p) => p.dataset["show"] === "true");
          for (const p of shown) if (!inView(p)) p.dataset["show"] = "false";
          let live = all.filter((p) => p.dataset["show"] === "true");
          if (live.length >= MAX_CARDS) {
            const oldest = live.sort((a, b) => (a.__shownAt ?? 0) - (b.__shownAt ?? 0))[0];
            if (oldest) oldest.dataset["show"] = "false";
            live = live.filter((p) => p !== oldest);
          }
          const taken = live.map((p) => inView(p)).filter(Boolean) as { x: number; y: number }[];
          const pool = all
            .filter((p) => p.dataset["show"] !== "true")
            .map((p) => ({ p, s: inView(p) }))
            .filter(
              (c): c is { p: PinEl; s: { x: number; y: number } } =>
                !!c.s &&
                !taken.some((t) => Math.abs(t.x - c.s!.x) < 170 && Math.abs(t.y - c.s!.y) < 64),
            );
          const pick = pool[Math.floor(Math.random() * pool.length)];
          if (pick) {
            pick.p.dataset["show"] = "true";
            pick.p.__shownAt = Date.now();
          }
        }
        cycleT = setTimeout(cycle, CYCLE_MS);
      };
      cycleT = setTimeout(cycle, 400);
    })();

    function makePinEl(pin: Pin) {
      const el = document.createElement("div") as PinEl;
      el.__pin = pin;
      el.className = "globe-pin";
      el.dataset["show"] = "false";
      el.innerHTML = `
        <div class="globe-pop">
          <button type="button" class="globe-card">
            <img src="${pin.avatar}" alt="" />
            <span><b></b><small></small><i class="globe-hood"></i></span>
          </button>
          <span class="globe-stem"></span>
        </div>
        <button type="button" class="globe-dot"></button>`;
      el.querySelector("b")!.textContent = pin.title;
      el.querySelector("small")!.textContent = pin.subtitle;
      const hood = el.querySelector<HTMLElement>(".globe-hood")!;
      hood.style.fontStyle = "normal";
      hood.textContent = pin.place ?? "";
      el.querySelector<HTMLButtonElement>(".globe-dot")!.setAttribute(
        "aria-label",
        `${pin.title}, ${pin.subtitle}`,
      );
      // Mouse: hover previews, click opens. Touch/keyboard: first tap or focus previews, second tap opens.
      let viaMouse = false;
      const hideT = { t: undefined as ReturnType<typeof setTimeout> | undefined };
      const card = el.querySelector<HTMLElement>(".globe-card")!;
      card.addEventListener("pointerenter", (e) => {
        if (e.pointerType !== "mouse" || el.dataset["show"] !== "true") return;
        clearTimeout(hideT.t);
        onPreviewRef.current?.(pin.id);
      });
      card.addEventListener("pointerleave", (e) => {
        if (e.pointerType !== "mouse") return;
        hideT.t = setTimeout(() => {
          if (previewRef.current === pin.id) onPreviewRef.current?.(null);
        }, 600);
      });
      el.addEventListener("pointerdown", (e) => (viaMouse = e.pointerType === "mouse"));
      el.addEventListener("focusin", () => onPreviewRef.current?.(pin.id));
      const open = () => onPinRef.current?.(pin.id);
      el.querySelector(".globe-card")!.addEventListener("click", (e) => {
        e.stopPropagation();
        if (viaMouse || previewRef.current === pin.id) return open();
        onPreviewRef.current?.(pin.id);
      });
      el.querySelector(".globe-dot")!.addEventListener("click", (e) => {
        e.stopPropagation();
        if (viaMouse || previewRef.current === pin.id) return open();
        onPreviewRef.current?.(pin.id);
        if (el.dataset["show"] === "true") return;
        // First tap on a bare dot: fly closer so clustered pins separate, then show its card.
        const w = worldRef.current;
        if (!w) return;
        clearTimeout(resumeT.current);
        spin(false);
        const alt = clamp(w.pointOfView().altitude * 0.3, MIN_ALT * 4, MAX_ALT);
        w.pointOfView(
          toPov({ lambda: -pin.lng, phi: -pin.lat, k: 0, altitude: alt }),
          reducedMotion ? 0 : 1100,
        );
        setTimeout(
          () => {
            for (const other of els.current.values())
              if (other !== el) other.dataset["show"] = "false";
            el.dataset["show"] = "true";
            el.__shownAt = Date.now();
          },
          reducedMotion ? 0 : 1100,
        );
        resumeT.current = setTimeout(() => spin(true), 6000);
      });
      els.current.set(pin.id, el);
      return el;
    }

    return () => {
      disposed = true;
      clearTimeout(cycleT);
      clearTimeout(resumeT.current);
      timers.forEach(clearTimeout);
      ro.disconnect();
      const w = worldRef.current;
      worldRef.current = null;
      pinEls.clear();
      // Never let a library teardown hiccup blank the app: the rest of the cleanup already ran.
      try {
        w?._destructor();
      } catch (err) {
        console.warn("globe teardown", err);
      }
      hostEl.innerHTML = "";
    };
    // The globe is built once; pins/highlight/target updates are handled below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- highlight (search results) ----------
  useEffect(() => {
    hlRef.current = highlight && highlight.length ? new Set(highlight) : null;
    if (!hlRef.current) for (const p of els.current.values()) p.dataset["dim"] = "false";
    spin(!hlRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlight?.join(",")]);

  // ---------- fly to a target view ----------
  useEffect(() => {
    if (!target) return;
    let tries = 0;
    const go = () => {
      const w = worldRef.current;
      if (!w) return void (tries++ < 50 && setTimeout(go, 100)); // globe may still be loading
      w.pointOfView(toPov(target), reducedMotion ? 0 : 1200);
    };
    go();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  function recentre() {
    const w = worldRef.current;
    if (!w) return;
    onPreviewRef.current?.(null);
    w.pointOfView(toPov(HOME_VIEW), reducedMotion ? 0 : 1000);
    clearTimeout(resumeT.current);
    resumeT.current = setTimeout(() => spin(true), RESUME_MS);
  }

  const zoomBy = (f: number) => {
    const w = worldRef.current;
    if (!w) return;
    const pov = w.pointOfView();
    w.pointOfView(
      { ...pov, altitude: clamp(pov.altitude / f, MIN_ALT, MAX_ALT) },
      reducedMotion ? 0 : 600,
    );
  };

  return (
    <div
      ref={wrap}
      className="globe-space relative h-full w-full touch-none select-none overflow-hidden"
      style={{ cursor: mode === "home" ? "grab" : "default" }}
    >
      <div ref={host} className="absolute inset-0" />
      {mode === "home" && (
        <div className="absolute bottom-4 right-4 z-10 flex flex-col overflow-hidden rounded-md border border-foreground bg-background">
          <button
            aria-label="Zoom in"
            onClick={() => zoomBy(3)}
            className="flex size-11 items-center justify-center hover:bg-muted"
          >
            <Plus className="size-4" />
          </button>
          <button
            aria-label="Recentre on London"
            title="Recentre (or double-tap the map)"
            onClick={recentre}
            className="flex size-11 items-center justify-center border-t border-foreground hover:bg-muted"
          >
            <LocateFixed className="size-4" />
          </button>
          <button
            aria-label="Zoom out"
            onClick={() => zoomBy(1 / 3)}
            className="flex size-11 items-center justify-center border-t border-foreground hover:bg-muted"
          >
            <Minus className="size-4" />
          </button>
        </div>
      )}
    </div>
  );
}

/** Fit a set of coords: centre on their centroid, scale so the spread fits. */
export function fitView(coords: [number, number][]): View {
  if (!coords.length) return HOME_VIEW;
  const lat = coords.reduce((s, c) => s + c[0], 0) / coords.length;
  const lng = coords.reduce((s, c) => s + c[1], 0) / coords.length;
  const spread = Math.max(0.0006, ...coords.map((c) => geoDistance([c[1], c[0]], [lng, lat])));
  return { lambda: -lng, phi: -lat, k: clamp(130 / spread, 300, 200000) };
}
