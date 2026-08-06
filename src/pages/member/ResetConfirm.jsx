import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../admin/AuthProvider.jsx";
import { supabase } from "../../lib/supabase.js";
import RibbonRule from "../../components/RibbonRule.jsx";
import Button from "../../components/Button.jsx";
import FormField from "../../components/FormField.jsx";

// Password reset — landing page from the recovery email. Like the invite
// landing (/member/welcome), the email link carries session tokens in the URL
// hash; the supabase client (detectSessionInUrl) signs the visitor in, and we
// just collect the new password. Expired/used links arrive with an error in
// the hash instead of a session.
export default function ResetConfirm() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();

  // Read a #error=...&error_code=... hash once, before anything changes it.
  const [linkError] = useState(() => {
    const hash = window.location.hash.replace(/^#/, "");
    const params = new URLSearchParams(hash);
    return params.get("error") ? params.get("error_code") || "invalid" : null;
  });

  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const f = new FormData(e.target);
    const password = f.get("password");
    const confirm = f.get("confirm");
    setError(null);
    if (password.length < 8) {
      setError("Please choose a password of at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Those passwords don't match. Please type them again.");
      return;
    }
    setSaving(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setSaving(false);
    if (updateError) {
      setError(
        "Sorry, we couldn't set your password just now. Please try again, or email us at seqdvgc@gmail.com and we'll sort it out."
      );
      return;
    }
    navigate("/member");
  }

  return (
    <section className="bg-cream px-5 py-16 md:py-24">
      <div className="mx-auto max-w-lg">
        <div className="border-t-4 border-gold bg-paper p-8 md:p-10">
          <p className="font-body text-[0.8125rem] font-bold uppercase tracking-[0.16em] text-gold">
            Club members
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold uppercase text-navy">
            Choose a new password
          </h1>
          <RibbonRule className="mt-4" />

          {loading ? (
            <p className="mt-6 text-ink-muted">Checking your reset link…</p>
          ) : session ? (
            <>
              <p className="mt-5 text-ink-muted">
                G&apos;day{session.user.email ? `, you're signed in as ${session.user.email}` : ""}.
                Choose a new password below.
              </p>
              <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
                <FormField
                  label="New password"
                  id="password"
                  type="password"
                  required
                  autoComplete="new-password"
                  minLength={8}
                  placeholder="At least 8 characters"
                />
                <FormField
                  label="Confirm password"
                  id="confirm"
                  type="password"
                  required
                  autoComplete="new-password"
                />
                {error && (
                  <p className="border-l-4 border-crimson bg-crimson/5 p-4 text-sm text-ink">
                    {error}
                  </p>
                )}
                <Button type="submit" disabled={saving} className="w-full">
                  {saving ? "Saving…" : "Save new password"}
                </Button>
              </form>
            </>
          ) : (
            <>
              <p className="mt-5 text-ink-muted">
                {linkError === "otp_expired"
                  ? "This reset link has expired. They only last a little while for security."
                  : "This reset link isn't valid any more. It may have expired or already been used."}
              </p>
              <p className="mt-3 text-ink-muted">
                No drama. You can{" "}
                <Link
                  to="/member/reset"
                  className="underline decoration-gold decoration-2 underline-offset-2 hover:text-navy"
                >
                  request a fresh link
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
