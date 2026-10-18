import { afterEach, describe, expect, it, vi } from "vitest";
import { PreviewPlayer } from "./preview-player";

class FakeAudioContext {
  currentTime = 0;
  destination = {};
  sources: Array<{ loop: boolean; start: ReturnType<typeof vi.fn>; stop: ReturnType<typeof vi.fn> }> = [];

  constructor() {
    context = this;
  }

  async resume() {}
  async close() {}
  async decodeAudioData() {
    return { duration: 10 } as AudioBuffer;
  }

  createBufferSource() {
    const source = {
      buffer: null,
      loop: false,
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      disconnect: vi.fn(),
      onended: null as (() => void) | null,
    };
    this.sources.push(source);
    return source as unknown as AudioBufferSourceNode;
  }
}

let context: FakeAudioContext;

describe("song preview player", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("loops continuously and resumes at the saved position after pausing", async () => {
    vi.stubGlobal("AudioContext", FakeAudioContext);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: async () => new ArrayBuffer(1),
    }));

    const player = new PreviewPlayer("https://example.com/preview.m4a");

    expect(await player.play()).toBe(true);
    expect(context.sources[0]!.loop).toBe(true);
    expect(context.sources[0]!.start).toHaveBeenCalledWith(0, 0);

    context.currentTime = 12.5;
    player.pause();
    expect(context.sources[0]!.stop).toHaveBeenCalledOnce();

    expect(await player.play()).toBe(true);
    expect(context.sources[1]!.loop).toBe(true);
    expect(context.sources[1]!.start).toHaveBeenCalledWith(0, 2.5);

    player.dispose();
  });
});
