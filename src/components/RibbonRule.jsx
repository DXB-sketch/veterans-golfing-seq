// The site's signature divider — campaign-medal ribbon rule (DESIGN.md §6).
// Reuse everywhere; don't reinvent. `dark` swaps navy for gold-bright so it
// stays visible on navy sections.
export default function RibbonRule({ className = "", dark = false }) {
  return (
    <span
      className={`inline-flex h-1 w-16 overflow-hidden rounded-sm ${className}`}
      aria-hidden="true"
    >
      <span className="flex-1 bg-gold" />
      <span className="flex-1 bg-crimson" />
      <span className={`flex-1 ${dark ? "bg-gold-bright" : "bg-navy"}`} />
    </span>
  );
}

// Thin full-width section divider: hairline with a centred ribbon segment.
export function RibbonDivider() {
  return (
    <div className="relative mx-auto max-w-site px-5" aria-hidden="true">
      <div className="h-px bg-ink/10" />
      <span className="absolute left-1/2 top-1/2 flex h-1 w-16 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-sm">
        <span className="flex-1 bg-gold" />
        <span className="flex-1 bg-crimson" />
        <span className="flex-1 bg-navy" />
      </span>
    </div>
  );
}
