import { type InputHTMLAttributes, type ChangeEvent } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  prefix?: string;
  numeric?: boolean;
  error?: boolean;
}

function formatWithCommas(raw: string): string {
  const digits = raw.replace(/[^0-9]/g, "");
  if (!digits) return "";
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function Input({
  prefix,
  numeric,
  error,
  className = "",
  onChange,
  ...props
}: InputProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (numeric) {
      const formatted = formatWithCommas(e.target.value);
      e.target.value = formatted;
    }
    onChange?.(e);
  };

  const errorRing = error
    ? "ring-2 ring-red-400/60"
    : "";

  if (prefix) {
    return (
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-(--color-text-muted) font-mono text-sm">
          {prefix}
        </span>
        <input
          className={`w-full pl-8 pr-4 py-3 bg-(--color-surface) border border-(--color-border) rounded-lg text-(--color-text) font-mono text-right focus:outline-none focus:ring-2 focus:ring-(--color-accent) transition-shadow ${errorRing} ${className}`}
          onChange={handleChange}
          {...props}
        />
      </div>
    );
  }

  return (
    <input
      className={`w-full px-4 py-3 bg-(--color-surface) border border-(--color-border) rounded-lg text-(--color-text) focus:outline-none focus:ring-2 focus:ring-(--color-accent) transition-shadow ${errorRing} ${className}`}
      onChange={handleChange}
      {...props}
    />
  );
}
