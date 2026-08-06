import RibbonRule from "../components/RibbonRule.jsx";
import { honourEntries } from "../data/honour.js";

// NOTE: entries live in src/data/honour.js for now. If the club wants to
// self-manage these later, this can migrate to a Supabase table + admin page
// (same pattern as events) — a data file is fine until then.

export default function WallOfHonour() {
  return (
    <>
      <section className="bg-navy px-5 py-14 md:py-20">
        <div className="mx-auto max-w-site">
          <p className="font-body text-[0.8125rem] font-bold uppercase tracking-[0.16em] text-gold">
            United by service. Connected by golf.
          </p>
          <h1 className="text-page-title mt-3 font-display font-bold uppercase text-white">
            Wall of Honour
          </h1>
          <RibbonRule className="mt-5" dark />
          <p className="mt-6 max-w-2xl text-lg text-cream/90">
            Honouring the service and stories of our veteran community, the
            people behind the Club, across Army, Navy and Air Force.
          </p>
        </div>
      </section>

      <section className="bg-cream px-5 py-16 md:py-24">
        <div className="mx-auto max-w-site">
          {honourEntries.length === 0 ? (
            <div className="mx-auto max-w-xl border-t-4 border-gold bg-paper p-10 text-center shadow-soft">
              <p className="font-display text-2xl font-semibold tracking-wide text-navy">
                Stories coming soon
              </p>
              <RibbonRule className="mt-3" />
              <p className="mt-4 text-ink-muted">
                We&apos;re gathering them with care. Check back soon to meet
                the veterans behind the Club.
              </p>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2">
              {honourEntries.map((entry) => (
                <article
                  key={entry.name}
                  className="flex flex-col gap-5 border-t-4 border-gold bg-paper p-8 shadow-soft sm:flex-row"
                >
                  {entry.photo ? (
                    <img
                      src={entry.photo}
                      alt={`Portrait of ${entry.name}`}
                      className="h-32 w-32 shrink-0 rounded-[12px] object-cover"
                    />
                  ) : (
                    <div
                      className="flex h-32 w-32 shrink-0 items-center justify-center rounded-[12px] bg-navy/5"
                      aria-hidden="true"
                    >
                      <RibbonRule />
                    </div>
                  )}
                  <div>
                    <h2 className="font-display text-xl font-semibold tracking-wide text-navy">
                      {entry.name}
                    </h2>
                    <p className="mt-1 text-sm font-semibold text-ink-muted">
                      {entry.service}
                      {entry.years ? ` · ${entry.years}` : ""}
                    </p>
                    <p className="mt-3 text-[0.95rem] text-ink-muted">
                      {entry.story}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
