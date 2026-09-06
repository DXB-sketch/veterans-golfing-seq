import { useCallback, useEffect, useState } from "react";
import {
  fetchGalleryPhotos,
  fetchPlacementPhoto,
  fetchEventPhotos,
} from "../lib/gallery.js";

// Live photo list. `initial` (the bundled legacy photos) renders immediately
// and is replaced by whatever the database says — including an empty set, so
// a photo the committee hides or deletes really disappears. Only a FAILED
// fetch keeps the bundled set, so the page never breaks over a fetch.
export function useGalleryPhotos(initial = []) {
  const [photos, setPhotos] = useState(initial);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetchGalleryPhotos()
      .then((data) => {
        if (!cancelled) setPhotos(data);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [tick]);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  return { photos, loading, refresh };
}

// The committee-chosen photo for a fixed slot (home hero / About). Starts on
// the bundled fallback so the page paints instantly with no flicker — the
// seeded database rows point at the same files. A successful fetch is
// authoritative even when it finds nothing (the committee hid or deleted the
// slot's photo, so the page must drop it); only a FAILED fetch keeps the
// bundled photo.
export function usePlacementPhoto(placement, fallback = null) {
  const [photo, setPhoto] = useState(fallback);

  useEffect(() => {
    let cancelled = false;
    fetchPlacementPhoto(placement)
      .then((data) => {
        if (!cancelled) setPhoto(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [placement]);

  return photo;
}

// Published photos linked to one event (for the played-event recap).
export function useEventPhotos(eventId) {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(Boolean(eventId));

  useEffect(() => {
    if (!eventId) return undefined;
    let cancelled = false;
    setLoading(true);
    fetchEventPhotos(eventId)
      .then((data) => {
        if (!cancelled) setPhotos(data);
      })
      .catch(() => {
        if (!cancelled) setPhotos([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [eventId]);

  return { photos, loading };
}
