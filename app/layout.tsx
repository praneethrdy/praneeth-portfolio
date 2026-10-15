import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Manrope, Syne } from "next/font/google";
import SmoothScroll from "@/components/SmoothScroll";
import "./globals.css";

const syne = Syne({ variable: "--font-syne", subsets: ["latin"], weight: ["600", "800"] });
const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"], weight: ["400", "500", "600"] });
const jetbrains = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"], weight: ["400", "500"] });

// Absolute URLs for link previews. Vercel sets the production domain; locally it falls back to the dev server.
const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : (process.env.SITE_URL ?? "http://localhost:3000");

const description =
  "Java backend engineer building core banking microservices with Quarkus, gRPC, PostgreSQL and Infinispan. Open to backend roles.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Praneeth Reddy · Java Backend Engineer",
  description,
  openGraph: {
    type: "website",
    title: "Praneeth Reddy · Java Backend Engineer",
    description,
    siteName: "Praneeth Reddy",
  },
  twitter: { card: "summary_large_image", title: "Praneeth Reddy · Java Backend Engineer", description },
};

export const viewport: Viewport = {
  themeColor: "#05080b",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${syne.variable} ${manrope.variable} ${jetbrains.variable}`}>
        <div aria-hidden="true" className="bg-dots" />
        {children}
        <div aria-hidden="true" className="bg-grain" />
        <SmoothScroll />
      </body>
    </html>
  );
}
