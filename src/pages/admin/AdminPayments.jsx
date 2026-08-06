import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase.js";
import RibbonRule from "../../components/RibbonRule.jsx";

const PURPOSE_LABELS = {
  membership: "Membership",
  donation: "Donation",
  sponsorship: "Sponsorship",
};

function formatWhen(iso) {
  return new Date(iso).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatAmount(cents) {
  return `$${(cents / 100).toLocaleString("en-AU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("payments")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error: loadError }) => {
        if (cancelled) return;
        if (loadError) {
          setError(
            "Couldn't load the payments list. If the site was just updated, payment records may not be switched on yet — otherwise check your internet connection and refresh the page."
          );
        } else {
          setPayments(data ?? []);
        }
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <p className="text-lg text-ink-muted">Loading the payments…</p>;
  }

  return (
    <div className="mx-auto max-w-4xl">
      <h2 className="font-display text-2xl font-semibold tracking-wide text-navy">
        Payments
      </h2>
      <RibbonRule className="mt-3" />
      <p className="mt-3 text-ink-muted">
        Every payment taken through the website — memberships, donations and
        sponsorships — newest first. This list is a record only; refunds are
        done in the Square dashboard.
      </p>

      {error ? (
        <p className="mt-10 text-lg text-ink-muted">{error}</p>
      ) : payments.length === 0 ? (
        <div className="mt-10 border border-dashed border-ink/25 bg-paper p-10 text-center">
          <p className="text-lg font-semibold text-navy">No payments yet</p>
          <p className="mt-1 text-ink-muted">
            They&apos;ll appear here as people pay through the website.
          </p>
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto border-t-4 border-gold bg-paper shadow-soft">
          <table className="w-full min-w-[720px] text-left">
            <thead>
              <tr className="border-b border-ink/10 font-body text-sm font-bold uppercase tracking-[0.08em] text-navy">
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Purpose</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Payer</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Square ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10">
              {payments.map((p) => (
                <tr key={p.id} className="align-top text-base text-ink">
                  <td className="whitespace-nowrap px-4 py-3">
                    {formatWhen(p.created_at)}
                  </td>
                  <td className="px-4 py-3 font-semibold text-navy">
                    {PURPOSE_LABELS[p.purpose] ?? p.purpose}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-semibold">
                    {formatAmount(p.amount_cents)}
                  </td>
                  <td className="px-4 py-3">
                    {p.payer_name || "—"}
                    {p.payer_email && (
                      <span className="block text-sm text-ink-muted">
                        {p.payer_email}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 capitalize">{p.status}</td>
                  <td className="px-4 py-3 text-sm text-ink-muted">
                    {p.square_payment_id || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
