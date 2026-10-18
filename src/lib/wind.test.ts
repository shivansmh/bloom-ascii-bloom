import { describe, expect, it } from "vitest";
import { getWindStrength, WIND_DURATION_MS, WIND_RAMP_MS } from "./wind";

describe("page-load wind", () => {
  it("lasts 5 seconds and ends at rest", () => {
    expect(WIND_DURATION_MS).toBe(5_000);
    expect(getWindStrength(0)).toBe(0);
    expect(getWindStrength(2_500)).toBe(1);
    expect(getWindStrength(5_000)).toBe(0);
    expect(getWindStrength(6_000)).toBe(0);
  });

  it("recovers at the same speed it bent", () => {
    const t = WIND_RAMP_MS * 0.3;
    expect(getWindStrength(t)).toBeCloseTo(getWindStrength(WIND_DURATION_MS - t), 5);
  });
});
