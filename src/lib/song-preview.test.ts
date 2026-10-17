import { describe, expect, it } from "vitest";
import { matchSongPreview } from "./song-preview";

describe("song previews", () => {
  it("plays only a matching track and artist, not an unrelated search result", () => {
    const correct = { trackName: "Black&Blue", artistName: "Vince Staples", previewUrl: "https://example.com/correct.m4a" };
    expect(matchSongPreview([{ ...correct, artistName: "Someone else" }, correct], "Black&Blue", "Vince Staples")).toEqual(correct);
    expect(matchSongPreview([correct], "Another song", "Vince Staples")).toBeNull();
  });
});