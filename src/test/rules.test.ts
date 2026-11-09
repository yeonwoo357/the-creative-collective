import { describe, expect, it } from "vitest";
import { sendMessage, seedChats } from "@/lib/store";
import { searchWork } from "@/lib/data";

describe("chat (demo)", () => {
  it("sending to someone new creates a conversation at the top with the portfolio attached", () => {
    const chats = seedChats(1000);
    const out = sendMessage(chats, "mira-vale", " hi! ", { portfolio: true, now: 2000, id: "m1" });
    expect(out).toHaveLength(4);
    expect(out[0]).toMatchObject({ creativeId: "mira-vale", messages: [{ text: "hi!", from: "me", portfolio: true }] });
  });
  it("seeds 3 example conversations", () => {
    expect(seedChats(0)).toHaveLength(3);
  });
});

describe("search work", () => {
  it("matches on neighbourhood", () => {
    const r = searchWork("peckham", "All");
    expect(r.length).toBeGreaterThan(0);
    expect(r.every((x) => x.creative.neighbourhood === "Peckham")).toBe(true);
  });
  it("matches on tags", () => {
    expect(searchWork("mullets", "All").map((x) => x.creative.id)).toContain("onyx-reed");
  });
});
