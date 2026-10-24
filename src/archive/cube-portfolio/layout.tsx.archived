import type { Metadata } from "next";
import { SiteIntro } from "@/components/site-intro";
import "@fontsource/inter/latin-400.css";
import "@fontsource/inter/latin-500.css";
import "@fontsource/inter/latin-600.css";
import "@fontsource/jetbrains-mono/latin-400.css";
import "@fontsource/playfair-display/latin-400.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Babisan Pirapakaran — Software Engineer",
  description:
    "Hey, I’m Babisan. A few projects, some things I’m learning, and an interest in systems, GPU computing, and cloud infrastructure.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body>
        {/* This tiny parser-run guard must execute before the server-rendered hero paints. */}
        <script id="portfolio-entrance" dangerouslySetInnerHTML={{ __html: `if(location.pathname==="/"&&!location.hash&&!matchMedia("(prefers-reduced-motion: reduce)").matches){document.documentElement.dataset.entrance="pending";setTimeout(function(){if(document.documentElement.dataset.entrance==="pending")document.documentElement.dataset.entrance="ready"},4000)}` }} />
        <a className="skip-link" href="#main">Skip to content</a>
        <SiteIntro />
        {children}
      </body>
    </html>
  );
}
