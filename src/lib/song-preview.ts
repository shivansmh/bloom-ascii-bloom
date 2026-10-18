export type PreviewResult = {
  trackName: string;
  artistName: string;
  previewUrl?: string;
  trackViewUrl?: string;
  artworkUrl100?: string;
};

const normalize = (value: string) => value.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
const stripCredits = (value: string) => value.replace(/\s*[([](?:feat\.?|ft\.?|featuring)\s+[^)\]]+[)\]]/gi, "").trim();

export function matchSongPreview(results: PreviewResult[], title: string, artist: string) {
  const matches = results.filter((result) => result.previewUrl && normalize(stripCredits(result.trackName)) === normalize(stripCredits(title)));
  return matches.find((result) => normalize(result.artistName) === normalize(artist))
    ?? matches.find((result) => result.artistName.split(/\s*(?:&|,|feat\.?|featuring)\s*/i).some((credit) => normalize(credit) === normalize(artist)))
    ?? null;
}

export async function findSongPreview(title: string, artist: string, signal: AbortSignal): Promise<PreviewResult | null> {
  const terms = [...new Set([`${artist} ${stripCredits(title)}`, stripCredits(title)])];
  for (const country of ["us", "gb"]) {
    for (const term of terms) {
      signal.throwIfAborted();
      try {
        const params = new URLSearchParams({ term, entity: "song", media: "music", limit: "50", country });
        const response = await fetch(`https://itunes.apple.com/search?${params}`, {
          signal: AbortSignal.any([signal, AbortSignal.timeout(8_000)]),
        });
        if (!response.ok) continue;
        const data = await response.json();
        signal.throwIfAborted();
        const match = matchSongPreview(data?.results ?? [], title, artist);
        if (match) return match;
      } catch {
        signal.throwIfAborted();
      }
    }
  }
  return null;
}