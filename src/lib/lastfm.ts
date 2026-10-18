type LastFmImage = { size?: string; "#text"?: string };

type LastFmTrackResponse = {
  name?: string;
  artist?: string | { "#text"?: string; name?: string };
  url?: string;
  image?: LastFmImage[];
  "@attr"?: { nowplaying?: string };
};

type LastFmResponse = {
  error?: number;
  message?: string;
  recenttracks?: { track?: LastFmTrackResponse | LastFmTrackResponse[] };
};

export type LastFmTrack = {
  name: string;
  artist: string;
  url: string;
  artworkUrl?: string;
  nowPlaying: boolean;
};

export function parseRecentTrack(payload: unknown, user: string): LastFmTrack | null {
  const response = payload as LastFmResponse | null;
  const rawTracks = response?.recenttracks?.track;
  const tracks = Array.isArray(rawTracks) ? rawTracks : rawTracks ? [rawTracks] : [];
  const liveTrack = tracks.find((track) => track?.["@attr"]?.nowplaying === "true");
  const selected = liveTrack ?? tracks[0];
  if (!selected) return null;

  const name = selected.name?.trim() ?? "";
  const artistValue = selected.artist;
  const artist = (typeof artistValue === "string"
    ? artistValue
    : artistValue?.["#text"] ?? artistValue?.name ?? "").trim();
  if (!name || !artist) return null;

  const images = Array.isArray(selected.image) ? selected.image : [];
  const artworkUrl = ["extralarge", "large", "medium", "small"]
    .map((size) => images.find((image) => image.size === size && image["#text"]?.trim())?.["#text"])
    .find((url): url is string => Boolean(url))
    ?? images.find((image) => image["#text"]?.trim())?.["#text"];

  const result: LastFmTrack = {
    name,
    artist,
    url: selected.url?.trim() || `https://www.last.fm/user/${encodeURIComponent(user)}`,
    nowPlaying: selected === liveTrack,
  };
  if (artworkUrl) result.artworkUrl = artworkUrl;
  return result;
}

export async function fetchLatestTrack(
  user: string,
  apiKey: string,
  signal: AbortSignal,
): Promise<LastFmTrack | null> {
  const params = new URLSearchParams({
    method: "user.getrecenttracks",
    user,
    api_key: apiKey,
    format: "json",
    limit: "5",
  });
  const response = await fetch(`https://ws.audioscrobbler.com/2.0/?${params}`, {
    cache: "no-store",
    signal: AbortSignal.any([signal, AbortSignal.timeout(8_000)]),
  });
  if (!response.ok) throw new Error(`Last.fm returned ${response.status}`);

  const data = await response.json() as LastFmResponse;
  signal.throwIfAborted();
  if (data.error) throw new Error(data.message || `Last.fm error ${data.error}`);
  return parseRecentTrack(data, user);
}
