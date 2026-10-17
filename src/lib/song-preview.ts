export type PreviewResult = {
  trackName: string;
  artistName: string;
  previewUrl?: string;
  trackViewUrl?: string;
  artworkUrl100?: string;
};

const normalize = (value: string) => value.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();

export function matchSongPreview(results: PreviewResult[], title: string, artist: string) {
  const matches = results.filter((result) => result.previewUrl && normalize(result.trackName) === normalize(title));
  return matches.find((result) => normalize(result.artistName) === normalize(artist))
    ?? matches.find((result) => result.artistName.split(/\s*(?:&|,|feat\.?|featuring)\s*/i).some((credit) => normalize(credit) === normalize(artist)))
    ?? null;
}