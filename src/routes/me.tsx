import { createFileRoute, Link } from "@tanstack/react-router";
import { Settings, User } from "lucide-react";
import { PageHeader } from "@/components/TopBar";
import { ONBOARDING_KEY, useLocal, useSaved, type Onboarding } from "@/lib/store";

export const Route = createFileRoute("/me")({
  head: () => ({
    meta: [
      { title: "Your collective — NAMED" },
      { name: "description", content: "Your NAMED Collective profile." },
      { property: "og:title", content: "Your collective — NAMED" },
      { property: "og:description", content: "Your NAMED Collective profile." },
    ],
  }),
  component: MePage,
});

function MePage() {
  const [ob] = useLocal<Onboarding | null>(ONBOARDING_KEY, null);
  const { saved } = useSaved();
  return (
    <div className="flex-1">
      <PageHeader
        title="Profile"
        right={
          <Link to="/settings" aria-label="Settings" className="flex size-11 items-center justify-center rounded-full border border-foreground">
            <Settings className="size-5" />
          </Link>
        }
      />
      <div className="px-4">
        <div className="mt-4 flex items-center gap-4">
          <span className="flex size-20 items-center justify-center rounded-full bg-muted"><User className="size-8" /></span>
          <div>
            <p className="text-xl font-semibold">{ob?.name || "Bestie"}</p>
            <p className="text-sm text-muted-foreground">{ob?.location || "London"} · {ob?.intent === "discovered" ? "Here to be discovered" : "Here to discover"}</p>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-px bg-muted">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex aspect-square items-center justify-center bg-background text-xs uppercase tracking-widest text-muted-foreground">
              {i === 0 ? "+ Add work" : ""}
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-muted-foreground">Your collective is empty for now — portfolio uploads land in the next drop.</p>
        <Link to="/saved" className="btn btn-secondary mt-6 w-full">{saved.length} saved</Link>
      </div>
    </div>
  );
}
