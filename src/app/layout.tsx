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
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");if(t==="dark"||(!t&&matchMedia("(prefers-color-scheme:dark)").matches))document.documentElement.classList.add("dark")}catch(e){}})()`,
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
