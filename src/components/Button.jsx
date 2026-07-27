import { Link } from "react-router-dom";

const styles = {
  primary:
    "bg-gold text-navy-deep hover:bg-gold-bright",
  secondary:
    "border-[1.5px] border-gold text-gold hover:bg-gold/10",
  "secondary-light":
    "border-[1.5px] border-navy text-navy hover:bg-navy/5",
  crimson:
    "bg-crimson text-white hover:bg-[#8f1a21]",
};

export default function Button({ to, href, variant = "primary", children, className = "", ...rest }) {
  const base =
    "inline-flex min-h-[44px] items-center justify-center rounded-card px-6 py-2.5 font-display text-sm font-semibold uppercase tracking-wide transition-colors duration-150";
  const cls = `${base} ${styles[variant]} ${className}`;
  if (to) {
    return (
      <Link to={to} className={cls} {...rest}>
        {children}
      </Link>
    );
  }
  if (href) {
    return (
      <a href={href} className={cls} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}
