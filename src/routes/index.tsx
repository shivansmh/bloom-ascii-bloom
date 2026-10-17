import { createFileRoute } from "@tanstack/react-router";
import { AsciiLily } from "@/components/AsciiLily";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Shivansh — Portfolio" },
      { name: "description", content: "Personal portfolio of Shivansh." },
      { property: "og:title", content: "Shivansh — Portfolio" },
      { property: "og:description", content: "Personal portfolio of Shivansh." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="grid h-screen w-screen grid-cols-1 overflow-hidden bg-background md:grid-cols-2">
      <section className="z-10 flex flex-col justify-center px-8 md:px-16">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">Portfolio — 2026</p>
        <h1 className="mt-6 font-display text-6xl leading-[0.95] text-foreground md:text-8xl">
          Shivansh
          <span className="block italic text-primary">your words here.</span>
        </h1>
        <p className="mt-8 max-w-md text-base text-muted-foreground">
          A short line about who you are and what you make.
        </p>
      </section>
      <section className="absolute inset-0 opacity-40 md:relative md:opacity-100">
        <AsciiLily />
      </section>
    </main>
  );
}
