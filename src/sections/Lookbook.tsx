import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/motion";
import { LOOKBOOK } from "@/lib/data";
import { ScrubWords } from "@/components/ScrubWords";

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
      const intro = root.current?.querySelector<HTMLElement>("[data-lookbook-intro]");
      if (intro) {
        gsap.from(intro, {
          y: 48,
          autoAlpha: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: { trigger: intro, start: "top 85%", once: true },
        });
      }

      const quote = root.current?.querySelector<HTMLElement>("[data-lookbook-quote]");
      if (quote) {
        gsap.from(quote, {
          y: 40,
          autoAlpha: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: { trigger: quote, start: "top 88%", once: true },
        });
      }

      if (prefersReducedMotion()) return;

      gsap.utils.toArray<HTMLElement>("[data-lookbook-frame]", root.current).forEach((frame) => {
        const img = frame.querySelector<HTMLElement>("[data-lookbook-img]");
        const caption = frame.parentElement?.querySelector<HTMLElement>("figcaption");
        const speed = Number(frame.dataset.lookbookSpeed ?? 0.12);

        gsap.fromTo(
          frame,
          { clipPath: "inset(12% 8% 12% 8%)" },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            ease: "none",
            scrollTrigger: {
              trigger: frame,
              start: "top 90%",
              end: "top 35%",
              scrub: 0.8,
            },
          },
        );

        if (img) {
          gsap.fromTo(
            img,
            { scale: 1.22, yPercent: speed * -80 },
            {
              scale: 1.05,
              yPercent: speed * 80,
              ease: "none",
              scrollTrigger: {
                trigger: frame,
                start: "top bottom",
                end: "bottom top",
                scrub: 1.1,
              },
            },
          );
        }

        if (caption) {
          gsap.from(caption, {
            y: 16,
            autoAlpha: 0,
            duration: 0.75,
            ease: "power3.out",
            scrollTrigger: { trigger: caption, start: "top 94%", once: true },
          });
        }
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="index" data-theme="paper" className="relative px-5 py-32 md:px-10 md:py-48">
      <div data-lookbook-intro className="mb-20 md:mb-32">
        <span className="meta text-fg/50">N°05 — Field Notes</span>
        <h2 className="mt-6 font-display text-5xl leading-[1.05] font-light md:text-7xl">
          Objects, <em className="text-accent">at home.</em>
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-16 md:grid-cols-12 md:gap-y-8">
        {LOOKBOOK.slice(0, 2).map((note, i) => (
          <figure key={note.caption} className={PLACEMENT[i]}>
            <div
              data-lookbook-frame
              data-lookbook-speed={note.speed}
              className="overflow-hidden"
            >
              <img
                data-lookbook-img
                src={note.src}
                alt={note.caption}
                loading="lazy"
                className="img-tone w-full object-cover will-change-transform"
              />
            </div>
            <figcaption className="meta mt-4 text-fg/50">{note.caption}</figcaption>
          </figure>
        ))}

        {/* interlude quote */}
        <div data-lookbook-quote className="md:col-span-8 md:col-start-3 md:my-24">
          <ScrubWords
            text="“A good object does not ask for attention. It earns familiarity — the way a doorknob earns the shape of a hand.”"
            accents={["familiarity"]}
            className="font-display text-2xl leading-[1.35] font-light md:text-4xl"
          />
          <span className="meta mt-6 block text-fg/50">— From the Issue 04 editor's note</span>
        </div>

        {LOOKBOOK.slice(2).map((note, i) => (
          <figure key={note.caption} className={PLACEMENT[i + 2]}>
            <div
              data-lookbook-frame
              data-lookbook-speed={note.speed}
              className="overflow-hidden"
            >
              <img
                data-lookbook-img
                src={note.src}
                alt={note.caption}
                loading="lazy"
                className="img-tone w-full object-cover will-change-transform"
              />
            </div>
            <figcaption className="meta mt-4 text-fg/50">{note.caption}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
