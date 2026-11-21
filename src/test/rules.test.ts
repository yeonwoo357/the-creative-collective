import { describe, expect, it } from "vitest";
import {
  EMPTY_PROFILE,
  sendMessage,
  seedChats,
  avatarOf,
  setConversationMuted,
  toggleMessageLike,
  motionIsReduced,
} from "@/lib/store";
import { searchWork } from "@/lib/data";
import { creatives, hoodCoords, isVerified } from "@/lib/data";
import { rankCreatives, savedGlobeIds, SAMPLE_SERVICES, VERIFICATION_NOTICE } from "@/lib/discovery";

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
  it("likes only the chosen message and toggles it back off", () => {
    const chats = seedChats(0);
    const liked = toggleMessageLike(chats, "vesper-lux", "s1");
    expect(liked[0]?.messages[0]?.liked).toBe(true);
    expect(liked[0]?.messages[1]?.liked).toBeUndefined();
    expect(liked[1]).toBe(chats[1]);
    expect(toggleMessageLike(liked, "vesper-lux", "s1")[0]?.messages[0]?.liked).toBe(false);
  });
  it("mutes only the chosen conversation", () => {
    const chats = seedChats(0);
    const muted = setConversationMuted(chats, "onyx-reed", true);
    expect(muted.find((chat) => chat.id === "onyx-reed")?.muted).toBe(true);
    expect(muted.find((chat) => chat.id === "vesper-lux")?.muted).toBeUndefined();
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

describe("creative photos", () => {
  it("are local and described; existing profiles keep their own images", async () => {
    const { creatives, altOf } = await import("@/lib/data");
    const owner = new Map<string, string>();
    for (const c of creatives.filter((person) => !["Fashion", "Modelling"].includes(person.category)))
      for (const src of [c.avatar, c.cover, ...c.work, ...c.projects.flatMap((p) => p.images)]) {
        expect(src.startsWith("/images/")).toBe(true);
        expect(altOf(src)).toBeTruthy();
        expect(owner.get(src) ?? c.id).toBe(c.id);
        owner.set(src, c.id);
      }
  });
});

describe("remaining discovery batch", () => {
  it("For you ranks saved discipline and tags with the saved person's name", () => {
    const list = creatives.filter((c) => ["dove-cassidy", "kit-ember"].includes(c.id));
    const ranked = rankCreatives(list, "For you", ["mira-vale"], [], hoodCoords("Hackney"));
    expect(ranked[0]?.c.id).toBe("dove-cassidy");
    expect(ranked[0]?.interest.label).toBe("Because you saved Mira Vale");
  });
  it("For you uses recently viewed disciplines too", () => {
    const ranked = rankCreatives(creatives.filter((c) => ["ivo-sterne", "onyx-reed"].includes(c.id)), "For you", [], ["kit-ember"], hoodCoords("Hackney"));
    expect(ranked[0]?.c.id).toBe("ivo-sterne");
  });
  it("Nearest ignores interests and measures neighbourhood centroids", () => {
    const ranked = rankCreatives(creatives, "Nearest", ["ivo-sterne"], [], hoodCoords("Hackney"));
    expect(ranked[0]?.km).toBe(0);
    expect(ranked.every((r, i) => i === 0 || r.km >= (ranked[i - 1]?.km ?? 0))).toBe(true);
  });
  it("saved globe includes only saved valid creatives", () => {
    expect(savedGlobeIds(["mira-vale", "kit-ember", "missing"], creatives)).toBe("mira-vale,kit-ember");
  });
  it("keeps the existing mock verified selection", () => {
    expect(isVerified("mira-vale")).toBe(true);
    expect(isVerified("onyx-reed")).toBe(false);
  });
  it("offers 3–4 sample services per discipline with the requested tattoo example", () => {
    expect(SAMPLE_SERVICES.Tattoo).toContain("Fine-line piece · from £80");
    expect(Object.values(SAMPLE_SERVICES).every((items) => items.length >= 3 && items.length <= 4)).toBe(true);
  });
  it("mock verification stops with the exact prototype notice", () => {
    expect(VERIFICATION_NOTICE).toBe("Prototype: verification not active");
  });
});

describe("launch disciplines and accessibility", () => {
  it("includes every launch discipline and keeps category keys stable", async () => {
    const { FILTERS, DISCIPLINES, searchCreatives } = await import("@/lib/data");
    for (const category of ["Tattoo", "Hair", "Piercing", "Nails", "Art & Illustration", "Photographer", "DJ", "Stylist", "Fashion", "Modelling"] as const) {
      expect(FILTERS).toContain(category);
      expect(DISCIPLINES).toContain(category);
      expect(searchCreatives("", category).length).toBeGreaterThan(0);
    }
  });
  it("new Fashion and Modelling samples only reuse existing stylist/photographer paths", () => {
    for (const category of ["Fashion", "Modelling"]) {
      const samples = creatives.filter((c) => c.category === category);
      expect(samples.length).toBeGreaterThanOrEqual(1);
      expect(samples.length).toBeLessThanOrEqual(2);
      for (const c of samples) {
        expect([c.avatar, c.cover, ...c.work].every((src) => src.startsWith(category === "Fashion" ? "/images/nyx-calder-" : "/images/vesper-lux-"))).toBe(true);
        expect(hoodCoords(c.neighbourhood)).toEqual([c.lat, c.lng]);
      }
    }
  });
  it("the system reduced-motion preference cannot be switched off", () => {
    expect(motionIsReduced(true, false)).toBe(true);
    expect(motionIsReduced(false, true)).toBe(true);
    expect(motionIsReduced(false, false)).toBe(false);
  });
});
