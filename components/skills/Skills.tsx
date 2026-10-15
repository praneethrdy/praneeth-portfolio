import { skillGroups } from "@/lib/content";
import SectionHeader from "@/components/ui/SectionHeader";
import TagSphere from "./TagSphere";

// The tools used every day at iCABO stand out on the sphere.
const daily = ["Java 17", "Quarkus", "gRPC", "PostgreSQL", "Infinispan", "JUnit 5", "Docker", "Hexagonal"];

export default function Skills() {
  const tags = skillGroups.flatMap((g) => g.items);

  return (
    <section id="skills" aria-labelledby="skills-title" className="border-t border-line py-[clamp(64px,10vw,128px)]">
      <div className="shell grid grid-cols-[minmax(0,1fr)] gap-[clamp(32px,5vw,56px)]">
        <SectionHeader id="skills-title" eyebrow={`Skills · ${tags.length} tools`} title="What I build with" size="md" layout="split">
          Highlighted on the sphere: what I use every day in production. Drag it to spin.
        </SectionHeader>

        <div className="grid grid-cols-[minmax(0,1fr)] items-center gap-10 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)]">
          <TagSphere tags={tags} highlight={daily} />

          <dl className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
            {skillGroups.map((g) => (
              <div key={g.name} className="grid min-w-0 content-start gap-2 border-t border-line pt-3">
                <dt className="font-mono text-[11px] tracking-[0.12em] text-accent uppercase">{g.name}</dt>
                <dd className="text-[15px] leading-relaxed text-fg/85">{g.items.join(" · ")}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
