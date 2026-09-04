import { Link, useLocation } from "react-router";
import { Menu, Search } from "lucide-react";
import { useCartStore } from "@/lib/store/cart";

function navLinks(isHome: boolean) {
  return [
    { label: "Shop", to: "/catalogue" },
    { label: "Collections", to: isHome ? "#index" : "/#index" },
    { label: "About", to: isHome ? "#manifesto" : "/#manifesto" },
    { label: "Journal", to: isHome ? "#anatomy" : "/#anatomy" },
  ];
}

/**
 * Premium minimal header — matches the OBJEKT editorial reference.
 * mix-blend-difference keeps ivory chrome legible across paper/ink worlds.
 */
export function Nav() {
  const { pathname } = useLocation();
  const isHome = pathname === "/";
  const cartCount = useCartStore((s) =>
    s.items.reduce((sum, item) => sum + item.quantity, 0),
  );
  const openCart = useCartStore((s) => s.openCart);

  return (
    <header className="fixed inset-x-0 top-0 z-[80] mix-blend-difference">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center px-6 py-5 text-white md:px-12 md:py-7 lg:px-14">
        <Link
          to={isHome ? "#top" : "/"}
          data-cursor=""
          className="text-[0.78rem] font-medium tracking-[0.38em] uppercase md:text-[0.82rem]"
        >
          Objekt
          <sup className="ml-px text-[0.5em] tracking-normal">®</sup>
        </Link>

        <nav className="hidden items-center gap-11 md:flex">
          {navLinks(isHome).map((link) => (
            <Link
              key={link.label}
              to={link.to}
              data-cursor=""
              className="relative text-[0.7rem] font-light tracking-[0.04em] text-white/88 after:absolute after:-bottom-1 after:left-0 after:h-px after:w-full after:origin-right after:scale-x-0 after:bg-current after:transition-transform after:duration-500 after:ease-[cubic-bezier(0.22,1,0.36,1)] hover:after:origin-left hover:after:scale-x-100"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center justify-end gap-4 sm:gap-5 md:gap-6">
          <Link
            to="/catalogue"
            data-cursor=""
            aria-label="Search catalogue"
            className="inline-flex items-center gap-2.5 text-[0.68rem] font-light tracking-[0.04em] text-white/88"
          >
            <span className="hidden sm:inline">Search</span>
            <Search className="size-3.5 opacity-90" strokeWidth={1.1} />
          </Link>

          <span aria-hidden className="h-3.5 w-px bg-white/45 sm:bg-white/28" />

          <button
            type="button"
            onClick={openCart}
            data-cursor=""
            aria-label={`Open cart, ${cartCount} items`}
            className="text-[0.68rem] font-light tracking-[0.04em] text-white/88 transition-opacity duration-300 hover:opacity-70"
          >
            Cart ({cartCount})
          </button>

          <button
            type="button"
            aria-label="Open menu"
            data-cursor=""
            className="inline-flex items-center justify-center text-white/88"
          >
            <Menu className="size-4" strokeWidth={1.1} />
          </button>
        </div>
      </div>
    </header>
  );
}
