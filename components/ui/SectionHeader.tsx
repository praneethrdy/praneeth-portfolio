/**
 * Section opener. "lg" is for the main sections (Experience, Projects, Contact), "md" for the supporting ones.
 * "split" puts the intro beside the title on wide screens instead of under it.
 */
export default function SectionHeader({
  id,
  eyebrow,
  title,
  children,
  size = "lg",
  layout = "stack",
}: {
  id: string;
  eyebrow: string;
  title: React.ReactNode;
  children?: React.ReactNode;
  size?: "lg" | "md";
  layout?: "stack" | "split";
}) {
  const split = layout === "split";
  return (
    <header
      className={`relative isolate grid grid-cols-[minmax(0,1fr)] gap-4 ${
        split ? "lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end lg:gap-x-12" : "max-w-[760px]"
      }`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-28 -left-32 -z-10 size-[460px] max-w-[100vw] rounded-full bg-[radial-gradient(circle,rgba(46,230,255,.10),transparent_62%)] blur-2xl"
      />
      <div className="grid min-w-0 gap-4">
        <p className="flex items-center gap-3 font-mono text-xs font-medium tracking-[0.14em] text-accent uppercase">
          <span aria-hidden="true" className="h-px w-8 bg-accent" />
          {eyebrow}
        </p>
        <h2
          id={id}
          className={`font-display leading-[1.02] font-extrabold tracking-[-0.015em] break-words text-balance ${
            size === "lg" ? "text-[clamp(28px,4.6vw,60px)]" : "text-[clamp(26px,3.2vw,42px)]"
          }`}
        >
          {title}
        </h2>
      </div>
      {children && (
        <div className={`max-w-[60ch] text-[clamp(15px,1.4vw,17px)] leading-relaxed text-muted ${split ? "lg:pb-2" : ""}`}>
          {children}
        </div>
      )}
    </header>
  );
}
