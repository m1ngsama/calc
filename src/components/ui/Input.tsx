import { type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  prefix?: string;
}

export function Input({ prefix, className = "", ...props }: InputProps) {
  if (prefix) {
    return (
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-(--color-text-muted) font-mono text-sm">
          {prefix}
        </span>
        <input
          className={`w-full pl-8 pr-4 py-3 bg-(--color-surface) border border-(--color-border) rounded-lg text-(--color-text) font-mono text-right focus:outline-none focus:ring-2 focus:ring-(--color-accent) ${className}`}
          {...props}
        />
      </div>
    );
  }

  return (
    <input
      className={`w-full px-4 py-3 bg-(--color-surface) border border-(--color-border) rounded-lg text-(--color-text) focus:outline-none focus:ring-2 focus:ring-(--color-accent) ${className}`}
      {...props}
    />
  );
}
