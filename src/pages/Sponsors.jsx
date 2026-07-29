import RibbonRule from "../components/RibbonRule.jsx";
import Button from "../components/Button.jsx";
import { tiers, confirmedSponsors } from "../data/sponsors.js";

export default function Sponsors() {
  return (
    <>
      <section className="bg-navy px-5 py-14 md:py-20">
        <div className="mx-auto max-w-site">
          <p className="font-body text-[0.8125rem] font-bold uppercase tracking-[0.16em] text-gold">
            Support the mission
          </p>
          <h1 className="text-page-title mt-3 font-display font-bold uppercase text-white">
            Sponsors &amp; partners
          </h1>
          <RibbonRule className="mt-5" dark />
          <p className="mt-6 max-w-2xl text-lg text-cream/90">
            The Club is seeking sponsors, government grants and donations to
            support Australian Defence veterans and their families. Every
            dollar goes to our veteran members and the events we run for them
            — sponsorship puts your name behind that.
          </p>
        </div>
      </section>

      <section className="bg-cream px-5 py-16 md:py-24">
        <div className="mx-auto max-w-site">
          <h2 className="font-display text-2xl font-semibold tracking-wide text-navy">
            Sponsorship packages
          </h2>
          <RibbonRule className="mt-3" />
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {tiers.map((tier) => (
              <article
                key={tier.name}
                className="flex flex-col border-t-4 border-gold bg-paper p-8 shadow-soft"
              >
                <h3 className="font-display text-xl font-semibold uppercase tracking-wide text-navy">
                  {tier.name}
                </h3>
                <p className="mt-3 font-display text-3xl font-bold text-navy">
                  {tier.price != null ? tier.price : "Price TBC"}
                </p>
                {tier.benefits.length > 0 && (
                  <ul className="mt-5 space-y-2 text-sm text-ink-muted">
                    {tier.benefits.map((b) => (
                      <li key={b} className="flex gap-2">
                        <span className="text-gold" aria-hidden="true">
                          ·
                        </span>
                        {b}
                      </li>
                    ))}
                  </ul>
                )}
                <p className="mt-4 flex-1 text-sm text-ink-muted">
                  Full package details available on request — get in touch and
                  we&apos;ll walk you through it.
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {confirmedSponsors.length > 0 && (
        <section className="bg-paper px-5 py-16 md:py-24">
          <div className="mx-auto max-w-site">
            <h2 className="font-display text-2xl font-semibold tracking-wide text-navy">
              Our sponsors
            </h2>
            <RibbonRule className="mt-3" />
            <ul className="mt-10 grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-4">
              {confirmedSponsors.map((s) => (
                <li key={s.name}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-3 p-4 text-center"
                  >
                    <img
                      src={s.logo}
                      alt={`${s.name} logo`}
                      className="h-20 w-auto max-w-full object-contain"
                    />
                    <span className="text-sm font-semibold text-ink">
                      {s.name}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section className="bg-navy-deep px-5 py-16 text-center md:py-20">
        <div className="mx-auto max-w-2xl">
          <h2 className="font-display text-2xl font-semibold uppercase tracking-wide text-white">
            Become a sponsor
          </h2>
          <RibbonRule className="mt-4" dark />
          <p className="mt-5 text-cream/90">
            Whether you&apos;re a local business or a national brand, we&apos;d
            love to talk about how you can stand with the veteran community.
          </p>
          <Button href="mailto:seqdvgc@gmail.com" className="mt-8">
            Email us about sponsorship
          </Button>
        </div>
      </section>
    </>
  );
}
