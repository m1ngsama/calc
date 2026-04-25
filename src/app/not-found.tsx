import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-6xl font-bold text-(--color-navy) mb-4">404</h1>
      <p className="text-lg text-(--color-text-muted) mb-8">
        Page not found. The calculator you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link
        href="/en"
        className="px-6 py-3 rounded-lg bg-(--color-navy) text-white font-medium hover:opacity-90 transition-opacity"
      >
        Back to CalcHub
      </Link>
    </div>
  );
}
