import { describe, expect, it } from "vitest";
import {
  EMPTY_PROFILE,
  sendMessage,
  seedChats,
  avatarOf,
  setConversationMuted,
  toggleMessageLike,
} from "@/lib/store";
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

describe("profile photo", () => {
  it("starts empty so a new member shows the placeholder", () => {
    expect(EMPTY_PROFILE.avatar).toBe("");
    expect(avatarOf(EMPTY_PROFILE)).toBe("");
  });
  it("uses the chosen photo over portfolio images", () => {
    const p = { ...EMPTY_PROFILE, avatar: "pic.png", media: [{ src: "work.png", type: "image" as const }] };
    expect(avatarOf(p)).toBe("pic.png");
  });
  it("falls back to the first piece of work when no photo is set", () => {
    const p = { ...EMPTY_PROFILE, media: [{ src: "v.mp4", type: "video" as const }, { src: "w.png", type: "image" as const }] };
    expect(avatarOf(p)).toBe("w.png");
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
