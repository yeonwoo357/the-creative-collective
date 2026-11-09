import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { BackButton } from "@/components/TopBar";
import { CHATS_KEY, ONBOARDING_KEY, PROFILE_KEY, SAVED_KEY } from "@/lib/store";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
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
      <ul>
        <li>
          <Link to="/edit-profile" className="flex min-h-14 w-full items-center border-b border-muted px-4 hover:bg-muted">Edit profile</Link>
        </li>
        {rows.map((r) => (
          <li key={r}>
            <button onClick={() => toast("Demo only")} className="flex min-h-14 w-full items-center border-b border-muted px-4 text-left hover:bg-muted">
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
          Reset demo
        </button>
      </div>
    </div>
  );
}
