import { NavLink, Outlet } from "react-router-dom";
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
          <nav className="flex gap-8">
            <AdminTab to="/admin" end>
              Events
            </AdminTab>
            <AdminTab to="/admin/submissions">Enquiries &amp; messages</AdminTab>
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
