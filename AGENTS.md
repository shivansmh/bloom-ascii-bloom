<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Use the shared Radix-based HoverWord for portfolio popups, so pointer travel, collision handling, and keyboard access stay consistent.
- Fetch song previews in the browser from Apple's public search endpoint and require matching track/artist before playback, so unrelated recordings are never played.
- Keep ASCII rain in an independent, pointer-transparent canvas with a pure timing helper, so showers never interrupt the portfolio links and their cadence can be tested.
- Drive the opening wind gust from one shared `--wind-progress` value on `<html>`, with streaks drawn on their own pointer-transparent canvas and the lily reading the same value, so every layer bends and recovers together and the gust curve stays testable.
- Decode Apple preview audio through Web Audio with a lazy AAC decoder fallback, disposing playback on song changes, so browsers without native AAC support can still play the correct recording.
