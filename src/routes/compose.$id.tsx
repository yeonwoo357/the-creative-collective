import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Copy, Instagram } from "lucide-react";
import { toast } from "sonner";
import { BackButton } from "@/components/TopBar";
import { MyPortfolioCard } from "@/components/MyPortfolioCard";
import { getCreative } from "@/lib/data";
import { ONBOARDING_KEY, sendMessage, useChats, useLocal, useMyProfile, type Onboarding } from "@/lib/store";

export const Route = createFileRoute("/compose/$id")({
  loader: ({ params }) => {
    const c = getCreative(params.id);
    if (!c) throw notFound();
    return c;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `Message ${loaderData.name} — NAMED` : "Unavailable — NAMED" },
      { name: "description", content: "Send a message with your portfolio attached." },
      { property: "og:title", content: "Say hi — NAMED Collective" },
      { property: "og:description", content: "Send a message with your portfolio attached." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ComposePage,
});

function ComposePage() {
  const c = Route.useLoaderData();
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [ob] = useLocal<Onboarding | null>(ONBOARDING_KEY, null);
  const [profile] = useMyProfile();
  const [chats, setChats] = useChats();
  const first = c.name.split(" ")[0];
  const handle = `@${c.instagram}`;

  const send = () => {
    if (!text.trim()) return;
    setChats(sendMessage(chats, c.id, text, { portfolio: true, now: Date.now(), id: crypto.randomUUID() }));
    navigate({ to: "/chat/$id", params: { id: c.id }, replace: true });
  };

  return (
    <div className="flex flex-1 flex-col px-4 pb-8 pt-4">
      <div className="flex items-center gap-2">
        <BackButton className="border-0" />
        <h1 className="text-xl font-semibold">Say hi to {first}</h1>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <img src={c.avatar} alt={c.name} className="size-10 rounded-full object-cover" />
        <div>
          <p className="font-semibold">{c.name}</p>
          <p className="text-xs text-muted-foreground">{c.role} · {c.neighbourhood}</p>
        </div>
      </div>
      <form className="mt-5 flex flex-col" onSubmit={(e) => { e.preventDefault(); send(); }}>
        <label htmlFor="msg" className="label">Your message</label>
        <textarea
          id="msg"
          className="field mt-2 min-h-32 py-3"
          placeholder={`Hey ${first}, love your work — …`}
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={600}
        />
        <p className="label mt-5">Sent with your message</p>
        <div className="mt-2">
          <MyPortfolioCard profile={profile} name={ob?.name || "You"} />
        </div>
        <button className="btn btn-primary mt-5 w-full" disabled={!text.trim()}>Send</button>
      </form>
      <p className="mt-3 text-center text-xs text-muted-foreground">Demo only — nothing leaves your phone.</p>

      <div className="mt-8 border-t border-dashed border-line pt-5">
        <p className="label">Or reach them on Instagram</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <a href={`https://instagram.com/${c.instagram}`} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
            <Instagram className="size-4" /> Open Instagram
          </a>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => { navigator.clipboard?.writeText(handle).catch(() => {}); toast(`Copied ${handle}`); }}
          >
            <Copy className="size-4" /> Copy handle
          </button>
        </div>
      </div>
      <Link to="/profile/$id" params={{ id: c.id }} className="sr-only">Back to profile</Link>
    </div>
  );
}
