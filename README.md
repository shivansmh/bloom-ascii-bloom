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

## How it works

- **Lily:** drawn on a canvas with procedural petal math; pointer movement pushes the characters outward.
- **Rain:** a second canvas animates randomized punctuation with `requestAnimationFrame`; switching it off clears the canvas and stops the loop.
- **Now Playing:** shows only Last.fm tracks marked as currently playing, uses Last.fm/Apple artwork, and plays a matching Apple preview with Web Audio.
- **Hover cards:** built on Radix UI. Theme colors come from CSS variables and change with the light toggle.

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
