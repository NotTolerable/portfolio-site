import Image from "next/image";
import { PublicContact } from "@/components/public-contact";
export function ResumeFinale() {
  return (
    <div className="resume-composition">
      <a
        className="resume-sheet"
        href="/resume"
        target="_blank"
        rel="noopener"
        aria-label="Open Babisan Pirapakaran’s resume (opens in a new tab)"
      >
        <Image
          src="/documents/resume-preview.png"
          alt="Full-page preview of Babisan Pirapakaran’s resume"
          width={1530}
          height={1980}
          unoptimized
          loading="eager"
          sizes="(max-width: 700px) 85vw, 52vw"
        />
      </a>
      <div className="resume-contact">
        <p className="eyebrow">THE FULL PICTURE</p>
        <h2>My resume.</h2>
        <p>
          Experience, projects,
          <br />
          and what’s next.
        </p>
        <div className="resume-final-actions">
          <a href="/resume" target="_blank" rel="noopener">
            View resume PDF ↗
          </a>
          <a href="/documents/Babisan-Pirapakaran-Resume.pdf" download>
            Download PDF ↓
          </a>
        </div>
        <div className="resume-socials">
          <a
            href="https://github.com/NotTolerable"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub ↗
          </a>
          <a
            href="https://linkedin.com/in/babisan-p"
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn ↗
          </a>
        </div>
        <PublicContact />
      </div>
    </div>
  );
}
