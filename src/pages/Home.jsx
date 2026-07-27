import Button from "../components/Button.jsx";
import Section from "../components/Section.jsx";
import RibbonRule from "../components/RibbonRule.jsx";
import EventCard from "../components/EventCard.jsx";
import TeaserCard from "../components/TeaserCard.jsx";
import { events } from "../data/events.js";
import { values } from "../data/values.js";

const teaserIcon = (path) => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {path}
  </svg>
);

export default function Home() {
  const nextEvent = events.find((e) => e.status === "Upcoming");

  return (
    <>
      {/* HERO — photo slot is data-driven: swap the gradient for a real dawn
          fairway photo from the 31 July event when it arrives. */}
      <section className="relative isolate flex min-h-[78vh] items-center overflow-hidden bg-navy px-5 py-24">
        <div
          className="absolute inset-0 -z-10"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(120% 90% at 75% 15%, rgba(228,193,88,0.28) 0%, rgba(200,160,46,0.10) 34%, rgba(11,30,63,0) 62%), linear-gradient(180deg, #0B1E3F 0%, #0B1E3F 45%, #07152B 100%)",
          }}
        />
        {/* placeholder fairway horizon line */}
        <div
          className="absolute inset-x-0 bottom-0 -z-10 h-40 opacity-40"
          aria-hidden="true"
          style={{
            background:
              "linear-gradient(180deg, rgba(7,21,43,0) 0%, rgba(7,21,43,0.9) 100%)",
          }}
        />
        <div className="mx-auto w-full max-w-site">
          <div className="max-w-3xl">
            <p className="font-display text-[0.8125rem] font-medium uppercase tracking-[0.14em] text-gold">
              For veterans · By veterans
            </p>
            <RibbonRule className="mt-3" dark />
            <h1 className="text-hero mt-6 font-display font-bold uppercase text-white">
              Connecting Defence veterans &amp; their families through golf
            </h1>
            <p className="mt-6 max-w-xl text-lg text-cream/90">
              A veteran community golf club running events across Brisbane, the
              Sunshine Coast and the Gold Coast. All services, all abilities,
              all welcome.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button to="/membership">Join the club</Button>
              <Button to="/events" variant="secondary">
                See what&apos;s on
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* NEXT EVENT — one generous card */}
      {nextEvent && (
        <Section eyebrow="What's on" title="Next event" tone="cream">
          <div className="mx-auto max-w-4xl">
            <EventCard event={nextEvent} featured />
          </div>
        </Section>
      )}

      {/* VALUES — one quiet row */}
      <Section eyebrow="What we stand for" title="Our values" tone="navy" center>
        <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {values.map((v) => (
            <li key={v.label} className="flex flex-col items-center text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full border border-gold/40 text-gold" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2l2.9 6.26L21 9.27l-4.5 4.38L17.8 20 12 16.77 6.2 20l1.3-6.35L3 9.27l6.1-1.01L12 2z" />
                </svg>
              </span>
              <h3 className="mt-3 font-display text-lg font-semibold uppercase text-gold-bright">
                {v.label}
              </h3>
              <p className="mt-1 text-sm text-cream/80">{v.line}</p>
            </li>
          ))}
        </ul>
        <p className="mt-10 font-display text-sm font-medium uppercase tracking-[0.14em] text-cream/70">
          Army · Navy · Air Force
        </p>
      </Section>

      {/* TEASERS */}
      <Section eyebrow="Find your way around" title="More about the club" tone="cream">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <TeaserCard
            icon={teaserIcon(
              <>
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21c0-4 3.6-6 8-6s8 2 8 6" />
              </>
            )}
            title="Who we are"
            blurb="An Australian Defence veteran golf community — our story, our mission and where we're headed."
            to="/about"
            linkLabel="About the club"
          />
          <TeaserCard
            icon={teaserIcon(
              <>
                <rect x="3" y="5" width="18" height="16" rx="2" />
                <path d="M3 10h18M8 3v4M16 3v4" />
              </>
            )}
            title="Events"
            blurb="Golf days across Brisbane, the Sunshine Coast and the Gold Coast — find the next one near you."
            to="/events"
            linkLabel="See what's on"
          />
          <TeaserCard
            icon={teaserIcon(
              <>
                <path d="M12 21s-7-4.5-9-9a5.3 5.3 0 0 1 9-4 5.3 5.3 0 0 1 9 4c-2 4.5-9 9-9 9z" />
              </>
            )}
            title="Membership"
            blurb="$50 a year, a club hat or t-shirt, and a place in a community that gets it."
            to="/membership"
            linkLabel="Join the club"
          />
          <TeaserCard
            icon={teaserIcon(
              <>
                <circle cx="12" cy="12" r="9" />
                <path d="M12 8v4l2.5 2.5" />
              </>
            )}
            title="Veteran resources"
            blurb="Trusted support services for veterans and families — Open Arms, DVA, RSL Queensland and more."
            to="/resources"
            linkLabel="Find support"
          />
        </div>
      </Section>
    </>
  );
}
