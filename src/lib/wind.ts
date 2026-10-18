export const WIND_DURATION_MS = 5_200;
const WIND_RAMP_MS = 850;
const WIND_HOLD_END_MS = 2_100;

const smoothstep = (value: number) => {
  const t = Math.max(0, Math.min(1, value));
  return t * t * (3 - 2 * t);
};

export function getWindStrength(elapsedMs: number): number {
  const elapsed = Math.max(0, elapsedMs);
  if (elapsed <= WIND_RAMP_MS) return smoothstep(elapsed / WIND_RAMP_MS);
  if (elapsed <= WIND_HOLD_END_MS) return 1;
  const recovery = (elapsed - WIND_HOLD_END_MS) / (WIND_DURATION_MS - WIND_HOLD_END_MS);
  return 1 - smoothstep(recovery);
}
