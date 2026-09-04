import { useRef, type ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { gsap, useGSAP, EASE_GSAP, prefersReducedMotion, isFinePointer } from "@/lib/motion";
import { HERO_ENVIRONMENT, HERO_FIGURES, HERO_FIGURES_MOBILE } from "@/lib/data";
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

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const exploreRef = useRef<HTMLAnchorElement>(null);

  useGSAP(
    (_ctx, contextSafe) => {
      if (prefersReducedMotion()) return;

      const ease = gsap.parseEase(`cubic-bezier(${EASE_GSAP.join(",")})`);
      const tl = gsap.timeline({ defaults: { ease } });
      const desktopFig = root.current?.querySelector<HTMLElement>(
        "[data-hero-figures-desktop]",
      );
      const figuresStage = root.current?.querySelector<HTMLElement>(
        "[data-hero-figures]",
      );

      tl.from("[data-hero-env]", {
        scale: 1.04,
        autoAlpha: 0,
        duration: 1.4,
      })
        .from(
          figuresStage ?? "[data-hero-figures]",
          { yPercent: 6, autoAlpha: 0, duration: 1.1 },
          0.2,
        )
        .from("[data-hero-scrim]", { autoAlpha: 0, duration: 0.8 }, 0.1)
        .from(
          "[data-hero-line]",
          { yPercent: 100, duration: 0.85, stagger: 0.07 },
          0.4,
        )
        .from("[data-hero-eyebrow]", { autoAlpha: 0, duration: 0.45 }, 0.5)
        .from("[data-hero-sub]", { autoAlpha: 0, duration: 0.45 }, 0.85)
        .from("[data-hero-cta]", { autoAlpha: 0, duration: 0.5 }, 0.95)
        .from("[data-hero-side]", { autoAlpha: 0, duration: 0.5 }, 1)
        .from("[data-hero-foot]", { autoAlpha: 0, duration: 0.45 }, 1.05);

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

      const mm = gsap.matchMedia();
      const mobileFig = root.current?.querySelector<HTMLElement>(
        "[data-hero-figures-mobile]",
      );

      // Mobile — gentle parallax while scrolling
      mm.add("(max-width: 639px)", () => {
        if (mobileFig) {
          gsap.to(mobileFig, {
            yPercent: -12,
            scale: 1.04,
            ease: "none",
            scrollTrigger: {
              trigger: root.current,
              start: "top top",
              end: "bottom top",
              scrub: 0.7,
            },
          });
        }

        gsap.to("[data-hero-eyebrow]", {
          y: -24,
          autoAlpha: 0,
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "35% top",
            scrub: true,
          },
        });

        gsap.to("[data-hero-copy]", {
          yPercent: -18,
          autoAlpha: 0.35,
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "bottom top",
            scrub: 0.55,
          },
        });

        gsap.to("[data-hero-foot]", {
          y: 20,
          autoAlpha: 0,
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "40% top",
            scrub: true,
          },
        });
      });

      // Web / tablet — figures rise and scale with scroll depth
      mm.add("(min-width: 640px)", () => {
        if (!desktopFig) return;

        gsap.fromTo(
          desktopFig,
          { yPercent: 0, scale: 1, transformOrigin: "50% 100%" },
          {
            yPercent: -18,
            scale: 1.06,
            ease: "none",
            scrollTrigger: {
              trigger: root.current,
              start: "top top",
              end: "bottom top",
              scrub: 0.85,
            },
          },
        );

        if (figuresStage) {
          gsap.to(figuresStage, {
            yPercent: -6,
            ease: "none",
            scrollTrigger: {
              trigger: root.current,
              start: "top top",
              end: "bottom top",
              scrub: 1.1,
            },
          });
        }

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
      });

      const explore = exploreRef.current;
      if (!explore) return;

      const circle = explore.querySelector<HTMLElement>("[data-hero-cta-circle]");
      const arrow = explore.querySelector<HTMLElement>("[data-hero-cta-arrow]");
      const ring = explore.querySelector<HTMLElement>("[data-hero-cta-ring]");

      if (circle) {
        gsap.to(circle, {
          scale: 1.045,
          duration: 2.4,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });
      }
      if (arrow) {
        gsap.to(arrow, {
          x: 5,
          duration: 1.5,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          delay: 0.2,
        });
      }
      if (ring) {
        gsap.fromTo(
          ring,
          { scale: 1, autoAlpha: 0.4 },
          {
            scale: 1.45,
            autoAlpha: 0,
            duration: 2.6,
            ease: "power1.out",
            repeat: -1,
            transformOrigin: "50% 50%",
          },
        );
      }

      if (!isFinePointer() || !contextSafe) return;

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
      {/* z-0 — same full-bleed environment on all breakpoints */}
      <div
        data-hero-env
        data-cursor="EXPLORE"
        className="absolute inset-0 z-0 overflow-hidden"
      >
        <img
          src={HERO_ENVIRONMENT}
          alt=""
          draggable={false}
          className="pointer-events-none absolute inset-0 size-full scale-105 object-cover object-[center_35%] select-none sm:object-[center_42%]"
        />
      </div>

      {/* Soft edge scrim — readability only; figures stay clear */}
      <div
        data-hero-scrim
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(to_bottom,rgba(8,12,10,0.35)_0%,transparent_14%,transparent_70%,rgba(8,12,10,0.75)_100%)] sm:bg-[linear-gradient(90deg,rgba(8,12,10,0.48)_0%,rgba(8,12,10,0.14)_24%,transparent_46%),linear-gradient(to_top,rgba(8,12,10,0.7)_0%,rgba(8,12,10,0.18)_24%,transparent_50%)]"
      />

      {/* Stage above the foot bar */}
      <div className="relative z-[2] flex min-h-0 flex-1 flex-col">
        {/* Mobile eyebrow */}
        <p
          data-hero-eyebrow
          className="relative z-[3] shrink-0 px-5 pt-[4.75rem] text-[0.5rem] leading-[1.65] tracking-[0.28em] uppercase text-paper/55 sm:hidden"
        >
          Objects for a higher tomorrow
        </p>

        {/* Figures — in-flow above copy on mobile; absolute overlay on sm+ */}
        <div
          data-hero-figures
          data-cursor="VIEW"
          className="relative z-[2] flex min-h-0 w-full flex-1 items-end justify-center px-2 pt-1 sm:absolute sm:inset-x-0 sm:top-[8%] sm:bottom-0 sm:items-end sm:px-0 sm:pt-0 md:top-[6%] md:left-[8%] lg:left-[10%]"
        >
          <img
            data-hero-figures-mobile
            src={HERO_FIGURES_MOBILE}
            alt="Sculptural figures — Heritage Collection"
            draggable={false}
            className="pointer-events-none h-full max-h-full w-full origin-bottom object-contain object-bottom will-change-transform select-none sm:hidden"
          />
          <img
            data-hero-figures-desktop
            src={HERO_FIGURES}
            alt="Sculptural figures — Heritage Collection"
            draggable={false}
            className="pointer-events-none hidden h-full w-full max-h-full origin-bottom object-contain object-bottom will-change-transform select-none sm:block sm:scale-100"
          />
        </div>

        {/* Editorial UI — sits below artwork on mobile with a little gap */}
        <div className="pointer-events-none relative z-[3] flex shrink-0 flex-col px-5 pt-1.5 pb-1 sm:flex-1 sm:px-6 sm:pt-28 sm:pb-0 md:px-12 md:pt-32 lg:px-14">
          <div
            data-hero-copy
            className="flex max-w-xl flex-col sm:mt-[min(14vh,7rem)]"
          >
            <div className="min-w-0">
              {/* Mobile — single horizontal line, clear of the image */}
              <h1 className="font-editorial text-[clamp(1.35rem,7.2vw,2.05rem)] leading-none font-normal tracking-[-0.02em] whitespace-nowrap text-paper uppercase sm:hidden">
                <MaskLine>
                  Art Lives With You
                  <sup className="ml-0.5 align-super text-[0.32em] tracking-normal normal-case">
                    ™
                  </sup>
                </MaskLine>
              </h1>

              {/* Desktop / tablet — stacked editorial lines */}
              <h1 className="font-editorial hidden text-[12.5vw] leading-[0.88] font-normal tracking-[-0.01em] text-paper uppercase sm:block md:text-[6.4vw] lg:text-[5.4vw]">
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
                className="mt-3 text-[0.52rem] leading-[1.7] tracking-[0.28em] uppercase text-paper/65 sm:mt-8 sm:text-[0.55rem] sm:leading-normal sm:tracking-[0.3em] sm:text-paper/55 md:mt-10"
              >
                <span className="block sm:inline">Curated objects</span>
                <span className="block sm:inline">
                  <span className="hidden sm:inline"> </span>
                  for modern spaces
                </span>
              </p>
            </div>

            <a
              ref={exploreRef}
              href="#catalogue"
              data-hero-cta
              data-cursor=""
              className="pointer-events-auto mt-5 mb-2 inline-flex w-fit items-center gap-3.5 sm:mt-16 sm:mb-0 sm:gap-5 md:mt-20"
            >
              <span className="relative flex size-[4.25rem] shrink-0 items-center justify-center sm:size-[5.5rem] md:size-[6.75rem]">
                <span
                  data-hero-cta-ring
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-full border border-paper/35"
                />
                <span
                  data-hero-cta-circle
                  className="relative z-[1] flex size-full items-center justify-center rounded-full bg-paper text-ink shadow-[0_0_0_1px_rgba(239,233,223,0.08)] will-change-transform transition-transform active:scale-[0.97]"
                >
                  <ArrowRight
                    data-hero-cta-arrow
                    className="size-[1.15rem] will-change-transform sm:size-6 md:size-7"
                    strokeWidth={1.05}
                  />
                </span>
              </span>
              <span className="flex flex-col gap-1 text-[0.55rem] leading-none tracking-[0.26em] uppercase text-paper/85 sm:text-[0.58rem] sm:tracking-[0.28em] sm:text-paper/80">
                <span>Explore</span>
                <span>The Collection</span>
              </span>
            </a>
          </div>

          {/* Right-side collection info — desktop/tablet only */}
          <aside
            data-hero-side
            className="pointer-events-auto absolute right-6 bottom-8 hidden flex-col items-end gap-2.5 text-right sm:flex md:right-12 md:bottom-10 lg:right-14"
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
      </div>

      {/* Bottom editorial information bar */}
      <div
        data-hero-foot
        className="relative z-[3] border-t border-paper/12 bg-transparent sm:bg-[rgba(6,10,8,0.78)]"
      >
        {/* Mobile foot — left tags + right stacked line */}
        <div className="flex items-end justify-between gap-4 px-5 py-3.5 sm:hidden">
          <p className="text-[0.46rem] tracking-[0.22em] uppercase text-paper/50">
            Sculpted <span className="text-paper/22">/</span> Timeless{" "}
            <span className="text-paper/22">/</span> Meaningful
          </p>
          <div className="flex flex-col items-end gap-1.5 text-right">
            <p className="text-[0.46rem] leading-[1.45] tracking-[0.22em] uppercase text-paper/50">
              A more conscious tomorrow
            </p>
            <span aria-hidden className="block h-px w-10 bg-paper/35" />
          </div>
        </div>

        {/* Desktop / tablet foot — approved layout */}
        <div className="hidden grid-cols-[1fr_auto_1fr] items-center gap-4 px-6 py-3 sm:grid md:px-12 md:py-3.5 lg:px-14">
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
              className="h-px w-14 bg-paper/28 md:w-28 lg:w-36"
            />
            <p className="text-[0.5rem] tracking-[0.26em] uppercase text-paper/48 md:text-[0.55rem]">
              A more conscious tomorrow
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
