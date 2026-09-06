import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    "Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. Copy .env.example to .env and fill them in."
  );
}

export const supabase = createClient(url, anonKey);

// Public URL for an object in a public storage bucket (sponsor logos,
// gallery photos). One template, so a storage URL change is a one-line fix.
export const publicStorageUrl = (bucket, path) =>
  `${url.replace(/\/+$/, "")}/storage/v1/object/public/${bucket}/${path}`;

// Upload a file into a public bucket under a unique, URL-safe name built
// from `stem`; returns the stored object path.
export async function uploadToBucket(bucket, file, stem) {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const safeStem =
    stem
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "file";
  const path = `${Date.now()}-${safeStem}.${ext}`;
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: false });
  if (error) throw error;
  return data.path;
}
