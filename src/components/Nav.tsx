import { Menu, Search } from "lucide-react";
import { useCartStore } from "@/lib/store/cart";

const LINKS = [
  { label: "Shop", href: "#products" },
  { label: "Collections", href: "#index" },
  { label: "About", href: "#manifesto" },
  { label: "Journal", href: "#anatomy" },
];

/**
 * Premium minimal header — matches the OBJEKT editorial reference.
 * mix-blend-difference keeps ivory chrome legible across paper/ink worlds.
 */
export function Nav() {
  const cartCount = useCartStore((s) =>
    s.items.reduce((sum, item) => sum + item.quantity, 0),
  );

  return (
    <header className="fixed inset-x-0 top-0 z-[80] mix-blend-difference">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center px-6 py-5 text-white md:px-12 md:py-7 lg:px-14">
        <a
          href="#top"
          data-cursor=""
          className="text-[0.78rem] font-medium tracking-[0.38em] uppercase md:text-[0.82rem]"
        >
          Objekt
          <sup className="ml-px text-[0.5em] tracking-normal">®</sup>
        </a>

        <nav className="hidden items-center gap-11 md:flex">
          {LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              data-cursor=""
              className="relative text-[0.7rem] font-light tracking-[0.04em] text-white/88 after:absolute after:-bottom-1 after:left-0 after:h-px after:w-full after:origin-right after:scale-x-0 after:bg-current after:transition-transform after:duration-500 after:ease-[cubic-bezier(0.22,1,0.36,1)] hover:after:origin-left hover:after:scale-x-100"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center justify-end gap-4 sm:gap-5 md:gap-6">
          <a
            href="#products"
            data-cursor=""
            aria-label="Search"
            className="inline-flex items-center gap-2.5 text-[0.68rem] font-light tracking-[0.04em] text-white/88"
          >
            <span className="hidden sm:inline">Search</span>
            <Search className="size-3.5 opacity-90" strokeWidth={1.1} />
          </a>

          <span aria-hidden className="h-3.5 w-px bg-white/45 sm:bg-white/28" />

          <a
            href="#products"
            data-cursor=""
            className="text-[0.68rem] font-light tracking-[0.04em] text-white/88"
          >
            Cart ({cartCount})
          </a>

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
