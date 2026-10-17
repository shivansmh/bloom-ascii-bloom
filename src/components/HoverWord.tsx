import { useState, type ReactNode } from "react";

export type HoverLink = { label: string; sub?: string; href: string };

export function HoverWord({
  word,
  title,
  links,
}: {
  word: ReactNode;
  title: string;
  links: HoverLink[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <span
      className="relative inline-block"
      onPointerEnter={() => setOpen(true)}
      onPointerLeave={() => setOpen(false)}
    >
      <span className="cursor-pointer border-b border-dashed border-primary/60 text-primary transition-colors duration-300 hover:border-primary">
        {word}
      </span>

      <span
        className={`pointer-events-none absolute bottom-full left-0 z-50 mb-3 w-64 origin-bottom-left transition-all duration-300 ${
          open
            ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
            : "translate-y-2 scale-95 opacity-0"
        }`}
      >
        <span className="block rounded-lg border border-border bg-card/90 p-3 shadow-[0_12px_40px_-12px_var(--color-primary)] backdrop-blur-md">
          <span className="mb-2 block font-mono text-[0.6rem] uppercase tracking-[0.25em] text-muted-foreground">
            {title}
          </span>
          {links.map((l) => (
            <a
              key={l.href + l.label}
              href={l.href}
              target="_blank"
              rel="noreferrer"
              className="group/link flex items-baseline justify-between gap-3 rounded px-1 py-1.5 text-sm text-foreground transition-colors hover:bg-primary/10"
            >
              <span className="truncate">{l.label}</span>
              {l.sub && (
                <span className="shrink-0 font-mono text-[0.6rem] text-muted-foreground">
                  {l.sub}
                </span>
              )}
            </a>
          ))}
        </span>
      </span>
    </span>
  );
}
