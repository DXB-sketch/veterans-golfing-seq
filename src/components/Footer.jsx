import { Link } from "react-router-dom";
import RibbonRule from "./RibbonRule.jsx";
import { FACEBOOK_URL } from "../lib/site.js";

export default function Footer() {
  return (
    <footer className="bg-navy-deep px-5 py-16 text-cream">
      <div className="mx-auto max-w-site">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <img
              src="/SEQDVGC-logo-transparent.png"
              alt="SEQDVGC crest"
              className="h-20 w-20"
            />
            <p className="mt-4 max-w-xs text-sm text-cream/80">
              South East Queensland Defence Veterans Golf Club Inc. is a
              registered non-profit incorporated association.
            </p>
            <RibbonRule className="mt-5" dark />
          </div>

          <div>
            <h2 className="font-display text-sm font-semibold uppercase tracking-[0.14em] text-gold">
              Quick links
            </h2>
            <ul className="mt-4 space-y-2 text-sm">
              {[
                ["About the club", "/about"],
                ["Events", "/events"],
                ["Gallery", "/gallery"],
                ["Membership", "/membership"],
                ["Veteran resources", "/resources"],
                ["Contact us", "/contact"],
                ["Committee login", "/admin"],
              ].map(([label, to]) => (
                <li key={to}>
                  <Link to={to} className="text-cream/85 transition-colors hover:text-gold-bright">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="font-display text-sm font-semibold uppercase tracking-[0.14em] text-gold">
              More
            </h2>
            <ul className="mt-4 space-y-2 text-sm">
              {[
                ["Club merch", "/merch"],
                ["Sponsors & partners", "/sponsors"],
                ["Wall of Honour", "/wall-of-honour"],
                ["Donate", "/donate"],
              ].map(([label, to]) => (
                <li key={to}>
                  <Link to={to} className="text-cream/85 transition-colors hover:text-gold-bright">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="font-display text-sm font-semibold uppercase tracking-[0.14em] text-gold">
              Get in touch
            </h2>
            <ul className="mt-4 space-y-2 text-sm text-cream/85">
              <li>
                <a href="mailto:seqdvgc@gmail.com" className="transition-colors hover:text-gold-bright">
                  seqdvgc@gmail.com
                </a>
              </li>
              <li>
                <a
                  href={FACEBOOK_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-gold-bright"
                >
                  Facebook: South East Queensland Defence Veterans Golf Club
                </a>
              </li>
              <li>South East Queensland, Australia</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-gold/15 pt-6 text-center text-sm text-cream/70">
          <p className="font-display text-[0.95rem] font-semibold uppercase tracking-[0.14em] text-gold-bright">
            Proudly supporting Defence veterans
          </p>
          <p className="mt-2">
            © {new Date().getFullYear()} South East Queensland Defence Veterans
            Golf Club Inc. · ABN 00 000 000 000 (placeholder)
          </p>
          <p className="mt-2 space-x-3">
            <Link to="/privacy" className="transition-colors hover:text-gold-bright">
              Privacy Policy
            </Link>
            <span aria-hidden="true">·</span>
            <Link to="/terms" className="transition-colors hover:text-gold-bright">
              Terms of Use
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
