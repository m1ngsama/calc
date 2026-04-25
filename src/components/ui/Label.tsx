import { type LabelHTMLAttributes } from "react";

export function Label({
  className = "",
  children,
  ...props
}: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={`block text-sm font-medium text-(--color-text-muted) mb-1.5 ${className}`}
      {...props}
    >
      {children}
    </label>
  );
}
