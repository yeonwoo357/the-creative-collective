import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { BackButton } from "@/components/TopBar";
import { CHATS_KEY, ONBOARDING_KEY, PROFILE_KEY, SAVED_KEY, TEXT_SIZE_KEY, REDUCE_MOTION_KEY, useLocal, useReducedMotion, type TextSize } from "@/lib/store";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Settings — NAMED Collective" },
      { name: "description", content: "Privacy and account settings for NAMED Collective." },
      { property: "og:title", content: "Settings — NAMED Collective" },
      { property: "og:description", content: "Privacy and account settings for NAMED Collective." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const navigate = useNavigate();
  const [textSize, setTextSize] = useLocal<TextSize>(TEXT_SIZE_KEY, "default");
  const [reduce, setReduce] = useLocal<boolean>(REDUCE_MOTION_KEY, false);
  const effectiveReduce = useReducedMotion();
  const rows = ["Notifications", "Terms & Conditions", "Help"];
  return (
    <div className="flex-1">
      <div className="flex items-center gap-2 px-4 pt-4">
        <BackButton className="border-0" />
        <h1 className="text-2xl font-semibold uppercase tracking-wide">Settings</h1>
      </div>
      <div className="mt-4 border-y border-muted px-4 py-4 text-sm">
        <p className="font-semibold uppercase tracking-widest">Privacy</p>
        <p className="mt-1 text-muted-foreground">Your pin shows your neighbourhood only. We never track live location.</p>
      </div>
      <section aria-labelledby="accessibility-title" className="border-b border-muted px-4 py-4">
        <h2 id="accessibility-title" className="label">Accessibility</h2>
        <p className="mt-3 text-sm">Text size</p>
        <div role="group" aria-label="Text size" className="mt-2 flex flex-wrap gap-2">
          {([ ["default", "Default"], ["large", "Large"], ["extra-large", "Extra large"] ] as const).map(([value, label]) => <Button key={value} variant="ghost" className="chip min-h-11" aria-pressed={textSize === value} onClick={() => setTextSize(value)}>{label}</Button>)}
        </div>
        <label className="mt-4 flex min-h-11 items-center justify-between gap-3">
          <span>Reduce motion</span>
          <Switch aria-label="Reduce motion" className="min-h-11 min-w-11" checked={effectiveReduce} onCheckedChange={() => setReduce(!reduce)} />
        </label>
        <p className="mt-1 text-xs text-muted-foreground">A calmer spin. Your device’s motion preference stays on too.</p>
      </section>
      <ul>
        <li>
          <Link to="/edit-profile" className="flex min-h-14 w-full items-center border-b border-muted px-4 hover:bg-muted">Edit profile</Link>
        </li>
        <li><Link to="/get-verified" className="flex min-h-14 w-full items-center border-b border-muted px-4 hover:bg-muted">Get verified</Link></li>
        {rows.map((r) => (
          <li key={r}>
            <button onClick={() => toast("Not active in this prototype just yet")} className="flex min-h-14 w-full items-center border-b border-muted px-4 text-left hover:bg-muted">
              {r}
            </button>
          </li>
        ))}
      </ul>
      <div className="px-4 pt-8">
        <button
          className="btn btn-secondary w-full"
          onClick={() => {
            localStorage.removeItem(ONBOARDING_KEY);
            localStorage.removeItem(SAVED_KEY);
            localStorage.removeItem(PROFILE_KEY);
            localStorage.removeItem(CHATS_KEY);
            navigate({ to: "/onboarding" });
          }}
        >
          Start fresh
        </button>
      </div>
    </div>
  );
}
