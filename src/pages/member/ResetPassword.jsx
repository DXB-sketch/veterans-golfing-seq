import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase.js";
import RibbonRule from "../../components/RibbonRule.jsx";
import Button from "../../components/Button.jsx";
import FormField from "../../components/FormField.jsx";

// Password reset — request page. Sends the Supabase recovery email, which
// lands on /member/reset/confirm where the member chooses a new password.
export default function ResetPassword() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const email = new FormData(e.target).get("email").trim();
    setError(null);
    setSending(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/member/reset/confirm`,
    });
    setSending(false);
    if (resetError) {
      // Rate limits are the realistic failure here; anything else is transient.
      setError(
        "Sorry, we couldn't send the reset email just now. Please wait a minute and try again, or email us at seqdvgc@gmail.com and we'll sort it out."
      );
      return;
    }
    setSent(true);
  }

  return (
    <section className="bg-cream px-5 py-16 md:py-24">
      <div className="mx-auto max-w-lg">
        <div className="border-t-4 border-gold bg-paper p-8 md:p-10">
          <p className="font-body text-[0.8125rem] font-bold uppercase tracking-[0.16em] text-gold">
            Club members
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold uppercase text-navy">
            Reset your password
          </h1>
          <RibbonRule className="mt-4" />

          {sent ? (
            <>
              <p className="mt-5 text-ink-muted">
                Done. If that email belongs to a member account, a reset link is
                on its way. It only lasts a little while, so it&apos;s best used
                soon. If it doesn&apos;t arrive in the next few minutes, check
                your spam folder.
              </p>
              <p className="mt-3 text-ink-muted">
                Remembered your password after all?{" "}
                <Link
                  to="/member"
                  className="underline decoration-gold decoration-2 underline-offset-2 hover:text-navy"
                >
                  Sign in here
                </Link>
                .
              </p>
            </>
          ) : (
            <>
              <p className="mt-5 text-ink-muted">
                No drama. Enter the email address on your member account and
                we&apos;ll send you a link to choose a new password.
              </p>
              <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
                <FormField label="Email" id="email" type="email" required autoComplete="email" />
                {error && (
                  <p className="border-l-4 border-crimson bg-crimson/5 p-4 text-sm text-ink">
                    {error}
                  </p>
                )}
                <Button type="submit" disabled={sending} className="w-full">
                  {sending ? "Sending…" : "Send reset link"}
                </Button>
              </form>
              <p className="mt-6 text-sm text-ink-muted">
                Back to{" "}
                <Link
                  to="/member"
                  className="underline decoration-gold decoration-2 underline-offset-2 hover:text-navy"
                >
                  member sign in
                </Link>
                .
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
