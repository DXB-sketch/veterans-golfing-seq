import { Link, useParams } from "react-router-dom";
import Section from "../components/Section.jsx";
import RibbonRule from "../components/RibbonRule.jsx";
import Button from "../components/Button.jsx";
import { events } from "../data/events.js";

function Detail({ label, value }) {
  return (
    <div className="rounded-card bg-paper p-5 shadow-soft">
      <p className="font-display text-xs font-medium uppercase tracking-[0.14em] text-gold">
        {label}
      </p>
      <p className="mt-1 font-semibold text-ink">{value}</p>
    </div>
  );
}

export default function EventDetail() {
  const { id } = useParams();
  const event = events.find((e) => e.id === id);

  if (!event) {
    return (
      <Section eyebrow="Events" title="Event not found" tone="cream" center>
        <p className="text-ink-muted">
          That event doesn&apos;t exist or has been removed.
        </p>
        <div className="mt-6 flex justify-center">
          <Button to="/events" variant="secondary-light">
            Back to events
          </Button>
        </div>
      </Section>
    );
  }

  return (
    <>
      <section className="bg-navy px-5 py-16 md:py-20">
        <div className="mx-auto max-w-site">
          <Link
            to="/events"
            className="text-sm font-semibold text-cream/70 transition-colors hover:text-gold-bright"
          >
            ← All events
          </Link>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-navy-deep px-3 py-1 text-xs font-semibold text-cream">
              {event.region}
            </span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold text-white ${
                event.status === "Past" ? "bg-ink-muted" : "bg-crimson"
              }`}
            >
              {event.status}
            </span>
          </div>
          <h1 className="text-page-title mt-4 font-display font-bold uppercase text-white">
            {event.title}
          </h1>
          <p className="mt-2 text-lg font-semibold text-gold-bright">
            {event.dateDisplay}
          </p>
          <RibbonRule className="mt-5" dark />
        </div>
      </section>

      <Section tone="cream">
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <p className="max-w-[68ch] text-lg">{event.description}</p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <Detail
                label="Venue"
                value={
                  event.address ? `${event.venue} — ${event.address}` : event.venue
                }
              />
              <Detail label="Meet time" value={event.meetTime} />
              <Detail label="First tee" value={event.firstTee} />
              <Detail label="Holes" value={`${event.holes} holes`} />
              <Detail label="Green fees" value={event.greenFee} />
              <Detail label="Side comp" value={event.sideComp} />
            </div>

            {event.sponsor && (
              <p className="mt-8 text-sm text-ink-muted">
                Proudly sponsored by{" "}
                <span className="font-semibold text-ink">{event.sponsor}</span>
              </p>
            )}
          </div>

          <aside className="h-fit rounded-card bg-navy p-8 text-white">
            <h2 className="font-display text-xl font-semibold uppercase">
              Secure your spot
            </h2>
            <RibbonRule className="mt-3" dark />
            <p className="mt-4 text-sm text-cream/85">
              Message us on Facebook or email the club and we&apos;ll lock you
              in. All veterans — serving and ex-serving — and family members
              are welcome.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <Button href="mailto:seqdvgc@gmail.com">Email the club</Button>
              <Button
                href="https://www.facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                variant="secondary"
              >
                Message on Facebook
              </Button>
            </div>
          </aside>
        </div>
      </Section>
    </>
  );
}
