"use client";

import { useState } from "react";

export default function CopyEmail({ email }: { email: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setState("copied");
    } catch {
      setState("failed");
    }
    setTimeout(() => setState("idle"), 2200);
  };

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-3">
      <a
        href={`mailto:${email}`}
        className="min-w-0 text-[clamp(19px,2.4vw,30px)] font-semibold tracking-[-0.01em] [overflow-wrap:anywhere] text-fg underline decoration-accent-dim decoration-2 underline-offset-[6px] hover:decoration-accent"
      >
        {email}
      </a>
      <button
        type="button"
        onClick={copy}
        className="rounded-[4px] border border-line px-3 py-1.5 font-mono text-xs text-muted transition-colors hover:border-accent hover:text-accent"
      >
        <span aria-live="polite">{state === "copied" ? "Copied" : state === "failed" ? "Select and copy" : "Copy"}</span>
      </button>
    </div>
  );
}
