import { describe, expect, it } from "vitest";
import { parseCurrentTrack } from "./lastfm";

describe("Last.fm current track", () => {
  it("selects the now-playing track and its largest available artwork", () => {
    const result = parseCurrentTrack({
      recenttracks: {
        track: [
          { name: "Previous song", artist: { "#text": "Artist" } },
          {
            name: "Current song",
            artist: { "#text": "Artist" },
            url: "https://www.last.fm/music/Artist/_/Current+song",
            "@attr": { nowplaying: "true" },
            image: [
              { size: "small", "#text": "https://img.test/small.jpg" },
              { size: "large", "#text": "https://img.test/large.jpg" },
              { size: "extralarge", "#text": "https://img.test/extralarge.jpg" },
            ],
          },
        ],
      },
    }, "test-user");

    expect(result).toEqual({
      name: "Current song",
      artist: "Artist",
      url: "https://www.last.fm/music/Artist/_/Current+song",
      artworkUrl: "https://img.test/extralarge.jpg",
    });
  });

  it("does not fall back to the most recent scrobble when nothing is playing", () => {
    const result = parseCurrentTrack({
      recenttracks: {
        track: [{ name: "Last song", artist: { "#text": "Artist" }, "@attr": { nowplaying: "false" } }],
      },
    }, "test-user");

    expect(result).toBeNull();
  });

  it("accepts Last.fm's single-object response shape", () => {
    const result = parseCurrentTrack({
      recenttracks: {
        track: {
          name: "Current song",
          artist: "Artist",
          "@attr": { nowplaying: "true" },
        },
      },
    }, "test-user");

    expect(result?.url).toBe("https://www.last.fm/user/test-user");
  });
});
