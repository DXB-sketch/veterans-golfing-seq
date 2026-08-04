import { useCallback, useEffect, useState } from "react";
import { fetchSlotAvailability, fetchEventBookings } from "../lib/bookings.js";

// Anonymous-safe tee sheet availability. refresh() re-fetches in place,
// keeping the previous slots on screen while the new data loads.
export function useSlotAvailability(eventId) {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetchSlotAvailability(eventId)
      .then((data) => {
        if (!cancelled) {
          setSlots(data);
          setError(null);
        }
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load tee times right now.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [eventId, tick]);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  return { slots, loading, error, refresh };
}

// Committee-only booking list for an event.
export function useEventBookings(eventId) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetchEventBookings(eventId)
      .then((data) => {
        if (!cancelled) {
          setBookings(data);
          setError(null);
        }
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load bookings right now.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [eventId, tick]);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  return { bookings, loading, error, refresh };
}
