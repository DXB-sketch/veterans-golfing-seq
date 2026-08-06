import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase.js";
import RibbonRule from "../../components/RibbonRule.jsx";

function formatWhen(iso) {
  return new Date(iso).toLocaleDateString("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function Row({ label, value }) {
  if (!value) return null;
  return (
    <p className="text-base">
      <span className="font-semibold text-ink">{label}:</span>{" "}
      <span className="text-ink-muted">{value}</span>
    </p>
  );
}

// "Mark as handled" / "Mark as new" toggle shared by all three lists. Items
// from before the site update may not have a status yet — they count as new.
function HandledToggle({ item, saving, onToggle }) {
  const handled = item.status === "handled";
  return (
    <button
      onClick={() => onToggle(item)}
      disabled={saving}
      className={`mt-4 min-h-[44px] px-5 font-body text-sm font-bold uppercase tracking-[0.08em] transition-colors disabled:opacity-60 ${
        handled
          ? "border-2 border-navy text-navy hover:bg-navy/5"
          : "bg-gold text-navy-deep hover:bg-gold-bright"
      }`}
    >
      {saving ? "Saving…" : handled ? "Mark as new" : "Mark as handled"}
    </button>
  );
}

function HandledBadge({ item }) {
  if (item.status !== "handled") return null;
  return (
    <span className="border border-ink/25 px-2 py-0.5 text-xs font-bold uppercase tracking-[0.08em] text-ink-muted">
      Handled
    </span>
  );
}

export default function AdminSubmissions() {
  const [enquiries, setEnquiries] = useState([]);
  const [messages, setMessages] = useState([]);
  // null = the volunteer table isn't available yet (migration not applied).
  const [volunteers, setVolunteers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toggleError, setToggleError] = useState(null);
  const [savingKey, setSavingKey] = useState(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      supabase
        .from("membership_enquiries")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("volunteer_enquiries")
        .select("*")
        .order("created_at", { ascending: false }),
    ]).then(([enq, msg, vol]) => {
      if (cancelled) return;
      if (enq.error || msg.error) {
        setError(
          "Couldn't load submissions. Please check your internet connection and refresh the page."
        );
      } else {
        setEnquiries(enq.data);
        setMessages(msg.data);
        // The volunteer table only exists once the database update is applied;
        // until then just leave that section in its "not set up" state.
        setVolunteers(vol.error ? null : vol.data);
      }
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Flip one item between new and handled, in the database and on screen.
  async function toggleStatus(table, item, setList) {
    const next = item.status === "handled" ? "new" : "handled";
    setToggleError(null);
    setSavingKey(`${table}:${item.id}`);
    const { error: updateError } = await supabase
      .from(table)
      .update({ status: next })
      .eq("id", item.id);
    setSavingKey(null);
    if (updateError) {
      setToggleError(
        "Couldn't update that one. Please check your internet connection and try again."
      );
      return;
    }
    setList((list) =>
      list.map((row) => (row.id === item.id ? { ...row, status: next } : row))
    );
  }

  if (loading) {
    return <p className="text-lg text-ink-muted">Loading submissions…</p>;
  }
  if (error) {
    return <p className="text-lg text-ink-muted">{error}</p>;
  }

  return (
    <div className="mx-auto max-w-5xl">
      {toggleError && (
        <p className="mb-8 border-l-4 border-crimson bg-crimson/5 p-4 text-base text-ink">
          {toggleError}
        </p>
      )}

      <div className="grid gap-14 lg:grid-cols-2">
        <section>
          <h2 className="font-display text-2xl font-semibold tracking-wide text-navy">
            Membership enquiries
          </h2>
          <RibbonRule className="mt-3" />
          <p className="mt-3 text-ink-muted">
            People who&apos;ve filled in the &ldquo;Join the club&rdquo; form.
            Newest first. Reply to them by email, then mark them as handled.
          </p>
          {enquiries.length === 0 ? (
            <p className="mt-8 text-ink-muted">No enquiries yet.</p>
          ) : (
            <ul className="mt-6 space-y-5">
              {enquiries.map((e) => (
                <li
                  key={e.id}
                  className={`border-t-4 border-gold bg-paper p-6 shadow-soft ${
                    e.status === "handled" ? "opacity-70" : ""
                  }`}
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="text-lg font-bold text-navy">
                      {e.name} <HandledBadge item={e} />
                    </p>
                    <p className="text-sm text-ink-muted">{formatWhen(e.created_at)}</p>
                  </div>
                  <div className="mt-3 space-y-1">
                    <Row
                      label="Email"
                      value={
                        <a href={`mailto:${e.email}`} className="underline decoration-gold decoration-2 underline-offset-2">
                          {e.email}
                        </a>
                      }
                    />
                    <Row label="Phone" value={e.phone} />
                    <Row label="Service" value={e.service_branch} />
                    <Row label="Playing info" value={e.playing_info} />
                    <Row label="GA handicap" value={e.ga_handicap} />
                    <Row label="Golf Links number" value={e.golf_links_number} />
                  </div>
                  <HandledToggle
                    item={e}
                    saving={savingKey === `membership_enquiries:${e.id}`}
                    onToggle={(item) =>
                      toggleStatus("membership_enquiries", item, setEnquiries)
                    }
                  />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold tracking-wide text-navy">
            Contact messages
          </h2>
          <RibbonRule className="mt-3" />
          <p className="mt-3 text-ink-muted">
            Messages sent through the &ldquo;Contact us&rdquo; page. Newest
            first.
          </p>
          {messages.length === 0 ? (
            <p className="mt-8 text-ink-muted">No messages yet.</p>
          ) : (
            <ul className="mt-6 space-y-5">
              {messages.map((m) => (
                <li
                  key={m.id}
                  className={`border-t-4 border-navy bg-paper p-6 shadow-soft ${
                    m.status === "handled" ? "opacity-70" : ""
                  }`}
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="text-lg font-bold text-navy">
                      {m.name} <HandledBadge item={m} />
                    </p>
                    <p className="text-sm text-ink-muted">{formatWhen(m.created_at)}</p>
                  </div>
                  <a
                    href={`mailto:${m.email}`}
                    className="mt-1 inline-block text-base text-ink-muted underline decoration-gold decoration-2 underline-offset-2"
                  >
                    {m.email}
                  </a>
                  <p className="mt-3 whitespace-pre-wrap text-base text-ink">{m.message}</p>
                  <HandledToggle
                    item={m}
                    saving={savingKey === `contact_messages:${m.id}`}
                    onToggle={(item) =>
                      toggleStatus("contact_messages", item, setMessages)
                    }
                  />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold tracking-wide text-navy">
            Volunteer enquiries
          </h2>
          <RibbonRule className="mt-3" />
          <p className="mt-3 text-ink-muted">
            People offering to lend a hand, from the volunteer form. Newest
            first.
          </p>
          {volunteers === null ? (
            <p className="mt-8 text-ink-muted">
              Volunteer enquiries aren&apos;t switched on yet. They&apos;ll
              appear here once the site update is finished.
            </p>
          ) : volunteers.length === 0 ? (
            <p className="mt-8 text-ink-muted">No volunteer enquiries yet.</p>
          ) : (
            <ul className="mt-6 space-y-5">
              {volunteers.map((v) => (
                <li
                  key={v.id}
                  className={`border-t-4 border-gold bg-paper p-6 shadow-soft ${
                    v.status === "handled" ? "opacity-70" : ""
                  }`}
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="text-lg font-bold text-navy">
                      {v.name} <HandledBadge item={v} />
                    </p>
                    <p className="text-sm text-ink-muted">{formatWhen(v.created_at)}</p>
                  </div>
                  <div className="mt-3 space-y-1">
                    <Row
                      label="Email"
                      value={
                        <a href={`mailto:${v.email}`} className="underline decoration-gold decoration-2 underline-offset-2">
                          {v.email}
                        </a>
                      }
                    />
                    <Row label="Phone" value={v.phone} />
                  </div>
                  <p className="mt-3 whitespace-pre-wrap text-base text-ink">{v.message}</p>
                  <HandledToggle
                    item={v}
                    saving={savingKey === `volunteer_enquiries:${v.id}`}
                    onToggle={(item) =>
                      toggleStatus("volunteer_enquiries", item, setVolunteers)
                    }
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
