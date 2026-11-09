import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { BackButton } from "@/components/TopBar";
import { ProfileForm } from "@/components/ProfileForm";
import { LayoutToggle } from "@/components/Portfolio";
import { PROFILE_KEY, useMyProfile, writeLocal } from "@/lib/store";
import { useState } from "react";

export const Route = createFileRoute("/edit-profile")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Edit profile — NAMED Collective" },
      { name: "description", content: "Update your work, socials, about and neighbourhood." },
      { property: "og:title", content: "Edit profile — NAMED Collective" },
      { property: "og:description", content: "Update your work, socials, about and neighbourhood." },
    ],
  }),
  component: EditProfile,
});

function EditProfile() {
  const navigate = useNavigate();
  const [profile, , ready] = useMyProfile();
  const [layout, setLayout] = useState<"carousel" | "grid" | null>(null);
  return (
    <div className="flex-1 px-4 pb-10 pt-4">
      <div className="flex items-center gap-2">
        <BackButton className="border-0" />
        <h1 className="text-2xl font-semibold uppercase tracking-wide">Edit profile</h1>
      </div>
      {ready && (
        <div className="mt-6">
          <ProfileForm
            initial={profile}
            submitLabel="Save"
            onSave={(p) => {
              const ok = writeLocal(PROFILE_KEY, { ...p, layout: layout ?? profile.layout });
              if (!ok) return void toast("That's a lot of work! Remove a video or two and try again.");
              toast("Saved. Looking good.");
              navigate({ to: "/me" });
            }}
          >
            <div>
              <p className="label">How visitors see your portfolio</p>
              <div className="mt-2"><LayoutToggle value={layout ?? profile.layout} onChange={setLayout} /></div>
            </div>
          </ProfileForm>
        </div>
      )}
    </div>
  );
}
