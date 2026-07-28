import { useState } from "react";
import { supabase } from "../../lib/supabase.js";
import RibbonRule from "../../components/RibbonRule.jsx";
import AdminField from "./AdminField.jsx";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [signingIn, setSigningIn] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSigningIn(true);
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setSigningIn(false);
    if (authError) {
      setError(
        "That email or password isn't right. Please check both and try again. If you're stuck, contact Dexter and he'll sort it out."
      );
    }
    // On success the auth listener updates the session and the admin area appears.
  }

  return (
    <section className="bg-cream px-5 py-16 md:py-24">
      <div className="mx-auto max-w-lg">
        <div className="border-t-4 border-gold bg-paper p-8 shadow-soft md:p-10">
          <p className="font-body text-[0.8125rem] font-bold uppercase tracking-[0.16em] text-gold">
            Club committee only
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold uppercase text-navy">
            Committee sign in
          </h1>
          <RibbonRule className="mt-4" />
          <p className="mt-5 text-lg text-ink-muted">
            Sign in with the email and password you were given to update the
            website&apos;s events.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 grid gap-6">
            <AdminField
              label="Email"
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <AdminField
              label="Password"
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error && (
              <p className="border-l-4 border-crimson bg-crimson/5 p-4 text-base text-ink">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={signingIn}
              className="min-h-[56px] w-full bg-gold px-7 font-body text-base font-bold uppercase tracking-[0.08em] text-navy-deep transition-colors hover:bg-gold-bright disabled:opacity-60"
            >
              {signingIn ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-sm text-ink-muted">
            Forgotten your password? Contact Dexter and he&apos;ll reset it for
            you.
          </p>
        </div>
      </div>
    </section>
  );
}
