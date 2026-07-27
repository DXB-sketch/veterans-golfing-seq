import { Link } from "react-router-dom";

export default function TeaserCard({ icon, title, blurb, to, linkLabel }) {
  return (
    <article className="flex h-full flex-col rounded-card bg-paper p-6 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lift">
      <span className="text-gold" aria-hidden="true">{icon}</span>
      <h3 className="mt-4 font-display text-xl font-semibold uppercase text-navy">{title}</h3>
      <p className="mt-2 flex-1 text-[0.95rem] text-ink-muted">{blurb}</p>
      <Link
        to={to}
        className="mt-4 font-display text-sm font-semibold uppercase tracking-wide text-navy underline decoration-gold decoration-2 underline-offset-4 transition-colors hover:text-crimson"
      >
        {linkLabel} →
      </Link>
    </article>
  );
}
