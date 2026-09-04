import { useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import { gsap, useGSAP } from "@/lib/motion";
import { Marquee } from "@/components/Marquee";
import { MagneticButton } from "@/components/MagneticButton";

const LINK_GROUPS = [
  {
    title: "Catalogue",
    links: [
      { label: "Current issue", href: "/catalogue" },
      { label: "Archive", href: "/catalogue" },
      { label: "The workshops", href: "/#index" },
    ],
  },
  {
    title: "Practical",
    links: [
      { label: "About", href: "/about" },
      { label: "Shipping", href: "/#footer" },
      { label: "Returns", href: "/#footer" },
    ],
  },
  {
    title: "Elsewhere",
    links: [
      { label: "Instagram", href: "/#footer" },
      { label: "Are.na", href: "/#footer" },
      { label: "Newsletter", href: "/#footer" },
    ],
  },
];

export function Footer() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.from("[data-footer-reveal]", {
        y: 40,
        autoAlpha: 0,
        duration: 1,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: { trigger: root.current, start: "top 70%", once: true },
      });

      // the giant wordmark rises out of the fold
      gsap.from("[data-wordmark]", {
        yPercent: 40,
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "top bottom",
          end: "bottom bottom",
          scrub: true,
        },
      });
    },
    { scope: root },
  );

  return (
    <footer ref={root} id="footer" data-theme="ink" className="relative overflow-hidden">
      <Marquee className="border-y border-fg/15 py-3" duration={22}>
        <span className="meta flex items-center text-accent">
          <span className="px-6">The shop opens with Issue 05</span>
          <span className="size-1 rounded-full bg-current" />
          <span className="px-6">Join the waiting list</span>
          <span className="size-1 rounded-full bg-current" />
        </span>
      </Marquee>

      <div className="px-5 pt-28 md:px-10 md:pt-40">
        <div className="mx-auto max-w-3xl text-center">
          <h2
            data-footer-reveal
            className="font-display text-5xl leading-[1.05] font-light md:text-7xl"
          >
            Own fewer,
            <br />
            <em className="text-accent">better</em> things.
          </h2>
          <div data-footer-reveal className="mt-12">
            <MagneticButton className="meta text-fg" href="/catalogue">
              <span className="flex items-center gap-2">
                Enter the catalogue
                <ArrowUpRight className="size-4" strokeWidth={1.5} />
              </span>
            </MagneticButton>
          </div>
        </div>

        <div
          data-footer-reveal
          className="mt-28 grid grid-cols-2 gap-10 border-t border-fg/15 pt-12 md:grid-cols-4"
        >
          <div>
            <span className="font-display text-lg">OBJEKT<sup className="text-[0.55em]">®</sup></span>
            <p className="meta mt-4 max-w-[16ch] text-fg/45">
              A catalogue of considered objects
            </p>
          </div>
          {LINK_GROUPS.map((group) => (
            <nav key={group.title}>
              <span className="meta text-fg/45">{group.title}</span>
              <ul className="mt-4 space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-fg/75 transition-colors duration-300 hover:text-accent"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="meta mt-16 flex items-center justify-between pb-6 text-fg/40">
          <span>© 2026 OBJEKT — Codenzic Innovations</span>
          <span>Objects photographed in situ</span>
        </div>
      </div>

      {/* giant clipped wordmark */}
      <div aria-hidden className="pointer-events-none relative h-[18vw] overflow-hidden">
        <span
          data-wordmark
          className="text-outline absolute inset-x-0 -bottom-[6vw] text-center font-display text-[24vw] leading-none font-semibold tracking-tight"
        >
          OBJEKT
        </span>
      </div>
    </footer>
  );
}
