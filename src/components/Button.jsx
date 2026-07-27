import { Link } from "react-router-dom";

const styles = {
  primary: "bg-gold text-navy-deep hover:bg-gold-bright",
  secondary: "border border-gold text-gold hover:bg-gold/10",
  "secondary-light": "border border-navy text-navy hover:bg-navy/5",
  crimson: "bg-crimson text-white hover:bg-[#8f1a21]",
};

export default function Button({ to, href, variant = "primary", children, className = "", ...rest }) {
  const base =
    "inline-flex min-h-[46px] items-center justify-center px-7 py-2.5 font-body text-sm font-bold uppercase tracking-[0.08em] transition-colors duration-150";
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
