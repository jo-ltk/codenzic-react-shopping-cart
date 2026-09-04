import { useRef, type ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { gsap, useGSAP, EASE_GSAP, prefersReducedMotion, isFinePointer } from "@/lib/motion";
import { HERO_ENVIRONMENT, HERO_FIGURES } from "@/lib/data";
import { cn } from "@/lib/utils";

function MaskLine({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn("block overflow-hidden pb-[0.04em]", className)}>
      <span data-hero-line className="block will-change-transform">
        {children}
      </span>
    </span>
  );
}

const SLIDES = ["01", "02", "03"] as const;

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const exploreRef = useRef<HTMLAnchorElement>(null);

  useGSAP(
    (_ctx, contextSafe) => {
      if (prefersReducedMotion()) return;

      const ease = gsap.parseEase(`cubic-bezier(${EASE_GSAP.join(",")})`);
      const tl = gsap.timeline({ defaults: { ease } });

      tl.from("[data-hero-env]", {
        scale: 1.05,
        autoAlpha: 0,
        duration: 1.8,
      })
        .from(
          "[data-hero-figures]",
          { yPercent: 10, scale: 1.03, autoAlpha: 0, duration: 1.5 },
          0.28,
        )
        .from("[data-hero-scrim]", { autoAlpha: 0, duration: 1 }, 0.12)
        .from("[data-hero-eyebrow]", { y: -8, autoAlpha: 0, duration: 0.6 }, 0.48)
        .from("[data-hero-index]", { y: 10, autoAlpha: 0, duration: 0.5, stagger: 0.05 }, 0.52)
        .from(
          "[data-hero-line]",
          { yPercent: 108, duration: 1.05, stagger: 0.09 },
          0.56,
        )
        .from("[data-hero-sub]", { y: 12, autoAlpha: 0, duration: 0.6 }, 1.02)
        .from("[data-hero-cta]", { y: 16, autoAlpha: 0, duration: 0.7 }, 1.12)
        .from("[data-hero-side]", { y: 14, autoAlpha: 0, duration: 0.7 }, 1.18)
        .from("[data-hero-foot]", { autoAlpha: 0, duration: 0.6 }, 1.28);

      gsap.to("[data-hero-env] img", {
        yPercent: 6,
        scale: 1.04,
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      gsap.to("[data-hero-figures] img", {
        yPercent: -10,
        scale: 1.03,
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      gsap.to("[data-hero-copy]", {
        yPercent: -7,
        autoAlpha: 0.5,
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "42% top",
          end: "bottom top",
          scrub: true,
        },
      });

      const explore = exploreRef.current;
      if (!explore || !isFinePointer() || !contextSafe) return;

      const onMove = contextSafe((e: MouseEvent) => {
        const rect = explore.getBoundingClientRect();
        const dx = e.clientX - (rect.left + rect.width / 2);
        const dy = e.clientY - (rect.top + rect.height / 2);
        gsap.to(explore, {
          x: dx * 0.14,
          y: dy * 0.18,
          duration: 0.55,
          ease: "power3.out",
          overwrite: "auto",
        });
      });
      const onLeave = contextSafe(() => {
        gsap.to(explore, {
          x: 0,
          y: 0,
          duration: 0.85,
          ease: "elastic.out(1, 0.45)",
          overwrite: "auto",
        });
      });
      explore.addEventListener("mousemove", onMove);
      explore.addEventListener("mouseleave", onLeave);
      return () => {
        explore.removeEventListener("mousemove", onMove);
        explore.removeEventListener("mouseleave", onLeave);
      };
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="top"
      data-theme="ink"
      className="relative flex min-h-dvh flex-col overflow-hidden text-paper"
    >
      {/* z-0 — full-bleed environment (unchanged) */}
      <div
        data-hero-env
        data-cursor="EXPLORE"
        className="absolute inset-0 z-0 overflow-hidden"
      >
        <img
          src={HERO_ENVIRONMENT}
          alt=""
          draggable={false}
          className="pointer-events-none absolute inset-0 size-full scale-105 object-cover object-[center_42%] select-none"
        />
      </div>

      {/* Soft edge scrim — readability only; figures stay clear */}
      <div
        data-hero-scrim
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(90deg,rgba(8,12,10,0.48)_0%,rgba(8,12,10,0.14)_24%,transparent_46%),linear-gradient(to_top,rgba(8,12,10,0.7)_0%,rgba(8,12,10,0.18)_24%,transparent_50%)]"
      />

      {/* z-2 — foreground figures (layout unchanged) */}
      <div
        data-hero-figures
        data-cursor="VIEW"
        className="absolute bottom-[-10%] left-[-10%] top-[4%] z-[2] flex w-[92%] items-end justify-start md:left-[-6%] md:top-0 md:w-[72%] lg:w-[68%]"
      >
        <img
          src={HERO_FIGURES}
          alt="Sculptural figures — Heritage Collection"
          draggable={false}
          className="pointer-events-none h-full w-auto max-w-none object-contain object-left-bottom select-none"
        />
      </div>

      {/* z-3 — editorial UI framed to the edges */}
      <div className="pointer-events-none relative z-[3] flex flex-1 flex-col px-6 pt-28 md:px-12 md:pt-32 lg:px-14">
        <div
          data-hero-copy
          className="mt-[min(14vh,7rem)] flex max-w-xl flex-col md:mt-[min(16vh,8.5rem)]"
        >
          <div data-hero-eyebrow className="mb-8 flex flex-col items-start gap-3.5 md:mb-10">
            <span aria-hidden className="block h-6 w-px bg-paper/40" />
            <p className="text-[0.55rem] tracking-[0.34em] uppercase text-paper/60">
              Objects for a higher tomorrow
            </p>
          </div>

          <div className="flex items-start gap-5 md:gap-8">
            <ol
              aria-label="Collection sequence"
              className="mt-2.5 flex shrink-0 flex-col gap-2"
            >
              {SLIDES.map((n, i) => (
                <li
                  key={n}
                  data-hero-index
                  className={cn(
                    "flex items-center gap-2.5 text-[0.58rem] tracking-[0.18em] tabular-nums",
                    i === 0 ? "text-paper" : "text-paper/28",
                  )}
                >
                  <span>{n}</span>
                  {i === 0 && (
                    <span aria-hidden className="block h-px w-5 bg-paper/70" />
                  )}
                </li>
              ))}
            </ol>

            <div className="min-w-0">
              <h1 className="font-editorial text-[12.5vw] leading-[0.88] font-normal tracking-[-0.01em] text-paper uppercase md:text-[6.4vw] lg:text-[5.4vw]">
                <MaskLine>Art</MaskLine>
                <MaskLine>Lives</MaskLine>
                <MaskLine>With</MaskLine>
                <MaskLine>
                  You
                  <sup className="ml-1 align-super text-[0.28em] tracking-normal normal-case">
                    ™
                  </sup>
                </MaskLine>
              </h1>

              <p
                data-hero-sub
                className="mt-8 text-[0.55rem] tracking-[0.3em] uppercase text-paper/55 md:mt-10"
              >
                Curated objects for modern spaces
              </p>
            </div>
          </div>

          <a
            ref={exploreRef}
            href="#catalogue"
            data-hero-cta
            data-cursor=""
            className="pointer-events-auto mt-16 inline-flex w-fit items-center gap-5 md:mt-20"
          >
            <span className="flex size-16 items-center justify-center rounded-full bg-paper text-ink shadow-[0_0_0_1px_rgba(239,233,223,0.08)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-[1.05] md:size-[4.25rem]">
              <ArrowRight className="size-4" strokeWidth={1.05} />
            </span>
            <span className="flex flex-col gap-1 text-[0.58rem] leading-none tracking-[0.28em] uppercase text-paper/80">
              <span>Explore</span>
              <span>The Collection</span>
            </span>
          </a>
        </div>

        {/* Right-side collection info — lower right, framed to edge */}
        <aside
          data-hero-side
          className="pointer-events-auto absolute right-6 bottom-[6.5rem] flex flex-col items-end gap-2.5 text-right md:right-12 md:bottom-28 lg:right-14"
        >
          <span aria-hidden className="mb-1 block h-px w-8 bg-paper/35" />
          <span className="text-[0.55rem] tracking-[0.32em] uppercase text-paper/45">
            SS26
          </span>
          <p className="max-w-[10rem] text-[0.62rem] leading-[1.5] tracking-[0.2em] uppercase text-paper/88">
            The Heritage Collection
          </p>
          <a
            href="#catalogue"
            data-cursor=""
            className="group mt-3 inline-flex flex-col items-end gap-1.5 text-[0.55rem] tracking-[0.22em] uppercase text-paper/60 transition-colors hover:text-paper"
          >
            <span>View All</span>
            <ArrowRight
              className="size-3 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1"
              strokeWidth={1.1}
            />
          </a>
        </aside>
      </div>

      {/* Bottom editorial information bar */}
      <div
        data-hero-foot
        className="relative z-[3] border-t border-paper/12 bg-[rgba(6,10,8,0.78)]"
      >
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 px-6 py-3 md:px-12 md:py-3.5 lg:px-14">
          <p className="truncate text-[0.5rem] tracking-[0.26em] uppercase text-paper/48 md:text-[0.55rem]">
            Sculpted <span className="text-paper/22">/</span> Timeless{" "}
            <span className="text-paper/22">/</span> Meaningful
          </p>

          <div className="flex flex-col items-center gap-1">
            <span className="text-[0.5rem] tracking-[0.32em] uppercase text-paper/62">
              Scroll
            </span>
            <span aria-hidden className="h-4 w-px bg-paper/32 md:h-5" />
          </div>

          <div className="flex items-center justify-end gap-4">
            <span
              aria-hidden
              className="hidden h-px w-14 bg-paper/28 sm:block md:w-28 lg:w-36"
            />
            <p className="hidden text-[0.5rem] tracking-[0.26em] uppercase text-paper/48 sm:block md:text-[0.55rem]">
              A more conscious tomorrow
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
