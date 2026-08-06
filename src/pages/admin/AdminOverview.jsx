import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase.js";
import RibbonRule from "../../components/RibbonRule.jsx";

// A count query that never throws — any failure (including tables that don't
// exist until the roles migration is applied) simply reads as zero. An
// optional fallback query is tried first if the main one errors, so a count
// filtered on a not-yet-migrated column can degrade to the unfiltered total
// instead of a misleading zero.
async function safeCount(build, fallback) {
  try {
    const { count, error } = await build();
    if (!error) return count ?? 0;
  } catch {
    // fall through to the fallback (if any)
  }
  if (!fallback) return 0;
  try {
    const { count, error } = await fallback();
    if (error) return 0;
    return count ?? 0;
  } catch {
    return 0;
  }
}

// Today's date in Queensland time, as YYYY-MM-DD for date-column comparisons.
function todayBrisbane() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Australia/Brisbane",
  }).format(new Date());
}

function StatCard({ to, label, value, hint }) {
  return (
    <Link
      to={to}
      className="block border-t-4 border-gold bg-paper p-6 shadow-soft transition-colors hover:bg-gold/5"
    >
      <p className="font-display text-4xl font-bold text-navy">{value}</p>
      <p className="mt-1 font-body text-base font-bold uppercase tracking-[0.08em] text-navy">
        {label}
      </p>
      {hint && <p className="mt-1 text-sm text-ink-muted">{hint}</p>}
    </Link>
  );
}

export default function AdminOverview() {
  const [counts, setCounts] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const today = todayBrisbane();
    Promise.all([
      safeCount(() =>
        supabase
          .from("events")
          .select("id", { count: "exact", head: true })
          .eq("status", "published")
          .gte("event_date", today)
      ),
      safeCount(
        () =>
          supabase
            .from("membership_enquiries")
            .select("id", { count: "exact", head: true })
            .eq("status", "new"),
        () =>
          supabase
            .from("membership_enquiries")
            .select("id", { count: "exact", head: true })
      ),
      safeCount(
        () =>
          supabase
            .from("volunteer_enquiries")
            .select("id", { count: "exact", head: true })
            .eq("status", "new"),
        () =>
          supabase
            .from("volunteer_enquiries")
            .select("id", { count: "exact", head: true })
      ),
      safeCount(
        () =>
          supabase
            .from("contact_messages")
            .select("id", { count: "exact", head: true })
            .eq("status", "new"),
        () =>
          supabase
            .from("contact_messages")
            .select("id", { count: "exact", head: true })
      ),
      safeCount(() =>
        supabase
          .from("members")
          .select("id", { count: "exact", head: true })
          .eq("status", "active")
      ),
      safeCount(() =>
        supabase
          .from("sponsors")
          .select("id", { count: "exact", head: true })
          .eq("is_active", true)
      ),
    ]).then(([events, membership, volunteer, contact, members, sponsors]) => {
      if (cancelled) return;
      setCounts({
        events,
        enquiries: membership + volunteer + contact,
        members,
        sponsors,
      });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto max-w-3xl">
      <h2 className="font-display text-2xl font-semibold tracking-wide text-navy">
        At a glance
      </h2>
      <RibbonRule className="mt-3" />
      <p className="mt-3 text-ink-muted">
        A quick picture of the club right now. Press a card to go to that
        section, or use the tabs above.
      </p>

      {counts === null ? (
        <p className="mt-10 text-lg text-ink-muted">Adding things up…</p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <StatCard
            to="/admin/events"
            label="Upcoming events"
            value={counts.events}
            hint="Published events with a date from today onwards."
          />
          <StatCard
            to="/admin/submissions"
            label="New enquiries"
            value={counts.enquiries}
            hint="Membership, volunteer and contact messages not yet handled."
          />
          <StatCard
            to="/admin/members"
            label="Active members"
            value={counts.members}
            hint="Paid members whose membership hasn't expired."
          />
          <StatCard
            to="/admin/sponsors"
            label="Active sponsors"
            value={counts.sponsors}
            hint="Sponsors currently shown on the website."
          />
        </div>
      )}
    </div>
  );
}
