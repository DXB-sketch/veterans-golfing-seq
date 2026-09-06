import { useEffect, useRef, useState } from "react";
import { supabase } from "../../lib/supabase.js";
import {
  fetchGalleryPhotos,
  uploadGalleryFile,
  insertGalleryPhoto,
  updateGalleryPhoto,
  deleteGalleryPhoto,
} from "../../lib/gallery.js";
import RibbonRule from "../../components/RibbonRule.jsx";
import AdminField from "./AdminField.jsx";

const PLACEMENT_OPTIONS = [
  { value: "gallery", label: "The gallery page" },
  { value: "home_hero", label: "Gallery + the big photo on the home page" },
  { value: "about", label: "Gallery + the photo on the About page" },
];

const placementBadge = {
  home_hero: "Home page photo",
  about: "About page photo",
};

// Work out landscape vs portrait from the file itself, so the site frames
// the photo correctly without asking the volunteer.
function detectOrientation(file) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img.naturalHeight > img.naturalWidth ? "portrait" : "landscape");
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve("landscape");
    };
    img.src = url;
  });
}

// "gc-open_2026-fourball.jpg" -> "Gc open 2026 fourball" — a starting
// caption the committee is nudged to improve.
function titleFromFilename(name) {
  const stem = name
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]+/g, " ")
    .trim();
  if (!stem) return "Club photo";
  return stem.charAt(0).toUpperCase() + stem.slice(1);
}

// Edit form for one photo's caption, description, event and placement.
function PhotoEditForm({ photo, eventOptions, saving, error, onSave, onCancel }) {
  const [form, setForm] = useState({
    title: photo.title ?? "",
    alt: photo.alt === photo.title ? "" : (photo.alt ?? ""),
    event_id: photo.eventId ?? "",
    placement: photo.placement ?? "gallery",
  });

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  function handleSubmit(e) {
    e.preventDefault();
    onSave({
      title: form.title.trim() || "Club photo",
      alt: form.alt.trim() || null,
      event_id: form.event_id || null,
      placement: form.placement,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 grid gap-5 border-l-4 border-gold bg-cream p-5 md:p-6"
    >
      <AdminField
        label="Caption"
        id={`photo_title_${photo.id}`}
        required
        hint="A few words shown under the photo, e.g. 'Four-ball on the tee'."
        value={form.title}
        onChange={set("title")}
      />
      <AdminField
        label="Describe the photo (optional)"
        id={`photo_alt_${photo.id}`}
        hint="Read aloud to visitors using a screen reader. Leave blank to use the caption."
        value={form.alt}
        onChange={set("alt")}
      />
      <AdminField
        label="Which event is it from?"
        id={`photo_event_${photo.id}`}
        as="select"
        options={eventOptions}
        hint="Linked photos also show in that event's 'from the course' recap."
        value={form.event_id}
        onChange={set("event_id")}
      />
      <AdminField
        label="Where is it used?"
        id={`photo_placement_${photo.id}`}
        as="select"
        options={PLACEMENT_OPTIONS}
        hint="Picking the home page or About page makes this the photo shown there (the newest pick wins)."
        value={form.placement}
        onChange={set("placement")}
      />
      {error && (
        <p className="border-l-4 border-crimson bg-crimson/5 p-4 text-base text-ink">
          {error}
        </p>
      )}
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          disabled={saving}
          className="min-h-[48px] bg-gold px-6 font-body text-base font-bold uppercase tracking-[0.08em] text-navy-deep transition-colors hover:bg-gold-bright disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save photo"}
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

export default function AdminGallery() {
  const [photos, setPhotos] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [files, setFiles] = useState([]);
  const [uploadEventId, setUploadEventId] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const fileInputRef = useRef(null);

  async function loadPhotos() {
    try {
      setPhotos(await fetchGalleryPhotos());
      setLoadError(null);
    } catch {
      setLoadError(
        "Couldn't load the photos. Please check your internet connection and refresh the page."
      );
    }
    setLoading(false);
  }

  useEffect(() => {
    loadPhotos();
    // Events for the "which event" dropdowns, newest first.
    supabase
      .from("events")
      .select("id, title, event_date")
      .order("event_date", { ascending: false, nullsFirst: false })
      .then(({ data }) => setEvents(data ?? []));
  }, []);

  const eventOptions = [
    { value: "", label: "Not from an event" },
    ...events.map((e) => ({
      value: e.id,
      label: e.event_date ? `${e.title} (${e.event_date})` : e.title,
    })),
  ];
  const eventTitle = (eventId) =>
    events.find((e) => e.id === eventId)?.title ?? null;

  async function handleUpload(e) {
    e.preventDefault();
    if (files.length === 0) return;
    setNotice(null);
    setFormError(null);
    setUploading(true);

    let added = 0;
    let failed = 0;
    for (let i = 0; i < files.length; i += 1) {
      const file = files[i];
      setUploadProgress(`Uploading photo ${i + 1} of ${files.length}…`);
      try {
        const orientation = await detectOrientation(file);
        const path = await uploadGalleryFile(file);
        await insertGalleryPhoto({
          image_path: path,
          title: titleFromFilename(file.name),
          orientation,
          event_id: uploadEventId || null,
          placement: "gallery",
        });
        added += 1;
      } catch {
        failed += 1;
      }
    }

    setUploading(false);
    setUploadProgress(null);
    setFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (added > 0) {
      setNotice(
        `${added} photo${added === 1 ? "" : "s"} added — ${added === 1 ? "it's" : "they're"} live in the gallery now. Press Edit under a photo to improve its caption.`
      );
    }
    if (failed > 0) {
      setFormError(
        `${failed} photo${failed === 1 ? "" : "s"} couldn't be uploaded. Please check ${failed === 1 ? "it's" : "they're"} image files (JPG or PNG) and try again.`
      );
    }
    loadPhotos();
  }

  async function handleEdit(photo, fields) {
    setFormError(null);
    setSaving(true);
    try {
      // The home hero / About slots have one holder each: taking a slot
      // demotes whoever held it, so a later edit to the old photo can't
      // silently steal the slot back (the site picks the newest updated).
      if (fields.placement !== "gallery") {
        await supabase
          .from("gallery_photos")
          .update({ placement: "gallery" })
          .eq("placement", fields.placement)
          .neq("id", photo.id);
      }
      await updateGalleryPhoto(photo.id, fields);
      setNotice("Photo saved.");
      setEditingId(null);
      loadPhotos();
    } catch {
      setFormError(
        "Couldn't save the photo. Please check your internet connection and try again."
      );
    }
    setSaving(false);
  }

  // Show or hide a photo everywhere on the public website.
  async function toggleShown(photo) {
    setNotice(null);
    setFormError(null);
    setTogglingId(photo.id);
    try {
      await updateGalleryPhoto(photo.id, { is_published: !photo.isPublished });
      setNotice(
        photo.isPublished
          ? "The photo is now hidden from the website."
          : "The photo is now shown on the website."
      );
      loadPhotos();
    } catch {
      setFormError(
        "Couldn't change that photo. Please check your internet connection and try again."
      );
    }
    setTogglingId(null);
  }

  async function handleDelete(photo) {
    setNotice(null);
    setFormError(null);
    setDeletingId(photo.id);
    try {
      await deleteGalleryPhoto(photo);
      setNotice("The photo has been deleted.");
      loadPhotos();
    } catch {
      setFormError(
        "Couldn't delete the photo. Please check your internet connection and try again."
      );
    }
    setDeletingId(null);
    setConfirmDeleteId(null);
  }

  if (loading) {
    return <p className="text-lg text-ink-muted">Loading the photos…</p>;
  }

  return (
    <div>
      <h2 className="font-display text-2xl font-semibold tracking-wide text-navy">
        Photos
      </h2>
      <RibbonRule className="mt-3" />
      <p className="mt-3 max-w-3xl text-ink-muted">
        These photos make up the website&apos;s gallery, and the pictures on
        the home and About pages. Anything you add here goes live straight
        away. Before uploading, make sure anyone recognisable in a photo is
        happy to be on the website.
      </p>

      {notice && (
        <p className="mt-6 border-l-4 border-gold bg-gold/10 p-4 text-lg font-semibold text-navy">
          ✓ {notice}
        </p>
      )}
      {/* While an edit form is open it shows this error itself. */}
      {formError && !editingId && (
        <p className="mt-6 border-l-4 border-crimson bg-crimson/5 p-4 text-base text-ink">
          {formError}
        </p>
      )}

      {/* Upload */}
      <form
        onSubmit={handleUpload}
        className="mt-8 grid max-w-3xl gap-7 border-t-4 border-gold bg-paper p-8 shadow-soft md:p-10"
      >
        <h3 className="font-display text-xl font-semibold tracking-wide text-navy">
          Add photos
        </h3>
        <AdminField
          label="Which event are they from?"
          id="upload_event"
          as="select"
          options={eventOptions}
          hint="Optional. Linked photos also show in that event's 'from the course' recap once the day has been played."
          value={uploadEventId}
          onChange={(e) => setUploadEventId(e.target.value)}
        />
        <div>
          <label
            htmlFor="upload_files"
            className="block font-body text-base font-bold text-navy"
          >
            Photos
          </label>
          <p className="mt-0.5 text-sm text-ink-muted">
            JPG or PNG files. You can pick several at once.
          </p>
          <input
            ref={fileInputRef}
            id="upload_files"
            type="file"
            accept="image/*"
            multiple
            onChange={(e) =>
              setFiles(
                Array.from(e.target.files ?? []).filter((f) =>
                  f.type.startsWith("image/")
                )
              )
            }
            className="mt-2 w-full text-base text-ink file:mr-4 file:min-h-[48px] file:cursor-pointer file:border-2 file:border-navy file:bg-paper file:px-6 file:font-body file:text-base file:font-bold file:uppercase file:tracking-[0.08em] file:text-navy"
          />
        </div>
        {uploadProgress && (
          <p className="text-base font-semibold text-navy">{uploadProgress}</p>
        )}
        <div>
          <button
            type="submit"
            disabled={uploading || files.length === 0}
            className="min-h-[56px] bg-gold px-10 font-body text-base font-bold uppercase tracking-[0.08em] text-navy-deep transition-colors hover:bg-gold-bright disabled:opacity-60"
          >
            {uploading
              ? "Uploading…"
              : files.length > 1
                ? `Upload ${files.length} photos`
                : "Upload photo"}
          </button>
        </div>
      </form>

      {/* The library */}
      {loadError ? (
        <p className="mt-10 text-lg text-ink-muted">{loadError}</p>
      ) : photos.length === 0 ? (
        <div className="mt-10 border border-dashed border-ink/25 bg-paper p-10 text-center">
          <p className="text-lg font-semibold text-navy">No photos yet</p>
          <p className="mt-1 text-ink-muted">
            Use the form above to add the first ones.
          </p>
        </div>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map((photo) => {
            const badges = [
              !photo.isPublished && "Hidden from the website",
              placementBadge[photo.placement],
              photo.eventId && eventTitle(photo.eventId),
            ].filter(Boolean);
            return (
              <div
                key={photo.id}
                className="flex flex-col border border-ink/10 bg-paper shadow-soft"
              >
                <div className="relative aspect-[3/2] overflow-hidden bg-navy">
                  <img
                    src={photo.src}
                    alt={photo.alt}
                    loading="lazy"
                    className={`absolute inset-0 h-full w-full object-cover object-top ${
                      photo.isPublished ? "" : "opacity-50"
                    }`}
                  />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <p className="font-semibold text-navy">{photo.title}</p>
                  {badges.length > 0 && (
                    <p className="mt-2 flex flex-wrap gap-2">
                      {badges.map((b) => (
                        <span
                          key={b}
                          className="border border-navy px-2 py-0.5 text-xs font-bold uppercase tracking-[0.08em] text-navy"
                        >
                          {b}
                        </span>
                      ))}
                    </p>
                  )}

                  {editingId === photo.id ? (
                    <PhotoEditForm
                      photo={photo}
                      eventOptions={eventOptions}
                      saving={saving}
                      error={formError}
                      onSave={(fields) => handleEdit(photo, fields)}
                      onCancel={() => setEditingId(null)}
                    />
                  ) : confirmDeleteId === photo.id ? (
                    <div className="mt-4 border-l-4 border-crimson bg-crimson/5 p-4">
                      <p className="font-bold text-navy">
                        Delete this photo for good?
                      </p>
                      <p className="mt-1 text-sm text-ink-muted">
                        It disappears from the website straight away and cannot
                        be brought back.
                      </p>
                      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                        <button
                          onClick={() => handleDelete(photo)}
                          disabled={deletingId === photo.id}
                          className="min-h-[48px] bg-crimson px-5 font-body text-sm font-bold uppercase tracking-[0.08em] text-white transition-colors hover:bg-[#8f1a21] disabled:opacity-60"
                        >
                          {deletingId === photo.id ? "Deleting…" : "Yes, delete"}
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          disabled={deletingId === photo.id}
                          className="min-h-[48px] border-2 border-navy px-5 font-body text-sm font-bold uppercase tracking-[0.08em] text-navy transition-colors hover:bg-navy/5"
                        >
                          No, keep it
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 flex flex-wrap gap-3 pt-1">
                      <button
                        onClick={() => {
                          setEditingId(photo.id);
                          setConfirmDeleteId(null);
                          setFormError(null);
                          setNotice(null);
                        }}
                        className="min-h-[48px] border-2 border-navy px-5 font-body text-sm font-bold uppercase tracking-[0.08em] text-navy transition-colors hover:bg-navy hover:text-white"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => toggleShown(photo)}
                        disabled={togglingId === photo.id}
                        className="min-h-[48px] border-2 border-navy px-5 font-body text-sm font-bold uppercase tracking-[0.08em] text-navy transition-colors hover:bg-navy/5 disabled:opacity-60"
                      >
                        {togglingId === photo.id
                          ? "Saving…"
                          : photo.isPublished
                            ? "Hide"
                            : "Show"}
                      </button>
                      <button
                        onClick={() => {
                          setConfirmDeleteId(photo.id);
                          setEditingId(null);
                        }}
                        className="min-h-[48px] border-2 border-crimson px-5 font-body text-sm font-bold uppercase tracking-[0.08em] text-crimson transition-colors hover:bg-crimson hover:text-white"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
