import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useEvent } from "../../hooks/useEvents.js";
import { useEventBookings } from "../../hooks/useBookings.js";
import {
  fetchTeeSlots,
  createBooking,
  updateBooking,
  deleteBooking,
} from "../../lib/bookings.js";
import { downloadCsv, csvFilename } from "../../lib/csv.js";
import RibbonRule from "../../components/RibbonRule.jsx";
import AdminField from "./AdminField.jsx";

// Shows a blank field as a dash so the sheet stays easy to scan.
const dash = (value) => (value ? value : "–");
const yesNo = (value) => (value ? "Yes" : "No");

const GA_OPTIONS = [
  { value: "", label: "Not sure" },
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];

const YES_NO_OPTIONS = [
  { value: "no", label: "No" },
  { value: "yes", label: "Yes" },
];

// One form for both adding a player and editing an existing booking. It
// hands the caller plain bookings-table fields; the caller does the insert
// or update. When `slots` has more than one slot and slotPicker is on, the
// player can also be moved to a different tee time.
function PlayerForm({
  heading,
  booking,
  slots,
  slotPicker = false,
  currentSlotId,
  saving,
  error,
  onSave,
  onCancel,
}) {
  const [form, setForm] = useState({
    player_name: booking?.player_name ?? "",
    mobile: booking?.mobile ?? "",
    ga_handicap:
      booking?.ga_handicap === true
        ? "yes"
        : booking?.ga_handicap === false
          ? "no"
          : "",
    golf_links_number: booking?.golf_links_number ?? "",
    playing_in_comp: booking?.playing_in_comp ? "yes" : "no",
    cart_hire: booking?.cart_hire ? "yes" : "no",
    tee_slot_id: currentSlotId ?? "",
  });

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  function handleSubmit(e) {
    e.preventDefault();
    onSave({
      player_name: form.player_name.trim(),
      mobile: form.mobile.trim() || null,
      ga_handicap:
        form.ga_handicap === "yes"
          ? true
          : form.ga_handicap === "no"
            ? false
            : null,
      golf_links_number: form.golf_links_number.trim() || null,
      playing_in_comp: form.playing_in_comp === "yes",
      cart_hire: form.cart_hire === "yes",
      ...(slotPicker ? { tee_slot_id: form.tee_slot_id } : {}),
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 grid gap-5 border-l-4 border-gold bg-cream p-5 sm:grid-cols-2 md:p-6"
    >
      <p className="font-display text-lg font-semibold tracking-wide text-navy sm:col-span-2">
        {heading}
      </p>
      <AdminField
        label="Player's name"
        id="booking_name"
        required
        value={form.player_name}
        onChange={set("player_name")}
      />
      <AdminField
        label="Mobile"
        id="booking_mobile"
        type="tel"
        value={form.mobile}
        onChange={set("mobile")}
      />
      <AdminField
        label="Do they have a GA handicap?"
        id="booking_ga"
        as="select"
        options={GA_OPTIONS}
        value={form.ga_handicap}
        onChange={set("ga_handicap")}
      />
      <AdminField
        label="Golf Links number"
        id="booking_golf_links"
        hint="Leave blank if they don't have one."
        value={form.golf_links_number}
        onChange={set("golf_links_number")}
      />
      <AdminField
        label="Playing in the side comp?"
        id="booking_side_comp"
        as="select"
        options={YES_NO_OPTIONS}
        value={form.playing_in_comp}
        onChange={set("playing_in_comp")}
      />
      <AdminField
        label="Cart hire?"
        id="booking_cart"
        as="select"
        options={YES_NO_OPTIONS}
        value={form.cart_hire}
        onChange={set("cart_hire")}
      />
      {slotPicker && (
        <AdminField
          label="Tee time"
          id="booking_slot"
          as="select"
          options={slots.map((s) => ({ value: s.id, label: s.tee_time }))}
          value={form.tee_slot_id}
          onChange={set("tee_slot_id")}
        />
      )}
      {error && (
        <p className="border-l-4 border-crimson bg-crimson/5 p-4 text-base text-ink sm:col-span-2">
          {error}
        </p>
      )}
      <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row">
        <button
          type="submit"
          disabled={saving}
          className="min-h-[48px] bg-gold px-6 font-body text-base font-bold uppercase tracking-[0.08em] text-navy-deep transition-colors hover:bg-gold-bright disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save player"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="min-h-[48px] border-2 border-navy px-6 font-body text-base font-bold uppercase tracking-[0.08em] text-navy transition-colors hover:bg-navy/5"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

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
  // Which slot is showing the add form, and which booking the edit form.
  const [addingSlotId, setAddingSlotId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);
  const [notice, setNotice] = useState(null);

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

  function openAddForm(slotId) {
    setAddingSlotId(slotId);
    setEditingId(null);
    setFormError(null);
    setNotice(null);
  }

  function openEditForm(bookingId) {
    setEditingId(bookingId);
    setAddingSlotId(null);
    setFormError(null);
    setNotice(null);
  }

  function closeForms() {
    setAddingSlotId(null);
    setEditingId(null);
    setFormError(null);
  }

  async function handleAdd(slot, fields) {
    setFormError(null);
    setSaving(true);
    try {
      await createBooking({
        eventId: id,
        teeSlotId: slot.id,
        playerName: fields.player_name,
        mobile: fields.mobile,
        gaHandicap: fields.ga_handicap,
        golfLinksNumber: fields.golf_links_number,
        playingInComp: fields.playing_in_comp,
        cartHire: fields.cart_hire,
      });
      setNotice(`${fields.player_name} has been added to the ${slot.tee_time} slot.`);
      closeForms();
      refresh();
    } catch (err) {
      setFormError(
        err.code === "slot_full"
          ? "That tee time is already full. Remove a player first, or raise the slot's capacity on the event's edit page."
          : "Couldn't add the player. Please check your internet connection and try again."
      );
    }
    setSaving(false);
  }

  async function handleEdit(booking, fields) {
    setFormError(null);
    setSaving(true);
    try {
      await updateBooking(booking.id, fields);
      setNotice(`${fields.player_name}'s booking has been updated.`);
      closeForms();
      refresh();
    } catch (err) {
      setFormError(
        err.code === "slot_full"
          ? "That tee time is already full, so they can't be moved there."
          : "Couldn't save those changes. Please check your internet connection and try again."
      );
    }
    setSaving(false);
  }

  async function handleRemove(bookingId) {
    setRemoveError(null);
    setRemovingId(bookingId);
    try {
      await deleteBooking(bookingId);
      refresh();
    } catch {
      setRemoveError(
        "Couldn't remove that booking. Please check your internet connection and try again."
      );
    }
    setRemovingId(null);
    setConfirmRemoveId(null);
  }

  // The tee sheet as a spreadsheet, one row per player, ordered by tee time.
  function downloadTeeSheet() {
    const rows = [];
    for (const slot of slots) {
      for (const b of bookings.filter((x) => x.tee_slot_id === slot.id)) {
        rows.push([
          slot.tee_time,
          b.player_name,
          b.mobile ?? "",
          b.ga_handicap === true ? "Yes" : b.ga_handicap === false ? "No" : "",
          b.golf_links_number ?? "",
          b.playing_in_comp ? "Yes" : "No",
          b.cart_hire ? "Yes" : "No",
          b.paid_cents ? `$${(b.paid_cents / 100).toFixed(2)}` : "",
          b.created_at ? new Date(b.created_at).toLocaleDateString("en-AU") : "",
        ]);
      }
    }
    downloadCsv(
      csvFilename(event?.title ?? "event", "tee sheet"),
      [
        "Tee time",
        "Player",
        "Mobile",
        "GA handicap",
        "Golf Links number",
        "Side comp",
        "Cart hire",
        "Paid online",
        "Booked on",
      ],
      rows
    );
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
        Bookings: {event ? event.title : "this event"}
      </h2>
      {event && <p className="mt-1 text-lg text-ink-muted">{event.dateDisplay}</p>}
      <RibbonRule className="mt-3" />
      <p className="mt-3 text-ink-muted">
        Every player who books a tee slot on the website appears here. You can
        also add players yourself, fix their details, move them to another tee
        time or take them off the sheet.
      </p>

      {error ? (
        <p className="mt-10 text-lg text-ink-muted">
          Couldn&apos;t load bookings. Please check your internet connection
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
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
            <p className="text-lg font-bold text-navy">
              {bookings.length}{" "}
              {bookings.length === 1 ? "player" : "players"} booked of{" "}
              {totalSpots} spots
            </p>
            {bookings.length > 0 && (
              <button
                onClick={downloadTeeSheet}
                className="min-h-[48px] border-2 border-navy px-6 font-body text-base font-bold uppercase tracking-[0.08em] text-navy transition-colors hover:bg-navy hover:text-white"
              >
                Download the tee sheet
              </button>
            )}
          </div>
          {bookings.length > 0 && (
            <p className="mt-2 text-sm text-ink-muted">
              The download is a spreadsheet file (CSV) that opens straight into
              Excel, with one row per player.
            </p>
          )}

          {bookings.length === 0 && (
            <div className="mt-6 border border-dashed border-ink/25 bg-paper p-10 text-center">
              <p className="text-lg font-semibold text-navy">No bookings yet</p>
              <p className="mt-1 text-ink-muted">
                They&apos;ll appear here as members book, or you can add
                players yourself below.
              </p>
            </div>
          )}

          {notice && (
            <p className="mt-6 border-l-4 border-gold bg-gold/10 p-4 text-lg font-semibold text-navy">
              ✓ {notice}
            </p>
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
                      {isFull && " (full)"}
                    </p>
                  </div>

                  {slotBookings.length === 0 ? (
                    <p className="mt-4 text-ink-muted">
                      No one has booked this slot yet.
                    </p>
                  ) : (
                    <ul className="mt-4 divide-y divide-ink/10 border-t border-ink/10">
                      {slotBookings.map((b) =>
                        editingId === b.id ? (
                          <li key={b.id} className="py-4">
                            <PlayerForm
                              heading={`Edit ${b.player_name}'s booking`}
                              booking={b}
                              slots={slots}
                              slotPicker={slots.length > 1}
                              currentSlotId={slot.id}
                              saving={saving}
                              error={formError}
                              onSave={(fields) => handleEdit(b, fields)}
                              onCancel={closeForms}
                            />
                          </li>
                        ) : (
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
                                <p className="mt-0.5 text-ink-muted">
                                  {b.paid_cents ? (
                                    <span className="font-semibold text-navy">
                                      Paid ${(b.paid_cents / 100).toFixed(2)} online
                                    </span>
                                  ) : (
                                    "No online payment recorded (pays at the course)"
                                  )}
                                </p>
                              </div>
                              {confirmRemoveId === b.id ? (
                                <div className="flex flex-col gap-3">
                                  {b.paid_cents ? (
                                    <p className="max-w-xs text-sm text-ink-muted">
                                      This player paid ${(b.paid_cents / 100).toFixed(2)}{" "}
                                      online. Removing the booking does NOT refund
                                      them. Do that in the Square dashboard.
                                    </p>
                                  ) : null}
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
                                </div>
                              ) : (
                                <div className="flex flex-wrap gap-3">
                                  <button
                                    onClick={() => openEditForm(b.id)}
                                    className="min-h-[48px] border-2 border-navy px-6 font-body text-base font-bold uppercase tracking-[0.08em] text-navy transition-colors hover:bg-navy hover:text-white"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => setConfirmRemoveId(b.id)}
                                    className="min-h-[48px] border-2 border-crimson px-6 font-body text-base font-bold uppercase tracking-[0.08em] text-crimson transition-colors hover:bg-crimson hover:text-white"
                                  >
                                    Remove
                                  </button>
                                </div>
                              )}
                            </div>
                          </li>
                        )
                      )}
                    </ul>
                  )}

                  {addingSlotId === slot.id ? (
                    <PlayerForm
                      heading={`Add a player to ${slot.tee_time}`}
                      saving={saving}
                      error={formError}
                      onSave={(fields) => handleAdd(slot, fields)}
                      onCancel={closeForms}
                    />
                  ) : (
                    !isFull && (
                      <button
                        onClick={() => openAddForm(slot.id)}
                        className="mt-4 min-h-[48px] border-2 border-navy px-6 font-body text-base font-bold uppercase tracking-[0.08em] text-navy transition-colors hover:bg-navy/5"
                      >
                        Add a player
                      </button>
                    )
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
