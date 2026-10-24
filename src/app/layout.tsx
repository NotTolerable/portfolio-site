import type { Metadata } from "next";
import { ComicEntrance } from "@/components/comic-entrance";
import "@fontsource/inter/latin-400.css";
import "@fontsource/inter/latin-500.css";
import "@fontsource/inter/latin-600.css";
import "@fontsource/jetbrains-mono/latin-400.css";
import "@fontsource/barlow-condensed/latin-700.css";
import "@fontsource/barlow-condensed/latin-800.css";
import "@fontsource/barlow-condensed/latin-800-italic.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Babisan Pirapakaran — Software Engineer",
  description:
    "Babisan Pirapakaran — software engineer and Waterloo Computational Mathematics student. Platforms, infrastructure, game server operations and low-latency systems.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body>
        <a className="skip-link" href="#main">Skip to content</a>
        <ComicEntrance />
        {children}
      </body>
    </html>
  );
}
