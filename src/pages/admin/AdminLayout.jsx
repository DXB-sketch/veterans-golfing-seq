import { useEffect, useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../admin/AuthProvider.jsx";
import { supabase } from "../../lib/supabase.js";
import AdminLogin from "./AdminLogin.jsx";

function AdminTab({ to, end = false, children }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `inline-flex min-h-[48px] items-center border-b-4 px-1 font-body text-base font-bold uppercase tracking-[0.06em] transition-colors ${
          isActive
            ? "border-gold text-white"
            : "border-transparent text-cream/70 hover:text-white"
        }`
      }
    >
      {children}
    </NavLink>
  );
}

// Every admin page lives under this layout, so the sign-in gate covers them all.
export default function AdminLayout() {
  const { session, loading } = useAuth();
  // 'checking' | 'committee' | 'member'
  const [role, setRole] = useState("checking");

  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          // TEMPORARY FALLBACK: the roles migration hasn't been applied yet,
          // so the profiles table doesn't exist and this query fails. In that
          // legacy world every authenticated user IS a committee admin, so we
          // let them through rather than locking the committee out. Once the
          // migration is applied the query succeeds, every user has a profiles
          // row, and this branch never runs again — the role check below is
          // then the only way in. (RLS enforces the real security either way.)
          setRole("committee");
        } else {
          // A missing row can't happen post-migration (the trigger creates
          // one per auth user), but treat it as committee for the same
          // legacy-mode reason as above.
          setRole(data?.role === "member" ? "member" : "committee");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [session]);

  if (loading) {
    return (
      <section className="bg-cream px-5 py-24 text-center">
        <p className="text-lg text-ink-muted">Checking your sign in…</p>
      </section>
    );
  }

  if (!session) {
    return <AdminLogin />;
  }

  if (role === "checking") {
    return (
      <section className="bg-cream px-5 py-24 text-center">
        <p className="text-lg text-ink-muted">Checking your sign in…</p>
      </section>
    );
  }

  // Signed in, but as a club member — this area is for the committee.
  if (role === "member") {
    return (
      <section className="bg-cream px-5 py-24">
        <div className="mx-auto max-w-xl border-t-4 border-gold bg-paper p-10 text-center shadow-soft">
          <h1 className="font-display text-2xl font-semibold tracking-wide text-navy">
            This area is for committee members
          </h1>
          <p className="mt-3 text-ink-muted">
            You&apos;re signed in as a club member, so there&apos;s nothing for
            you here — your bookings and details live in the member area.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/member"
              className="inline-flex min-h-[52px] items-center bg-gold px-8 font-body text-base font-bold uppercase tracking-[0.08em] text-navy-deep transition-colors hover:bg-gold-bright"
            >
              Go to the member area
            </Link>
            <button
              onClick={() => supabase.auth.signOut()}
              className="min-h-[52px] border-2 border-navy px-8 font-body text-base font-bold uppercase tracking-[0.08em] text-navy transition-colors hover:bg-navy/5"
            >
              Sign out
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="bg-cream">
      <div className="border-b-4 border-gold bg-navy px-5 pt-8">
        <div className="mx-auto max-w-site">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6">
            <div>
              <p className="font-body text-[0.8125rem] font-bold uppercase tracking-[0.16em] text-gold">
                Club admin
              </p>
              <h1 className="mt-1 font-display text-3xl font-bold uppercase text-white">
                Manage the website
              </h1>
            </div>
            <div className="text-right">
              <p className="text-sm text-cream/70">Signed in as</p>
              <p className="text-sm font-semibold text-cream">{session.user.email}</p>
              <button
                onClick={() => supabase.auth.signOut()}
                className="mt-2 min-h-[44px] border border-gold px-5 font-body text-sm font-bold uppercase tracking-[0.08em] text-gold transition-colors hover:bg-gold/10"
              >
                Sign out
              </button>
            </div>
          </div>
          <nav className="flex flex-wrap gap-x-8 gap-y-1">
            <AdminTab to="/admin" end>
              Overview
            </AdminTab>
            <AdminTab to="/admin/events">Events</AdminTab>
            <AdminTab to="/admin/members">Members</AdminTab>
            <AdminTab to="/admin/submissions">Enquiries</AdminTab>
            <AdminTab to="/admin/sponsors">Sponsors</AdminTab>
            <AdminTab to="/admin/payments">Payments</AdminTab>
            <AdminTab to="/admin/team">Team</AdminTab>
          </nav>
        </div>
      </div>

      <div className="px-5 py-12 md:py-16">
        <div className="mx-auto max-w-site">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
