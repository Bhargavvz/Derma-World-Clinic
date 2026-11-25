import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Manrope, Playfair_Display } from "next/font/google";
import "../globals.css";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", display: "swap" });

export const dynamic = "force-dynamic";
export const viewport: Viewport = { themeColor: "#184d38" };
export const metadata: Metadata = {
  title: { default: "Admin | Derma World", template: "%s | Derma World admin" },
  robots: { index: false, follow: false, nocache: true },
};

/** Admin root layout: English only, never cached, no analytics. */
export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-IN" className={`${manrope.variable} ${playfair.variable}`}>
      <body className="min-h-screen bg-sage-50">{children}</body>
    </html>
  );
}
