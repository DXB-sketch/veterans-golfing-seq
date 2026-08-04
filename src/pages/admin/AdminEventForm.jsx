import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../lib/supabase.js";
import { REGIONS } from "../../lib/events.js";
import { fetchTeeSlots, syncTeeSlots } from "../../lib/bookings.js";
import RibbonRule from "../../components/RibbonRule.jsx";
import AdminField from "./AdminField.jsx";

const SPOTS_OPTIONS = [
  { value: "open", label: "Taking players" },
  { value: "full", label: "Full — no spots left" },
];

const emptyForm = {
  title: "",
  region: "brisbane",
  event_date: "",
  venue: "",
  course: "",
  address: "",
  meet_time: "",
  first_tee: "",
  holes: "18",
  green_fee: "",
  cart_fee: "",
  side_comp: "",
  side_comp_note: "",
  spots: "open",
  sponsor: "",
  description: "",
};

const emptySlot = { id: null, tee_time: "", capacity: "4" };

export default function AdminEventForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  // Lifecycle: 'draft' | 'published' | 'completed'. New events start as drafts.
  const [lifecycle, setLifecycle] = useState("draft");
  const [isLocked, setIsLocked] = useState(false);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [confirmPublish, setConfirmPublish] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  // One-time unlock for editing a published event's tee slots. Component
  // state on purpose: leaving the event resets it, so the confirmation is
  // asked again next time this event is opened.
  const [slotsUnlocked, setSlotsUnlocked] = useState(false);
  const [confirmSlotEdit, setConfirmSlotEdit] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isEdit) return;
    supabase
      .from("events")
      .select("*")
      .eq("id", id)
      .maybeSingle()
      .then(({ data, error: loadError }) => {
        if (loadError || !data) {
          setError("Couldn't load this event. Go back and try again.");
          setLoading(false);
          return;
        }
        setForm({
          title: data.title ?? "",
          region: data.region ?? "brisbane",
          event_date: data.event_date ?? "",
          venue: data.venue ?? "",
          course: data.course ?? "",
          address: data.address ?? "",
          meet_time: data.meet_time ?? "",
          first_tee: data.first_tee ?? "",
          holes: data.holes === null ? "" : String(data.holes),
          green_fee: data.green_fee === null ? "" : String(data.green_fee),
          cart_fee: data.cart_fee === null ? "" : String(data.cart_fee),
          side_comp: data.side_comp === null ? "" : String(data.side_comp),
          side_comp_note: data.side_comp_note ?? "",
          spots: data.is_full ? "full" : "open",
          sponsor: data.sponsor ?? "",
          description: data.description ?? "",
        });
        setLifecycle(data.status ?? "draft");
        setIsLocked(Boolean(data.is_locked));
        // Load the event's tee slots too (shown as editable for drafts,
        // read-only once the event is published and locked).
        fetchTeeSlots(id)
          .then((rows) =>
            setSlots(
              rows.map((s) => ({
                id: s.id,
                tee_time: s.tee_time ?? "",
                capacity: s.capacity === null ? "4" : String(s.capacity),
              }))
            )
          )
          .catch(() => {
            // Slots failing to load shouldn't block editing the event itself.
          })
          .finally(() => setLoading(false));
      });
  }, [id, isEdit]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const setSlot = (index, key) => (e) => {
    const value = e.target.value;
    setSlots((list) =>
      list.map((s, i) => (i === index ? { ...s, [key]: value } : s))
    );
  };

  const addSlot = () => setSlots((list) => [...list, { ...emptySlot }]);
  const removeSlot = (index) =>
    setSlots((list) => list.filter((_, i) => i !== index));

  // Tee slots are freely editable while the event is a draft. Once it's
  // published (locked) they can still be edited, but only after the admin
  // confirms once — the unlock lasts until they leave this event.
  const slotsEditable = !isEdit || !isLocked || slotsUnlocked;

  // Blank rows are simply ignored, so a stray "Add a tee slot" click is harmless.
  // sort_order follows the on-screen order — times like "10:04am" would sort
  // before "8:24am" alphabetically otherwise.
  const cleanSlots = () =>
    slots
      .filter((s) => s.tee_time.trim() !== "")
      .map((s, index) => ({
        id: s.id ?? null,
        tee_time: s.tee_time.trim(),
        capacity: s.capacity === "" ? 4 : Number(s.capacity),
        sort_order: index + 1,
      }));

  function buildPayload() {
    return {
      title: form.title.trim(),
      region: form.region,
      event_date: form.event_date || null,
      venue: form.venue.trim() || null,
      course: form.course.trim() || null,
      address: form.address.trim() || null,
      meet_time: form.meet_time.trim() || null,
      first_tee: form.first_tee.trim() || null,
      holes: form.holes === "" ? null : Number(form.holes),
      green_fee: form.green_fee === "" ? null : Number(form.green_fee),
      cart_fee: form.cart_fee === "" ? null : Number(form.cart_fee),
      side_comp: form.side_comp === "" ? null : Number(form.side_comp),
      side_comp_note: form.side_comp_note.trim() || null,
      is_full: form.spots === "full",
      sponsor: form.sponsor.trim() || null,
      description: form.description.trim() || null,
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const payload = buildPayload();

    try {
      if (isEdit) {
        const { error: saveError } = await supabase
          .from("events")
          .update(payload)
          .eq("id", id);
        if (saveError) throw saveError;
        if (slotsEditable) await syncTeeSlots(id, cleanSlots());
      } else {
        // New events are saved as drafts — insert first so we get an id
        // back, then attach the tee slots to it.
        const { data: inserted, error: saveError } = await supabase
          .from("events")
          .insert({ ...payload, status: "draft" })
          .select()
          .single();
        if (saveError || !inserted) throw saveError ?? new Error("insert failed");
        await syncTeeSlots(inserted.id, cleanSlots());
      }
    } catch {
      setSaving(false);
      setError(
        "Couldn't save the event — please check your internet connection and try again."
      );
      return;
    }

    setSaving(false);
    navigate("/admin", {
      state: {
        message: isEdit ? "Event saved" : "Event saved as a draft",
      },
    });
  }

  async function handlePublish() {
    setError(null);
    setPublishing(true);

    try {
      // Save the tee slots while the event is still a draft, then flip it
      // live and freeze them — so a half-failed publish never leaves a live
      // event with a broken tee sheet.
      await syncTeeSlots(id, cleanSlots());
      const { error: saveError } = await supabase
        .from("events")
        .update({ ...buildPayload(), status: "published", is_locked: true })
        .eq("id", id);
      if (saveError) throw saveError;
    } catch {
      setPublishing(false);
      setConfirmPublish(false);
      setError(
        "Couldn't publish the event — please check your internet connection and try again."
      );
      return;
    }

    setPublishing(false);
    navigate("/admin", {
      state: { message: "Event published — it's live on the website now" },
    });
  }

  async function handleDelete() {
    setError(null);
    setDeleting(true);
    const { error: deleteError } = await supabase
      .from("events")
      .delete()
      .eq("id", id);
    setDeleting(false);
    if (deleteError) {
      setConfirmDelete(false);
      setError(
        "Couldn't delete the event — please check your internet connection and try again."
      );
    } else {
      navigate("/admin", { state: { message: "Event deleted" } });
    }
  }

  if (loading) {
    return <p className="text-lg text-ink-muted">Loading the event…</p>;
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        to="/admin"
        className="text-base font-semibold text-navy underline decoration-gold decoration-2 underline-offset-4 hover:text-crimson"
      >
        &larr; Back to your events
      </Link>

      <h2 className="mt-4 font-display text-2xl font-semibold tracking-wide text-navy">
        {isEdit ? "Edit this event" : "Add a new event"}
      </h2>
      <RibbonRule className="mt-3" />
      <p className="mt-3 text-ink-muted">
        Fill in what you know — anything you leave blank will simply show as
        &ldquo;TBC&rdquo; on the website, and you can come back and add it
        later.
      </p>
      {lifecycle === "draft" && (
        <p className="mt-3 border-l-4 border-gold bg-gold/10 p-4 text-base text-ink">
          This event is a <strong>draft</strong> — it is NOT shown on the
          website until you publish it. Take your time getting it right.
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-8 grid gap-7 border-t-4 border-gold bg-paper p-8 shadow-soft md:p-10">
        <AdminField
          label="Event name"
          id="title"
          required
          hint="e.g. Gold Coast Open Day"
          value={form.title}
          onChange={set("title")}
        />
        <div className="grid gap-7 sm:grid-cols-2">
          <AdminField
            label="Region"
            id="region"
            as="select"
            required
            options={REGIONS}
            value={form.region}
            onChange={set("region")}
          />
          <AdminField
            label="Event date"
            id="event_date"
            type="date"
            hint="Leave blank if the date isn't locked in yet."
            value={form.event_date}
            onChange={set("event_date")}
          />
        </div>
        <AdminField
          label="Golf course / venue"
          id="venue"
          hint="e.g. Palmer Gold Coast Golf Course"
          value={form.venue}
          onChange={set("venue")}
        />
        <AdminField
          label="Course"
          id="course"
          hint="e.g. Old Course — leave blank if the club has just one course"
          value={form.course}
          onChange={set("course")}
        />
        <AdminField
          label="Address"
          id="address"
          hint="Street and suburb, e.g. Ron Penhaligon Way, Robina QLD"
          value={form.address}
          onChange={set("address")}
        />
        <div className="grid gap-7 sm:grid-cols-2">
          <AdminField
            label="Meet time"
            id="meet_time"
            hint="e.g. 8:30am"
            value={form.meet_time}
            onChange={set("meet_time")}
          />
          <AdminField
            label="First tee time"
            id="first_tee"
            hint="e.g. 9:04am"
            value={form.first_tee}
            onChange={set("first_tee")}
          />
        </div>
        <div className="grid gap-7 sm:grid-cols-3">
          <AdminField
            label="Holes"
            id="holes"
            type="number"
            min="1"
            value={form.holes}
            onChange={set("holes")}
          />
          <AdminField
            label="Green fee ($)"
            id="green_fee"
            type="number"
            min="0"
            step="0.01"
            hint="Just the number, e.g. 115"
            value={form.green_fee}
            onChange={set("green_fee")}
          />
          <AdminField
            label="Cart hire ($)"
            id="cart_fee"
            type="number"
            min="0"
            step="0.01"
            hint="Leave blank if carts aren't offered."
            value={form.cart_fee}
            onChange={set("cart_fee")}
          />
        </div>
        <div className="grid gap-7 sm:grid-cols-2">
          <AdminField
            label="Side comp ($)"
            id="side_comp"
            type="number"
            min="0"
            step="0.01"
            hint="Leave blank if there's no side comp."
            value={form.side_comp}
            onChange={set("side_comp")}
          />
          <AdminField
            label="Side comp note"
            id="side_comp_note"
            hint="e.g. Handicap members only"
            value={form.side_comp_note}
            onChange={set("side_comp_note")}
          />
        </div>
        <AdminField
          label="Spots"
          id="spots"
          as="select"
          required
          options={SPOTS_OPTIONS}
          hint="Only change this to 'Full' when the field is full. The website works out upcoming / on now / finalised by itself from the event date and times (Queensland time)."
          value={form.spots}
          onChange={set("spots")}
        />
        <AdminField
          label="Event sponsor"
          id="sponsor"
          hint="Leave blank if there isn't one."
          value={form.sponsor}
          onChange={set("sponsor")}
        />
        <AdminField
          label="About this event"
          id="description"
          as="textarea"
          hint="A few friendly sentences about the day. This shows on the event's page."
          value={form.description}
          onChange={set("description")}
        />

        <div className="border-t border-ink/10 pt-7">
          <p className="font-body text-base font-bold text-navy">Tee slots</p>
          {slotsEditable ? (
            <>
              <p className="mt-0.5 text-sm text-ink-muted">
                Add a row for each tee time and how many players fit in it
                (usually 4). Players will book into these slots once the event
                is published.
              </p>
              {isLocked && slotsUnlocked && (
                <p className="mt-3 border-l-4 border-gold bg-gold/10 p-4 text-base text-ink">
                  You&rsquo;re editing the tee slots of a <strong>published</strong>{" "}
                  event. Removing a slot also removes any bookings players have
                  made on it. Changes take effect when you save the event.
                </p>
              )}
              <div className="mt-4 grid gap-3">
                {slots.length === 0 && (
                  <p className="text-base text-ink-muted">
                    No tee slots yet — press &ldquo;Add a tee slot&rdquo; to
                    start.
                  </p>
                )}
                {slots.map((slot, index) => (
                  <div key={index} className="flex flex-col gap-3 sm:flex-row sm:items-end">
                    <div className="flex-1">
                      <label
                        htmlFor={`slot_time_${index}`}
                        className="block text-sm font-bold text-navy"
                      >
                        Tee time
                      </label>
                      <input
                        id={`slot_time_${index}`}
                        placeholder="e.g. 8:24am"
                        value={slot.tee_time}
                        onChange={setSlot(index, "tee_time")}
                        className="mt-1 w-full min-h-[52px] border border-ink/25 bg-paper px-4 py-3 text-lg text-ink placeholder:text-ink-muted/50 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/50"
                      />
                    </div>
                    <div className="sm:w-36">
                      <label
                        htmlFor={`slot_capacity_${index}`}
                        className="block text-sm font-bold text-navy"
                      >
                        Players
                      </label>
                      <input
                        id={`slot_capacity_${index}`}
                        type="number"
                        min="1"
                        value={slot.capacity}
                        onChange={setSlot(index, "capacity")}
                        className="mt-1 w-full min-h-[52px] border border-ink/25 bg-paper px-4 py-3 text-lg text-ink focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/50"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSlot(index)}
                      className="min-h-[52px] border-2 border-crimson px-6 font-body text-base font-bold uppercase tracking-[0.08em] text-crimson transition-colors hover:bg-crimson hover:text-white"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addSlot}
                className="mt-4 min-h-[52px] border-2 border-navy px-8 font-body text-base font-bold uppercase tracking-[0.08em] text-navy transition-colors hover:bg-navy/5"
              >
                Add a tee slot
              </button>
            </>
          ) : (
            <>
              <p className="mt-0.5 text-sm text-ink-muted">
                The tee slots are locked because the event is published and
                bookings may exist. Everything else on this page can still be
                changed and saved.
              </p>
              {slots.length === 0 ? (
                <p className="mt-3 text-base text-ink-muted">
                  This event has no tee slots.
                </p>
              ) : (
                <ul className="mt-3 grid gap-2">
                  {slots.map((slot, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-between border border-ink/15 bg-cream px-4 py-3 text-lg text-ink"
                    >
                      <span className="font-semibold">{slot.tee_time}</span>
                      <span className="text-ink-muted">
                        {slot.capacity} players
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              {confirmSlotEdit ? (
                <div className="mt-5 border-l-4 border-crimson bg-crimson/5 p-5">
                  <p className="text-lg font-bold text-navy">
                    Change the tee slots on a published event?
                  </p>
                  <p className="mt-1 text-ink-muted">
                    This event is live and players may have already booked.
                    Changing a slot&rsquo;s time keeps its bookings, but{" "}
                    <strong>removing a slot also removes any bookings on
                    it</strong> — you&rsquo;ll need to let those players know.
                    You&rsquo;ll only be asked this once: the slots stay
                    editable until you leave this event.
                  </p>
                  <div className="mt-5 flex flex-col gap-4 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => {
                        setSlotsUnlocked(true);
                        setConfirmSlotEdit(false);
                      }}
                      className="min-h-[52px] bg-gold px-8 font-body text-base font-bold uppercase tracking-[0.08em] text-navy-deep transition-colors hover:bg-gold-bright"
                    >
                      Yes, let me edit them
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmSlotEdit(false)}
                      className="min-h-[52px] border-2 border-navy px-8 font-body text-base font-bold uppercase tracking-[0.08em] text-navy transition-colors hover:bg-navy/5"
                    >
                      No, keep them locked
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmSlotEdit(true)}
                  className="mt-4 min-h-[52px] border-2 border-navy px-8 font-body text-base font-bold uppercase tracking-[0.08em] text-navy transition-colors hover:bg-navy/5"
                >
                  Edit the tee slots
                </button>
              )}
            </>
          )}
        </div>

        {error && (
          <p className="border-l-4 border-crimson bg-crimson/5 p-4 text-base text-ink">
            {error}
          </p>
        )}

        <div className="flex flex-col gap-4 border-t border-ink/10 pt-7 sm:flex-row sm:items-center">
          <button
            type="submit"
            disabled={saving || publishing}
            className="min-h-[56px] bg-gold px-10 font-body text-base font-bold uppercase tracking-[0.08em] text-navy-deep transition-colors hover:bg-gold-bright disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save event"}
          </button>
          <Link
            to="/admin"
            className="inline-flex min-h-[56px] items-center justify-center border-2 border-navy px-10 font-body text-base font-bold uppercase tracking-[0.08em] text-navy transition-colors hover:bg-navy/5"
          >
            Cancel
          </Link>
        </div>
      </form>

      {isEdit && lifecycle === "draft" && (
        <div className="mt-10 border-t-4 border-gold bg-paper p-8 shadow-soft">
          {confirmPublish ? (
            <>
              <p className="text-lg font-bold text-navy">
                Ready to put &ldquo;{form.title}&rdquo; live on the website?
              </p>
              <p className="mt-1 text-ink-muted">
                Publishing puts the event on the website for everyone to see,
                opens bookings, and locks the tee slots — changing them after
                this will ask you to confirm first, because players may have
                booked into them. Any changes on the form above are saved as
                part of publishing.
                {cleanSlots().length === 0 &&
                  " Heads up: this event has NO tee slots yet, so players won't be able to book a time."}
              </p>
              <div className="mt-5 flex flex-col gap-4 sm:flex-row">
                <button
                  onClick={handlePublish}
                  disabled={publishing}
                  className="min-h-[52px] bg-gold px-8 font-body text-base font-bold uppercase tracking-[0.08em] text-navy-deep transition-colors hover:bg-gold-bright disabled:opacity-60"
                >
                  {publishing ? "Publishing…" : "Yes, publish it"}
                </button>
                <button
                  onClick={() => setConfirmPublish(false)}
                  disabled={publishing}
                  className="min-h-[52px] border-2 border-navy px-8 font-body text-base font-bold uppercase tracking-[0.08em] text-navy transition-colors hover:bg-navy/5"
                >
                  Not yet, keep it as a draft
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="font-semibold text-ink">
                Happy with everything? Publish the event so members can see it
                and book a tee slot.
              </p>
              <button
                onClick={() => setConfirmPublish(true)}
                className="mt-4 min-h-[56px] bg-gold px-10 font-body text-base font-bold uppercase tracking-[0.08em] text-navy-deep transition-colors hover:bg-gold-bright"
              >
                Publish &amp; lock
              </button>
            </>
          )}
        </div>
      )}

      {isEdit && (
        <div className="mt-10 border border-crimson/30 bg-paper p-8">
          {confirmDelete ? (
            <>
              <p className="text-lg font-bold text-crimson">
                Delete &ldquo;{form.title}&rdquo; for good?
              </p>
              <p className="mt-1 text-ink-muted">
                It will disappear from the website straight away, along with
                its tee slots and any bookings players have made, and this
                cannot be undone.
              </p>
              <div className="mt-5 flex flex-col gap-4 sm:flex-row">
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="min-h-[52px] bg-crimson px-8 font-body text-base font-bold uppercase tracking-[0.08em] text-white transition-colors hover:bg-[#8f1a21] disabled:opacity-60"
                >
                  {deleting ? "Deleting…" : "Yes, delete it"}
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="min-h-[52px] border-2 border-navy px-8 font-body text-base font-bold uppercase tracking-[0.08em] text-navy transition-colors hover:bg-navy/5"
                >
                  No, keep it
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="font-semibold text-ink">
                Need to remove this event from the website altogether?
              </p>
              <button
                onClick={() => setConfirmDelete(true)}
                className="mt-4 min-h-[52px] border-2 border-crimson px-8 font-body text-base font-bold uppercase tracking-[0.08em] text-crimson transition-colors hover:bg-crimson hover:text-white"
              >
                Delete this event
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
