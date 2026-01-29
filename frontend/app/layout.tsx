import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import Navbar from "./Navbar";
import Providers from "./Providers";
import NotificationToaster from "./NotificationToaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RFQ Marketplace",
  description: "Request for Quotation Marketplace",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased text-foreground bg-background bg-mesh min-h-screen flex flex-col`}
      >
        <Providers>
          <Navbar />
          <NotificationToaster />

          {/* Content wrapper */}
          <main className="flex-grow w-full max-w-7xl mx-auto px-4 pt-32 pb-12">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
