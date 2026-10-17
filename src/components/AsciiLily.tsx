import { useEffect, useRef } from "react";

const CHARS = " .:-=+*#%@";

export function AsciiLily() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const cell = 11;
    let cols = 0, rows = 0, w = 0, h = 0, raf = 0;
    const mouse = { x: -9999, y: -9999 };
    const style = getComputedStyle(document.documentElement);
    const fg = style.getPropertyValue("--lily").trim() || "#e8e4da";
    const accent = style.getPropertyValue("--lily-accent").trim() || "#d9a8b0";

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      w = r.width; h = r.height;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.floor(w / (cell * 0.62)); rows = Math.floor(h / cell);
    };

    // lily density field in normalized coords (-1..1)
    const lily = (x: number, y: number, t: number) => {
      let v = 0;
      const petals = 6;
      const cy = y + 0.1;
      const r = Math.hypot(x, cy);
      const a = Math.atan2(cy, x);
      const sway = Math.sin(t * 0.6) * 0.04;
      // petals: elongated, curled
      const p = Math.pow(Math.abs(Math.cos((a + sway) * petals / 2)), 0.6);
      const len = 0.72 * p + 0.08;
      if (r < len) v = Math.max(v, 1 - r / len) * 0.9 + 0.1 * p;
      // petal veins
      if (r < len) v += 0.15 * Math.abs(Math.sin((a + sway) * petals * 3));
      // center stamens
      for (let i = 0; i < 6; i++) {
        const sa = (i / 6) * Math.PI * 2 + t * 0.2;
        const sx = Math.cos(sa) * 0.18, sy = Math.sin(sa) * 0.18 - 0.1;
        const d = Math.hypot(x - sx, y - sy);
        if (d < 0.035) v = Math.max(v, 1);
      }
      // stem
      if (y > 0.5 && Math.abs(x - Math.sin(y * 3 + t * 0.4) * 0.04) < 0.018) v = Math.max(v, 0.6);
      return Math.min(v, 1);
    };

    const draw = (time: number) => {
      const t = time / 1000;
      ctx.clearRect(0, 0, w, h);
      ctx.font = `${cell}px "JetBrains Mono", monospace`;
      ctx.textBaseline = "top";
      const cw = w / cols;
      const scale = Math.min(w, h) * 0.48;
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          let px = i * cw, py = j * cell;
          // spread outward from cursor
          const dx = px - mouse.x, dy = py - mouse.y;
          const d = Math.hypot(dx, dy);
          const R = 140;
          let push = 0;
          if (d < R) {
            push = (1 - d / R) ** 2;
            const k = push * 45 / (d || 1);
            px += dx * k; py += dy * k;
          }
          const nx = (i * cw - w / 2) / scale;
          const ny = (j * cell - h / 2) / scale;
          const v = lily(nx, ny, t);
          if (v < 0.05) continue;
          const ch = CHARS[Math.min(CHARS.length - 1, Math.floor(v * CHARS.length))];
          ctx.globalAlpha = 0.35 + v * 0.65;
          ctx.fillStyle = push > 0.15 || Math.hypot(nx, ny + 0.1) < 0.22 ? accent : fg;
          ctx.fillText(ch ?? ".", px, py);
        }
      }
      raf = requestAnimationFrame(draw);
    };

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    };
    const onLeave = () => { mouse.x = -9999; mouse.y = -9999; };
    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove);
    document.addEventListener("pointerleave", onLeave);
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return <canvas ref={canvasRef} className="h-full w-full" aria-label="Interactive ASCII lily" />;
}
