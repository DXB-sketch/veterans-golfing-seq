import { useState } from "react";
import RibbonRule from "../components/RibbonRule.jsx";
import SquarePayment from "../components/SquarePayment.jsx";

const presetDollars = [10, 25, 50, 100];

export default function Donate() {
  const [dollars, setDollars] = useState(25);
  const [custom, setCustom] = useState("");

  const activeDollars = custom !== "" ? Number(custom) : dollars;
  const cents = Number.isFinite(activeDollars)
    ? Math.round(activeDollars * 100)
    : 0;

  return (
    <>
      <section className="bg-navy px-5 py-14 md:py-20">
        <div className="mx-auto max-w-site">
          <p className="font-body text-[0.8125rem] font-bold uppercase tracking-[0.16em] text-gold">
            For veterans. By veterans. For the community.
          </p>
          <h1 className="text-page-title mt-3 font-display font-bold uppercase text-white">
            Donate
          </h1>
          <RibbonRule className="mt-5" dark />
          <p className="mt-6 max-w-2xl text-lg text-cream/90">
            Every donation goes to supporting Australian veteran members and
            the events we run for them.
          </p>
        </div>
      </section>

      <section className="bg-cream px-5 py-16 md:py-24">
        <div className="mx-auto max-w-xl">
          <h2 className="font-display text-2xl font-semibold tracking-wide text-navy">
            Choose an amount
          </h2>
          <RibbonRule className="mt-3" />

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {presetDollars.map((d) => {
              const active = custom === "" && dollars === d;
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => {
                    setDollars(d);
                    setCustom("");
                  }}
                  className={`min-h-[46px] border px-4 py-2.5 font-body text-sm font-bold uppercase tracking-[0.08em] transition-colors ${
                    active
                      ? "border-gold bg-gold text-navy-deep"
                      : "border-ink/20 bg-paper text-navy hover:border-gold"
                  }`}
                  aria-pressed={active}
                >
                  ${d}
                </button>
              );
            })}
          </div>

          <div className="mt-4">
            <label
              htmlFor="custom-amount"
              className="mb-1.5 block text-sm font-semibold text-ink"
            >
              Or enter your own amount (AUD)
            </label>
            <input
              id="custom-amount"
              type="number"
              min="2"
              max="7000"
              step="1"
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              placeholder="e.g. 40"
              className="w-full border border-ink/20 bg-paper px-4 py-3 text-ink placeholder:text-ink-muted/60 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold min-h-[46px]"
            />
          </div>

          <div className="mt-8">
            <SquarePayment itemType="donation" amount={cents} />
          </div>

          <p className="mt-6 text-sm text-ink-muted">
            [Confirm with the club whether donations are tax-deductible (DGR
            status) before adding any tax-deductibility wording.]
          </p>
        </div>
      </section>
    </>
  );
}
