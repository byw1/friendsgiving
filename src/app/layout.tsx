import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({ subsets: ["latin"], weight: ["600", "700", "800", "900"], variable: "--font-nunito" });

export const metadata: Metadata = {
  title: "Friendsgiving at The Penthouse",
  description: "Saturday, Nov 21 at 6 PM. Say you're in and grab something to bring.",
  openGraph: {
    title: "Friendsgiving at The Penthouse",
    description: "Saturday, Nov 21 at 6 PM. Say you're in and grab something to bring.",
  },
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
