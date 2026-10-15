"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { experience } from "@/lib/content";

const ExperienceScene = dynamic(() => import("./ExperienceScene"), { ssr: false });

const steps = experience.achievements;

/** Achievements scroll past a pinned particle sculpture that re-forms for whichever one is being read. */
export default function ExperienceScroll() {
  const [active, setActive] = useState(0);
  const items = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    // On phones the nav and sculpture cover the top half of the screen, so the "reading line" sits lower.
    const wide = matchMedia("(min-width: 1024px)").matches;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.index));
      },
      { rootMargin: wide ? "-50% 0px -50% 0px" : "-72% 0px -28% 0px" },
    );
    items.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  const step = steps[active];

  // Scroll a step onto the same reading line the observer uses (middle on desktop, below the sculpture on phones).
  const goTo = (i: number) => {
    const el = items.current[i];
    if (!el) return;
    const line = matchMedia("(min-width: 1024px)").matches ? 0.5 : 0.72;
    const r = el.getBoundingClientRect();
    scrollTo({ top: scrollY + r.top + r.height / 2 - innerHeight * line, behavior: "smooth" });
  };

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-x-[clamp(32px,4vw,64px)]">
      <div className="sticky top-[calc(64px+env(safe-area-inset-top,0px))] z-10 -mx-[max(16px,env(safe-area-inset-left,0px))] h-[42svh] border-b border-line bg-bg lg:border-b-0 sm:-mx-[clamp(24px,5vw,72px)] lg:order-2 lg:mx-0 lg:h-[calc(100svh-64px)] lg:bg-transparent">
        <div aria-hidden="true" className="absolute inset-0 lg:[mask-image:linear-gradient(to_right,transparent,black_18%)]">
          <ExperienceScene shape={step.shape} />
        </div>
        <div className="absolute inset-x-[max(16px,env(safe-area-inset-left,0px))] bottom-3 grid gap-2 sm:inset-x-[clamp(24px,5vw,72px)] lg:inset-x-0 lg:bottom-10">
          <ol className="flex gap-1.5" aria-label="Achievements">
            {steps.map((s, i) => (
              <li key={s.id} className="flex-1">
                <button
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`${i + 1}. ${s.title}`}
                  aria-current={i === active ? "step" : undefined}
                  className="group block w-full py-2"
                >
                  <span className="block h-[3px] overflow-hidden rounded-full bg-line transition-colors group-hover:bg-muted/50">
                    <span
                      className={`block h-full rounded-full bg-accent transition-[width] duration-700 ease-out ${
                        i <= active ? "w-full" : "w-0"
                      } ${i === active ? "shadow-[0_0_10px_var(--accent)]" : ""}`}
                    />
                  </span>
                </button>
              </li>
            ))}
          </ol>
          <p aria-live="polite" className="font-mono text-[11px] tracking-[0.08em] text-muted uppercase">
            <span className="text-accent tabular-nums">
              {String(active + 1).padStart(2, "0")}/{String(steps.length).padStart(2, "0")}
            </span>{" "}
            · {step.title}
          </p>
        </div>
      </div>

      <ol className="lg:order-1">
        {steps.map((s, i) => (
          <li
            key={s.id}
            ref={(el) => void (items.current[i] = el)}
            data-index={i}
            className="flex min-h-[55svh] items-center py-8 lg:min-h-[68svh]"
          >
            <article
              className={`grid gap-3 border-l pl-5 transition-[opacity,border-color] duration-500 lg:pl-7 ${
                i === active ? "border-accent opacity-100" : "border-line opacity-45"
              }`}
            >
              <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="font-display text-[clamp(40px,5vw,68px)] leading-none font-extrabold tracking-[-0.02em] text-accent tabular-nums">
                  {s.metric}
                </span>
                <span className="font-mono text-xs tracking-[0.06em] text-muted uppercase">{s.metricLabel}</span>
              </p>
              <h3 className="text-[clamp(19px,1.8vw,23px)] leading-snug font-semibold text-balance">{s.title}</h3>
              <p className="max-w-[52ch] text-[15px] leading-relaxed text-muted">{s.body}</p>
              <ul className="flex flex-wrap gap-2 pt-1">
                {s.tags.map((t) => (
                  <li key={t} className="rounded-full border border-line px-2.5 py-1 font-mono text-[11px] text-fg/80">
                    {t}
                  </li>
                ))}
              </ul>
            </article>
          </li>
        ))}
      </ol>
    </div>
  );
}
