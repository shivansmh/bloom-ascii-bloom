export const RAIN_GLYPHS = [
  "|", "/", "\\", "~", ":", ";", ".", "'", "`", "+", "*", "#", "%", "&",
  "?", "!", "^", "_", "-", "=", "<", ">", "x", "o", "0", "1",
] as const;

export type RainDrop = {
  x: number;
  phase: number;
  speed: number;
  drift: number;
  glyph: (typeof RAIN_GLYPHS)[number];
  opacity: number;
};

export function createRainDrops(
  count: number,
  random: () => number = Math.random,
): RainDrop[] {
  const total = Math.max(0, Math.floor(count));

  return Array.from({ length: total }, (_, index) => {
    const glyphIndex = Math.min(
      RAIN_GLYPHS.length - 1,
      Math.floor(random() * RAIN_GLYPHS.length),
    );

    return {
      x: (index + 0.5) / Math.max(1, total),
      phase: random(),
      speed: 50 + random() * 70,
      drift: random() * Math.PI * 2,
      glyph: RAIN_GLYPHS[glyphIndex] ?? "|",
      opacity: 0.12 + random() * 0.16,
    };
  });
}
