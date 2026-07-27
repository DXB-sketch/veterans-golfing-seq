import { useState } from "react";
import RibbonRule from "../components/RibbonRule.jsx";
import { EventRow } from "../components/EventCard.jsx";
import { events, regions, statuses } from "../data/events.js";

function FilterTab({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`min-h-[44px] border-b-2 px-1 pb-1 pt-2 font-body text-sm font-bold uppercase tracking-[0.06em] transition-colors ${
        active
          ? "border-gold text-navy"
          : "border-transparent text-ink-muted hover:text-navy"
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
      {/* Events identity: compact navy banner with a solid gold baseline. */}
      <section className="border-b-4 border-gold bg-navy px-5 py-12 md:py-16">
        <div className="mx-auto max-w-site">
          <p className="font-body text-[0.8125rem] font-bold uppercase tracking-[0.16em] text-gold">
            Golf days &amp; club events
          </p>
          <h1 className="text-page-title mt-3 font-display font-bold uppercase text-white">
            Events
          </h1>
          <RibbonRule className="mt-5" dark />
          <p className="mt-5 max-w-xl text-cream/85">
            Brisbane, Sunshine Coast and Gold Coast. Filter by region to find a
            round near you.
          </p>
        </div>
      </section>

      <section className="bg-cream px-5 py-14 md:py-20">
        <div className="mx-auto max-w-site">
          <div className="flex flex-col gap-8 border-b border-ink/10 pb-6 sm:flex-row sm:gap-0">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold">
                Filter by region
              </p>
              <div className="mt-1 flex flex-wrap gap-x-6">
                {["All", ...regions].map((r) => (
                  <FilterTab key={r} active={region === r} onClick={() => setRegion(r)}>
                    {r}
                  </FilterTab>
                ))}
              </div>
            </div>
            <div className="sm:ml-12 sm:border-l sm:border-ink/10 sm:pl-12">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold">
                Filter by status
              </p>
              <div className="mt-1 flex flex-wrap gap-x-6">
                {["All", ...statuses].map((s) => (
                  <FilterTab key={s} active={status === s} onClick={() => setStatus(s)}>
                    {s}
                  </FilterTab>
                ))}
              </div>
            </div>
          </div>

          {filtered.length > 0 ? (
            <div className="divide-y divide-ink/10">
              {filtered.map((e) => (
                <EventRow key={e.id} event={e} />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center">
              <p className="font-display text-xl font-semibold tracking-wide text-navy">
                No events listed yet
              </p>
              <p className="mt-2 text-ink-muted">
                Check back soon or follow us on Facebook.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
