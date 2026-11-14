import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

// A quick second click can interrupt a screen cross-fade; the browser then rejects the old
// transition's promise. That's expected, not an error, so don't let it surface as one.
if (typeof window !== "undefined") {
  window.addEventListener("unhandledrejection", (e) => {
    const r = e.reason as { name?: string; message?: string } | undefined;
    if (r?.name === "AbortError" && /transition/i.test(r.message ?? "")) e.preventDefault();
  });
}

export const getRouter = () => {
  // One client per request: a module-level QueryClient leaks cached data between SSR requests.
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    // Lets Query own freshness; set caching defaults on the QueryClient, not the router.
    defaultPreloadStaleTime: 0,
    // Cross-fade between screens instead of a hard cut (styles in src/styles.css).
    defaultViewTransition: true,
  });

  return router;
};
