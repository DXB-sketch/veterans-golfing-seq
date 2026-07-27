import Section from "../components/Section.jsx";
import RibbonRule from "../components/RibbonRule.jsx";
import { values } from "../data/values.js";

function PageHero({ eyebrow, title, flourish }) {
  return (
    <section className="bg-navy px-5 py-16 text-center md:py-20">
      <div className="mx-auto max-w-site">
        <p className="font-display text-[0.8125rem] font-medium uppercase tracking-[0.14em] text-gold">
          {eyebrow}
        </p>
        <h1 className="text-page-title mt-3 font-display font-bold uppercase text-white">
          {title}
        </h1>
        {flourish && (
          <p className="mt-2 font-flourish text-3xl text-gold-bright">{flourish}</p>
        )}
        <div className="mt-5 flex justify-center">
          <RibbonRule dark />
        </div>
      </div>
    </section>
  );
}

export default function About() {
  return (
    <>
      <PageHero
        eyebrow="About SEQDVGC"
        title="Who we are"
        flourish="United by service. Connected by golf."
      />

      <Section eyebrow="Our story" title="A club built on mateship" tone="cream">
        <div className="max-w-[68ch] space-y-5">
          <p>
            The South East Queensland Defence Veterans Golf Club is an
            Australian Defence veteran community golf group supporting veterans
            and their families. We promote connection, and mental and physical
            wellbeing within the veteran community — through golf.
          </p>
          <p>
            We&apos;re a registered non-profit incorporated association. Every
            dollar we raise through sponsors, government grants and donations
            goes to supporting Australian veteran members and the events we run
            for them.
          </p>
          <p>
            Veteran golfers of all abilities are welcome — all veterans,
            serving and non-serving, and their family members. You don&apos;t
            need a low handicap. You just need to turn up.
          </p>
        </div>
      </Section>

      <Section eyebrow="The road ahead" title="Where we're headed" tone="paper">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="rounded-card bg-cream p-8">
            <p className="font-display text-4xl font-bold text-gold">2026</p>
            <h3 className="mt-2 font-display text-xl font-semibold uppercase text-navy">
              Getting started
            </h3>
            <RibbonRule className="mt-3" />
            <p className="mt-4 text-ink-muted">
              Running golf events in Brisbane, the Sunshine Coast and the Gold
              Coast. Testing the waters, meeting the players, and building the
              community from the first tee.
            </p>
          </div>
          <div className="rounded-card bg-navy p-8 text-white">
            <p className="font-display text-4xl font-bold text-gold-bright">2027</p>
            <h3 className="mt-2 font-display text-xl font-semibold uppercase">
              The vision
            </h3>
            <RibbonRule className="mt-3" dark />
            <p className="mt-4 text-cream/85">
              Open membership options — members compete through a series of
              rounds across all three regions and secure their spot at an
              end-of-year championship. A strong, connected Defence veteran
              golf community.
            </p>
          </div>
        </div>
      </Section>

      <Section eyebrow="What we stand for" title="Our values" tone="navy" center>
        <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {values.map((v) => (
            <li key={v.label} className="flex flex-col items-center text-center">
              <h3 className="font-display text-lg font-semibold uppercase text-gold-bright">
                {v.label}
              </h3>
              <p className="mt-1 text-sm text-cream/80">{v.line}</p>
            </li>
          ))}
        </ul>
        <div className="mt-12 border-t border-gold/15 pt-8">
          <p className="font-display text-base font-medium uppercase tracking-[0.2em] text-cream">
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
