import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Nav from "./components/Nav.jsx";
import Footer from "./components/Footer.jsx";
import Home from "./pages/Home.jsx";
import About from "./pages/About.jsx";
import Events from "./pages/Events.jsx";
import EventDetail from "./pages/EventDetail.jsx";
import Gallery from "./pages/Gallery.jsx";
import Membership from "./pages/Membership.jsx";
import Resources from "./pages/Resources.jsx";
import Contact from "./pages/Contact.jsx";
import Privacy from "./pages/Privacy.jsx";
import Terms from "./pages/Terms.jsx";
import Sponsors from "./pages/Sponsors.jsx";
import WallOfHonour from "./pages/WallOfHonour.jsx";
import Merch from "./pages/Merch.jsx";
import Donate from "./pages/Donate.jsx";
import { AuthProvider } from "./admin/AuthProvider.jsx";
import AdminLayout from "./pages/admin/AdminLayout.jsx";
import AdminEvents from "./pages/admin/AdminEvents.jsx";
import AdminEventForm from "./pages/admin/AdminEventForm.jsx";
import AdminBookings from "./pages/admin/AdminBookings.jsx";
import AdminSubmissions from "./pages/admin/AdminSubmissions.jsx";
import AdminTeam from "./pages/admin/AdminTeam.jsx";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col">
        <ScrollToTop />
        <Nav />
        <main className="flex-1">
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
            <Route path="/sponsors" element={<Sponsors />} />
            <Route path="/wall-of-honour" element={<WallOfHonour />} />
            <Route path="/merch" element={<Merch />} />
            <Route path="/donate" element={<Donate />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminEvents />} />
              <Route path="events/new" element={<AdminEventForm />} />
              <Route path="events/:id/edit" element={<AdminEventForm />} />
              <Route path="events/:id/bookings" element={<AdminBookings />} />
              <Route path="submissions" element={<AdminSubmissions />} />
              <Route path="team" element={<AdminTeam />} />
            </Route>
          </Routes>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}
