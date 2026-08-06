import { useEffect, useState } from "react";
import RibbonRule from "../components/RibbonRule.jsx";
import FormField from "../components/FormField.jsx";
import SquarePayment from "../components/SquarePayment.jsx";
import { fetchPublicSponsors, logoUrl } from "../lib/sponsors.js";
import {
  TIERS,
  tierByKey,
  tierFromAmountCents,
  SPONSORSHIP_MIN_CENTS,
} from "../lib/tiers.js";

function TierBadge({ tierKey, className = "" }) {
  const tier = tierByKey(tierKey);
  if (!tier) return null;
  return (
    <span
      className={`inline-block px-2 py-0.5 text-[0.6875rem] font-bold uppercase tracking-[0.08em] ${tier.badgeClass} ${className}`}
    >
      {tier.label}
    </span>
  );
}

// Logo with a graceful fallback: if the file is missing or 404s, show a
// styled name block instead of a broken image.
function SponsorLogo({ sponsor }) {
  const [failed, setFailed] = useState(false);
  const src = logoUrl(sponsor.logo_path);

  if (!src || failed) {
    return (
      <span className="flex h-20 w-full items-center justify-center border border-ink/10 bg-cream px-4 text-center font-display text-lg font-semibold uppercase tracking-wide text-navy">
        {sponsor.company_name}
      </span>
    );
  }
  return (
    <img
      src={src}
      alt={`${sponsor.company_name} logo`}
      className="h-20 w-auto max-w-full object-contain"
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

function SponsorCard({ sponsor }) {
  const body = (
    <>
      <SponsorLogo sponsor={sponsor} />
      <span className="flex flex-wrap items-center justify-center gap-2">
        <span className="text-sm font-semibold text-ink">{sponsor.company_name}</span>
        <TierBadge tierKey={sponsor.tier} />
      </span>
      {sponsor.description && (
        <span className="text-sm text-ink-muted">{sponsor.description}</span>
      )}
    </>
  );

  const cls = "flex h-full flex-col items-center gap-3 bg-paper p-6 text-center shadow-soft";

  if (sponsor.website_url) {
    return (
      <a
        href={sponsor.website_url}
        target="_blank"
        rel="noopener noreferrer"
        className={`${cls} transition-colors hover:bg-cream`}
      >
        {body}
      </a>
    );
  }
  return <div className={cls}>{body}</div>;
}

const dollars = (cents) => `$${(cents / 100).toLocaleString("en-AU")}`;

// Rendered as the closing section of the About page (anchored at
// /about#sponsors); the old /sponsors route redirects there.
export default function Sponsors() {
  const [sponsors, setSponsors] = useState([]);
  const [loaded, setLoaded] = useState(false);

  // Become-a-sponsor form state
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");
  const [mode, setMode] = useState("tier"); // "tier" | "custom"
  const [tierKey, setTierKey] = useState("bronze");
  const [customDollars, setCustomDollars] = useState("");
  const [paidDone, setPaidDone] = useState(false);
  // Whether the server managed to record the sponsorship row — when it
  // couldn't, we ask the sponsor to email in so the payment can be matched.
  const [recorded, setRecorded] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchPublicSponsors().then((rows) => {
      if (!cancelled) {
        setSponsors(rows);
        setLoaded(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const chosenTier = tierByKey(tierKey);
  const customCents = Number.isFinite(Number(customDollars))
    ? Math.round(Number(customDollars) * 100)
    : 0;
  const amountCents = mode === "tier" ? chosenTier?.grantsAtCents ?? 0 : customCents;
  const previewKey = tierFromAmountCents(amountCents);
  const previewTier = previewKey ? tierByKey(previewKey) : null;

  const detailsComplete =
    companyName.trim() !== "" &&
    contactName.trim() !== "" &&
    contactEmail.trim() !== "";
  const amountOk = amountCents >= SPONSORSHIP_MIN_CENTS;

  return (
    <>
      <section id="sponsors" className="scroll-mt-20 bg-navy px-5 py-14 md:py-20">
        <div className="mx-auto max-w-site">
          <p className="font-body text-[0.8125rem] font-bold uppercase tracking-[0.16em] text-gold">
            Support the mission
          </p>
          <h2 className="text-page-title mt-3 font-display font-bold uppercase text-white">
            Sponsors &amp; partners
          </h2>
          <RibbonRule className="mt-5" dark />
          <p className="mt-6 max-w-2xl text-lg text-cream/90">
            The club is seeking sponsors, government grants and donations to
            support Australian Defence veterans and their families. Every
            dollar goes to our veteran members and the events we run for them.
            Sponsorship puts your name behind that.
          </p>
        </div>
      </section>

      {loaded && sponsors.length > 0 && (
        <section className="bg-paper px-5 py-16 md:py-24">
          <div className="mx-auto max-w-site">
            <h2 className="font-display text-2xl font-semibold tracking-wide text-navy">
              Our sponsors
            </h2>
            <RibbonRule className="mt-3" />
            <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {sponsors.map((s) => (
                <li key={s.id ?? s.company_name}>
                  <SponsorCard sponsor={s} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section className="bg-cream px-5 py-16 md:py-24">
        <div className="mx-auto max-w-site">
          <h2 className="font-display text-2xl font-semibold tracking-wide text-navy">
            Sponsorship packages
          </h2>
          <RibbonRule className="mt-3" />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {TIERS.map((tier) => (
              <article
                key={tier.key}
                className="flex flex-col border-t-4 border-gold bg-paper p-6 shadow-soft"
              >
                <TierBadge tierKey={tier.key} className="self-start" />
                <p className="mt-4 font-display text-3xl font-bold text-navy">
                  {tier.priceLabel}
                </p>
                <ul className="mt-5 flex-1 space-y-2 text-sm text-ink-muted">
                  {tier.benefits.map((b) => (
                    <li key={b} className="flex gap-2">
                      <span className="text-gold" aria-hidden="true">
                        ·
                      </span>
                      {b}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-paper px-5 py-16 md:py-24">
        <div className="mx-auto max-w-xl">
          <h2 className="font-display text-2xl font-semibold uppercase tracking-wide text-navy">
            Become a sponsor
          </h2>
          <RibbonRule className="mt-3" />
          <p className="mt-5 text-ink-muted">
            We&apos;d be proud to put your name behind the veteran community,
            from local businesses to national brands. Pay your sponsorship
            online below, or email{" "}
            <a href="mailto:seqdvgc@gmail.com" className="font-semibold text-navy underline">
              seqdvgc@gmail.com
            </a>{" "}
            if you&apos;d rather talk it through first.
          </p>

          {paidDone ? (
            <div className="mt-8 border-t-4 border-gold bg-cream p-6">
              <p className="font-display text-lg font-semibold tracking-wide text-navy">
                Thank you for sponsoring the club
              </p>
              <p className="mt-2 text-sm text-ink-muted">
                Your sponsorship has been received. The club will be in touch
                at your contact email to arrange your logo and confirm the
                details before your sponsorship goes live on the site.
              </p>
              {!recorded && (
                <p className="mt-2 text-sm text-ink-muted">
                  One more thing: we couldn&apos;t automatically link your
                  payment to your company details, so please email{" "}
                  <a
                    href="mailto:seqdvgc@gmail.com"
                    className="font-semibold text-navy underline"
                  >
                    seqdvgc@gmail.com
                  </a>{" "}
                  with your company name so we can match it up.
                </p>
              )}
            </div>
          ) : (
            <>
              <div className="mt-8 space-y-4">
                <FormField
                  label="Company name"
                  id="sponsor-company"
                  required
                  autoComplete="organization"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Acme Engineering Pty Ltd"
                />
                <FormField
                  label="Contact name"
                  id="sponsor-contact-name"
                  required
                  autoComplete="name"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="e.g. Jane Citizen"
                />
                <FormField
                  label="Contact email"
                  id="sponsor-contact-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="e.g. jane@acme.com.au"
                />
                <FormField
                  label="Website (optional)"
                  id="sponsor-website"
                  type="url"
                  autoComplete="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="e.g. https://acme.com.au"
                />
                <FormField
                  label="About your business (optional)"
                  id="sponsor-description"
                  as="textarea"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="A sentence or two we can show alongside your logo"
                />
              </div>

              <div className="mt-8">
                <p className="text-sm font-semibold text-ink">Choose your sponsorship</p>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  {[
                    { value: "tier", label: "Pick a tier" },
                    { value: "custom", label: "Custom amount" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setMode(opt.value)}
                      aria-pressed={mode === opt.value}
                      className={`min-h-[46px] border px-4 py-2.5 font-body text-sm font-bold uppercase tracking-[0.08em] transition-colors ${
                        mode === opt.value
                          ? "border-gold bg-gold text-navy-deep"
                          : "border-ink/20 bg-paper text-navy hover:border-gold"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {mode === "tier" ? (
                  <div className="mt-4 space-y-2">
                    {TIERS.map((tier) => {
                      const active = tierKey === tier.key;
                      return (
                        <button
                          key={tier.key}
                          type="button"
                          onClick={() => setTierKey(tier.key)}
                          aria-pressed={active}
                          className={`flex w-full items-center justify-between gap-3 border px-4 py-3 text-left transition-colors ${
                            active
                              ? "border-gold bg-cream"
                              : "border-ink/20 bg-paper hover:border-gold"
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <TierBadge tierKey={tier.key} />
                          </span>
                          <span className="font-display text-lg font-bold text-navy">
                            {dollars(tier.grantsAtCents)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="mt-4">
                    <label
                      htmlFor="sponsor-amount"
                      className="mb-1.5 block text-sm font-semibold text-ink"
                    >
                      Sponsorship amount (AUD, minimum {dollars(SPONSORSHIP_MIN_CENTS)})
                    </label>
                    <input
                      id="sponsor-amount"
                      type="number"
                      min={SPONSORSHIP_MIN_CENTS / 100}
                      step="1"
                      value={customDollars}
                      onChange={(e) => setCustomDollars(e.target.value)}
                      placeholder="e.g. 750"
                      className="w-full border border-ink/20 bg-paper px-4 py-3 text-ink placeholder:text-ink-muted/60 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold min-h-[46px]"
                    />
                    <p className="mt-2 flex items-center gap-2 text-sm text-ink-muted">
                      {previewTier ? (
                        <>
                          That makes you a<TierBadge tierKey={previewTier.key} />
                          sponsor.
                        </>
                      ) : (
                        <>
                          Sponsorship starts at {dollars(SPONSORSHIP_MIN_CENTS)}.
                          Smaller amounts are very welcome as donations on our
                          Donate page.
                        </>
                      )}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-8">
                {!detailsComplete ? (
                  <p className="border border-ink/10 bg-cream p-4 text-sm text-ink-muted">
                    Fill in your company name, contact name and contact email
                    above and the secure payment form will appear here.
                  </p>
                ) : !amountOk ? (
                  <p className="border border-ink/10 bg-cream p-4 text-sm text-ink-muted">
                    Enter a sponsorship amount of at least{" "}
                    {dollars(SPONSORSHIP_MIN_CENTS)} to continue.
                  </p>
                ) : (
                  <SquarePayment
                    purpose="sponsorship"
                    amountCents={amountCents}
                    payerName={contactName.trim()}
                    payerEmail={contactEmail.trim()}
                    sponsor={{
                      companyName: companyName.trim(),
                      contactName: contactName.trim(),
                      contactEmail: contactEmail.trim(),
                      websiteUrl: website.trim() || undefined,
                      description: description.trim() || undefined,
                    }}
                    onSuccess={(paymentId, data) => {
                      setRecorded(data?.recorded !== false);
                      setPaidDone(true);
                    }}
                  />
                )}
              </div>

              <p className="mt-6 text-sm text-ink-muted">
                After payment, the club will be in touch about your logo and
                artwork before your sponsorship appears on the site.
              </p>
            </>
          )}
        </div>
      </section>
    </>
  );
}
