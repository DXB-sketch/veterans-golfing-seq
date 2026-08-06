import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../admin/AuthProvider.jsx";
import RibbonRule from "../components/RibbonRule.jsx";
import Button from "../components/Button.jsx";

// Generic auth-email landing — email confirmation / change-email links point
// here. The supabase client (detectSessionInUrl) consumes the tokens from the
// URL hash; this page just tells the visitor it worked and where to go next.
// Invite and password-reset links have their own richer landings
// (/member/welcome and /member/reset/confirm).
export default function AuthCallback() {
  const { session, loading } = useAuth();

  // Read a #error=...&error_code=... hash once, before anything changes it.
  const [linkError] = useState(() => {
    const hash = window.location.hash.replace(/^#/, "");
    const params = new URLSearchParams(hash);
    return params.get("error") ? params.get("error_code") || "invalid" : null;
  });

  // detectSessionInUrl takes a beat after `loading` clears; give it a moment
  // before declaring the link dead.
  const [settled, setSettled] = useState(false);
  useEffect(() => {
    if (loading) return;
    const t = setTimeout(() => setSettled(true), 1500);
    return () => clearTimeout(t);
  }, [loading]);

  const ok = session && !linkError;
  const pending = loading || (!ok && !linkError && !settled);

  return (
    <section className="bg-cream px-5 py-16 md:py-24">
      <div className="mx-auto max-w-lg">
        <div className="border-t-4 border-gold bg-paper p-8 md:p-10">
          <p className="font-body text-[0.8125rem] font-bold uppercase tracking-[0.16em] text-gold">
            Club members
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold uppercase text-navy">
            {pending ? "One moment…" : ok ? "All confirmed" : "Link not valid"}
          </h1>
          <RibbonRule className="mt-4" />

          {pending ? (
            <p className="mt-6 text-ink-muted">Checking your link…</p>
          ) : ok ? (
            <>
              <p className="mt-5 text-ink-muted">
                Thanks{session.user.email ? `, you're confirmed as ${session.user.email}` : ""}.
                You&apos;re all set.
              </p>
              <Button to="/member" className="mt-8 w-full">
                Go to the member area
              </Button>
            </>
          ) : (
            <>
              <p className="mt-5 text-ink-muted">
                {linkError === "otp_expired"
                  ? "This link has expired. They only last a little while for security."
                  : "This link isn't valid any more. It may have expired or already been used."}
              </p>
              <p className="mt-3 text-ink-muted">
                No drama. Try{" "}
                <Link
                  to="/member"
                  className="underline decoration-gold decoration-2 underline-offset-2 hover:text-navy"
                >
                  signing in
                </Link>
                , or email us at seqdvgc@gmail.com and we&apos;ll sort it out.
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
