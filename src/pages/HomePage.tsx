import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, useGSAP, THEME, type ThemeName } from "@/lib/motion";
import { Hero } from "@/sections/Hero";
import { Manifesto } from "@/sections/Manifesto";
import { Collection } from "@/sections/Collection";
import { ObjectStudy } from "@/sections/ObjectStudy";
import { Lookbook } from "@/sections/Lookbook";
import { ProductCatalogue } from "@/sections/ProductCatalogue";
import { Footer } from "@/sections/Footer";

export function HomePage() {
  const main = useRef<HTMLElement>(null);

  useEffect(() => {
    document.documentElement.style.setProperty("--bg", THEME.ink.bg);
    document.documentElement.style.setProperty("--fg", THEME.ink.fg);
  }, []);

  useGSAP(
    () => {
      gsap.utils.toArray<HTMLElement>("[data-theme]").forEach((section) => {
        const theme = THEME[section.dataset.theme as ThemeName];
        ScrollTrigger.create({
          trigger: section,
          start: "top 55%",
          end: "bottom 55%",
          onToggle: (self) => {
            if (!self.isActive) return;
            gsap.to(document.documentElement, {
              "--bg": theme.bg,
              "--fg": theme.fg,
              duration: 0.9,
              ease: "power2.out",
              overwrite: "auto",
            });
          },
        });
      });

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference) and (pointer: fine)", () => {
        gsap.utils.toArray<HTMLElement>("[data-speed]").forEach((el) => {
          const speed = parseFloat(el.dataset.speed ?? "0");
          if (!speed) return;
          gsap.to(el, {
            yPercent: speed * -100,
            ease: "none",
            scrollTrigger: {
              trigger: el.parentElement ?? el,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
              invalidateOnRefresh: true,
            },
          });
        });
      });

      document.fonts.ready.then(() => ScrollTrigger.refresh());
    },
    { scope: main },
  );

  return (
    <main ref={main}>
      <Hero />
      <Manifesto />
      <Collection />
      <ObjectStudy />
      <Lookbook />
      <ProductCatalogue />
      <Footer />
    </main>
  );
}
