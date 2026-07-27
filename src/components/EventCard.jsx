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

const icons = {
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

export default function EventCard({ event, featured = false }) {
  const [year, month, day] = event.date.split("-");
  const monthName = new Date(Number(year), Number(month) - 1).toLocaleString("en-AU", { month: "short" });
  const tbc = event.dateDisplay.toLowerCase().includes("confirm");

  return (
    <article
      className={`flex flex-col overflow-hidden rounded-card bg-paper shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lift ${
        featured ? "md:flex-row" : ""
      }`}
    >
      {/* Date chip panel */}
      <div
        className={`flex items-center justify-center gap-3 bg-navy p-5 text-center ${
          featured ? "md:w-44 md:flex-col md:gap-1" : ""
        }`}
      >
        {tbc ? (
          <span className="font-display text-xl font-semibold uppercase text-gold-bright">TBC</span>
        ) : (
          <>
            <span className="font-display text-4xl font-bold text-white">{Number(day)}</span>
            <span className="font-display text-lg font-medium uppercase tracking-wide text-gold-bright">
              {monthName} {year}
            </span>
          </>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-4 p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-cream px-3 py-1 text-xs font-semibold text-ink">
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

        <div>
          <h3 className="font-display text-xl font-semibold uppercase text-navy">
            {event.title}
          </h3>
          <p className="mt-1 text-sm font-semibold text-ink-muted">{event.dateDisplay}</p>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <Row icon={icons.pin} label="Venue" value={event.venue} />
          <Row icon={icons.clock} label="Meet" value={event.meetTime} />
          <Row icon={icons.flag} label="First tee" value={event.firstTee} />
          <Row icon={icons.dollar} label="Green fees" value={event.greenFee} />
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
            className="font-display text-sm font-semibold uppercase tracking-wide text-navy underline decoration-gold decoration-2 underline-offset-4 transition-colors hover:text-crimson"
          >
            View event →
          </Link>
        </div>
      </div>
    </article>
  );
}
