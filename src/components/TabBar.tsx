import { Link, useRouterState } from "@tanstack/react-router";
import { Globe2, MessageCircle, Search, User } from "@/components/PixelIcons";

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
      className={`sticky bottom-0 z-30 px-3 pb-3 pt-2 ${path === "/" ? "night" : ""}`}
    >
      <div className="glass grid grid-cols-4 gap-1 rounded-full bg-black/55 p-1.5">
        {tabs.map(({ to, label, Icon }) => {
          const active = to === "/" ? path === "/" : path.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              aria-current={active ? "page" : undefined}
              aria-label={label}
              className={`flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-full text-xs tracking-wide ${
                active
                  ? "bg-white/15 text-foreground shadow-[inset_0_1px_0_rgb(255_255_255/0.25)]"
                  : "text-white/65 hover:text-foreground"
              }`}
            >
              <Icon className="size-5" active={active} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
