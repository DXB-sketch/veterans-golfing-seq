import { FACEBOOK_URL } from "./site.js";
import gcOpenManifest from "../../public/images/events/gold-coast-open-2026/captions.json";

// Event photo albums live in public/images/events/<slug>/ with a captions.json
// manifest (title, alt, orientation, role, faces, consent). Photos are always
// placed by their manifest role, never guessed.

function withSrc(slug, manifest) {
  return manifest.map((p) => ({ ...p, src: `/images/events/${slug}/${p.file}` }));
}

// Identifiable faces stay off the site until the club has cleared them.
// "partial" faces (from behind, under a cap) are fine per the brief.
const publishable = (p) => !(p.faces === "yes" && p.consent !== "granted");

const ALBUMS = [
  {
    slug: "gold-coast-open-2026",
    // Matches the Supabase event row: albums are keyed on region + date so
    // renaming the event in admin doesn't orphan its photos.
    match: { region: "gold_coast", date: "2026-07-31" },
    facebookUrl: FACEBOOK_URL,
    photos: withSrc("gold-coast-open-2026", gcOpenManifest).filter(publishable),
  },
];

export function albumForEvent(event) {
  return (
    ALBUMS.find(
      (a) => a.match.region === event.regionValue && a.match.date === event.date
    ) ?? null
  );
}

export const photoByFile = (album, file) =>
  album.photos.find((p) => p.file === file) ?? null;

// Every publishable photo across all albums, for the Gallery page.
export const allPhotos = () => ALBUMS.flatMap((a) => a.photos);

// Named picks for fixed slots (hero, About). Null if consent pulls them.
const gcOpen = ALBUMS[0];
export const heroPhoto = photoByFile(gcOpen, "gc-open-2026-fourball-wide.jpg");
export const groupPhoto = photoByFile(gcOpen, "gc-open-2026-group-banner.jpg");
