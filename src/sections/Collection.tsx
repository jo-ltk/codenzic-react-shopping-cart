import { useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import { gsap, useGSAP } from "@/lib/motion";
import { OBJECTS } from "@/lib/data";

/**
 * "The Index" — a pinned horizontal catalogue on all viewports.
 * Vertical page scroll drives left-to-right travel.
 * Each panel's photograph drifts against the travel direction for depth.
 * Reduced-motion users get a native horizontal swipe instead.
 */
export function Collection() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
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

      // Native L→R swipe when motion is reduced (no pin/scrub)
      mm.add("(prefers-reduced-motion: reduce)", () => {
        const trackEl = track.current!;
        const scroller = root.current!;
        scroller.style.overflowX = "auto";
        scroller.style.setProperty("-webkit-overflow-scrolling", "touch");
        trackEl.style.width = "max-content";
        return () => {
          scroller.style.overflowX = "";
          scroller.style.removeProperty("-webkit-overflow-scrolling");
          trackEl.style.width = "";
        };
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="catalogue" data-theme="ink" className="relative overflow-x-clip">
      <div className="flex min-h-dvh items-center">
        <div
          ref={track}
          className="flex w-max flex-row items-center gap-[12vw] px-5 py-10 md:gap-[7vw] md:px-[8vw]"
        >
          {/* intro panel */}
          <div className="w-[78vw] shrink-0 md:w-[30vw]">
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
            <article key={obj.id} className="group relative w-[78vw] shrink-0 md:w-[34vw]">
              {/* oversized ghost index — kept in-flow bounds so pin/overflow never crops glyphs */}
              <span
                aria-hidden
                className="text-outline pointer-events-none absolute top-0 left-[-0.08em] z-0 font-display text-[22vw] leading-none font-light md:text-[13vw]"
              >
                {obj.index}
              </span>

              <div
                data-cursor="VIEW"
                className="relative z-10 mt-[26vw] overflow-hidden md:mt-[15vw]"
              >
                <div data-panel-img className="scale-115 will-change-transform">
                  <img
                    src={obj.img}
                    alt={obj.name}
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
          <div className="w-[70vw] shrink-0 pr-5 md:w-[24vw] md:pr-[8vw]">
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
    </section>
  );
}
