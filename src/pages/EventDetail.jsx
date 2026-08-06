import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import Section from "../components/Section.jsx";
import RibbonRule from "../components/RibbonRule.jsx";
import Button from "../components/Button.jsx";
import FormField from "../components/FormField.jsx";
import Photo from "../components/Photo.jsx";
import { EventMeta } from "../components/EventCard.jsx";
import { useEvent } from "../hooks/useEvents.js";
import { useSlotAvailability } from "../hooks/useBookings.js";
import { createBooking } from "../lib/bookings.js";
import { albumForEvent } from "../lib/photos.js";
import { FACEBOOK_URL, CLUB_EMAIL } from "../lib/site.js";
import SquarePayment from "../components/SquarePayment.jsx";
import { useAuth } from "../admin/AuthProvider.jsx";

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

// Public booking form: fee summary, tee slot picker, the six fixed fields.
function BookingSection({ event }) {
  const { slots, loading, error, refresh } = useSlotAvailability(event.id);
  const { session } = useAuth();
  const [slotId, setSlotId] = useState(null);
  const [sending, setSending] = useState(false);
  const [formError, setFormError] = useState(null);
  const [booked, setBooked] = useState(null);
  // Details captured and awaiting payment (paid events only).
  const [pending, setPending] = useState(null);

  const selectedSlot = slots.find((s) => s.id === slotId);

  // Booking an event is pay-to-book (club decision): green fee plus whatever
  // the player ticks, charged before the slot is confirmed. The server
  // re-prices from the event row — this total is display only.
  function totalCentsFor(details) {
    return (
      event.greenFeeCents +
      (details.cartHire ? event.cartFeeCents : 0) +
      (details.playingInComp ? event.sideCompCents : 0)
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!slotId) {
      setFormError("Please pick a tee slot above before booking.");
      return;
    }
    const f = new FormData(e.target);
    const details = {
      eventId: event.id,
      teeSlotId: slotId,
      playerName: f.get("player_name"),
      mobile: f.get("mobile") || null,
      gaHandicap: f.get("ga_handicap") === "Yes",
      golfLinksNumber: f.get("golf_links") || null,
      playingInComp: f.get("side_comp") === "Yes",
      cartHire: f.get("cart_hire") === "Yes",
    };
    setFormError(null);

    // Events with no fees keep the direct (free) booking path.
    if (totalCentsFor(details) <= 0) {
      setSending(true);
      try {
        await createBooking(details);
        setBooked({ playerName: details.playerName, teeTime: selectedSlot?.teeTime });
      } catch (err) {
        if (err.code === "slot_full") {
          setFormError("That slot just filled up — please pick another time.");
          setSlotId(null);
          refresh();
        } else {
          setFormError(
            `Sorry, your booking didn't go through. Please check your internet connection and try again, or email us at ${CLUB_EMAIL}.`
          );
        }
      } finally {
        setSending(false);
      }
      return;
    }

    setPending(details);
  }

  function handlePaymentError(data) {
    if (data?.code === "slot_full") {
      setPending(null);
      setSlotId(null);
      setFormError("That tee time filled up before payment went through — you haven't been charged. Please pick another slot.");
      refresh();
    }
  }

  return (
    <div id="book">
      <Section eyebrow="Bookings" title="Book your tee slot" tone="paper">
        {booked ? (
          <div className="mx-auto max-w-xl border-t-4 border-gold bg-cream p-10 text-center">
            <p className="font-display text-2xl font-semibold tracking-wide text-navy">
              You&apos;re booked in, {booked.playerName}
            </p>
            <RibbonRule className="mt-3" />
            <p className="mt-4 text-ink-muted">
              We&apos;ve got you down for the{" "}
              <span className="font-semibold text-ink">{booked.teeTime}</span>{" "}
              slot{booked.paid ? " and your payment has been received" : ""}.
              See you on the course.
            </p>
          </div>
        ) : pending ? (
          <div className="mx-auto max-w-xl border-t-4 border-gold bg-cream p-8 md:p-10">
            <p className="font-display text-xl font-semibold tracking-wide text-navy">
              Confirm and pay
            </p>
            <RibbonRule className="mt-3" />
            <dl className="mt-6 text-sm">
              <Detail label="Player" value={pending.playerName} />
              <Detail label="Tee time" value={selectedSlot?.teeTime || ""} />
              <Detail label="Green fee" value={event.greenFee} />
              {pending.cartHire && <Detail label="Cart hire" value={event.cartFee} />}
              {pending.playingInComp && <Detail label="Side comp" value={event.sideComp} />}
              <Detail
                label="Total"
                value={`$${(totalCentsFor(pending) / 100).toFixed(2)} AUD`}
              />
            </dl>
            <p className="mt-3 text-sm text-ink-muted">
              Your tee slot is confirmed once payment goes through.{" "}
              <button
                type="button"
                onClick={() => setPending(null)}
                className="underline decoration-gold decoration-2 underline-offset-2 hover:text-navy"
              >
                Change your details
              </button>
            </p>
            {formError && (
              <p className="mt-4 border-l-4 border-crimson bg-crimson/5 p-4 text-sm text-ink">
                {formError}
              </p>
            )}
            <div className="mt-6">
              <SquarePayment
                purpose="event_booking"
                amountCents={totalCentsFor(pending)}
                payerName={pending.playerName}
                booking={pending}
                accessToken={session?.access_token}
                onSuccess={() => {
                  setBooked({
                    playerName: pending.playerName,
                    teeTime: selectedSlot?.teeTime,
                    paid: true,
                  });
                  setPending(null);
                }}
                onError={handlePaymentError}
              />
            </div>
          </div>
        ) : (
          <div className="max-w-3xl">
            {/* Fee summary so nobody's surprised on the day. */}
            <div className="flex flex-wrap gap-x-10 gap-y-2 border-b border-ink/10 pb-6 text-sm">
              <p>
                <span className="font-bold uppercase tracking-[0.08em] text-ink-muted">
                  Green fee
                </span>{" "}
                <span className="font-semibold text-ink">{event.greenFee}</span>
              </p>
              {event.cartFee !== "None" && (
                <p>
                  <span className="font-bold uppercase tracking-[0.08em] text-ink-muted">
                    Cart hire
                  </span>{" "}
                  <span className="font-semibold text-ink">{event.cartFee}</span>
                </p>
              )}
              <p>
                <span className="font-bold uppercase tracking-[0.08em] text-ink-muted">
                  Side comp
                </span>{" "}
                <span className="font-semibold text-ink">{event.sideComp}</span>
                {event.sideCompNote && (
                  <span className="text-ink-muted"> — {event.sideCompNote}</span>
                )}
              </p>
            </div>

            {/* Tee slot picker. Radio-group semantics on plain buttons. */}
            <div className="mt-8">
              <p className="text-sm font-semibold text-ink">
                Pick a tee slot
                <span className="ml-1 text-crimson" aria-hidden="true">*</span>
              </p>
              {loading ? (
                <p className="mt-3 text-sm text-ink-muted">Loading tee slots…</p>
              ) : error ? (
                <p className="mt-3 text-sm text-ink-muted">
                  We couldn&apos;t load the tee slots. Please try again in a
                  moment, or email us at {CLUB_EMAIL}.
                </p>
              ) : slots.length === 0 ? (
                <p className="mt-3 text-sm text-ink-muted">
                  Tee slots haven&apos;t been posted yet — email us at{" "}
                  {CLUB_EMAIL} and we&apos;ll lock you in.
                </p>
              ) : (
                <div
                  role="radiogroup"
                  aria-label="Tee slots"
                  className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
                >
                  {slots.map((s) => {
                    const full = s.spotsLeft === 0;
                    const active = s.id === slotId;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        disabled={full}
                        onClick={() => {
                          setSlotId(s.id);
                          setFormError(null);
                        }}
                        className={`flex min-h-[46px] items-center justify-between gap-3 border-2 px-4 py-3 text-left transition-colors ${
                          active
                            ? "border-gold bg-gold/10"
                            : full
                              ? "cursor-not-allowed border-ink/10 bg-paper"
                              : "border-ink/20 bg-paper hover:border-gold"
                        }`}
                      >
                        <span
                          className={`font-semibold ${full ? "text-ink-muted" : "text-ink"}`}
                        >
                          {s.teeTime}
                        </span>
                        <span className="text-sm text-ink-muted">
                          {full
                            ? "Full"
                            : `${s.spotsLeft} of ${s.capacity} spots left`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="mt-8 grid gap-5 sm:grid-cols-2">
              <FormField label="Name" id="player_name" required autoComplete="name" />
              <FormField
                label="Mobile (for a reminder)"
                id="mobile"
                type="tel"
                autoComplete="tel"
              />
              <FormField
                label="Do you have a GA handicap?"
                id="ga_handicap"
                as="select"
                required
                options={["Yes", "No"]}
              />
              <FormField
                label="Golf Links number"
                id="golf_links"
                placeholder="Leave blank if you don't have one"
              />
              <div>
                <FormField
                  label="Playing in the side comp?"
                  id="side_comp"
                  as="select"
                  options={["Yes", "No"]}
                />
                <p className="mt-1.5 text-sm text-ink-muted">
                  {event.sideComp}
                  {event.sideCompNote && ` — ${event.sideCompNote}`}
                </p>
              </div>
              <div>
                <FormField
                  label="Cart hire?"
                  id="cart_hire"
                  as="select"
                  options={["Yes", "No"]}
                />
                {event.cartFee !== "None" && (
                  <p className="mt-1.5 text-sm text-ink-muted">{event.cartFee}</p>
                )}
              </div>
              {formError && (
                <p className="border-l-4 border-crimson bg-crimson/5 p-4 text-sm text-ink sm:col-span-2">
                  {formError}
                </p>
              )}
              <div className="sm:col-span-2">
                <Button type="submit" disabled={sending} className="w-full sm:w-auto">
                  {sending
                    ? "Booking…"
                    : event.greenFeeCents > 0
                      ? "Continue to payment"
                      : "Book my spot"}
                </Button>
                {event.greenFeeCents > 0 && (
                  <p className="mt-3 text-sm text-ink-muted">
                    Your slot is confirmed once payment goes through —
                    you&apos;ll see the total before you pay.
                  </p>
                )}
              </div>
            </form>
          </div>
        )}
      </Section>
    </div>
  );
}

export default function EventDetail() {
  const { id } = useParams();
  const { event, loading } = useEvent(id);
  const location = useLocation();

  // ScrollToTop in App.jsx wins on route change, so honour the #book anchor
  // ourselves once the event has loaded.
  useEffect(() => {
    if (!loading && event?.bookable && location.hash === "#book") {
      document.getElementById("book")?.scrollIntoView();
    }
  }, [loading, event, location.hash]);

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
            ) : event.bookable ? (
              <>
                <h2 className="font-display text-xl font-semibold tracking-wide">
                  Secure your spot
                </h2>
                <RibbonRule className="mt-3" dark />
                <p className="mt-4 text-sm text-cream/85">
                  Bookings are open — pick a tee slot and book online in under a
                  minute. All veterans, serving and ex-serving, and family
                  members are welcome.
                </p>
                <div className="mt-6 flex flex-col gap-3">
                  <Button
                    onClick={() =>
                      document
                        .getElementById("book")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                  >
                    Book your spot
                  </Button>
                  <Button href={`mailto:${CLUB_EMAIL}`} variant="secondary">
                    Email the club
                  </Button>
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

      {/* Online booking: only while the event is published, locked and not yet played. */}
      {event.bookable && <BookingSection event={event} />}

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
