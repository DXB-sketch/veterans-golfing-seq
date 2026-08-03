import { useState } from "react";
import { Link } from "react-router-dom";
import RibbonRule from "../components/RibbonRule.jsx";
import Button from "../components/Button.jsx";
import FormField from "../components/FormField.jsx";
import { supabase } from "../lib/supabase.js";
import { FACEBOOK_URL } from "../lib/site.js";

export default function Contact() {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    const f = new FormData(e.target);
    const subject = f.get("subject");
    setError(null);
    setSending(true);
    const { error: insertError } = await supabase.from("contact_messages").insert({
      name: f.get("name"),
      email: f.get("email"),
      // The table has no subject column; keep it at the top of the message.
      message: subject ? `Subject: ${subject}\n\n${f.get("message")}` : f.get("message"),
    });
    setSending(false);
    if (insertError) {
      setError(
        "Sorry, your message didn't go through. Please check your internet connection and try again, or email us at seqdvgc@gmail.com."
      );
    } else {
      setSent(true);
    }
  }

  return (
    // Contact identity: split page. Navy details panel left, form right.
    <div className="flex flex-col lg:min-h-[calc(100vh-80px)] lg:flex-row">
      <aside className="bg-navy-deep px-5 py-14 text-white md:py-20 lg:w-[42%] lg:px-12">
        <div className="mx-auto max-w-md lg:mx-0 lg:ml-auto lg:max-w-sm">
          <p className="font-body text-[0.8125rem] font-bold uppercase tracking-[0.16em] text-gold">
            We&apos;d love to hear from you
          </p>
          <h1 className="text-page-title mt-3 font-display font-bold uppercase text-white">
            Contact us
          </h1>
          <RibbonRule className="mt-5" dark />

          <ul className="mt-10 space-y-8">
            <li>
              <p className="font-body text-xs font-bold uppercase tracking-[0.16em] text-gold">
                Email
              </p>
              <a
                href="mailto:seqdvgc@gmail.com"
                className="mt-1 block font-semibold text-cream hover:text-gold-bright"
              >
                seqdvgc@gmail.com
              </a>
            </li>
            <li>
              <p className="font-body text-xs font-bold uppercase tracking-[0.16em] text-gold">
                Facebook
              </p>
              <a
                href={FACEBOOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 block font-semibold text-cream hover:text-gold-bright"
              >
                South East Queensland Defence Veterans Golf Club
              </a>
              <p className="mt-1 text-sm text-cream/70">
                Messenger is the quickest way to reach us.
              </p>
            </li>
            <li>
              <p className="font-body text-xs font-bold uppercase tracking-[0.16em] text-gold">
                Where we play
              </p>
              <p className="mt-1 font-semibold text-cream">South East Queensland</p>
              <p className="mt-1 text-sm text-cream/70">
                Brisbane · Sunshine Coast · Gold Coast
              </p>
            </li>
          </ul>
        </div>
      </aside>

      <main className="flex-1 bg-cream px-5 py-14 md:py-20 lg:px-12">
        <div className="mx-auto max-w-2xl lg:mx-0">
          {sent ? (
            <div className="border-t-4 border-gold bg-paper p-10 text-center">
              <p className="font-display text-2xl font-semibold tracking-wide text-navy">
                Message sent
              </p>
              <RibbonRule className="mt-3" />
              <p className="mt-4 text-ink-muted">
                Thanks for reaching out. We&apos;ll get back to you as soon as
                we can.
              </p>
            </div>
          ) : (
            <>
              <h2 className="font-display text-2xl font-semibold tracking-wide text-navy">
                Send us a message
              </h2>
              <RibbonRule className="mt-3" />
              <form onSubmit={handleSubmit} className="mt-8 grid gap-5 sm:grid-cols-2">
                <FormField label="Your name" id="name" required autoComplete="name" />
                <FormField label="Email" id="email" type="email" required autoComplete="email" />
                <div className="sm:col-span-2">
                  <FormField label="Subject" id="subject" />
                </div>
                <div className="sm:col-span-2">
                  <FormField label="Message" id="message" as="textarea" required />
                </div>
                {error && (
                  <p className="border-l-4 border-crimson bg-crimson/5 p-4 text-sm text-ink sm:col-span-2">
                    {error}
                  </p>
                )}
                <div className="sm:col-span-2">
                  <Button type="submit" disabled={sending} className="w-full sm:w-auto">
                    {sending ? "Sending…" : "Send message"}
                  </Button>
                  <p className="mt-3 text-sm text-ink-muted">
                    By submitting, you agree to our{" "}
                    <Link to="/privacy" className="underline decoration-gold decoration-2 underline-offset-2 hover:text-navy">
                      Privacy Policy
                    </Link>
                    .
                  </p>
                </div>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
