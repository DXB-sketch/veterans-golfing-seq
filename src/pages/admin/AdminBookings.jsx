import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useEvent } from "../../hooks/useEvents.js";
import { useEventBookings } from "../../hooks/useBookings.js";
import {
  fetchTeeSlots,
  createBooking,
  updateBooking,
  swapBookings,
  deleteBooking,
} from "../../lib/bookings.js";
import { downloadCsv, csvFilename } from "../../lib/csv.js";
import RibbonRule from "../../components/RibbonRule.jsx";
import AdminField from "./AdminField.jsx";

// Shows a blank field as a dash so the sheet stays easy to scan.
const dash = (value) => (value ? value : "–");
const yesNo = (value) => (value ? "Yes" : "No");
const money = (cents) => `$${(cents / 100).toFixed(2)}`;

const BTN =
  "min-h-[48px] px-6 font-body text-base font-bold uppercase tracking-[0.08em] transition-colors disabled:opacity-60";
const BTN_NAVY = `${BTN} border-2 border-navy text-navy hover:bg-navy hover:text-white`;
const BTN_GOLD = `${BTN} bg-gold text-navy-deep hover:bg-gold-bright`;
const BTN_CRIMSON_OUTLINE = `${BTN} border-2 border-crimson text-crimson hover:bg-crimson hover:text-white`;

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
// or update. Moving players between tee times has its own control (Move).
function PlayerForm({ heading, booking, saving, error, onSave, onCancel }) {
  const [form, setForm] = useState({
    player_name: booking?.player_name ?? "",
    email: booking?.email ?? "",
    suburb: booking?.suburb ?? "",
    postcode: booking?.postcode ?? "",
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
  });

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  function handleSubmit(e) {
    e.preventDefault();
    onSave({
      player_name: form.player_name.trim(),
      email: form.email.trim().toLowerCase() || null,
      suburb: form.suburb.trim() || null,
      postcode: form.postcode.trim() || null,
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
        maxLength={120}
        value={form.player_name}
        onChange={set("player_name")}
      />
      <AdminField
        label="Email"
        id="booking_email"
        type="email"
        maxLength={254}
        value={form.email}
        onChange={set("email")}
      />
      <AdminField
        label="Home suburb"
        id="booking_suburb"
        maxLength={80}
        value={form.suburb}
        onChange={set("suburb")}
      />
      <AdminField
        label="Postcode"
        id="booking_postcode"
        inputMode="numeric"
        pattern="[0-9]{4}"
        maxLength={4}
        title="A 4-digit Australian postcode"
        value={form.postcode}
        onChange={set("postcode")}
      />
      <AdminField
        label="Mobile"
        id="booking_mobile"
        type="tel"
        maxLength={40}
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
        maxLength={40}
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
      {error && (
        <p className="border-l-4 border-crimson bg-crimson/5 p-4 text-base text-ink sm:col-span-2">
          {error}
        </p>
      )}
      <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row">
        <button type="submit" disabled={saving} className={BTN_GOLD}>
          {saving ? "Saving…" : "Save player"}
        </button>
        <button type="button" onClick={onCancel} disabled={saving} className={BTN_NAVY}>
          Cancel
        </button>
      </div>
    </form>
  );
}

// Pick where a player goes: any other tee time with room ("Move here"), or
// trade places with someone in a full one ("Swap with …").
function MovePanel({ booking, slots, bookingsBySlot, saving, error, onMove, onSwap, onCancel }) {
  const others = slots.filter((s) => s.id !== booking.tee_slot_id);
  return (
    <div className="mt-4 border-l-4 border-gold bg-cream p-5 md:p-6">
      <p className="font-display text-lg font-semibold tracking-wide text-navy">
        Move {booking.player_name} to another tee time
      </p>
      <p className="mt-1 text-ink-muted">
        Choose a time with a free spot, or swap places with a player in a full
        time.
      </p>
      <ul className="mt-4 divide-y divide-ink/10 border-y border-ink/10">
        {others.map((slot) => {
          const players = bookingsBySlot[slot.id] ?? [];
          const free = (slot.capacity ?? 0) - players.length;
          return (
            <li
              key={slot.id}
              className="flex flex-wrap items-center justify-between gap-3 py-3"
            >
              <div>
                <p className="text-lg font-bold text-navy">{slot.tee_time}</p>
                <p className="text-sm text-ink-muted">
                  {free > 0
                    ? `${free} ${free === 1 ? "spot" : "spots"} free`
                    : "Full"}
                  {players.length > 0 &&
                    ` · ${players.map((p) => p.player_name).join(", ")}`}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {free > 0 ? (
                  <button
                    onClick={() => onMove(slot)}
                    disabled={saving}
                    className={BTN_GOLD}
                  >
                    Move here
                  </button>
                ) : (
                  players.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => onSwap(p)}
                      disabled={saving}
                      className={BTN_NAVY}
                    >
                      Swap with {p.player_name}
                    </button>
                  ))
                )}
              </div>
            </li>
          );
        })}
      </ul>
      {error && (
        <p className="mt-4 border-l-4 border-crimson bg-crimson/5 p-4 text-base text-ink">
          {error}
        </p>
      )}
      <button onClick={onCancel} disabled={saving} className={`mt-4 ${BTN_NAVY}`}>
        {saving ? "Moving…" : "Cancel"}
      </button>
    </div>
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
  // Which slot is showing the add form, which booking the edit form, and
  // which booking the move panel.
  const [addingSlotId, setAddingSlotId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [movingId, setMovingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);
  const [notice, setNotice] = useState(null);
  // Desktop drag-and-drop: the booking being dragged, and the slot or
  // player it's hovering over.
  const [dragId, setDragId] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);

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

  const bookingsBySlot = {};
  for (const b of bookings) (bookingsBySlot[b.tee_slot_id] ??= []).push(b);
  const slotById = Object.fromEntries(slots.map((s) => [s.id, s]));

  function openPanel({ add = null, edit = null, move = null }) {
    setAddingSlotId(add);
    setEditingId(edit);
    setMovingId(move);
    setFormError(null);
    setRemoveError(null);
    setNotice(null);
  }
  const closeForms = () => {
    openPanel({});
  };

  // Runs a save, refreshes the sheet, and shows a plain-language result.
  async function run(action, success, failure) {
    setFormError(null);
    setRemoveError(null);
    setNotice(null);
    setSaving(true);
    try {
      await action();
      closeForms();
      setNotice(success);
      refresh();
    } catch (err) {
      setFormError(failure(err));
    }
    setSaving(false);
  }

  const connectionError =
    "Couldn't save that. Please check your internet connection and try again.";

  function handleAdd(slot, fields) {
    return run(
      () =>
        createBooking({
          eventId: id,
          teeSlotId: slot.id,
          playerName: fields.player_name,
          email: fields.email,
          suburb: fields.suburb,
          postcode: fields.postcode,
          mobile: fields.mobile,
          gaHandicap: fields.ga_handicap,
          golfLinksNumber: fields.golf_links_number,
          playingInComp: fields.playing_in_comp,
          cartHire: fields.cart_hire,
          onBehalf: true,
        }),
      `${fields.player_name} has been added to the ${slot.tee_time} slot.`,
      (err) =>
        err.code === "slot_full"
          ? "That tee time is already full. Remove or move a player first, or raise the slot's capacity on the event's edit page."
          : err.code === "23514"
            ? "Please check the email address and that the postcode is 4 digits."
            : connectionError
    );
  }

  function handleEdit(booking, fields) {
    return run(
      () => updateBooking(booking.id, fields),
      `${fields.player_name}'s booking has been updated.`,
      (err) =>
        err.code === "23514"
          ? "Please check the email address and that the postcode is 4 digits."
          : connectionError
    );
  }

  function handleMove(booking, slot) {
    return run(
      () => updateBooking(booking.id, { tee_slot_id: slot.id }),
      `${booking.player_name} has been moved to ${slot.tee_time}.`,
      (err) =>
        err.code === "slot_full"
          ? `${slot.tee_time} has just filled up. Try swapping with a player there instead.`
          : connectionError
    );
  }

  function handleSwap(a, b) {
    return run(
      () => swapBookings(a.id, b.id),
      `${a.player_name} (now ${slotById[b.tee_slot_id]?.tee_time}) and ${b.player_name} (now ${slotById[a.tee_slot_id]?.tee_time}) have swapped tee times.`,
      () => connectionError
    );
  }

  // Drag a player onto another slot (moves them if there's room) or onto a
  // player in another slot (swaps the two).
  function handleDrop(target) {
    const dragged = bookings.find((b) => b.id === dragId);
    setDragId(null);
    setDropTarget(null);
    if (!dragged || saving) return;
    if (target.booking) {
      if (target.booking.tee_slot_id !== dragged.tee_slot_id) {
        handleSwap(dragged, target.booking);
      }
      return;
    }
    const slot = target.slot;
    if (slot.id === dragged.tee_slot_id) return;
    const taken = bookingsBySlot[slot.id]?.length ?? 0;
    if (taken >= (slot.capacity ?? 0)) {
      setNotice(null);
      setFormError(null);
      setRemoveError(
        `${slot.tee_time} is full. Drop ${dragged.player_name} onto a player in that time to swap them.`
      );
      return;
    }
    handleMove(dragged, slot);
  }

  const dragProps = (target, key) => ({
    onDragOver: (e) => {
      if (!dragId) return;
      e.preventDefault();
      e.stopPropagation();
      setDropTarget(key);
    },
    onDragLeave: (e) => {
      if (!e.currentTarget.contains(e.relatedTarget)) {
        setDropTarget((t) => (t === key ? null : t));
      }
    },
    onDrop: (e) => {
      e.preventDefault();
      e.stopPropagation();
      handleDrop(target);
    },
  });

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

  // What an unpaid booking owes at the course: green fee plus the extras
  // the player ticked, priced from the event.
  const owedCents = (b) =>
    event
      ? event.greenFeeCents +
        (b.cart_hire ? event.cartFeeCents : 0) +
        (b.playing_in_comp ? event.sideCompCents : 0)
      : 0;

  // The tee sheet as a spreadsheet, one row per player, ordered by tee time.
  function downloadTeeSheet() {
    const rows = [];
    for (const slot of slots) {
      for (const b of bookingsBySlot[slot.id] ?? []) {
        rows.push([
          slot.tee_time,
          b.player_name,
          b.email ?? "",
          b.mobile ?? "",
          b.suburb ?? "",
          b.postcode ?? "",
          b.ga_handicap === true ? "Yes" : b.ga_handicap === false ? "No" : "",
          b.golf_links_number ?? "",
          b.playing_in_comp ? "Yes" : "No",
          b.cart_hire ? "Yes" : "No",
          b.paid_cents ? money(b.paid_cents) : "",
          !b.paid_cents && owedCents(b) > 0 ? money(owedCents(b)) : "",
          b.email_opt_in ? "Yes" : "No",
          b.created_at ? new Date(b.created_at).toLocaleDateString("en-AU") : "",
        ]);
      }
    }
    downloadCsv(
      csvFilename(event?.title ?? "event", "tee sheet"),
      [
        "Tee time",
        "Player",
        "Email",
        "Mobile",
        "Suburb",
        "Postcode",
        "GA handicap",
        "Golf Links number",
        "Side comp",
        "Cart hire",
        "Paid online",
        "Owes at course",
        "Happy to get club emails",
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
      {slots.length > 1 && bookings.length > 0 && (
        <p className="mt-2 hidden text-ink-muted [@media(pointer:fine)]:block">
          Tip: on a computer you can also drag a player onto another tee time
          to move them, or onto another player to swap them.
        </p>
      )}

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
              <button onClick={downloadTeeSheet} className={BTN_NAVY}>
                Download the tee sheet
              </button>
            )}
          </div>
          {bookings.length > 0 && (
            <p className="mt-2 text-sm text-ink-muted">
              The download is a spreadsheet file (CSV) that opens straight into
              Excel, with one row per player. It contains personal details, so
              keep it private and delete it once the event is done.
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

          <div aria-live="polite">
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
            {saving && !movingId && !editingId && !addingSlotId && (
              <p className="mt-6 text-lg text-ink-muted">Saving…</p>
            )}
            {formError && !movingId && !editingId && !addingSlotId && (
              <p className="mt-6 border-l-4 border-crimson bg-crimson/5 p-4 text-base text-ink">
                {formError}
              </p>
            )}
          </div>

          <div className="mt-6 grid gap-6">
            {slots.map((slot) => {
              const slotBookings = bookingsBySlot[slot.id] ?? [];
              const isFull = slotBookings.length >= (slot.capacity ?? 0);
              const slotKey = `slot:${slot.id}`;
              return (
                <section
                  key={slot.id}
                  {...dragProps({ slot }, slotKey)}
                  className={`border-t-4 border-gold bg-paper p-6 shadow-soft transition-shadow md:p-8 ${
                    dropTarget === slotKey ? "ring-2 ring-gold ring-offset-2" : ""
                  }`}
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
                      {slotBookings.map((b) => {
                        const rowKey = `booking:${b.id}`;
                        if (editingId === b.id) {
                          return (
                            <li key={b.id} className="py-4">
                              <PlayerForm
                                heading={`Edit ${b.player_name}'s booking`}
                                booking={b}
                                saving={saving}
                                error={formError}
                                onSave={(fields) => handleEdit(b, fields)}
                                onCancel={closeForms}
                              />
                            </li>
                          );
                        }
                        return (
                          <li
                            key={b.id}
                            draggable={slots.length > 1 && !saving}
                            onDragStart={(e) => {
                              e.dataTransfer.effectAllowed = "move";
                              e.dataTransfer.setData("text/plain", b.player_name);
                              setDragId(b.id);
                            }}
                            onDragEnd={() => {
                              setDragId(null);
                              setDropTarget(null);
                            }}
                            {...dragProps({ booking: b }, rowKey)}
                            className={`py-4 ${
                              slots.length > 1 ? "[@media(pointer:fine)]:cursor-grab" : ""
                            } ${dragId === b.id ? "opacity-50" : ""} ${
                              dropTarget === rowKey && dragId !== b.id
                                ? "bg-gold/10 outline outline-2 outline-gold"
                                : ""
                            }`}
                          >
                            <div className="flex flex-wrap items-start justify-between gap-4">
                              <div className="min-w-0">
                                <p className="text-lg font-bold text-navy">
                                  {b.player_name}
                                </p>
                                <p className="mt-1 break-words text-ink-muted">
                                  Email: {dash(b.email)} · Mobile: {dash(b.mobile)}
                                </p>
                                <p className="mt-0.5 text-ink-muted">
                                  From: {b.suburb || b.postcode
                                    ? [b.suburb, b.postcode].filter(Boolean).join(" ")
                                    : "–"}
                                </p>
                                <p className="mt-0.5 text-ink-muted">
                                  GA handicap: {yesNo(b.ga_handicap)} · Golf
                                  Links no: {dash(b.golf_links_number)}
                                </p>
                                <p className="mt-0.5 text-ink-muted">
                                  Side comp: {yesNo(b.playing_in_comp)} · Cart
                                  hire: {yesNo(b.cart_hire)}
                                </p>
                                <p className="mt-0.5 text-ink-muted">
                                  {b.paid_cents ? (
                                    <span className="font-semibold text-navy">
                                      Paid {money(b.paid_cents)} online
                                    </span>
                                  ) : owedCents(b) > 0 ? (
                                    <>
                                      Pays at the course on the day —{" "}
                                      <span className="font-semibold text-navy">
                                        {money(owedCents(b))} owing
                                      </span>
                                    </>
                                  ) : (
                                    "No fees to pay"
                                  )}
                                </p>
                              </div>
                              {confirmRemoveId === b.id ? (
                                <div className="flex flex-col gap-3">
                                  {b.paid_cents ? (
                                    <p className="max-w-xs text-sm text-ink-muted">
                                      This player paid {money(b.paid_cents)}{" "}
                                      online. Removing the booking does NOT refund
                                      them. Do that in the Square dashboard.
                                    </p>
                                  ) : null}
                                  <div className="flex flex-col gap-3 sm:flex-row">
                                    <button
                                      onClick={() => handleRemove(b.id)}
                                      disabled={removingId === b.id}
                                      className={`${BTN} bg-crimson text-white hover:bg-[#8f1a21]`}
                                    >
                                      {removingId === b.id ? "Removing…" : "Yes, remove"}
                                    </button>
                                    <button
                                      onClick={() => setConfirmRemoveId(null)}
                                      disabled={removingId === b.id}
                                      className={BTN_NAVY}
                                    >
                                      No, keep it
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex flex-wrap gap-3">
                                  {slots.length > 1 && (
                                    <button
                                      onClick={() =>
                                        movingId === b.id
                                          ? closeForms()
                                          : openPanel({ move: b.id })
                                      }
                                      aria-expanded={movingId === b.id}
                                      className={BTN_NAVY}
                                    >
                                      Move
                                    </button>
                                  )}
                                  <button
                                    onClick={() => openPanel({ edit: b.id })}
                                    className={BTN_NAVY}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => setConfirmRemoveId(b.id)}
                                    className={BTN_CRIMSON_OUTLINE}
                                  >
                                    Remove
                                  </button>
                                </div>
                              )}
                            </div>
                            {movingId === b.id && (
                              <MovePanel
                                booking={b}
                                slots={slots}
                                bookingsBySlot={bookingsBySlot}
                                saving={saving}
                                error={formError}
                                onMove={(target) => handleMove(b, target)}
                                onSwap={(other) => handleSwap(b, other)}
                                onCancel={closeForms}
                              />
                            )}
                          </li>
                        );
                      })}
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
                        onClick={() => openPanel({ add: slot.id })}
                        className={`mt-4 ${BTN_NAVY}`}
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
