import { useRef, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/motion";
import type { UseProductFiltersReturn } from "@/hooks/useProductFilters";
import { cn } from "@/lib/utils";

interface ProductFiltersProps {
  filters: UseProductFiltersReturn;
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

const fieldClass =
  "w-full border border-fg/15 bg-transparent px-3.5 py-2.5 text-sm text-fg outline-none transition-colors duration-300 placeholder:text-fg/35 focus:border-accent/60";

const labelClass = "meta mb-2 block text-fg/45";

/**
 * Minimal editorial search + filter bar for the catalogue.
 * Mobile: compact toggle panel. Desktop: inline controls.
 */
export function ProductFilters({ filters }: ProductFiltersProps) {
  const {
    search,
    setSearch,
    category,
    setCategory,
    minPrice,
    maxPrice,
    setMinPrice,
    setMaxPrice,
    categories,
    priceBounds,
    resultCount,
    totalCount,
    hasActiveFilters,
    clearAll,
  } = filters;

  const [open, setOpen] = useState(false);
  const panel = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = panel.current;
      if (!el || prefersReducedMotion()) return;

      if (open) {
        gsap.fromTo(
          el,
          { autoAlpha: 0, y: -8 },
          { autoAlpha: 1, y: 0, duration: 0.35, ease: "power2.out" },
        );
      }
    },
    { dependencies: [open] },
  );

  const onMinChange = (raw: string) => {
    if (raw === "") {
      setMinPrice(null);
      return;
    }
    const value = Number(raw);
    if (!Number.isFinite(value)) return;
    setMinPrice(Math.max(0, value));
  };

  const onMaxChange = (raw: string) => {
    if (raw === "") {
      setMaxPrice(null);
      return;
    }
    const value = Number(raw);
    if (!Number.isFinite(value)) return;
    setMaxPrice(Math.max(0, value));
  };

  return (
    <div className="mb-12 border-b border-fg/15 pb-10 md:mb-16 md:pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search
            className="pointer-events-none absolute top-1/2 left-3.5 size-3.5 -translate-y-1/2 text-fg/40"
            strokeWidth={1.5}
            aria-hidden
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search objects by title"
            aria-label="Search products by title"
            data-cursor=""
            className={cn(fieldClass, "py-3 pr-3 pl-10")}
          />
        </div>

        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <span className="meta text-fg/45">
            {resultCount} of {totalCount}
          </span>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            data-cursor=""
            aria-expanded={open}
            className="meta inline-flex items-center gap-2 border border-fg/20 px-3.5 py-2.5 text-fg transition-colors duration-300 hover:border-accent hover:text-accent md:hidden"
          >
            <SlidersHorizontal className="size-3.5" strokeWidth={1.5} />
            Filters
            {hasActiveFilters ? <span className="size-1.5 rounded-full bg-accent" /> : null}
          </button>

          {hasActiveFilters ? (
            <button
              type="button"
              onClick={clearAll}
              data-cursor=""
              className="meta hidden items-center gap-1.5 text-accent transition-opacity duration-300 hover:opacity-70 md:inline-flex"
            >
              <X className="size-3" strokeWidth={1.5} />
              Clear all
            </button>
          ) : null}
        </div>
      </div>

      {/* Desktop filters — always visible */}
      <div className="mt-6 hidden grid-cols-12 gap-4 md:grid lg:gap-6">
        <div className="md:col-span-4 lg:col-span-3">
          <label htmlFor="filter-category" className={labelClass}>
            Category
          </label>
          <select
            id="filter-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            data-cursor=""
            className={cn(fieldClass, "appearance-none capitalize")}
          >
            <option value="all">All categories</option>
            {categories.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-4 lg:col-span-3">
          <label htmlFor="filter-min-price" className={labelClass}>
            Min price
          </label>
          <input
            id="filter-min-price"
            type="number"
            inputMode="numeric"
            min={0}
            step={50}
            placeholder={formatPrice(priceBounds.min)}
            value={minPrice ?? ""}
            onChange={(e) => onMinChange(e.target.value)}
            data-cursor=""
            className={fieldClass}
          />
        </div>

        <div className="md:col-span-4 lg:col-span-3">
          <label htmlFor="filter-max-price" className={labelClass}>
            Max price
          </label>
          <input
            id="filter-max-price"
            type="number"
            inputMode="numeric"
            min={0}
            step={50}
            placeholder={formatPrice(priceBounds.max)}
            value={maxPrice ?? ""}
            onChange={(e) => onMaxChange(e.target.value)}
            data-cursor=""
            className={fieldClass}
          />
        </div>
      </div>

      {/* Mobile filters — collapsible */}
      {open ? (
        <div
          ref={panel}
          className="mt-5 grid grid-cols-1 gap-4 border border-fg/10 p-4 sm:grid-cols-2 md:hidden"
        >
          <div className="sm:col-span-2">
            <label htmlFor="filter-category-mobile" className={labelClass}>
              Category
            </label>
            <select
              id="filter-category-mobile"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={cn(fieldClass, "appearance-none capitalize")}
            >
              <option value="all">All categories</option>
              {categories.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="filter-min-price-mobile" className={labelClass}>
              Min price
            </label>
            <input
              id="filter-min-price-mobile"
              type="number"
              inputMode="numeric"
              min={0}
              step={50}
              placeholder={formatPrice(priceBounds.min)}
              value={minPrice ?? ""}
              onChange={(e) => onMinChange(e.target.value)}
              className={fieldClass}
            />
          </div>

          <div>
            <label htmlFor="filter-max-price-mobile" className={labelClass}>
              Max price
            </label>
            <input
              id="filter-max-price-mobile"
              type="number"
              inputMode="numeric"
              min={0}
              step={50}
              placeholder={formatPrice(priceBounds.max)}
              value={maxPrice ?? ""}
              onChange={(e) => onMaxChange(e.target.value)}
              className={fieldClass}
            />
          </div>

          {hasActiveFilters ? (
            <button
              type="button"
              onClick={clearAll}
              className="meta col-span-full inline-flex min-h-11 items-center justify-center gap-2 border border-fg/20 px-4 py-3 text-accent transition-colors duration-300 hover:border-accent"
            >
              <X className="size-3" strokeWidth={1.5} />
              Clear all filters
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
