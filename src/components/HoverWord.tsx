import { useState, type ReactNode } from "react";
import { Portal } from "@radix-ui/react-hover-card";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

export type HoverLink = { label: string; sub?: string; href: string };

export function HoverWord({
  word,
  title,
  links,
  children,
  onOpenChange,
}: {
  word: ReactNode;
  title?: string;
  links?: HoverLink[];
  children?: ReactNode;
  onOpenChange?: (open: boolean) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <HoverCard open={open} onOpenChange={(value) => { setOpen(value); onOpenChange?.(value); }} openDelay={80} closeDelay={350}>
      <HoverCardTrigger asChild>
        <a href={links?.[0]?.href ?? "#"} aria-expanded={open}
          onClick={(event) => { event.preventDefault(); setOpen(!open); onOpenChange?.(!open); }}
          onFocus={() => { setOpen(true); onOpenChange?.(true); }}
          onKeyDown={(event) => { if (event.key === "Escape") { setOpen(false); onOpenChange?.(false); } }}
          className="cursor-pointer border-b border-dashed border-gold/50 text-primary transition-colors duration-300 hover:border-gold">
          {word}
        </a>
      </HoverCardTrigger>
      <Portal>
        <HoverCardContent side="top" align="start" sideOffset={10} collisionPadding={16}
          className={children ? "w-auto border-0 bg-transparent p-0 shadow-none" : "border-gold/30 bg-card p-3 text-foreground"}>
          {children ?? <>
          <span className="mb-2 block font-mono text-[0.6rem] uppercase tracking-[0.25em] text-muted-foreground">{title}</span>
          {links?.map((l) => (
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
          </>}
        </HoverCardContent>
      </Portal>
    </HoverCard>
  );
}
