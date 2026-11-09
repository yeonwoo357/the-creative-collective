import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Globe } from "@/components/Globe";

export const Route = createFileRoute("/intro")({
  // The WebGL globe only exists in the browser.
  ssr: false,
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

function Intro() {
  const navigate = useNavigate();
  const goHome = () => navigate({ to: "/", replace: true });

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) goHome();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="night relative flex flex-1 overflow-hidden">
      {/* ⑤-1 spinning globe → ⑤-2 zoom in; lands exactly where the home globe starts */}
      <div className="absolute inset-0">
        <Globe mode="intro" onIntroDone={goHome} />
      </div>
      <p className="pointer-events-none absolute inset-x-0 bottom-24 text-center text-xs uppercase tracking-[0.3em] text-muted-foreground">
        Finding your people…
      </p>
      <Link
        to="/"
        replace
        className="link-u absolute right-4 top-4 z-10 flex min-h-11 items-center text-sm uppercase tracking-widest"
      >
        Skip
      </Link>
    </div>
  );
}
