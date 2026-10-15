"use client";

import { useCallback, useEffect, useRef } from "react";
import GraphCanvas, { type Placement } from "@/components/graph/ServiceGraph";

// The graph's footprint in world units at scale 1, labels included (see serviceNodes in lib/content).
const GRAPH = { left: -4.7, right: 4.0, bottom: -2.5, top: 2.4 };
const GAP = 48; // px kept clear between the copy and the graph
const EDGE = 32; // px kept clear from the canvas edges
const NAV = 72; // px reserved for the fixed nav
const MIN_BESIDE = 0.4; // smallest scale at which the graph may still sit beside the copy

type Box = { left: number; right: number; top: number; bottom: number };
type Layout = { copy: Box; content: { left: number; right: number } };

/**
 * Fits the graph into the space the hero copy leaves free, measured from the real text:
 * beside the copy when there is room for it, otherwise above it (as on phones and portrait tablets).
 * The right edge lines up with the page content column, the same edge as the nav.
 */
export default function SystemScene() {
  const layout = useRef<Layout | null>(null);
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = document.getElementById("hero-copy");
    const section = host.current?.closest("section");
    if (!el || !section) return;
    const measure = () => {
      const s = section.getBoundingClientRect();
      // The name is wider than its column at large sizes, so include every child's own box.
      const boxes = [el, ...el.querySelectorAll("h1 > span")].map((n) => n.getBoundingClientRect());
      // The page's content column (the same one the nav sits in), so the graph lines up with it on wide screens.
      const shell = el.parentElement!;
      const sr = shell.getBoundingClientRect(), cs = getComputedStyle(shell);
      layout.current = {
        copy: {
          left: Math.min(...boxes.map((b) => b.left)) - s.left,
          right: Math.max(...boxes.map((b) => b.right)) - s.left,
          top: Math.min(...boxes.map((b) => b.top)) - s.top,
          bottom: Math.max(...boxes.map((b) => b.bottom)) - s.top,
        },
        content: {
          left: sr.left - s.left + parseFloat(cs.paddingLeft),
          right: sr.right - s.left - parseFloat(cs.paddingRight),
        },
      };
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    ro.observe(section);
    document.fonts?.ready.then(measure);
    return () => ro.disconnect();
  }, []);

  const placement = useCallback<Placement>(({ width, height, unitsPerPx }) => {
    const c = layout.current?.copy ?? { left: 0, right: width * 0.45, top: height * 0.45, bottom: height };
    const content = layout.current?.content ?? { left: EDGE, right: width - EDGE };
    const gw = GRAPH.right - GRAPH.left, gh = GRAPH.top - GRAPH.bottom;

    const fit = (box: Box) => {
      const w = Math.max(0, box.right - box.left), h = Math.max(0, box.bottom - box.top);
      const scale = Math.min(1, (w * unitsPerPx) / gw, (h * unitsPerPx) / gh);
      // Screen centre of the box in world units (origin at the canvas centre, y up).
      const cx = ((box.left + box.right) / 2 - width / 2) * unitsPerPx;
      const cy = (height / 2 - (box.top + box.bottom) / 2) * unitsPerPx;
      return {
        scale,
        x: cx - ((GRAPH.left + GRAPH.right) / 2) * scale,
        y: cy - ((GRAPH.bottom + GRAPH.top) / 2) * scale,
      };
    };

    const beside = fit({ left: c.right + GAP, right: content.right, top: NAV, bottom: height - EDGE });
    const above = fit({ left: content.left, right: content.right, top: NAV, bottom: c.top - GAP / 2 });
    // Beside the copy reads best on desktop, so keep it there whenever the graph still has a usable size.
    return beside.scale >= Math.min(MIN_BESIDE, above.scale) ? beside : above;
  }, []);

  return (
    <div ref={host} className="h-full w-full">
      <GraphCanvas placement={placement} />
    </div>
  );
}
