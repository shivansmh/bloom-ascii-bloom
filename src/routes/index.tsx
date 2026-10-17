import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AsciiLily } from "@/components/AsciiLily";
import { GithubCard } from "@/components/GithubCard";
import { HoverWord } from "@/components/HoverWord";
import { NowPlaying } from "@/components/NowPlaying";
import { playPop } from "@/lib/pop-sound";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Shivansh — i code sometimes" },
      {
        name: "description",
        content:
          "i'm shivansh. i code sometimes. i make music on tuesdays and i try to use my brain often.",
      },
      { property: "og:title", content: "Shivansh" },
      {
        property: "og:description",
        content:
          "i code sometimes. i make music on tuesdays and i try to use my brain often.",
      },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

const MUSIC_LINKS = [
  { label: "soundcloud", sub: "tuesdays", href: "https://soundcloud.com/yourusername" },
];

const BRAIN_LINKS = [
  { label: "leetcode", sub: "brain usage", href: "https://leetcode.com/yourusername" },
];

function CodeHover() {
  const [open, setOpen] = useState(false);
  return (
    <span
      className="relative inline-block"
      onPointerEnter={() => setOpen(true)}
      onPointerLeave={() => setOpen(false)}
    >
      <span className="cursor-pointer border-b border-dashed border-primary/60 text-primary transition-colors duration-300 hover:border-primary">
        code
      </span>
      <span
        className={`absolute bottom-full left-0 z-50 mb-3 origin-bottom-left transition-all duration-300 ${
          open
            ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-2 scale-95 opacity-0"
        }`}
      >
        <GithubCard />
      </span>
    </span>
  );
}

function Index() {
  useEffect(() => {
    const onDown = () => playPop();
    window.addEventListener("pointerdown", onDown);
    return () => window.removeEventListener("pointerdown", onDown);
  }, []);

  return (
    <main className="relative grid h-screen w-screen grid-cols-1 overflow-hidden bg-background md:grid-cols-2">
      {/* drifting pink + gold glow */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="drift-a absolute -left-1/4 top-1/4 h-[65vmax] w-[65vmax] rounded-full bg-primary/20 blur-[110px]" />
        <div className="drift-b absolute -right-1/4 bottom-0 h-[55vmax] w-[55vmax] rounded-full bg-primary/25 blur-[120px]" />
        <div className="drift-gold absolute left-1/3 top-1/2 h-[40vmax] w-[40vmax] rounded-full bg-[oklch(0.8_0.12_85)] opacity-60 blur-[130px]" />
      </div>

      <section className="z-10 flex flex-col justify-center px-8 py-10 md:px-14">
        <h1 className="font-display text-[clamp(2.4rem,5.4vw,4.6rem)] leading-[1.0] text-foreground">
          i'm shivansh.
          <span className="mt-2 block italic">
            i <CodeHover /> sometimes.
          </span>
        </h1>

        <p className="mt-7 max-w-md text-[clamp(1rem,1.45vw,1.3rem)] leading-[1.6] text-muted-foreground">
          i make <HoverWord word="music" title="tuesday output" links={MUSIC_LINKS} /> on tuesdays
          <br />
          and i try to use my <HoverWord word="brain" title="proof of brain" links={BRAIN_LINKS} /> often.
        </p>

        <NowPlaying />

        <a
          href="mailto:hello@example.com"
          className="mt-9 inline-flex w-fit items-center gap-3 border-b border-primary/40 pb-1 font-mono text-[clamp(0.85rem,1.05vw,1rem)] tracking-[0.2em] text-primary transition-colors duration-300 hover:border-primary"
        >
          say hello.
          <span aria-hidden className="text-xs">
            &#8594;
          </span>
        </a>
      </section>

      <section className="absolute inset-0 opacity-40 md:relative md:opacity-100">
        <AsciiLily />
      </section>
    </main>
  );
}
