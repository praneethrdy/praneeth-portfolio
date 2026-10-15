"use client";

import dynamic from "next/dynamic";
import { profile } from "@/lib/content";
import SectionHeader from "@/components/ui/SectionHeader";
import CopyEmail from "./CopyEmail";
import ArrowIcon from "@/components/ui/ArrowIcon";

const GlobeScene = dynamic(() => import("./GlobeScene"), { ssr: false });

const socials = [
  { label: "GitHub", href: profile.links.github },
  { label: "LinkedIn", href: profile.links.linkedin },
  { label: "LeetCode", href: profile.links.leetcode },
  { label: "Résumé (PDF)", href: profile.resumeUrl },
];

export default function Contact() {
  return (
    <section id="contact" aria-labelledby="contact-title" className="relative overflow-hidden border-t border-line">
      <div className="shell grid grid-cols-[minmax(0,1fr)] items-center gap-6 py-[clamp(64px,10vw,128px)] lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)]">
        <div className="relative z-10 grid min-w-0 gap-8">
          <SectionHeader id="contact-title" eyebrow="Contact" title="Hiring a backend engineer?">
            I&apos;m open to backend roles and based in {profile.location}. Email is the quickest way to reach me.
          </SectionHeader>
          <CopyEmail email={profile.email} />
          <ul className="flex flex-wrap gap-2.5">
            {socials.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener"
                  className="inline-flex items-center gap-2 rounded-[4px] border border-line px-4 py-2.5 text-sm font-semibold transition-colors hover:border-accent hover:text-accent"
                >
                  {s.label} <ArrowIcon />
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div aria-hidden="true" className="relative h-[340px] min-w-0 overflow-hidden sm:h-[440px] lg:h-[560px]">
          <div className="absolute inset-0">
            <GlobeScene />
          </div>
        </div>
      </div>
    </section>
  );
}
