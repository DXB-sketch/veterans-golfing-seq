import { supabase, publicStorageUrl, uploadToBucket } from "./supabase.js";

// Committee-managed photos: the gallery_photos table plus the public
// 'gallery' storage bucket. A row points either at a bucket object
// (image_path — committee uploads) or at a file committed to public/
// (legacy_src — the original album that shipped with the site).

function photoSrc(row) {
  if (row.legacy_src) return row.legacy_src;
  return row.image_path ? publicStorageUrl("gallery", row.image_path) : null;
}

function mapPhoto(row) {
  return {
    id: row.id,
    src: photoSrc(row),
    title: row.title,
    // Site-wide rule: every image gets alt text; the caption fills in when
    // no separate description was written.
    alt: row.alt || row.title,
    orientation: row.orientation || "landscape",
    placement: row.placement || "gallery",
    eventId: row.event_id,
    isPublished: row.is_published !== false,
    imagePath: row.image_path,
    legacySrc: row.legacy_src,
    sortOrder: row.sort_order ?? 0,
    createdAt: row.created_at,
  };
}

// All rows the caller is allowed to see (RLS hides unpublished photos from
// the public; the committee sees everything). New uploads (sort_order 0)
// lead, newest first; the seeded originals keep their manifest order after.
export async function fetchGalleryPhotos() {
  const { data, error } = await supabase
    .from("gallery_photos")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapPhoto).filter((p) => p.src);
}

// The published photo chosen for a fixed slot ('home_hero' | 'about').
// Most recently updated wins, so re-assigning the slot just works.
export async function fetchPlacementPhoto(placement) {
  const { data, error } = await supabase
    .from("gallery_photos")
    .select("*")
    .eq("placement", placement)
    .eq("is_published", true)
    .order("updated_at", { ascending: false })
    .limit(1);
  if (error) throw error;
  const photo = data?.[0] ? mapPhoto(data[0]) : null;
  return photo?.src ? photo : null;
}

// Published photos linked to an event, for the "from the course" recap.
export async function fetchEventPhotos(eventId) {
  const { data, error } = await supabase
    .from("gallery_photos")
    .select("*")
    .eq("event_id", eventId)
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapPhoto).filter((p) => p.src);
}

// --- Committee-only writes (RLS enforces the role) -------------------------

export const uploadGalleryFile = (file) =>
  uploadToBucket("gallery", file, file.name.replace(/\.[^.]+$/, "") || "photo");

export async function insertGalleryPhoto(fields) {
  const { error } = await supabase.from("gallery_photos").insert(fields);
  if (error) throw error;
}

export async function updateGalleryPhoto(id, fields) {
  const { error } = await supabase
    .from("gallery_photos")
    .update(fields)
    .eq("id", id);
  if (error) throw error;
}

// Removes the row, then the uploaded file (if any). A failed file cleanup is
// harmless — the photo is already off the site — so it doesn't surface.
export async function deleteGalleryPhoto(photo) {
  const { error } = await supabase
    .from("gallery_photos")
    .delete()
    .eq("id", photo.id);
  if (error) throw error;
  if (photo.imagePath) {
    await supabase.storage
      .from("gallery")
      .remove([photo.imagePath])
      .catch(() => {});
  }
}
