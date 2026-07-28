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

export default function AdminSubmissions() {
  const [enquiries, setEnquiries] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    ]).then(([enq, msg]) => {
      if (cancelled) return;
      if (enq.error || msg.error) {
        setError(
          "Couldn't load submissions — please check your internet connection and refresh the page."
        );
      } else {
        setEnquiries(enq.data);
        setMessages(msg.data);
      }
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <p className="text-lg text-ink-muted">Loading submissions…</p>;
  }
  if (error) {
    return <p className="text-lg text-ink-muted">{error}</p>;
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-14 lg:grid-cols-2">
      <section>
        <h2 className="font-display text-2xl font-semibold tracking-wide text-navy">
          Membership enquiries
        </h2>
        <RibbonRule className="mt-3" />
        <p className="mt-3 text-ink-muted">
          People who&apos;ve filled in the &ldquo;Join the club&rdquo; form.
          Newest first — reply to them by email.
        </p>
        {enquiries.length === 0 ? (
          <p className="mt-8 text-ink-muted">No enquiries yet.</p>
        ) : (
          <ul className="mt-6 space-y-5">
            {enquiries.map((e) => (
              <li key={e.id} className="border-t-4 border-gold bg-paper p-6 shadow-soft">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-lg font-bold text-navy">{e.name}</p>
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
                  <Row
                    label="Hat or t-shirt"
                    value={
                      e.apparel_choice &&
                      `${e.apparel_choice}${e.apparel_size ? ` (size ${e.apparel_size})` : ""}`
                    }
                  />
                  <Row label="Pickup or delivery" value={e.delivery_pref} />
                </div>
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
              <li key={m.id} className="border-t-4 border-navy bg-paper p-6 shadow-soft">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-lg font-bold text-navy">{m.name}</p>
                  <p className="text-sm text-ink-muted">{formatWhen(m.created_at)}</p>
                </div>
                <a
                  href={`mailto:${m.email}`}
                  className="mt-1 inline-block text-base text-ink-muted underline decoration-gold decoration-2 underline-offset-2"
                >
                  {m.email}
                </a>
                <p className="mt-3 whitespace-pre-wrap text-base text-ink">{m.message}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
