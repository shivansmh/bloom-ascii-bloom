import { createFileRoute } from "@tanstack/react-router";
import { AsciiLily } from "@/components/AsciiLily";

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

function Index() {
  return (
    <main className="grid h-screen w-screen grid-cols-1 overflow-hidden bg-background md:grid-cols-2">
      <section className="z-10 flex flex-col justify-center px-8 py-10 md:px-14">
        <h1 className="font-display text-[clamp(2.4rem,5.4vw,4.6rem)] leading-[1.0] text-foreground">
          i'm shivansh.
          <span className="mt-2 block italic text-primary">i code sometimes.</span>
        </h1>

        <p className="mt-7 max-w-md text-[clamp(1rem,1.45vw,1.3rem)] leading-[1.6] text-muted-foreground">
          i make music on tuesdays
          <br />
          and i try to use my brain often.
        </p>

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
