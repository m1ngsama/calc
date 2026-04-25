import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://calc.m1ng.space"),
  title: {
    default: "CalcHub — Financial Calculators by Country",
    template: "%s | CalcHub",
  },
  description:
    "Free, accurate financial calculators for every country. Income tax, salary, mortgage, and more. All calculations run in your browser.",
  openGraph: {
    type: "website",
    siteName: "CalcHub",
    locale: "en_US",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "CalcHub — Financial Calculators by Country" }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og-image.png"],
  },
  manifest: "/manifest.json",
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");if(t==="dark"||(!t&&matchMedia("(prefers-color-scheme:dark)").matches))document.documentElement.classList.add("dark")}catch(e){}var l=location.pathname.split("/")[1];if(l==="zh")document.documentElement.lang="zh-CN";else document.documentElement.lang="en"})()`,
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${mono.variable} font-sans bg-(--color-surface) text-(--color-text) min-h-screen flex flex-col`}
      >
        {children}
      </body>
    </html>
  );
}
