import { experience } from "@/lib/content";
import SectionHeader from "@/components/ui/SectionHeader";
import ExperienceScroll from "./ExperienceScroll";

export default function Experience() {
  return (
    <section id="work" aria-labelledby="work-title" className="relative border-t border-line">
      <div className="shell">
        <div className="pt-[clamp(64px,10vw,128px)] pb-6 lg:pb-0">
          <SectionHeader id="work-title" eyebrow={`Experience · ${experience.period}`} title={`${experience.role}, ${experience.company}`}>
            <span className="font-semibold text-fg">{experience.product}.</span> {experience.context}
          </SectionHeader>
        </div>

        <ExperienceScroll />

        <p className="max-w-[60ch] border-t border-line py-[clamp(40px,6vw,72px)] text-[15px] leading-relaxed text-muted">
          {experience.teamwork}
        </p>
      </div>
    </section>
  );
}
