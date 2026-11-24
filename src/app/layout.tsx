import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({ subsets: ["latin"], weight: ["600", "700", "800", "900"], variable: "--font-nunito" });

import { EVENT } from "@/lib/event";

// Used for absolute link-preview URLs. Railway sets RAILWAY_PUBLIC_DOMAIN for you.
const SITE =
  process.env.APP_URL ||
  (process.env.RAILWAY_PUBLIC_DOMAIN ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` : "http://localhost:3000");
const TITLE = `${EVENT.title} at ${EVENT.place}`;
const DESC = `${EVENT.shortDateLabel} at ${EVENT.timeLabel.replace(":00", "")}. Tap in and grab something to bring.`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: TITLE,
  description: DESC,
  openGraph: {
    type: "website",
    url: "/",
    siteName: EVENT.title,
    title: TITLE,
    description: DESC,
    images: [{ url: "/og.jpg", width: 1080, height: 1350, type: "image/jpeg", alt: TITLE }],
    videos: [{ url: `${SITE}/og.mp4`, secureUrl: `${SITE}/og.mp4`, width: 720, height: 900, type: "video/mp4" }],
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESC, images: ["/og.jpg"] },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={nunito.variable}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
