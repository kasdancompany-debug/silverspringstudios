import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-ivory text-ink hover:bg-warm-metal border border-transparent",
  secondary:
    "bg-transparent text-ivory border border-line-strong hover:border-silver hover:text-ivory",
  ghost: "bg-transparent text-slate hover:text-ivory border border-transparent",
  danger: "bg-danger/20 text-ivory border border-danger/40 hover:bg-danger/30",
};

const sizes: Record<Size, string> = {
  sm: "px-3.5 py-2 text-xs tracking-[0.12em] uppercase",
  md: "px-5 py-3 text-xs tracking-[0.14em] uppercase",
  lg: "px-6 py-3.5 text-sm tracking-[0.14em] uppercase",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", type = "button", ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-sans transition-colors duration-300 disabled:opacity-50 disabled:pointer-events-none",
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
