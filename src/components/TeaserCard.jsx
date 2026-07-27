import { Link } from "react-router-dom";

// Flat teaser: no box, just a gold rule, title, line and link.
export default function TeaserCard({ icon, title, blurb, to, linkLabel }) {
  return (
    <article className="flex h-full flex-col border-t-2 border-gold pt-5">
      <span className="text-gold" aria-hidden="true">{icon}</span>
      <h3 className="mt-4 font-display text-lg font-semibold tracking-wide text-navy">{title}</h3>
      <p className="mt-2 flex-1 text-[0.95rem] text-ink-muted">{blurb}</p>
      <Link
        to={to}
        className="mt-4 font-body text-sm font-bold uppercase tracking-[0.08em] text-navy underline decoration-gold decoration-2 underline-offset-4 transition-colors hover:text-crimson"
      >
        {linkLabel}
      </Link>
    </article>
  );
}
