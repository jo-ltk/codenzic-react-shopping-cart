import { useEffect, useState } from "react";
import { Link, Outlet, useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { THEME } from "@/lib/motion";
import {
  categoriesQueryKey,
  fetchCategories,
  fetchProducts,
  productsQueryKey,
} from "@/lib/api/products";
import { useProductFilters } from "@/hooks/useProductFilters";
import { useProductPagination } from "@/hooks/useProductPagination";
import { CatalogueFilters } from "@/components/catalogue/CatalogueFilters";
import { CatalogueToolbar, type CatalogueView } from "@/components/catalogue/CatalogueToolbar";
import { CataloguePagination } from "@/components/catalogue/CataloguePagination";
import { ProductGrid } from "@/components/products/ProductGrid";
import { ProductSkeleton } from "@/components/products/ProductSkeleton";
import { ProductError } from "@/components/products/ProductError";
import { ProductEmpty } from "@/components/products/ProductEmpty";
import { ProductFilterEmpty } from "@/components/products/ProductFilterEmpty";
import { Footer } from "@/sections/Footer";

const PAGE_SIZE = 8;

/**
 * Dedicated Product Category / Archive page.
 * Reuses the DummyJSON query + useProductFilters — no second data source.
 */
export function CataloguePage() {
  const { productId } = useParams();
  const [view, setView] = useState<CatalogueView>("grid");

  const { data, isPending, isError, error, refetch, isFetching } = useQuery({
    queryKey: productsQueryKey,
    queryFn: fetchProducts,
  });

  const { data: categoryOptions } = useQuery({
    queryKey: categoriesQueryKey,
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 30,
  });

  const products = data ?? [];
  const filters = useProductFilters(products, { categoryOptions });
  const pagination = useProductPagination(
    filters.filteredProducts,
    PAGE_SIZE,
    filters.filterKey,
  );

  useEffect(() => {
    document.documentElement.style.setProperty("--bg", THEME.paper.bg);
    document.documentElement.style.setProperty("--fg", THEME.paper.fg);
  }, []);

  const goToPage = (next: number) => {
    pagination.setPage(next);
    document.getElementById("catalogue-archive")?.scrollIntoView({ behavior: "smooth" });
  };

  const showInventory = !isPending && !isError && products.length > 0;
  const showCatalogueEmpty = !isPending && !isError && products.length === 0;
  const showFilterEmpty =
    showInventory && filters.hasActiveFilters && filters.filteredProducts.length === 0;
  const showGrid = showInventory && pagination.pageItems.length > 0;

  // Nested /catalogue/:id keeps this page mounted so filters/pagination survive back.
  if (productId) {
    return <Outlet />;
  }

  return (
    <>
      <main
        data-theme="paper"
        className="relative overflow-x-clip pt-24 pb-0 sm:pt-28 md:pt-32"
      >
        {/* Crumb bar — mirrors the object study page */}
        <div className="flex flex-col gap-4 px-5 pt-4 pb-6 sm:px-8 sm:pb-8 md:flex-row md:items-end md:justify-between md:px-10 lg:px-14 xl:px-16">
          <div className="min-w-0">
            <p className="meta truncate text-fg/45">
              <Link to="/" data-cursor="" className="transition-colors duration-300 hover:text-accent">
                Home
              </Link>
              <span className="mx-2 text-fg/25">/</span>
              <span className="text-fg/70">Catalogue</span>
            </p>
          </div>
          <p className="meta hidden text-fg/40 md:block">
            Current issue
            <span className="mx-2 text-fg/25">·</span>
            Archive
          </p>
        </div>

        {/* Act I — Statement */}
        <header className="relative border-t border-fg/15 px-5 pt-10 pb-14 sm:px-8 md:px-10 md:pt-14 md:pb-20 lg:px-14 xl:px-16">
          <span
            aria-hidden
            className="text-outline pointer-events-none absolute top-4 right-5 z-0 hidden font-display text-[7rem] leading-none font-light opacity-50 select-none sm:right-8 sm:block md:top-6 md:right-10 md:text-[9rem] lg:right-14 lg:text-[10rem] xl:right-16 xl:text-[12rem]"
          >
            06
          </span>

          <div className="relative z-10 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-x-10 xl:gap-x-14">
            <div className="lg:col-span-7">
              <p className="meta flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="text-accent">Issue N° 06</span>
                <span aria-hidden className="size-1 rounded-full bg-fg/25" />
                <span className="text-fg/45">The Catalogue</span>
              </p>
              <h1 className="mt-7 font-display text-[2.6rem] leading-[1.04] font-light tracking-[-0.01em] sm:text-5xl lg:text-[3.4rem] xl:text-[4rem]">
                Objects,
                <br />
                <em className="text-accent">available now.</em>
              </h1>
            </div>

            <div className="flex flex-col justify-end lg:col-span-5">
              <p className="max-w-md text-[0.95rem] leading-[1.7] text-fg/65">
                A rotating selection from the current issue. Each piece is photographed
                as it arrives — curated for rooms that prefer quiet over noise.
              </p>
              <p className="meta mt-8 text-fg/45">
                {isPending
                  ? "Preparing inventory…"
                  : isError
                    ? "Inventory unavailable"
                    : `${filters.totalCount} ${filters.totalCount === 1 ? "edition" : "editions"} in the archive`}
              </p>
            </div>
          </div>
        </header>

        {/* Act II — Archive */}
        <section
          id="catalogue-archive"
          className="border-t border-fg/15 px-5 pt-10 pb-24 sm:px-8 sm:pb-28 md:px-10 md:pt-12 md:pb-36 lg:px-14 xl:px-16"
        >
          {isPending ? (
            <div aria-busy="true" aria-live="polite">
              <p className="meta mb-10 text-fg/45">Preparing the archive…</p>
              <ProductSkeleton
                count={PAGE_SIZE}
                className="grid-cols-2 lg:grid-cols-3 xl:grid-cols-3"
              />
            </div>
          ) : null}

          {isError ? (
            <ProductError
              message={error instanceof Error ? error.message : undefined}
              onRetry={() => void refetch()}
            />
          ) : null}

          {showCatalogueEmpty ? <ProductEmpty /> : null}

          {showInventory ? (
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-x-10 xl:gap-x-14">
              <CatalogueFilters filters={filters} />

              <div className="min-w-0 lg:col-span-9">
                <CatalogueToolbar
                  rangeStart={pagination.rangeStart}
                  rangeEnd={pagination.rangeEnd}
                  total={pagination.total}
                  sort={filters.sort}
                  onSortChange={filters.setSort}
                  view={view}
                  onViewChange={setView}
                />

                {showFilterEmpty ? (
                  <ProductFilterEmpty onClear={filters.clearAll} />
                ) : null}

                {showGrid ? (
                  <div
                    className={
                      isFetching ? "opacity-90 transition-opacity duration-300" : undefined
                    }
                  >
                    <ProductGrid
                      products={pagination.pageItems}
                      indexOffset={(pagination.page - 1) * PAGE_SIZE}
                      animateKey={`${filters.filterKey}|${pagination.page}|${view}`}
                      layout={view}
                      immediate
                      className={
                        view === "list"
                          ? "grid-cols-1 gap-y-8 sm:grid-cols-1 sm:gap-y-10 lg:grid-cols-1 xl:grid-cols-1"
                          : "grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3"
                      }
                    />
                    <CataloguePagination
                      page={pagination.page}
                      pageCount={pagination.pageCount}
                      canPrev={pagination.canPrev}
                      canNext={pagination.canNext}
                      onPageChange={goToPage}
                    />
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
        </section>
      </main>
      <Footer />
    </>
  );
}
