import type { Metadata } from "next";
import { RouteHeader } from "@/components/gallery/route-header";

import "@fontsource/geist/latin-400.css";
import "@fontsource/geist/latin-500.css";
import "@fontsource/geist/latin-600.css";
import "@fontsource/jetbrains-mono/latin-400.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Babisan Pirapakaran — Software Engineer",
  description:
    "Babisan Pirapakaran — software engineer and Waterloo Computational Mathematics student. Platforms, infrastructure, game server operations and low-latency systems.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <a className="skip-link" href="#content">
          Skip to content
        </a>
        <RouteHeader />
        {children}
      </body>
    </html>
  );
}
