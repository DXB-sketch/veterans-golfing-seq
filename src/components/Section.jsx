import RibbonRule from "./RibbonRule.jsx";

// Section wrapper — eyebrow → title → ribbon → content rhythm (DESIGN.md §9).
// tone: "cream" | "navy" | "paper"
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
              <p className="font-display text-[0.8125rem] font-medium uppercase tracking-[0.14em] text-gold">
                {eyebrow}
              </p>
            )}
            {title && (
              <h2
                className={`mt-2 font-display text-[1.75rem] font-semibold uppercase leading-tight ${
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
