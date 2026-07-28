import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../lib/supabase.js";
import { REGIONS } from "../../lib/events.js";
import RibbonRule from "../../components/RibbonRule.jsx";
import AdminField from "./AdminField.jsx";

const STATUS_OPTIONS = [
  { value: "upcoming", label: "Upcoming — taking players" },
  { value: "full", label: "Full — no spots left" },
  { value: "past", label: "Past — already been played" },
];

const emptyForm = {
  title: "",
  region: "brisbane",
  event_date: "",
  venue: "",
  address: "",
  meet_time: "",
  first_tee: "",
  holes: "18",
  green_fee: "",
  side_comp: "",
  status: "upcoming",
  sponsor: "",
  description: "",
};

export default function AdminEventForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
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
        } else {
          setForm({
            title: data.title ?? "",
            region: data.region ?? "brisbane",
            event_date: data.event_date ?? "",
            venue: data.venue ?? "",
            address: data.address ?? "",
            meet_time: data.meet_time ?? "",
            first_tee: data.first_tee ?? "",
            holes: data.holes === null ? "" : String(data.holes),
            green_fee: data.green_fee === null ? "" : String(data.green_fee),
            side_comp: data.side_comp === null ? "" : String(data.side_comp),
            status: data.status ?? "upcoming",
            sponsor: data.sponsor ?? "",
            description: data.description ?? "",
          });
        }
        setLoading(false);
      });
  }, [id, isEdit]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const payload = {
      title: form.title.trim(),
      region: form.region,
      event_date: form.event_date || null,
      venue: form.venue.trim() || null,
      address: form.address.trim() || null,
      meet_time: form.meet_time.trim() || null,
      first_tee: form.first_tee.trim() || null,
      holes: form.holes === "" ? null : Number(form.holes),
      green_fee: form.green_fee === "" ? null : Number(form.green_fee),
      side_comp: form.side_comp === "" ? null : Number(form.side_comp),
      status: form.status,
      sponsor: form.sponsor.trim() || null,
      description: form.description.trim() || null,
    };

    const { error: saveError } = isEdit
      ? await supabase.from("events").update(payload).eq("id", id)
      : await supabase.from("events").insert(payload);

    setSaving(false);
    if (saveError) {
      setError(
        "Couldn't save the event — please check your internet connection and try again."
      );
    } else {
      navigate("/admin", {
        state: { message: isEdit ? "Event saved" : "Event added to the website" },
      });
    }
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
            label="Side comp ($)"
            id="side_comp"
            type="number"
            min="0"
            step="0.01"
            hint="Leave blank if there's no side comp."
            value={form.side_comp}
            onChange={set("side_comp")}
          />
        </div>
        <AdminField
          label="Spots"
          id="status"
          as="select"
          required
          options={STATUS_OPTIONS}
          hint="Change this to 'Full' when the field is full, and to 'Past' after the day has been played."
          value={form.status}
          onChange={set("status")}
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

        {error && (
          <p className="border-l-4 border-crimson bg-crimson/5 p-4 text-base text-ink">
            {error}
          </p>
        )}

        <div className="flex flex-col gap-4 border-t border-ink/10 pt-7 sm:flex-row sm:items-center">
          <button
            type="submit"
            disabled={saving}
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

      {isEdit && (
        <div className="mt-10 border border-crimson/30 bg-paper p-8">
          {confirmDelete ? (
            <>
              <p className="text-lg font-bold text-crimson">
                Delete &ldquo;{form.title}&rdquo; for good?
              </p>
              <p className="mt-1 text-ink-muted">
                It will disappear from the website straight away, and this
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
