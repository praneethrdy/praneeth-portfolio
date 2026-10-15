/** Small "opens elsewhere" arrow, drawn so it never falls back to an emoji glyph. */
export default function ArrowIcon({ direction = "out" }: { direction?: "out" | "up" }) {
  return (
    <svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" className="shrink-0">
      {direction === "out" ? <path d="M3 9l6-6M4 3h5v5" /> : <path d="M6 10V2M2.5 5.5L6 2l3.5 3.5" />}
    </svg>
  );
}
