import { Link, useParams } from "react-router-dom";
import Section from "../components/Section.jsx";
import RibbonRule from "../components/RibbonRule.jsx";
import Button from "../components/Button.jsx";
import Photo from "../components/Photo.jsx";
import { EventMeta } from "../components/EventCard.jsx";
import { useEvent } from "../hooks/useEvents.js";
import { albumForEvent } from "../lib/photos.js";
import { FACEBOOK_URL, CLUB_EMAIL } from "../lib/site.js";

function Detail({ label, value }) {
  return (
    <div className="flex justify-between gap-6 border-b border-ink/10 py-3">
      <dt className="font-body text-sm font-bold uppercase tracking-[0.08em] text-ink-muted">
        {label}
      </dt>
      <dd className="text-right font-semibold text-ink">{value}</dd>
    </div>
  );
}

export default function EventDetail() {
  const { id } = useParams();
  const { event, loading } = useEvent(id);

  if (loading) {
    return (
      <Section eyebrow="Events" title="Loading…" tone="cream" center>
        <p className="text-ink-muted">Just a moment.</p>
      </Section>
    );
  }

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

  const finalised = event.timeStatus === "finalised";
  const album = finalised ? albumForEvent(event) : null;
  // Two or three photos make a recap; the full set lives in the Gallery.
  const recapPhotos =
    album?.photos.filter((p) => p.role !== "accent").slice(0, 3) ?? [];

  return (
    <>
      <section className="border-b-4 border-gold bg-navy px-5 py-12 md:py-16">
        <div className="mx-auto max-w-site">
          <Link
            to="/events"
            className="text-sm font-semibold text-cream/70 transition-colors hover:text-gold-bright"
          >
            &larr; All events
          </Link>
          <div className="mt-4">
            <EventMeta event={event} dark />
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
        <div className="grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <p className="max-w-[68ch] text-lg">{event.description}</p>

            <dl className="mt-8 max-w-xl">
              <Detail
                label="Venue"
                value={event.address ? `${event.venue}, ${event.address}` : event.venue}
              />
              <Detail label="Meet time" value={event.meetTime} />
              <Detail label="First tee" value={event.firstTee} />
              <Detail label="Holes" value={`${event.holes} holes`} />
              <Detail label="Green fees" value={event.greenFee} />
              <Detail label="Side comp" value={event.sideComp} />
            </dl>

            {event.sponsor && (
              <p className="mt-8 text-sm text-ink-muted">
                Proudly sponsored by{" "}
                <span className="font-semibold text-ink">{event.sponsor}</span>
              </p>
            )}
          </div>

          <aside className="h-fit border-t-4 border-gold bg-navy p-8 text-white">
            {finalised ? (
              <>
                <h2 className="font-display text-xl font-semibold tracking-wide">
                  This one&apos;s been played
                </h2>
                <RibbonRule className="mt-3" dark />
                <p className="mt-4 text-sm text-cream/85">
                  Follow the club on Facebook to see photos from the day and
                  hear about the next one first.
                </p>
                <div className="mt-6 flex flex-col gap-3">
                  <Button
                    href={FACEBOOK_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Follow on Facebook
                  </Button>
                  <Button to="/events" variant="secondary">
                    See upcoming events
                  </Button>
                </div>
              </>
            ) : (
              <>
                <h2 className="font-display text-xl font-semibold tracking-wide">
                  Secure your spot
                </h2>
                <RibbonRule className="mt-3" dark />
                <p className="mt-4 text-sm text-cream/85">
                  Message us on Facebook or email the club and we&apos;ll lock
                  you in. All veterans, serving and ex-serving, and family
                  members are welcome.
                </p>
                <div className="mt-6 flex flex-col gap-3">
                  <Button href={`mailto:${CLUB_EMAIL}`}>Email the club</Button>
                  <Button
                    href={FACEBOOK_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="secondary"
                  >
                    Message on Facebook
                  </Button>
                </div>
              </>
            )}
          </aside>
        </div>
      </Section>

      {/* Recap: only for played events that have a photo album. */}
      {album && (
        <Section eyebrow="How the day went" title="From the course" tone="paper">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recapPhotos.map((p) => (
              <Photo
                key={p.file}
                photo={p}
                ratio={p.orientation === "portrait" ? "aspect-[4/5]" : "aspect-[3/2]"}
                position="object-top"
                caption
              />
            ))}
          </div>
          <p className="mt-8">
            <a
              href={album.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-body text-sm font-bold uppercase tracking-[0.08em] text-navy underline decoration-gold decoration-2 underline-offset-4 transition-colors hover:text-crimson"
            >
              See the full album on Facebook
            </a>
          </p>
        </Section>
      )}
    </>
  );
}
