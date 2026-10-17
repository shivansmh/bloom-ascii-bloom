import { useEffect, useState } from "react";

const LASTFM_USER = "blizzard_xd";
const LASTFM_API_KEY = "f19482ccb877fec38d12746ec5857ff1";

type Track = { name: string; artist: string; nowPlaying: boolean };

export function NowPlaying() {
  const [track, setTrack] = useState<Track | null>(null);

  useEffect(() => {
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
    <>
      <span className="mr-3 inline-block h-[0.35em] w-[0.35em] animate-pulse rounded-full bg-primary align-baseline" />
      im playing this.{" "}
      {track ? (
        <span className="italic text-primary">
          {track.name} — {track.artist}
          {!track.nowPlaying && (
            <span className="text-muted-foreground"> (last listened)</span>
          )}
        </span>
      ) : (
        <span className="text-muted-foreground/60">nothing yet.</span>
      )}
    </>
  );
}
