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

export type CurrentTrack = {
  name: string;
  artist: string;
  url: string;
  artworkUrl?: string;
};

export function parseCurrentTrack(payload: unknown, user: string): CurrentTrack | null {
  const response = payload as LastFmResponse | null;
  const rawTracks = response?.recenttracks?.track;
  const tracks = Array.isArray(rawTracks) ? rawTracks : rawTracks ? [rawTracks] : [];
  const current = tracks.find((track) => track?.["@attr"]?.nowplaying === "true");
  if (!current) return null;

  const name = current.name?.trim() ?? "";
  const artistValue = current.artist;
  const artist = (typeof artistValue === "string"
    ? artistValue
    : artistValue?.["#text"] ?? artistValue?.name ?? "").trim();
  if (!name || !artist) return null;

  const images = Array.isArray(current.image) ? current.image : [];
  const artworkUrl = ["extralarge", "large", "medium", "small"]
    .map((size) => images.find((image) => image.size === size && image["#text"]?.trim())?.["#text"])
    .find((url): url is string => Boolean(url))
    ?? images.find((image) => image["#text"]?.trim())?.["#text"];

  return {
    name,
    artist,
    url: current.url?.trim() || `https://www.last.fm/user/${encodeURIComponent(user)}`,
    artworkUrl,
  };
}

export async function fetchCurrentTrack(
  user: string,
  apiKey: string,
  signal: AbortSignal,
): Promise<CurrentTrack | null> {
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
  return parseCurrentTrack(data, user);
}
