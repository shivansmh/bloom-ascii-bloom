export type PreviewResult = {
  trackName: string;
  artistName: string;
  previewUrl?: string;
  trackViewUrl?: string;
  artworkUrl100?: string;
};

const normalize = (value: string) => value.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();

export function matchSongPreview(results: PreviewResult[], title: string, artist: string) {
  return results.find((result) => result.previewUrl && normalize(result.trackName) === normalize(title) && normalize(result.artistName) === normalize(artist)) ?? null;
}