import { describe, expect, it } from "vitest";
import { parseRecentTrack } from "./lastfm";

describe("Last.fm recent tracks", () => {
  it("prefers the now-playing track and its largest available artwork", () => {
    const result = parseRecentTrack({
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
      nowPlaying: true,
    });
  });

  it("uses the latest scrobble when no track is currently playing", () => {
    const result = parseRecentTrack({
      recenttracks: {
        track: [
          {
            name: "Last song",
            artist: { "#text": "Artist" },
            image: [{ size: "large", "#text": "https://img.test/last.jpg" }],
            "@attr": { nowplaying: "false" },
          },
          { name: "Older song", artist: { "#text": "Artist" } },
        ],
      },
    }, "test-user");

    expect(result).toEqual({
      name: "Last song",
      artist: "Artist",
      url: "https://www.last.fm/user/test-user",
      artworkUrl: "https://img.test/last.jpg",
      nowPlaying: false,
    });
  });

  it("accepts Last.fm's single-object response shape", () => {
    const result = parseRecentTrack({
      recenttracks: {
        track: {
          name: "Current song",
          artist: "Artist",
          "@attr": { nowplaying: "true" },
        },
      },
    }, "test-user");

    expect(result?.url).toBe("https://www.last.fm/user/test-user");
    expect(result?.nowPlaying).toBe(true);
  });

  it("returns null when Last.fm has no track history", () => {
    expect(parseRecentTrack({ recenttracks: { track: [] } }, "test-user")).toBeNull();
  });
});
