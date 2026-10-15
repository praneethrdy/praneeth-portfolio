"use client";

import { useEffect, useRef } from "react";

/** Skills on the surface of a slowly turning sphere. Drag to spin it. */
export default function TagSphere({ tags, highlight }: { tags: string[]; highlight: string[] }) {
  const box = useRef<HTMLDivElement>(null);
  const items = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const el = box.current!;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Even spread over the sphere (Fibonacci lattice).
    const pts = tags.map((_, i) => {
      const y = 1 - ((i + 0.5) / tags.length) * 2, r = Math.sqrt(1 - y * y), th = i * 2.39996;
      return [Math.cos(th) * r, y, Math.sin(th) * r];
    });
    let ax = 0.3, ay = 0, vx = 0.0016, vy = 0.0035, raf = 0, visible = true;
    let drag: { x: number; y: number } | null = null;

    const draw = () => {
      const radius = el.clientWidth * 0.4;
      const cx = Math.cos(ax), sx = Math.sin(ax), cy = Math.cos(ay), sy = Math.sin(ay);
      pts.forEach(([x, y, z], i) => {
        const li = items.current[i];
        if (!li) return;
        const x1 = x * cy + z * sy, z1 = -x * sy + z * cy;
        const y2 = y * cx - z1 * sx, z2 = y * sx + z1 * cx;
        const depth = (z2 + 1) / 2;
        li.style.transform = `translate(-50%,-50%) translate3d(${x1 * radius}px,${y2 * radius}px,0) scale(${0.65 + depth * 0.55})`;
        li.style.opacity = String(0.25 + depth * 0.75);
        li.style.zIndex = String(Math.round(depth * 100));
      });
    };
    const tick = () => {
      if (!drag) {
        ax += vx;
        ay += vy;
        vx += (0.0016 - vx) * 0.02;
        vy += (0.0035 - vy) * 0.02;
      }
      draw();
      if (visible) raf = requestAnimationFrame(tick);
    };

    const down = (e: PointerEvent) => {
      drag = { x: e.clientX, y: e.clientY };
      el.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (!drag) return;
      vy = (e.clientX - drag.x) * 0.0025;
      vx = -(e.clientY - drag.y) * 0.0025;
      ay += vy;
      ax += vx;
      drag = { x: e.clientX, y: e.clientY };
      if (reduced) draw();
    };
    const up = () => (drag = null);

    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting && !reduced;
      cancelAnimationFrame(raf);
      if (visible) raf = requestAnimationFrame(tick);
    });
    io.observe(el);
    const ro = new ResizeObserver(draw);
    ro.observe(el);
    draw();

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
    };
  }, [tags]);

  return (
    <div
      ref={box}
      aria-hidden="true"
      className="relative mx-auto aspect-square w-full max-w-[520px] cursor-grab touch-pan-y select-none active:cursor-grabbing"
    >
      <div className="absolute inset-[12%] rounded-full border border-line/70 bg-[radial-gradient(circle_at_50%_45%,rgba(46,230,255,.08),transparent_65%)]" />
      <ul className="absolute inset-0">
        {tags.map((t, i) => (
          <li
            key={t}
            ref={(e) => void (items.current[i] = e)}
            className={`absolute top-1/2 left-1/2 whitespace-nowrap rounded-full border px-2.5 py-1 font-mono text-[12px] will-change-transform sm:text-[13px] ${
              highlight.includes(t) ? "border-accent-dim bg-bg text-accent" : "border-line bg-bg text-fg/85"
            }`}
          >
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
}
