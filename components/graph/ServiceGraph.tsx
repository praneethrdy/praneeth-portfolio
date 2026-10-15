"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { requestRoutes, serviceEdges, serviceNodes, type ServiceNode } from "@/lib/content";
import {
  ACCENT,
  MOBILE_BREAKPOINT,
  type Pointer,
  useGlowTexture,
  useOnScreen,
  useReducedMotion,
  useSectionPointer,
} from "@/components/three/hooks";

export type Placement = (view: {
  width: number;
  height: number;
  aspect: number;
  narrow: boolean;
  camZ: number;
  /** World units per CSS pixel at the graph's depth. */
  unitsPerPx: number;
}) => {
  x: number;
  y: number;
  scale: number;
};

/** The hero's 3D service graph: request packets flow from the client through the stack, most stopping at the cache. */
export default function GraphCanvas({ placement }: { placement: Placement }) {
  const host = useRef<HTMLDivElement>(null);
  const pointer = useSectionPointer(host);
  const reduced = useReducedMotion();
  const visible = useOnScreen(host);

  return (
    <div ref={host} className="h-full w-full">
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 0, 11.5], fov: 42 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        frameloop={reduced ? "demand" : visible ? "always" : "never"}
        fallback={null}
      >
        <ambientLight color="#406070" intensity={0.6} />
        <pointLight color="#2ee6ff" position={[0, 2, 6]} intensity={40} distance={30} />
        <Graph placement={placement} pointer={pointer} reduced={reduced} />
      </Canvas>
    </div>
  );
}

function Graph({ placement, pointer, reduced }: { placement: Placement; pointer: Pointer; reduced: boolean }) {
  const group = useRef<THREE.Group>(null);
  const graph = useRef<THREE.Group>(null);
  const { size, camera } = useThree();
  const narrow = size.width < MOBILE_BREAKPOINT;
  const glow = useGlowTexture();
  // Seconds since the scene mounted; drives the intro (nodes pop in, edges draw, then traffic starts).
  const intro = useRef(0);

  const byId = useMemo(() => new Map(serviceNodes.map((n) => [n.id, n])), []);

  // One bezier per edge, keyed "a>b", bowed slightly toward the camera so the graph reads as 3D.
  const curves = useMemo(() => {
    const map = new Map<string, THREE.QuadraticBezierCurve3>();
    for (const [a, b] of serviceEdges) {
      const A = new THREE.Vector3(...byId.get(a)!.position);
      const B = new THREE.Vector3(...byId.get(b)!.position);
      const mid = A.clone().add(B).multiplyScalar(0.5).add(new THREE.Vector3(0, 0.4, 0.6));
      map.set(`${a}>${b}`, new THREE.QuadraticBezierCurve3(A, mid, B));
    }
    return map;
  }, [byId]);

  const edgeLines = useMemo(() => {
    const mat = new THREE.LineBasicMaterial({ color: ACCENT, transparent: true, opacity: 0.22 });
    return [...curves.values()].map(
      (c) => new THREE.Line(new THREE.BufferGeometry().setFromPoints(c.getPoints(40)), mat),
    );
  }, [curves]);

  const routes = useMemo(
    () => requestRoutes.map((r) => r.slice(1).map((id, i) => curves.get(`${r[i]}>${id}`)!)),
    [curves],
  );

  const packetCount = narrow ? 8 : 14;
  const packets = useRef<{ t: number; speed: number; route: number }[]>([]);
  if (packets.current.length !== packetCount) {
    packets.current = Array.from({ length: packetCount }, (_, i) => ({
      t: (i / packetCount) * 3,
      speed: 0.55 + ((i * 37) % 10) / 20,
      route: i % routes.length,
    }));
  }
  const packetRefs = useRef<(THREE.Sprite | null)[]>([]);

  const dust = useMemo(() => {
    const count = narrow ? 250 : 600;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < arr.length; i++) arr[i] = (Math.random() - 0.5) * 18;
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(arr, 3));
    return g;
  }, [narrow]);

  useFrame((state, rawDt) => {
    if (!group.current || !graph.current) return;
    intro.current = reduced ? 99 : intro.current + Math.min(rawDt, 0.05);
    edgeLines.forEach((l, i) => {
      const k = clamp01((intro.current - 0.7 - i * 0.12) / 0.5);
      l.geometry.setDrawRange(0, Math.ceil(41 * k));
    });
    const traffic = clamp01((intro.current - 1.9) / 0.6);
    const dt = reduced ? 0 : Math.min(rawDt, 0.05);
    const t = reduced ? 2 : state.clock.elapsedTime;

    const fov = (camera as THREE.PerspectiveCamera).fov;
    const unitsPerPx = (2 * camera.position.z * Math.tan((fov * Math.PI) / 360)) / size.height;
    const p = placement({
      width: size.width,
      height: size.height,
      aspect: size.width / size.height,
      narrow,
      camZ: camera.position.z,
      unitsPerPx,
    });
    group.current.position.set(p.x, p.y, 0);
    group.current.scale.setScalar(p.scale);

    pointer.x += (pointer.tx - pointer.x) * (reduced ? 1 : 0.06);
    pointer.y += (pointer.ty - pointer.y) * (reduced ? 1 : 0.06);
    graph.current.rotation.y = (reduced ? 0 : pointer.x * 0.45) + Math.sin(t * 0.15) * 0.15;
    graph.current.rotation.x = reduced ? 0 : -pointer.y * 0.25;

    packets.current.forEach((pk, i) => {
      const sprite = packetRefs.current[i];
      const route = routes[pk.route];
      if (!sprite) return;
      pk.t += dt * pk.speed;
      if (pk.t >= route.length) pk.t = 0;
      const seg = Math.min(route.length - 1, Math.max(0, Math.floor(pk.t)));
      route[seg].getPoint(pk.t - seg, sprite.position);
      (sprite.material as THREE.SpriteMaterial).opacity =
        Math.sin(Math.PI * Math.min(1, (pk.t / route.length) * 1.05)) * 0.95 * traffic;
    });
  });

  return (
    <group ref={group}>
      <group ref={graph}>
        {serviceNodes.map((n, i) => (
          <Node key={n.id} node={n} index={i} glow={glow} showLabel={!narrow || !!n.key} reduced={reduced} intro={intro} />
        ))}
        {edgeLines.map((l, i) => (
          <primitive key={i} object={l} />
        ))}
        {packets.current.map((_, i) => (
          <sprite key={i} ref={(s) => void (packetRefs.current[i] = s)} scale={0.45}>
            <spriteMaterial map={glow} color={ACCENT} transparent blending={THREE.AdditiveBlending} depthWrite={false} />
          </sprite>
        ))}
      </group>
      <points geometry={dust}>
        <pointsMaterial color={ACCENT} size={0.03} transparent opacity={0.45} />
      </points>
    </group>
  );
}

function Node({
  node,
  index,
  glow,
  showLabel,
  reduced,
  intro,
}: {
  node: ServiceNode;
  index: number;
  glow: THREE.Texture;
  showLabel: boolean;
  reduced: boolean;
  intro: React.RefObject<number>;
}) {
  const core = useRef<THREE.Mesh>(null);
  const wire = useRef<THREE.Mesh>(null);
  const r = node.key ? 0.42 : 0.3;
  const [x, y, z] = node.position;

  useFrame((state, dt) => {
    if (!core.current || !wire.current) return;
    core.current.scale.setScalar(easeOutBack(clamp01((intro.current - index * 0.15) / 0.55)));
    if (reduced) return;
    core.current.rotation.y += dt * 0.4;
    wire.current.rotation.x += dt * 0.3;
    core.current.position.y = y + Math.sin(state.clock.elapsedTime * 1.2 + index) * 0.08;
  });

  return (
    <mesh ref={core} position={[x, y, z]}>
      <icosahedronGeometry args={[r, 1]} />
      <meshStandardMaterial
        color="#0b2730"
        emissive={node.key ? "#2ee6ff" : "#0f6f80"}
        emissiveIntensity={node.key ? 0.9 : 0.55}
        flatShading
        metalness={0.3}
        roughness={0.4}
      />
      <sprite scale={node.key ? 2.4 : 1.5}>
        <spriteMaterial
          map={glow}
          color={ACCENT}
          transparent
          opacity={node.key ? 0.55 : 0.3}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </sprite>
      <mesh ref={wire}>
        <icosahedronGeometry args={[node.key ? 0.62 : 0.46, 0]} />
        <meshBasicMaterial color={ACCENT} wireframe transparent opacity={0.25} />
      </mesh>
      {showLabel && (
        <Html position={[0, r + 0.32, 0]} center zIndexRange={[5, 0]} style={{ pointerEvents: "none" }}>
          <span
            style={{ animation: `label-in .5s ease-out ${index * 0.15 + 0.4}s both` }}
            className={`block whitespace-nowrap rounded-[3px] border bg-bg/70 px-[7px] py-[3px] font-mono text-[11px] font-medium tracking-[0.06em] ${
              node.key ? "border-accent-dim text-accent" : "border-line text-fg"
            }`}
          >
            {node.label}
          </span>
        </Html>
      )}
    </mesh>
  );
}

function clamp01(v: number) {
  return Math.min(1, Math.max(0, v));
}

function easeOutBack(k: number) {
  const c = 1.7;
  return k <= 0 ? 0.0001 : 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2);
}
