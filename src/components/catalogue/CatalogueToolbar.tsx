import { LayoutGrid, List } from "lucide-react";
import {
  PRODUCT_SORT_OPTIONS,
  type ProductSort,
} from "@/hooks/useProductFilters";
import { ui } from "@/lib/ui";
import { cn } from "@/lib/utils";

export type CatalogueView = "grid" | "list";

interface CatalogueToolbarProps {
  rangeStart: number;
  rangeEnd: number;
  total: number;
  sort: ProductSort;
  onSortChange: (sort: ProductSort) => void;
  view: CatalogueView;
  onViewChange: (view: CatalogueView) => void;
}

/**
 * Showing range, sort, and grid/list controls for the archive.
 */
export function CatalogueToolbar({
  rangeStart,
  rangeEnd,
  total,
  sort,
  onSortChange,
  view,
  onViewChange,
}: CatalogueToolbarProps) {
  return (
    <div className="mb-8 flex flex-col gap-5 border-b border-fg/12 pb-6 sm:mb-10 sm:flex-row sm:items-end sm:justify-between md:mb-12 md:pb-8">
      <div>
        <p className="meta text-fg/45">Plates in view</p>
        <p className="meta mt-2 text-fg/70">
          {total === 0
            ? "No editions found"
            : `${String(rangeStart).padStart(2, "0")}–${String(rangeEnd).padStart(2, "0")} of ${String(total).padStart(2, "0")}`}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="sr-only" htmlFor="catalogue-sort">
          Sort objects
        </label>
        <select
          id="catalogue-sort"
          value={sort}
          onChange={(e) => onSortChange(e.target.value as ProductSort)}
          data-cursor=""
          className={cn(ui.fieldOnTheme, "min-h-11 min-w-[12rem] appearance-none")}
        >
          {PRODUCT_SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <div
          className="inline-flex border border-fg/15"
          role="group"
          aria-label="Catalogue layout"
        >
          <button
            type="button"
            onClick={() => onViewChange("grid")}
            aria-pressed={view === "grid"}
            data-cursor=""
            className={cn(
              "inline-flex size-11 items-center justify-center transition-colors duration-300",
              view === "grid" ? "bg-fg text-bg" : "text-fg/50 hover:text-fg",
            )}
          >
            <LayoutGrid className="size-3.5" strokeWidth={1.4} />
            <span className="sr-only">Grid view</span>
          </button>
          <button
            type="button"
            onClick={() => onViewChange("list")}
            aria-pressed={view === "list"}
            data-cursor=""
            className={cn(
              "inline-flex size-11 items-center justify-center border-l border-fg/15 transition-colors duration-300",
              view === "list" ? "bg-fg text-bg" : "text-fg/50 hover:text-fg",
            )}
          >
            <List className="size-3.5" strokeWidth={1.4} />
            <span className="sr-only">List view</span>
          </button>
        </div>
      </div>
    </div>
  );
}
