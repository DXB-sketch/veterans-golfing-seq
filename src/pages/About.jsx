import Section from "../components/Section.jsx";
import RibbonRule from "../components/RibbonRule.jsx";
import { values } from "../data/values.js";

// Roadmap entries. Grounded in the club's 2026/2027 plan; dates beyond the
// Gold Coast Open Day are indicative and marked TBC where unconfirmed.
const roadmap = [
  {
    when: "Early 2026",
    title: "The club gets started",
    detail:
      "SEQDVGC forms as a registered non-profit incorporated association and begins organising its first golf days across Brisbane, the Sunshine Coast and the Gold Coast.",
  },
  {
    when: "31 July 2026",
    title: "Gold Coast Open Day",
    detail:
      "Our first official open day at Palmer Gold Coast Golf Course, Robina. 18 holes, an optional side comp, and every veteran and family member welcome.",
  },
  {
    when: "Late 2026",
    title: "Second club event",
    detail:
      "A second event to close out the year, with details to be confirmed. Follow us on Facebook for the announcement.",
  },
  {
    when: "Early 2027",
    title: "Membership opens",
    detail:
      "Club membership launches at $50 a year. Members compete through the season and secure their place at the end-of-year championship.",
  },
  {
    when: "Through 2027",
    title: "The regional series",
    detail:
      "A series of rounds through the year in each of the three regions, building a strong, connected Defence veteran golf community.",
  },
  {
    when: "End of 2027",
    title: "The championship",
    detail:
      "A multi-day end-of-year championship bringing the whole club together, with spots earned through the regional series.",
  },
];

export default function About() {
  return (
    <>
      {/* Light hero: About is the one page that opens on cream, with the
          crest given room to breathe. */}
      <section className="border-b border-ink/10 bg-cream px-5 py-16 md:py-20">
        <div className="mx-auto flex max-w-site flex-col items-start gap-10 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <p className="font-body text-[0.8125rem] font-bold uppercase tracking-[0.16em] text-gold">
              About SEQDVGC
            </p>
            <h1 className="text-page-title mt-3 font-display font-bold uppercase text-navy">
              Who we are
            </h1>
            <RibbonRule className="mt-5" />
            <p className="mt-6 max-w-xl text-lg text-ink-muted">
              United by service. Connected by golf.
            </p>
          </div>
          <img
            src="/SEQDVGC-logo-transparent.png"
            alt="SEQDVGC crest"
            className="h-40 w-40 shrink-0 md:h-52 md:w-52"
          />
        </div>
      </section>

      <Section eyebrow="Our story" title="A club built on mateship" tone="paper">
        <div className="max-w-[68ch] space-y-5">
          <p>
            The South East Queensland Defence Veterans Golf Club is an
            Australian Defence veteran community golf group supporting veterans
            and their families. We promote connection, and mental and physical
            wellbeing within the veteran community, through golf.
          </p>
          <p>
            We&apos;re a registered non-profit incorporated association. Every
            dollar we raise through sponsors, government grants and donations
            goes to supporting Australian veteran members and the events we run
            for them.
          </p>
          <p>
            Veteran golfers of all abilities are welcome. All veterans, serving
            and non-serving, and their family members. You don&apos;t need a
            low handicap. You just need to turn up.
          </p>
        </div>
      </Section>

      {/* Roadmap timeline */}
      <Section eyebrow="The road ahead" title="Where we're headed" tone="cream">
        <ol className="relative ml-2 border-l-2 border-gold/50 md:ml-4">
          {roadmap.map((item) => (
            <li key={item.title} className="relative pb-12 pl-8 last:pb-0 md:pl-12">
              <span
                className="absolute -left-[7px] top-1.5 h-3 w-3 rotate-45 bg-gold"
                aria-hidden="true"
              />
              <p className="font-body text-[0.8125rem] font-bold uppercase tracking-[0.16em] text-gold">
                {item.when}
              </p>
              <h3 className="mt-1 font-display text-xl font-semibold tracking-wide text-navy">
                {item.title}
              </h3>
              <p className="mt-2 max-w-[60ch] text-ink-muted">{item.detail}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section eyebrow="What we stand for" title="Our values" tone="navy" center>
        <ul className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-5">
          {values.map((v) => (
            <li key={v.label} className="text-center">
              <h3 className="font-display text-lg font-semibold tracking-wide text-gold-bright">
                {v.label}
              </h3>
              <p className="mt-2 text-sm text-cream/80">{v.line}</p>
            </li>
          ))}
        </ul>
        <div className="mt-12 border-t border-gold/15 pt-8">
          <p className="font-body text-base font-bold uppercase tracking-[0.2em] text-cream">
            Army · Navy · Air Force
          </p>
          <p className="mt-2 text-sm text-cream/70">
            Three services. One club. Equal standing, always.
          </p>
        </div>
      </Section>
    </>
  );
}
