import { useEffect, useState } from "react";
import { fetchEvents, fetchEvent } from "../lib/events.js";

// Last public list, so moving between Home and Events shows events
// instantly while a fresh copy loads in the background.
let publicCache = null;

export function useEvents({ includeDrafts = false } = {}) {
  const cached = includeDrafts ? null : publicCache;
  const [events, setEvents] = useState(cached ?? []);
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetchEvents({ includeDrafts })
      .then((data) => {
        if (!includeDrafts) publicCache = data;
        if (!cancelled) {
          setEvents(data);
          setError(null);
        }
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load events right now.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [includeDrafts]);

  return { events, loading, error };
}

export function useEvent(id) {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setEvent(null);
    setError(null);
    fetchEvent(id)
      .then((data) => {
        if (!cancelled) setEvent(data);
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load this event right now.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  return { event, loading, error };
}
