import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "danger" | "ghost";
  loading?: boolean;
  fullWidth?: boolean;
}

const VARIANT_CLASSES: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "bg-primary text-white hover:bg-primary-dark",
  outline: "border border-primary text-primary bg-transparent hover:bg-primary-light",
  danger: "bg-danger text-white hover:bg-red-700",
  ghost: "bg-transparent text-primary hover:bg-primary-light",
};

export default function Button({
  variant = "primary",
  loading = false,
  fullWidth = true,
  disabled,
  className = "",
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={[
        "rounded-xl px-4 py-3 text-sm font-semibold transition-colors disabled:opacity-50",
        fullWidth ? "w-full" : "",
        VARIANT_CLASSES[variant],
        className,
      ].join(" ")}
      {...rest}
    >
      {loading ? "Guardando…" : children}
    </button>
  );
}
