import { useEffect, useState } from "react";

// last.fm setup: paste your username and API key here.
// get a free key at https://www.last.fm/api/account/create
const LASTFM_USER = "";
const LASTFM_API_KEY = "";

type Track = { name: string; artist: string; nowPlaying: boolean };

export function NowPlaying() {
  const [track, setTrack] = useState<Track | null>(null);

  useEffect(() => {
    if (!LASTFM_USER || !LASTFM_API_KEY) return;
    const load = () =>
      fetch(
        `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${LASTFM_USER}&api_key=${LASTFM_API_KEY}&format=json&limit=1`,
      )
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          const t = data?.recenttracks?.track?.[0];
          if (!t) return;
          setTrack({
            name: t.name,
            artist: t.artist?.["#text"] ?? "",
            nowPlaying: t["@attr"]?.nowplaying === "true",
          });
        })
        .catch(() => {});
    load();
    const id = setInterval(load, 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <p className="mt-6 font-mono text-[clamp(0.75rem,0.95vw,0.9rem)] tracking-wide text-muted-foreground">
      <span className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full bg-primary align-middle" />
      im playing this.{" "}
      {track ? (
        <span className="text-foreground">
          {track.name} — {track.artist}
          {!track.nowPlaying && (
            <span className="text-muted-foreground"> (last listened)</span>
          )}
        </span>
      ) : (
        <span className="text-muted-foreground/60">nothing yet.</span>
      )}
    </p>
  );
}
