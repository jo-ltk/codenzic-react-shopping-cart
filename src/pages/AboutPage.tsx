import { useEffect, useRef } from "react";
import { Link } from "react-router";
import { ArrowUpRight } from "lucide-react";
import { gsap, THEME, useGSAP, prefersReducedMotion } from "@/lib/motion";
import { MagneticButton } from "@/components/MagneticButton";
import { ScrubWords } from "@/components/ScrubWords";
import { Footer } from "@/sections/Footer";

const PRINCIPLES = [
  {
    index: "01",
    title: "Made once",
    body: "Small runs, not endless restocks. Each piece enters the catalogue when it is ready — not when a calendar demands it.",
  },
  {
    index: "02",
    title: "Made well",
    body: "Joinery you can feel. Materials that age honestly. We choose workshops that treat patience as a craft skill.",
  },
  {
    index: "03",
    title: "Made to stay",
    body: "Trend cycles are loud. Our objects are quieter: designed for rooms that keep their company for years, not seasons.",
  },
] as const;

/**
 * Dedicated About page — brand story, belief, and working principles.
 * Editorial layout mirrors Catalogue; motion stays reveal-led.
 */
export function AboutPage() {
  const main = useRef<HTMLElement>(null);

  useEffect(() => {
    document.documentElement.style.setProperty("--bg", THEME.paper.bg);
    document.documentElement.style.setProperty("--fg", THEME.paper.fg);
  }, []);

  useGSAP(
    () => {
      const reduced = prefersReducedMotion();

      gsap.from("[data-about-reveal]", {
        y: reduced ? 12 : 36,
        autoAlpha: 0,
        duration: reduced ? 0.4 : 0.95,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: { trigger: main.current, start: "top 80%", once: true },
      });

      gsap.from("[data-about-rule]", {
        scaleX: 0,
        transformOrigin: "left center",
        duration: reduced ? 0.4 : 1.3,
        ease: "power3.out",
        scrollTrigger: {
          trigger: "[data-about-belief]",
          start: "top 75%",
          once: true,
        },
      });

      gsap.from("[data-about-principle]", {
        y: reduced ? 16 : 40,
        autoAlpha: 0,
        duration: reduced ? 0.4 : 0.9,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: {
          trigger: "[data-about-principles]",
          start: "top 78%",
          once: true,
        },
      });

      gsap.from("[data-about-studio] > *", {
        y: reduced ? 14 : 32,
        autoAlpha: 0,
        duration: reduced ? 0.4 : 0.9,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: "[data-about-studio]",
          start: "top 80%",
          once: true,
        },
      });
    },
    { scope: main },
  );

  return (
    <>
      <main
        ref={main}
        data-theme="paper"
        className="relative overflow-x-clip pt-24 pb-0 sm:pt-28 md:pt-32"
      >
        <div className="flex flex-col gap-4 px-5 pt-4 pb-6 sm:px-8 sm:pb-8 md:flex-row md:items-end md:justify-between md:px-10 lg:px-14 xl:px-16">
          <div className="min-w-0">
            <p className="meta truncate text-fg/45">
              <Link to="/" data-cursor="" className="transition-colors duration-300 hover:text-accent">
                Home
              </Link>
              <span className="mx-2 text-fg/25">/</span>
              <span className="text-fg/70">About</span>
            </p>
          </div>
          <p className="meta hidden text-fg/40 md:block">
            House note
            <span className="mx-2 text-fg/25">·</span>
            Est. quietly
          </p>
        </div>

        {/* Statement */}
        <header className="relative border-t border-fg/15 px-5 pt-10 pb-14 sm:px-8 md:px-10 md:pt-14 md:pb-20 lg:px-14 xl:px-16">
          <span
            aria-hidden
            className="text-outline pointer-events-none absolute top-4 right-5 z-0 hidden font-display text-[7rem] leading-none font-light opacity-50 select-none sm:right-8 sm:block md:top-6 md:right-10 md:text-[9rem] lg:right-14 lg:text-[10rem] xl:right-16 xl:text-[12rem]"
          >
            01
          </span>

          <div className="relative z-10 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-x-10 xl:gap-x-14">
            <div data-about-reveal className="lg:col-span-7">
              <p className="meta flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="text-accent">House N° 01</span>
                <span aria-hidden className="size-1 rounded-full bg-fg/25" />
                <span className="text-fg/45">About</span>
              </p>
              <h1 className="mt-7 font-display text-[2.6rem] leading-[1.04] font-light tracking-[-0.01em] sm:text-5xl lg:text-[3.4rem] xl:text-[4rem]">
                OBJEKT
                <sup className="ml-1 text-[0.4em] tracking-normal">®</sup>
                <br />
                <em className="text-accent">for quieter rooms.</em>
              </h1>
            </div>

            <div data-about-reveal className="flex flex-col justify-end lg:col-span-5">
              <p className="max-w-md text-[0.95rem] leading-[1.7] text-fg/65">
                A catalogue of considered objects — pieces made once, made well,
                and chosen for rooms that prefer presence over noise.
              </p>
            </div>
          </div>
        </header>

        {/* Belief */}
        <section
          data-about-belief
          className="border-t border-fg/15 px-5 py-20 sm:px-8 md:px-10 md:py-28 lg:px-14 xl:px-16"
        >
          <div data-about-rule className="mb-14 h-px w-full bg-fg/15 md:mb-20" />
          <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
            <div className="md:col-span-3">
              <span className="meta text-fg/50">Belief</span>
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

        {/* Principles */}
        <section
          data-about-principles
          className="border-t border-fg/15 px-5 py-20 sm:px-8 md:px-10 md:py-28 lg:px-14 xl:px-16"
        >
          <div className="mb-14 flex flex-col gap-4 md:mb-20 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="meta text-accent">How we choose</p>
              <h2 className="mt-4 font-display text-3xl font-light tracking-[-0.01em] md:text-4xl lg:text-5xl">
                Three quiet rules.
              </h2>
            </div>
            <p className="meta max-w-xs text-fg/45 md:text-right">
              What earns a place in the catalogue
            </p>
          </div>

          <ul className="grid grid-cols-1 gap-0 border-t border-fg/15 md:grid-cols-3">
            {PRINCIPLES.map((item) => (
              <li
                key={item.index}
                data-about-principle
                className="border-b border-fg/15 py-10 md:border-r md:border-b-0 md:px-8 md:py-12 md:first:pl-0 md:last:border-r-0 md:last:pr-0"
              >
                <span className="meta text-accent">{item.index}</span>
                <h3 className="mt-5 font-display text-2xl font-light tracking-[-0.01em] md:text-3xl">
                  {item.title}
                </h3>
                <p className="mt-5 max-w-sm text-[0.95rem] leading-[1.7] text-fg/60">
                  {item.body}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* Studio */}
        <section
          data-about-studio
          className="border-t border-fg/15 px-5 py-20 sm:px-8 md:px-10 md:py-28 lg:px-14 xl:px-16"
        >
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-x-14">
            <figure className="relative overflow-hidden bg-fg/[0.03] lg:col-span-6">
              <div className="aspect-[4/5]">
                <img
                  src="/products/chair.jpg"
                  alt="Empire Wing Chair in forest velvet"
                  loading="lazy"
                  className="img-tone h-full w-full object-cover"
                />
              </div>
              <figcaption className="meta mt-4 text-fg/45">
                Fig. — Empire Wing Chair, lion arms
              </figcaption>
            </figure>

            <div className="lg:col-span-5 lg:col-start-8">
              <p className="meta text-accent">The house</p>
              <h2 className="mt-5 font-display text-3xl leading-[1.15] font-light tracking-[-0.01em] md:text-4xl">
                A small editorial
                <br />
                for lasting things.
              </h2>
              <p className="mt-8 text-[0.95rem] leading-[1.75] text-fg/65">
                OBJEKT is not a marketplace of everything. It is a rotating issue —
                photographed in situ, written with care, and updated when something
                genuinely belongs. We publish slowly so the room can keep up.
              </p>
              <p className="mt-6 text-[0.95rem] leading-[1.75] text-fg/65">
                Behind the catalogue is Codenzic Innovations — building digital
                experiences with the same preference for clarity over clutter.
              </p>
              <div className="mt-12">
                <MagneticButton className="meta text-fg" href="/catalogue">
                  <span className="flex items-center gap-2">
                    Enter the catalogue
                    <ArrowUpRight className="size-4" strokeWidth={1.5} />
                  </span>
                </MagneticButton>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
