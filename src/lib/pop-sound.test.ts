import { afterEach, describe, expect, it, vi } from "vitest";
import { playPop } from "./pop-sound";

describe("sound toggle", () => {
  afterEach(() => vi.unstubAllGlobals());
  it("does not create audio when sound is switched off", () => {
    const audio = vi.fn();
    vi.stubGlobal("AudioContext", audio);
    playPop(false);
    expect(audio).not.toHaveBeenCalled();
  });
});