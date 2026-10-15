"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { ACCENT, type Pointer, useGlowTexture, useOnScreen, useReducedMotion, useSectionPointer } from "@/components/three/hooks";

const R = 2.4;
const HOME = { lat: 12.97, lon: 77.59 }; // Bengaluru

function toVec(lat: number, lon: number, r = R) {
  const phi = ((90 - lat) * Math.PI) / 180, th = ((lon + 180) * Math.PI) / 180;
  return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(th), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(th));
}

/** A dotted globe that turns to face Bengaluru, with messages arcing out from there. */
export default function GlobeScene() {
  const host = useRef<HTMLDivElement>(null);
  const pointer = useSectionPointer(host);
  const reduced = useReducedMotion();
  const visible = useOnScreen(host);

  return (
    <div ref={host} className="h-full w-full">
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 0, 7.5], fov: 40 }}
        gl={{ antialias: true, alpha: true }}
        frameloop={reduced ? "demand" : visible ? "always" : "never"}
        fallback={null}
      >
        <Globe pointer={pointer} reduced={reduced} />
      </Canvas>
    </div>
  );
}

function Globe({ pointer, reduced }: { pointer: Pointer; reduced: boolean }) {
  const globe = useRef<THREE.Group>(null);
  const pulse = useRef<THREE.Mesh>(null);
  const glow = useGlowTexture();
  const home = useMemo(() => toVec(HOME.lat, HOME.lon), []);
  // Rotation about Y that brings Bengaluru to the front.
  const facing = useMemo(() => Math.atan2(-home.x, home.z), [home]);

  const dots = useMemo(() => {
    const n = 2200, arr = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const y = 1 - ((i + 0.5) / n) * 2, r = Math.sqrt(1 - y * y), th = i * 2.39996;
      arr.set([Math.cos(th) * r * R, y * R, Math.sin(th) * r * R], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(arr, 3));
    return g;
  }, []);

  // Arcs out to a spread of points around the world.
  const arcs = useMemo(
    () =>
      [
        [51.5, -0.1],
        [1.35, 103.8],
        [37.4, -122.1],
        [25.2, 55.3],
        [-33.9, 151.2],
        [52.5, 13.4],
      ].map(([lat, lon]) => {
        const end = toVec(lat, lon);
        const mid = home.clone().add(end).multiplyScalar(0.5);
        mid.setLength(R + home.distanceTo(end) * 0.45);
        const curve = new THREE.QuadraticBezierCurve3(home.clone(), mid, end);
        const line = new THREE.Line(
          new THREE.BufferGeometry().setFromPoints(curve.getPoints(60)),
          new THREE.LineBasicMaterial({ color: ACCENT, transparent: true, opacity: 0.35 }),
        );
        return { curve, line };
      }),
    [home],
  );
  const sparks = useRef<(THREE.Sprite | null)[]>([]);

  const ringQuat = useMemo(() => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), home.clone().normalize()), [home]);

  useFrame((state) => {
    const t = reduced ? 1 : state.clock.elapsedTime;
    if (!globe.current) return;
    pointer.x += (pointer.tx - pointer.x) * (reduced ? 1 : 0.05);
    pointer.y += (pointer.ty - pointer.y) * (reduced ? 1 : 0.05);
    globe.current.rotation.y = facing + (reduced ? 0 : Math.sin(t * 0.25) * 0.5) + pointer.x * 0.4;
    globe.current.rotation.x = 0.25 - pointer.y * 0.2;

    if (pulse.current) {
      const k = (t * 0.6) % 1;
      pulse.current.scale.setScalar(0.4 + k * 1.3);
      (pulse.current.material as THREE.MeshBasicMaterial).opacity = (1 - k) * 0.8;
    }
    arcs.forEach((a, i) => {
      const s = sparks.current[i];
      if (!s) return;
      const k = (t * 0.28 + i / arcs.length) % 1;
      a.curve.getPoint(k, s.position);
      (s.material as THREE.SpriteMaterial).opacity = Math.sin(Math.PI * k);
    });
  });

  return (
    <group ref={globe}>
      <mesh>
        <sphereGeometry args={[R * 0.985, 48, 48]} />
        <meshBasicMaterial color="#071218" transparent opacity={0.85} />
      </mesh>
      <points geometry={dots}>
        <pointsMaterial color="#2a6f7d" size={0.035} transparent opacity={0.9} />
      </points>
      {arcs.map((a, i) => (
        <group key={i}>
          <primitive object={a.line} />
          <sprite ref={(s) => void (sparks.current[i] = s)} scale={0.32}>
            <spriteMaterial map={glow} color={ACCENT} transparent blending={THREE.AdditiveBlending} depthWrite={false} />
          </sprite>
        </group>
      ))}
      <group position={home} quaternion={ringQuat}>
        <sprite scale={0.9}>
          <spriteMaterial map={glow} color={ACCENT} transparent blending={THREE.AdditiveBlending} depthWrite={false} />
        </sprite>
        <mesh ref={pulse}>
          <ringGeometry args={[0.16, 0.2, 48]} />
          <meshBasicMaterial color={ACCENT} transparent side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
        <Html position={[0, 0.35, 0]} center zIndexRange={[5, 0]} style={{ pointerEvents: "none" }}>
          <span className="block whitespace-nowrap rounded-[3px] border border-accent-dim bg-bg/80 px-[7px] py-[3px] font-mono text-[11px] tracking-[0.06em] text-accent">
            Bengaluru · IST
          </span>
        </Html>
      </group>
    </group>
  );
}
