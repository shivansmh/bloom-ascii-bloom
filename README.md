# portfolio

A small personal site built with React, TypeScript, TanStack Start, and Vite.

Live: [shivansmh.github.io/portfolio](https://shivansmh.github.io/portfolio/)

It has an interactive ASCII lily, optional symbol rain, light and sound toggles, hover cards, and a Now Playing preview.

## Run locally

```sh
bun install
bun run dev
```

## Test and build

```sh
bun run test
GITHUB_PAGES=true bun run build
```

## Main files

- `src/routes/index.tsx` — homepage and controls
- `src/components/AsciiLily.tsx` — interactive flower
- `src/components/AsciiRain.tsx` — symbol rain
- `src/components/NowPlaying.tsx` — current track and preview
- `src/components/HoverWord.tsx` — hover cards
- `src/components/GithubCard.tsx` — GitHub preview card
- `src/components/ui/` — shared UI components
- `src/lib/` — song lookup and playback, rain symbols, and sound effects
- `.github/workflows/deploy.yml` — deploys `main` to GitHub Pages
