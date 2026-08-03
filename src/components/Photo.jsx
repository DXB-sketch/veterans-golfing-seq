// Framed club photo with the navy duotone treatment from DESIGN_PROMPT.md §3.5:
// a light desaturation plus a navy multiply wash, so mixed phone photos read as
// one set. Photos always sit in a defined frame, never full-bleed behind text.
export default function Photo({
  photo,
  ratio = "aspect-[3/2]",
  position = "object-center",
  caption = false,
  frame = "border border-navy/15",
  className = "",
}) {
  if (!photo) return null;
  return (
    <figure className={className}>
      <div className={`relative overflow-hidden bg-navy ${frame} ${ratio}`}>
        <img
          src={photo.src}
          alt={photo.alt}
          loading="lazy"
          className={`absolute inset-0 h-full w-full object-cover ${position} [filter:grayscale(0.22)_saturate(0.88)]`}
        />
        <div
          className="absolute inset-0 bg-navy/20 mix-blend-multiply"
          aria-hidden="true"
        />
      </div>
      {caption && (
        <figcaption className="mt-2 text-xs font-semibold uppercase tracking-[0.1em] text-ink-muted">
          {photo.title}
        </figcaption>
      )}
    </figure>
  );
}
