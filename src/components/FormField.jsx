export default function FormField({
  label,
  id,
  type = "text",
  as = "input",
  options = [],
  required = false,
  ...rest
}) {
  const base =
    "w-full border border-ink/20 bg-paper px-4 py-3 text-ink placeholder:text-ink-muted/60 focus:outline-none focus-visible:outline-none focus:border-gold focus:ring-1 focus:ring-gold min-h-[46px]";

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-ink">
        {label}
        {required && <span className="ml-1 text-crimson" aria-hidden="true">*</span>}
      </label>
      {as === "textarea" ? (
        <textarea id={id} name={id} rows={5} required={required} className={base} {...rest} />
      ) : as === "select" ? (
        <select id={id} name={id} required={required} className={base} {...rest}>
          <option value="">Please choose…</option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      ) : (
        <input id={id} name={id} type={type} required={required} className={base} {...rest} />
      )}
    </div>
  );
}
