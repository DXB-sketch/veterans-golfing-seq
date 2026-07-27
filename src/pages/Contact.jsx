import { useState } from "react";
import Section from "../components/Section.jsx";
import RibbonRule from "../components/RibbonRule.jsx";
import Button from "../components/Button.jsx";
import FormField from "../components/FormField.jsx";

export default function Contact() {
  const [sent, setSent] = useState(false);

  // Mock-up only: no backend yet. V1 will post to Supabase / email endpoint.
  function handleSubmit(e) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <>
      <section className="bg-navy px-5 py-16 text-center md:py-20">
        <div className="mx-auto max-w-site">
          <p className="font-display text-[0.8125rem] font-medium uppercase tracking-[0.14em] text-gold">
            We&apos;d love to hear from you
          </p>
          <h1 className="text-page-title mt-3 font-display font-bold uppercase text-white">
            Contact us
          </h1>
          <div className="mt-5 flex justify-center">
            <RibbonRule dark />
          </div>
        </div>
      </section>

      <Section tone="cream">
        <div className="grid gap-12 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <h2 className="font-display text-2xl font-semibold uppercase text-navy">
              Get in touch
            </h2>
            <RibbonRule className="mt-3" />
            <ul className="mt-6 space-y-5">
              <li>
                <p className="font-display text-xs font-medium uppercase tracking-[0.14em] text-gold">
                  Email
                </p>
                <a
                  href="mailto:seqdvgc@gmail.com"
                  className="mt-1 block font-semibold text-ink hover:text-crimson"
                >
                  seqdvgc@gmail.com
                </a>
              </li>
              <li>
                <p className="font-display text-xs font-medium uppercase tracking-[0.14em] text-gold">
                  Facebook
                </p>
                <a
                  href="https://www.facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 block font-semibold text-ink hover:text-crimson"
                >
                  South East Queensland Defence Veterans Golf Club
                </a>
                <p className="text-sm text-ink-muted">
                  Messenger is the quickest way to reach us.
                </p>
              </li>
              <li>
                <p className="font-display text-xs font-medium uppercase tracking-[0.14em] text-gold">
                  Where we play
                </p>
                <p className="mt-1 font-semibold text-ink">
                  South East Queensland
                </p>
                <p className="text-sm text-ink-muted">
                  Brisbane · Sunshine Coast · Gold Coast
                </p>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-3">
            {sent ? (
              <div className="rounded-card bg-paper p-10 text-center shadow-soft">
                <p className="font-display text-2xl font-semibold uppercase text-navy">
                  Message sent
                </p>
                <RibbonRule className="mt-3" />
                <p className="mt-4 text-ink-muted">
                  Thanks for reaching out — we&apos;ll get back to you as soon
                  as we can.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="grid gap-5 rounded-card bg-paper p-8 shadow-soft sm:grid-cols-2"
              >
                <FormField label="Your name" id="name" required autoComplete="name" />
                <FormField label="Email" id="email" type="email" required autoComplete="email" />
                <div className="sm:col-span-2">
                  <FormField label="Subject" id="subject" />
                </div>
                <div className="sm:col-span-2">
                  <FormField label="Message" id="message" as="textarea" required />
                </div>
                <div className="sm:col-span-2">
                  <Button type="submit" className="w-full sm:w-auto">
                    Send message
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </Section>
    </>
  );
}
