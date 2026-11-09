import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Heart, MessageCircle, MoreHorizontal, Send, User } from "@/components/PixelIcons";
import { toast } from "sonner";
import { BackButton } from "@/components/TopBar";
import { MyPortfolioCard } from "@/components/MyPortfolioCard";
import { CreativePortfolio } from "@/components/CreativePortfolio";
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
import {
  ONBOARDING_KEY,
  sendMessage,
  setConversationMuted,
  timeAgo,
  toggleMessageLike,
  useChats,
  useLocal,
  useMyProfile,
  type Onboarding,
} from "@/lib/store";

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
type ThreadTab = "chat" | "portfolio";

function Thread() {
  const { id } = Route.useParams();
  const [chats, setChats, ready] = useChats();
  const [profile] = useMyProfile();
  const [ob] = useLocal<Onboarding | null>(ONBOARDING_KEY, null);
  const [tab, setTab] = useState<ThreadTab>("chat");
  const [text, setText] = useState("");
  const [reportOpen, setReportOpen] = useState(false);
  const [now, setNow] = useState(0);
  const end = useRef<HTMLDivElement>(null);
  const lastTap = useRef({ id: "", at: 0 });
  const convo = chats.find((chat) => chat.id === id);
  const c = getCreative(convo?.creativeId ?? id);

  useEffect(() => {
    setNow(Date.now());
  }, [convo?.messages.length]);
  useEffect(() => {
    if (tab === "chat") end.current?.scrollIntoView({ block: "end" });
  }, [tab, convo?.messages.length]);

  if (!c) return <p className="p-8 text-center">This chat has wandered off.</p>;
  const messages = convo?.messages ?? [];
  const blocked = !!convo?.blocked;
  const muted = !!convo?.muted;

  const setBlocked = (value: boolean) => {
    setChats(chats.map((chat) => (chat.id === id ? { ...chat, blocked: value } : chat)));
    toast(value ? `${c.name} is blocked. They can't message you.` : `${c.name} unblocked.`);
  };
  const setMuted = (value: boolean) => {
    setChats(setConversationMuted(chats, id, value));
    toast(value ? `${c.name} muted (demo only).` : `${c.name} unmuted.`);
  };
  const toggleLike = (messageId: string) => {
    setChats(toggleMessageLike(chats, id, messageId));
  };
  const onMessagePointerUp = (messageId: string) => {
    const at = Date.now();
    if (lastTap.current.id === messageId && at - lastTap.current.at <= 320) {
      toggleLike(messageId);
      lastTap.current = { id: "", at: 0 };
    } else {
      lastTap.current = { id: messageId, at };
    }
  };
  const onTabKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const next: ThreadTab = event.key === "Home"
      ? "chat"
      : event.key === "End"
        ? "portfolio"
        : tab === "chat" ? "portfolio" : "chat";
    setTab(next);
    requestAnimationFrame(() => document.getElementById(`${next}-tab`)?.focus());
  };

  return (
    <div className="flex h-dvh flex-col">
      <header className="flex shrink-0 items-center gap-2 border-b border-muted px-4 py-3">
        <BackButton className="border-0" />
        <Link
          to="/profile/$id"
          params={{ id: c.id }}
          className="flex min-h-11 min-w-0 flex-1 items-center gap-3"
          aria-label={`View ${c.name}'s profile`}
        >
          <img src={c.avatar} alt="" className="size-10 shrink-0 rounded-full object-cover" />
          <span className="min-w-0">
            <span className="block truncate font-semibold">{c.name}</span>
            <span className="block truncate text-xs text-muted-foreground">{c.role} · {c.neighbourhood}</span>
          </span>
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger aria-label="Conversation options" className="flex size-11 shrink-0 items-center justify-center rounded-full border border-foreground">
            <MoreHorizontal className="size-5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-md border-foreground font-mono">
            <DropdownMenuItem className="min-h-11" onSelect={() => setBlocked(!blocked)}>
              {blocked ? "Unblock" : "Block"} {c.name.split(" ")[0]}
            </DropdownMenuItem>
            <DropdownMenuItem className="min-h-11" onSelect={() => setReportOpen(true)}>Report</DropdownMenuItem>
            <DropdownMenuItem className="min-h-11" onSelect={() => setMuted(!muted)}>{muted ? "Unmute" : "Mute"}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <div
        role="tablist"
        aria-label="Conversation view"
        className="grid shrink-0 grid-cols-2 border-b border-muted px-4"
        onKeyDown={onTabKeyDown}
      >
        {(["chat", "portfolio"] as const).map((value) => (
          <button
            key={value}
            id={`${value}-tab`}
            role="tab"
            aria-selected={tab === value}
            aria-controls={`${value}-panel`}
            tabIndex={tab === value ? 0 : -1}
            onClick={() => setTab(value)}
            className={`flex min-h-12 items-center justify-center gap-2 border-b-2 text-sm font-semibold uppercase tracking-widest ${
              tab === value ? "border-foreground text-foreground" : "border-transparent text-muted-foreground"
            }`}
          >
            {value === "chat" ? <MessageCircle className="size-4" /> : <User className="size-4" />}
            {value}
          </button>
        ))}
      </div>

      {tab === "chat" ? (
        <div id="chat-panel" role="tabpanel" aria-labelledby="chat-tab" className="flex min-h-0 flex-1 flex-col">
          <div role="log" aria-label={`Messages with ${c.name}`} className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
            <p className="text-center text-xs text-muted-foreground">Double tap to like a message</p>
            {ready && messages.length === 0 && (
              <p className="py-10 text-center text-sm text-muted-foreground">No messages yet. Say hi!</p>
            )}
            {messages.map((message) => {
              const mine = message.from === "me";
              return (
                <div key={message.id} className={`flex items-end gap-2 ${mine ? "justify-end" : "justify-start"}`}>
                  {!mine && <img src={c.avatar} alt="" className="mb-6 size-8 shrink-0 rounded-full object-cover" />}
                  <div className={`flex max-w-[80%] flex-col ${mine ? "items-end" : "items-start"}`}>
                    <div
                      onPointerUp={() => onMessagePointerUp(message.id)}
                      className={`touch-manipulation rounded-md px-3 py-2 text-sm ${
                        mine ? "bg-foreground text-background" : "bg-secondary text-secondary-foreground"
                      }`}
                    >
                      {message.text}
                    </div>
                    {message.portfolio && mine && (
                      <div className="mt-2 w-56 max-w-full">
                        <MyPortfolioCard profile={profile} name={ob?.name || "You"} compact />
                      </div>
                    )}
                    <div className={`mt-1 flex items-center gap-1 ${mine ? "justify-end" : "justify-start"}`}>
                      <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                        {now ? timeAgo(message.at, now) : ""}
                      </span>
                      <button
                        type="button"
                        aria-label={message.liked ? "Remove message like" : "Like message"}
                        aria-pressed={!!message.liked}
                        onClick={() => toggleLike(message.id)}
                        className="-my-3 flex size-11 items-center justify-center"
                      >
                        <Heart className="size-4" active={!!message.liked} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={end} />
          </div>

          {blocked ? (
            <div className="shrink-0 border-t border-muted px-4 py-4 text-center text-sm">
              <p>You blocked {c.name}.</p>
              <button className="link-u min-h-11" onClick={() => setBlocked(false)}>Unblock</button>
            </div>
          ) : (
            <form
              className="flex shrink-0 items-center gap-2 border-t border-muted px-4 py-3"
              onSubmit={(event) => {
                event.preventDefault();
                if (!text.trim()) return;
                setChats(sendMessage(chats, c.id, text, { now: Date.now(), id: crypto.randomUUID() }));
                setText("");
              }}
            >
              <label htmlFor="reply" className="sr-only">Message</label>
              <input
                id="reply"
                className="field rounded-full"
                placeholder="Message…"
                value={text}
                onChange={(event) => setText(event.target.value)}
              />
              <button aria-label="Send" disabled={!text.trim()} className="btn btn-primary size-12 shrink-0 rounded-full p-0">
                <Send className="size-4" />
              </button>
            </form>
          )}
        </div>
      ) : (
        <div id="portfolio-panel" role="tabpanel" aria-labelledby="portfolio-tab" className="min-h-0 flex-1 overflow-y-auto">
          <CreativePortfolio creative={c} />
        </div>
      )}

      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent className="max-w-[360px] rounded-md border-foreground font-mono">
          <DialogTitle className="uppercase tracking-wide">Report {c.name}</DialogTitle>
          <DialogDescription>What's going on? The collective team will take a look.</DialogDescription>
          <div className="flex flex-col gap-2">
            {REASONS.map((reason) => (
              <button
                key={reason}
                className="btn btn-secondary w-full justify-start"
                onClick={() => {
                  setReportOpen(false);
                  toast("Thanks for telling us. We'll look into it (demo only).");
                }}
              >
                {reason}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
