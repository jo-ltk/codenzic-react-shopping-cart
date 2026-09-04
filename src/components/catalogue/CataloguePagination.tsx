import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CataloguePaginationProps {
  page: number;
  pageCount: number;
  canPrev: boolean;
  canNext: boolean;
  onPageChange: (page: number) => void;
}

function visiblePages(page: number, pageCount: number) {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, i) => i + 1);
  }

  const pages = new Set<number>([1, pageCount, page - 1, page, page + 1]);
  return Array.from(pages)
    .filter((value) => value >= 1 && value <= pageCount)
    .sort((a, b) => a - b);
}

/**
 * Compact archive pagination — previous, page numbers, next.
 */
export function CataloguePagination({
  page,
  pageCount,
  canPrev,
  canNext,
  onPageChange,
}: CataloguePaginationProps) {
  if (pageCount <= 1) return null;

  const pages = visiblePages(page, pageCount);

  return (
    <nav
      aria-label="Catalogue pages"
      className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-fg/12 pt-8 sm:mt-16 md:mt-20 md:pt-10"
    >
      <p className="meta text-fg/40">
        Leaf {String(page).padStart(2, "0")}
        <span className="mx-2 text-fg/25">/</span>
        {String(pageCount).padStart(2, "0")}
      </p>

      <div className="flex flex-wrap items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={!canPrev}
          data-cursor=""
          className="meta inline-flex min-h-11 items-center gap-1.5 border border-fg/15 px-3 py-2.5 text-fg transition-colors duration-300 hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-fg/15 disabled:hover:text-fg"
        >
          <ChevronLeft className="size-3.5" strokeWidth={1.5} />
          Previous
        </button>

        <ol className="flex flex-wrap items-center justify-center gap-1.5">
          {pages.map((value, index) => {
            const prev = pages[index - 1];
            const showGap = prev !== undefined && value - prev > 1;
            const isActive = value === page;

            return (
              <li key={value} className="flex items-center gap-1.5">
                {showGap ? (
                  <span className="meta px-1 text-fg/30" aria-hidden>
                    …
                  </span>
                ) : null}
                <button
                  type="button"
                  onClick={() => onPageChange(value)}
                  aria-current={isActive ? "page" : undefined}
                  data-cursor=""
                  className={cn(
                    "meta inline-flex size-11 items-center justify-center border transition-colors duration-300",
                    isActive
                      ? "border-ink bg-ink text-paper"
                      : "border-fg/15 text-fg hover:border-accent hover:text-accent",
                  )}
                >
                  {String(value).padStart(2, "0")}
                </button>
              </li>
            );
          })}
        </ol>

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={!canNext}
          data-cursor=""
          className="meta inline-flex min-h-11 items-center gap-1.5 border border-fg/15 px-3 py-2.5 text-fg transition-colors duration-300 hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-fg/15 disabled:hover:text-fg"
        >
          Next
          <ChevronRight className="size-3.5" strokeWidth={1.5} />
        </button>
      </div>
    </nav>
  );
}
