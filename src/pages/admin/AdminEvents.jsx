import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useEvents } from "../../hooks/useEvents.js";

export default function AdminEvents() {
  const { events, loading, error } = useEvents();
  const location = useLocation();
  const [notice, setNotice] = useState(location.state?.message ?? null);

  // Clear the "Event saved" style notice after a little while.
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 6000);
    return () => clearTimeout(t);
  }, [notice]);

  return (
    <div className="mx-auto max-w-3xl">
      {notice && (
        <p className="mb-8 border-l-4 border-gold bg-gold/10 p-4 text-lg font-semibold text-navy">
          ✓ {notice}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-display text-2xl font-semibold tracking-wide text-navy">
          Your events
        </h2>
        <Link
          to="/admin/events/new"
          className="inline-flex min-h-[56px] items-center bg-gold px-8 font-body text-base font-bold uppercase tracking-[0.08em] text-navy-deep transition-colors hover:bg-gold-bright"
        >
          + Add a new event
        </Link>
      </div>
      <p className="mt-2 text-ink-muted">
        These are the events shown on the website. Press{" "}
        <span className="font-semibold">Edit</span> next to an event to change
        or remove it.
      </p>

      {loading ? (
        <p className="mt-10 text-lg text-ink-muted">Loading your events…</p>
      ) : error ? (
        <p className="mt-10 text-lg text-ink-muted">
          Couldn&apos;t load events — please check your internet connection and
          refresh the page.
        </p>
      ) : events.length === 0 ? (
        <div className="mt-10 border border-dashed border-ink/25 bg-paper p-10 text-center">
          <p className="text-lg font-semibold text-navy">No events yet</p>
          <p className="mt-1 text-ink-muted">
            Press &ldquo;Add a new event&rdquo; above to create your first one.
          </p>
        </div>
      ) : (
        <ul className="mt-8 divide-y divide-ink/10 border-t border-ink/10">
          {events.map((e) => (
            <li
              key={e.id}
              className="flex flex-wrap items-center justify-between gap-4 py-5"
            >
              <div>
                <p className="text-lg font-bold text-navy">{e.title}</p>
                <p className="mt-0.5 text-ink-muted">
                  {e.dateDisplay} · {e.region} ·{" "}
                  <span
                    className={
                      e.statusValue === "past"
                        ? "text-ink-muted"
                        : e.statusValue === "full"
                          ? "font-semibold text-crimson"
                          : "font-semibold text-navy"
                    }
                  >
                    {e.status}
                  </span>
                </p>
              </div>
              <Link
                to={`/admin/events/${e.id}/edit`}
                className="inline-flex min-h-[48px] items-center border-2 border-navy px-8 font-body text-base font-bold uppercase tracking-[0.08em] text-navy transition-colors hover:bg-navy hover:text-white"
              >
                Edit
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
