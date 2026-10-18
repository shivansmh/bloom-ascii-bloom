import { describe, expect, it } from "vitest";
import { getRainState } from "./ascii-rain";

describe("ASCII shower timing", () => {
  it("starts a shower every 30 seconds, not on arrival", () => {
    expect(getRainState(29_999).phase).toBe("idle");
    expect(getRainState(30_000).phase).toBe("raining");
    expect(getRainState(60_000).phase).toBe("raining");
    expect(getRainState(90_000).phase).toBe("raining");
  });
  it("rains for five seconds then retreats upward", () => {
    expect(getRainState(34_999).phase).toBe("raining");
    expect(getRainState(35_000)).toEqual({ phase: "retracting", progress: 0 });
    expect(getRainState(35_450)).toEqual({ phase: "retracting", progress: 0.5 });
    expect(getRainState(35_900).phase).toBe("idle");
  });
});