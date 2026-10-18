// Page-load gust: bends in, gusts/struggles, then recovers at the same speed it bent.
export const WIND_DURATION_MS = 5_000;
export const WIND_RAMP_MS = 900;
const WIND_RECOVER_START_MS = WIND_DURATION_MS - WIND_RAMP_MS;

const smoothstep = (value: number) => {
  const t = Math.max(0, Math.min(1, value));
  return t * t * (3 - 2 * t);
};

export function getWindStrength(elapsedMs: number): number {
  const elapsed = Math.max(0, elapsedMs);
  if (elapsed >= WIND_DURATION_MS) return 0;
  if (elapsed <= WIND_RAMP_MS) return smoothstep(elapsed / WIND_RAMP_MS);
  if (elapsed < WIND_RECOVER_START_MS) return 1;
  return 1 - smoothstep((elapsed - WIND_RECOVER_START_MS) / WIND_RAMP_MS);
}

/** Read the shared wind value (0..1) set on <html> by the index route. */
export function readWind(): number {
  if (typeof document === "undefined") return 0;
  const v = Number(document.documentElement.style.getPropertyValue("--wind-progress")) || 0;
  return Math.max(0, Math.min(1, v));
}
