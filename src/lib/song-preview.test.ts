import { afterEach, describe, expect, it, vi } from "vitest";
import { findSongPreview, matchSongPreview } from "./song-preview";

describe("song previews", () => {
  afterEach(() => vi.unstubAllGlobals());
  it("plays only a matching track and artist, not an unrelated search result", () => {
    const correct = { trackName: "Black&Blue", artistName: "Vince Staples", previewUrl: "https://example.com/correct.m4a" };
    expect(matchSongPreview([{ ...correct, artistName: "Someone else" }, correct], "Black&Blue", "Vince Staples")).toEqual(correct);
    expect(matchSongPreview([correct], "Another song", "Vince Staples")).toBeNull();
  });
  it("accepts the Last.fm artist when Apple also credits a collaborator", () => {
    const track = { trackName: "prove it", artistName: "21 Savage & Summer Walker", previewUrl: "https://example.com/preview.m4a" };
    expect(matchSongPreview([track], "prove it", "21 Savage")).toEqual(track);
    expect(matchSongPreview([track], "prove it", "Savage")).toBeNull();
  });
  it("matches case and featured credits without accepting alternate recordings", () => {
    const track = { trackName: "BAD TIME", artistName: "Lil Tecca", previewUrl: "https://example.com/preview.m4a" };
    expect(matchSongPreview([track], "Bad Time", "Lil Tecca")).toEqual(track);
    expect(matchSongPreview([{ ...track, trackName: "Bad Time (Live)" }], "Bad Time", "Lil Tecca")).toBeNull();
    expect(matchSongPreview([{ ...track, trackName: "Bad Time (feat. Guest)" }], "Bad Time", "Lil Tecca")).not.toBeNull();
  });
  it("tries a broader Apple search when the first search misses the matching recording", async () => {
    const correct = { trackName: "Black&Blue", artistName: "Vince Staples", previewUrl: "https://example.com/preview.m4a" };
    const fetcher = vi.fn().mockResolvedValueOnce({ ok: true, json: async () => ({ results: [{ ...correct, artistName: "Someone else" }] }) }).mockResolvedValueOnce({ ok: true, json: async () => ({ results: [correct] }) });
    vi.stubGlobal("fetch", fetcher);
    expect(await findSongPreview("Black&Blue", "Vince Staples", new AbortController().signal)).toEqual(correct);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
  it("cancels an old song lookup when the song changes", async () => {
    const controller = new AbortController();
    controller.abort();
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);
    await expect(findSongPreview("Bad Time", "Lil Tecca", controller.signal)).rejects.toThrow();
    expect(fetcher).not.toHaveBeenCalled();
  });
});