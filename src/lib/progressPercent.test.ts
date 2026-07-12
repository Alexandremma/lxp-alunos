import { describe, expect, it } from "vitest";
import {
  averageProgressPercent,
  clampProgressPercent,
  courseProgressFromCompletedCount,
  lessonProgressPercent,
} from "@/lib/progressPercent";

describe("clampProgressPercent", () => {
  it("clamps to 0–100 and rounds", () => {
    expect(clampProgressPercent(-10)).toBe(0);
    expect(clampProgressPercent(150)).toBe(100);
    expect(clampProgressPercent(33.4)).toBe(33);
    expect(clampProgressPercent(33.5)).toBe(34);
  });

  it("returns 0 for non-finite values", () => {
    expect(clampProgressPercent(Number.NaN)).toBe(0);
    expect(clampProgressPercent(Number.POSITIVE_INFINITY)).toBe(0);
  });
});

describe("lessonProgressPercent", () => {
  it("returns 0 when there are no lessons", () => {
    expect(lessonProgressPercent(0, 0)).toBe(0);
    expect(lessonProgressPercent(5, 0)).toBe(0);
  });

  it("matches TrailDetail formula (completed / total)", () => {
    expect(lessonProgressPercent(1, 4)).toBe(25);
    expect(lessonProgressPercent(2, 3)).toBe(67);
    expect(lessonProgressPercent(3, 3)).toBe(100);
  });
});

describe("courseProgressFromCompletedCount", () => {
  it("returns 0 when total is 0", () => {
    expect(courseProgressFromCompletedCount(0, 0)).toBe(0);
  });

  it("computes percent from completed linked disciplines", () => {
    expect(courseProgressFromCompletedCount(1, 4)).toBe(25);
    expect(courseProgressFromCompletedCount(2, 2)).toBe(100);
  });
});

describe("averageProgressPercent", () => {
  it("returns 0 for empty list", () => {
    expect(averageProgressPercent([])).toBe(0);
  });

  it("averages and clamps", () => {
    expect(averageProgressPercent([0, 100])).toBe(50);
    expect(averageProgressPercent([25, 75, 50])).toBe(50);
  });
});
