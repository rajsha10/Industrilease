import type { Metadata } from "next";
import { Syne, Manrope } from "next/font/google";
import "./globals.css";
import { ScrollProgressBar } from "./components/animations";

// Syne — Bold editorial display font (matches the Duke NFT headline style)
const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

// Manrope — Clean geometric sans for body & UI
const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "IndustriLease | Industrial Machinery Rental Platform",
  description:
    "Democratizing High-End Industrial Capacity. Rent enterprise-grade 3D printers, CNCs and more via AI-powered smart contracts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${syne.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-neutral-900">
        <ScrollProgressBar />
        {children}
      </body>
    </html>
  );
}
