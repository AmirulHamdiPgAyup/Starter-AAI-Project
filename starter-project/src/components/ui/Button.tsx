import type { ButtonHTMLAttributes } from "react";

// The four button styles used across the app.
export type ButtonVariant = "primary" | "secondary" | "success" | "danger";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-brand-600 text-white shadow-sm hover:bg-brand-700",
  secondary: "border border-slate-300 bg-white text-slate-700 shadow-sm hover:bg-slate-50",
  success: "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700",
  danger: "bg-red-600 text-white shadow-sm hover:bg-red-700",
};

// Returns the classes for a button. Use it on a <Link> to make it look like a button.
export function buttonClasses(variant: ButtonVariant = "primary", className = ""): string {
  return [
    "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold",
    "transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500",
    "disabled:cursor-not-allowed disabled:opacity-60",
    VARIANTS[variant],
    className,
  ].join(" ");
}

export function Button({
  variant = "primary",
  className = "",
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return <button type={type} className={buttonClasses(variant, className)} {...props} />;
}
