import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import { Search } from "lucide-react";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/motion";
import { calculateCartTotals } from "@/lib/cart/calculations";
import { useCartStore } from "@/lib/store/cart";
import { cn } from "@/lib/utils";

type NavLink = { label: string; to: string };

function buildLinks(isHome: boolean): NavLink[] {
  // Only real routes / home sections — no Journal page, so Lookbook stands in.
  // Hash targets use distinct ids (collection / lookbook) so they never collide
  // with the /catalogue route path.
  return [
    { label: "Shop", to: "/catalogue" },
    { label: "Collections", to: isHome ? "#collection" : "/#collection" },
    { label: "About", to: "/about" },
    { label: "Lookbook", to: isHome ? "#lookbook" : "/#lookbook" },
  ];
}

function isShopActive(pathname: string) {
  return pathname === "/catalogue" || pathname.startsWith("/catalogue/");
}

function isLinkActive(to: string, pathname: string) {
  if (to === "/catalogue") return isShopActive(pathname);
  if (to === "/about") return pathname === "/about";
  return false;
}

const SCROLL_DELTA = 6;
const SCROLL_TOP_SHOW = 24;

/**
 * Solid ink navigation — bold wordmark, chunky links, opaque bar.
 * Hides on scroll-down, reveals on scroll-up; stays put while menu/cart is open.
 */
export function Nav() {
  const { pathname } = useLocation();
  const isHome = pathname === "/";
  const links = buildLinks(isHome);
  const cartCount = useCartStore((s) =>
    s.items.reduce((sum, item) => sum + item.quantity, 0),
  );
  const cartOpen = useCartStore((s) => s.isOpen);
  const openCart = useCartStore((s) => s.openCart);
  const openCheckout = useCartStore((s) => s.openCheckout);
  const canCheckout = useCartStore((s) => calculateCartTotals(s.items).canCheckout);

  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const prevCount = useRef(cartCount);
  const wasMenuOpen = useRef(false);
  const lastScrollY = useRef(0);
  const navHidden = useRef(false);
  const introDone = useRef(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Avoid aria-hidden focus warnings when the overlay closes with focus inside.
  useEffect(() => {
    if (menuOpen) return;
    const active = document.activeElement;
    if (active instanceof HTMLElement && overlayRef.current?.contains(active)) {
      active.blur();
    }
  }, [menuOpen]);

  // Publish live nav height so drawers/overlays clear the fixed bar.
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    const publish = () => {
      document.documentElement.style.setProperty(
        "--nav-h",
        `${header.offsetHeight}px`,
      );
    };
    publish();

    const ro = new ResizeObserver(publish);
    ro.observe(header);
    return () => {
      ro.disconnect();
      document.documentElement.style.removeProperty("--nav-h");
    };
  }, []);

  const setNavHidden = (hidden: boolean) => {
    if (navHidden.current === hidden) return;
    navHidden.current = hidden;
    const header = headerRef.current;
    if (!header || !introDone.current) return;

    if (prefersReducedMotion()) {
      gsap.set(header, { yPercent: hidden ? -100 : 0 });
      return;
    }

    gsap.to(header, {
      yPercent: hidden ? -100 : 0,
      duration: 0.45,
      ease: hidden ? "power3.in" : "power3.out",
      overwrite: true,
    });
  };

  // Hide on scroll down / show on scroll up (paused while overlays are open).
  useEffect(() => {
    if (menuOpen || cartOpen) {
      setNavHidden(false);
      return;
    }

    lastScrollY.current = window.scrollY;

    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastScrollY.current;

      if (y <= SCROLL_TOP_SHOW) {
        setNavHidden(false);
      } else if (delta > SCROLL_DELTA) {
        setNavHidden(true);
      } else if (delta < -SCROLL_DELTA) {
        setNavHidden(false);
      }

      lastScrollY.current = y;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [menuOpen, cartOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  // Initial closed state — GSAP owns transforms (no React inline transform).
  useGSAP(
    () => {
      const overlay = overlayRef.current;
      const panel = panelRef.current;
      if (!overlay || !panel) return;
      gsap.set(overlay, { autoAlpha: 0, pointerEvents: "none" });
      gsap.set(panel, { yPercent: -100 });
    },
    { scope: overlayRef },
  );

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
        { scale: 0.7, autoAlpha: 0 },
        { scale: 1, autoAlpha: 1, duration: 0.4, ease: "back.out(2)" },
      );
    },
    { dependencies: [cartCount] },
  );

  useEffect(() => {
    const overlay = overlayRef.current;
    const panel = panelRef.current;
    if (!overlay || !panel) return;

    const items = overlay.querySelectorAll<HTMLElement>("[data-nav-item]");
    const foot = overlay.querySelectorAll<HTMLElement>("[data-nav-foot]");

    if (prefersReducedMotion()) {
      gsap.set(overlay, {
        autoAlpha: menuOpen ? 1 : 0,
        pointerEvents: menuOpen ? "auto" : "none",
      });
      gsap.set(panel, { yPercent: menuOpen ? 0 : -100 });
      gsap.set([items, foot], { clearProps: "all" });
      document.documentElement.style.overflow = menuOpen ? "hidden" : "";
      wasMenuOpen.current = menuOpen;
      return;
    }

    if (menuOpen) {
      document.documentElement.style.overflow = "hidden";
      gsap.set(overlay, { pointerEvents: "auto" });

      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
      tl.to(overlay, { autoAlpha: 1, duration: 0.2 }, 0)
        .fromTo(panel, { yPercent: -100 }, { yPercent: 0, duration: 0.65 }, 0)
        .fromTo(
          items,
          { y: 40, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.5, stagger: 0.05 },
          0.2,
        )
        .fromTo(
          foot,
          { y: 16, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.4, stagger: 0.04 },
          0.35,
        );

      wasMenuOpen.current = true;
      return () => {
        tl.kill();
      };
    }

    if (!wasMenuOpen.current) return;

    const tl = gsap.timeline({
      defaults: { ease: "power3.in" },
      onComplete: () => {
        gsap.set(overlay, { pointerEvents: "none", autoAlpha: 0 });
        document.documentElement.style.overflow = "";
        wasMenuOpen.current = false;
      },
    });
    tl.to(items, { y: -20, autoAlpha: 0, duration: 0.22, stagger: 0.02 }, 0)
      .to(foot, { autoAlpha: 0, duration: 0.18 }, 0)
      .to(panel, { yPercent: -100, duration: 0.4 }, 0.05)
      .to(overlay, { autoAlpha: 0, duration: 0.2 }, 0.25);

    return () => {
      tl.kill();
    };
  }, [menuOpen]);

  useGSAP(
    () => {
      const header = headerRef.current;
      if (!header) {
        introDone.current = true;
        return;
      }
      if (prefersReducedMotion()) {
        introDone.current = true;
        return;
      }
      gsap.from(header, {
        yPercent: -100,
        duration: 0.8,
        ease: "power4.out",
        delay: 0.05,
        onComplete: () => {
          introDone.current = true;
          if (navHidden.current) {
            gsap.set(header, { yPercent: -100 });
          }
        },
      });
    },
    { scope: headerRef },
  );

  const homeTo = isHome ? "#top" : "/";

  return (
    <>
      <header
        ref={headerRef}
        className="fixed inset-x-0 top-0 z-[100] border-b border-paper/10 bg-ink/75 text-paper backdrop-blur-md will-change-transform sm:border-b-2 sm:border-ink sm:bg-ink sm:backdrop-blur-none"
      >
        <div className="flex items-center sm:items-stretch">
          <Link
            to={homeTo}
            data-cursor=""
            onClick={() => setMenuOpen(false)}
            className="flex shrink-0 items-center px-5 py-3.5 transition-colors duration-300 hover:text-paper/80 sm:border-r-2 sm:border-paper/15 sm:bg-ink sm:px-7 sm:py-4 sm:hover:bg-botanical sm:hover:text-paper md:px-8 md:py-5 lg:px-10"
          >
            <span className="text-[0.95rem] font-medium tracking-[0.32em] uppercase sm:text-lg sm:tracking-[0.28em] md:tracking-[0.32em]">
              Objekt
              <sup className="ml-0.5 text-[0.45em] font-medium tracking-normal">®</sup>
            </span>
          </Link>

          <nav aria-label="Primary" className="hidden flex-1 items-stretch md:flex">
            {links.map((link) => {
              const active = isLinkActive(link.to, pathname);
              return (
                <Link
                  key={link.label}
                  to={link.to}
                  data-cursor=""
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group relative flex flex-1 items-center justify-center border-r-2 border-paper/15 px-4 text-sm font-medium tracking-[0.14em] uppercase transition-colors duration-300",
                    active
                      ? "bg-paper text-ink"
                      : "text-paper hover:bg-accent hover:text-paper",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-0 sm:items-stretch">
            {/* Mobile search — icon only */}
            <Link
              to="/catalogue"
              data-cursor=""
              aria-label="Search catalogue"
              onClick={() => setMenuOpen(false)}
              className="inline-flex items-center justify-center px-3 py-3.5 text-paper/85 transition-colors duration-300 hover:text-paper sm:hidden"
            >
              <Search className="size-[1.05rem]" strokeWidth={1.35} />
            </Link>

            <span
              aria-hidden
              className="mx-0.5 hidden h-3.5 w-px self-center bg-paper/30 max-sm:block"
            />

            {/* Desktop / tablet search */}
            <Link
              to="/catalogue"
              data-cursor=""
              aria-label="Search catalogue"
              onClick={() => setMenuOpen(false)}
              className="hidden items-center gap-2.5 border-l-2 border-paper/15 px-5 text-sm font-medium tracking-[0.12em] uppercase transition-colors duration-300 hover:bg-paper hover:text-ink sm:flex md:px-6"
            >
              Search
              <Search className="size-4" strokeWidth={1.5} />
            </Link>

            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                openCart();
              }}
              data-cursor=""
              aria-label={`Open cart, ${cartCount} items`}
              className="inline-flex items-center gap-1.5 px-3 py-3.5 text-[0.68rem] font-medium tracking-[0.18em] uppercase text-paper transition-colors duration-300 hover:text-paper sm:gap-2.5 sm:border-l-2 sm:border-paper/15 sm:px-5 sm:py-0 sm:text-sm sm:tracking-[0.12em] sm:hover:bg-accent sm:hover:text-paper md:px-6"
            >
              <span className="underline decoration-paper/35 underline-offset-4 sm:no-underline">
                Cart
              </span>
              <span
                ref={countRef}
                className="inline-flex min-w-6 items-center justify-center bg-paper px-1.5 py-0.5 font-mono text-[0.65rem] font-medium tracking-wider text-ink sm:min-w-7 sm:text-xs"
              >
                {cartCount}
              </span>
            </button>

            {/* Desktop checkout — opens cart and enters existing checkout flow */}
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                openCheckout();
              }}
              data-cursor=""
              aria-label={
                canCheckout
                  ? "Proceed to checkout"
                  : cartCount === 0
                    ? "Open cart to start checkout"
                    : "Open cart — minimum order not reached"
              }
              className="hidden items-center border-l-2 border-paper/15 bg-paper px-5 text-sm font-medium tracking-[0.12em] uppercase text-ink transition-colors duration-300 hover:bg-accent hover:text-paper sm:inline-flex md:px-6"
            >
              Checkout
            </button>

            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              data-cursor=""
              aria-expanded={menuOpen}
              aria-controls="nav-menu"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              className={cn(
                "inline-flex items-center gap-3 px-4 py-3.5 text-sm font-medium tracking-[0.14em] uppercase transition-colors duration-300 sm:border-l-2 sm:border-paper/15 sm:py-0 md:px-6",
                menuOpen
                  ? "text-paper sm:bg-paper sm:text-ink"
                  : "text-paper/85 hover:text-paper sm:text-paper sm:hover:bg-paper sm:hover:text-ink",
              )}
            >
              <span className="hidden sm:inline">{menuOpen ? "Close" : "Menu"}</span>
              <span className="relative flex h-3 w-[1.15rem] flex-col justify-between sm:h-3.5 sm:w-5" aria-hidden>
                <span
                  className={cn(
                    "block h-px w-full origin-center bg-current transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:h-0.5",
                    menuOpen && "translate-y-[5px] rotate-45 sm:translate-y-[6px]",
                  )}
                />
                <span
                  className={cn(
                    "block h-px w-full bg-current transition-opacity duration-200 sm:h-0.5",
                    menuOpen && "opacity-0",
                  )}
                />
                <span
                  className={cn(
                    "block h-px w-full origin-center bg-current transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:h-0.5",
                    menuOpen && "-translate-y-[5px] -rotate-45 sm:-translate-y-[6px]",
                  )}
                />
              </span>
            </button>
          </div>
        </div>
      </header>

      <div
        ref={overlayRef}
        id="nav-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        aria-hidden={!menuOpen}
        className="fixed inset-0 z-[90]"
      >
        <div
          ref={panelRef}
          data-nav-panel
          className="absolute inset-0 flex flex-col bg-ink text-paper will-change-transform"
        >
          <div className="flex flex-1 flex-col px-5 pt-28 pb-10 sm:px-8 md:px-10 md:pt-32 lg:px-14 xl:px-16">
            <p
              data-nav-foot
              className="mb-8 text-xs font-medium tracking-[0.28em] uppercase text-paper/50 md:mb-12"
            >
              Menu
            </p>

            <nav aria-label="Menu links" className="flex flex-1 flex-col justify-center">
              <ul className="grid gap-3 sm:gap-4 md:grid-cols-2 md:gap-5">
                {links.map((link) => {
                  const active = isLinkActive(link.to, pathname);
                  return (
                    <li key={link.label} className="overflow-hidden">
                      <Link
                        to={link.to}
                        data-nav-item
                        data-cursor=""
                        aria-current={active ? "page" : undefined}
                        onClick={() => setMenuOpen(false)}
                        className={cn(
                          "group flex min-h-[4.5rem] items-center justify-between border-2 px-5 py-5 transition-colors duration-300 sm:min-h-[5.5rem] sm:px-7 md:min-h-[6.5rem] md:px-8",
                          active
                            ? "border-paper bg-paper text-ink"
                            : "border-paper/25 text-paper hover:border-accent hover:bg-accent",
                        )}
                      >
                        <span className="font-display text-4xl font-normal leading-none tracking-[-0.02em] sm:text-5xl md:text-6xl lg:text-7xl">
                          {link.label}
                        </span>
                        <span
                          aria-hidden
                          className="text-2xl font-medium transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1 sm:text-3xl"
                        >
                          →
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="mt-10 flex flex-col gap-3 border-t-2 border-paper/20 pt-8 sm:mt-14 sm:gap-4 md:pt-10">
              <button
                type="button"
                data-nav-foot
                data-cursor=""
                onClick={() => {
                  setMenuOpen(false);
                  openCheckout();
                }}
                className="inline-flex min-h-14 w-full items-center justify-center gap-3 bg-accent px-6 text-sm font-medium tracking-[0.16em] uppercase text-paper transition-colors duration-300 hover:bg-paper hover:text-ink"
              >
                Checkout
                {cartCount > 0 ? (
                  <span className="font-mono tracking-wider">({cartCount})</span>
                ) : null}
              </button>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
                <Link
                  to="/catalogue"
                  data-nav-foot
                  data-cursor=""
                  onClick={() => setMenuOpen(false)}
                  className="inline-flex min-h-14 flex-1 items-center justify-center gap-3 border-2 border-paper/30 px-6 text-sm font-medium tracking-[0.16em] uppercase transition-colors duration-300 hover:border-paper hover:bg-paper hover:text-ink"
                >
                  <Search className="size-4" strokeWidth={1.5} />
                  Search
                </Link>
                <button
                  type="button"
                  data-nav-foot
                  data-cursor=""
                  onClick={() => {
                    setMenuOpen(false);
                    openCart();
                  }}
                  className="inline-flex min-h-14 flex-1 items-center justify-center gap-3 border-2 border-paper bg-paper px-6 text-sm font-medium tracking-[0.16em] uppercase text-ink transition-colors duration-300 hover:bg-transparent hover:text-paper"
                >
                  Cart
                  <span className="font-mono tracking-wider">({cartCount})</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
