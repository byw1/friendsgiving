import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({ subsets: ["latin"], weight: ["600", "700", "800", "900"], variable: "--font-nunito" });

const SITE = process.env.APP_URL || "https://web-production-900ae187.up.railway.app";
const TITLE = "Friendsgiving at The Penthouse";
const DESC = "Sat, Nov 21 at 6 PM. Tap in and grab something to bring.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: TITLE,
  description: DESC,
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Friendsgiving",
    title: TITLE,
    description: DESC,
    images: [{ url: "/og.jpg", width: 1080, height: 1350, type: "image/jpeg", alt: "Friendsgiving at The Penthouse" }],
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
