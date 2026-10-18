import { describe, expect, it } from "vitest";
import { getWindStrength, WIND_DURATION_MS } from "./wind";

describe("page-load wind", () => {
  it("eases in, holds briefly, then eases back to stillness", () => {
    expect(getWindStrength(-100)).toBe(0);
    expect(getWindStrength(0)).toBe(0);
    expect(getWindStrength(425)).toBeCloseTo(0.5, 2);
    expect(getWindStrength(1_200)).toBe(1);
    expect(getWindStrength(3_000)).toBeGreaterThan(0);
    expect(getWindStrength(3_000)).toBeLessThan(1);
    expect(getWindStrength(WIND_DURATION_MS)).toBe(0);
    expect(getWindStrength(WIND_DURATION_MS + 100)).toBe(0);
  });
});
