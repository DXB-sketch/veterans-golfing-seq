import { useState } from "react";
import Section from "../components/Section.jsx";
import RibbonRule from "../components/RibbonRule.jsx";
import EventCard from "../components/EventCard.jsx";
import { events, regions, statuses } from "../data/events.js";

function FilterPill({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`min-h-[44px] rounded-full px-5 py-2 font-body text-sm font-semibold transition-colors ${
        active
          ? "bg-navy text-gold-bright"
          : "bg-paper text-ink hover:bg-navy/5"
      }`}
    >
      {children}
    </button>
  );
}

export default function Events() {
  const [region, setRegion] = useState("All");
  const [status, setStatus] = useState("Upcoming");

  const filtered = events.filter(
    (e) =>
      (region === "All" || e.region === region) &&
      (status === "All" || e.status === status)
  );

  return (
    <>
      <section className="bg-navy px-5 py-16 text-center md:py-20">
        <div className="mx-auto max-w-site">
          <p className="font-display text-[0.8125rem] font-medium uppercase tracking-[0.14em] text-gold">
            Golf days &amp; club events
          </p>
          <h1 className="text-page-title mt-3 font-display font-bold uppercase text-white">
            Events
          </h1>
          <div className="mt-5 flex justify-center">
            <RibbonRule dark />
          </div>
          <p className="mx-auto mt-5 max-w-xl text-cream/85">
            Brisbane, Sunshine Coast and Gold Coast — filter by region to find
            a round near you.
          </p>
        </div>
      </section>

      <Section tone="cream">
        <div className="mb-10 flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-sm font-semibold text-ink-muted">Region:</span>
            {["All", ...regions].map((r) => (
              <FilterPill key={r} active={region === r} onClick={() => setRegion(r)}>
                {r}
              </FilterPill>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-sm font-semibold text-ink-muted">Status:</span>
            {["All", ...statuses].map((s) => (
              <FilterPill key={s} active={status === s} onClick={() => setStatus(s)}>
                {s}
              </FilterPill>
            ))}
          </div>
        </div>

        {filtered.length > 0 ? (
          <div className="grid gap-6 lg:grid-cols-2">
            {filtered.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        ) : (
          <div className="rounded-card bg-paper p-12 text-center shadow-soft">
            <p className="font-display text-xl font-semibold uppercase text-navy">
              No events listed yet
            </p>
            <p className="mt-2 text-ink-muted">
              Check back soon or follow us on Facebook.
            </p>
          </div>
        )}
      </Section>
    </>
  );
}
