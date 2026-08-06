import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useEvent } from "../../hooks/useEvents.js";
import { useEventBookings } from "../../hooks/useBookings.js";
import { fetchTeeSlots, deleteBooking } from "../../lib/bookings.js";
import RibbonRule from "../../components/RibbonRule.jsx";

// Shows a blank field as a dash so the sheet stays easy to scan.
const dash = (value) => (value ? value : "—");
const yesNo = (value) => (value ? "Yes" : "No");

export default function AdminBookings() {
  const { id } = useParams();
  const { event, loading: eventLoading } = useEvent(id);
  const { bookings, loading: bookingsLoading, error, refresh } =
    useEventBookings(id);

  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [confirmRemoveId, setConfirmRemoveId] = useState(null);
  const [removingId, setRemovingId] = useState(null);
  const [removeError, setRemoveError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetchTeeSlots(id)
      .then((rows) => {
        if (!cancelled) setSlots(rows);
      })
      .catch(() => {
        // The bookings error message below covers connection problems.
      })
      .finally(() => {
        if (!cancelled) setSlotsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleRemove(bookingId) {
    setRemoveError(null);
    setRemovingId(bookingId);
    try {
      await deleteBooking(bookingId);
      refresh();
    } catch {
      setRemoveError(
        "Couldn't remove that booking — please check your internet connection and try again."
      );
    }
    setRemovingId(null);
    setConfirmRemoveId(null);
  }

  if (eventLoading || bookingsLoading || slotsLoading) {
    return <p className="text-lg text-ink-muted">Loading the bookings…</p>;
  }

  const totalSpots = slots.reduce((sum, s) => sum + (s.capacity ?? 0), 0);

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        to="/admin/events"
        className="text-base font-semibold text-navy underline decoration-gold decoration-2 underline-offset-4 hover:text-crimson"
      >
        &larr; Back to your events
      </Link>

      <h2 className="mt-4 font-display text-2xl font-semibold tracking-wide text-navy">
        Bookings — {event ? event.title : "this event"}
      </h2>
      {event && <p className="mt-1 text-lg text-ink-muted">{event.dateDisplay}</p>}
      <RibbonRule className="mt-3" />
      <p className="mt-3 text-ink-muted">
        Every player who books a tee slot on the website appears here, so
        there&rsquo;s no spreadsheet to keep. Refresh the page any time to see
        the latest bookings.
      </p>

      {error ? (
        <p className="mt-10 text-lg text-ink-muted">
          Couldn&apos;t load bookings — please check your internet connection
          and refresh the page.
        </p>
      ) : slots.length === 0 ? (
        <div className="mt-10 border border-dashed border-ink/25 bg-paper p-10 text-center">
          <p className="text-lg font-semibold text-navy">
            This event has no tee slots
          </p>
          <p className="mt-1 text-ink-muted">
            Without tee slots there&apos;s nothing for players to book into.
          </p>
        </div>
      ) : (
        <>
          <p className="mt-8 text-lg font-bold text-navy">
            {bookings.length}{" "}
            {bookings.length === 1 ? "player" : "players"} booked of{" "}
            {totalSpots} spots
          </p>

          {bookings.length === 0 && (
            <div className="mt-6 border border-dashed border-ink/25 bg-paper p-10 text-center">
              <p className="text-lg font-semibold text-navy">No bookings yet</p>
              <p className="mt-1 text-ink-muted">
                They&apos;ll appear here as members book.
              </p>
            </div>
          )}

          {removeError && (
            <p className="mt-6 border-l-4 border-crimson bg-crimson/5 p-4 text-base text-ink">
              {removeError}
            </p>
          )}

          <div className="mt-6 grid gap-6">
            {slots.map((slot) => {
              const slotBookings = bookings.filter(
                (b) => b.tee_slot_id === slot.id
              );
              const isFull = slotBookings.length >= (slot.capacity ?? 0);
              return (
                <section
                  key={slot.id}
                  className="border-t-4 border-gold bg-paper p-6 shadow-soft md:p-8"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="font-display text-xl font-semibold tracking-wide text-navy">
                      {slot.tee_time}
                    </h3>
                    <p
                      className={
                        isFull
                          ? "font-semibold text-crimson"
                          : "font-semibold text-navy"
                      }
                    >
                      {slotBookings.length} of {slot.capacity} spots taken
                      {isFull && " — full"}
                    </p>
                  </div>

                  {slotBookings.length === 0 ? (
                    <p className="mt-4 text-ink-muted">
                      No one has booked this slot yet.
                    </p>
                  ) : (
                    <ul className="mt-4 divide-y divide-ink/10 border-t border-ink/10">
                      {slotBookings.map((b) => (
                        <li key={b.id} className="py-4">
                          <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                              <p className="text-lg font-bold text-navy">
                                {b.player_name}
                              </p>
                              <p className="mt-1 text-ink-muted">
                                Mobile: {dash(b.mobile)} · GA handicap:{" "}
                                {yesNo(b.ga_handicap)} · Golf Links no:{" "}
                                {dash(b.golf_links_number)}
                              </p>
                              <p className="mt-0.5 text-ink-muted">
                                Side comp: {yesNo(b.playing_in_comp)} · Cart
                                hire: {yesNo(b.cart_hire)}
                              </p>
                            </div>
                            {confirmRemoveId === b.id ? (
                              <div className="flex flex-col gap-3 sm:flex-row">
                                <button
                                  onClick={() => handleRemove(b.id)}
                                  disabled={removingId === b.id}
                                  className="min-h-[48px] bg-crimson px-6 font-body text-base font-bold uppercase tracking-[0.08em] text-white transition-colors hover:bg-[#8f1a21] disabled:opacity-60"
                                >
                                  {removingId === b.id
                                    ? "Removing…"
                                    : "Yes, remove"}
                                </button>
                                <button
                                  onClick={() => setConfirmRemoveId(null)}
                                  disabled={removingId === b.id}
                                  className="min-h-[48px] border-2 border-navy px-6 font-body text-base font-bold uppercase tracking-[0.08em] text-navy transition-colors hover:bg-navy/5"
                                >
                                  No, keep it
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setConfirmRemoveId(b.id)}
                                className="min-h-[48px] border-2 border-crimson px-6 font-body text-base font-bold uppercase tracking-[0.08em] text-crimson transition-colors hover:bg-crimson hover:text-white"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
