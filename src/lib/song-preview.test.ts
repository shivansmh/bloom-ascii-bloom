import { describe, expect, it } from "vitest";
import { matchSongPreview } from "./song-preview";

describe("song previews", () => {
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
});