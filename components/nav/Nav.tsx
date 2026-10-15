"use client";

import { useEffect, useState } from "react";
import { profile } from "@/lib/content";
import LocalClock from "./LocalClock";

const links = [
  { href: "#work", label: "Experience" },
  { href: "#projects", label: "Projects" },
  { href: "#skills", label: "Skills" },
  { href: "#education", label: "Education" },
  { href: "#contact", label: "Contact" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(scrollY > 40);
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });

    // Underline the link for whichever section crosses the middle of the screen.
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setCurrent(`#${e.target.id}`);
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    document.querySelectorAll("main > section[id]").forEach((s) => io.observe(s));
    return () => {
      removeEventListener("scroll", onScroll);
      io.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 pt-[env(safe-area-inset-top,0px)] transition-[background-color,border-color] duration-300 ${
        scrolled || open ? "border-b border-line bg-bg/85 backdrop-blur-md" : "border-b border-transparent"
      }`}
    >
      <nav aria-label="Main" className="shell grid h-16 grid-cols-[minmax(0,1fr)_auto] items-center gap-6 md:grid-cols-[1fr_auto_1fr]">
        {/* { pr } — the braces spread apart on hover or focus to spell out the full name. */}
        <a
          href="#top"
          aria-label={`${profile.firstName} ${profile.lastName}, back to top`}
          className="group flex items-center justify-self-start font-mono text-[17px] font-medium tracking-tight whitespace-nowrap"
          onClick={() => setOpen(false)}
        >
          <span aria-hidden="true" className="flex items-center">
            <span className="text-accent transition-[margin] duration-300 ease-out group-hover:mr-1.5 group-focus-visible:mr-1.5">{"{"}</span>
            <span className="px-1.5 text-fg">
              pr
              <span className="inline-block max-w-0 overflow-hidden align-bottom opacity-0 transition-[max-width,opacity] duration-500 ease-out group-hover:max-w-[13ch] group-hover:opacity-100 group-focus-visible:max-w-[13ch] group-focus-visible:opacity-100">
                aneeth<span className="text-accent">.</span>reddy
              </span>
            </span>
            <span className="text-accent transition-[margin] duration-300 ease-out group-hover:ml-1.5 group-focus-visible:ml-1.5">{"}"}</span>
          </span>
        </a>

        <ul className="hidden items-center gap-2 md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                aria-current={current === l.href ? "true" : undefined}
                className={`block rounded-full border px-3.5 py-1.5 text-sm font-medium backdrop-blur-sm transition-colors ${
                  current === l.href
                    ? "border-accent-dim bg-accent/10 text-accent"
                    : "border-line bg-fg/[0.03] text-muted hover:border-muted/60 hover:text-fg"
                }`}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2 justify-self-end">
          <LocalClock />
          <button
            type="button"
            className="grid size-10 place-items-center rounded-[4px] border border-line md:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((o) => !o)}
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6">
              {open ? <path d="M3 3l12 12M15 3L3 15" /> : <path d="M2 5h14M2 9h14M2 13h14" />}
            </svg>
          </button>
        </div>
      </nav>

      <ul id="mobile-menu" hidden={!open} className="shell grid gap-1 pb-4 md:hidden">
        {links.map((l) => (
          <li key={l.href}>
            <a
              href={l.href}
              onClick={() => setOpen(false)}
              className="block rounded-full border border-line bg-fg/[0.03] px-5 py-3 font-display text-lg font-semibold backdrop-blur-sm"
            >
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </header>
  );
}
