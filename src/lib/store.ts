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

/** Returns false when storage is full (big uploads), so callers can tell the user. */
export function writeLocal<T>(key: string, value: T): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    return false;
  }
  window.dispatchEvent(new CustomEvent(EVT, { detail: key }));
  return true;
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

// ---------- current user's portfolio ----------
export type Media = { src: string; type: "image" | "video" };
export type MyProfile = {
  avatar: string;
  media: Media[];
  instagram: string;
  tiktok: string;
  website: string;
  about: string;
  neighbourhood: string;
  discipline: string;
  layout: "carousel" | "grid";
};
export const PROFILE_KEY = "named.profile";
export const EMPTY_PROFILE: MyProfile = {
  avatar: "",
  media: [],
  instagram: "",
  tiktok: "",
  website: "",
  about: "",
  neighbourhood: "",
  discipline: "",
  layout: "grid",
};
export function useMyProfile() {
  const [p, set, ready] = useLocal<MyProfile>(PROFILE_KEY, EMPTY_PROFILE);
  return [{ ...EMPTY_PROFILE, ...p }, set, ready] as const;
}

/** The face you show: your own photo if you set one, else your first piece of work. */
export function avatarOf(p: MyProfile): string {
  return p.avatar || p.media.find((m) => m.type === "image")?.src || "";
}

// ---------- chats (demo only, nothing leaves the browser) ----------
export type Message = {
  id: string;
  from: "me" | "them";
  text: string;
  at: number;
  portfolio?: boolean | undefined;
  liked?: boolean;
};
export type Conversation = {
  id: string;
  creativeId: string;
  blocked?: boolean;
  muted?: boolean;
  messages: Message[];
};
export const CHATS_KEY = "named.chats";

const H = 3600_000;
/** Example threads so the Chat tab never looks empty. `now` is passed in (no module-scope clock). */
export function seedChats(now: number): Conversation[] {
  return [
    { id: "vesper-lux", creativeId: "vesper-lux", messages: [
      { id: "s1", from: "me", text: "Hey! Loved your flash portraits, any chance of a shoot next month?", at: now - 26 * H, portfolio: true },
      { id: "s2", from: "them", text: "Yesss love your stuff too. Free the 14th?", at: now - 3 * H },
    ] },
    { id: "onyx-reed", creativeId: "onyx-reed", messages: [
      { id: "s3", from: "them", text: "Saw you saved me 👀 fancy a bleach session?", at: now - 50 * H },
    ] },
    { id: "kit-ember", creativeId: "kit-ember", messages: [
      { id: "s4", from: "me", text: "Would you be up for DJing our zine launch in Dalston?", at: now - 120 * H, portfolio: true },
      { id: "s5", from: "them", text: "Count me in. Send details x", at: now - 98 * H },
    ] },
  ];
}

/** Append a message from me; creates the conversation if it doesn't exist yet. Newest thread first. */
export function sendMessage(
  chats: Conversation[],
  creativeId: string,
  text: string,
  opts: { portfolio?: boolean; now: number; id: string },
): Conversation[] {
  const msg: Message = { id: opts.id, from: "me", text: text.trim(), at: opts.now, portfolio: opts.portfolio };
  const existing = chats.find((c) => c.creativeId === creativeId);
  const convo: Conversation = existing
    ? { ...existing, messages: [...existing.messages, msg] }
    : { id: creativeId, creativeId, messages: [msg] };
  return [convo, ...chats.filter((c) => c.creativeId !== creativeId)];
}

export function useChats() {
  const [chats, set, ready] = useLocal<Conversation[] | null>(CHATS_KEY, null);
  useEffect(() => {
    if (ready && chats === null) writeLocal(CHATS_KEY, seedChats(Date.now()));
  }, [ready, chats]);
  return [chats ?? [], set as (v: Conversation[]) => void, ready] as const;
}

export function timeAgo(at: number, now: number) {
  const m = Math.max(0, Math.round((now - at) / 60000));
  if (m < 1) return "now";
  if (m < 60) return `${m}m`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.round(h / 24)}d`;
}
