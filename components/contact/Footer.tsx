import { profile } from "@/lib/content";
import ArrowIcon from "@/components/ui/ArrowIcon";

export default function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="shell flex flex-wrap items-center justify-between gap-3 py-6 font-mono text-xs text-muted">
        <p>
          © 2026 {profile.firstName} {profile.lastName}
        </p>
        <p>Built with Next.js and three.js</p>
        <a href="#top" className="inline-flex items-center gap-1.5 hover:text-accent">
          Back to top <ArrowIcon direction="up" />
        </a>
      </div>
    </footer>
  );
}
