import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/motion";
import { ScrubWords } from "@/components/ScrubWords";

export function Manifesto() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.from("[data-rule]", {
        scaleX: 0,
        transformOrigin: "left center",
        duration: 1.4,
        ease: "power3.out",
        scrollTrigger: { trigger: root.current, start: "top 70%", once: true },
      });
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="manifesto"
      data-theme="ink"
      className="relative px-5 py-36 md:px-10 md:py-56"
    >
      <div data-rule className="mb-16 h-px w-full bg-fg/15 md:mb-24" />
      <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
        <div className="md:col-span-3">
          <span className="meta text-fg/50">N°02 — Manifesto</span>
        </div>

        <div className="md:col-span-9 lg:col-span-8">
          <ScrubWords
            text="We believe a room is a slow conversation. Every object in it either adds to that conversation or talks over it. OBJEKT exists to find the quiet ones — pieces made once, made well, and made to outlive the feed."
            accents={["slow", "quiet", "outlive"]}
            className="font-display text-3xl leading-[1.25] font-light md:text-5xl lg:text-6xl"
          />
        </div>
      </div>
    </section>
  );
}
