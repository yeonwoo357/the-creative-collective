import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { MoreHorizontal, Send } from "@/components/PixelIcons";
import { toast } from "sonner";
import { BackButton } from "@/components/TopBar";
import { MyPortfolioCard } from "@/components/MyPortfolioCard";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { getCreative } from "@/lib/data";
import { ONBOARDING_KEY, sendMessage, timeAgo, useChats, useLocal, useMyProfile, type Onboarding } from "@/lib/store";

export const Route = createFileRoute("/chat/$id")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Conversation — NAMED Collective" },
      { name: "description", content: "A conversation in the collective." },
      { property: "og:title", content: "Conversation — NAMED Collective" },
      { property: "og:description", content: "A conversation in the collective." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Thread,
});

const REASONS = ["Spam or scam", "Harassment", "Inappropriate content", "Pretending to be someone", "Something else"];

function Thread() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [chats, setChats, ready] = useChats();
  const [profile] = useMyProfile();
  const [ob] = useLocal<Onboarding | null>(ONBOARDING_KEY, null);
  const [text, setText] = useState("");
  const [reportOpen, setReportOpen] = useState(false);
  const [now, setNow] = useState(0);
  const end = useRef<HTMLDivElement>(null);
  const convo = chats.find((c) => c.id === id);
  const c = getCreative(convo?.creativeId ?? id);

  useEffect(() => setNow(Date.now()), [convo?.messages.length]);
  useEffect(() => end.current?.scrollIntoView({ block: "end" }), [convo?.messages.length]);

  if (!c) return <p className="p-8 text-center">This chat has wandered off.</p>;
  const messages = convo?.messages ?? [];
  const blocked = !!convo?.blocked;
  const setBlocked = (b: boolean) => {
    setChats(chats.map((ch) => (ch.id === id ? { ...ch, blocked: b } : ch)));
    toast(b ? `${c.name} is blocked. They can't message you.` : `${c.name} unblocked.`);
  };

  return (
    <div className="flex h-dvh flex-col">
      <header className="flex items-center gap-2 border-b border-muted px-4 py-3">
        <BackButton className="border-0" />
        <Link to="/profile/$id" params={{ id: c.id }} className="flex min-h-11 flex-1 items-center gap-2">
          <img src={c.avatar} alt="" className="size-9 rounded-full object-cover" />
          <span>
            <span className="block font-semibold">{c.name}</span>
            <span className="block text-xs text-muted-foreground">{c.role} · {c.neighbourhood}</span>
          </span>
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger aria-label="Conversation options" className="flex size-11 items-center justify-center rounded-full border border-foreground">
            <MoreHorizontal className="size-5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-md border-foreground font-mono">
            <DropdownMenuItem className="min-h-11" onSelect={() => navigate({ to: "/profile/$id", params: { id: c.id } })}>View profile</DropdownMenuItem>
            <DropdownMenuItem className="min-h-11" onSelect={() => setBlocked(!blocked)}>{blocked ? "Unblock" : "Block"} {c.name.split(" ")[0]}</DropdownMenuItem>
            <DropdownMenuItem className="min-h-11" onSelect={() => setReportOpen(true)}>Report</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {ready && messages.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">No messages yet. Say hi!</p>
        )}
        {messages.map((m) => {
          const mine = m.from === "me";
          return (
            <div key={m.id} className={`flex flex-col ${mine ? "items-end" : "items-start"}`}>
              <div className={`max-w-[80%] space-y-2 ${mine ? "items-end" : ""}`}>
                <p className={`rounded-md px-3 py-2 text-sm ${mine ? "bg-foreground text-background" : "border border-line"}`}>{m.text}</p>
                {m.portfolio && mine && (
                  <div className="w-56"><MyPortfolioCard profile={profile} name={ob?.name || "You"} compact /></div>
                )}
              </div>
              <span className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">{now ? timeAgo(m.at, now) : ""}</span>
            </div>
          );
        })}
        <div ref={end} />
      </div>

      {blocked ? (
        <div className="border-t border-muted px-4 py-4 text-center text-sm">
          <p>You blocked {c.name}.</p>
          <button className="link-u min-h-11" onClick={() => setBlocked(false)}>Unblock</button>
        </div>
      ) : (
        <form
          className="flex items-center gap-2 border-t border-muted px-4 py-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!text.trim()) return;
            setChats(sendMessage(chats, c.id, text, { now: Date.now(), id: crypto.randomUUID() }));
            setText("");
          }}
        >
          <label htmlFor="reply" className="sr-only">Message</label>
          <input id="reply" className="field rounded-full" placeholder="Message…" value={text} onChange={(e) => setText(e.target.value)} />
          <button aria-label="Send" disabled={!text.trim()} className="btn btn-primary size-12 shrink-0 rounded-full p-0">
            <Send className="size-4" />
          </button>
        </form>
      )}

      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent className="max-w-[360px] rounded-md border-foreground font-mono">
          <DialogTitle className="uppercase tracking-wide">Report {c.name}</DialogTitle>
          <DialogDescription>What's going on? The collective team will take a look.</DialogDescription>
          <div className="flex flex-col gap-2">
            {REASONS.map((r) => (
              <button
                key={r}
                className="btn btn-secondary w-full justify-start"
                onClick={() => {
                  setReportOpen(false);
                  toast("Thanks for telling us. We'll look into it (demo only).");
                }}
              >
                {r}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
