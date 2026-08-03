import Button from "../components/Button.jsx";
import Section from "../components/Section.jsx";
import RibbonRule from "../components/RibbonRule.jsx";
import EventCard from "../components/EventCard.jsx";
import TeaserCard from "../components/TeaserCard.jsx";
import { useEvents } from "../hooks/useEvents.js";
import { heroPhoto } from "../lib/photos.js";
import { values } from "../data/values.js";

const teaserIcon = (path) => (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {path}
  </svg>
);

export default function Home() {
  const { events } = useEvents();
  // Events come back sorted soonest-first, so the first non-finalised one is next.
  const nextEvent = events.find((e) => e.timeStatus !== "finalised");

  return (
    <>
      {/* HERO. Full-bleed duotone course photo with a light navy scrim, and a
          low-opacity blurred panel behind the text so it stays readable
          without hiding the image. */}
      <section className="relative isolate flex min-h-[70vh] items-center overflow-hidden bg-navy px-5 py-20 md:py-24">
        {heroPhoto && (
          <img
            src={heroPhoto.src}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 -z-20 h-full w-full object-cover [filter:grayscale(0.22)_saturate(0.88)]"
          />
        )}
        <div
          className="absolute inset-0 -z-10 bg-gradient-to-r from-navy/70 via-navy/40 to-navy/20"
          aria-hidden="true"
        />
        <div className="mx-auto w-full max-w-site">
          <div className="max-w-3xl border-b-2 border-gold bg-navy-deep/45 p-8 backdrop-blur-sm md:p-10">
            <p className="font-body text-[0.8125rem] font-bold uppercase tracking-[0.16em] text-gold-bright">
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

      {/* NEXT EVENT. One generous card. */}
      {nextEvent && (
        <Section eyebrow="What's on" title="Next event" tone="cream">
          <div className="mx-auto max-w-4xl">
            <EventCard event={nextEvent} />
          </div>
        </Section>
      )}

      {/* VALUES. One quiet row. */}
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
        <p className="mt-12 font-body text-sm font-bold uppercase tracking-[0.2em] text-cream/70">
          Army · Navy · Air Force
        </p>
      </Section>

      {/* TEASERS */}
      <Section eyebrow="Find your way around" title="More about the club" tone="cream">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <TeaserCard
            icon={teaserIcon(
              <>
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21c0-4 3.6-6 8-6s8 2 8 6" />
              </>
            )}
            title="Who we are"
            blurb="An Australian Defence veteran golf community. Our story, our mission and where we're headed."
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
            blurb="Golf days across Brisbane, the Sunshine Coast and the Gold Coast. Find the next one near you."
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
            blurb="Trusted support services for veterans and families, from Open Arms to DVA and RSL Queensland."
            to="/resources"
            linkLabel="Find support"
          />
        </div>
      </Section>
    </>
  );
}
