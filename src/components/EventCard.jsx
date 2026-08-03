import { Link } from "react-router-dom";

function Row({ icon, label, value }) {
  return (
    <div className="flex items-center gap-2.5 text-sm">
      <span className="text-gold" aria-hidden="true">{icon}</span>
      <span className="font-semibold text-ink">{label}:</span>
      <span className="text-ink-muted">{value}</span>
    </div>
  );
}

export const eventIcons = {
  clock: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  ),
  flag: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M5 21V4m0 0h12l-2.5 4L17 12H5" />
    </svg>
  ),
  pin: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M12 21s-7-6.1-7-11a7 7 0 1 1 14 0c0 4.9-7 11-7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  ),
  dollar: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M12 2v20M16.5 6.5c-1-1.2-2.7-1.7-4.5-1.7-2.5 0-4.5 1.2-4.5 3.2s2 2.8 4.5 3.3 4.5 1.3 4.5 3.3-2 3.2-4.5 3.2c-1.8 0-3.5-.5-4.5-1.7" />
    </svg>
  ),
};

// Plain-text metadata line: region and status, no boxes.
export function EventMeta({ event, dark = false }) {
  const statusColour =
    event.timeStatus === "finalised"
      ? dark
        ? "text-cream/60"
        : "text-ink-muted"
      : dark
        ? "text-gold-bright"
        : "text-crimson";
  return (
    <p className="text-xs font-bold uppercase tracking-[0.14em]">
      <span className={dark ? "text-cream/80" : "text-ink-muted"}>{event.region}</span>
      <span className="mx-2 text-gold" aria-hidden="true">·</span>
      <span className={statusColour}>{event.status}</span>
      {event.isFull && (
        <>
          <span className="mx-2 text-gold" aria-hidden="true">·</span>
          <span className={dark ? "text-cream/80" : "text-crimson"}>Full</span>
        </>
      )}
    </p>
  );
}

export function EventDateBlock({ event, className = "" }) {
  const [year, month, day] = event.date.split("-");
  const monthName = new Date(Number(year), Number(month) - 1).toLocaleString("en-AU", { month: "short" });
  const tbc = event.dateDisplay.toLowerCase().includes("confirm");
  return (
    <div className={`flex flex-col items-center justify-center bg-navy text-center ${className}`}>
      {tbc ? (
        <span className="font-display text-xl font-semibold uppercase text-gold-bright">TBC</span>
      ) : (
        <>
          <span className="font-display text-4xl font-bold text-white">{Number(day)}</span>
          <span className="font-body text-sm font-bold uppercase tracking-[0.14em] text-gold-bright">
            {monthName} {year}
          </span>
        </>
      )}
    </div>
  );
}

// The featured card used on the homepage. The one card that earns a box.
export default function EventCard({ event }) {
  return (
    <article className="flex flex-col overflow-hidden border border-ink/10 bg-paper shadow-soft md:flex-row">
      <EventDateBlock event={event} className="p-6 md:w-44" />

      <div className="flex flex-1 flex-col gap-4 p-7">
        <EventMeta event={event} />

        <div>
          <h3 className="font-display text-xl font-semibold tracking-wide text-navy">
            {event.title}
          </h3>
          <p className="mt-1 text-sm font-semibold text-ink-muted">{event.dateDisplay}</p>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <Row icon={eventIcons.pin} label="Venue" value={event.venue} />
          <Row icon={eventIcons.clock} label="Meet" value={event.meetTime} />
          <Row icon={eventIcons.flag} label="First tee" value={event.firstTee} />
          <Row icon={eventIcons.dollar} label="Green fees" value={event.greenFee} />
        </div>

        <div className="mt-auto flex items-center justify-between pt-2">
          {event.sponsor ? (
            <p className="text-xs text-ink-muted">
              Event sponsor: <span className="font-semibold">{event.sponsor}</span>
            </p>
          ) : (
            <span />
          )}
          <Link
            to={`/events/${event.id}`}
            className="font-body text-sm font-bold uppercase tracking-[0.08em] text-navy underline decoration-gold decoration-2 underline-offset-4 transition-colors hover:text-crimson"
          >
            View event
          </Link>
        </div>
      </div>
    </article>
  );
}

// Flat list row for the Events page. Hairline separated, no card chrome.
export function EventRow({ event }) {
  return (
    <article className="flex flex-col gap-5 py-8 sm:flex-row sm:items-start">
      <EventDateBlock event={event} className="h-24 w-28 shrink-0" />
      <div className="flex-1">
        <EventMeta event={event} />
        <h3 className="mt-3 font-display text-xl font-semibold tracking-wide text-navy">
          <Link to={`/events/${event.id}`} className="transition-colors hover:text-crimson">
            {event.title}
          </Link>
        </h3>
        <p className="mt-1 text-sm font-semibold text-ink-muted">{event.dateDisplay}</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <Row icon={eventIcons.pin} label="Venue" value={event.venue} />
          <Row icon={eventIcons.clock} label="Meet" value={event.meetTime} />
          <Row icon={eventIcons.flag} label="First tee" value={event.firstTee} />
          <Row icon={eventIcons.dollar} label="Fees" value={event.greenFee} />
        </div>
        <Link
          to={`/events/${event.id}`}
          className="mt-4 inline-block font-body text-sm font-bold uppercase tracking-[0.08em] text-navy underline decoration-gold decoration-2 underline-offset-4 transition-colors hover:text-crimson"
        >
          View event
        </Link>
      </div>
    </article>
  );
}
