import Section from "../components/Section.jsx";
import RibbonRule from "../components/RibbonRule.jsx";
import { resources } from "../data/resources.js";

export default function Resources() {
  return (
    <>
      <section className="bg-navy px-5 py-16 text-center md:py-20">
        <div className="mx-auto max-w-site">
          <p className="font-display text-[0.8125rem] font-medium uppercase tracking-[0.14em] text-gold">
            Support for veterans &amp; families
          </p>
          <h1 className="text-page-title mt-3 font-display font-bold uppercase text-white">
            Veteran resources
          </h1>
          <div className="mt-5 flex justify-center">
            <RibbonRule dark />
          </div>
          <p className="mx-auto mt-5 max-w-xl text-cream/85">
            Trusted organisations that support the veteran community. If you or
            someone you know needs a hand, these are good places to start.
          </p>
        </div>
      </section>

      <Section tone="cream">
        <ul className="mx-auto flex max-w-3xl flex-col gap-4">
          {resources.map((r) => (
            <li key={r.name}>
              <a
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-5 rounded-card bg-paper p-6 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lift"
              >
                <div className="flex-1">
                  <h2 className="font-display text-lg font-semibold uppercase text-navy group-hover:text-crimson">
                    {r.name}
                  </h2>
                  <p className="mt-1 text-sm text-ink-muted">{r.description}</p>
                </div>
                <span
                  className="shrink-0 text-gold transition-transform duration-200 group-hover:translate-x-1"
                  aria-hidden="true"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 6l6 6-6 6" />
                  </svg>
                </span>
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
