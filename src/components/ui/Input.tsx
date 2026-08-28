import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export default function Input({ label, className = "", id, ...rest }: InputProps) {
  const inputId = id ?? label?.replace(/\s+/g, "-").toLowerCase();
  return (
    <div className="mb-4">
      {label ? (
        <label htmlFor={inputId} className="mb-1 block text-sm font-semibold text-ink">
          {label}
        </label>
      ) : null}
      <input
        id={inputId}
        className={`w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-ink placeholder:text-muted focus:border-primary focus:outline-none ${className}`}
        {...rest}
      />
    </div>
  );
}
