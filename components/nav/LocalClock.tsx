"use client";

import { useEffect, useState } from "react";

const fmt = (opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", hour12: false, ...opts });
const time = fmt({ hour: "2-digit", minute: "2-digit", second: "2-digit" });
const isoDate = fmt({ year: "numeric", month: "2-digit", day: "2-digit" });

/** Ticking Bengaluru time, so visitors can see the time zone at a glance. Renders "--:--:--" until mounted to avoid a hydration mismatch. */
export default function LocalClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const [hh, mm, ss] = now ? time.format(now).split(":") : ["--", "--", "--"];
  const dateTime = now ? `${isoDate.format(now).split("/").reverse().join("-")}T${hh}:${mm}:${ss}+05:30` : undefined;

  return (
    <p
      className="flex items-center gap-2 rounded-full border border-accent-dim bg-bg/60 px-3 py-1.5 font-mono text-[12px] text-fg"
      title="Local time in Bengaluru, India (IST, UTC+5:30)"
    >
      <i aria-hidden="true" className="size-[7px] rounded-full bg-accent shadow-[0_0_10px_var(--accent)] [animation:pulse-dot_1.8s_ease-in-out_infinite]" />
      <span className="text-muted">BLR</span>
      <time dateTime={dateTime} className="tabular-nums">
        {hh}:{mm}
        <span className="hidden sm:inline">
          <span className="text-muted">:</span>
          {ss}
        </span>
      </time>
      <span className="text-accent">IST</span>
    </p>
  );
}
