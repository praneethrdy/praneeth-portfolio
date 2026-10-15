import { profile } from "@/lib/content";
import HeroCanvas from "./HeroCanvas";

export default function Hero() {
  return (
    <section
      id="top"
      aria-labelledby="hero-name"
      className="relative isolate flex min-h-[clamp(640px,92svh,940px)] flex-col justify-end overflow-hidden bg-[radial-gradient(120%_90%_at_70%_40%,#0a1820_0%,var(--bg)_60%)]"
    >
      <HeroCanvas />

      <div className="pointer-events-none shell relative z-10 pb-[clamp(28px,7vw,88px)]">
        <div id="hero-copy" className="grid max-w-[560px] grid-cols-[minmax(0,1fr)] gap-4 [&>*]:pointer-events-auto">
          <span style={{ "--delay": "0.1s" } as React.CSSProperties} className="intro-rise inline-flex w-max items-center gap-2 rounded-full border border-accent-dim bg-bg/60 px-2.5 py-1.5 font-mono text-xs font-medium uppercase tracking-[0.08em] text-accent">
            <i className="size-[7px] rounded-full bg-accent shadow-[0_0_10px_var(--accent)] [animation:pulse-dot_1.8s_ease-in-out_infinite]" />
            {profile.status}
          </span>

          <h1
            id="hero-name"
            className="font-display text-[clamp(34px,calc(13vw-5px),56px)] sm:text-[clamp(48px,7.4vw,104px)] leading-[0.92] font-extrabold tracking-[-0.02em] text-balance"
          >
            <span className="intro-type block w-max" style={{ "--delay": "0.35s", "--steps": profile.firstName.length } as React.CSSProperties}>
              {profile.firstName}
            </span>
            <span className="block w-max whitespace-nowrap">
            <span className="intro-type inline-block" style={{ "--delay": "1.05s", "--steps": profile.lastName.length, "--dur": "0.5s" } as React.CSSProperties}>
              {profile.lastName}
            </span>
            <span
              aria-hidden="true"
              style={{ "--delay": "1.5s" } as React.CSSProperties}
              className="intro-rise ml-[0.08em] inline-block h-[0.72em] w-[0.09em] translate-y-[0.04em] align-baseline"
            >
              <span className="intro-caret block h-full w-full bg-accent" />
            </span>
            </span>
          </h1>

          <p style={{ "--delay": "1.6s" } as React.CSSProperties} className="intro-rise max-w-[44ch] text-[clamp(15px,1.6vw,18px)] leading-relaxed font-medium text-muted">
            <b className="font-semibold text-fg">{capitalise(profile.role)}.</b> {profile.pitch}
          </p>

          <div style={{ "--delay": "1.8s" } as React.CSSProperties} className="intro-rise flex flex-wrap gap-2.5 pt-1">
            <a
              href="#work"
              className="rounded-[4px] border border-accent bg-accent px-[18px] py-3 text-sm font-semibold text-bg transition-colors hover:bg-fg hover:border-fg"
            >
              View work
            </a>
            <a
              href={profile.resumeUrl}
              target="_blank"
              rel="noopener"
              className="rounded-[4px] border border-line bg-bg/60 px-[18px] py-3 text-sm font-semibold text-fg transition-colors hover:border-accent hover:text-accent"
            >
              Résumé
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function capitalise(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
