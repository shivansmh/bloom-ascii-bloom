import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HoverWord } from "@/components/HoverWord";
import { fetchLatestTrack, type LastFmTrack } from "@/lib/lastfm";
import { findSongPreview, type PreviewResult } from "@/lib/song-preview";
import { PreviewPlayer } from "@/lib/preview-player";

const LASTFM_USER = "blizzard_xd";
const LASTFM_API_KEY = "f19482ccb877fec38d12746ec5857ff1";

type FeedStatus = "loading" | "playing" | "lastPlayed" | "idle" | "unavailable";

export function NowPlaying({ soundEnabled = true }: { soundEnabled?: boolean }) {
  const [track, setTrack] = useState<LastFmTrack | null>(null);
  const [feedStatus, setFeedStatus] = useState<FeedStatus>("loading");
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [audioFailed, setAudioFailed] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [retry, setRetry] = useState(0);
  const audio = useRef<PreviewPlayer | null>(null);

  useEffect(() => {
    let disposed = false;
    let timer: number | undefined;
    let request: AbortController | null = null;

    const poll = async () => {
      const currentRequest = new AbortController();
      request = currentRequest;
      try {
        const latestTrack = await fetchLatestTrack(LASTFM_USER, LASTFM_API_KEY, currentRequest.signal);
        if (disposed) return;
        setTrack(latestTrack);
        setFeedStatus(latestTrack ? latestTrack.nowPlaying ? "playing" : "lastPlayed" : "idle");
      } catch {
        if (disposed || currentRequest.signal.aborted) return;
        setTrack(null);
        setFeedStatus("unavailable");
      } finally {
        if (!disposed && !currentRequest.signal.aborted) {
          timer = window.setTimeout(() => void poll(), 30_000);
        }
      }
    };

    void poll();
    return () => {
      disposed = true;
      request?.abort();
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    setPreview(null);
    setPlaying(false);
    setAudioLoading(false);
    setAudioFailed(false);
    if (!track) {
      setPreviewLoading(false);
      return;
    }

    const controller = new AbortController();
    setPreviewLoading(true);
    findSongPreview(track.name, track.artist, controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) setPreview(result);
      })
      .catch(() => {})
      .finally(() => {
        if (!controller.signal.aborted) setPreviewLoading(false);
      });
    return () => {
      controller.abort();
      audio.current?.dispose();
      audio.current = null;
    };
  }, [track?.name, track?.artist, retry]);

  useEffect(() => {
    if (!soundEnabled) {
      audio.current?.pause();
      setPlaying(false);
      setAudioLoading(false);
    }
  }, [soundEnabled]);

  const pause = () => {
    audio.current?.pause();
    setPlaying(false);
  };

  const togglePlayback = async () => {
    if (!preview?.previewUrl || !soundEnabled || audioLoading) return;
    if (playing) return pause();
    if (!audio.current) audio.current = new PreviewPlayer(preview.previewUrl);
    const player = audio.current;
    setAudioLoading(true);
    setAudioFailed(false);
    try {
      const started = await player.play();
      if (audio.current === player && started) setPlaying(true);
    } catch {
      if (audio.current === player) {
        setAudioFailed(true);
        setPlaying(false);
      }
    } finally {
      if (audio.current === player) setAudioLoading(false);
    }
  };

  const artworkUrl = track?.artworkUrl || preview?.artworkUrl100;

  return (
    <>
      {track ? (
        <>
          {track.nowPlaying ? "im playing" : "last played"}{" "}
          <HoverWord word={<span className="italic">{track.name}</span>}>
            <div className="relative w-72 max-w-[calc(100vw-32px)] rounded-lg border border-gold/35 bg-card p-4 text-foreground shadow-[0_12px_32px_-16px_var(--color-gold)]">
              <span className="absolute -top-2.5 left-4 rounded-full border border-gold/50 bg-card px-2 font-mono text-[0.6rem] tracking-[0.2em] text-gold">
                {track.nowPlaying ? "NOW PLAYING" : "LAST PLAYED"}
              </span>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="icon" aria-label={playing ? "pause song preview" : "play song preview"}
                  title={!soundEnabled ? "sound is off" : previewLoading || audioLoading ? "loading preview" : !preview ? "preview unavailable" : "30-second preview"}
                  disabled={!soundEnabled || !preview?.previewUrl || audioLoading} onClick={() => void togglePlayback()}
                  className="shrink-0 rounded-full border-gold/45 bg-transparent text-gold hover:bg-gold/10">
                  {audioLoading ? <RotateCw className="animate-spin" /> : playing ? <Pause /> : <Play />}
                </Button>
                <div className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-md border border-gold/35 bg-gold/5 text-gold/60">
                  {artworkUrl ? (
                    <img src={artworkUrl} alt={`Cover art for ${track.name}`} loading="lazy" decoding="async" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
                  ) : (
                    <span aria-hidden="true" className="font-display text-lg">♫</span>
                  )}
                </div>
                <div className="min-w-0 font-sans text-sm leading-snug">
                  <a href={track.url} target="_blank" rel="noreferrer" className="block break-words font-semibold hover:text-gold">{track.name}</a>
                  <span className="block break-words text-muted-foreground">{track.artist}</span>
                </div>
              </div>
              <div className="mt-3 font-mono text-[0.55rem] leading-relaxed text-muted-foreground">
                {previewLoading ? "finding preview…" : audioLoading ? "loading preview…" : audioFailed ? "couldn't play preview" : !preview?.previewUrl ? "no preview in Apple's catalog" : !soundEnabled ? "sound is off" : "30-second preview"}
                {!previewLoading && (!preview || audioFailed) && <Button variant="ghost" size="icon" aria-label="retry song preview" className="ml-2 h-6 w-6" onClick={() => setRetry((value) => value + 1)}><RotateCw className="h-3 w-3" /></Button>}
              </div>
            </div>
          </HoverWord>.
        </>
      ) : (
        <span className="text-muted-foreground/60">
          {feedStatus === "loading" ? "checking Last.fm…" : feedStatus === "unavailable" ? "Last.fm unavailable." : "nothing yet."}
        </span>
      )}
    </>
  );
}
