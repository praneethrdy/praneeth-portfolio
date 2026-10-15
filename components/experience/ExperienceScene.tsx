"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { MorphShape } from "@/lib/content";
import {
  ACCENT,
  ACCENT_DIM,
  MOBILE_BREAKPOINT,
  type Pointer,
  useGlowTexture,
  useOnScreen,
  useReducedMotion,
  useSectionPointer,
} from "@/components/three/hooks";
import { buildShape, type Shape } from "./shapes";

const ALL: MorphShape[] = ["pillars", "stream", "cache", "gauge", "grid", "containers"];
const MORPH_SECONDS = 1.1;

/** A particle sculpture that re-forms into a different shape for each achievement. */
export default function ExperienceScene({ shape }: { shape: MorphShape }) {
  const host = useRef<HTMLDivElement>(null);
  const pointer = useSectionPointer(host);
  const reduced = useReducedMotion();
  const visible = useOnScreen(host);

  return (
    <div ref={host} className="h-full w-full">
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 0.6, 10], fov: 42 }}
        gl={{ antialias: true, alpha: true }}
        frameloop={reduced ? "demand" : visible ? "always" : "never"}
        fallback={null}
      >
        <Particles shape={shape} pointer={pointer} reduced={reduced} />
      </Canvas>
    </div>
  );
}

function Particles({ shape, pointer, reduced }: { shape: MorphShape; pointer: Pointer; reduced: boolean }) {
  const { size, invalidate } = useThree();
  const narrow = size.width < MOBILE_BREAKPOINT;
  const n = narrow ? 2400 : 4200;
  const glowTex = useGlowTexture();
  const group = useRef<THREE.Group>(null);

  const shapes = useMemo(() => Object.fromEntries(ALL.map((s) => [s, buildShape(s, n)])) as Record<MorphShape, Shape>, [n]);

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(shapes.pillars.pos.slice(), 3));
    g.setAttribute("color", new THREE.BufferAttribute(new Float32Array(n * 3), 3));
    return g;
  }, [shapes, n]);

  // Per-particle start position, current glow, and a random delay/scatter so the morph ripples instead of snapping.
  const state = useMemo(() => {
    const rnd = new Float32Array(n * 4);
    for (let i = 0; i < rnd.length; i++) rnd[i] = Math.random();
    return { from: shapes.pillars.pos.slice(), glow: shapes.pillars.glow.slice(), rnd, start: -10, target: shapes.pillars };
  }, [shapes, n]);

  useEffect(() => {
    state.from.set(geo.attributes.position.array as Float32Array);
    state.target = shapes[shape];
    state.start = -1; // stamped with the clock on the next frame
    invalidate();
  }, [shape, shapes, state, geo, invalidate]);

  const tmp = useMemo(() => new THREE.Color(), []);

  useFrame((frame) => {
    const t = frame.clock.elapsedTime;
    if (state.start === -1) state.start = t;
    const { from, target, rnd, glow } = state;
    const pos = geo.attributes.position.array as Float32Array;
    const col = geo.attributes.color.array as Float32Array;
    const flowT = reduced ? 0.35 : t;
    const sweepCell = reduced ? -2 : Math.floor(t * 5) % 24;

    for (let i = 0; i < n; i++) {
      const k3 = i * 3;
      const delay = rnd[i * 4] * 0.45;
      const k = reduced ? 1 : Math.min(1, Math.max(0, (t - state.start - delay) / MORPH_SECONDS));
      const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      const scatter = Math.sin(Math.PI * e) * 1.2;

      let tx: number, ty: number, tz: number;
      const u = target.flowU[i];
      if (u >= 0) {
        const f = (u + flowT * 0.35) % 1;
        tx = target.flowA[k3] + (target.flowB[k3] - target.flowA[k3]) * f;
        ty = target.flowA[k3 + 1] + (target.flowB[k3 + 1] - target.flowA[k3 + 1]) * f;
        tz = target.flowA[k3 + 2] + (target.flowB[k3 + 2] - target.flowA[k3 + 2]) * f;
      } else {
        tx = target.pos[k3];
        ty = target.pos[k3 + 1];
        tz = target.pos[k3 + 2];
      }
      pos[k3] = from[k3] + (tx - from[k3]) * e + (rnd[i * 4 + 1] - 0.5) * scatter;
      pos[k3 + 1] = from[k3 + 1] + (ty - from[k3 + 1]) * e + (rnd[i * 4 + 2] - 0.5) * scatter;
      pos[k3 + 2] = from[k3 + 2] + (tz - from[k3 + 2]) * e + (rnd[i * 4 + 3] - 0.5) * scatter;

      // Test grid: one case at a time flashes as it "passes".
      const boost = target.cell[i] === sweepCell ? 0.6 : 0;
      glow[i] += (Math.min(1, target.glow[i] + boost) - glow[i]) * (reduced ? 1 : 0.08);
      tmp.copy(ACCENT_DIM).lerp(ACCENT, glow[i]).multiplyScalar(0.3 + glow[i] * 1.3);
      col[k3] = tmp.r;
      col[k3 + 1] = tmp.g;
      col[k3 + 2] = tmp.b;
    }
    geo.attributes.position.needsUpdate = true;
    geo.attributes.color.needsUpdate = true;

    if (group.current) {
      pointer.x += (pointer.tx - pointer.x) * (reduced ? 1 : 0.05);
      pointer.y += (pointer.ty - pointer.y) * (reduced ? 1 : 0.05);
      group.current.rotation.y = (reduced ? 0 : Math.sin(t * 0.2) * 0.35) + pointer.x * 0.5;
      group.current.rotation.x = 0.12 - pointer.y * 0.2;
      group.current.scale.setScalar(Math.min(1, (size.width / size.height) * (narrow ? 0.72 : 0.9)));
    }
  });

  return (
    <group ref={group}>
      <points geometry={geo}>
        <pointsMaterial
          size={narrow ? 0.11 : 0.095}
          map={glowTex}
          vertexColors
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}
