import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/header";

export const metadata: Metadata = {
  title: "Resume — Babisan Pirapakaran",
  description: "View or download Babisan Pirapakaran’s resume: software engineering, platforms, infrastructure and low-latency systems.",
};

const resume = "/documents/Babisan-Pirapakaran-Resume.pdf";

export default function ResumePage() {
  return <>
    <Header />
    <main id="main" className="resume-page shell">
      <Link href="/" className="text-link back-link">← Back to the portfolio</Link>
      <div className="resume-page-heading">
        <div><p className="eyebrow">BABISAN PIRAPAKARAN / SOFTWARE ENGINEER</p><h1>MY <em>RESUME.</em></h1></div>
        <div className="resume-actions">
          <a href={resume} download="Babisan-Pirapakaran-Resume.pdf" className="resume-download">Download PDF <span aria-hidden="true">↓</span></a>
          <a href={resume} target="_blank" rel="noopener" className="resume-direct">Open PDF <span aria-hidden="true">↗</span><span className="visually-hidden"> (opens in a new tab)</span></a>
        </div>
      </div>
      <object data={`${resume}#view=FitH`} type="application/pdf" className="resume-viewer" aria-label="Babisan Pirapakaran’s resume PDF">
        <p>Your browser cannot display this PDF here. <a href={resume}>Open the resume PDF</a> or use the download button above.</p>
      </object>
      <p className="resume-help">Prefer a separate viewer? <a href={resume} target="_blank" rel="noopener">Open the PDF in a new tab.</a></p>
    </main>
  </>;
}
