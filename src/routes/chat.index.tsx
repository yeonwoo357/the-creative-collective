import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/TopBar";
import { getCreative } from "@/lib/data";
import { timeAgo, useChats } from "@/lib/store";

export const Route = createFileRoute("/chat/")({
  head: () => ({
    meta: [
      { title: "Chat — NAMED Collective" },
      { name: "description", content: "Your conversations with the collective." },
      { property: "og:title", content: "Chat — NAMED Collective" },
      { property: "og:description", content: "Your conversations with the collective." },
    ],
  }),
  component: ChatList,
});

function ChatList() {
  const [chats, , ready] = useChats();
  const [now, setNow] = useState(0);
  useEffect(() => setNow(Date.now()), []);
  return (
    <div className="flex-1">
      <PageHeader title="Chat" />
      {ready && chats.length === 0 ? (
        <div className="px-4 py-16 text-center">
          <p className="font-semibold">No chats yet.</p>
          <p className="mt-1 text-sm text-muted-foreground">Find someone you vibe with and hit Contact.</p>
          <Link to="/search" className="btn btn-primary mt-6">Find someone</Link>
        </div>
      ) : (
        <ul>
          {chats.map((ch) => {
            const c = getCreative(ch.creativeId);
            const last = ch.messages.at(-1);
            if (!c) return null;
            return (
              <li key={ch.id} className="border-b border-muted">
                <Link to="/chat/$id" params={{ id: ch.id }} className="flex min-h-16 items-center gap-3 px-4 py-3 hover:bg-muted">
                  <img src={c.avatar} alt="" className="size-11 rounded-full object-cover" />
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">{c.name}</span>
                    <span className="block truncate text-sm text-muted-foreground">
                      {ch.blocked ? "Blocked" : `${last?.from === "me" ? "You: " : ""}${last?.text ?? ""}`}
                    </span>
                  </span>
                  <span className="self-start pt-1 text-xs text-muted-foreground">{last && now ? timeAgo(last.at, now) : ""}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
