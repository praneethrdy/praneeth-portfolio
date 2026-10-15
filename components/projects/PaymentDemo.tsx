"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type NodeId = "client" | "api" | "db" | "worker" | "bank" | "dlq";
type Tone = "info" | "ok" | "warn" | "bad";
type Line = { id: number; at: string; who: string; text: string; tone: Tone };

const nodes: { id: NodeId; label: string; sub: string }[] = [
  { id: "client", label: "Client", sub: "mobile app" },
  { id: "api", label: "Payments API", sub: "Quarkus" },
  { id: "db", label: "PostgreSQL", sub: "payments + outbox" },
  { id: "worker", label: "Worker", sub: "outbox poller" },
  { id: "bank", label: "Bank", sub: "external" },
  { id: "dlq", label: "Dead letters", sub: "for review" },
];

const toneClass: Record<Tone, string> = {
  info: "text-fg/85",
  ok: "text-accent",
  warn: "text-[#ffc861]",
  bad: "text-[#ff7a7a]",
};

class Aborted extends Error {}

/** A scripted walk through the retry engine: idempotent retries, the outbox, backoff and the dead-letter queue. */
export default function PaymentDemo() {
  const [loseResponse, setLoseResponse] = useState(true);
  const [bankDown, setBankDown] = useState(false);
  const [active, setActive] = useState<NodeId | null>(null);
  const [running, setRunning] = useState(false);
  const [lines, setLines] = useState<Line[]>([]);
  const [count, setCount] = useState({ requests: 0, payments: 0, charges: 0, dead: 0 });
  const runId = useRef(0);
  const lineId = useRef(0);
  const logEl = useRef<HTMLOListElement>(null);
  const host = useRef<HTMLDivElement>(null);

  const run = useCallback(async (opts: { lose: boolean; down: boolean }) => {
    const id = ++runId.current;
    setRunning(true);
    let clock = 0;
    const key = `pay_${Math.random().toString(16).slice(2, 6)}`;
    const pid = `P-${Math.floor(1000 + Math.random() * 9000)}`;
    const bump = (k: keyof typeof count) => setCount((c) => ({ ...c, [k]: c[k] + 1 }));
    const step = async (node: NodeId, who: string, text: string, tone: Tone = "info", simSeconds = 0.08) => {
      if (runId.current !== id) throw new Aborted();
      clock += simSeconds;
      setActive(node);
      setLines((l) => [...l.slice(-40), { id: ++lineId.current, at: `+${clock.toFixed(2)}s`, who, text, tone }]);
      await new Promise((r) => setTimeout(r, 700));
    };

    try {
      bump("requests");
      await step("client", "client", `POST /payments  Idempotency-Key: ${key}  amount ₹2,499`);
      await step("api", "api", "Key not seen before. Insert the payment and an outbox row in one transaction.");
      bump("payments");
      await step("db", "postgres", `COMMIT  ${pid} = PENDING, outbox row queued`, "ok");
      if (opts.lose) {
        await step("client", "network", "The 202 response is lost on the way back. The client times out.", "bad", 3);
        bump("requests");
        await step("client", "client", `Retry POST /payments with the same key ${key}`, "warn");
        await step("api", "api", "Key already seen. Return the stored 202. No second payment is created.", "ok");
      } else {
        await step("client", "api", `202 Accepted  ${pid}`, "ok");
      }
      await step("worker", "worker", `SELECT … FOR UPDATE SKIP LOCKED  claimed ${pid}`);
      if (opts.down) {
        for (let attempt = 1; attempt <= 4; attempt++) {
          await step("bank", "bank", `Attempt ${attempt}: 503 Service Unavailable`, "bad");
          if (attempt < 4) await step("worker", "worker", `Back off ${2 ** (attempt - 1)}s, then retry`, "warn", 2 ** (attempt - 1));
        }
        await step("dlq", "worker", `Gave up after 4 attempts. ${pid} moved to the dead-letter queue.`, "bad");
        bump("dead");
      } else {
        await step("bank", "bank", `Charged ₹2,499  ${pid} = SETTLED`, "ok");
        bump("charges");
      }
    } catch (e) {
      if (!(e instanceof Aborted)) throw e;
      return;
    }
    if (runId.current === id) {
      setActive(null);
      setRunning(false);
    }
  }, []);

  // Play one normal-but-flaky payment the first time the demo scrolls into view, so it never sits empty.
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      if (!matchMedia("(prefers-reduced-motion: reduce)").matches) run({ lose: true, down: false });
    });
    io.observe(el);
    const runs = runId; // cancel any run still playing when the demo unmounts
    return () => {
      io.disconnect();
      runs.current++;
    };
  }, [run]);

  useEffect(() => {
    const el = logEl.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  const reset = () => {
    runId.current++;
    setRunning(false);
    setActive(null);
    setLines([]);
    setCount({ requests: 0, payments: 0, charges: 0, dead: 0 });
  };

  return (
    <div ref={host} className="grid min-w-0 gap-4 rounded-md border border-line bg-panel p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-mono text-[11px] tracking-[0.12em] text-muted uppercase">Live demo · simulated</p>
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
          <label htmlFor="opt-lose" className="flex cursor-pointer items-center gap-2">
            <input id="opt-lose" type="checkbox" className="size-4 accent-[var(--accent)]" checked={loseResponse} onChange={(e) => setLoseResponse(e.target.checked)} />
            Lose the response
          </label>
          <label htmlFor="opt-down" className="flex cursor-pointer items-center gap-2">
            <input id="opt-down" type="checkbox" className="size-4 accent-[var(--accent)]" checked={bankDown} onChange={(e) => setBankDown(e.target.checked)} />
            Bank is down
          </label>
        </div>
      </div>

      <ol className="grid grid-cols-3 gap-2 sm:grid-cols-6" aria-label="Services">
        {nodes.map((n) => {
          const on = active === n.id;
          const bad = n.id === "dlq" && count.dead > 0;
          return (
            <li
              key={n.id}
              className={`grid min-w-0 gap-0.5 rounded-[4px] border px-2.5 py-2 transition-[border-color,box-shadow,background-color] duration-300 ${
                on
                  ? "border-accent bg-accent/10 shadow-[0_0_18px_-4px_var(--accent)]"
                  : bad
                    ? "border-[#ff7a7a]/50"
                    : "border-line"
              }`}
            >
              <span className={`truncate text-[13px] font-semibold ${on ? "text-accent" : "text-fg"}`}>{n.label}</span>
              <span className="truncate font-mono text-[10px] text-muted">{n.sub}</span>
            </li>
          );
        })}
      </ol>

      <ol
        ref={logEl}
        aria-live="polite"
        aria-label="Event log"
        className="h-[230px] overflow-y-auto rounded-[4px] border border-line bg-bg p-3 font-mono text-[12px] leading-relaxed"
      >
        {lines.length === 0 && <li className="text-muted">Choose what goes wrong, then press Send payment.</li>}
        {lines.map((l) => (
          <li key={l.id} className="grid grid-cols-[52px_64px_minmax(0,1fr)] gap-2">
            <span className="text-muted tabular-nums">{l.at}</span>
            <span className="text-muted">{l.who}</span>
            <span className={toneClass[l.tone]}>{l.text}</span>
          </li>
        ))}
      </ol>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <dl className="flex flex-wrap gap-x-5 gap-y-1 font-mono text-xs">
          {(
            [
              ["Requests", count.requests],
              ["Payments", count.payments],
              ["Charges", count.charges],
              ["Dead letters", count.dead],
            ] as const
          ).map(([k, v]) => (
            <div key={k} className="flex gap-1.5">
              <dt className="text-muted">{k}</dt>
              <dd className="text-fg tabular-nums">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="flex gap-2">
          <button type="button" onClick={reset} className="rounded-[4px] border border-line px-3.5 py-2 text-sm font-semibold hover:border-fg">
            Reset
          </button>
          <button
            type="button"
            disabled={running}
            onClick={() => run({ lose: loseResponse, down: bankDown })}
            className="rounded-[4px] border border-accent bg-accent px-3.5 py-2 text-sm font-semibold text-bg transition-opacity disabled:cursor-wait disabled:opacity-50"
          >
            {running ? "Running…" : "Send payment"}
          </button>
        </div>
      </div>
    </div>
  );
}
