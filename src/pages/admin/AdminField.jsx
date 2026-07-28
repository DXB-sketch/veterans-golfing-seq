// Form field for the admin area: bigger type, plain-language label and an
// optional hint line, sized for volunteers who aren't comfortable with computers.
export default function AdminField({
  label,
  id,
  hint,
  required = false,
  as = "input",
  options = [],
  ...rest
}) {
  const base =
    "w-full border border-ink/25 bg-paper px-4 py-3 text-lg text-ink placeholder:text-ink-muted/50 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/50 min-h-[52px]";

  return (
    <div>
      <label htmlFor={id} className="block font-body text-base font-bold text-navy">
        {label}
        {required && <span className="ml-1 text-crimson" aria-hidden="true">*</span>}
      </label>
      {hint && <p className="mt-0.5 text-sm text-ink-muted">{hint}</p>}
      <div className="mt-2">
        {as === "textarea" ? (
          <textarea id={id} name={id} rows={5} required={required} className={base} {...rest} />
        ) : as === "select" ? (
          <select id={id} name={id} required={required} className={base} {...rest}>
            {options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        ) : (
          <input id={id} name={id} required={required} className={base} {...rest} />
        )}
      </div>
    </div>
  );
}
