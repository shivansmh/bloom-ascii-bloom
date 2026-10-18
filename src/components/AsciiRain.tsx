import { useEffect, useRef } from "react";
import { createRainDrops } from "@/lib/ascii-rain";

const CLOUD = [
  "       .--.       ",
  "   .-(    ).-.    ",
  "  (___.__)___)   ",
];

export function AsciiRain({ enabled }: { enabled: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!enabled || prefersReducedMotion) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      canvas.dataset.phase = "idle";
      return;
    }

    let width = 0;
    let height = 0;
    let frame = 0;
    let drops = createRainDrops(0);
    const started = performance.now();

    const resize = () => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drops = createRainDrops(Math.ceil(width / 18));
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    function draw(now: number) {
      ctx.clearRect(0, 0, width, height);
      canvas.dataset.phase = "raining";

      const tokens = getComputedStyle(document.documentElement);
      ctx.font = `11px ${tokens.getPropertyValue("--font-mono")}`;
      ctx.textBaseline = "top";
      ctx.fillStyle = tokens.getPropertyValue("--primary").trim() || "#c66";

      const clouds = Math.max(3, Math.ceil(width / 280));
      ctx.globalAlpha = 0.2;
      for (let i = 0; i < clouds; i++) {
        const x = ((i + 0.5) * width) / clouds - 58;
        CLOUD.forEach((line, row) => ctx.fillText(line, x, -15 + row * 12));
      }

      const elapsed = (now - started) / 1000;
      const travel = height + 80;
      for (const drop of drops) {
        const x = drop.x * width + Math.sin(elapsed * 0.8 + drop.drift) * 5;
        const y = ((drop.phase * travel + elapsed * drop.speed) % travel) - 40;
        ctx.globalAlpha = drop.opacity;
        ctx.fillText(drop.glyph, x, y);
        ctx.globalAlpha = drop.opacity * 0.3;
        ctx.fillText(drop.glyph, x, y - 15);
      }

      ctx.globalAlpha = 1;
      frame = requestAnimationFrame(draw);
    }

    frame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [enabled]);

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0 z-[5] h-full w-full" />;
}
