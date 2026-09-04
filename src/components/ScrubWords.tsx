import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface ScrubWordsProps {
  text: string;
  className?: string;
  /** lowercase words to render in the accent color */
  accents?: string[];
}

/** Paragraph whose words ink themselves in, driven by scroll position. */
export function ScrubWords({ text, className, accents = [] }: ScrubWordsProps) {
  const ref = useRef<HTMLParagraphElement>(null);

  useGSAP(
    () => {
      const words = ref.current?.querySelectorAll<HTMLElement>("[data-word]");
      if (!words?.length) return;
      gsap.fromTo(
        words,
        { opacity: 0.14 },
        {
          opacity: 1,
          ease: "none",
          stagger: 0.5,
          scrollTrigger: {
            trigger: ref.current,
            start: "top 78%",
            end: "bottom 45%",
            scrub: true,
          },
        },
      );
    },
    { scope: ref },
  );

  return (
    <p ref={ref} className={className}>
      {text.split(" ").map((word, i) => {
        const bare = word.replace(/[^a-zA-Z]/g, "").toLowerCase();
        return (
          <span
            key={i}
            data-word
            className={cn("inline", accents.includes(bare) && "font-display italic text-accent")}
          >
            {word}{" "}
          </span>
        );
      })}
    </p>
  );
}
