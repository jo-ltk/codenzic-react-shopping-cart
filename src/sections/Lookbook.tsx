import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/motion";
import { LOOKBOOK } from "@/lib/data";
import { ScrubWords } from "@/components/ScrubWords";
import { cn } from "@/lib/utils";

const PLACEMENT = [
  "md:col-start-1 md:col-span-5",
  "md:col-start-8 md:col-span-5 md:mt-40",
  "md:col-start-3 md:col-span-4 md:-mt-24",
  "md:col-start-7 md:col-span-6 md:mt-16",
];

/** "Field Notes" — an asymmetric editorial grid with layered parallax depths. */
export function Lookbook() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.utils.toArray<HTMLElement>("[data-note]", root.current).forEach((el) => {
        gsap.from(el, {
          y: 60,
          autoAlpha: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
        });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="index" data-theme="paper" className="relative px-5 py-32 md:px-10 md:py-48">
      <div data-note className="mb-20 md:mb-32">
        <span className="meta text-fg/50">N°05 — Field Notes</span>
        <h2 className="mt-6 font-display text-5xl leading-[1.05] font-light md:text-7xl">
          Objects, <em className="text-accent">at home.</em>
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-16 md:grid-cols-12 md:gap-y-8">
        {LOOKBOOK.slice(0, 2).map((note, i) => (
          <figure key={note.caption} data-note className={cn("group", PLACEMENT[i])}>
            <div className="overflow-hidden">
              <div data-speed={note.speed}>
                <img
                  src={note.src}
                  alt={note.caption}
                  loading="lazy"
                  className="img-tone w-full scale-110 object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                />
              </div>
            </div>
            <figcaption className="meta mt-4 text-fg/50">{note.caption}</figcaption>
          </figure>
        ))}

        {/* interlude quote */}
        <div data-note className="md:col-span-8 md:col-start-3 md:my-24">
          <ScrubWords
            text="“A good object does not ask for attention. It earns familiarity — the way a doorknob earns the shape of a hand.”"
            accents={["familiarity"]}
            className="font-display text-2xl leading-[1.35] font-light md:text-4xl"
          />
          <span className="meta mt-6 block text-fg/50">— From the Issue 04 editor's note</span>
        </div>

        {LOOKBOOK.slice(2).map((note, i) => (
          <figure key={note.caption} data-note className={cn("group", PLACEMENT[i + 2])}>
            <div className="overflow-hidden">
              <div data-speed={note.speed}>
                <img
                  src={note.src}
                  alt={note.caption}
                  loading="lazy"
                  className="img-tone w-full scale-110 object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                />
              </div>
            </div>
            <figcaption className="meta mt-4 text-fg/50">{note.caption}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
