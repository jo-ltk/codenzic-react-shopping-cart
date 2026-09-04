import { useRef } from "react";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface ProductPlatesProps {
  images: string[];
  title: string;
  objectIndex: string;
}

type Plate = {
  placement: string;
  aspect: string;
  backdrop: string;
  /** Parallax drift multiplier — negative moves against the scroll. */
  speed: number;
  padding: string;
};

const PAPER = "bg-[radial-gradient(120%_90%_at_50%_30%,#f6f1e8_0%,#ebe4d6_55%,#dad1c1_100%)]";
const STONE = "bg-[radial-gradient(120%_90%_at_50%_30%,#ebe3d5_0%,#dbd0be_58%,#cbbfab_100%)]";
const SAGE = "bg-[radial-gradient(120%_90%_at_50%_30%,#e8e8dc_0%,#d6d9c8_58%,#c5cab6_100%)]";

const SINGLE: Plate[] = [
  {
    placement: "md:col-span-12",
    aspect: "aspect-[4/5] sm:aspect-[16/10] md:aspect-[21/9]",
    backdrop: STONE,
    speed: 1,
    padding: "p-[10%] sm:p-[6%]",
  },
];

const PAIR: Plate[] = [
  {
    placement: "md:col-span-7",
    aspect: "aspect-[4/5]",
    backdrop: PAPER,
    speed: 1,
    padding: "p-[12%]",
  },
  {
    placement: "md:col-span-4 md:col-start-9 md:mt-40",
    aspect: "aspect-[3/4]",
    backdrop: STONE,
    speed: -0.7,
    padding: "p-[14%]",
  },
];

const TRIO: Plate[] = [
  {
    placement: "md:col-span-6",
    aspect: "aspect-[4/5]",
    backdrop: PAPER,
    speed: 1,
    padding: "p-[12%]",
  },
  {
    placement: "md:col-span-5 md:col-start-8 md:mt-44",
    aspect: "aspect-[3/4]",
    backdrop: SAGE,
    speed: -0.7,
    padding: "p-[14%]",
  },
  {
    placement: "md:col-span-7 md:col-start-3 md:-mt-20",
    aspect: "aspect-[4/5] sm:aspect-[16/10]",
    backdrop: STONE,
    speed: 1.3,
    padding: "p-[8%]",
  },
];

/**
 * "Plates" — the object photographed again at editorial scale.
 * Each plate wipes in on entry, then drifts at its own depth while scrolling.
 */
export function ProductPlates({ images, title, objectIndex }: ProductPlatesProps) {
  const root = useRef<HTMLElement>(null);
  const layout = images.length === 1 ? SINGLE : images.length === 2 ? PAIR : TRIO;
  const plates = layout.map((plate, i) => ({ ...plate, src: images[i] }));

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      gsap.utils.toArray<HTMLElement>("[data-plate]", root.current).forEach((plate) => {
        const img = plate.querySelector<HTMLElement>("[data-plate-img]");
        const speed = Number(plate.dataset.speed ?? 1);

        gsap.fromTo(
          plate,
          { clipPath: "inset(0 0 100% 0)" },
          {
            clipPath: "inset(0 0 0% 0)",
            duration: 1.4,
            ease: "expo.inOut",
            scrollTrigger: { trigger: plate, start: "top 82%", once: true },
          },
        );

        if (img) {
          gsap.from(img, {
            scale: 1.18,
            duration: 1.8,
            ease: "expo.out",
            scrollTrigger: { trigger: plate, start: "top 82%", once: true },
          });
          gsap.fromTo(
            img,
            { yPercent: -9 * speed },
            {
              yPercent: 9 * speed,
              ease: "none",
              scrollTrigger: {
                trigger: plate,
                start: "top bottom",
                end: "bottom top",
                scrub: 1.2,
              },
            },
          );
        }
      });

      gsap.utils.toArray<HTMLElement>("[data-plate-caption]", root.current).forEach((cap) => {
        gsap.from(cap, {
          y: 18,
          autoAlpha: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: cap, start: "top 92%", once: true },
        });
      });
    },
    { scope: root, dependencies: [images] },
  );

  return (
    <section
      ref={root}
      aria-label={`${title} plates`}
      className="border-t border-fg/15 px-5 pt-16 pb-8 sm:px-8 md:px-10 md:pt-24 lg:px-14 xl:px-16"
    >
      <div className="mb-12 flex items-end justify-between gap-6 md:mb-16">
        <div>
          <p className="meta text-fg/45">Plates</p>
          <h2 className="mt-3 font-display text-3xl leading-[1.05] font-light md:text-4xl lg:text-5xl">
            In detail<em className="text-accent">.</em>
          </h2>
        </div>
        <p className="meta hidden text-right text-fg/40 sm:block">
          {String(images.length).padStart(2, "0")}{" "}
          {images.length === 1 ? "plate" : "plates"} · OBJ-{objectIndex}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-14 md:grid-cols-12 md:gap-x-8 md:gap-y-6">
        {plates.map((plate, i) => (
          <figure key={plate.src} className={cn("group min-w-0", plate.placement)}>
            <div
              data-plate
              data-speed={plate.speed}
              className={cn(
                "relative overflow-hidden border border-fg/10 will-change-[clip-path]",
                plate.aspect,
                plate.backdrop,
              )}
            >
              <div data-plate-img className="absolute inset-0 will-change-transform">
                <img
                  src={plate.src}
                  alt={`${title} — plate ${String(i + 1).padStart(2, "0")}`}
                  loading="lazy"
                  decoding="async"
                  className={cn(
                    "img-tone h-full w-full object-contain mix-blend-multiply transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]",
                    plate.padding,
                  )}
                />
              </div>
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(140%_120%_at_50%_50%,transparent_55%,rgba(23,20,15,0.07)_100%)]" />
            </div>
            <figcaption
              data-plate-caption
              className="meta mt-4 flex items-center justify-between gap-4 text-fg/45"
            >
              <span>
                Plate {String(i + 1).padStart(2, "0")}
                <span className="mx-2 text-fg/25">—</span>
                <span className="normal-case tracking-normal">{title}</span>
              </span>
              <span className="hidden text-fg/30 sm:inline">OBJ-{objectIndex}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
