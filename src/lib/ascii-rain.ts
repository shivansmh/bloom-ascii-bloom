export const RAIN_INTERVAL_MS = 30_000;
export const RAIN_DURATION_MS = 5_000;
export const RAIN_RETRACTION_MS = 900;

export function getRainState(elapsed: number) {
  const cycle = elapsed % RAIN_INTERVAL_MS;
  if (elapsed < RAIN_INTERVAL_MS || cycle >= RAIN_DURATION_MS + RAIN_RETRACTION_MS) {
    return { phase: "idle" as const, progress: 0 };
  }
  if (cycle < RAIN_DURATION_MS) {
    return { phase: "raining" as const, progress: cycle / RAIN_DURATION_MS };
  }
  return {
    phase: "retracting" as const,
    progress: (cycle - RAIN_DURATION_MS) / RAIN_RETRACTION_MS,
  };
}