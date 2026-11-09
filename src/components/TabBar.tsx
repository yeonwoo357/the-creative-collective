import { Link, useRouterState } from "@tanstack/react-router";
import { Globe2, MessageCircle, Search, User } from "lucide-react";

const tabs = [
  { to: "/", label: "Home", Icon: Globe2 },
  { to: "/search", label: "Search", Icon: Search },
  { to: "/chat", label: "Chat", Icon: MessageCircle },
  { to: "/me", label: "Profile", Icon: User },
] as const;

export const HIDE_TABS = ["/onboarding", "/intro", "/compose", "/chat/"];

export function TabBar() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  if (HIDE_TABS.some((p) => path.startsWith(p))) return null;
  return (
    <nav
      aria-label="Main"
      className={`sticky bottom-0 z-30 grid grid-cols-4 border-t border-foreground bg-background ${path === "/" ? "night" : ""}`}
    >
      {tabs.map(({ to, label, Icon }) => {
        const active = to === "/" ? path === "/" : path.startsWith(to);
        return (
          <Link
            key={to}
            to={to}
            aria-current={active ? "page" : undefined}
            className={`flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] uppercase tracking-widest ${active ? "font-semibold text-foreground" : "text-muted-foreground"}`}
          >
            <Icon className="size-5" strokeWidth={active ? 2.25 : 1.5} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
