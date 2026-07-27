import RibbonRule from "./RibbonRule.jsx";

// Section wrapper handling the eyebrow > title > ribbon > content rhythm.
// tone: "cream" | "navy" | "navy-deep" | "paper"
export default function Section({
  eyebrow,
  title,
  tone = "cream",
  center = false,
  children,
  className = "",
}) {
  const dark = tone === "navy" || tone === "navy-deep";
  const bg =
    tone === "navy"
      ? "bg-navy text-white"
      : tone === "navy-deep"
        ? "bg-navy-deep text-white"
        : tone === "paper"
          ? "bg-paper"
          : "bg-cream";
  return (
    <section className={`${bg} px-5 py-16 md:py-24 ${className}`}>
      <div className={`mx-auto max-w-site ${center ? "text-center" : ""}`}>
        {(eyebrow || title) && (
          <header className={`mb-10 ${center ? "flex flex-col items-center" : ""}`}>
            {eyebrow && (
              <p className="font-body text-[0.8125rem] font-bold uppercase tracking-[0.16em] text-gold">
                {eyebrow}
              </p>
            )}
            {title && (
              <h2
                className={`mt-2 font-display text-[1.7rem] font-semibold leading-tight tracking-wide ${
                  dark ? "text-white" : "text-navy"
                }`}
              >
                {title}
              </h2>
            )}
            <RibbonRule className="mt-4" dark={dark} />
          </header>
        )}
        {children}
      </div>
    </section>
  );
}
