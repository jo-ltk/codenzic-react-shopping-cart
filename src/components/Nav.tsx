import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import { Search, X } from "lucide-react";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/motion";
import { useCartStore } from "@/lib/store/cart";
import { cn } from "@/lib/utils";

type NavLink = {
  label: string;
  to: string;
  index: string;
  note: string;
};

function buildLinks(isHome: boolean): NavLink[] {
  return [
    { label: "Shop", to: "/catalogue", index: "01", note: "The archive" },
    {
      label: "Collections",
      to: isHome ? "#index" : "/#index",
      index: "02",
      note: "The index",
    },
    {
      label: "About",
      to: isHome ? "#manifesto" : "/#manifesto",
      index: "03",
      note: "The manifesto",
    },
    {
      label: "Journal",
      to: isHome ? "#anatomy" : "/#anatomy",
      index: "04",
      note: "Field notes",
    },
  ];
}

function isShopActive(pathname: string) {
  return pathname === "/catalogue" || pathname.startsWith("/catalogue/");
}

/**
 * Editorial navigation — asymmetric chrome, numbered index overlay,
 * and a purpose-built mobile experience. Keeps mix-blend difference
 * for legibility across paper/ink worlds when the menu is closed.
 */
export function Nav() {
  const { pathname } = useLocation();
  const isHome = pathname === "/";
  const links = buildLinks(isHome);
  const cartCount = useCartStore((s) =>
    s.items.reduce((sum, item) => sum + item.quantity, 0),
  );
  const openCart = useCartStore((s) => s.openCart);

  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const prevCount = useRef(cartCount);
  const wasMenuOpen = useRef(false);

  // Close index on route change.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Escape closes the index.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  // Subtle scroll signal for a hairline rule — no heavy sticky chrome.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Cart count tick.
  useGSAP(
    () => {
      if (prevCount.current === cartCount || !countRef.current) {
        prevCount.current = cartCount;
        return;
      }
      prevCount.current = cartCount;
      if (prefersReducedMotion()) return;
      gsap.fromTo(
        countRef.current,
        { yPercent: 40, autoAlpha: 0 },
        { yPercent: 0, autoAlpha: 1, duration: 0.45, ease: "power3.out" },
      );
    },
    { dependencies: [cartCount] },
  );

  // Index overlay open / close.
  useGSAP(
    () => {
      const overlay = overlayRef.current;
      if (!overlay) return;

      const panel = overlay.querySelector<HTMLElement>("[data-nav-panel]");
      const items = overlay.querySelectorAll<HTMLElement>("[data-nav-item]");
      const foot = overlay.querySelectorAll<HTMLElement>("[data-nav-foot]");

      if (prefersReducedMotion()) {
        overlay.style.pointerEvents = menuOpen ? "auto" : "none";
        overlay.style.visibility = menuOpen ? "visible" : "hidden";
        if (panel) {
          panel.style.opacity = menuOpen ? "1" : "0";
          panel.style.clipPath = menuOpen ? "inset(0 0 0% 0)" : "inset(0 0 100% 0)";
        }
        document.documentElement.style.overflow = menuOpen ? "hidden" : "";
        wasMenuOpen.current = menuOpen;
        return;
      }

      if (menuOpen) {
        overlay.style.pointerEvents = "auto";
        overlay.style.visibility = "visible";
        document.documentElement.style.overflow = "hidden";

        const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
        tl.fromTo(
          panel,
          { clipPath: "inset(0 0 100% 0)" },
          { clipPath: "inset(0 0 0% 0)", duration: 0.85 },
          0,
        )
          .fromTo(
            items,
            { yPercent: 110, autoAlpha: 0 },
            { yPercent: 0, autoAlpha: 1, duration: 0.9, stagger: 0.07 },
            0.28,
          )
          .fromTo(
            foot,
            { y: 18, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 0.6, stagger: 0.06 },
            0.55,
          );

        wasMenuOpen.current = true;
        return () => {
          tl.kill();
        };
      }

      if (!wasMenuOpen.current) return;

      const tl = gsap.timeline({
        defaults: { ease: "power2.inOut" },
        onComplete: () => {
          overlay.style.pointerEvents = "none";
          overlay.style.visibility = "hidden";
          document.documentElement.style.overflow = "";
          wasMenuOpen.current = false;
        },
      });
      tl.to(items, { yPercent: -30, autoAlpha: 0, duration: 0.35, stagger: 0.03 }, 0)
        .to(foot, { autoAlpha: 0, duration: 0.25 }, 0)
        .to(panel, { clipPath: "inset(0 0 100% 0)", duration: 0.55 }, 0.05);

      return () => {
        tl.kill();
      };
    },
    { dependencies: [menuOpen] },
  );

  // Entrance for the chrome itself.
  useGSAP(
    () => {
      const header = headerRef.current;
      if (!header || prefersReducedMotion()) return;
      gsap.from(header.querySelectorAll("[data-nav-chrome]"), {
        y: -18,
        autoAlpha: 0,
        duration: 1,
        stagger: 0.06,
        ease: "expo.out",
        delay: 0.15,
      });
    },
    { scope: headerRef },
  );

  const homeTo = isHome ? "#top" : "/";

  return (
    <>
      <header
        ref={headerRef}
        className={cn(
          "fixed inset-x-0 top-0 z-[80] transition-[background-color,backdrop-filter,border-color] duration-500",
          menuOpen
            ? "border-b border-transparent text-paper"
            : "mix-blend-difference text-white",
          !menuOpen && scrolled ? "border-b border-white/10" : "border-b border-transparent",
        )}
      >
        <div className="flex items-center justify-between gap-4 px-5 py-4 sm:px-8 md:px-10 md:py-5 lg:px-14 xl:px-16">
          {/* Brand */}
          <div data-nav-chrome className="flex min-w-0 items-center gap-4 md:gap-6">
            <Link
              to={homeTo}
              data-cursor=""
              onClick={() => setMenuOpen(false)}
              className="group relative text-[0.78rem] font-medium tracking-[0.38em] uppercase md:text-[0.82rem]"
            >
              Objekt
              <sup className="ml-px text-[0.5em] tracking-normal">®</sup>
              <span
                aria-hidden
                className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-current transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100"
              />
            </Link>
            <span className="meta hidden text-current/40 lg:inline">Issue 06</span>
          </div>

          {/* Desktop index links — numbered, editorial */}
          <nav
            data-nav-chrome
            aria-label="Primary"
            className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 lg:flex"
          >
            {links.map((link) => {
              const active = link.to === "/catalogue" && isShopActive(pathname);
              return (
                <Link
                  key={link.label}
                  to={link.to}
                  data-cursor=""
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group relative px-3.5 py-2 text-[0.7rem] font-light tracking-[0.06em] transition-colors duration-300",
                    active ? "text-white" : "text-white/70 hover:text-white",
                  )}
                >
                  <span className="meta mr-2 inline-block text-[0.55rem] text-current/35 transition-colors duration-300 group-hover:text-current/70">
                    {link.index}
                  </span>
                  {link.label}
                  <span
                    aria-hidden
                    className={cn(
                      "absolute inset-x-3.5 -bottom-0.5 h-px origin-center bg-current transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                      active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100",
                    )}
                  />
                </Link>
              );
            })}
          </nav>

          {/* Utilities */}
          <div data-nav-chrome className="flex items-center justify-end gap-1 sm:gap-2">
            <Link
              to="/catalogue"
              data-cursor=""
              aria-label="Search catalogue"
              onClick={() => setMenuOpen(false)}
              className="group relative hidden items-center gap-2 px-3 py-2 text-[0.68rem] font-light tracking-[0.04em] text-white/80 transition-colors duration-300 hover:text-white sm:inline-flex"
            >
              <span>Search</span>
              <Search
                className="size-3.5 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:rotate-12"
                strokeWidth={1.15}
              />
            </Link>

            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                openCart();
              }}
              data-cursor=""
              aria-label={`Open cart, ${cartCount} items`}
              className="group relative inline-flex items-center gap-2 px-3 py-2 text-[0.68rem] font-light tracking-[0.04em] text-white/80 transition-colors duration-300 hover:text-white"
            >
              <span className="hidden sm:inline">Cart</span>
              <span className="relative inline-flex min-w-[1.6rem] items-center justify-center overflow-hidden border border-current/25 px-1.5 py-0.5 font-mono text-[0.62rem] tracking-[0.12em] transition-colors duration-300 group-hover:border-current/60 group-hover:bg-white group-hover:text-ink">
                <span ref={countRef} className="inline-block">
                  {String(cartCount).padStart(2, "0")}
                </span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              data-cursor=""
              aria-expanded={menuOpen}
              aria-controls="nav-index"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              className={cn(
                "group relative ml-1 inline-flex min-h-10 items-center gap-2.5 px-2 py-2 transition-colors duration-300",
                menuOpen ? "text-paper" : "text-white/85 hover:text-white",
              )}
            >
              <span className="meta hidden tracking-[0.2em] sm:inline">
                {menuOpen ? "Close" : "Index"}
              </span>
              <span className="relative flex h-3.5 w-5 flex-col justify-between" aria-hidden>
                <span
                  className={cn(
                    "block h-px w-full origin-center bg-current transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                    menuOpen && "translate-y-[6.5px] rotate-45",
                  )}
                />
                <span
                  className={cn(
                    "block h-px w-full bg-current transition-opacity duration-300",
                    menuOpen && "opacity-0",
                  )}
                />
                <span
                  className={cn(
                    "block h-px w-full origin-center bg-current transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                    menuOpen ? "w-full -translate-y-[6.5px] -rotate-45" : "w-3.5 self-end group-hover:w-full",
                  )}
                />
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Full-viewport Index — desktop + mobile destination */}
      <div
        ref={overlayRef}
        id="nav-index"
        role="dialog"
        aria-modal="true"
        aria-label="Site index"
        aria-hidden={!menuOpen}
        className="fixed inset-0 z-[75] invisible"
        style={{ pointerEvents: "none" }}
      >
        <div
          data-nav-panel
          className="absolute inset-0 flex flex-col bg-ink text-paper"
          style={{ clipPath: "inset(0 0 100% 0)" }}
        >
          <div className="flex flex-1 flex-col px-5 pt-28 pb-10 sm:px-8 md:px-10 md:pt-32 lg:px-14 xl:px-16">
            <div className="mb-8 flex items-end justify-between gap-6 border-b border-paper/15 pb-6 md:mb-12 md:pb-8">
              <div data-nav-foot>
                <p className="meta text-paper/45">Site index</p>
                <p className="mt-2 font-display text-2xl font-light tracking-[-0.01em] md:text-3xl">
                  Where to next.
                </p>
              </div>
              <p data-nav-foot className="meta hidden text-paper/40 sm:block">
                Esc to close
              </p>
            </div>

            <nav aria-label="Index" className="flex flex-1 flex-col justify-center">
              <ul className="space-y-1 md:space-y-2">
                {links.map((link) => {
                  const active = link.to === "/catalogue" && isShopActive(pathname);
                  return (
                    <li key={link.label} className="overflow-hidden">
                      <Link
                        to={link.to}
                        data-nav-item
                        data-cursor=""
                        aria-current={active ? "page" : undefined}
                        onClick={() => setMenuOpen(false)}
                        className="group flex items-baseline justify-between gap-6 border-b border-paper/10 py-4 transition-colors duration-500 hover:border-accent/50 md:py-5"
                      >
                        <span className="flex min-w-0 items-baseline gap-4 md:gap-8">
                          <span className="meta shrink-0 text-paper/35 transition-colors duration-500 group-hover:text-accent">
                            {link.index}
                          </span>
                          <span
                            className={cn(
                              "font-display text-[clamp(2.4rem,8vw,6.5rem)] leading-[0.95] font-light tracking-[-0.02em] transition-colors duration-500",
                              active ? "text-accent" : "text-paper group-hover:text-accent",
                            )}
                          >
                            {link.label}
                          </span>
                        </span>
                        <span className="meta hidden shrink-0 text-paper/35 transition-colors duration-500 group-hover:text-paper/70 sm:inline">
                          {link.note}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="mt-10 flex flex-col gap-6 border-t border-paper/15 pt-8 sm:mt-12 sm:flex-row sm:items-center sm:justify-between md:pt-10">
              <div data-nav-foot className="flex flex-wrap items-center gap-3">
                <Link
                  to="/catalogue"
                  data-cursor=""
                  onClick={() => setMenuOpen(false)}
                  className="meta inline-flex min-h-11 items-center gap-2 border border-paper/20 px-4 py-2.5 text-paper/80 transition-colors duration-300 hover:border-accent hover:text-accent"
                >
                  <Search className="size-3.5" strokeWidth={1.25} />
                  Search archive
                </Link>
                <button
                  type="button"
                  data-cursor=""
                  onClick={() => {
                    setMenuOpen(false);
                    openCart();
                  }}
                  className="meta inline-flex min-h-11 items-center gap-2 bg-paper px-4 py-2.5 text-ink transition-colors duration-300 hover:bg-accent hover:text-paper"
                >
                  Open cart
                  <span className="font-mono tracking-[0.12em]">
                    ({String(cartCount).padStart(2, "0")})
                  </span>
                </button>
              </div>

              <p data-nav-foot className="meta text-paper/40">
                OBJEKT
                <span className="mx-2 text-paper/20">·</span>
                Current issue
              </p>
            </div>
          </div>

          <button
            type="button"
            data-cursor=""
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
            className="absolute top-5 right-5 inline-flex size-11 items-center justify-center text-paper/70 transition-colors duration-300 hover:text-accent sm:top-6 sm:right-8 md:right-10 lg:right-14"
          >
            <X className="size-5" strokeWidth={1.15} />
          </button>
        </div>
      </div>
    </>
  );
}
