import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../admin/AuthProvider.jsx";
import { supabase } from "../../lib/supabase.js";
import {
  fetchOwnMember,
  updateOwnMember,
  fetchOwnBookings,
} from "../../lib/members.js";
import RibbonRule from "../../components/RibbonRule.jsx";
import Button from "../../components/Button.jsx";
import FormField from "../../components/FormField.jsx";

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(`${value}T00:00:00`);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function MemberArea() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <section className="bg-cream px-5 py-16 md:py-24">
        <p className="mx-auto max-w-site text-ink-muted">Loading…</p>
      </section>
    );
  }

  return session ? <MemberDashboard session={session} /> : <MemberSignIn />;
}

// ---------------------------------------------------------------------------
// Sign in — member accounts are created by invite after joining, so there is
// deliberately no "create account" link here.
// ---------------------------------------------------------------------------
function MemberSignIn() {
  const [error, setError] = useState(null);
  const [signingIn, setSigningIn] = useState(false);

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
        "That email or password isn't right. Please check both and try again. If you're stuck, email us at seqdvgc@gmail.com and we'll sort it out."
      );
    }
    // On success the auth listener updates the session and the dashboard appears.
  }

  return (
    <section className="bg-cream px-5 py-16 md:py-24">
      <div className="mx-auto max-w-lg">
        <div className="border-t-4 border-gold bg-paper p-8 md:p-10">
          <p className="font-body text-[0.8125rem] font-bold uppercase tracking-[0.16em] text-gold">
            Club members
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold uppercase text-navy">
            Member sign in
          </h1>
          <RibbonRule className="mt-4" />
          <p className="mt-5 text-ink-muted">
            Member accounts are created by invite. When you join the club,
            we email you a link to set up your login — there&apos;s no
            self-serve sign-up.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
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
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Dashboard — membership status + expiry, editable profile, own bookings.
// Deliberately no handicap/score data: that lives in MiScore, not here.
// ---------------------------------------------------------------------------
function MemberDashboard({ session }) {
  const [member, setMember] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setLoadError(null);
      try {
        const [memberRow, bookingRows] = await Promise.all([
          fetchOwnMember(),
          fetchOwnBookings().catch(() => []),
        ]);
        if (cancelled) return;
        setMember(memberRow);
        setBookings(bookingRows);
      } catch {
        if (!cancelled) {
          setLoadError(
            "We couldn't load your membership details just now. Please refresh the page, or email us at seqdvgc@gmail.com if it keeps happening."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [session.user.id]);

  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  return (
    <>
      <section className="bg-navy px-5 py-12 md:py-16">
        <div className="mx-auto flex max-w-site flex-wrap items-end justify-between gap-6">
          <div>
            <p className="font-body text-[0.8125rem] font-bold uppercase tracking-[0.16em] text-gold">
              Member area
            </p>
            <h1 className="mt-2 font-display text-3xl font-bold uppercase text-white md:text-4xl">
              {member?.name || "Welcome"}
            </h1>
            <RibbonRule className="mt-4" dark />
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="inline-flex min-h-[46px] items-center justify-center border border-gold px-7 py-2.5 font-body text-sm font-bold uppercase tracking-[0.08em] text-gold transition-colors duration-150 hover:bg-gold/10"
          >
            Sign out
          </button>
        </div>
      </section>

      <section className="bg-cream px-5 py-14 md:py-20">
        <div className="mx-auto max-w-site">
          {loading ? (
            <p className="text-ink-muted">Loading your details…</p>
          ) : loadError ? (
            <p className="border-l-4 border-crimson bg-crimson/5 p-4 text-sm text-ink">
              {loadError}
            </p>
          ) : !member ? (
            <div className="max-w-2xl border-t-4 border-gold bg-paper p-8 md:p-10">
              <p className="font-display text-xl font-semibold tracking-wide text-navy">
                No membership record for this account
              </p>
              <RibbonRule className="mt-3" />
              <p className="mt-4 text-ink-muted">
                You&apos;re signed in, but we couldn&apos;t find a membership
                record under {session.user.email}. If you&apos;re on the
                committee, you&apos;re probably after the{" "}
                <Link
                  to="/admin"
                  className="underline decoration-gold decoration-2 underline-offset-2 hover:text-navy"
                >
                  committee area
                </Link>
                . Otherwise, email us at seqdvgc@gmail.com and we&apos;ll sort
                it out.
              </p>
            </div>
          ) : (
            <div className="grid gap-10 lg:grid-cols-5">
              <div className="lg:col-span-2">
                <MembershipCard member={member} />
                <BookingsList bookings={bookings} />
              </div>
              <div className="lg:col-span-3">
                <ProfileForm member={member} onSaved={setMember} />
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function MembershipCard({ member }) {
  const active = member.status === "active";
  return (
    <div className="border-t-4 border-gold bg-paper p-8">
      <h2 className="font-display text-xl font-semibold tracking-wide text-navy">
        Your membership
      </h2>
      <RibbonRule className="mt-3" />
      <dl className="mt-6 space-y-4 text-sm">
        <div className="flex items-center justify-between gap-4">
          <dt className="font-semibold text-ink">Status</dt>
          <dd>
            <span
              className={`inline-block px-3 py-1 font-body text-xs font-bold uppercase tracking-[0.08em] ${
                active ? "bg-gold text-navy-deep" : "bg-ink/10 text-ink-muted"
              }`}
            >
              {active ? "Active" : "Expired"}
            </span>
          </dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="font-semibold text-ink">Member since</dt>
          <dd className="text-ink-muted">{formatDate(member.joined_at)}</dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="font-semibold text-ink">
            {active ? "Renews by" : "Expired on"}
          </dt>
          <dd className="text-ink-muted">{formatDate(member.expires_at)}</dd>
        </div>
      </dl>
      {!active && (
        <p className="mt-5 text-sm text-ink-muted">
          Your membership has lapsed — you can renew on the{" "}
          <Link
            to="/membership"
            className="underline decoration-gold decoration-2 underline-offset-2 hover:text-navy"
          >
            membership page
          </Link>
          .
        </p>
      )}
    </div>
  );
}

function BookingsList({ bookings }) {
  return (
    <div className="mt-8 border-t-4 border-gold bg-paper p-8">
      <h2 className="font-display text-xl font-semibold tracking-wide text-navy">
        Your event bookings
      </h2>
      <RibbonRule className="mt-3" />
      {bookings.length === 0 ? (
        <p className="mt-5 text-sm text-ink-muted">
          No bookings yet. Bookings you make while signed in will show here —
          have a look at{" "}
          <Link
            to="/events"
            className="underline decoration-gold decoration-2 underline-offset-2 hover:text-navy"
          >
            upcoming events
          </Link>
          .
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-ink/10">
          {bookings.map((b) => (
            <li key={b.id} className="py-4">
              <p className="font-semibold text-ink">
                {b.eventId ? (
                  <Link
                    to={`/events/${b.eventId}`}
                    className="hover:text-navy hover:underline"
                  >
                    {b.eventTitle}
                  </Link>
                ) : (
                  b.eventTitle
                )}
              </p>
              <p className="mt-0.5 text-sm text-ink-muted">
                {formatDate(b.eventDate)}
                {b.teeTime ? ` · Tee time ${b.teeTime}` : ""}
                {b.playerName ? ` · Booked for ${b.playerName}` : ""}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ProfileForm({ member, onSaved }) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    const f = new FormData(e.target);
    setError(null);
    setSaved(false);
    setSaving(true);
    try {
      const updated = await updateOwnMember(member.id, {
        name: f.get("name").trim(),
        phone: f.get("phone")?.trim() || null,
        service_branch: f.get("service_branch") || null,
        ga_handicap:
          f.get("ga_handicap") === "Yes"
            ? true
            : f.get("ga_handicap") === "No"
              ? false
              : null,
        golf_links_number: f.get("golf_links_number")?.trim() || null,
      });
      if (updated) onSaved(updated);
      setSaved(true);
    } catch {
      setError(
        "Sorry, we couldn't save your changes just now. Please try again, or email us at seqdvgc@gmail.com."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-5 border-t-4 border-gold bg-paper p-8 sm:grid-cols-2 md:p-10"
    >
      <div className="sm:col-span-2">
        <h2 className="font-display text-xl font-semibold tracking-wide text-navy">
          Your details
        </h2>
        <RibbonRule className="mt-3" />
        <p className="mt-4 text-sm text-ink-muted">
          Keep these up to date so we can reach you about events. Your login
          email is {member.email} — to change it, email us at
          seqdvgc@gmail.com.
        </p>
      </div>
      <FormField
        label="Full name"
        id="name"
        required
        autoComplete="name"
        defaultValue={member.name || ""}
      />
      <FormField
        label="Phone"
        id="phone"
        type="tel"
        autoComplete="tel"
        defaultValue={member.phone || ""}
      />
      <FormField
        label="Service branch"
        id="service_branch"
        as="select"
        options={["Army", "Navy", "Air Force", "Family member"]}
        defaultValue={member.service_branch || ""}
      />
      <FormField
        label="Do you have a GA handicap?"
        id="ga_handicap"
        as="select"
        options={["Yes", "No"]}
        defaultValue={
          member.ga_handicap === true
            ? "Yes"
            : member.ga_handicap === false
              ? "No"
              : ""
        }
      />
      <FormField
        label="Golf Links number"
        id="golf_links_number"
        placeholder="Leave blank if you don't have one"
        defaultValue={member.golf_links_number || ""}
      />
      {error && (
        <p className="border-l-4 border-crimson bg-crimson/5 p-4 text-sm text-ink sm:col-span-2">
          {error}
        </p>
      )}
      {saved && !error && (
        <p className="border-l-4 border-gold bg-gold/10 p-4 text-sm text-ink sm:col-span-2">
          Saved — your details are up to date.
        </p>
      )}
      <div className="sm:col-span-2">
        <Button type="submit" disabled={saving} className="w-full sm:w-auto">
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
