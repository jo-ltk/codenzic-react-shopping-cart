import { useState, type ReactNode } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import type { FilterOption, UseProductFiltersReturn } from "@/hooks/useProductFilters";
import { formatMoney } from "@/lib/cart/calculations";
import { ui } from "@/lib/ui";
import { cn } from "@/lib/utils";

interface CatalogueFiltersProps {
  filters: UseProductFiltersReturn;
}

const labelClass = "meta mb-3 block text-fg/45";

function OptionList({
  name,
  value,
  options,
  onChange,
  allLabel,
}: {
  name: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
  allLabel: string;
}) {
  return (
    <ul className="max-h-56 space-y-0.5 overflow-y-auto pr-1">
      <li>
        <button
          type="button"
          onClick={() => onChange("all")}
          data-cursor=""
          className={cn(
            "meta flex w-full items-center justify-between py-1.5 text-left tracking-[0.12em] transition-colors duration-300",
            value === "all" ? "text-accent" : "text-fg/55 hover:text-fg",
          )}
        >
          {allLabel}
        </button>
      </li>
      {options.map((option) => (
        <li key={`${name}-${option.value}`}>
          <button
            type="button"
            onClick={() => onChange(option.value)}
            data-cursor=""
            className={cn(
              "flex w-full items-center justify-between gap-3 py-1.5 text-left transition-colors duration-300",
              value === option.value ? "text-accent" : "text-fg/60 hover:text-fg",
            )}
          >
            <span className="text-sm capitalize">{option.label}</span>
            <span className="meta shrink-0 text-fg/35">{option.count}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}

function FilterFields({
  filters,
  idPrefix,
}: {
  filters: UseProductFiltersReturn;
  idPrefix: string;
}) {
  const {
    search,
    setSearch,
    category,
    setCategory,
    minPrice,
    maxPrice,
    setMinPrice,
    setMaxPrice,
    material,
    setMaterial,
    availability,
    setAvailability,
    categories,
    materials,
    availabilities,
    priceBounds,
    hasActiveFilters,
    clearAll,
  } = filters;

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
    <div className="space-y-8">
      <div>
        <label htmlFor={`${idPrefix}-search`} className={labelClass}>
          Search
        </label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-3.5 size-3.5 -translate-y-1/2 text-fg/40"
            strokeWidth={1.5}
            aria-hidden
          />
          <input
            id={`${idPrefix}-search`}
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search the archive"
            aria-label="Search products by title"
            data-cursor=""
            className={cn(ui.fieldOnTheme, "min-h-11 py-3 pr-3 pl-10")}
          />
        </div>
      </div>

      <div>
        <span className={labelClass}>Category</span>
        <OptionList
          name={`${idPrefix}-category`}
          value={category}
          options={categories}
          onChange={setCategory}
          allLabel="All categories"
        />
      </div>

      <div>
        <span className={labelClass}>Price range</span>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor={`${idPrefix}-min-price`} className="sr-only">
              Min price
            </label>
            <input
              id={`${idPrefix}-min-price`}
              type="number"
              inputMode="numeric"
              min={0}
              step={10}
              placeholder={formatMoney(priceBounds.min)}
              value={minPrice ?? ""}
              onChange={(e) => onMinChange(e.target.value)}
              data-cursor=""
              className={cn(ui.fieldOnTheme, "min-h-11")}
            />
          </div>
          <div>
            <label htmlFor={`${idPrefix}-max-price`} className="sr-only">
              Max price
            </label>
            <input
              id={`${idPrefix}-max-price`}
              type="number"
              inputMode="numeric"
              min={0}
              step={10}
              placeholder={formatMoney(priceBounds.max)}
              value={maxPrice ?? ""}
              onChange={(e) => onMaxChange(e.target.value)}
              data-cursor=""
              className={cn(ui.fieldOnTheme, "min-h-11")}
            />
          </div>
        </div>
      </div>

      {materials.length > 0 ? (
        <div>
          <span className={labelClass}>Material</span>
          <OptionList
            name={`${idPrefix}-material`}
            value={material}
            options={materials}
            onChange={setMaterial}
            allLabel="All materials"
          />
        </div>
      ) : null}

      {availabilities.length > 0 ? (
        <div>
          <span className={labelClass}>Availability</span>
          <OptionList
            name={`${idPrefix}-availability`}
            value={availability}
            options={availabilities}
            onChange={setAvailability}
            allLabel="Any availability"
          />
        </div>
      ) : null}

      {hasActiveFilters ? (
        <button
          type="button"
          onClick={clearAll}
          data-cursor=""
          className="meta inline-flex min-h-11 items-center gap-2 text-accent transition-opacity duration-300 hover:opacity-70"
        >
          <X className="size-3" strokeWidth={1.5} />
          Clear filters
        </button>
      ) : null}
    </div>
  );
}

function FilterSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <span className="meta text-fg/45">{title}</span>
      <div className="mt-4">{children}</div>
    </div>
  );
}

/**
 * Archive filters: permanent sidebar on lg+, compact panel on tablet,
 * drawer-style panel behind a Filter button on mobile.
 * Layout uses Tailwind breakpoints only — no viewport JS.
 */
export function CatalogueFilters({ filters }: CatalogueFiltersProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <aside className="hidden lg:block lg:w-64 xl:w-72">
        <FilterSection title="Refine">
          <FilterFields filters={filters} idPrefix="desk" />
        </FilterSection>
      </aside>

      <div className="mb-8 lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            data-cursor=""
            aria-expanded={open}
            className="meta inline-flex min-h-11 items-center gap-2 border border-fg/20 px-3.5 py-2.5 text-fg transition-colors duration-300 hover:border-accent hover:text-accent"
          >
            <SlidersHorizontal className="size-3.5" strokeWidth={1.5} />
            Filters
            {filters.hasActiveFilters ? (
              <span className="size-1.5 rounded-full bg-accent" />
            ) : null}
          </button>

          {filters.hasActiveFilters ? (
            <button
              type="button"
              onClick={filters.clearAll}
              data-cursor=""
              className="meta text-accent transition-opacity duration-300 hover:opacity-70"
            >
              Clear all
            </button>
          ) : null}
        </div>

        {open ? (
          <div className="mt-5 border border-fg/10 px-4 py-6 sm:px-5">
            <FilterFields filters={filters} idPrefix="mob" />
          </div>
        ) : null}

        <div className="mt-6 hidden md:block lg:hidden">
          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-3.5 size-3.5 -translate-y-1/2 text-fg/40"
              strokeWidth={1.5}
              aria-hidden
            />
            <input
              type="search"
              value={filters.search}
              onChange={(e) => filters.setSearch(e.target.value)}
              placeholder="Search the archive"
              aria-label="Search products by title"
              data-cursor=""
              className={cn(ui.fieldOnTheme, "min-h-11 py-3 pr-3 pl-10")}
            />
          </div>
        </div>
      </div>
    </>
  );
}
