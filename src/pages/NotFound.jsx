import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { applyPageMeta } from "../lib/meta.js";
import Section from "../components/Section.jsx";
import Button from "../components/Button.jsx";

// Catch-all for unknown URLs. The SPA rewrite serves every path with a 200,
// so tell search engines not to index this one.
export default function NotFound() {
  const { pathname } = useLocation();
  useEffect(() => {
    applyPageMeta({ title: "Page not found", path: pathname, noindex: true });
  }, [pathname]);

  return (
    <Section eyebrow="404" title="We can't find that page" tone="cream" center>
      <p className="mx-auto max-w-xl text-ink-muted">
        The link may be out of date, or the page may have moved. Try one of
        these instead.
      </p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Button to="/">Go to the home page</Button>
        <Button to="/events" variant="secondary-light">
          See upcoming events
        </Button>
      </div>
    </Section>
  );
}
