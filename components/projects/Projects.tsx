import Image from "next/image";
import { projects } from "@/lib/content";
import farmShot from "@/public/projects/amramrutam.jpg";
import SectionHeader from "@/components/ui/SectionHeader";
import PaymentDemo from "./PaymentDemo";
import TiltCard from "./TiltCard";
import ArrowIcon from "@/components/ui/ArrowIcon";

export default function Projects() {
  const [engine, farm] = projects;

  return (
    <section id="projects" aria-labelledby="projects-title" className="border-t border-line py-[clamp(64px,10vw,128px)]">
      <div className="shell grid grid-cols-[minmax(0,1fr)] gap-[clamp(40px,6vw,72px)]">
        <SectionHeader id="projects-title" eyebrow="Projects" title="Built outside the day job" layout="split">
          A payment engine you can break on purpose, and a website for a paying client.
        </SectionHeader>

        <article className="grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-start">
          <ProjectText project={engine} />
          <PaymentDemo />
        </article>

        <TiltCard className="rounded-md border border-line bg-panel">
          <article className="grid grid-cols-[minmax(0,1fr)] gap-8 p-5 sm:p-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
            <ProjectText project={farm} />
            <FarmPreview />
          </article>
        </TiltCard>
      </div>
    </section>
  );
}

function ProjectText({ project }: { project: (typeof projects)[number] }) {
  return (
    <div className="grid min-w-0 content-start gap-4">
      <p className="font-mono text-[11px] tracking-[0.12em] text-muted uppercase">{project.kind}</p>
      <h3 className="font-display text-[clamp(26px,3vw,38px)] leading-[1.05] font-extrabold tracking-[-0.01em]">{project.name}</h3>
      <p className="max-w-[54ch] text-[15px] leading-relaxed text-fg/85">{project.summary}</p>
      <ul className="grid gap-2.5">
        {project.points.map((pt) => (
          <li key={pt} className="grid grid-cols-[14px_minmax(0,1fr)] gap-2 text-[14px] leading-relaxed text-muted">
            <span aria-hidden="true" className="mt-[9px] h-px w-2.5 bg-accent" />
            {pt}
          </li>
        ))}
      </ul>
      <ul className="flex flex-wrap gap-2 pt-1" aria-label="Tech stack">
        {project.stack.map((s) => (
          <li key={s} className="rounded-full border border-line px-2.5 py-1 font-mono text-[11px] text-fg/80">
            {s}
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-3 pt-2">
        {project.links.map((l) => (
          <a
            key={l.href}
            href={l.href}
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-2 text-sm font-semibold text-accent underline-offset-4 hover:underline"
          >
            {l.label} <ArrowIcon />
          </a>
        ))}
      </div>
    </div>
  );
}

/** The live client site in a browser frame, with the stack that powers it underneath. */
function FarmPreview() {
  return (
    <div className="grid min-w-0 content-center gap-3 [transform:translateZ(40px)]">
      <a
        href="https://amramrutam.vercel.app/"
        target="_blank"
        rel="noopener"
        className="group block overflow-hidden rounded-[6px] border border-line bg-bg shadow-[0_30px_60px_-30px_rgba(0,0,0,.8)] transition-colors hover:border-accent-dim"
      >
        <div className="flex items-center gap-1.5 border-b border-line px-3 py-2">
          <i className="size-2 rounded-full bg-line" />
          <i className="size-2 rounded-full bg-line" />
          <i className="size-2 rounded-full bg-line" />
          <span className="ml-2 truncate font-mono text-[11px] text-muted">amramrutam.vercel.app</span>
        </div>
        <Image
          src={farmShot}
          alt="Home page of the Amramrutam Mango Farm website: 'Discover the Essence of Organic Mangoes' beside a photo of cut mangoes."
          sizes="(min-width: 1024px) 55vw, 100vw"
          placeholder="blur"
          className="block h-auto w-full max-w-full transition-transform duration-700 ease-out group-hover:scale-[1.02]"
        />
      </a>
      <div aria-label="Architecture" className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-muted">
        <span className="rounded border border-line px-2 py-1">Vercel</span>
        <span aria-hidden="true">→</span>
        <span className="rounded border border-accent-dim px-2 py-1 text-accent">Java REST API</span>
        <span aria-hidden="true">→</span>
        <span className="rounded border border-line px-2 py-1">PostgreSQL</span>
        <span className="text-muted/70">in Docker</span>
      </div>
    </div>
  );
}
