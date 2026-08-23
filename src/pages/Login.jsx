import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../admin/AuthProvider.jsx";
import { supabase } from "../lib/supabase.js";
import RibbonRule from "../components/RibbonRule.jsx";
import Button from "../components/Button.jsx";
import FormField from "../components/FormField.jsx";

// The one sign-in page for the whole site. Members and the committee use the
// same accounts under the hood; the choice below just sets the copy and where
// we send them afterwards. /member and /admin both redirect here when
// signed out.
const ROLES = [
  {
    value: "member",
    label: "Club member",
    detail: "Your membership, details and bookings",
    destination: "/member",
  },
  {
    value: "committee",
    label: "Committee",
    detail: "Manage events, members and the website",
    destination: "/admin",
  },
];

export default function Login() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState(null);
  const [error, setError] = useState(null);
  const [signingIn, setSigningIn] = useState(false);
  // Where to go once the auth listener confirms the new session.
  const [destination, setDestination] = useState(null);

  useEffect(() => {
    if (session && destination) {
      navigate(destination, { replace: true });
    }
  }, [session, destination, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    const f = new FormData(e.target);
    setError(null);
    setSigningIn(true);
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: f.get("email").trim(),
      password: f.get("password"),
    });
    setSigningIn(false);
    if (authError) {
      setError(
        role.value === "committee"
          ? "That email or password isn't right. Please check both and try again. If you're stuck, contact Dexter and he'll sort it out."
          : "That email or password isn't right. Please check both and try again. If you're stuck, email us at seqdvgc@gmail.com and we'll sort it out."
      );
      return;
    }
    setDestination(role.destination);
  }

  if (loading) {
    return (
      <section className="bg-cream px-5 py-16 md:py-24">
        <p className="mx-auto max-w-site text-ink-muted">Loading…</p>
      </section>
    );
  }

  // Already signed in with nowhere pending: offer both areas rather than
  // guessing which one they're after.
  if (session && !destination) {
    return (
      <section className="bg-cream px-5 py-16 md:py-24">
        <div className="mx-auto max-w-lg">
          <div className="border-t-4 border-gold bg-paper p-8 md:p-10">
            <p className="font-body text-[0.8125rem] font-bold uppercase tracking-[0.16em] text-gold">
              Sign in
            </p>
            <h1 className="mt-2 font-display text-3xl font-bold uppercase text-navy">
              You&apos;re signed in
            </h1>
            <RibbonRule className="mt-4" />
            <p className="mt-5 text-ink-muted">
              You&apos;re signed in as{" "}
              <span className="font-semibold text-ink">{session.user.email}</span>.
            </p>
            <div className="mt-8 flex flex-col gap-3">
              <Button to="/member">Go to the member area</Button>
              <Button to="/admin" variant="secondary-light">
                Go to the committee area
              </Button>
            </div>
            <p className="mt-6 text-sm text-ink-muted">
              Not you?{" "}
              <button
                type="button"
                onClick={() => supabase.auth.signOut()}
                className="underline decoration-gold decoration-2 underline-offset-2 hover:text-navy"
              >
                Sign out
              </button>{" "}
              and sign in with another account.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-cream px-5 py-16 md:py-24">
      <div className="mx-auto max-w-lg">
        <div className="border-t-4 border-gold bg-paper p-8 md:p-10">
          <p className="font-body text-[0.8125rem] font-bold uppercase tracking-[0.16em] text-gold">
            Members and committee
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold uppercase text-navy">
            Sign in
          </h1>
          <RibbonRule className="mt-4" />

          {/* Step one: who's signing in. Radio-group semantics on plain
              buttons, same pattern as the tee slot picker. */}
          <p className="mt-6 text-sm font-semibold text-ink">
            I&apos;m signing in as a
            <span className="ml-1 text-crimson" aria-hidden="true">*</span>
          </p>
          <div role="radiogroup" aria-label="Sign in as" className="mt-3 grid gap-3">
            {ROLES.map((r) => {
              const active = role?.value === r.value;
              return (
                <button
                  key={r.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => {
                    setRole(r);
                    setError(null);
                  }}
                  className={`flex min-h-[46px] flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-2 px-4 py-3 text-left transition-colors ${
                    active
                      ? "border-gold bg-gold/10"
                      : "border-ink/20 bg-paper hover:border-gold"
                  }`}
                >
                  <span className="font-semibold text-ink">{r.label}</span>
                  <span className="text-sm text-ink-muted">{r.detail}</span>
                </button>
              );
            })}
          </div>

          {role && (
            <>
              <p className="mt-5 text-sm text-ink-muted">
                {role.value === "member"
                  ? "Member accounts are created by invite. When you join the club, we email you a link to set up your login. There's no self-serve sign-up."
                  : "Sign in with the email and password you were given to manage the club's events, members and website."}
              </p>

              <form onSubmit={handleSubmit} className="mt-6 grid gap-5">
                <FormField label="Email" id="email" type="email" required autoComplete="email" />
                <FormField
                  label="Password"
                  id="password"
                  type="password"
                  required
                  autoComplete="current-password"
                />
                {error && (
                  <p className="border-l-4 border-crimson bg-crimson/5 p-4 text-sm text-ink">
                    {error}
                  </p>
                )}
                <Button type="submit" disabled={signingIn} className="w-full">
                  {signingIn ? "Signing in…" : "Sign in"}
                </Button>
              </form>

              {role.value === "member" ? (
                <p className="mt-6 text-sm text-ink-muted">
                  Not a member yet?{" "}
                  <Link
                    to="/membership"
                    className="underline decoration-gold decoration-2 underline-offset-2 hover:text-navy"
                  >
                    Join the club
                  </Link>{" "}
                  and we&apos;ll send your invite. Forgotten your password?{" "}
                  <Link
                    to="/member/reset"
                    className="underline decoration-gold decoration-2 underline-offset-2 hover:text-navy"
                  >
                    Reset it here
                  </Link>
                  .
                </p>
              ) : (
                <p className="mt-6 text-sm text-ink-muted">
                  Forgotten your password? Contact Dexter and he&apos;ll reset
                  it for you.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
