import { type SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[];
}

export function Select({ options, className = "", ...props }: SelectProps) {
  return (
    <select
      className={`w-full px-4 py-3 bg-(--color-surface) border border-(--color-border) rounded-lg text-(--color-text) focus:outline-none focus:ring-2 focus:ring-(--color-accent) ${className}`}
      {...props}>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
