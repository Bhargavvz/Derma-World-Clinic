import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Public_Sans, Spectral } from "next/font/google";
import "../globals.css";

const publicSans = Public_Sans({ subsets: ["latin"], variable: "--font-public", display: "swap" });
const spectral = Spectral({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-spectral", display: "swap" });

export const dynamic = "force-dynamic";
export const viewport: Viewport = { themeColor: "#4a1f3d" };
export const metadata: Metadata = {
  title: { default: "Admin | Derma World", template: "%s | Derma World admin" },
  robots: { index: false, follow: false, nocache: true },
};

/** Admin root layout: English only, never cached, no analytics. */
export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-IN" className={`${publicSans.variable} ${spectral.variable}`}>
      <body className="min-h-screen bg-sage-50 text-[0.9375rem]">{children}</body>
    </html>
  );
}
