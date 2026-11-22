import { describe, expect, it } from "vitest";
import { EVENTS, defaultDay, goingCount, spotsLeft, WEEK } from "./events";
import { getCreative } from "./data";

describe("sample events", () => {
  it("hosts and attendees are existing creatives", () => {
    for (const e of EVENTS) for (const id of [e.hostId, ...e.attendees]) expect(getCreative(id)).toBeTruthy();
  });
  it("all dates fall in the 19–24 Nov 2026 week", () => {
    for (const e of EVENTS) expect(WEEK).toContain(e.date);
  });
  it("joining adds one to going and removes one spot", () => {
    const e = EVENTS[0]!;
    expect(goingCount(e, true)).toBe(e.attendees.length + 1);
    expect(spotsLeft(e, true)).toBe(spotsLeft(e, false) - 1);
  });
  it("default day has an available event", () => {
    expect(EVENTS.some((e) => e.date === defaultDay([]))).toBe(true);
  });
});
