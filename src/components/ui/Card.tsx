import { type ReactNode } from "react";

interface CardProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

export function Card({ title, children, className = "" }: CardProps) {
  return (
    <div
      className={`bg-(--color-surface) border border-(--color-border) rounded-xl p-6 ${className}`}
    >
      {title && (
        <h2 className="text-lg font-semibold text-(--color-text) mb-4">{title}</h2>
      )}
      {children}
    </div>
  );
}
