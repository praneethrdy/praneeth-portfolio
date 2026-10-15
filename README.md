# Praneeth Reddy · Portfolio

Personal portfolio of a Java backend engineer, built with Next.js and three.js.

**Live site:** https://praneeth-portfolio-silk.vercel.app

Each section has its own interactive visual, tied to the work it describes:

- **Hero:** a 3D service graph of a banking request path (client → REST → gRPC → Infinispan cache → PostgreSQL). Request packets flow through it, and most of them stop at the cache.
- **Experience:** a particle sculpture that re-forms for each achievement as you scroll: a ring of API pillars, a gRPC stream, the cache layer, a 90% coverage gauge, a regression test grid and stacked containers.
- **Projects:** a playable demo of the Payment Retry Engine. Drop a response or take the bank down, then watch idempotency keys, the outbox, exponential backoff and the dead-letter queue respond.
- **Skills:** a draggable 3D tag sphere.
- **Contact:** a dotted globe centred on Bengaluru.

## Stack

- Next.js 15 (App Router, every page prerendered as static), React 19, TypeScript
- three.js through React Three Fiber and drei
- Tailwind CSS 4
- Lenis for smooth scrolling
- Deployed on Vercel

## Run locally

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

Requires Node 18.18 or newer.

## Where things live

| Path | What it holds |
| --- | --- |
| `lib/content.ts` | All text on the site: profile, experience, projects, skills, education |
| `components/hero/`, `components/graph/` | Hero copy and the 3D service graph |
| `components/experience/` | Scroll-pinned particle sculpture and its shapes |
| `components/projects/` | Payment Retry Engine demo and project cards |
| `components/skills/`, `components/contact/` | Tag sphere, globe, contact links |
| `app/` | Page layout, favicon, link-preview image, 404 page |

All 3D scenes pause when they are off-screen and fall back to still frames for visitors who prefer reduced motion.
