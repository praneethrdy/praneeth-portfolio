import { certifications, education } from "@/lib/content";
import SectionHeader from "@/components/ui/SectionHeader";
import ArrowIcon from "@/components/ui/ArrowIcon";

export default function Education() {
  return (
    <section id="education" aria-labelledby="education-title" className="border-t border-line py-[clamp(64px,10vw,128px)]">
      <div className="shell grid grid-cols-[minmax(0,1fr)] gap-[clamp(32px,5vw,56px)]">
        <SectionHeader id="education-title" eyebrow="Education" title="Computer applications, Bengaluru" size="md" />

        <ol className="grid gap-4 md:grid-cols-2">
          {education.map((e) => {
            const pct = parseFloat(e.score);
            return (
              <li key={e.degree} className="grid min-w-0 content-start gap-4 rounded-md border border-line bg-panel p-5 sm:p-6">
                <p className="font-mono text-[11px] tracking-[0.12em] text-muted uppercase">{e.period}</p>
                <div className="grid gap-1">
                  <h3 className="text-[19px] leading-snug font-semibold text-balance">{e.degree}</h3>
                  <p className="text-[15px] text-muted">{e.school}</p>
                </div>
                <div className="grid gap-2">
                  <p className="flex items-baseline gap-2">
                    <span className="font-display text-[40px] leading-none font-extrabold text-accent tabular-nums">{e.score}</span>
                    <span className="font-mono text-[11px] tracking-[0.08em] text-muted uppercase">aggregate</span>
                  </p>
                  <div className="h-1 w-full overflow-hidden rounded-full bg-line" role="img" aria-label={`${e.score} out of 100%`}>
                    <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="grid gap-3">
          <h3 className="font-mono text-[11px] tracking-[0.12em] text-muted uppercase">Certification</h3>
          {certifications.map((c) => (
            <div key={c.name} className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-t border-line pt-4">
              <p className="text-[16px]">
                <span className="font-semibold">{c.name}</span>
                <span className="text-muted"> · {c.issuer}, {c.year}</span>
              </p>
              <a href={c.href} target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent underline-offset-4 hover:underline">
                View certificate <ArrowIcon />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
