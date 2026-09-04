import { useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import { gsap, useGSAP } from "@/lib/motion";
import { OBJECTS } from "@/lib/data";

/**
 * "The Index" — a pinned horizontal catalogue on desktop.
 * Each panel's photograph drifts against the travel direction for depth.
 * On mobile / reduced motion it degrades to a vertical list.
 */
export function Collection() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const progress = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
        const trackEl = track.current!;
        const distance = () => trackEl.scrollWidth - window.innerWidth;

        const scrollTween = gsap.to(trackEl, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: () => `+=${distance()}`,
            scrub: 1,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              if (progress.current) {
                gsap.set(progress.current, { scaleX: self.progress });
              }
            },
          },
        });

        // inner counter-drift on each photograph
        gsap.utils.toArray<HTMLElement>("[data-panel-img]", trackEl).forEach((img) => {
          gsap.fromTo(
            img,
            { xPercent: -7 },
            {
              xPercent: 7,
              ease: "none",
              scrollTrigger: {
                trigger: img,
                containerAnimation: scrollTween,
                start: "left right",
                end: "right left",
                scrub: true,
              },
            },
          );
        });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="catalogue" data-theme="ink" className="relative overflow-hidden">
      <div className="flex min-h-dvh items-center">
        <div
          ref={track}
          className="flex w-full flex-col gap-20 px-5 py-28 md:w-max md:flex-row md:items-center md:gap-[7vw] md:px-[8vw] md:py-0"
        >
          {/* intro panel */}
          <div className="shrink-0 md:w-[30vw]">
            <span className="meta text-fg/50">N°03 — The Index</span>
            <h2 className="mt-6 font-display text-5xl leading-[1.05] font-light md:text-6xl">
              Five objects,
              <br />
              <em className="text-accent">this issue.</em>
            </h2>
            <p className="mt-8 max-w-xs text-sm leading-relaxed text-fg/55">
              Drag through the index. Every piece is made in a single
              workshop, in a single run — when it leaves the catalogue, it
              leaves for good.
            </p>
          </div>

          {OBJECTS.map((obj) => (
            <article key={obj.id} className="group relative shrink-0 md:w-[34vw]">
              {/* oversized ghost index number */}
              <span
                aria-hidden
                className="text-outline pointer-events-none absolute -top-[0.55em] left-[-0.08em] z-0 font-display text-[9rem] leading-none font-light md:text-[13vw]"
              >
                {obj.index}
              </span>

              <div
                data-cursor="VIEW"
                className="relative z-10 mt-16 overflow-hidden md:mt-[7vw]"
              >
                <div data-panel-img className="scale-115 will-change-transform">
                  <img
                    src={obj.img}
                    alt={`${obj.name} — placeholder`}
                    loading="lazy"
                    className="img-tone aspect-[3/4] w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                  />
                </div>
              </div>

              <div className="relative z-10 mt-5 flex items-end justify-between gap-4">
                <div>
                  <span className="meta text-accent">OBJ-{obj.index}</span>
                  <h3 className="mt-1.5 font-display text-2xl font-normal">{obj.name}</h3>
                  <p className="meta mt-2 text-fg/50">{obj.nature}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="meta text-fg/80">{obj.price}</span>
                  <ArrowUpRight
                    className="size-4 text-accent opacity-0 transition-all duration-500 group-hover:translate-x-0.5 group-hover:opacity-100"
                    strokeWidth={1.5}
                  />
                </div>
              </div>
            </article>
          ))}

          {/* outro panel */}
          <div className="shrink-0 md:w-[24vw] md:pr-[8vw]">
            <p className="font-display text-3xl leading-snug font-light text-fg/70">
              Forty-three more inside the catalogue.
            </p>
            <a
              href="#footer"
              className="meta mt-6 inline-flex items-center gap-2 text-accent"
            >
              Request access <ArrowUpRight className="size-3.5" strokeWidth={1.5} />
            </a>
          </div>
        </div>
      </div>

      {/* travel progress */}
      <div className="pointer-events-none absolute inset-x-[8vw] bottom-10 hidden h-px bg-fg/15 md:block">
        <div ref={progress} className="h-full origin-left scale-x-0 bg-accent" />
      </div>
    </section>
  );
}
