import RibbonRule from "../components/RibbonRule.jsx";
import Photo from "../components/Photo.jsx";
import { allPhotos } from "../lib/photos.js";
import { FACEBOOK_URL } from "../lib/site.js";

export default function Gallery() {
  const photos = allPhotos();

  return (
    <>
      {/* Same compact navy identity banner as Events. */}
      <section className="border-b-4 border-gold bg-navy px-5 py-12 md:py-16">
        <div className="mx-auto max-w-site">
          <p className="font-body text-[0.8125rem] font-bold uppercase tracking-[0.16em] text-gold">
            From our golf days
          </p>
          <h1 className="text-page-title mt-3 font-display font-bold uppercase text-white">
            Gallery
          </h1>
          <RibbonRule className="mt-5" dark />
          <p className="mt-5 max-w-xl text-cream/85">
            Moments from the course across Brisbane, the Sunshine Coast and the
            Gold Coast. The full albums live on our Facebook page.
          </p>
        </div>
      </section>

      <section className="bg-cream px-5 py-14 md:py-20">
        <div className="mx-auto max-w-site">
          {photos.length > 0 ? (
            <div className="columns-1 gap-6 sm:columns-2 lg:columns-3">
              {photos.map((p) => (
                <Photo
                  key={p.src}
                  photo={p}
                  ratio={p.orientation === "portrait" ? "aspect-[4/5]" : "aspect-[3/2]"}
                  position="object-top"
                  caption
                  className="mb-6 break-inside-avoid"
                />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center">
              <p className="font-display text-xl font-semibold tracking-wide text-navy">
                Photos are on the way
              </p>
              <p className="mt-2 text-ink-muted">
                In the meantime, find us on Facebook for the latest from the
                course.
              </p>
            </div>
          )}

          <p className="mt-10 border-t border-ink/10 pt-8">
            <a
              href={FACEBOOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-body text-sm font-bold uppercase tracking-[0.08em] text-navy underline decoration-gold decoration-2 underline-offset-4 transition-colors hover:text-crimson"
            >
              See the full albums on Facebook
            </a>
          </p>
        </div>
      </section>
    </>
  );
}
