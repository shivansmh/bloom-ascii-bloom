import { useEffect, useRef } from "react";
import { getRainState, RAIN_DURATION_MS } from "@/lib/ascii-rain";

const CLOUD = [
  "       .--.       ",
  "   .-(    ).-.    ",
  "  (___.__)___)   ",
];
const GLYPHS = ["|", ":", ".", "'", "|"];

export function AsciiRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let width = 0;
    let height = 0;
    let frame = 0;
    const started = performance.now();
    const resize = () => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    function draw(now: number) {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, width, height);
      const state = getRainState(now - started);
      canvas.dataset['phase'] = reducedMotion.matches ? "idle" : state.phase;
      if (!reducedMotion.matches && state.phase !== "idle") {
        const tokens = getComputedStyle(document.documentElement);
        const retreat = state.phase === "retracting" ? state.progress : 0;
        const entrance = state.phase === "raining" ? Math.min(state.progress * 20, 1) : 1;
        const rise = retreat * retreat * (height + 60);
        ctx.font = `11px ${tokens.getPropertyValue("--font-mono")}`;
        ctx.textBaseline = "top";
        ctx.fillStyle = tokens.getPropertyValue("--primary").trim();
        ctx.globalAlpha = 0.55 * entrance * (1 - retreat);

        const clouds = Math.max(3, Math.ceil(width / 155));
        for (let i = 0; i < clouds; i++) {
          const x = (i + 0.5) * width / clouds - 58;
          CLOUD.forEach((line, row) => {
            ctx.fillText(line, x, -15 + row * 12 - (1 - entrance) * 25 - retreat * 45);
          });
        }

        const rainTime = state.phase === "raining" ? state.progress * RAIN_DURATION_MS : RAIN_DURATION_MS;
        const drops = Math.ceil(width / 12);
        for (let i = 0; i < drops; i++) {
          const seed = (i * 137.508) % 997;
          const delay = seed % 850;
          const age = rainTime - delay;
          if (age < 0) continue;
          const speed = 0.18 + (seed % 100) / 700;
          const y = ((age * speed) % (height + 90)) - 45 - rise;
          const x = (i + 0.5) * width / drops + Math.sin(age / 900 + i) * 5;
          ctx.globalAlpha = (0.18 + (seed % 10) / 40) * entrance * (1 - retreat);
          ctx.fillText(GLYPHS[i % GLYPHS.length] ?? "|", x, y);
          ctx.globalAlpha *= 0.35;
          ctx.fillText(".", x, y - 17);
        }
        ctx.globalAlpha = 1;
      }
      frame = requestAnimationFrame(draw);
    }
    frame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0 z-[5] h-full w-full" />;
}