import RibbonRule from "../components/RibbonRule.jsx";
import Button from "../components/Button.jsx";
import { storeUrl, products } from "../data/merch.js";

export default function Merch() {
  const empty = !storeUrl && products.length === 0;

  return (
    <>
      <section className="bg-navy px-5 py-14 md:py-20">
        <div className="mx-auto max-w-site">
          <p className="font-body text-[0.8125rem] font-bold uppercase tracking-[0.16em] text-gold">
            Wear the colours
          </p>
          <h1 className="text-page-title mt-3 font-display font-bold uppercase text-white">
            Club merch
          </h1>
          <RibbonRule className="mt-5" dark />
          <p className="mt-6 max-w-2xl text-lg text-cream/90">
            Hats, shirts and club gear — every purchase supports veterans and
            the events we run for them.
          </p>
          {storeUrl && (
            <Button
              href={storeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8"
            >
              Shop the store
            </Button>
          )}
        </div>
      </section>

      <section className="bg-cream px-5 py-16 md:py-24">
        <div className="mx-auto max-w-site">
          {empty ? (
            <div className="mx-auto max-w-xl border-t-4 border-gold bg-paper p-10 text-center shadow-soft">
              <p className="font-display text-2xl font-semibold tracking-wide text-navy">
                Merch coming soon
              </p>
              <RibbonRule className="mt-3" />
              <p className="mt-4 text-ink-muted">
                The club store isn&apos;t open just yet. In the meantime,
                membership includes a club hat — or follow us on
                Facebook for updates.
              </p>
            </div>
          ) : (
            products.length > 0 && (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((p) => (
                  <article
                    key={p.name}
                    className="flex flex-col overflow-hidden border-t-4 border-gold bg-paper shadow-soft"
                  >
                    {p.image ? (
                      <img
                        src={p.image}
                        alt={p.name}
                        className="h-56 w-full object-cover"
                      />
                    ) : (
                      <div
                        className="flex h-56 w-full items-center justify-center bg-navy/5"
                        aria-hidden="true"
                      >
                        <RibbonRule />
                      </div>
                    )}
                    <div className="flex flex-1 flex-col p-6">
                      <h2 className="font-display text-lg font-semibold tracking-wide text-navy">
                        {p.name}
                      </h2>
                      {p.price && (
                        <p className="mt-1 font-semibold text-ink">{p.price}</p>
                      )}
                      {p.note && (
                        <p className="mt-2 flex-1 text-sm text-ink-muted">
                          {p.note}
                        </p>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )
          )}
        </div>
      </section>
    </>
  );
}
