import { useState } from "react";
import { NavLink } from "react-router-dom";
import RibbonRule from "./RibbonRule.jsx";

const links = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/events", label: "Events" },
  { to: "/membership", label: "Membership" },
  { to: "/merch", label: "Merch" },
  { to: "/resources", label: "Resources" },
  { to: "/contact", label: "Contact" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);

  const linkClass = ({ isActive }) =>
    `relative px-1 py-2 font-body text-[0.95rem] font-semibold transition-colors ${
      isActive
        ? "text-gold-bright after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-gold"
        : "text-white hover:text-gold-bright"
    }`;

  return (
    <nav className="sticky top-0 z-50 bg-navy shadow-soft" aria-label="Main navigation">
      <div className="mx-auto flex max-w-site items-center justify-between gap-4 px-5 py-3">
        <NavLink to="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <img
            src="/SEQDVGC-logo-transparent.png"
            alt="SEQDVGC crest"
            className="h-14 w-14 shrink-0"
          />
          <span className="leading-tight text-white">
            <span className="block font-body text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-cream/80">
              South East Queensland
            </span>
            <span className="block font-display text-[1rem] font-bold uppercase tracking-[0.06em] text-gold-bright">
              Defence Veterans
            </span>
            <span className="block font-body text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-cream/80">
              Golf Club Inc.
            </span>
          </span>
        </NavLink>

        <div className="hidden items-center gap-6 lg:flex">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={linkClass} end={l.to === "/"}>
              {l.label}
            </NavLink>
          ))}
        </div>

        <button
          className="flex h-11 w-11 items-center justify-center text-white lg:hidden"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            {open ? (
              <>
                <line x1="5" y1="5" x2="19" y2="19" />
                <line x1="19" y1="5" x2="5" y2="19" />
              </>
            ) : (
              <>
                <line x1="4" y1="7" x2="20" y2="7" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="17" x2="20" y2="17" />
              </>
            )}
          </svg>
        </button>
      </div>

      {open && (
        <div className="border-t border-gold/15 bg-navy px-5 pb-8 pt-4 lg:hidden">
          <div className="flex flex-col gap-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex min-h-[44px] items-center px-3 font-body text-lg font-semibold ${
                    isActive ? "bg-navy-deep text-gold-bright" : "text-white hover:bg-navy-deep"
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </div>
          <RibbonRule className="mt-6" dark />
        </div>
      )}
    </nav>
  );
}
