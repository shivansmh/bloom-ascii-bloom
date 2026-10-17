import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HoverWord } from "@/components/HoverWord";
import { matchSongPreview, type PreviewResult } from "@/lib/song-preview";

const LASTFM_USER = "blizzard_xd";
const LASTFM_API_KEY = "f19482ccb877fec38d12746ec5857ff1";

type Track = { name: string; artist: string; nowPlaying: boolean; url: string };

export function NowPlaying({ soundEnabled = true }: { soundEnabled?: boolean }) {
  const [track, setTrack] = useState<Track | null>(null);
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [audioFailed, setAudioFailed] = useState(false);
  const audio = useRef<HTMLAudioElement | null>(null);

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
            url: t.url ?? "https://www.last.fm/user/blizzard_xd",
          });
        })
        .catch(() => {});
    load();
    const id = setInterval(load, 30_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!track) return;
    const controller = new AbortController();
    setPreview(null);
    setPlaying(false);
    setAudioFailed(false);
    setPreviewLoading(true);
    const term = encodeURIComponent(`${track.artist} ${track.name}`);
    fetch(`https://itunes.apple.com/search?term=${term}&entity=song&limit=10&country=us`, { signal: controller.signal })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => {
        if (!controller.signal.aborted) setPreview(matchSongPreview(data?.results ?? [], track.name, track.artist));
      })
      .catch(() => {})
      .finally(() => { if (!controller.signal.aborted) setPreviewLoading(false); });
    return () => controller.abort();
  }, [track?.name, track?.artist]);

  useEffect(() => {
    if (!soundEnabled) { audio.current?.pause(); setPlaying(false); }
  }, [soundEnabled]);

  const pause = () => { audio.current?.pause(); setPlaying(false); };
  const togglePlayback = async () => {
    if (!audio.current || !soundEnabled) return;
    if (playing) return pause();
    try { await audio.current.play(); setPlaying(true); }
    catch { setAudioFailed(true); setPlaying(false); }
  };

  return (
    <>
      <span className="mr-3 inline-block h-[0.35em] w-[0.35em] animate-pulse rounded-full bg-primary align-baseline" />
      im playing{" "}
      {track ? (
        <>
        <HoverWord word={<span className="italic">{track.name}</span>} onOpenChange={(open) => { if (open && playing) pause(); }}>
          <div className="relative w-72 max-w-[calc(100vw-32px)] rounded-lg border border-border bg-card p-4 text-foreground">
            <span className="absolute -top-2.5 left-4 rounded-full border border-primary/40 bg-card px-2 font-mono text-[0.6rem] tracking-[0.2em] text-primary">
              {track.nowPlaying ? "NOW PLAYING" : "LAST PLAYED"}
            </span>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" aria-label={playing ? "pause song preview" : "play song preview"}
                title={!soundEnabled ? "sound is off" : previewLoading ? "loading preview" : !preview || audioFailed ? "preview unavailable" : "30-second preview"}
                disabled={!soundEnabled || !preview?.previewUrl || audioFailed} onClick={() => void togglePlayback()}
                className="shrink-0 rounded-full border-border bg-transparent text-primary hover:bg-primary/10">
                {playing ? <Pause /> : <Play />}
              </Button>
              <div className="min-w-0 font-sans text-sm leading-snug">
                <a href={track.url} target="_blank" rel="noreferrer" className="block break-words font-semibold hover:text-primary">{track.name}</a>
                <span className="block break-words text-muted-foreground">{track.artist}</span>
              </div>
            </div>
            <div className="mt-3 font-mono text-[0.55rem] leading-relaxed text-muted-foreground">
              {previewLoading ? "finding preview…" : audioFailed || !preview?.previewUrl ? "preview unavailable" : !soundEnabled ? "sound is off" : "30-second preview"}
            </div>
          </div>
        </HoverWord>
        .
        {preview?.previewUrl && <audio ref={audio} src={preview.previewUrl} preload="none" onEnded={pause} onError={() => { setAudioFailed(true); pause(); }} />}
        </>
      ) : (
        <span className="text-muted-foreground/60">nothing yet.</span>
      )}
    </>
  );
}
