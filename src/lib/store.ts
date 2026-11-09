import { useCallback, useEffect, useState } from "react";

export type Onboarding = {
  name: string;
  email: string;
  location: string;
  intent: "discover" | "discovered" | "";
  done: boolean;
};

const EVT = "named-store";

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeLocal<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent(EVT, { detail: key }));
}

/** localStorage-backed state; reads after mount so SSR and hydration match. */
export function useLocal<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(fallback);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setValue(read(key, fallback));
    setReady(true);
    const sync = (e: Event) => {
      if ((e as CustomEvent).detail === key || e.type === "storage") setValue(read(key, fallback));
    };
    window.addEventListener(EVT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVT, sync);
      window.removeEventListener("storage", sync);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  const set = useCallback((v: T) => writeLocal(key, v), [key]);
  return [value, set, ready] as const;
}

export const ONBOARDING_KEY = "named.onboarding";
export const SAVED_KEY = "named.saved";

export function useSaved() {
  const [saved, setSaved, ready] = useLocal<string[]>(SAVED_KEY, []);
  const toggle = (id: string) =>
    setSaved(saved.includes(id) ? saved.filter((s) => s !== id) : [...saved, id]);
  return { saved, toggle, ready, isSaved: (id: string) => saved.includes(id) };
}

export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(m.matches);
    const on = () => setReduced(m.matches);
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, []);
  return reduced;
}
