import { describe, expect, it } from "vitest";
import {
  MAX_VOTES_PER_DAY,
  NO_VOTES,
  TEAMS,
  dayKey,
  openSpots,
  shuffled,
  toggleVote,
  votesToday,
} from "@/lib/competition";
import { getCreative } from "@/lib/data";

describe("Get Named votes", () => {
  const day = "2026-11-26";
  it("allows up to 4 teams a day and refuses a 5th", () => {
    let v = NO_VOTES;
    for (const t of TEAMS.slice(0, MAX_VOTES_PER_DAY)) v = toggleVote(v, t.id, day);
    expect(votesToday(v, day)).toHaveLength(4);
    expect(toggleVote(v, TEAMS[4]!.id, day)).toBe(v);
  });
  it("removing a vote frees a slot", () => {
    let v = NO_VOTES;
    for (const t of TEAMS.slice(0, 4)) v = toggleVote(v, t.id, day);
    v = toggleVote(v, TEAMS[0]!.id, day);
    expect(votesToday(v, day)).toHaveLength(3);
    expect(votesToday(toggleVote(v, TEAMS[5]!.id, day), day)).toContain(TEAMS[5]!.id);
  });
  it("resets on a new day", () => {
    const v = toggleVote(NO_VOTES, TEAMS[0]!.id, day);
    expect(votesToday(v, "2026-11-27")).toEqual([]);
    expect(votesToday(toggleVote(v, TEAMS[1]!.id, "2026-11-27"), "2026-11-27")).toEqual([
      TEAMS[1]!.id,
    ]);
  });
  it("uses the local calendar day", () => {
    expect(dayKey(new Date(2026, 0, 5, 23, 30))).toBe("2026-01-05");
  });
});

describe("Get Named teams", () => {
  it("shuffles without losing or duplicating teams", () => {
    const ids = TEAMS.map((t) => t.id);
    let k = 0;
    const out = shuffled(ids, () => [0.9, 0.1, 0.5, 0.3, 0.7, 0.2, 0.8][k++ % 7]!);
    expect([...out].sort()).toEqual([...ids].sort());
    expect(out).not.toEqual(ids);
  });
  it("every team has at most 4 people, real members and an entry with images", () => {
    for (const t of TEAMS) {
      expect(t.size).toBeLessThanOrEqual(4);
      expect(t.members.length).toBeLessThanOrEqual(t.size);
      expect(t.openRoles.length).toBe(openSpots(t));
      for (const m of t.members) expect(getCreative(m)).toBeDefined();
      expect(t.entry.images.length).toBeGreaterThanOrEqual(3);
    }
  });
});
