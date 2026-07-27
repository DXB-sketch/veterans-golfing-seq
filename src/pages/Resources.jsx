import RibbonRule from "../components/RibbonRule.jsx";
import { resources } from "../data/resources.js";

export default function Resources() {
  return (
    <>
      {/* Resources identity: quiet paper page, editorial numbered list. */}
      <section className="border-b border-ink/10 bg-paper px-5 py-14 md:py-20">
        <div className="mx-auto max-w-3xl">
          <p className="font-body text-[0.8125rem] font-bold uppercase tracking-[0.16em] text-gold">
            Support for veterans &amp; families
          </p>
          <h1 className="text-page-title mt-3 font-display font-bold uppercase text-navy">
            Veteran resources
          </h1>
          <RibbonRule className="mt-5" />
          <p className="mt-6 max-w-[60ch] text-lg text-ink-muted">
            Trusted organisations that support the veteran community. If you or
            someone you know needs a hand, these are good places to start.
          </p>
        </div>
      </section>

      <section className="bg-paper px-5 pb-20 md:pb-28">
        <ul className="mx-auto max-w-3xl divide-y divide-ink/10">
          {resources.map((r, i) => (
            <li key={r.name}>
              <a
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-baseline gap-6 py-7"
              >
                <span className="font-display text-lg font-semibold text-gold" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="flex-1">
                  <h2 className="font-display text-lg font-semibold tracking-wide text-navy underline decoration-transparent decoration-2 underline-offset-4 transition-colors group-hover:decoration-gold">
                    {r.name}
                  </h2>
                  <p className="mt-1.5 text-[0.95rem] text-ink-muted">{r.description}</p>
                </div>
                <span
                  className="shrink-0 self-center text-gold transition-transform duration-200 group-hover:translate-x-1"
                  aria-hidden="true"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 6l6 6-6 6" />
                  </svg>
                </span>
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
