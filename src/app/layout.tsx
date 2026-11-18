import type { Metadata, Viewport } from "next";
import { Geist, Instrument_Serif } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const instrument = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-instrument" });

export const metadata: Metadata = {
  title: "Friendsgiving · Sat Nov 21",
  description: "RSVP and pick what you’re bringing. Saturday, November 21 at 6 PM. Hosted by William & Marco.",
  openGraph: {
    title: "Friendsgiving · Sat Nov 21, 6 PM",
    description: "RSVP and pick what you’re bringing.",
  },
};

export const viewport: Viewport = {
  themeColor: "#0c0a09",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${instrument.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
