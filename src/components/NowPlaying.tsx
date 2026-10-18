import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HoverWord } from "@/components/HoverWord";
import { findSongPreview, type PreviewResult } from "@/lib/song-preview";
import { PreviewPlayer } from "@/lib/preview-player";

const LASTFM_USER = "blizzard_xd";
const LASTFM_API_KEY = "f19482ccb877fec38d12746ec5857ff1";

type Track = { name: string; artist: string; nowPlaying: boolean; url: string };

export function NowPlaying({ soundEnabled = true }: { soundEnabled?: boolean }) {
  const [track, setTrack] = useState<Track | null>(null);
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [audioFailed, setAudioFailed] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [retry, setRetry] = useState(0);
  const audio = useRef<PreviewPlayer | null>(null);

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
    audio.current?.dispose();
    audio.current = null;
    setPreview(null);
    setPlaying(false);
    setAudioLoading(false);
    setAudioFailed(false);
    setPreviewLoading(true);
    findSongPreview(track.name, track.artist, controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) setPreview(result);
      })
      .catch(() => {})
      .finally(() => { if (!controller.signal.aborted) setPreviewLoading(false); });
    return () => {
      controller.abort();
      audio.current?.dispose();
      audio.current = null;
    };
  }, [track?.name, track?.artist, retry]);

  useEffect(() => {
    if (!soundEnabled) { audio.current?.pause(); setPlaying(false); setAudioLoading(false); }
  }, [soundEnabled]);

  const pause = () => { audio.current?.pause(); setPlaying(false); };
  const togglePlayback = async () => {
    if (!preview?.previewUrl || !soundEnabled || audioLoading) return;
    if (playing) return pause();
    if (!audio.current) audio.current = new PreviewPlayer(preview.previewUrl, () => setPlaying(false));
    const player = audio.current;
    setAudioLoading(true);
    setAudioFailed(false);
    try {
      const started = await player.play();
      if (audio.current === player && started) setPlaying(true);
    } catch {
      if (audio.current === player) { setAudioFailed(true); setPlaying(false); }
    } finally {
      if (audio.current === player) setAudioLoading(false);
    }
  };

  return (
    <>
      <span className="mr-3 inline-block h-[0.35em] w-[0.35em] animate-pulse rounded-full bg-primary align-baseline" />
      im playing{" "}
      {track ? (
        <>
        <HoverWord word={<span className="italic">{track.name}</span>} onOpenChange={(open) => { if (!open) pause(); }}>
          <div className="relative w-72 max-w-[calc(100vw-32px)] rounded-lg border border-border bg-card p-4 text-foreground">
            <span className="absolute -top-2.5 left-4 rounded-full border border-primary/40 bg-card px-2 font-mono text-[0.6rem] tracking-[0.2em] text-primary">
              {track.nowPlaying ? "NOW PLAYING" : "LAST PLAYED"}
            </span>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" aria-label={playing ? "pause song preview" : "play song preview"}
                title={!soundEnabled ? "sound is off" : previewLoading || audioLoading ? "loading preview" : !preview ? "preview unavailable" : "30-second preview"}
                disabled={!soundEnabled || !preview?.previewUrl || audioLoading} onClick={() => void togglePlayback()}
                className="shrink-0 rounded-full border-border bg-transparent text-primary hover:bg-primary/10">
                {audioLoading ? <RotateCw className="animate-spin" /> : playing ? <Pause /> : <Play />}
              </Button>
              <div className="min-w-0 font-sans text-sm leading-snug">
                <a href={track.url} target="_blank" rel="noreferrer" className="block break-words font-semibold hover:text-primary">{track.name}</a>
                <span className="block break-words text-muted-foreground">{track.artist}</span>
              </div>
            </div>
            <div className="mt-3 font-mono text-[0.55rem] leading-relaxed text-muted-foreground">
              {previewLoading ? "finding preview…" : audioLoading ? "loading preview…" : audioFailed ? "couldn't play preview" : !preview?.previewUrl ? "no preview in Apple's catalog" : !soundEnabled ? "sound is off" : "30-second preview"}
              {!previewLoading && (!preview || audioFailed) && <Button variant="ghost" size="icon" aria-label="retry song preview" className="ml-2 h-6 w-6" onClick={() => setRetry((value) => value + 1)}><RotateCw className="h-3 w-3" /></Button>}
            </div>
          </div>
        </HoverWord>
        .
        </>
      ) : (
        <span className="text-muted-foreground/60">nothing yet.</span>
      )}
    </>
  );
}
