import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { geoGraticule10, geoOrthographic, geoPath } from "d3-geo";
import { land } from "@/components/Globe";

export const Route = createFileRoute("/intro")({
  head: () => ({
    meta: [
      { title: "Finding your people — NAMED" },
      { name: "description", content: "Spinning up the NAMED Collective globe." },
      { property: "og:title", content: "Finding your people — NAMED" },
      { property: "og:description", content: "Spinning up the NAMED Collective globe." },
    ],
  }),
  component: Intro,
});

const grat = geoGraticule10();

function Intro() {
  const navigate = useNavigate();
  const [lambda, setLambda] = useState(60);
  const [zoom, setZoom] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      navigate({ to: "/", replace: true });
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      // Spin, easing towards London (lambda 0) by the zoom.
      const p = Math.min(1, (t - t0) / 1400);
      setLambda(60 + (360 - 60) * (1 - (1 - p) ** 3));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const z = setTimeout(() => setZoom(true), 1400);
    const done = setTimeout(() => navigate({ to: "/", replace: true }), 2600);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(z);
      clearTimeout(done);
    };
  }, [navigate]);

  const proj = geoOrthographic().scale(70).translate([80, 80]).rotate([lambda, -52]).clipAngle(90);
  const path = geoPath(proj);

  return (
    <div className="relative flex flex-1 items-center justify-center overflow-hidden">
      <div
        className="transition-transform duration-[1100ms] ease-in"
        style={{ transform: zoom ? "translateY(35%) scale(7)" : "none" }}
      >
        <div className="relative">
          {!zoom && (
            <span className="animate-orbit absolute -inset-5 rounded-full border border-dashed border-foreground" />
          )}
          <svg width={160} height={160} aria-label="Spinning globe" role="img">
            <circle cx={80} cy={80} r={70} className="fill-background stroke-foreground" strokeWidth={1.5} />
            <path d={path(grat) ?? ""} fill="none" className="stroke-line" strokeWidth={0.6} />
            <path d={path(land) ?? ""} className="fill-muted stroke-muted-foreground" strokeWidth={0.8} />
          </svg>
        </div>
      </div>
      <p className="absolute bottom-24 text-xs uppercase tracking-[0.3em] text-muted-foreground">Finding your people…</p>
      <Link to="/" replace className="link-u absolute right-4 top-4 flex min-h-11 items-center text-sm uppercase tracking-widest">
        Skip
      </Link>
    </div>
  );
}
