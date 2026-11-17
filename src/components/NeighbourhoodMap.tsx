import { useEffect, useRef } from "react";
import { land } from "@/components/Globe";
import { hoodCoords } from "@/lib/data";

/** A fixed neighbourhood-centroid view; no addresses, GPS, or new map imagery. */
export function NeighbourhoodMap({ neighbourhood, city }: { neighbourhood: string; city: string }) {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let disposed = false;
    let cleanup: (() => void) | undefined;
    const [lat, lng] = hoodCoords(neighbourhood, city);
    void import("globe.gl").then(({ default: GlobeGL }) => {
      if (disposed) return;
      const css = getComputedStyle(el);
      const pink = css.getPropertyValue("--pink").trim();
      const plum = css.getPropertyValue("--plum").trim();
      const world = new GlobeGL(el, { animateIn: false })
        .width(el.clientWidth).height(el.clientHeight).backgroundColor("rgba(0,0,0,0)")
        .showAtmosphere(false).polygonsData([land])
        .polygonCapColor(() => plum).polygonSideColor(() => plum).polygonStrokeColor(() => pink).polygonAltitude(.0001)
        .pointsData([{ lat, lng }]).pointColor(() => pink).pointRadius(.018).pointAltitude(.0005)
        .labelsData([{ lat, lng: lng + .035, name: neighbourhood }]).labelText("name")
        .labelSize(.035).labelColor(() => pink).labelDotRadius(0).labelAltitude(.001);
      world.globeMaterial().color.set(plum);
      world.pointOfView({ lat, lng, altitude: .025 }, 0);
      const controls = world.controls();
      controls.autoRotate = false;
      controls.enableZoom = false;
      controls.enableRotate = false;
      controls.enablePan = false;
      const resize = new ResizeObserver(() => world.width(el.clientWidth).height(el.clientHeight));
      resize.observe(el);
      el.dataset.ready = "true";
      cleanup = () => { resize.disconnect(); world._destructor(); };
    });
    return () => { disposed = true; cleanup?.(); };
  }, [neighbourhood, city]);
  return <div ref={host} className="absolute inset-0" role="img" aria-label={`Globe zoomed to ${neighbourhood}, ${city}; neighbourhood only`} />;
}