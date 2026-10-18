import { useEffect, useRef } from "react";
import { createRainDrops } from "@/lib/ascii-rain";

export function AsciiRain({ enabled }: { enabled: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvasRefValue = canvasRef.current;
    if (!canvasRefValue) return;
    const context = canvasRefValue.getContext("2d");
    if (!context) return;
    const canvas: HTMLCanvasElement = canvasRefValue;
    const ctx: CanvasRenderingContext2D = context;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!enabled || prefersReducedMotion) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      canvas.dataset["phase"] = "idle";
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
      canvas.dataset["phase"] = "raining";

      const tokens = getComputedStyle(document.documentElement);
      ctx.font = `11px ${tokens.getPropertyValue("--font-mono")}`;
      ctx.textBaseline = "top";
      ctx.fillStyle = tokens.getPropertyValue("--primary").trim() || "#c66";

      const elapsed = (now - started) / 1000;
      const travel = height + 80;
      const wind = Math.max(0, Math.min(1, Number(document.documentElement.style.getPropertyValue("--wind-progress")) || 0));
      for (const drop of drops) {
        const fall = (drop.phase * travel + elapsed * drop.speed) % travel;
        const x = drop.x * width + Math.sin(elapsed * 0.8 + drop.drift) * 5 + wind * fall * 0.11;
        const y = fall - 40;
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
