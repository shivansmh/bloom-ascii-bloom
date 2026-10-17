import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AsciiLily } from "@/components/AsciiLily";
import { GithubCard } from "@/components/GithubCard";
import { HoverWord } from "@/components/HoverWord";
import { NowPlaying } from "@/components/NowPlaying";
import { playPop } from "@/lib/pop-sound";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX } from "lucide-react";

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
  { label: "soundcloud", sub: "tuesdays", href: "https://soundcloud.com/starseekr" },
];

const BRAIN_LINKS = [
  { label: "leetcode", sub: "brain usage", href: "https://leetcode.com/u/shivansmh/" },
];

function CodeHover() {
  return (
    <HoverWord word="code"><GithubCard /></HoverWord>
  );
}

function Index() {
  const [light, setLight] = useState(false);
  const [sound, setSound] = useState(true);

  useEffect(() => {
    const onDown = () => playPop(sound);
    window.addEventListener("pointerdown", onDown);
    return () => window.removeEventListener("pointerdown", onDown);
  }, [sound]);

  useEffect(() => {
    document.documentElement.classList.toggle("light", light);
  }, [light]);

  return (
    <main className="relative grid h-screen w-screen grid-cols-1 overflow-hidden bg-background md:grid-cols-2">
      {/* drifting pink + gold glow */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="drift-a absolute -left-1/4 top-1/4 h-[65vmax] w-[65vmax] rounded-full bg-primary/20 blur-[110px]" />
        <div className="drift-b absolute -right-1/4 bottom-0 h-[55vmax] w-[55vmax] rounded-full bg-primary/25 blur-[120px]" />
        <div className="drift-gold absolute left-1/3 top-1/2 h-[40vmax] w-[40vmax] rounded-full bg-[oklch(0.8_0.12_85)] blur-[130px]" />
      </div>

      <div className="absolute right-6 top-6 z-20 flex items-center gap-5">
      <Button variant="link" size="sm" onClick={() => setSound((value) => !value)} aria-label={sound ? "turn sound off" : "turn sound on"} aria-pressed={sound}
        className="h-auto rounded-none border-b border-dashed border-primary/60 p-0 pb-0.5 font-mono text-xs tracking-[0.2em] text-primary no-underline hover:no-underline">
        {sound ? <Volume2 /> : <VolumeX />} {sound ? "sound off" : "sound on"}
      </Button>
      <Button variant="link" size="sm"
        onClick={() => setLight((v) => !v)}
        className="h-auto rounded-none border-b border-dashed border-primary/60 p-0 pb-0.5 font-mono text-xs tracking-[0.2em] text-primary no-underline hover:border-primary hover:no-underline"
      >
        {light ? "lights off" : "lights on"}
      </Button>
      </div>

      <section className="z-10 flex flex-col justify-center px-8 py-10 md:px-14">
        <h1 className="font-display text-[clamp(1.9rem,3.6vw,3.2rem)] leading-[1.25] text-foreground">
          i'm shivansh.
          <span className="block">
            i <CodeHover /> sometimes.
          </span>
          <span className="block">
            i make <HoverWord word="music" title="tuesday output" links={MUSIC_LINKS} /> on tuesdays
          </span>
          <span className="block">
            and i try to use my <HoverWord word="brain" title="proof of brain" links={BRAIN_LINKS} /> often.
          </span>
          <span className="block">
            <NowPlaying soundEnabled={sound} />
          </span>
        </h1>

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
        <AsciiLily key={light ? "light" : "dark"} />
      </section>
    </main>
  );
}
