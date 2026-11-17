import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { BackButton } from "@/components/TopBar";
import { Check, User, ImageIcon } from "@/components/PixelIcons";
import { Button } from "@/components/ui/button";
import { VERIFICATION_NOTICE } from "@/lib/discovery";

export const Route = createFileRoute("/get-verified")({
  head: () => ({ meta: [
    { title: "Get verified — NAMED Collective" },
    { name: "description", content: "Preview the collective's proposed ID and selfie verification steps. No information is collected." },
    { property: "og:title", content: "Get verified — NAMED Collective" },
    { property: "og:description", content: "Mock verification preview; no documents or selfies are collected." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: GetVerified,
});

function GetVerified() {
  const [stopped, setStopped] = useState(false);
  return <div className="flex-1 px-4 pb-8">
    <header className="flex items-center gap-2 pt-4"><BackButton /><h1 className="text-2xl font-bold uppercase">Get verified</h1></header>
    <div className="mt-8 flex items-center gap-2"><Check className="size-6" /><h2 className="text-lg font-bold uppercase">Verified in the collective</h2></div>
    <ol className="mt-6 space-y-6">
      <li className="flex gap-3"><ImageIcon className="mt-1 size-6 shrink-0" /><div><h3 className="font-bold uppercase">1. Photo ID</h3><p className="mt-1 text-sm text-muted-foreground">A future check would confirm your identity using a photo ID.</p></div></li>
      <li className="flex gap-3"><User className="mt-1 size-6 shrink-0" /><div><h3 className="font-bold uppercase">2. Selfie check</h3><p className="mt-1 text-sm text-muted-foreground">A future selfie check would match you to your ID.</p></div></li>
    </ol>
    <p className="mt-8 text-sm text-muted-foreground">Mock only. No ID, selfie or personal information is uploaded or collected here.</p>
    <Button variant="ghost" className="btn btn-primary mt-6 min-h-11 w-full whitespace-normal" onClick={() => setStopped(true)}>{stopped ? VERIFICATION_NOTICE : "Get verified"}</Button>
    {stopped && <p className="mt-3 text-sm" role="status">{VERIFICATION_NOTICE}</p>}
  </div>;
}