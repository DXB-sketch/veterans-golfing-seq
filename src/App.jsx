import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import Nav from "./components/Nav.jsx";
import Footer from "./components/Footer.jsx";
import Home from "./pages/Home.jsx";
import About from "./pages/About.jsx";
import Events from "./pages/Events.jsx";
import EventDetail from "./pages/EventDetail.jsx";
import Membership from "./pages/Membership.jsx";
import Contact from "./pages/Contact.jsx";
import { AuthProvider } from "./admin/AuthProvider.jsx";

// Less-visited public pages, accounts and the committee area load on demand
// so the first visit to the site downloads only what it needs.
const Gallery = lazy(() => import("./pages/Gallery.jsx"));
const Resources = lazy(() => import("./pages/Resources.jsx"));
const Privacy = lazy(() => import("./pages/Privacy.jsx"));
const Terms = lazy(() => import("./pages/Terms.jsx"));
const WallOfHonour = lazy(() => import("./pages/WallOfHonour.jsx"));
const Donate = lazy(() => import("./pages/Donate.jsx"));
const NotFound = lazy(() => import("./pages/NotFound.jsx"));
const Login = lazy(() => import("./pages/Login.jsx"));
const MemberArea = lazy(() => import("./pages/member/MemberArea.jsx"));
const MemberWelcome = lazy(() => import("./pages/member/MemberWelcome.jsx"));
const ResetPassword = lazy(() => import("./pages/member/ResetPassword.jsx"));
const ResetConfirm = lazy(() => import("./pages/member/ResetConfirm.jsx"));
const AuthCallback = lazy(() => import("./pages/AuthCallback.jsx"));
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout.jsx"));
const AdminEvents = lazy(() => import("./pages/admin/AdminEvents.jsx"));
const AdminEventForm = lazy(() => import("./pages/admin/AdminEventForm.jsx"));
const AdminBookings = lazy(() => import("./pages/admin/AdminBookings.jsx"));
const AdminSubmissions = lazy(() => import("./pages/admin/AdminSubmissions.jsx"));
const AdminTeam = lazy(() => import("./pages/admin/AdminTeam.jsx"));
const AdminOverview = lazy(() => import("./pages/admin/AdminOverview.jsx"));
const AdminMembers = lazy(() => import("./pages/admin/AdminMembers.jsx"));
const AdminSponsors = lazy(() => import("./pages/admin/AdminSponsors.jsx"));
const AdminGallery = lazy(() => import("./pages/admin/AdminGallery.jsx"));
const AdminPayments = lazy(() => import("./pages/admin/AdminPayments.jsx"));
import { applyPageMeta, metaForPath } from "./lib/meta.js";

// Keeps the document title, description, canonical URL and social tags in
// step with the current route. index.html carries the site-wide defaults.
function PageMeta() {
  const { pathname } = useLocation();
  useEffect(() => {
    const entry = metaForPath(pathname);
    applyPageMeta({
      title: entry?.title,
      description: entry?.description,
      path: pathname,
      noindex: entry?.noindex,
    });
  }, [pathname]);
  return null;
}

function PageLoading() {
  return (
    <section className="bg-cream px-5 py-24 text-center" aria-busy="true">
      <p className="text-lg text-ink-muted">Loading…</p>
    </section>
  );
}

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      document.getElementById(hash.slice(1))?.scrollIntoView();
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);
  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col">
        <PageMeta />
        <ScrollToTop />
        <Nav />
        <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
          <Suspense fallback={<PageLoading />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/events" element={<Events />} />
              <Route path="/events/:id" element={<EventDetail />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/membership" element={<Membership />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/sponsors" element={<Navigate to="/about#sponsors" replace />} />
              <Route path="/wall-of-honour" element={<WallOfHonour />} />
              <Route path="/donate" element={<Donate />} />
              <Route path="/login" element={<Login />} />
              <Route path="/member" element={<MemberArea />} />
              <Route path="/member/welcome" element={<MemberWelcome />} />
              <Route path="/member/reset" element={<ResetPassword />} />
              <Route path="/member/reset/confirm" element={<ResetConfirm />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminOverview />} />
                <Route path="events" element={<AdminEvents />} />
                <Route path="members" element={<AdminMembers />} />
                <Route path="sponsors" element={<AdminSponsors />} />
                <Route path="photos" element={<AdminGallery />} />
                <Route path="payments" element={<AdminPayments />} />
                <Route path="events/new" element={<AdminEventForm />} />
                <Route path="events/:id/edit" element={<AdminEventForm />} />
                <Route path="events/:id/bookings" element={<AdminBookings />} />
                <Route path="submissions" element={<AdminSubmissions />} />
                <Route path="team" element={<AdminTeam />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}
