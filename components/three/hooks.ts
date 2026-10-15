"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

export const ACCENT = new THREE.Color("#2ee6ff");
export const ACCENT_DIM = new THREE.Color("#0f6f80");
export const MOBILE_BREAKPOINT = 640;

export type Pointer = { x: number; y: number; tx: number; ty: number };

export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
}

/** True while the element is on screen; scenes use it to stop their render loop. */
export function useOnScreen(ref: React.RefObject<HTMLElement | null>) {
  const [on, setOn] = useState(true);
  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(([e]) => setOn(e.isIntersecting));
    io.observe(ref.current);
    return () => io.disconnect();
  }, [ref]);
  return on;
}

/** Cursor position over the closest <section>, in -1..1, eased in the frame loop by the scene. */
export function useSectionPointer(ref: React.RefObject<HTMLElement | null>) {
  const pointer = useRef<Pointer>({ x: 0, y: 0, tx: 0, ty: 0 });
  useEffect(() => {
    const el = ref.current?.closest("section");
    if (!el) return;
    const p = pointer.current;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      p.tx = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1));
      p.ty = Math.max(-1, Math.min(1, (e.clientY / innerHeight) * 2 - 1));
    };
    const leave = () => (p.tx = p.ty = 0);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, [ref]);
  return pointer.current;
}

export function useGlowTexture() {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const g = c.getContext("2d")!;
    const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, "rgba(255,255,255,1)");
    grad.addColorStop(0.25, "rgba(120,240,255,.6)");
    grad.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  }, []);
}
