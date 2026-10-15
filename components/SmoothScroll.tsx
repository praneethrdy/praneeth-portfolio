"use client";

import Lenis from "lenis";
import { useEffect } from "react";

/** Eased wheel scrolling (desktop only; touch keeps native scrolling). Off when the visitor prefers reduced motion. */
export default function SmoothScroll() {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ lerp: 0.1, anchors: { offset: -72 } });
    let raf = requestAnimationFrame(function loop(t) {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    });
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);
  return null;
}
