import { useEffect, useRef } from "react";
import { readWind } from "@/lib/wind";

const GLYPHS = "~-=≈~-~=>-~";

type Streak = { x: number; y: number; speed: number; len: number; seed: number };

/** Full-brightness ASCII wind gusts that sweep toward the south-east while --wind-progress > 0. */
export function WindStreaks() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let w = 0, h = 0, raf = 0, last = performance.now();
    let streaks: Streak[] = [];
    const spawn = (anywhere: boolean): Streak => ({
      x: anywhere ? Math.random() * w : -Math.random() * w * 0.5 - 60,
      y: Math.random() * h * 1.1 - h * 0.2,
      speed: 650 + Math.random() * 650,
      len: 6 + Math.floor(Math.random() * 14),
      seed: Math.random() * 100,
    });
    const resize = () => {
      w = canvas.clientWidth; h = canvas.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      streaks = Array.from({ length: Math.ceil((w * h) / 22000) }, () => spawn(true));
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const wind = readWind();
      ctx.clearRect(0, 0, w, h);
      if (wind > 0.01) {
        const color = getComputedStyle(document.documentElement).getPropertyValue("--foreground").trim() || "#fff";
        ctx.font = `12px "JetBrains Mono", monospace`;
        ctx.textBaseline = "middle";
        ctx.fillStyle = color;
        const t = now / 1000;
        const dirY = 0.38; // south-east slant
        for (const s of streaks) {
          s.x += s.speed * dt * wind;
          s.y += s.speed * dt * wind * dirY;
          if (s.x > w + 200 || s.y > h + 60) Object.assign(s, spawn(false));
          for (let k = 0; k < s.len; k++) {
            const px = s.x - k * 8;
            const py = s.y - k * 8 * dirY + Math.sin(t * 6 + s.seed + k * 0.5) * 3;
            const tail = 1 - k / s.len;
            ctx.globalAlpha = wind * (k === 0 ? 1 : tail);
            ctx.fillText(GLYPHS[(k + Math.floor(s.seed)) % GLYPHS.length]!, px, py);
          }
        }
        ctx.globalAlpha = 1;
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none fixed inset-0 z-[6] h-full w-full" />;
}
