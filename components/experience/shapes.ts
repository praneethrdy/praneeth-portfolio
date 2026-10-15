import type { MorphShape } from "@/lib/content";

/**
 * Every shape is the same N particles arranged differently, so the sculpture can morph between them.
 * glow is 0..1 per particle. Flowing particles (stream, cache rays) travel from flowA to flowB with phase flowU;
 * flowU < 0 marks a static particle. cell groups particles for the test-grid sweep.
 */
export type Shape = {
  pos: Float32Array;
  glow: Float32Array;
  flowA: Float32Array;
  flowB: Float32Array;
  flowU: Float32Array;
  cell: Float32Array;
};

type Rng = () => number;

function mulberry32(seed: number): Rng {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

class Builder {
  i = 0;
  s: Shape;
  constructor(public n: number, public rng: Rng) {
    this.s = {
      pos: new Float32Array(n * 3),
      glow: new Float32Array(n),
      flowA: new Float32Array(n * 3),
      flowB: new Float32Array(n * 3),
      flowU: new Float32Array(n).fill(-1),
      cell: new Float32Array(n).fill(-1),
    };
  }
  get full() {
    return this.i >= this.n;
  }
  put(x: number, y: number, z: number, glow: number, cell = -1) {
    if (this.full) return;
    this.s.pos.set([x, y, z], this.i * 3);
    this.s.glow[this.i] = glow;
    this.s.cell[this.i] = cell;
    this.i++;
  }
  flow(a: [number, number, number], b: [number, number, number], glow: number, jitter = 0.06) {
    if (this.full) return;
    const r = this.rng;
    const j = () => (r() - 0.5) * jitter;
    this.s.flowA.set([a[0] + j(), a[1] + j(), a[2] + j()], this.i * 3);
    this.s.flowB.set([b[0] + j(), b[1] + j(), b[2] + j()], this.i * 3);
    this.s.flowU[this.i] = r();
    this.put(a[0], a[1], a[2], glow);
  }
  /** Random point on the edges of an axis-aligned box. */
  boxEdge(cx: number, cy: number, cz: number, w: number, h: number, d: number, glow: number, cell = -1) {
    const r = this.rng;
    const axis = Math.floor(r() * 3);
    const sx = r() < 0.5 ? -1 : 1, sy = r() < 0.5 ? -1 : 1, sz = r() < 0.5 ? -1 : 1;
    const u = r() * 2 - 1;
    const x = axis === 0 ? u * w / 2 : sx * w / 2;
    const y = axis === 1 ? u * h / 2 : sy * h / 2;
    const z = axis === 2 ? u * d / 2 : sz * d / 2;
    this.put(cx + x, cy + y, cz + z, glow, cell);
  }
  /** Fill whatever is left with faint dust so every shape uses exactly N particles. */
  dust(radius: number) {
    while (!this.full) {
      const r = this.rng;
      this.put((r() - 0.5) * radius * 2, (r() - 0.5) * radius * 1.2, (r() - 0.5) * radius, 0.08);
    }
    return this.s;
  }
}

function pillars(b: Builder) {
  const per = Math.floor((b.n * 0.82) / 12);
  for (let p = 0; p < 12; p++) {
    const a = (p / 12) * Math.PI * 2;
    const h = 1.2 + ((p * 7) % 5) * 0.45;
    const cx = Math.cos(a) * 3, cz = Math.sin(a) * 3;
    for (let k = 0; k < per; k++) {
      b.boxEdge(cx, -2 + h / 2, cz, 0.32, h, 0.32, 0);
      // brighter toward the top of each pillar
      b.s.glow[b.i - 1] = 0.35 + 0.65 * ((b.s.pos[(b.i - 1) * 3 + 1] + 2) / h);
    }
  }
  for (let k = 0; k < b.n * 0.1; k++) {
    const a = b.rng() * Math.PI * 2;
    b.put(Math.cos(a) * 3, -2.05, Math.sin(a) * 3, 0.3);
  }
  return b.dust(5);
}

function stream(b: Builder) {
  const sphere = (cx: number, count: number) => {
    for (let k = 0; k < count; k++) {
      const y = 1 - (k / (count - 1)) * 2, r = Math.sqrt(1 - y * y), th = k * 2.39996;
      b.put(cx + Math.cos(th) * r * 1.2, y * 1.2, Math.sin(th) * r * 1.2, 0.75);
    }
  };
  sphere(-3, Math.floor(b.n * 0.25));
  sphere(3, Math.floor(b.n * 0.25));
  // four lanes: two requests one way, two responses back
  const lanes: [number, number, number][] = [[0.25, 0.15, 1], [-0.25, -0.15, 1], [0.1, -0.3, -1], [-0.1, 0.3, -1]];
  const per = Math.floor((b.n * 0.42) / lanes.length);
  for (const [y, z, dir] of lanes) {
    for (let k = 0; k < per; k++) {
      const a: [number, number, number] = [-1.7 * dir, y, z], c: [number, number, number] = [1.7 * dir, y, z];
      b.flow(a, c, dir > 0 ? 1 : 0.6);
    }
  }
  return b.dust(5);
}

function cache(b: Builder) {
  // PostgreSQL: three stacked discs, dim
  for (let k = 0; k < b.n * 0.3; k++) {
    const level = Math.floor(b.rng() * 3), a = b.rng() * Math.PI * 2;
    b.put(Math.cos(a) * 1.7, -2.4 + level * 0.55 + (b.rng() - 0.5) * 0.05, Math.sin(a) * 1.7, 0.3);
  }
  // Infinispan: a wide bright disc
  for (let k = 0; k < b.n * 0.3; k++) {
    const a = b.rng() * Math.PI * 2, r = Math.sqrt(b.rng()) * 2.4;
    b.put(Math.cos(a) * r, 0.5, Math.sin(a) * r, 0.55 + 0.45 * (1 - r / 2.4));
  }
  // ten request rays: six stop at the cache, four fall through to the database
  const per = Math.floor((b.n * 0.32) / 10);
  for (let ray = 0; ray < 10; ray++) {
    const a = (ray / 10) * Math.PI * 2, r = 1.1;
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    const hit = ray % 5 !== 0 && ray % 5 !== 3;
    for (let k = 0; k < per; k++) b.flow([x, 3, z], [x, hit ? 0.55 : -1.3, z], hit ? 1 : 0.45, 0.04);
  }
  return b.dust(5);
}

function gauge(b: Builder) {
  const R = 2.5, tube = 0.22;
  // The filled 90% is dense and bright (70→90% brightest); the missing 10% is a faint outline.
  for (let k = 0; k < b.n * 0.8; k++) {
    const f = b.rng() < 0.96 ? b.rng() * 0.9 : 0.9 + b.rng() * 0.1;
    const a = Math.PI / 2 - f * Math.PI * 2, t = b.rng() * Math.PI * 2;
    const rr = R + Math.cos(t) * tube;
    b.put(Math.cos(a) * rr, Math.sin(a) * rr, Math.sin(t) * tube, f < 0.9 ? (f < 0.7 ? 0.7 : 1) : 0.12);
  }
  // tick at 70%, where coverage started
  const a70 = Math.PI / 2 - 0.7 * Math.PI * 2;
  for (let k = 0; k < b.n * 0.05; k++) {
    const r = R - 0.6 + b.rng() * 1.2;
    b.put(Math.cos(a70) * r, Math.sin(a70) * r, 0, 0.5);
  }
  return b.dust(5);
}

function grid(b: Builder) {
  const cols = 6, rows = 4, per = Math.floor((b.n * 0.85) / (cols * rows));
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      const x = (c - (cols - 1) / 2) * 1.05, y = ((rows - 1) / 2 - r) * 1.05;
      for (let k = 0; k < per; k++) b.boxEdge(x, y, 0, 0.62, 0.62, 0.62, 0.6, r * cols + c);
    }
  return b.dust(5);
}

function containers(b: Builder) {
  const boxes: [number, number][] = [[-2.3, -1.4], [0, -1.4], [2.3, -1.4], [-1.15, -0.4], [1.15, -0.4], [0, 0.6]];
  const per = Math.floor((b.n * 0.88) / boxes.length);
  for (const [x, y] of boxes) {
    for (let k = 0; k < per; k++) {
      if (k % 3 === 0) {
        // corrugated ribs along the long face
        const rib = Math.floor(b.rng() * 9), rx = x - 1 + rib * 0.25;
        b.put(rx, y - 0.45 + b.rng() * 0.9, 0.48, 0.45);
      } else b.boxEdge(x, y, 0, 2.2, 0.9, 0.96, 0.9);
    }
  }
  return b.dust(5);
}

const builders: Record<MorphShape, (b: Builder) => Shape> = { pillars, stream, cache, gauge, grid, containers };

export function buildShape(shape: MorphShape, n: number): Shape {
  return builders[shape](new Builder(n, mulberry32(shape.length * 977 + n)));
}
