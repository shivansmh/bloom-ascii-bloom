import { describe, expect, it } from "vitest";
import { createRainDrops, RAIN_GLYPHS } from "./ascii-rain";

describe("ASCII rain", () => {
  it("uses a varied set of punctuation and symbols for rain drops", () => {
    const values = [0, 0.8, 0.25, 0.12, 0.3, 0.75];
    let index = 0;
    const drops = createRainDrops(6, () => values[index++ % values.length]!);

    expect(drops).toHaveLength(6);
    expect(new Set(drops.map((drop) => drop.glyph)).size).toBeGreaterThan(2);
    expect(drops.every((drop) => RAIN_GLYPHS.includes(drop.glyph))).toBe(true);
    expect(drops.every((drop) => drop.speed >= 50 && drop.speed < 120)).toBe(true);
  });

  it("spaces rain streams evenly across the canvas", () => {
    const drops = createRainDrops(4, () => 0.5);

    expect(drops.map((drop) => drop.x)).toEqual([0.125, 0.375, 0.625, 0.875]);
    expect(createRainDrops(0)).toEqual([]);
  });
});
