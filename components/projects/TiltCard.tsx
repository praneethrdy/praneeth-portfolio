"use client";

import { useRef } from "react";

/** Tilts toward the cursor in 3D, with a soft highlight that follows it. */
export default function TiltCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const el = useRef<HTMLDivElement>(null);

  const move = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const card = el.current!;
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    card.style.setProperty("--ry", `${(x - 0.5) * 10}deg`);
    card.style.setProperty("--rx", `${(0.5 - y) * 8}deg`);
    card.style.setProperty("--gx", `${x * 100}%`);
    card.style.setProperty("--gy", `${y * 100}%`);
    card.style.setProperty("--glare", "1");
  };
  const leave = () => {
    const card = el.current!;
    card.style.setProperty("--rx", "0deg");
    card.style.setProperty("--ry", "0deg");
    card.style.setProperty("--glare", "0");
  };

  return (
    <div style={{ perspective: "1000px" }} className="min-w-0">
      <div
        ref={el}
        onPointerMove={move}
        onPointerLeave={leave}
        className={`relative transition-transform duration-200 ease-out [transform:rotateX(var(--rx,0deg))_rotateY(var(--ry,0deg))] [transform-style:preserve-3d] ${className}`}
      >
        {children}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-[var(--glare,0)] transition-opacity duration-300 [background:radial-gradient(400px_circle_at_var(--gx,50%)_var(--gy,50%),rgba(46,230,255,.12),transparent_60%)]"
        />
      </div>
    </div>
  );
}
