import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import Section from "../components/Section.jsx";
import RibbonRule from "../components/RibbonRule.jsx";
import Button from "../components/Button.jsx";
import FormField from "../components/FormField.jsx";
import Photo from "../components/Photo.jsx";
import { EventMeta } from "../components/EventCard.jsx";
import { useEvent } from "../hooks/useEvents.js";
import { useSlotAvailability, useSlotPlayers } from "../hooks/useBookings.js";
import { useEventPhotos } from "../hooks/useGallery.js";
import { createBooking } from "../lib/bookings.js";
import { albumForEvent } from "../lib/photos.js";
import { FACEBOOK_URL, CLUB_EMAIL } from "../lib/site.js";
import SquarePayment from "../components/SquarePayment.jsx";
import { useAuth } from "../admin/AuthProvider.jsx";
import { applyPageMeta } from "../lib/meta.js";
import { eventMeta, eventJsonLd } from "../lib/seo.js";

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
  const { players, refresh: refreshPlayers } = useSlotPlayers(event.id);
  const { session } = useAuth();
  const [slotId, setSlotId] = useState(null);
  const [sending, setSending] = useState(false);
  const [formError, setFormError] = useState(null);
  const [booked, setBooked] = useState(null);
  // Details captured and awaiting payment (online payments only).
  const [pending, setPending] = useState(null);
  // Where the player pays when the event offers the choice: 'online' | 'course'.
  const [payWhere, setPayWhere] = useState(null);
  // Last details entered, so "Change your details" reopens a filled form.
  const [draft, setDraft] = useState(null);
  const yesNo = (v) => (draft ? (v ? "Yes" : "No") : undefined);

  const selectedSlot = slots.find((s) => s.id === slotId);

  // How this event takes money (committee-set, per event): pay online to
  // book, the player's choice of online or at the course, or everyone pays
  // at the course on arrival.
  const hasFees =
    event.greenFeeCents + event.cartFeeCents + event.sideCompCents > 0;
  const offersChoice = hasFees && event.paymentMode === "online_choice";
  const onlineRequired = hasFees && event.paymentMode === "online_required";
  const payAtCourseOnly = hasFees && event.paymentMode === "on_arrival";
  const paysOnline = onlineRequired || (offersChoice && payWhere === "online");

  // Green fee plus whatever the player ticks. The server re-prices online
  // payments from the event row — this total is display only.
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
    if (offersChoice && !payWhere) {
      setFormError(
        "Please choose how you'd like to pay — online now, or at the course on the day."
      );
      return;
    }
    const f = new FormData(e.target);
    const details = {
      eventId: event.id,
      teeSlotId: slotId,
      playerName: f.get("player_name").trim(),
      email: f.get("email").trim().toLowerCase(),
      suburb: f.get("suburb").trim(),
      postcode: f.get("postcode").trim(),
      emailOptIn: f.get("email_opt_in") === "on",
      mobile: f.get("mobile")?.trim() || null,
      gaHandicap: f.get("ga_handicap") === "Yes",
      golfLinksNumber: f.get("golf_links")?.trim() || null,
      playingInComp: f.get("side_comp") === "Yes",
      cartHire: f.get("cart_hire") === "Yes",
    };
    setFormError(null);
    setDraft(details);

    if (paysOnline && totalCentsFor(details) > 0) {
      setPending(details);
      return;
    }

    // Free events, pay-at-the-course events, and the "pay at the course"
    // choice all book directly — no charge.
    setSending(true);
    try {
      await createBooking(details);
      setBooked({
        playerName: details.playerName,
        teeTime: selectedSlot?.teeTime,
        owedCents: totalCentsFor(details),
      });
    } catch (err) {
      if (err.code === "slot_full") {
        setFormError("That slot just filled up. Please pick another time.");
        setSlotId(null);
        refresh();
        refreshPlayers();
      } else if (err.code === "payment_required") {
        // The committee flipped the event to pay-online-only while this
        // page was open.
        setFormError(
          "This event is now paid online when booking. Please refresh the page and book again."
        );
      } else if (err.code === "23514") {
        setFormError(
          "Please check your email address, and that your postcode is 4 digits."
        );
      } else {
        setFormError(
          `Sorry, your booking didn't go through. Please check your internet connection and try again, or email us at ${CLUB_EMAIL}.`
        );
      }
    } finally {
      setSending(false);
    }
  }

  function handlePaymentError(data) {
    if (data?.code === "slot_full") {
      setPending(null);
      setSlotId(null);
      setFormError("That tee time filled up before payment went through. You haven't been charged. Please pick another slot.");
      refresh();
      refreshPlayers();
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
            {booked.owedCents > 0 && (
              <p className="mt-3 text-ink-muted">
                You&apos;ll pay{" "}
                <span className="font-semibold text-ink">
                  ${(booked.owedCents / 100).toFixed(2)}
                </span>{" "}
                at the course on the day.
              </p>
            )}
          </div>
        ) : pending ? (
          <div className="mx-auto max-w-xl border-t-4 border-gold bg-cream p-8 md:p-10">
            <p className="font-display text-xl font-semibold tracking-wide text-navy">
              Confirm and pay
            </p>
            <RibbonRule className="mt-3" />
            <dl className="mt-6 text-sm">
              <Detail label="Player" value={pending.playerName} />
              <Detail label="Email" value={pending.email} />
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
              {event.sideComp !== "None" && (
                <p>
                  <span className="font-bold uppercase tracking-[0.08em] text-ink-muted">
                    Side comp
                  </span>{" "}
                  <span className="font-semibold text-ink">{event.sideComp}</span>
                  {event.sideCompNote && (
                    <span className="text-ink-muted"> ({event.sideCompNote})</span>
                )}
              </p>
              )}
            </div>

            {/* How fees are paid, set per event by the committee. */}
            {hasFees && (
              <p className="mt-4 text-sm text-ink-muted">
                {payAtCourseOnly
                  ? "Fees are paid at the course on the day — booking your slot is free."
                  : offersChoice
                    ? "Pay online when you book, or at the course on the day — your choice below."
                    : "Fees are paid online when you book."}
              </p>
            )}

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
                  Tee slots haven&apos;t been posted yet. Email us at{" "}
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

              {/* Names come from an anon-safe RPC: first initial + last name
                  only, so anyone booking can see who they'd be playing
                  alongside. Every slot is listed so the sheet is visible even
                  before the first booking comes in. */}
              {!loading && !error && slots.length > 0 && (
                <div className="mt-6 max-w-xl">
                  <p className="text-sm font-semibold text-ink">
                    Who&apos;s already booked
                  </p>
                  <dl className="mt-2">
                    {slots.map((s) => (
                      <div
                        key={s.id}
                        className="flex flex-wrap gap-x-4 gap-y-1 border-b border-ink/10 py-2 text-sm sm:flex-nowrap"
                      >
                        <dt className="w-24 shrink-0 font-semibold text-ink">
                          {s.teeTime}
                        </dt>
                        <dd className="text-ink-muted">
                          {players[s.id]?.length
                            ? players[s.id].join(", ")
                            : "No bookings yet"}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </div>

            {/* No form until there's a tee slot to book into. */}
            {!loading && !error && slots.length > 0 && (
              <form onSubmit={handleSubmit} className="mt-8 grid gap-5 sm:grid-cols-2">
                <FormField
                  label="Name"
                  id="player_name"
                  required
                  maxLength={120}
                  autoComplete="name"
                  defaultValue={draft?.playerName}
                />
                <FormField
                  label="Email"
                  id="email"
                  type="email"
                  required
                  maxLength={254}
                  autoComplete="email"
                  defaultValue={draft?.email ?? session?.user?.email ?? ""}
                />
                <FormField
                  label="Home suburb"
                  id="suburb"
                  required
                  maxLength={80}
                  autoComplete="address-level2"
                  defaultValue={draft?.suburb}
                />
                <FormField
                  label="Postcode"
                  id="postcode"
                  required
                  inputMode="numeric"
                  pattern="[0-9]{4}"
                  maxLength={4}
                  title="A 4-digit Australian postcode"
                  autoComplete="postal-code"
                  defaultValue={draft?.postcode}
                />
                <FormField
                  label="Mobile (optional, for a reminder)"
                  id="mobile"
                  type="tel"
                  maxLength={40}
                  autoComplete="tel"
                  defaultValue={draft?.mobile ?? ""}
                />
                <FormField
                  label="Do you have a GA handicap?"
                  id="ga_handicap"
                  as="select"
                  defaultValue={yesNo(draft?.gaHandicap)}
                  required
                  options={["Yes", "No"]}
                />
                <FormField
                  label="Golf Links number"
                  id="golf_links"
                  placeholder="Leave blank if you don't have one"
                  maxLength={40}
                  defaultValue={draft?.golfLinksNumber ?? ""}
                />
                {event.sideComp !== "None" && (
                  <div>
                    <FormField
                      label="Playing in the side comp?"
                      id="side_comp"
                      as="select"
                      defaultValue={yesNo(draft?.playingInComp)}
                      options={["Yes", "No"]}
                    />
                    <p className="mt-1.5 text-sm text-ink-muted">
                      {event.sideComp}
                      {event.sideCompNote && ` (${event.sideCompNote})`}
                    </p>
                  </div>
                )}
                <div>
                  <FormField
                    label="Cart hire?"
                    id="cart_hire"
                    as="select"
                    defaultValue={yesNo(draft?.cartHire)}
                    options={["Yes", "No"]}
                  />
                  {event.cartFee !== "None" && (
                    <p className="mt-1.5 text-sm text-ink-muted">{event.cartFee}</p>
                  )}
                </div>
                {/* Pay online now, or at the course? Radio-group semantics on
                    plain buttons, same pattern as the tee slot picker. */}
                {offersChoice && (
                  <div className="sm:col-span-2">
                    <p className="text-sm font-semibold text-ink">
                      How would you like to pay?
                      <span className="ml-1 text-crimson" aria-hidden="true">*</span>
                    </p>
                    <div
                      role="radiogroup"
                      aria-label="How would you like to pay?"
                      className="mt-3 grid gap-3 sm:grid-cols-2"
                    >
                      {[
                        {
                          value: "online",
                          label: "Pay online now",
                          note: "Card payment as part of booking",
                        },
                        {
                          value: "course",
                          label: "Pay at the course",
                          note: "Book free now, pay on arrival",
                        },
                      ].map((opt) => {
                        const active = payWhere === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            role="radio"
                            aria-checked={active}
                            onClick={() => {
                              setPayWhere(opt.value);
                              setFormError(null);
                            }}
                            className={`flex min-h-[46px] flex-col justify-center border-2 px-4 py-3 text-left transition-colors ${
                              active
                                ? "border-gold bg-gold/10"
                                : "border-ink/20 bg-paper hover:border-gold"
                            }`}
                          >
                            <span className="font-semibold text-ink">{opt.label}</span>
                            <span className="text-sm text-ink-muted">{opt.note}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
                <label className="flex items-start gap-3 text-sm text-ink sm:col-span-2">
                  <input
                    type="checkbox"
                    name="email_opt_in"
                    className="mt-0.5 h-5 w-5 shrink-0 accent-gold"
                  />
                  <span>
                    Email me about future club events and news. Optional — you
                    can unsubscribe any time.
                  </span>
                </label>
                {/* APP 5 collection notice: what, why, and where to read more. */}
                <p className="text-sm text-ink-muted sm:col-span-2">
                  We collect these details to manage your booking, contact you
                  about this event, and (for your suburb and postcode) plan
                  events across the regions our members travel from. Booking
                  contact details are deleted 12 months after the event. See our{" "}
                  <Link
                    to="/privacy"
                    className="font-semibold text-navy underline decoration-gold decoration-2 underline-offset-2 hover:text-crimson"
                  >
                    Privacy Policy
                  </Link>{" "}
                  for how we handle and protect your information.
                </p>
                {formError && (
                  <p className="border-l-4 border-crimson bg-crimson/5 p-4 text-sm text-ink sm:col-span-2">
                    {formError}
                  </p>
                )}
                <div className="sm:col-span-2">
                  <Button type="submit" disabled={sending} className="w-full sm:w-auto">
                    {sending
                      ? "Booking…"
                      : paysOnline
                        ? "Continue to payment"
                        : "Book my spot"}
                  </Button>
                  {paysOnline ? (
                    <p className="mt-3 text-sm text-ink-muted">
                      Your slot is confirmed once payment goes through, and
                      you&apos;ll see the total before you pay.
                    </p>
                  ) : hasFees ? (
                    <p className="mt-3 text-sm text-ink-muted">
                      Booking is free — fees are paid at the course on the day.
                    </p>
                  ) : null}
                </div>
              </form>
            )}
          </div>
        )}
      </Section>
    </div>
  );
}

export default function EventDetail() {
  const { id } = useParams();
  const { event, loading, error } = useEvent(id);
  const location = useLocation();
  // Committee-uploaded photos linked to this event, for the recap of a
  // played day (only fetched once the event is finalised).
  const { photos: dbEventPhotos } = useEventPhotos(
    event && event.timeStatus === "finalised" ? event.id : null
  );

  // Event-specific title/description and schema.org data for search
  // engines (the prerendered HTML has these for events that existed at the
  // last deploy; this covers newer ones). Drafts stay out of the index.
  useEffect(() => {
    if (!event) return;
    applyPageMeta({
      ...eventMeta(event),
      path: location.pathname,
      noindex: event.lifecycle === "draft",
    });
    let script = document.getElementById("event-jsonld");
    if (!script) {
      script = document.createElement("script");
      script.type = "application/ld+json";
      script.id = "event-jsonld";
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(eventJsonLd(event));
    return () => script.remove();
  }, [event, location.pathname]);

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

  if (error) {
    return (
      <Section eyebrow="Events" title="Couldn't load this event" tone="cream" center>
        <p className="text-ink-muted">
          Please check your internet connection and refresh the page.
        </p>
        <div className="mt-6 flex justify-center">
          <Button to="/events" variant="secondary-light">
            Back to events
          </Button>
        </div>
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
  // Two or three photos make a recap; the full set lives in the Gallery.
  // Committee-uploaded photos (linked to this event in the admin Photos
  // area) win; the bundled album is the fallback for the original event.
  const album = finalised ? albumForEvent(event) : null;
  const legacyRecap = album?.photos.filter((p) => p.role !== "accent") ?? [];
  const recapPhotos = (
    dbEventPhotos.length > 0 ? dbEventPhotos : legacyRecap
  ).slice(0, 3);
  const showRecap = finalised && recapPhotos.length > 0;

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
                  Bookings are open. Pick a tee slot and book online in under a
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
                  {event.isFull ? "This event is full" : "Secure your spot"}
                </h2>
                <RibbonRule className="mt-3" dark />
                <p className="mt-4 text-sm text-cream/85">
                  {event.isFull
                    ? "Every spot has been taken. Email the club or message us on Facebook and we'll let you know if one opens up."
                    : "Message us on Facebook or email the club and we'll lock you in. All veterans, serving and ex-serving, and family members are welcome."}
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

      {/* Recap: only for played events that have photos. */}
      {showRecap && (
        <Section eyebrow="How the day went" title="From the course" tone="paper">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recapPhotos.map((p) => (
              <Photo
                key={p.id ?? p.src}
                photo={p}
                ratio={p.orientation === "portrait" ? "aspect-[4/5]" : "aspect-[3/2]"}
                position="object-top"
                caption
              />
            ))}
          </div>
          <p className="mt-8">
            <a
              href={FACEBOOK_URL}
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
