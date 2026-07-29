import type { Metadata } from "next";
import { Bebas_Neue, Instrument_Serif, Manrope } from "next/font/google";
import { SITE } from "@/lib/constants";
import "./globals.css";

const impact = Bebas_Neue({
  variable: "--font-impact",
  subsets: ["latin"],
  weight: ["400"],
});

const display = Instrument_Serif({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
});

const sans = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "Silver Spring Studios | Independent Film Distribution",
    template: "%s | Silver Spring Studios",
  },
  description: SITE.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${impact.variable} ${display.variable} ${sans.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
