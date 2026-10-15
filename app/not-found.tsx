import Link from "next/link";

// A 404 styled as the JSON error body one of Praneeth's APIs would return.
export default function NotFound() {
  return (
    <main className="shell grid min-h-svh place-items-center py-16">
      <div className="grid w-full max-w-[640px] gap-8">
        <p className="font-mono text-xs tracking-[0.14em] text-accent uppercase">HTTP 404</p>
        <h1 className="font-display text-[clamp(40px,8vw,88px)] leading-[0.95] font-extrabold tracking-[-0.02em]">
          No route matches this path.
        </h1>
        <pre className="overflow-x-auto rounded-md border border-line bg-panel p-5 font-mono text-[13px] leading-relaxed text-fg/85">
          <code>
            {"{\n"}
            {"  "}<span className="text-muted">&quot;status&quot;</span>: <span className="text-accent">404</span>,{"\n"}
            {"  "}<span className="text-muted">&quot;error&quot;</span>: <span className="text-[#ffc861]">&quot;Not Found&quot;</span>,{"\n"}
            {"  "}<span className="text-muted">&quot;message&quot;</span>: <span className="text-[#ffc861]">&quot;The page you asked for does not exist.&quot;</span>,{"\n"}
            {"  "}<span className="text-muted">&quot;retryable&quot;</span>: <span className="text-accent">false</span>{"\n"}
            {"}"}
          </code>
        </pre>
        <div className="flex flex-wrap gap-3">
          <Link href="/" className="rounded-[4px] border border-accent bg-accent px-[18px] py-3 text-sm font-semibold text-bg hover:border-fg hover:bg-fg">
            Back to the home page
          </Link>
          <Link href="/#contact" className="rounded-[4px] border border-line px-[18px] py-3 text-sm font-semibold hover:border-accent hover:text-accent">
            Contact Praneeth
          </Link>
        </div>
      </div>
    </main>
  );
}
