"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { greetings, greetingStep } from "@/lib/gallery/motion";
export function GreetingName() {
  const name = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = name.current;
    if (!node) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      node.textContent = "Babisan Pirapakaran";
      return;
    }
    const timeline = gsap.timeline();
    greetings.forEach((greeting) => {
      timeline
        .call(() => {
          node.textContent = greeting;
        })
        .fromTo(
          node,
          { opacity: 0, y: 7 },
          { opacity: 1, y: 0, duration: 0.064 },
        )
        .to(
          node,
          { opacity: 0, y: -4, duration: 0.064 },
          `+=${greetingStep - 0.128}`,
        );
    });
    timeline
      .call(() => {
        node.textContent = "Babisan Pirapakaran";
      })
      .to(node, { opacity: 1, y: 0, duration: 0.18 });
    return () => {
      timeline.kill();
    };
  }, []);
  return (
    <div className="loader-name" ref={name} aria-hidden="true" dir="auto">
      Hello
    </div>
  );
}
