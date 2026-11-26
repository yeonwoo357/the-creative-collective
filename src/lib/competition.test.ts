import { describe, expect, it } from "vitest";
import {
  MAX_DAILY_VOTES,
  SAMPLE_TEAMS,
  activeVotes,
  localDayKey,
  pickNextRandom,
  shuffle,
  toggleVote,
  votesLeft,
  type VoteStore,
} from "./competition";

describe("GET NAMED competition data & vote rules", () => {
  it("seeds 8 sample teams with max 4 members, open spots, a solo team, and 4 entry images each", () => {
    expect(SAMPLE_TEAMS).toHaveLength(8);
    expect(SAMPLE_TEAMS.some((t) => t.openSpots.length > 0)).toBe(true);
    expect(SAMPLE_TEAMS.some((t) => t.isSolo && t.size === 1)).toBe(true);
    for (const t of SAMPLE_TEAMS) {
      expect(t.members.length).toBeLessThanOrEqual(4);
      expect(t.members.length + t.openSpots.length).toBeLessThanOrEqual(4);
      expect(t.entry?.images).toHaveLength(4);
    }
  });

  it("allows up to 4 votes per day and refuses a 5th vote", () => {
    const day = "2026-11-26";
    let store: VoteStore = { day, ids: [] };
    for (const id of ["t1", "t2", "t3", "t4"]) {
      const res = toggleVote(store, id, day);
      expect(res.ok).toBe(true);
      store = res.store;
    }
    expect(votesLeft(store, day)).toBe(0);
    const fifth = toggleVote(store, "t5", day);
    expect(fifth.ok).toBe(false);
    if (!fifth.ok) expect(fifth.reason).toBe("limit");
    expect(fifth.store.ids).toHaveLength(MAX_DAILY_VOTES);
  });

  it("frees a slot when removing a vote", () => {
    const day = "2026-11-26";
    const full: VoteStore = { day, ids: ["t1", "t2", "t3", "t4"] };
    const removed = toggleVote(full, "t2", day);
    expect(removed.ok).toBe(true);
    if (removed.ok) expect(removed.added).toBe(false);
    expect(votesLeft(removed.store, day)).toBe(1);
    const added = toggleVote(removed.store, "t5", day);
    expect(added.ok).toBe(true);
    expect(added.store.ids).toContain("t5");
  });

  it("resets votes at local midnight (new day key)", () => {
    const yesterday: VoteStore = { day: "2026-11-25", ids: ["t1", "t2", "t3", "t4"] };
    const today = localDayKey(new Date(2026, 10, 26, 0, 1));
    expect(today).toBe("2026-11-26");
    expect(activeVotes(yesterday, today)).toEqual([]);
    expect(votesLeft(yesterday, today)).toBe(4);
  });

  it("blocks voting for the user's own team", () => {
    const day = "2026-11-26";
    const res = toggleVote({ day, ids: [] }, "my-team", day, ["my-team"]);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.reason).toBe("own-team");
  });

  it("shuffles without mutating input and picks a different next random team", () => {
    const ids = ["a", "b", "c", "d"];
    const out = shuffle(ids, () => 0);
    expect(out).toHaveLength(4);
    expect(new Set(out)).toEqual(new Set(ids));
    expect(ids).toEqual(["a", "b", "c", "d"]);
    expect(pickNextRandom(ids, "b", () => 0)).toBe("a");
  });
});