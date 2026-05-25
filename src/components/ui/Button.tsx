import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 font-sans font-medium tracking-wide transition-all duration-300 ease-grace disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-cream";

const variants: Record<Variant, string> = {
  primary: "bg-charcoal text-cream hover:bg-ink shadow-soft hover:shadow-lift",
  outline:
    "border border-charcoal/40 text-charcoal hover:border-charcoal hover:bg-charcoal/[0.04]",
  ghost: "text-charcoal hover:bg-charcoal/[0.06]",
};

const sizes: Record<Size, string> = {
  sm: "text-xs px-4 py-2 rounded-full",
  md: "text-sm px-6 py-3 rounded-full",
  lg: "text-base px-8 py-4 rounded-full",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
};

type ButtonAsButton = CommonProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

type ButtonAsLink = CommonProps & {
  href: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
};

export function Button(props: ButtonAsButton | ButtonAsLink) {
  const { variant = "primary", size = "md", className, children } = props;
  const classes = cn(base, variants[variant], sizes[size], className);

  if ("href" in props && props.href) {
    return (
      <Link href={props.href} className={classes} onClick={props.onClick}>
        {children}
      </Link>
    );
  }

  const { variant: _v, size: _s, className: _c, children: _ch, ...rest } =
    props as ButtonAsButton;
  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}
